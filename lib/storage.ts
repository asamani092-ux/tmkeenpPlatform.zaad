import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = ["application/pdf"];

/**
 * Persistent storage root — Coolify must mount a volume here.
 * Prefer APP_STORAGE, then UPLOAD_DIR; production default /app/storage.
 * Time O(1), Space O(1).
 */
export function getUploadDir(): string {
  const fromEnv =
    process.env.UPLOAD_DIR?.trim() || process.env.APP_STORAGE?.trim();
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "production") return "/app/uploads";
  return path.join(process.cwd(), "uploads");
}

/** Evidence / attachments subdirs under storage — O(1) */
export function getEvidenceDir(): string {
  return path.join(getUploadDir(), "evidence");
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

/** Save PDF to persistent storage — O(n) file bytes */
export async function savePdfFile(
  file: File,
  subdir: "cv" | "certificates"
): Promise<string> {
  const err = validatePdfFile(file);
  if (err) throw new Error(err);

  const dir = path.join(getUploadDir(), subdir);
  await fs.mkdir(dir, { recursive: true });
  // Keep evidence tree ready for ops checks / future proof packs
  await fs.mkdir(getEvidenceDir(), { recursive: true });

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
