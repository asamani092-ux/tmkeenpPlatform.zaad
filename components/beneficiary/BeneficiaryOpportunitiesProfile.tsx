"use client";

import { useState } from "react";
import OpportunityApplyCard from "@/components/OpportunityApplyCard";
import BeneficiaryProfileEdit from "@/components/beneficiary/BeneficiaryProfileEdit";
import DetailRow from "@/components/ui/DetailRow";
import FieldGrid from "@/components/ui/FieldGrid";
import { APPLICATION_STATUS_LABELS } from "@/lib/labels";
import { ApplicationStatus } from "@/generated/prisma/client";
import { Briefcase, BookOpen, FileText, ClipboardList } from "lucide-react";
import { formatArDate } from "@/lib/datetime-local";

type Opportunity = {
  id: string;
  title: string;
  provider: string;
  duration: string;
  status: string;
  requirements: string;
  salary: string | null;
  jobType: string | null;
  type: "TRAINING" | "EMPLOYMENT";
};

type Application = {
  id: string;
  status: ApplicationStatus;
  appliedAt: string;
  opportunity: { title: string };
};

type Profile = {
  name: string;
  email: string;
  phone: string;
  educationLevel: string;
  experience: string;
  skills: string;
  careerInterests: string;
  cvUrl: string | null;
};

type Props = {
  trainingOpportunities: Opportunity[];
  employmentOpportunities: Opportunity[];
  applicationByOpp: Record<string, ApplicationStatus>;
  applications: Application[];
  profile: Profile;
  userMeta: {
    educationLevel: string;
    experience: string;
    skills: string;
    careerInterests: string;
    cvUrl: string | null;
    certificatesUrls: string | null;
    phone: string;
    email: string;
  };
};

type SubTab = "opportunities" | "profile";

export default function BeneficiaryOpportunitiesProfile({
  trainingOpportunities,
  employmentOpportunities,
  applicationByOpp,
  applications,
  profile,
  userMeta,
}: Props) {
  const [subTab, setSubTab] = useState<SubTab>("opportunities");

  return (
    <section className="card space-y-4">
      <h2 className="text-xl font-bold text-primary">الفرص والملف</h2>

      <div className="flex gap-2 rounded-lg bg-surface-muted p-1">
        <button
          type="button"
          onClick={() => setSubTab("opportunities")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
            subTab === "opportunities" ? "bg-primary text-white" : "text-brand-gray hover:bg-surface"
          }`}
        >
          <Briefcase className="h-4 w-4" />
          فرص التدريب والتوظيف
        </button>
        <button
          type="button"
          onClick={() => setSubTab("profile")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
            subTab === "profile" ? "bg-primary text-white" : "text-brand-gray hover:bg-surface"
          }`}
        >
          <FileText className="h-4 w-4" />
          ملفي الرقمي
        </button>
      </div>

      {subTab === "opportunities" && (
        <div className="space-y-6">
          {trainingOpportunities.length > 0 && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-bold text-primary">
                <BookOpen className="h-5 w-5" />
                فرص تدريبية
              </h3>
              <ul className="space-y-4">
                {trainingOpportunities.map((opp) => (
                  <OpportunityApplyCard
                    key={opp.id}
                    opportunity={opp}
                    applicationStatus={applicationByOpp[opp.id] ?? null}
                    canApply
                  />
                ))}
              </ul>
            </div>
          )}

          {employmentOpportunities.length > 0 && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-bold text-primary">
                <Briefcase className="h-5 w-5" />
                فرص توظيف
              </h3>
              <ul className="space-y-4">
                {employmentOpportunities.map((opp) => (
                  <OpportunityApplyCard
                    key={opp.id}
                    opportunity={opp}
                    applicationStatus={applicationByOpp[opp.id] ?? null}
                    canApply
                  />
                ))}
              </ul>
            </div>
          )}

          {trainingOpportunities.length === 0 && employmentOpportunities.length === 0 && (
            <p className="text-sm text-brand-gray">لا توجد فرص متاحة لمرحلتك حالياً.</p>
          )}

          {applications.length > 0 && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-bold text-primary">
                <ClipboardList className="h-5 w-5" />
                سجل التقديمات
              </h3>
              <ul className="space-y-2">
                {applications.map((app) => (
                  <li
                    key={app.id}
                    className="flex justify-between rounded-lg bg-surface-muted px-4 py-3 text-sm"
                  >
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      {APPLICATION_STATUS_LABELS[app.status]}
                    </span>
                    <span className="text-brand-gray">
                      {app.opportunity.title} —{" "}
                      {formatArDate(app.appliedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {subTab === "profile" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <BeneficiaryProfileEdit profile={profile} />
          </div>
          <FieldGrid>
            <DetailRow label="المستوى التعليمي" value={userMeta.educationLevel || "—"} />
            <DetailRow
              label="السيرة الذاتية"
              value={
                userMeta.cvUrl ? (
                  <a
                    href={userMeta.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold hover:underline"
                  >
                    عرض السيرة الذاتية
                  </a>
                ) : (
                  "—"
                )
              }
            />
            <DetailRow label="الشهادات" value={userMeta.certificatesUrls ? "مرفقة" : "—"} />
            <DetailRow label="الجوال" value={userMeta.phone} ltr singleLine />
            <DetailRow label="البريد" value={userMeta.email} ltr singleLine />
            <div className="sm:col-span-2">
              <DetailRow label="الخبرات" value={userMeta.experience || "—"} />
            </div>
            <div className="sm:col-span-2">
              <DetailRow label="المهارات" value={userMeta.skills || "—"} />
            </div>
            <div className="sm:col-span-2">
              <DetailRow label="الميول المهنية" value={userMeta.careerInterests || "—"} />
            </div>
          </FieldGrid>
        </div>
      )}
    </section>
  );
}
