/** Format a Date/ISO string for `<input type="datetime-local">` in the user's local TZ. */
export function toDatetimeLocalValue(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Parse datetime-local wall-clock value as local time → ISO UTC string.
 * Avoids treating "2026-07-20T21:00" as UTC (which shifts the stored instant).
 */
export function fromDatetimeLocalValue(local: string): string {
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) {
    throw new Error("INVALID_DATETIME");
  }
  return d.toISOString();
}
