import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = ["application/pdf"];

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

/** Save PDF to disk — O(1) time, O(1) space */
export async function savePdfFile(
  file: File,
  subdir: "cv" | "certificates"
): Promise<string> {
  const err = validatePdfFile(file);
  if (err) throw new Error(err);

  const dir = path.join(getUploadDir(), subdir);
  await fs.mkdir(dir, { recursive: true });

  const safeName = `${randomUUID()}.pdf`;
  const fullPath = path.join(dir, safeName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(fullPath, buffer);

  return `/api/files/${subdir}/${safeName}`;
}

/** Resolve stored file path — O(1) */
export function resolveStoredFile(relativePath: string): string | null {
  const normalized = relativePath.replace(/^\/api\/files\//, "");
  if (normalized.includes("..")) return null;

  const full = path.join(getUploadDir(), normalized);
  const base = path.resolve(getUploadDir());
  if (!path.resolve(full).startsWith(base)) return null;
  return full;
}
