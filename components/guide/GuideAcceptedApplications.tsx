"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SubmitButton from "@/components/ui/SubmitButton";
import { toastError, toastSuccess } from "@/lib/toast";
import { BadgeCheck } from "lucide-react";

type Row = {
  id: string;
  beneficiaryName: string;
  opportunityTitle: string;
  opportunityType: string;
};

type Props = {
  applications: Row[];
};

/** Complete accepted applications for assigned beneficiaries. Time O(n) render. */
export default function GuideAcceptedApplications({ applications }: Props) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const visible = applications.filter((a) => !hidden[a.id]);
  if (visible.length === 0) return null;

  async function complete(id: string) {
    setPendingId(id);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "تعذر تسجيل الإكمال");
        return;
      }
      setHidden((prev) => ({ ...prev, [id]: true }));
      toastSuccess("سُجّل الإكمال في إنجازات المستفيد");
      router.refresh();
    } catch {
      toastError("حدث خطأ في الاتصال");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <section className="card text-start">
      <h2 className="mb-3 text-lg font-bold text-primary">تقديمات مقبولة لمستفيدين مُسندين إليك</h2>
      <ul className="space-y-2">
        {visible.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-muted px-3 py-2 text-sm">
            <span>
              <span className="font-semibold text-primary">{a.beneficiaryName}</span>
              <span className="text-brand-gray">
                {" "}
                — {a.opportunityTitle} ({a.opportunityType === "TRAINING" ? "تدريب" : "توظيف"})
              </span>
            </span>
            <SubmitButton
              type="button"
              loading={pendingId === a.id}
              onClick={() => complete(a.id)}
              className="btn-secondary !px-3 !py-1.5 text-xs"
            >
              <BadgeCheck className="inline h-3.5 w-3.5" />
              تعليم كمكتمل
            </SubmitButton>
          </li>
        ))}
      </ul>
    </section>
  );
}
