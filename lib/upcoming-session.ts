type SessionLike = {
  date: string;
  status: string;
  meetingLink?: string | null;
  location?: string | null;
};

/** Next scheduled session in the future — O(n log n) from sort, n = session count */
export function getUpcomingSession<T extends SessionLike>(
  sessions: T[]
): T | null {
  const now = Date.now();
  const upcoming = sessions
    .filter(
      (s) => s.status === "SCHEDULED" && new Date(s.date).getTime() > now
    )
    .sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  return upcoming[0] ?? null;
}
