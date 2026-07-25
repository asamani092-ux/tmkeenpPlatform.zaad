const APP_TZ = "Asia/Riyadh";

/** Format a Date/ISO string for `<input type="datetime-local">` in the user's local TZ. */
export function toDatetimeLocalValue(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Parse datetime-local wall-clock value as local time → ISO UTC string.
 * Uses explicit Y/M/D/H/M components to avoid UTC mis-parse of "YYYY-MM-DDTHH:mm".
 */
export function fromDatetimeLocalValue(local: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(local.trim());
  if (!m) {
    throw new Error("INVALID_DATETIME");
  }
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const h = Number(m[4]);
  const mi = Number(m[5]);
  const date = new Date(y, mo, d, h, mi, 0, 0);
  if (Number.isNaN(date.getTime())) {
    throw new Error("INVALID_DATETIME");
  }
  return date.toISOString();
}

/** Arabic display datetime in Asia/Riyadh, 12-hour, no seconds — O(1). */
export function formatArDateTime(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("ar-SA", {
    timeZone: APP_TZ,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
