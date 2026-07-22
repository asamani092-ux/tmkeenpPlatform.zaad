import { isAllowedEmailDomain } from "@/lib/allowed-email-domains";

/**
 * Practical ASCII email check for registration — Time O(n), Space O(1).
 * Requires known provider domain (Gmail, Outlook, Yahoo, …).
 */
export function isValidEmailFormat(email: string): boolean {
  const value = email.trim().toLowerCase();
  if (!value || value.length > 254) return false;
  if ((value.match(/@/g) ?? []).length !== 1) return false;

  const [local, domain] = value.split("@");
  if (!local || !domain) return false;

  if (local.length < 3 || local.length > 64) return false;
  if (!/^[a-z0-9](?:[a-z0-9._%+-]*[a-z0-9])?$/.test(local)) return false;
  if (local.includes("..")) return false;

  const labels = domain.split(".");
  if (labels.length < 2) return false;

  for (const label of labels) {
    if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)) return false;
  }

  return isAllowedEmailDomain(value);
}
