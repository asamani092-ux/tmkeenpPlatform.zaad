"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import FloatingModal from "@/components/admin/FloatingModal";
import DetailRow from "@/components/ui/DetailRow";
import SubmitButton from "@/components/ui/SubmitButton";
import { useSyncFromProps } from "@/lib/use-sync-from-props";
import { toastSuccess, toastError } from "@/lib/toast";
import { FOLLOW_UP_STATUS_LABELS } from "@/lib/labels";
import { Eye, ExternalLink } from "lucide-react";

type FollowUp = {
  id: string;
  month: number;
  status: string;
  notes: string;
  answers?: Record<string, string> | null;
  submittedAt?: string | null;
  dueAt?: string | null;
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

function MonthProgress({ records }: { records: FollowUp[] }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5, 6].map((m) => {
        const r = records.find((x) => x.month === m);
        const color =
          r?.status === "COMPLETED"
            ? "bg-green-600"
            : r?.status === "MISSED"
              ? "bg-red-500"
              : r
                ? "bg-yellow-400"
                : "bg-surface-border";
        return (
          <span
            key={m}
            className={`inline-block h-2.5 w-2.5 rounded-full ${color}`}
            title={`شهر ${m}`}
          />
        );
      })}
    </div>
  );
}

function progressSummary(records: FollowUp[]) {
  const completed = records.filter((r) => r.status === "COMPLETED").length;
  return `${completed}/6 مكتمل`;
}

function latestStatusLabel(records: FollowUp[]) {
  if (records.length === 0) return "—";
  const sorted = [...records].sort((a, b) => b.month - a.month);
  const latest =
    sorted.find((r) => r.status === "COMPLETED" || r.status === "MISSED") ?? sorted[0];
  const label =
    FOLLOW_UP_STATUS_LABELS[latest.status as keyof typeof FOLLOW_UP_STATUS_LABELS] ??
    latest.status;
  const dateStr = latest.submittedAt ?? latest.dueAt;
  if (!dateStr) return label;
  return `${label} — ${new Date(dateStr).toLocaleDateString("ar-SA")}`;
}

function statusLabel(status: string) {
  return FOLLOW_UP_STATUS_LABELS[status as keyof typeof FOLLOW_UP_STATUS_LABELS] ?? status;
}

