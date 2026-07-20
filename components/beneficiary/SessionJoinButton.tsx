"use client";

import { useEffect, useState } from "react";
import { Video } from "lucide-react";
import { beneficiaryCopy } from "@/lib/copy/ar";
import { canJoinSession } from "@/lib/follow-up-program";

type Props = {
  meetingLink: string;
  sessionDate: string;
  compact?: boolean;
};

export default function SessionJoinButton({ meetingLink, sessionDate, compact = false }: Props) {
  const [canJoin, setCanJoin] = useState(false);

  useEffect(() => {
    const check = () => setCanJoin(canJoinSession(new Date(sessionDate)));
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, [sessionDate]);

  if (compact) {
    return (
      <div className="space-y-0.5">
        {!canJoin && meetingLink && (
          <span className="text-[10px] text-brand-gray">يفتح قبل 15 د</span>
        )}
        {meetingLink && canJoin ? (
          <a
            href={meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
          >
            <Video className="h-3 w-3" />
            انضم
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {!canJoin && (
        <p className="text-center text-sm text-brand-gray">
          الرابط يفتح قبل الموعد بـ 15 دقيقة
        </p>
      )}
      {meetingLink ? (
        canJoin ? (
          <a
            href={meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex w-full items-center justify-center gap-2 !py-3"
          >
            <Video className="h-5 w-5" />
            {beneficiaryCopy.joinRemoteSession}
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="btn-primary flex w-full cursor-not-allowed items-center justify-center gap-2 !py-3 opacity-50"
          >
            <Video className="h-5 w-5" />
            {beneficiaryCopy.joinRemoteSession}
          </button>
        )
      ) : null}
    </div>
  );
}
