import fs from "fs/promises";
import path from "path";
import { isValidAsciiEmail } from "@/lib/email-format";

export type SystemSettings = {
  senderEmail: string;
};

const SETTINGS_DIR = path.join(process.cwd(), "data");
const SETTINGS_PATH = path.join(SETTINGS_DIR, "system-settings.json");

const DEFAULT_SETTINGS: SystemSettings = {
  senderEmail: "noreply@tmkeen.local",
};

/** Sender / admin email check — any valid domain, not registration allowlist */
export function isValidEmail(email: string): boolean {
  return isValidAsciiEmail(email);
}

/** Load system settings from file — O(1). Prefer saved senderEmail always. */
export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const raw = await fs.readFile(SETTINGS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<SystemSettings>;
    const stored = parsed.senderEmail?.trim();
    if (stored && isValidAsciiEmail(stored)) {
      return { senderEmail: stored.toLowerCase() };
    }
  } catch {
    /* missing file → fallback */
  }

  const smtpUser = process.env.SMTP_USER?.trim();
  if (smtpUser && isValidAsciiEmail(smtpUser)) {
    return { senderEmail: smtpUser.toLowerCase() };
  }
  return { ...DEFAULT_SETTINGS };
}

/** Persist system settings to file — O(1) */
export async function saveSystemSettings(
  settings: SystemSettings
): Promise<void> {
  await fs.mkdir(SETTINGS_DIR, { recursive: true });
  await fs.writeFile(
    SETTINGS_PATH,
    JSON.stringify(
      { senderEmail: settings.senderEmail.trim().toLowerCase() },
      null,
      2
    ),
    "utf-8"
  );
}
