"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import FloatingModal from "@/components/admin/FloatingModal";
import SubmitButton from "@/components/ui/SubmitButton";
import { toastSuccess, toastError } from "@/lib/toast";
import { FOLLOW_UP_STATUS_LABELS } from "@/lib/labels";
import { Plus, Trash2 } from "lucide-react";

type FollowUp = {
  id: string;
  month: number;
  status: string;
  notes: string;
  beneficiary: { id: string; name: string; phone: string };
};

type EmployedBeneficiary = {
  id: string;
  name: string;
  phone?: string;
};

type Props = {
  followUps: FollowUp[];
  employedBeneficiaries: EmployedBeneficiary[];
};

type GroupedBeneficiary = {
  id: string;
  name: string;
  phone: string;
  records: FollowUp[];
};

export default function AdminFollowUpPanel({
  followUps: initial,
  employedBeneficiaries,
}: Props) {
  const router = useRouter();
  const [followUps, setFollowUps] = useState(initial);
  const [selected, setSelected] = useState<GroupedBeneficiary | null>(null);
  const [pending, startTransition] = useTransition();

  const grouped = useMemo(() => {
    const map = new Map<string, GroupedBeneficiary>();
    for (const f of followUps) {
      const id = f.beneficiary.id;
      const existing = map.get(id);
      if (existing) {
        existing.records.push(f);
      } else {
        map.set(id, {
          id,
          name: f.beneficiary.name,
          phone: f.beneficiary.phone,
          records: [f],
        });
      }
    }
    for (const b of employedBeneficiaries) {
      if (!map.has(b.id)) {
        map.set(b.id, {
          id: b.id,
          name: b.name,
          phone: b.phone ?? "—",
          records: [],
        });
      }
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "ar"));
  }, [followUps, employedBeneficiaries]);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await fetch("/api/follow-ups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beneficiaryId: selected.id,
          month: Number(form.get("month")),
          status: form.get("status"),
          notes: form.get("notes"),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "فشل الإضافة");
        return;
      }
      toastSuccess("تم إضافة سجل المتابعة");
      router.refresh();
    });
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      const res = await fetch("/api/follow-ups", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "فشل الحذف");
        return;
      }
      setFollowUps((prev) => prev.filter((f) => f.id !== id));
      if (selected) {
        setSelected({
          ...selected,
          records: selected.records.filter((r) => r.id !== id),
        });
      }
      router.refresh();
    });
  }

  return (
    <>
      <div className="card overflow-x-auto p-0">
        <div className="border-b border-surface-border px-6 py-4">
          <h2 className="text-xl font-bold text-primary">متابعة ما بعد التوظيف</h2>
          <p className="mt-1 text-sm text-brand-gray">
            صف واحد لكل مستفيد — انقر لعرض سجل المتابعة وإضافة متابعة جديدة
          </p>
        </div>
        <table className="w-full min-w-[640px] text-right text-sm">
          <thead className="bg-primary/5 text-primary">
            <tr>
              <th className="px-4 py-3">المستفيد</th>
              <th className="px-4 py-3">الجوال</th>
              <th className="px-4 py-3">عدد المتابعات</th>
              <th className="px-4 py-3">آخر حالة</th>
            </tr>
          </thead>
          <tbody>
            {grouped.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-brand-gray">
                  لا يوجد مستفيدون في متابعة ما بعد التوظيف
                </td>
              </tr>
            ) : (
              grouped.map((g) => {
                const sorted = [...g.records].sort((a, b) => b.month - a.month);
                const latest = sorted[0];
                return (
                  <tr
                    key={g.id}
                    onClick={() => {
                      setSelected(g);
                    }}
                    className="cursor-pointer border-t border-surface-border transition hover:bg-secondary/10"
                  >
                    <td className="px-4 py-3 font-medium">{g.name}</td>
                    <td className="px-4 py-3" dir="ltr">
                      {g.phone}
                    </td>
                    <td className="px-4 py-3">{g.records.length}</td>
                    <td className="px-4 py-3">
                      {latest
                        ? FOLLOW_UP_STATUS_LABELS[
                            latest.status as keyof typeof FOLLOW_UP_STATUS_LABELS
                          ] ?? latest.status
                        : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <FloatingModal title={`متابعة: ${selected.name}`} onClose={() => setSelected(null)} wide>

          <div className="mb-6">
            <h3 className="mb-3 font-bold text-primary">سجل المتابعات</h3>
            {selected.records.length === 0 ? (
              <p className="text-sm text-brand-gray">لا توجد متابعات مسجّلة بعد</p>
            ) : (
              <ul className="max-h-48 space-y-2 overflow-y-auto">
                {[...selected.records]
                  .sort((a, b) => b.month - a.month)
                  .map((f) => (
                    <li
                      key={f.id}
                      className="flex items-start justify-between gap-2 rounded-lg border border-surface-border p-3 text-sm"
                    >
                      <button
                        type="button"
                        onClick={() => handleDelete(f.id)}
                        disabled={pending}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="flex-1 text-right">
                        <p className="font-semibold text-primary">شهر {f.month}</p>
                        <p className="text-brand-gray">
                          {FOLLOW_UP_STATUS_LABELS[
                            f.status as keyof typeof FOLLOW_UP_STATUS_LABELS
                          ] ?? f.status}
                        </p>
                        {f.notes && <p className="mt-1 text-brand-gray">{f.notes}</p>}
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <form onSubmit={handleAdd} className="space-y-3 border-t border-surface-border pt-4">
            <h3 className="flex items-center justify-end gap-2 font-bold text-primary">
              <Plus className="h-4 w-4" />
              إضافة متابعة جديدة
            </h3>
            <select name="month" required className="input-field">
              <option value="1">شهر 1</option>
              <option value="3">شهر 3</option>
              <option value="6">شهر 6</option>
            </select>
            <select name="status" defaultValue="PENDING" className="input-field">
              <option value="PENDING">قيد الانتظار</option>
              <option value="COMPLETED">مكتمل</option>
              <option value="MISSED">فائت</option>
            </select>
            <textarea
              name="notes"
              rows={2}
              className="input-field resize-none"
              placeholder="ملاحظات"
            />
            <SubmitButton loading={pending} className="btn-primary w-full !py-2 text-sm">
              إضافة المتابعة
            </SubmitButton>
          </form>
        </FloatingModal>
      )}
    </>
  );
}
