/**
 * Known public mailbox providers allowed for beneficiary registration.
 * Time O(1) lookup via Set, Space O(k) domains.
 */
const ALLOWED_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "outlook.sa",
  "hotmail.com",
  "hotmail.co.uk",
  "live.com",
  "msn.com",
  "yahoo.com",
  "yahoo.co.uk",
  "ymail.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "proton.me",
  "protonmail.com",
  "aol.com",
  "zoho.com",
  "gmx.com",
  "mail.com",
  "yandex.com",
]);

export function getAllowedEmailDomains(): string[] {
  return [...ALLOWED_EMAIL_DOMAINS].sort();
}

export function isAllowedEmailDomain(email: string): boolean {
  const value = email.trim().toLowerCase();
  const at = value.lastIndexOf("@");
  if (at < 0) return false;
  const domain = value.slice(at + 1);
  return ALLOWED_EMAIL_DOMAINS.has(domain);
}
