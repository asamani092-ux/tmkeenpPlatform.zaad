"use client";

import { useState } from "react";
import SlideOver from "@/components/SlideOver";
import ContactLinks from "@/components/ui/ContactLinks";
import DetailRow from "@/components/ui/DetailRow";
import FieldGrid from "@/components/ui/FieldGrid";
import OpportunityApplyCard from "@/components/OpportunityApplyCard";
import { ApplicationStatus } from "@/generated/prisma/client";
import { beneficiaryCopy } from "@/lib/copy/ar";
import { Compass, BookOpen, MessageSquare } from "lucide-react";

type GuideInfo = {
  name: string;
  email: string;
  phone: string;
};

type RecommendedCourse = {
  id: string;
  title: string;
  provider: string;
  duration: string;
  status: string;
  requirements: string;
  salary: string | null;
  jobType: string | null;
  type: "TRAINING";
};

type Note = {
  id: string;
  content: string;
  createdAt: string;
  guideName: string;
};

type Props = {
  guide: GuideInfo | null;
  professionalRecommendations: string;
  recommendedCourses: RecommendedCourse[];
  notes: Note[];
  applicationByOpp: Record<string, ApplicationStatus>;
};

export default function BeneficiaryGuideDrawer({
  guide,
  professionalRecommendations,
  recommendedCourses,
  notes,
  applicationByOpp,
}: Props) {
  const [open, setOpen] = useState(false);
  const hasRecs = Boolean(professionalRecommendations?.trim());
  const hasCourses = recommendedCourses.length > 0;
  const hasNotes = notes.length > 0;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary w-full sm:w-auto">
        <Compass className="h-4 w-4" />
        من مرشدك؟
      </button>

      <SlideOver open={open} onClose={() => setOpen(false)} title="من مرشدك؟">
        <div className="space-y-6 p-4 text-start sm:p-6">
          {guide ? (
            <div className="space-y-3">
              <FieldGrid cols={1}>
                <DetailRow label="المرشد" value={guide.name} />
                <DetailRow label="الجوال" value={guide.phone} ltr />
                <DetailRow label="البريد" value={guide.email} ltr />
              </FieldGrid>
              <ContactLinks phone={guide.phone} email={guide.email} />
            </div>
          ) : (
            <p className="text-sm text-brand-gray">لم يُسنَد لك مرشد بعد.</p>
          )}

          <div className="space-y-2">
            <h3 className="font-bold text-primary">{beneficiaryCopy.professionalRecommendations}</h3>
            {hasRecs ? (
              <p className="whitespace-pre-wrap text-sm text-brand-gray">{professionalRecommendations}</p>
            ) : (
              <p className="text-sm text-brand-gray">لم يضف مرشدك توصيات مهنية بعد.</p>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="flex items-center gap-2 font-bold text-primary">
              <BookOpen className="h-5 w-5" />
              {beneficiaryCopy.recommendedCourses}
            </h3>
            {hasCourses ? (
              <ul className="space-y-3">
                {recommendedCourses.map((c) => (
                  <OpportunityApplyCard
                    key={c.id}
                    opportunity={c}
                    applicationStatus={applicationByOpp[c.id] ?? null}
                    canApply
                  />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-brand-gray">لم يحدد مرشدك دورات موصى بها بعد.</p>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="flex items-center gap-2 font-bold text-primary">
              <MessageSquare className="h-5 w-5" />
              ملاحظات المرشد
            </h3>
            {hasNotes ? (
              <ul className="space-y-2">
                {notes.map((note) => (
                  <li key={note.id} className="field-cell text-sm">
                    <p className="text-xs text-brand-gray">
                      {note.guideName} · {new Date(note.createdAt).toLocaleDateString("ar-SA")}
                    </p>
                    <p className="mt-1 text-brand-gray">{note.content}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-brand-gray">لا توجد ملاحظات من مرشدك حتى الآن.</p>
            )}
          </div>
        </div>
      </SlideOver>
    </>
  );
}
