/**
 * Practical ASCII email check for registration — Time O(n), Space O(1).
 * Rejects non-Latin and tiny locals/domains (e.g. ss@ss.com, للل@للل.com).
 */
export function isValidEmailFormat(email: string): boolean {
  const value = email.trim().toLowerCase();
  if (!value || value.length > 254) return false;
  if ((value.match(/@/g) ?? []).length !== 1) return false;

  const [local, domain] = value.split("@");
  if (!local || !domain) return false;

  // Local: 3–64 ASCII chars; must start/end with letter or digit
  if (local.length < 3 || local.length > 64) return false;
  if (!/^[a-z0-9](?:[a-z0-9._%+-]*[a-z0-9])?$/.test(local)) return false;
  if (local.includes("..")) return false;

  const labels = domain.split(".");
  if (labels.length < 2) return false;

  const tld = labels[labels.length - 1];
  if (!/^[a-z]{2,24}$/.test(tld)) return false;

  // Registrable label (e.g. gmail in gmail.com) must be ≥ 3
  const sld = labels[labels.length - 2];
  if (sld.length < 3) return false;

  for (const label of labels) {
    if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)) return false;
  }

  return true;
}
