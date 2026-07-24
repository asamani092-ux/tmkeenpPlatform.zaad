import nodemailer from "nodemailer";

type SendMailParams = {
  to: string;
  subject: string;
  text: string;
  from?: string;
};

let transporter: nodemailer.Transporter | null = null;
let transporterKey = "";

function smtpConfigKey(): string {
  return [
    process.env.SMTP_HOST ?? "",
    process.env.SMTP_PORT ?? "",
    process.env.SMTP_SECURE ?? "",
    process.env.SMTP_USER ?? "",
    process.env.SMTP_PASS ? "1" : "0",
  ].join("|");
}

function parseSecureFlag(port: number): boolean {
  const raw = process.env.SMTP_SECURE?.trim().toLowerCase();
  if (raw === "false" || raw === "0" || raw === "no") return false;
  if (raw === "true" || raw === "1" || raw === "yes") return true;
  // Outlook / Office 365: 587 = STARTTLS (not implicit TLS)
  return port === 465;
}

function getTransporter(): nodemailer.Transporter | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  const key = smtpConfigKey();
  if (transporter && transporterKey === key) return transporter;

  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure = parseSecureFlag(port);

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure && port === 587,
    auth: { user, pass },
    // Prevent hung SMTP sockets from blocking request handlers indefinitely.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
    tls: {
      // Office 365 / Outlook shared hosts
      minVersion: "TLSv1.2",
    },
  });
  transporterKey = key;

  return transporter;
}

/** Map nodemailer/SMTP failures to short Arabic hints — O(1). */
export function describeSmtpError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();

  if (/invalid login|authentication failed|535|534|auth/i.test(msg)) {
    return "فشل المصادقة SMTP — تحقق من SMTP_USER وكلمة المرور (لـ Outlook غالباً App Password مع تفعيل SMTP AUTH)";
  }
  if (/sender|from address|550 5\.7\.60|5\.7\.1|not allowed|mailbox unavailable/i.test(msg)) {
    return "المرسل مرفوض — اجعل senderEmail مطابقاً لـ SMTP_USER (نفس بريد Outlook)";
  }
  if (/econnrefused|etimedout|enotfound|connection|wrong version number|ssl|tls/i.test(lower)) {
    return "فشل الاتصال بخادم البريد — لـ Outlook استخدم smtp.office365.com والمنفذ 587 و SMTP_SECURE=false ثم Redeploy";
  }
  if (/certificate/i.test(lower)) {
    return "مشكلة شهادة TLS مع خادم SMTP — تحقق من SMTP_HOST والمنفذ";
  }
  return "فشل إرسال البريد — تحقق من SMTP_HOST/PORT/SECURE و SMTP_USER و senderEmail وكلمة المرور";
}

/**
 * Send email via SMTP — O(1).
 * `from` must be the admin settings senderEmail (envelope From).
 * SMTP_USER/PASS only authenticate the transport.
 * Throws on SMTP failure so callers can surface a useful message.
 */
export async function sendMail(params: SendMailParams): Promise<boolean> {
  const tx = getTransporter();
  if (!tx) {
    console.log("[EMAIL SKIP — SMTP not configured]", params.to, params.subject);
    return false;
  }

  const from = (params.from ?? "").trim();
  if (!from) {
    console.error("[EMAIL] missing From — pass settings.senderEmail");
    return false;
  }

  const smtpUser = process.env.SMTP_USER?.trim().toLowerCase();
  if (smtpUser && from.toLowerCase() !== smtpUser) {
    console.warn(
      "[EMAIL] senderEmail differs from SMTP_USER — Outlook often rejects this",
      { from, smtpUser }
    );
  }

  await tx.sendMail({
    from,
    to: params.to,
    subject: params.subject,
    text: params.text,
    envelope: {
      from,
      to: params.to,
    },
  });

  return true;
}

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS
  );
}

/** Public SMTP identity for admin UI (never includes password) — O(1). */
export function getSmtpPublicInfo(): {
  configured: boolean;
  host: string | null;
  port: number | null;
  user: string | null;
} {
  const host = process.env.SMTP_HOST?.trim() || null;
  const user = process.env.SMTP_USER?.trim() || null;
  const portRaw = process.env.SMTP_PORT?.trim();
  return {
    configured: isSmtpConfigured(),
    host,
    port: portRaw ? Number(portRaw) : null,
    user,
  };
}
