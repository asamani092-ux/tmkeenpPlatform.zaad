"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { APPLICATION_STATUS_LABELS } from "@/lib/labels";
import { ApplicationStatus } from "@/generated/prisma/client";
import { Send } from "lucide-react";

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

export default function OpportunityApplyCard({
  opportunity,
  applicationStatus,
  canApply,
}: Props) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function handleApply() {
    setMessage("");
    startTransition(async () => {
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
      }
    });
  }

  const applyLabel =
    opportunity.type === "TRAINING" ? "تسجيل في الدورة" : "ترشيح للوظيفة";

  return (
    <li className="rounded-xl border border-surface-border bg-surface p-5 shadow-sm">
      <h3 className="font-bold text-primary">{opportunity.title}</h3>
      <p className="mt-1 text-sm text-brand-gray">
        {opportunity.provider} · {opportunity.duration}
      </p>
      {opportunity.requirements && (
        <p className="mt-2 text-sm text-brand-gray">
          <span className="font-semibold text-primary">الشروط: </span>
          {opportunity.requirements}
        </p>
      )}
      {opportunity.type === "EMPLOYMENT" && (opportunity.salary || opportunity.jobType) && (
        <p className="mt-1 text-sm text-brand-gray">
          {opportunity.salary && <>الراتب: {opportunity.salary} · </>}
          {opportunity.jobType && <>الدوام: {opportunity.jobType}</>}
        </p>
      )}

      {applicationStatus ? (
        <span className="mt-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {APPLICATION_STATUS_LABELS[applicationStatus]}
        </span>
      ) : canApply ? (
        <button
          type="button"
          onClick={handleApply}
          disabled={pending}
          className="btn-primary mt-4 flex w-full items-center justify-center gap-2 !py-2 text-sm"
        >
          <Send className="h-4 w-4" />
          {pending ? "جاري الإرسال..." : applyLabel}
        </button>
      ) : null}

      {message && (
        <p className="mt-2 text-xs text-primary-dark">{message}</p>
      )}
    </li>
  );
}
