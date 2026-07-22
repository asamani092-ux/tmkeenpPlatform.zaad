"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { OPPORTUNITY_STATUS_LABELS } from "@/lib/labels";
import { Pencil, Trash2 } from "lucide-react";
import FieldRow from "@/components/ui/FieldRow";
import SubmitButton from "@/components/ui/SubmitButton";
import { useSyncFromProps } from "@/lib/use-sync-from-props";

type Opportunity = {
  id: string;
  type: string;
  title: string;
  provider: string;
  duration: string;
  status: string;
  requirements: string;
  salary: string | null;
  jobType: string | null;
  showToAll: boolean;
};

type Props = {
  opportunities: Opportunity[];
};

export default function AdminOpportunityList({ opportunities: initial }: Props) {
  const router = useRouter();
  const [opportunities, setOpportunities] = useSyncFromProps(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  async function handleDelete(id: string) {
    if (!confirm("حذف هذه الفرصة؟")) return;
    startTransition(async () => {
      const res = await fetch(`/api/opportunities/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "فشل الحذف");
        return;
      }
      setOpportunities((prev) => prev.filter((o) => o.id !== id));
      setMessage("تم الحذف");
      router.refresh();
    });
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await fetch(`/api/opportunities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.get("type"),
          title: form.get("title"),
          provider: form.get("provider"),
          duration: form.get("duration"),
          status: form.get("status"),
          requirements: form.get("requirements"),
          salary: form.get("salary"),
          jobType: form.get("jobType"),
          showToAll: form.get("showToAll") === "on",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "فشل التحديث");
        return;
      }
      setEditingId(null);
      setMessage("تم التحديث");
      router.refresh();
    });
  }

  return (
    <div className="card">
      {message && (
        <p className="mb-3 rounded-lg bg-secondary/20 px-3 py-2 text-sm">{message}</p>
      )}
      {opportunities.length === 0 ? (
        <p className="text-brand-gray">لا توجد فرص</p>
      ) : (
        <ul className="max-h-[32rem] space-y-3 overflow-y-auto">
          {opportunities.map((opp) => (
            <li key={opp.id} className="rounded-lg border border-surface-border p-3 text-start">
              {editingId === opp.id ? (
                <form noValidate onSubmit={(e) => handleSave(e, opp.id)} className="space-y-3">
                  <FieldRow label="نوع الفرصة" htmlFor={`type-${opp.id}`}>
                    <select id={`type-${opp.id}`} name="type" defaultValue={opp.type} className="input-field">
                      <option value="TRAINING">تدريب</option>
                      <option value="EMPLOYMENT">توظيف</option>
                    </select>
                  </FieldRow>
                  <FieldRow label="العنوان" htmlFor={`title-${opp.id}`}>
                    <input id={`title-${opp.id}`} name="title" defaultValue={opp.title} className="input-field" required />
                  </FieldRow>
                  <FieldRow label="مزود الفرصة" htmlFor={`provider-${opp.id}`}>
                    <input id={`provider-${opp.id}`} name="provider" defaultValue={opp.provider} className="input-field" required />
                  </FieldRow>
                  <FieldRow label="المدة" htmlFor={`duration-${opp.id}`}>
                    <input id={`duration-${opp.id}`} name="duration" defaultValue={opp.duration} className="input-field" required />
                  </FieldRow>
                  <FieldRow label="الشروط / المتطلبات" htmlFor={`requirements-${opp.id}`} align="start">
                    <textarea id={`requirements-${opp.id}`} name="requirements" defaultValue={opp.requirements} className="input-field resize-none" rows={2} />
                  </FieldRow>
                  <FieldRow label="الراتب (للتوظيف)" htmlFor={`salary-${opp.id}`}>
                    <input id={`salary-${opp.id}`} name="salary" defaultValue={opp.salary ?? ""} className="input-field" placeholder="اختياري" />
                  </FieldRow>
                  <FieldRow label="نوع الدوام (للتوظيف)" htmlFor={`jobType-${opp.id}`}>
                    <input id={`jobType-${opp.id}`} name="jobType" defaultValue={opp.jobType ?? ""} className="input-field" placeholder="مثال: دوام كامل" />
                  </FieldRow>
                  <FieldRow label="الحالة" htmlFor={`status-${opp.id}`}>
                    <select id={`status-${opp.id}`} name="status" defaultValue={opp.status} className="input-field" required>
                      {Object.entries(OPPORTUNITY_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </FieldRow>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-gray">
                    <input
                      type="checkbox"
                      name="showToAll"
                      defaultChecked={opp.showToAll}
                      className="shrink-0"
                    />
                    عرض لجميع المستفيدين المعتمدين
                  </label>
                  <div className="flex gap-2">
                    <SubmitButton loading={pending} className="btn-primary flex-1 !py-2 text-sm">
                      حفظ
                    </SubmitButton>
                    <button type="button" onClick={() => setEditingId(null)} className="btn-secondary flex-1 !py-2 text-sm">
                      إلغاء
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="min-w-0 flex-1 font-bold text-primary">{opp.title}</h3>
                    <div className="flex shrink-0 gap-1">
                      <button type="button" onClick={() => setEditingId(opp.id)} className="rounded p-1 text-primary hover:bg-surface-muted">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => handleDelete(opp.id)} disabled={pending} className="rounded p-1 text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-brand-gray">
                    {opp.provider} · {opp.duration} · {opp.type === "TRAINING" ? "تدريب" : "توظيف"} ·{" "}
                    <span
                      className={
                        opp.status === "متاحة"
                          ? "font-semibold text-green-700"
                          : "font-semibold text-red-700"
                      }
                    >
                      {OPPORTUNITY_STATUS_LABELS[opp.status as keyof typeof OPPORTUNITY_STATUS_LABELS] ??
                        opp.status}
                    </span>
                    {" · "}
                    {opp.showToAll ? "للجميع" : "حسب المرحلة"}
                  </p>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
