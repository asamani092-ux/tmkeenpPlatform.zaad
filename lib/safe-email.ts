/** Fire-and-forget email — failures must not break core actions. O(1) */
export async function safeSendEmail(
  label: string,
  fn: () => Promise<void>
): Promise<void> {
  try {
    await fn();
  } catch (err) {
    console.warn(`[email] ${label} failed:`, err);
  }
}
