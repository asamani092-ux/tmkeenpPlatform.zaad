import { beneficiaryCopy } from "@/lib/copy/ar";
import { Calendar, MapPin, AlertCircle } from "lucide-react";
import { SESSION_STATUS_LABELS } from "@/lib/labels";
import type { SessionStatus } from "@/generated/prisma/client";
import SessionJoinButton from "@/components/beneficiary/SessionJoinButton";



type Session = {

  id: string;

  date: string;

  status: string;

  notes: string;

  meetingLink?: string | null;

  location?: string | null;

};



type Props = {

  sessions: Session[];

};



export default function NextSessionCard({ sessions }: Props) {

  const now = Date.now();

  const upcoming = sessions

    .filter((s) => s.status === "SCHEDULED" && new Date(s.date).getTime() >= now)

    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];



  if (!upcoming) {

    return (

      <section className="card">

        <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-primary">

          <Calendar className="h-6 w-6" />

          {beneficiaryCopy.nextSession}

        </h2>

        <p className="text-brand-gray">{beneficiaryCopy.noNextSession}</p>

      </section>

    );

  }



  return (

    <section className="card border-2 border-secondary bg-gradient-to-l from-secondary/10 to-surface">

      <div className="mb-4 flex items-center gap-3">

        <AlertCircle className="h-8 w-8 shrink-0 text-secondary-dark" />

        <div>

          <h2 className="text-xl font-bold text-primary">

            {beneficiaryCopy.upcomingSessionAlert}

          </h2>

          <p className="text-sm text-brand-gray">

            {SESSION_STATUS_LABELS[upcoming.status as SessionStatus]} —{" "}

            {new Date(upcoming.date).toLocaleString("ar-SA")}

          </p>

        </div>

      </div>



      <div className="space-y-3 rounded-lg bg-surface p-4">

        {upcoming.location && (

          <p className="flex items-center justify-end gap-2 text-sm text-brand-gray">

            <span>{upcoming.location}</span>

            <MapPin className="h-4 w-4 shrink-0 text-primary" />

            <span className="font-semibold text-primary">{beneficiaryCopy.sessionLocation}:</span>

          </p>

        )}



        {upcoming.notes && (

          <p className="text-sm text-brand-gray">{upcoming.notes}</p>

        )}



        {upcoming.meetingLink && (
          <SessionJoinButton
            meetingLink={upcoming.meetingLink}
            sessionDate={upcoming.date}
          />
        )}

      </div>

    </section>

  );

}

