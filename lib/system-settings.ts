import fs from "fs/promises";
import path from "path";
import { isValidAsciiEmail } from "@/lib/email-format";

export type SystemSettings = {
  senderEmail: string;
};

/**
 * Persist under UPLOAD_DIR when set (Coolify volume is writable).
 * Fallback: ./data for local dev — O(1).
 */
function getSettingsPaths(): { dir: string; file: string } {
  const uploadDir = process.env.UPLOAD_DIR?.trim();
  const dir = uploadDir
    ? path.join(uploadDir, "data")
    : path.join(process.cwd(), "data");
  return { dir, file: path.join(dir, "system-settings.json") };
}

const DEFAULT_SETTINGS: SystemSettings = {
  senderEmail: "noreply@tmkeen.local",
};

/** Sender / admin email check — any valid domain, not registration allowlist */
export function isValidEmail(email: string): boolean {
  return isValidAsciiEmail(email);
}

/** Load system settings from file — O(1). Prefer saved senderEmail always. */
export async function getSystemSettings(): Promise<SystemSettings> {
  const { file } = getSettingsPaths();
  try {
    const raw = await fs.readFile(file, "utf-8");
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

/** Persist system settings to writable volume/dir — O(1) */
export async function saveSystemSettings(
  settings: SystemSettings
): Promise<void> {
  const { dir, file } = getSettingsPaths();
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    file,
    JSON.stringify(
      { senderEmail: settings.senderEmail.trim().toLowerCase() },
      null,
      2
    ),
    "utf-8"
  );
}
