/** Follow-up program scheduling — O(1) per call */

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DAYS_PER_MONTH = 30;

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

export function computeMonthWindow(programStartedAt: Date, month: number) {
  const opensAt = addDays(programStartedAt, (month - 1) * DAYS_PER_MONTH);
  const dueAt = addDays(programStartedAt, month * DAYS_PER_MONTH);
  return { opensAt, dueAt };
}

/** Returns active month 1-6 if within program window, else null */
export function getActiveFollowUpMonth(programStartedAt: Date, now = new Date()): number | null {
  const elapsed = now.getTime() - programStartedAt.getTime();
  if (elapsed < 0) return null;
  const monthIndex = Math.floor(elapsed / (DAYS_PER_MONTH * MS_PER_DAY)) + 1;
  if (monthIndex < 1 || monthIndex > 6) return null;
  return monthIndex;
}

export function formatDaysRemaining(dueAt: Date, now = new Date()): string {
  const diff = dueAt.getTime() - now.getTime();
  const days = Math.ceil(diff / MS_PER_DAY);
  if (days <= 0) return "انتهت المهلة";
  if (days === 1) return "متبقي يوم واحد";
  if (days === 2) return "متبقي يومان";
  if (days <= 10) return `متبقي ${days} أيام`;
  return `متبقي ${days} يوماً`;
}

export function formatCountdown(targetDate: Date, now = new Date()): string {
  const diff = targetDate.getTime() - now.getTime();
  if (diff <= 0) return "الموعد الآن";
  const days = Math.ceil(diff / MS_PER_DAY);
  if (days === 1) return "متبقي يوم واحد";
  if (days === 2) return "متبقي يومان";
  if (days <= 10) return `متبقي ${days} أيام`;
  return `متبقي ${days} يوماً`;
}

export function canJoinSession(sessionDate: Date, now = new Date()): boolean {
  const opensAt = sessionDate.getTime() - 15 * 60 * 1000;
  return now.getTime() >= opensAt;
}
