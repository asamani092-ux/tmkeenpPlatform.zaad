type SessionLike = {
  date: string;
  status: string;
  meetingLink?: string | null;
  location?: string | null;
};

/** Keep join UI available until 2h after scheduled start. */
const JOIN_GRACE_MS = 2 * 60 * 60 * 1000;

/** Next joinable/upcoming scheduled session — O(n log n). */
export function getUpcomingSession<T extends SessionLike>(
  sessions: T[]
): T | null {
  const now = Date.now();
  const upcoming = sessions
    .filter((s) => {
      if (s.status !== "SCHEDULED") return false;
      const t = new Date(s.date).getTime();
      return t + JOIN_GRACE_MS > now;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return upcoming[0] ?? null;
}
