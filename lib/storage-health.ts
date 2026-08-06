import fs from "fs/promises";
import path from "path";
import { getUploadDir } from "@/lib/storage";

export type StorageHealth = {
  dir: string;
  exists: boolean;
  writable: boolean;
  cvCount: number;
  certificatesCount: number;
};

async function countPdfFiles(dir: string): Promise<number> {
  try {
    const entries = await fs.readdir(dir);
    return entries.filter((f) => f.toLowerCase().endsWith(".pdf")).length;
  } catch {
    return 0;
  }
}

/**
 * Upload-storage health for the admin settings panel — detects the
 * "files vanish after redeploy" misconfiguration (no persistent volume).
 * Time O(files in dir); Space O(1).
 */
export async function getStorageHealth(): Promise<StorageHealth> {
  const dir = getUploadDir();

  let exists = false;
  try {
    const stat = await fs.stat(dir);
    exists = stat.isDirectory();
  } catch {
    exists = false;
  }

  let writable = false;
  if (exists) {
    try {
      const probe = path.join(dir, `.write-probe-${Date.now()}`);
      await fs.writeFile(probe, "ok");
      await fs.unlink(probe);
      writable = true;
    } catch {
      writable = false;
    }
  }

  const [cvCount, certificatesCount] = await Promise.all([
    countPdfFiles(path.join(dir, "cv")),
    countPdfFiles(path.join(dir, "certificates")),
  ]);

  return { dir, exists, writable, cvCount, certificatesCount };
}
