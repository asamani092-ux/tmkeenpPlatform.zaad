/**
 * UAT checklist is for local/agent tooling only — never public production.
 * Time O(1). Enable explicitly with ENABLE_UAT_CHECKLIST=true if needed.
 */
export function isUatChecklistEnabled(): boolean {
  if (process.env.ENABLE_UAT_CHECKLIST === "true") return true;
  return process.env.NODE_ENV !== "production";
}
