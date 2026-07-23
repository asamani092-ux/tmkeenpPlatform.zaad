"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Stage } from "@/generated/prisma/client";
import { STAGE_LABELS, STAGE_ORDER } from "@/lib/stages";
import FloatingModal from "@/components/admin/FloatingModal";
import SubmitButton from "@/components/ui/SubmitButton";
import { toastSuccess, toastError } from "@/lib/toast";
import { CheckCircle, ExternalLink, Loader2, UserRound } from "lucide-react";

type PipelineBeneficiary = {
  id: string;
  name: string;
  phone: string;
  stage: Stage;
  pendingStage: Stage | null;
  guideId: string | null;
  guideName: string | null;
};

type GuideOption = { id: string; name: string };

type OpenView = Stage | "pending-requests";

type Props = {
  beneficiaries: PipelineBeneficiary[];
  guides?: GuideOption[];
  onOpenBeneficiary?: (beneficiaryId: string) => void;
};

export default function AdminPipelineBoard({
  beneficiaries,
  guides = [],
  onOpenBeneficiary,
}: Props) {
  const router = useRouter();
  const [openView, setOpenView] = useState<OpenView | null>(null);
  const [quickView, setQuickView] = useState<PipelineBeneficiary | null>(null);
  const [approveTarget, setApproveTarget] = useState<PipelineBeneficiary | null>(null);
  const [selectedGuideId, setSelectedGuideId] = useState("");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const byStage = STAGE_ORDER.reduce(
    (acc, stage) => {
      acc[stage] = beneficiaries.filter((b) => b.stage === stage);
      return acc;
    },
    {} as Record<Stage, PipelineBeneficiary[]>
  );

  const pendingRequests = beneficiaries.filter((b) => b.pendingStage);
  const pendingTotal = pendingRequests.length;

  /** Open full file in management tab — O(1) */
  function openFullFile(beneficiaryId: string) {
    setOpenView(null);
    setQuickView(null);
    setApproveTarget(null);
    if (onOpenBeneficiary) {
      onOpenBeneficiary(beneficiaryId);
      return;
    }
    router.push(`/dashboard/admin?tab=management&beneficiary=${beneficiaryId}`);
  }

  function openApproveModal(b: PipelineBeneficiary) {
    setApproveTarget(b);
    setSelectedGuideId(b.guideId ?? "");
  }

  function closeApproveModal() {
    setApproveTarget(null);
    setSelectedGuideId("");
  }

  /**
   * Assign guide then approve registration — Time O(1) network calls.
   */
  function confirmRegistrationApprove() {
    if (!approveTarget) return;
    if (!selectedGuideId) {
      toastError("اختر مرشداً قبل الاعتماد");
      return;
    }
    const beneficiaryId = approveTarget.id;
    setApprovingId(beneficiaryId);
    startTransition(async () => {
      try {
        const assignRes = await fetch(`/api/beneficiaries/${beneficiaryId}/assign-guide`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ guideId: selectedGuideId }),
        });
        const assignData = await assignRes.json().catch(() => ({}));
        if (!assignRes.ok) {
          toastError(assignData.error || "فشل إسناد المرشد");
          return;
        }

        const res = await fetch("/api/stage-approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ beneficiaryId, action: "registration" }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toastError(data.error || "فشل الاعتماد");
          return;
        }

        toastSuccess("تم إسناد المرشد واعتماد التسجيل");
        closeApproveModal();
        setQuickView(null);
        setOpenView(null);
        router.refresh();
      } finally {
        setApprovingId(null);
      }
    });
  }

  function approveTransition(beneficiaryId: string) {
    setApprovingId(beneficiaryId);
    startTransition(async () => {
      try {
        const res = await fetch("/api/stage-approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ beneficiaryId, action: "transition" }),
        });
        const data = await res.json();
        if (!res.ok) {
          toastError(data.error || "فشل الاعتماد");
          return;
        }
        toastSuccess("تم الاعتماد بنجاح — جاري تحديث اللوحة…");
        setQuickView(null);
        router.refresh();
      } finally {
        setApprovingId(null);
      }
    });
  }

  const modalList =
    openView === "pending-requests"
      ? pendingRequests
      : openView
        ? byStage[openView]
        : [];

  const modalTitle =
    openView === "pending-requests"
      ? `طلبات انتقال معلّقة (${pendingTotal})`
      : openView
        ? `${STAGE_LABELS[openView]} (${modalList.length})`
        : "";

  return (
    <>
      <div className="card">
        <h2 className="mb-4 text-xl font-bold text-primary">لوحة تتبع المسار (Pipeline)</h2>
        <p className="mb-4 text-sm text-brand-gray">
          انقر على أي مرحلة لعرض المستفيدين واعتماد الانتقالات
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {STAGE_ORDER.map((stage) => {
            const count = byStage[stage].length;
            const pendingCount = byStage[stage].filter((b) => b.pendingStage).length;
            return (
              <button
                key={stage}
                type="button"
                onClick={() => setOpenView(stage)}
                className="rounded-xl border-2 border-surface-border bg-surface-muted/50 p-4 text-start transition hover:border-primary hover:bg-primary/5"
              >
                <p className="text-sm font-bold text-primary">{STAGE_LABELS[stage]}</p>
                <p className="mt-2 text-3xl font-bold text-primary">{count}</p>
                {pendingCount > 0 && (
                  <p className="mt-1 text-xs font-semibold text-red-800">
                    {pendingCount} طلب معلّق
                  </p>
                )}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setOpenView("pending-requests")}
            className="rounded-xl border-2 border-red-200 bg-red-50/50 p-4 text-start transition hover:border-primary"
          >
            <p className="text-sm font-bold text-primary">طلبات معلّقة</p>
            <p className="mt-2 text-3xl font-bold text-primary">{pendingTotal}</p>
          </button>
        </div>
      </div>

      {openView && (
        <FloatingModal title={modalTitle} onClose={() => setOpenView(null)} wide>
          {openView === "PENDING_APPROVAL" && modalList.length > 0 && (
            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              مستفيدون جدد بانتظار الاعتماد — اضغط «اعتماد» لإسناد مرشد وتأكيد الاعتماد، أو «عرض
              الملف» للتفاصيل الكاملة.
            </p>
          )}
          {modalList.length === 0 ? (
            <p className="text-center text-brand-gray">لا يوجد مستفيدون</p>
          ) : (
            <ul className="space-y-3">
              {modalList.map((b) => (
                <li
                  key={b.id}
                  className="cursor-pointer rounded-lg border border-surface-border bg-surface p-4 text-start text-sm transition hover:border-primary"
                  onClick={() => setQuickView(b)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1">
                      <span>
                        <span className="text-xs text-brand-gray">المستفيد: </span>
                        <span className="font-bold text-primary">{b.name}</span>
                      </span>
                      <span>
                        <span className="text-xs text-brand-gray">الجوال: </span>
                        <span className="text-brand-gray" dir="ltr">
                          {b.phone}
                        </span>
                      </span>
                    </div>
                    <div
                      className="flex shrink-0 flex-wrap items-center justify-end gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {b.stage === "PENDING_APPROVAL" && (
                        <>
                          <button
                            type="button"
                            onClick={() => openApproveModal(b)}
                            className="btn-primary !px-3 !py-1.5 text-xs"
                          >
                            <CheckCircle className="inline h-3 w-3" />
                            اعتماد
                          </button>
                          <button
                            type="button"
                            onClick={() => openFullFile(b.id)}
                            className="btn-secondary !px-3 !py-1.5 text-xs"
                          >
                            <ExternalLink className="inline h-3 w-3" />
                            عرض الملف
                          </button>
                        </>
                      )}
                      {b.pendingStage && (
                        <button
                          type="button"
                          disabled={pending && approvingId === b.id}
                          onClick={() => approveTransition(b.id)}
                          className="btn-primary !px-3 !py-1.5 text-xs"
                        >
                          {pending && approvingId === b.id ? (
                            <Loader2 className="inline h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle className="inline h-3 w-3" />
                          )}
                          {pending && approvingId === b.id
                            ? "جاري الاعتماد…"
                            : `اعتماد ${STAGE_LABELS[b.pendingStage]}`}
                        </button>
                      )}
                    </div>
                  </div>
                  {b.stage === "PENDING_APPROVAL" && (
                    <p className="mt-2 text-xs text-brand-gray">
                      الحالة: بانتظار إسناد مرشد واعتماد التسجيل
                      {b.guideName ? ` — المرشد الحالي: ${b.guideName}` : ""}
                    </p>
                  )}
                  {b.pendingStage && (
                    <p className="mt-2 inline-block rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-red-900">
                      طلب: {STAGE_LABELS[b.pendingStage]}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </FloatingModal>
      )}

      {quickView && (
        <FloatingModal
          title={`عرض سريع — ${quickView.name}`}
          onClose={() => setQuickView(null)}
        >
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs text-brand-gray">الجوال</dt>
              <dd dir="ltr">{quickView.phone}</dd>
            </div>
            <div>
              <dt className="text-xs text-brand-gray">المرحلة</dt>
              <dd className="font-semibold text-primary">
                {STAGE_LABELS[quickView.stage]}
              </dd>
            </div>
            {quickView.stage !== "PENDING_APPROVAL" && (
              <div>
                <dt className="text-xs text-brand-gray">المرشد</dt>
                <dd>{quickView.guideName ?? "—"}</dd>
              </div>
            )}
            {quickView.pendingStage && (
              <div>
                <dt className="text-xs text-brand-gray">طلب معلّق</dt>
                <dd>{STAGE_LABELS[quickView.pendingStage]}</dd>
              </div>
            )}
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            {quickView.stage === "PENDING_APPROVAL" && (
              <button
                type="button"
                onClick={() => openApproveModal(quickView)}
                className="btn-primary !px-3 !py-2 text-sm"
              >
                <CheckCircle className="inline h-4 w-4" />
                اعتماد
              </button>
            )}
            {quickView.pendingStage && (
              <button
                type="button"
                disabled={pending && approvingId === quickView.id}
                onClick={() => approveTransition(quickView.id)}
                className="btn-primary !px-3 !py-2 text-sm"
              >
                {pending && approvingId === quickView.id ? (
                  <Loader2 className="inline h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="inline h-4 w-4" />
                )}
                {pending && approvingId === quickView.id
                  ? "جاري الاعتماد…"
                  : "الانتقال للمرحلة التالية"}
              </button>
            )}
            <button
              type="button"
              onClick={() => openFullFile(quickView.id)}
              className="btn-secondary inline-flex !px-3 !py-2 text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              عرض الملف
            </button>
          </div>
        </FloatingModal>
      )}

      {approveTarget && (
        <FloatingModal
          title={`اعتماد تسجيل — ${approveTarget.name}`}
          onClose={closeApproveModal}
        >
          <div className="space-y-4 text-start">
            <p className="text-sm text-brand-gray">
              اختر المرشد ثم أكّد الاعتماد لنقل المستفيد إلى مرحلة الإرشاد.
            </p>
            <div>
              <p className="text-xs text-brand-gray">الجوال</p>
              <p dir="ltr" className="font-medium text-primary">
                {approveTarget.phone}
              </p>
            </div>
            <div>
              <label htmlFor="pipeline-approve-guide" className="label-field">
                إسناد المرشد
              </label>
              <select
                id="pipeline-approve-guide"
                className="input-field"
                value={selectedGuideId}
                disabled={pending}
                onChange={(e) => setSelectedGuideId(e.target.value)}
              >
                <option value="">— اختر مرشداً —</option>
                {guides.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              {guides.length === 0 && (
                <p className="mt-1 text-xs font-semibold text-amber-900">
                  لا يوجد مرشدون — أضف مرشداً من تبويب إدارة المرشدين أولاً.
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <SubmitButton
                type="button"
                loading={pending && approvingId === approveTarget.id}
                disabled={!selectedGuideId || pending}
                onClick={confirmRegistrationApprove}
                className="btn-primary flex-1 !py-2 text-sm"
              >
                <UserRound className="h-4 w-4" />
                تأكيد الاعتماد
              </SubmitButton>
              <button
                type="button"
                disabled={pending}
                onClick={closeApproveModal}
                className="btn-secondary flex-1 !py-2 text-sm"
              >
                إلغاء
              </button>
            </div>
          </div>
        </FloatingModal>
      )}
    </>
  );
}