export default function AdminFollowUpPanel({
  followUps: initial,
  employedBeneficiaries,
}: Props) {
  const router = useRouter();
  const [followUps, setFollowUps] = useSyncFromProps(initial);
  const [selected, setSelected] = useState<GroupedBeneficiary | null>(null);
  const [viewAnswers, setViewAnswers] = useState<FollowUp | null>(null);
  const [answerLabels, setAnswerLabels] = useState<Record<string, string>>({});
  const [monthNotes, setMonthNotes] = useState<Record<number, string>>({});
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

  function openBeneficiaryModal(g: GroupedBeneficiary) {
    const notes: Record<number, string> = {};
    for (const r of g.records) {
      notes[r.month] = r.notes ?? "";
    }
    setMonthNotes(notes);
    setSelected(g);
  }

  async function openAnswers(record: FollowUp) {
    setViewAnswers(record);
    const res = await fetch(`/api/follow-up-form/questions?month=${record.month}`);
    const data = await res.json();
    const labels: Record<string, string> = {};
    for (const q of data.questions ?? []) {
      labels[q.id] = q.label;
    }
    setAnswerLabels(labels);
  }

  function programAction(beneficiaryId: string, action: "complete" | "withdraw") {
    let reason: string | undefined;
    if (action === "withdraw") {
      reason = window.prompt("سبب إيقاف المتابعة (اختياري):") ?? undefined;
      if (reason === null) return;
    }
    startTransition(async () => {
      const res = await fetch("/api/follow-up-program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beneficiaryId, action, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "فشل العملية");
        return;
      }
      toastSuccess(action === "complete" ? "تم إنهاء المتابعة" : "تم إيقاف المتابعة");
      setSelected(null);
      router.refresh();
    });
  }

  function saveMonthNote(record: FollowUp) {
    const notes = monthNotes[record.month] ?? "";
    startTransition(async () => {
      const res = await fetch("/api/follow-ups", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: record.id, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "فشل الحفظ");
        return;
      }
      setFollowUps((prev) =>
        prev.map((f) => (f.id === record.id ? { ...f, notes } : f))
      );
      if (selected) {
        setSelected({
          ...selected,
          records: selected.records.map((r) =>
            r.id === record.id ? { ...r, notes } : r
          ),
        });
      }
      toastSuccess("تم حفظ ملاحظات الشهر");
    });
  }

  return (
    <>
      <div className="card overflow-x-auto p-0">
        <div className="border-b border-surface-border px-6 py-4">
          <h2 className="text-xl font-bold text-primary">متابعة ما بعد التوظيف</h2>
          <p className="mt-1 text-sm text-brand-gray">
            برنامج 6 أشهر — انقر على المستفيد للتفاصيل والإجراءات
          </p>
        </div>
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-primary/5 text-primary">
            <tr>
              <th className="px-4 py-3 text-start">اسم المستفيد</th>
              <th className="px-4 py-3 text-start">رقم الجوال</th>
              <th className="px-4 py-3 text-start">حالة المتابعة (6 أشهر)</th>
              <th className="px-4 py-3 text-start">آخر حالة</th>
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
              grouped.map((g) => (
                <tr
                  key={g.id}
                  onClick={() => openBeneficiaryModal(g)}
                  className="cursor-pointer border-t border-surface-border transition hover:bg-secondary/10"
                >
                  <td className="px-4 py-3 font-medium">{g.name}</td>
                  <td className="px-4 py-3 font-mono text-xs" dir="ltr">
                    {g.phone}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-brand-gray">
                        {progressSummary(g.records)}
                      </span>
                      <MonthProgress records={g.records} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">{latestStatusLabel(g.records)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <FloatingModal title={`متابعة: ${selected.name}`} onClose={() => setSelected(null)} wide>
          <div className="space-y-4 text-start">
            <a
              href={`/dashboard/admin?tab=management&beneficiary=${selected.id}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              الانتقال إلى بيانات المستفيد
            </a>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead className="bg-primary/5 text-primary">
                  <tr>
                    <th className="px-3 py-2 text-start">الشهر</th>
                    <th className="px-3 py-2 text-start">الحالة</th>
                    <th className="px-3 py-2 text-start">عرض الإجابات</th>
                    <th className="px-3 py-2 text-start">ملاحظات الشهر</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6].map((month) => {
                    const record = selected.records.find((r) => r.month === month);
                    return (
                      <tr key={month} className="border-t border-surface-border">
                        <td className="px-3 py-2 font-medium">شهر {month}</td>
                        <td className="px-3 py-2">
                          {record ? statusLabel(record.status) : "—"}
                        </td>
                        <td className="px-3 py-2">
                          {record?.status === "COMPLETED" && record.answers ? (
                            <button
                              type="button"
                              onClick={() => openAnswers(record)}
                              className="rounded p-1 text-primary hover:bg-surface-muted"
                              title="عرض الإجابات"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          ) : (
                            <span className="text-xs text-brand-gray">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {record ? (
                            <div className="flex gap-1">
                              <input
                                className="input-field !py-1 text-xs"
                                value={monthNotes[month] ?? ""}
                                onChange={(e) =>
                                  setMonthNotes((prev) => ({
                                    ...prev,
                                    [month]: e.target.value,
                                  }))
                                }
                              />
                              <SubmitButton
                                type="button"
                                loading={pending}
                                onClick={() => saveMonthNote(record)}
                                className="btn-secondary shrink-0 !px-2 !py-1 text-xs"
                              >
                                حفظ
                              </SubmitButton>
                            </div>
                          ) : (
                            <span className="text-xs text-brand-gray">لا يوجد سجل</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-surface-border pt-4">
              <button
                type="button"
                onClick={() => programAction(selected.id, "withdraw")}
                disabled={pending}
                className="btn-secondary !px-4 !py-2 text-sm"
              >
                إيقاف المتابعة (مع حفظ التقدم)
              </button>
              <button
                type="button"
                onClick={() => programAction(selected.id, "complete")}
                disabled={pending}
                className="btn-primary !px-4 !py-2 text-sm"
              >
                إنهاء المتابعة
              </button>
            </div>
          </div>
        </FloatingModal>
      )}

      {viewAnswers && (
        <FloatingModal
          title={`إجابات — شهر ${viewAnswers.month}`}
          onClose={() => setViewAnswers(null)}
        >
          <div className="space-y-3 text-start">
            {Object.entries(viewAnswers.answers ?? {}).map(([qid, ans]) => (
              <DetailRow key={qid} label={answerLabels[qid] ?? qid} value={ans} />
            ))}
          </div>
        </FloatingModal>
      )}
    </>
  );
}
