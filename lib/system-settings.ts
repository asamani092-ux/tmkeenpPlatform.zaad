import fs from "fs/promises";
import path from "path";
import { isValidAsciiEmail } from "@/lib/email-format";
import { getUploadDir } from "@/lib/storage";

export type SystemSettings = {
  senderEmail: string;
};

/**
 * Persist under APP_STORAGE / UPLOAD_DIR (Coolify volume) — O(1).
 * Local dev without env → ./data
 */
function getSettingsPaths(): { dir: string; file: string } {
  const storage =
    process.env.APP_STORAGE?.trim() ||
    process.env.UPLOAD_DIR?.trim() ||
    (process.env.NODE_ENV === "production" ? getUploadDir() : "");
  const dir = storage
    ? path.join(storage, "data")
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
