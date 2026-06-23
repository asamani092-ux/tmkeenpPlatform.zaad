/** Upload PDF via API — O(1) network */
export async function uploadPdfFile(
  file: File,
  kind: "cv" | "certificate",
  context?: "register"
): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("kind", kind);
  if (context) form.append("context", context);

  const res = await fetch("/api/upload", { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "فشل رفع الملف");
  }
  return String(data.url);
}
