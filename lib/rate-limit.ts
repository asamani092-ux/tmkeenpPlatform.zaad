const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 10;
const HOURLY_WINDOW_MS = 60 * 60 * 1000;

/** Simple in-memory rate limit — O(1) time, O(1) space */
export function checkRateLimit(key: string): boolean {
  return checkRateLimitWindow(key, WINDOW_MS, MAX_ATTEMPTS);
}

/** Hourly rate limit — O(1) time, O(1) space */
export function checkHourlyRateLimit(key: string, maxAttempts = 3): boolean {
  return checkRateLimitWindow(key, HOURLY_WINDOW_MS, maxAttempts);
}

function checkRateLimitWindow(
  key: string,
  windowMs: number,
  maxAttempts: number
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxAttempts) return false;

  entry.count += 1;
  return true;
}
