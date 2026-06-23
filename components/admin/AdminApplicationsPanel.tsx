"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import SubmitButton from "@/components/ui/SubmitButton";
import DataTable, { type DataTableColumn } from "@/components/ui/DataTable";
import { toastSuccess, toastError } from "@/lib/toast";
import { APPLICATION_STATUS_LABELS } from "@/lib/labels";
import { CheckCircle, XCircle } from "lucide-react";

type ApplicationRow = {
  id: string;
  status: string;
  reviewNote: string | null;
  appliedAt: string;
  beneficiary: { id: string; name: string; phone: string; stage: string };
  opportunity: { id: string; title: string; type: string; provider: string };
};

type Props = {
  applications: ApplicationRow[];
};

export default function AdminApplicationsPanel({ applications: initial }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [reviewNote, setReviewNote] = useState<Record<string, string>>({});

  function review(id: string, status: "ACCEPTED" | "REJECTED") {
    startTransition(async () => {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewNote: reviewNote[id] ?? "" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "فشل المراجعة");
        return;
      }
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status, reviewNote: reviewNote[id] ?? null } : r))
      );
      toastSuccess(status === "ACCEPTED" ? "تم قبول التقديم" : "تم رفض التقديم");
      router.refresh();
    });
  }

  const pendingRows = rows.filter((r) => r.status === "PENDING");

  const columns: DataTableColumn<ApplicationRow>[] = [
    {
      key: "beneficiary",
      header: "المستفيد",
      render: (a) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-primary">{a.beneficiary.name}</span>
          <span className="text-xs text-brand-gray" dir="ltr">
            {a.beneficiary.phone}
          </span>
        </div>
      ),
    },
    {
      key: "opportunity",
      header: "الفرصة",
      render: (a) => (
        <>
          <span className="font-medium">{a.opportunity.title}</span>
          <span className="block text-xs text-brand-gray">
            {a.opportunity.provider} ·{" "}
            {a.opportunity.type === "TRAINING" ? "تدريب" : "توظيف"}
          </span>
        </>
      ),
    },
    {
      key: "status",
      header: "الحالة",
      render: (a) =>
        APPLICATION_STATUS_LABELS[a.status as keyof typeof APPLICATION_STATUS_LABELS] ??
        a.status,
    },
    {
      key: "note",
      header: "ملاحظة",
      render: (a) =>
        a.status === "PENDING" ? (
          <input
            className="input-field !py-1.5 text-xs"
            placeholder="ملاحظة (اختياري)"
            value={reviewNote[a.id] ?? ""}
            onChange={(e) => setReviewNote((prev) => ({ ...prev, [a.id]: e.target.value }))}
          />
        ) : (
          <span className="text-brand-gray">{a.reviewNote || "—"}</span>
        ),
    },
    {
      key: "action",
      header: "إجراء",
      render: (a) =>
        a.status === "PENDING" ? (
          <div className="flex flex-wrap justify-end gap-1">
            <SubmitButton
              type="button"
              loading={pending}
              onClick={() => review(a.id, "ACCEPTED")}
              className="btn-primary !px-2 !py-1 text-xs"
            >
              <CheckCircle className="inline h-3 w-3" />
              قبول
            </SubmitButton>
            <SubmitButton
              type="button"
              loading={pending}
              onClick={() => review(a.id, "REJECTED")}
              className="btn-secondary !px-2 !py-1 text-xs"
            >
              <XCircle className="inline h-3 w-3" />
              رفض
            </SubmitButton>
          </div>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <div className="card overflow-x-auto p-0">
      <div className="border-b border-surface-border px-4 py-4 sm:px-6">
        <div className="text-right">
          <h2 className="text-xl font-bold text-primary">مراجعة التقديمات</h2>
          <p className="mt-1 text-sm text-brand-gray">
            {pendingRows.length} تقديم بانتظار المراجعة — فرص التدريب والتوظيف
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(a) => a.id}
        minWidth="800px"
        emptyMessage="لا توجد تقديمات"
      />
    </div>
  );
}
