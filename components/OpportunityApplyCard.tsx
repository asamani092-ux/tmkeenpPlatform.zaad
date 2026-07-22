"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { APPLICATION_STATUS_LABELS } from "@/lib/labels";
import { ApplicationStatus } from "@/generated/prisma/client";
import SubmitButton from "@/components/ui/SubmitButton";
import { BookOpen, Briefcase, Building2, Clock, Send, Tag } from "lucide-react";

type Props = {
  opportunity: {
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
  applicationStatus: ApplicationStatus | null;
  canApply: boolean;
};

const TYPE_LABELS = {
  TRAINING: "تدريب",
  EMPLOYMENT: "توظيف",
} as const;

export default function OpportunityApplyCard({
  opportunity,
  applicationStatus,
  canApply,
}: Props) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  /** O(1) — explicit loading so refresh cannot leave spinner stuck */
  const [pending, setPending] = useState(false);

  async function handleApply() {
    setMessage("");
    setPending(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: opportunity.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "فشل الإرسال");
        return;
      }
      setMessage("تم إرسال طلبك بنجاح");
      router.refresh();
    } catch {
      setMessage("حدث خطأ في الاتصال");
    } finally {
      setPending(false);
    }
  }

  const applyLabel =
    opportunity.type === "TRAINING" ? "تسجيل في الدورة" : "ترشيح للوظيفة";
  const TypeIcon = opportunity.type === "TRAINING" ? BookOpen : Briefcase;

  return (
    <li className="rounded-xl border border-surface-border bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2 text-start">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
              <TypeIcon className="h-3.5 w-3.5" />
              {TYPE_LABELS[opportunity.type]}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary/20 px-2.5 py-0.5 text-xs font-semibold text-primary-dark">
              <Tag className="h-3.5 w-3.5" />
              {opportunity.status}
            </span>
          </div>
          <h3 className="text-lg font-bold text-primary">{opportunity.title}</h3>
        </div>
        {applicationStatus && (
          <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {APPLICATION_STATUS_LABELS[applicationStatus]}
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <p className="flex items-center gap-2 text-brand-gray">
          <Building2 className="h-4 w-4 shrink-0 text-primary" />
          <span>
            <span className="font-semibold text-primary">الجهة: </span>
            {opportunity.provider}
          </span>
        </p>
        <p className="flex items-center gap-2 text-brand-gray">
          <Clock className="h-4 w-4 shrink-0 text-primary" />
          <span>
            <span className="font-semibold text-primary">المدة: </span>
            {opportunity.duration}
          </span>
        </p>
        {opportunity.type === "EMPLOYMENT" && opportunity.salary && (
          <p className="text-brand-gray sm:col-span-2">
            <span className="font-semibold text-primary">الراتب: </span>
            {opportunity.salary}
          </p>
        )}
        {opportunity.type === "EMPLOYMENT" && opportunity.jobType && (
          <p className="text-brand-gray sm:col-span-2">
            <span className="font-semibold text-primary">نوع الدوام: </span>
            {opportunity.jobType}
          </p>
        )}
      </div>

      {opportunity.requirements && (
        <p className="mt-3 rounded-lg bg-surface-muted px-3 py-2 text-sm text-brand-gray">
          <span className="font-semibold text-primary">الشروط والمتطلبات: </span>
          {opportunity.requirements}
        </p>
      )}

      {!applicationStatus && canApply && (
        <SubmitButton
          type="button"
          onClick={handleApply}
          loading={pending}
          className="btn-primary mt-4 w-full !py-2 text-sm"
        >
          <Send className="h-4 w-4" />
          {applyLabel}
        </SubmitButton>
      )}

      {message && <p className="mt-2 text-xs text-primary-dark">{message}</p>}
    </li>
  );
}
