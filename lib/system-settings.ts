import fs from "fs/promises";
import path from "path";
import { isValidEmailFormat } from "@/lib/email-format";

export type SystemSettings = {
  senderEmail: string;
};

const SETTINGS_DIR = path.join(process.cwd(), "data");
const SETTINGS_PATH = path.join(SETTINGS_DIR, "system-settings.json");

const DEFAULT_SETTINGS: SystemSettings = {
  senderEmail: "noreply@tmkeen.local",
};

export function isValidEmail(email: string): boolean {
  return isValidEmailFormat(email);
}

/** Load system settings from file — O(1) */
export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const raw = await fs.readFile(SETTINGS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<SystemSettings>;
    const smtpUser = process.env.SMTP_USER?.trim();
    const stored = parsed.senderEmail?.trim();
    const fallback =
      stored && stored !== DEFAULT_SETTINGS.senderEmail
        ? stored
        : smtpUser || DEFAULT_SETTINGS.senderEmail;
    return {
      senderEmail: fallback,
    };
  } catch {
    const smtpUser = process.env.SMTP_USER?.trim();
    return {
      senderEmail: smtpUser || DEFAULT_SETTINGS.senderEmail,
    };
  }
}

/** Persist system settings to file — O(1) */
export async function saveSystemSettings(
  settings: SystemSettings
): Promise<void> {
  await fs.mkdir(SETTINGS_DIR, { recursive: true });
  await fs.writeFile(
    SETTINGS_PATH,
    JSON.stringify(
      { senderEmail: settings.senderEmail.trim() },
      null,
      2
    ),
    "utf-8"
  );
}
