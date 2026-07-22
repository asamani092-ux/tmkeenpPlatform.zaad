/**
 * ASCII email shape check — Time O(n), Space O(1).
 * Registration relies on email OTP for ownership, not a domain allowlist.
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

/** Alias used by registration / shared validators */
export function isValidEmailFormat(email: string): boolean {
  return isValidAsciiEmail(email);
}
