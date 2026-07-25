/**
 * UAT checklist: allowed in local trial (localhost / next dev),
 * blocked on public production hosts. Time O(1).
 *
 * Override: ENABLE_UAT_CHECKLIST=true (never set on Coolify).
 */
export function isLocalTrialHost(host?: string | null): boolean {
  if (!host) return false;
  const h = host.split(":")[0]?.toLowerCase() ?? "";
  return (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "::1" ||
    h === "[::1]" ||
    h.endsWith(".localhost")
  );
}

export function isUatChecklistEnabled(host?: string | null): boolean {
  if (process.env.ENABLE_UAT_CHECKLIST === "true") return true;
  if (process.env.NODE_ENV !== "production") return true;
  return isLocalTrialHost(host);
}
