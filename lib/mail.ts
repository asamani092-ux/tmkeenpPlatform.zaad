import nodemailer from "nodemailer";

type SendMailParams = {
  to: string;
  subject: string;
  text: string;
  from?: string;
};

let transporter: nodemailer.Transporter | null = null;
let transporterKey = "";

/** Strip Coolify/UI artifacts from secrets — O(n) in secret length. */
function cleanSecret(value: string | undefined): string {
  if (!value) return "";
  let v = value.trim();
  // Remove UTF-8 BOM / zero-width chars sometimes pasted from admin portals
  v = v.replace(/^\uFEFF/, "").replace(/[\u200B-\u200D\uFEFF]/g, "");
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

function smtpConfigKey(): string {
  return [
    cleanSecret(process.env.SMTP_HOST),
    cleanSecret(process.env.SMTP_PORT),
    cleanSecret(process.env.SMTP_SECURE),
    cleanSecret(process.env.SMTP_USER),
    cleanSecret(process.env.SMTP_PASS) ? "1" : "0",
  ].join("|");
}

function parseSecureFlag(port: number): boolean {
  const raw = cleanSecret(process.env.SMTP_SECURE).toLowerCase();
  if (raw === "false" || raw === "0" || raw === "no") return false;
  if (raw === "true" || raw === "1" || raw === "yes") return true;
  // Outlook / Office 365: 587 = STARTTLS (not implicit TLS)
  return port === 465;
}

function getTransporter(): nodemailer.Transporter | null {
  const host = cleanSecret(process.env.SMTP_HOST);
  const user = cleanSecret(process.env.SMTP_USER);
  const pass = cleanSecret(process.env.SMTP_PASS);
  if (!host || !user || !pass) return null;

  const key = smtpConfigKey();
  if (transporter && transporterKey === key) return transporter;

  const port = Number(cleanSecret(process.env.SMTP_PORT) || "587");
  const secure = parseSecureFlag(port);
  const isOffice365 =
    /office365\.com|outlook\.com|protection\.outlook\.com/i.test(host);

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure && (port === 587 || isOffice365),
    auth: {
      type: "login",
      user,
      pass,
    },
    authMethod: "LOGIN",
    // Prevent hung SMTP sockets from blocking request handlers indefinitely.
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 20_000,
    tls: {
      minVersion: "TLSv1.2",
      servername: host,
    },
  });
  transporterKey = key;

  return transporter;
}

/** Map nodemailer/SMTP failures to short Arabic hints — O(1). */
export function describeSmtpError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();
  const responseCode =
    typeof err === "object" &&
    err &&
    "responseCode" in err &&
    typeof (err as { responseCode?: unknown }).responseCode === "number"
      ? (err as { responseCode: number }).responseCode
      : null;

  if (
    responseCode === 535 ||
    responseCode === 534 ||
    /invalid login|authentication failed|535|534|auth/i.test(msg)
  ) {
    return [
      "فشل المصادقة SMTP (Microsoft رفض USER/PASS).",
      "حتى مع تفعيل SMTP AUTH وكلمة مرور صحيحة غالباً يلزم: App Password (إن وُجد MFA)،",
      "أو تعطيل حظر Basic Auth من Security Defaults / Conditional Access،",
      "وإعادة لصق SMTP_PASS في Coolify بلا علامات اقتباس ثم Redeploy.",
    ].join(" ");
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

  const smtpUser = cleanSecret(process.env.SMTP_USER).toLowerCase();
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
    cleanSecret(process.env.SMTP_HOST) &&
      cleanSecret(process.env.SMTP_USER) &&
      cleanSecret(process.env.SMTP_PASS)
  );
}

/** Public SMTP identity for admin UI (never includes password) — O(1). */
export function getSmtpPublicInfo(): {
  configured: boolean;
  host: string | null;
  port: number | null;
  user: string | null;
} {
  const host = cleanSecret(process.env.SMTP_HOST) || null;
  const user = cleanSecret(process.env.SMTP_USER) || null;
  const portRaw = cleanSecret(process.env.SMTP_PORT);
  return {
    configured: isSmtpConfigured(),
    host,
    user,
    port: portRaw ? Number(portRaw) : null,
  };
}
