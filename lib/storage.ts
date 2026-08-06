import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = ["application/pdf"];
const SAFE_FILENAME = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$/i;

export type UploadSubdir = "cv" | "certificates";

export function getUploadDir(): string {
  return process.env.UPLOAD_DIR?.trim() || path.join(process.cwd(), "uploads");
}

/** Validate PDF upload — O(1) */
export function validatePdfFile(file: File): string | null {
  if (!ALLOWED_MIME.includes(file.type) && !file.name.toLowerCase().endsWith(".pdf")) {
    return "يُسمح برفع ملفات PDF فقط";
  }
  if (file.size > MAX_BYTES) {
    return "حجم الملف يجب ألا يتجاوز 5 ميغابايت";
  }
  return null;
}

export function parseStoredFileKey(
  relativePath: string
): { subdir: UploadSubdir; filename: string } | null {
  const normalized = relativePath.replace(/^\/api\/files\//, "").replace(/^\/+/, "");
  if (!normalized || normalized.includes("..")) return null;

  const slash = normalized.indexOf("/");
  if (slash <= 0) return null;

  const subdir = normalized.slice(0, slash);
  const filename = normalized.slice(slash + 1);
  if (subdir !== "cv" && subdir !== "certificates") return null;
  if (!SAFE_FILENAME.test(filename)) return null;
  return { subdir, filename };
}

/**
 * Save PDF into PostgreSQL (source of truth) — Time O(n) file bytes, Space O(n).
 * URL shape unchanged: /api/files/{subdir}/{uuid}.pdf
 */
export async function savePdfFile(
  file: File,
  subdir: UploadSubdir
): Promise<string> {
  const err = validatePdfFile(file);
  if (err) throw new Error(err);

  const filename = `${randomUUID()}.pdf`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await prisma.storedFile.create({
    data: {
      subdir,
      filename,
      mimeType: "application/pdf",
      size: buffer.length,
      data: buffer,
    },
  });

  return `/api/files/${subdir}/${filename}`;
}

/** Load PDF bytes from DB — Time O(n), Space O(n). */
export async function readStoredFileFromDb(
  relativePath: string
): Promise<{ data: Buffer; mimeType: string; filename: string } | null> {
  const key = parseStoredFileKey(relativePath);
  if (!key) return null;

  const row = await prisma.storedFile.findUnique({
    where: { subdir_filename: { subdir: key.subdir, filename: key.filename } },
    select: { data: true, mimeType: true, filename: true },
  });
  if (!row) return null;

  return {
    data: Buffer.from(row.data),
    mimeType: row.mimeType || "application/pdf",
    filename: row.filename,
  };
}

/** Resolve legacy disk path (fallback only) — O(1) */
export function resolveStoredFile(relativePath: string): string | null {
  const key = parseStoredFileKey(relativePath);
  if (!key) return null;

  const full = path.join(getUploadDir(), key.subdir, key.filename);
  const base = path.resolve(getUploadDir());
  if (!path.resolve(full).startsWith(base)) return null;
  return full;
}

/** Legacy disk read — O(n). Prefer readStoredFileFromDb. */
export async function readStoredFileFromDisk(
  relativePath: string
): Promise<Buffer | null> {
  const fullPath = resolveStoredFile(relativePath);
  if (!fullPath) return null;
  try {
    return await fs.readFile(fullPath);
  } catch {
    return null;
  }
}
