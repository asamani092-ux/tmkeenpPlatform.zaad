import { isAllowedEmailDomain } from "@/lib/allowed-email-domains";

/**
 * General ASCII email shape — Time O(n), Space O(1).
 * Used for sender settings (any organizational domain).
 */
export function isValidAsciiEmail(email: string): boolean {
  const value = email.trim().toLowerCase();
  if (!value || value.length > 254) return false;
  if ((value.match(/@/g) ?? []).length !== 1) return false;

  const [local, domain] = value.split("@");
  if (!local || !domain) return false;
  if (local.length < 1 || local.length > 64) return false;
  if (!/^[a-z0-9](?:[a-z0-9._%+-]*[a-z0-9])?$/.test(local) && !/^[a-z0-9]$/.test(local)) {
    return false;
  }
  if (local.includes("..")) return false;

  const labels = domain.split(".");
  if (labels.length < 2) return false;
  const tld = labels[labels.length - 1];
  if (!/^[a-z]{2,24}$/.test(tld)) return false;

  for (const label of labels) {
    if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)) return false;
  }
  return true;
}

/**
 * Beneficiary registration email — known providers + local ≥ 3.
 */
export function isValidEmailFormat(email: string): boolean {
  if (!isValidAsciiEmail(email)) return false;
  const local = email.trim().toLowerCase().split("@")[0] ?? "";
  if (local.length < 3) return false;
  return isAllowedEmailDomain(email);
}
