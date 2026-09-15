import { beneficiaryCopy } from "@/lib/copy/ar";
import { SESSION_STATUS_LABELS } from "@/lib/labels";
import { formatCountdown } from "@/lib/follow-up-program";
import { getUpcomingSession } from "@/lib/upcoming-session";
import type { SessionStatus } from "@/generated/prisma/client";
import SessionJoinButton from "@/components/beneficiary/SessionJoinButton";
import { Calendar, MapPin } from "lucide-react";
import { formatArDateTime } from "@/lib/datetime-local";

type Session = {
  date: string;
  status: string;
  notes: string;
  meetingLink?: string | null;
  location?: string | null;
};

type CommitmentTrackerProps = {
  score: number;
  variant?: "card" | "inline";
  sessions?: Session[];
};

export default function CommitmentTracker({
  score,
  variant = "card",
  sessions = [],
}: CommitmentTrackerProps) {
  const clamped = Math.min(100, Math.max(0, score));
  const upcoming = getUpcomingSession(sessions);

  const gauge = (
    <>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="text-start">
          <h2 className="text-lg font-bold text-primary">{beneficiaryCopy.commitmentScore}</h2>
          <p className="text-xs text-brand-gray">
            يُحدَّث تراكمياً بتقييمات المرشد بعد الجلسات
          </p>
        </div>
        <span className="text-2xl font-bold text-primary">{clamped}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={beneficiaryCopy.commitmentScore}
        className="h-3 overflow-hidden rounded-full bg-surface-muted"
      >
        <div
          className="h-full rounded-full bg-gradient-to-l from-secondary to-primary transition-all"
          style={{ width: `${clamped}%` }}
        />
      </div>

      {upcoming && (
        <div className="mt-4 space-y-3 border-t border-surface-border pt-4 text-start">
          <div className="flex items-start gap-2">
            <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-primary">{beneficiaryCopy.upcomingSessionAlert}</p>
              <p className="text-sm text-brand-gray">
                {SESSION_STATUS_LABELS[upcoming.status as SessionStatus]} —{" "}
                {formatArDateTime(upcoming.date)}
              </p>
              <p className="mt-1 text-xs font-semibold text-secondary-dark">
                {formatCountdown(new Date(upcoming.date))}
              </p>
            </div>
          </div>

          {upcoming.location && (
            <p className="flex items-center justify-end gap-2 text-sm text-brand-gray">
              <span>{upcoming.location}</span>
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span className="font-semibold text-primary">{beneficiaryCopy.sessionLocation}:</span>
            </p>
          )}

          {upcoming.notes && <p className="text-sm text-brand-gray">{upcoming.notes}</p>}

          {upcoming.meetingLink && (
            <SessionJoinButton meetingLink={upcoming.meetingLink} sessionDate={upcoming.date} />
          )}
        </div>
      )}
    </>
  );

  if (variant === "inline") {
    return <div className="text-start">{gauge}</div>;
  }

  return <div className="card">{gauge}</div>;
}
