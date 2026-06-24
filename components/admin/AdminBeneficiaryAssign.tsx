"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { STAGE_LABELS } from "@/lib/stages";
import type { Stage } from "@/generated/prisma/client";
import ExportExcelButton from "@/components/admin/ExportExcelButton";
import { toastSuccess, toastError } from "@/lib/toast";
import { CheckCircle } from "lucide-react";

type Beneficiary = {
  id: string;
  name: string;
  phone: string;
  stage: Stage;
  pendingStage: Stage | null;
  guideId: string | null;
  guideName: string | null;
};

type GuideOption = { id: string; name: string };

type Props = {
  beneficiaries: Beneficiary[];
  guides: GuideOption[];
};

export default function AdminBeneficiaryAssign({ beneficiaries: initial, guides }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [pending, startTransition] = useTransition();

  const exportHeaders = ["الاسم", "الجوال", "المرحلة", "طلب معلّق", "المرشد"];
  const exportRows = rows.map((b) => [
    b.name,
    b.phone,
    STAGE_LABELS[b.stage],
    b.pendingStage ? STAGE_LABELS[b.pendingStage] : "—",
    b.guideName ?? "—",
  ]);

  function assign(beneficiaryId: string, guideId: string) {
    startTransition(async () => {
      const res = await fetch(`/api/beneficiaries/${beneficiaryId}/assign-guide`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guideId: guideId || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "فشل الإسناد");
        return;
      }
      const guideName = guides.find((g) => g.id === guideId)?.name ?? null;
      setRows((prev) =>
        prev.map((b) =>
          b.id === beneficiaryId ? { ...b, guideId: guideId || null, guideName } : b
        )
      );
      toastSuccess("تم تحديث الإسناد");
      router.refresh();
    });
  }

  function approve(beneficiaryId: string, action: "registration" | "transition") {
    startTransition(async () => {
      const res = await fetch("/api/stage-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beneficiaryId, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "فشل الاعتماد");
        return;
      }
      toastSuccess("تم الاعتماد بنجاح");
      router.refresh();
    });
  }

  return (
    <div className="card overflow-x-auto p-0">
      <div className="border-b border-surface-border px-6 py-4">
        <h2 className="text-xl font-bold text-primary">إسناد المستفيدين للمرشدين</h2>
        <ExportExcelButton filename="beneficiaries" headers={exportHeaders} rows={exportRows} />
      </div>
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-primary/5 text-primary">
          <tr>
            <th className="px-4 py-3">الاسم</th>
            <th className="px-4 py-3">المرحلة</th>
            <th className="px-4 py-3">المرشد</th>
            <th className="px-4 py-3">إسناد</th>
            <th className="px-4 py-3">اعتماد</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.id} className="border-t border-surface-border">
              <td className="px-4 py-3 font-medium">{b.name}</td>
              <td className="px-4 py-3">
                {STAGE_LABELS[b.stage]}
                {b.pendingStage && (
                  <span className="ms-1 block text-xs font-semibold text-red-800">
                    طلب: {STAGE_LABELS[b.pendingStage]}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-brand-gray">{b.guideName ?? "—"}</td>
              <td className="px-4 py-3">
                <select
                  defaultValue={b.guideId ?? ""}
                  disabled={pending}
                  className="input-field !py-2"
                  onChange={(e) => assign(b.id, e.target.value)}
                >
                  <option value="">بدون مرشد</option>
                  {guides.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3">
                {b.stage === "PENDING_APPROVAL" && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => approve(b.id, "registration")}
                    className="btn-primary !px-3 !py-1.5 text-xs"
                  >
                    <CheckCircle className="inline h-3 w-3" />
                    اعتماد التسجيل
                  </button>
                )}
                {b.pendingStage === "TRAINING" && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => approve(b.id, "transition")}
                    className="btn-primary !px-3 !py-1.5 text-xs"
                  >
                    اعتماد التدريب
                  </button>
                )}
                {b.pendingStage && b.pendingStage !== "TRAINING" && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => approve(b.id, "transition")}
                    className="btn-primary !px-3 !py-1.5 text-xs"
                  >
                    اعتماد الانتقال
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
