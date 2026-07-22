/**
 * ASCII email shape check — Time O(n) on string length, Space O(1).
 * Rejects non-Latin local/domain parts (e.g. للل@للل.com).
 */
const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function isValidEmailFormat(email: string): boolean {
  const value = email.trim();
  if (!value || value.length > 254) return false;
  return EMAIL_RE.test(value);
}
