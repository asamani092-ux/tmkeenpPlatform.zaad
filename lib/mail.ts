import nodemailer from "nodemailer";

type SendMailParams = {
  to: string;
  subject: string;
  text: string;
  from?: string;
};

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: process.env.SMTP_SECURE !== "false",
    auth: { user, pass },
    // Prevent hung SMTP sockets from blocking request handlers indefinitely.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  return transporter;
}

/**
 * Send email via SMTP — O(1).
 * `from` must be the admin settings senderEmail (envelope From).
 * SMTP_USER/PASS only authenticate the transport.
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
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}
