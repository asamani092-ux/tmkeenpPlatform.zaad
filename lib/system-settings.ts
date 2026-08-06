import fs from "fs/promises";
import path from "path";
import { isValidAsciiEmail } from "@/lib/email-format";
import { prisma } from "@/lib/prisma";

export type SystemSettings = {
  senderEmail: string;
};

const SENDER_EMAIL_KEY = "senderEmail";

const DEFAULT_SETTINGS: SystemSettings = {
  senderEmail: "noreply@tmkeen.local",
};

/** Legacy disk path — import once into DB then ignore — O(1). */
function getLegacySettingsFile(): string {
  const uploadDir =
    process.env.UPLOAD_DIR?.trim() ||
    (process.env.NODE_ENV === "production"
      ? path.join(process.cwd(), "uploads")
      : "");
  const dir = uploadDir
    ? path.join(uploadDir, "data")
    : path.join(process.cwd(), "data");
  return path.join(dir, "system-settings.json");
}

/** Sender / admin email check — any valid domain, not registration allowlist */
export function isValidEmail(email: string): boolean {
  return isValidAsciiEmail(email);
}

function smtpFallback(): SystemSettings {
  const smtpUser = process.env.SMTP_USER?.trim();
  if (smtpUser && isValidAsciiEmail(smtpUser)) {
    return { senderEmail: smtpUser.toLowerCase() };
  }
  return { ...DEFAULT_SETTINGS };
}

/** One-time cumulative import from legacy JSON into DB — O(1). */
async function importLegacyDiskIfNeeded(): Promise<string | null> {
  try {
    const raw = await fs.readFile(getLegacySettingsFile(), "utf-8");
    const parsed = JSON.parse(raw) as Partial<SystemSettings>;
    const stored = parsed.senderEmail?.trim();
    if (!stored || !isValidAsciiEmail(stored)) return null;
    const email = stored.toLowerCase();
    await prisma.appSetting.upsert({
      where: { key: SENDER_EMAIL_KEY },
      create: { key: SENDER_EMAIL_KEY, value: email },
      update: {},
    });
    return email;
  } catch {
    return null;
  }
}

/** Load system settings from PostgreSQL — O(1). */
export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const row = await prisma.appSetting.findUnique({
      where: { key: SENDER_EMAIL_KEY },
      select: { value: true },
    });
    if (row?.value && isValidAsciiEmail(row.value)) {
      return { senderEmail: row.value.toLowerCase() };
    }

    const imported = await importLegacyDiskIfNeeded();
    if (imported) return { senderEmail: imported };
  } catch (err) {
    console.warn("[system-settings] DB read failed:", err);
  }

  return smtpFallback();
}

/** Persist system settings to PostgreSQL — O(1). */
export async function saveSystemSettings(
  settings: SystemSettings
): Promise<void> {
  const email = settings.senderEmail.trim().toLowerCase();
  if (!isValidAsciiEmail(email)) {
    throw new Error("صيغة البريد الإلكتروني غير صالحة");
  }

  await prisma.appSetting.upsert({
    where: { key: SENDER_EMAIL_KEY },
    create: { key: SENDER_EMAIL_KEY, value: email },
    update: { value: email },
  });
}
