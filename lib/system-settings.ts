import fs from "fs/promises";
import path from "path";

export type SystemSettings = {
  senderEmail: string;
};

const SETTINGS_DIR = path.join(process.cwd(), "data");
const SETTINGS_PATH = path.join(SETTINGS_DIR, "system-settings.json");

const DEFAULT_SETTINGS: SystemSettings = {
  senderEmail: "noreply@tmkeen.local",
};

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Load system settings from file — O(1) */
export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const raw = await fs.readFile(SETTINGS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<SystemSettings>;
    return {
      senderEmail: parsed.senderEmail?.trim() || DEFAULT_SETTINGS.senderEmail,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
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
