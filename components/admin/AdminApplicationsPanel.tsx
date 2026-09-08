"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import SubmitButton from "@/components/ui/SubmitButton";
import DataTable, { type DataTableColumn } from "@/components/ui/DataTable";
import { useSyncFromProps } from "@/lib/use-sync-from-props";
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
  const [rows, setRows] = useSyncFromProps(initial);
  /** Per-row in-flight id so one click doesn't disable every row — O(1). */
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState<Record<string, string>>({});
  const [rejectTarget, setRejectTarget] = useState<ApplicationRow | null>(null);

  async function review(id: string, status: "ACCEPTED" | "REJECTED") {
    setPendingId(id);
    try {
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
      setRows((prev) => prev.filter((r) => r.id !== id));
      toastSuccess(
        status === "ACCEPTED"
          ? "تم القبول — أُشعر المستفيد بالواجهة والبريد (التفاصيل قريباً)"
          : "تم رفض التقديم وإشعار المستفيد"
      );
      router.refresh();
    } catch {
      toastError("حدث خطأ في الاتصال — حاول مرة أخرى");
    } finally {
      setPendingId(null);
    }
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
          <div className="flex w-full min-w-[9.5rem] flex-col gap-2 sm:min-w-0 sm:flex-row sm:flex-wrap sm:justify-start">
            <SubmitButton
              type="button"
              loading={pendingId === a.id}
              disabled={pendingId !== null && pendingId !== a.id}
              onClick={() => review(a.id, "ACCEPTED")}
              className="btn-primary w-full !px-3 !py-2 text-sm sm:w-auto sm:!px-2 sm:!py-1 sm:text-xs"
            >
              <CheckCircle className="inline h-4 w-4 sm:h-3 sm:w-3" />
              قبول
            </SubmitButton>
            <SubmitButton
              type="button"
              loading={pendingId === a.id}
              disabled={pendingId !== null && pendingId !== a.id}
              onClick={() => setRejectTarget(a)}
              className="w-full !px-3 !py-2 text-sm sm:w-auto sm:!px-2 sm:!py-1 sm:text-xs"
              style={{
                border: "var(--border-thick) solid var(--danger-solid)",
                background: "var(--surface-raised)",
                color: "var(--danger-text)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <XCircle className="inline h-4 w-4 sm:h-3 sm:w-3" />
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
        <div className="text-start">
          <h2 className="text-xl font-bold text-primary">مراجعة التقديمات</h2>
          <p className="mt-1 text-sm text-brand-gray">
            {pendingRows.length} تقديم بانتظار المراجعة — فرص التدريب والتوظيف
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={pendingRows}
        rowKey={(a) => a.id}
        minWidth="800px"
        emptyMessage="لا توجد تقديمات بانتظار المراجعة"
        pageSize={10}
      />

      <ConfirmDialog
        open={rejectTarget !== null}
        title="رفض التقديم"
        body={
          rejectTarget
            ? `سيتم رفض تقديم «${rejectTarget.beneficiary.name}» على «${rejectTarget.opportunity.title}» وإشعاره بالبريد والواجهة.`
            : undefined
        }
        confirmLabel="تأكيد الرفض"
        variant="destructive"
        loading={pendingId !== null}
        onConfirm={() => {
          if (!rejectTarget) return;
          const id = rejectTarget.id;
          setRejectTarget(null);
          review(id, "REJECTED");
        }}
        onClose={() => setRejectTarget(null)}
      />
    </div>
  );
}

