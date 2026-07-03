import OpportunityApplyCard from "@/components/OpportunityApplyCard";
import ContactLinks from "@/components/ui/ContactLinks";
import { ApplicationStatus } from "@/generated/prisma/client";
import { beneficiaryCopy } from "@/lib/copy/ar";
import { Compass, MessageSquare, BookOpen } from "lucide-react";

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

export default function BeneficiaryGuideHub({
  guide,
  professionalRecommendations,
  recommendedCourses,
  notes,
  applicationByOpp,
}: Props) {
  const hasRecs = Boolean(professionalRecommendations?.trim());
  const hasCourses = recommendedCourses.length > 0;
  const hasNotes = notes.length > 0;
  const hasGuide = Boolean(guide);

  return (
    <section className="space-y-6">
      <h2 className="flex items-center gap-2 text-xl font-bold text-primary">
        <Compass className="h-6 w-6 text-secondary-dark" />
        من مرشدك
      </h2>

      {hasGuide && guide && (
        <div className="card-section flex flex-wrap items-center justify-between gap-3">
          <div className="text-start">
            <p className="font-semibold text-primary">مرشدك: {guide.name}</p>
            <p className="mt-1 text-sm text-brand-gray" dir="ltr">
              {guide.phone} · {guide.email}
            </p>
          </div>
          <ContactLinks phone={guide.phone} email={guide.email} />
        </div>
      )}

      <div className="card-section space-y-3">
        <h3 className="font-bold text-primary">{beneficiaryCopy.professionalRecommendations}</h3>
        {hasRecs ? (
          <p className="whitespace-pre-wrap text-sm text-brand-gray">{professionalRecommendations}</p>
        ) : (
          <p className="text-sm text-brand-gray">لم يضف مرشدك توصيات مهنية بعد.</p>
        )}
      </div>

      <div className="card-section space-y-3">
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

      <div className="card-section space-y-3">
        <h3 className="flex items-center gap-2 font-bold text-primary">
          <MessageSquare className="h-5 w-5" />
          ملاحظات المرشد
        </h3>
        {hasNotes ? (
          <ul className="space-y-2">
            {notes.map((note) => (
              <li key={note.id} className="rounded-lg border border-surface-border p-3 text-sm">
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
    </section>
  );
}
