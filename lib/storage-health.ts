import fs from "fs/promises";
import path from "path";
import { getUploadDir } from "@/lib/storage";
import { prisma } from "@/lib/prisma";

export type StorageHealth = {
  backend: "database";
  dbOk: boolean;
  dir: string;
  /** Disk still used for system-settings JSON; attachments live in DB. */
  exists: boolean;
  writable: boolean;
  cvCount: number;
  certificatesCount: number;
  totalCount: number;
};

/**
 * Attachment storage health — DB is source of truth.
 * Time O(1) counts via aggregate; Space O(1).
 */
export async function getStorageHealth(): Promise<StorageHealth> {
  const dir = getUploadDir();

  let dbOk = false;
  let cvCount = 0;
  let certificatesCount = 0;
  try {
    const groups = await prisma.storedFile.groupBy({
      by: ["subdir"],
      _count: { _all: true },
    });
    dbOk = true;
    for (const g of groups) {
      if (g.subdir === "cv") cvCount = g._count._all;
      if (g.subdir === "certificates") certificatesCount = g._count._all;
    }
  } catch (err) {
    console.warn("[storage-health] DB check failed:", err);
    dbOk = false;
  }

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

  return {
    backend: "database",
    dbOk,
    dir,
    exists,
    writable,
    cvCount,
    certificatesCount,
    totalCount: cvCount + certificatesCount,
  };
}
