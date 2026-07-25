"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import FloatingModal from "@/components/admin/FloatingModal";
import DetailRow from "@/components/ui/DetailRow";
import SubmitButton from "@/components/ui/SubmitButton";
import FieldRow from "@/components/ui/FieldRow";
import { useSyncFromProps } from "@/lib/use-sync-from-props";
import { toastSuccess, toastError } from "@/lib/toast";
import { formatArDateTime } from "@/lib/datetime-local";
import { formatCountdown } from "@/lib/follow-up-program";
import {
  FOLLOW_UP_PROGRAM_STATUS_LABELS,
  FOLLOW_UP_STATUS_LABELS,
} from "@/lib/labels";
import type { FollowUpProgramStatus } from "@/generated/prisma/client";
import { Bell, Eye, ExternalLink, Pause, Play, StopCircle } from "lucide-react";

type FollowUp = {
  id: string;
  month: number;
  status: string;
  notes: string;
  answers?: Record<string, string> | null;
  submittedAt?: string | null;
  opensAt?: string | null;
  dueAt?: string | null;
  lastReminderAt?: string | null;
  beneficiary: { id: string; name: string; phone: string };
};

type EmployedBeneficiary = {
  id: string;
  name: string;
  phone?: string;
  followUpProgramStatus?: FollowUpProgramStatus | null;
  followUpPauseReason?: string | null;
  followUpEndReason?: string | null;
  followUpStatusUpdatedAt?: string | null;
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
  programStatus: FollowUpProgramStatus | null;
  pauseReason: string | null;
  endReason: string | null;
  statusUpdatedAt: string | null;
};

type ModalKind = "pause" | "end" | null;

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

function isProgramComplete(records: FollowUp[]) {
  return [1, 2, 3, 4, 5, 6].every((m) => {
    const r = records.find((x) => x.month === m);
    return r?.status === "COMPLETED";
  });
}

function latestStatusLabel(g: GroupedBeneficiary) {
  const parts: string[] = [];

  if (g.programStatus) {
    const programLabel =
      FOLLOW_UP_PROGRAM_STATUS_LABELS[g.programStatus] ?? g.programStatus;
    parts.push(programLabel);
    if (g.statusUpdatedAt) {
      parts.push(new Date(g.statusUpdatedAt).toLocaleDateString("ar-SA"));
    }
  }

  if (g.records.length > 0) {
    const sorted = [...g.records].sort((a, b) => b.month - a.month);
    const latest =
      sorted.find((r) => r.status === "COMPLETED" || r.status === "MISSED") ??
      sorted[0];
    const monthLabel =
      FOLLOW_UP_STATUS_LABELS[latest.status as keyof typeof FOLLOW_UP_STATUS_LABELS] ??
      latest.status;
    const dateStr = latest.submittedAt ?? latest.dueAt;
    if (dateStr) {
      parts.push(`${monthLabel} — ${new Date(dateStr).toLocaleDateString("ar-SA")}`);
    } else if (!g.programStatus) {
      parts.push(monthLabel);
    }
  }

  return parts.length > 0 ? parts.join(" · ") : "—";
}

function statusLabel(status: string) {
  return FOLLOW_UP_STATUS_LABELS[status as keyof typeof FOLLOW_UP_STATUS_LABELS] ?? status;
}

function formatShortDate(value?: string | null) {
  if (!value) return "—";
  return formatArDateTime(value) || "—";
}

/** Active pending month for schedule/remind UI — O(6). */
function getActivePendingRecord(records: FollowUp[]): FollowUp | null {
  const now = Date.now();
  const pending = records
    .filter((r) => r.status === "PENDING" || r.status === "MISSED")
    .sort((a, b) => a.month - b.month);
  if (pending.length === 0) return null;
  const openNow = pending.find((r) => {
    if (!r.opensAt) return true;
    return new Date(r.opensAt).getTime() <= now;
  });
  return openNow ?? pending[0];
}

function nextReminderHint(lastReminderAt?: string | null): string {
  if (!lastReminderAt) {
    return "لم يُرسل تذكير بعد — يمكن الإرسال الآن.";
  }
  const nextAt = new Date(new Date(lastReminderAt).getTime() + 24 * 60 * 60 * 1000);
  const now = new Date();
  if (nextAt.getTime() <= now.getTime()) {
    return "يمكن إرسال تذكير الآن.";
  }
  return `التذكير التالي بعد 24 ساعة من آخر تذكير (${formatCountdown(nextAt, now)}).`;
}

/** Later month completed/pending while earlier month empty or missed gap */
function monthGapMessage(records: FollowUp[]): string | null {
  for (let earlier = 1; earlier <= 5; earlier++) {
    const early = records.find((r) => r.month === earlier);
    const earlyEmpty =
      !early ||
      early.status === "PENDING" ||
      early.status === "MISSED";
    if (!earlyEmpty) continue;
    for (let later = earlier + 1; later <= 6; later++) {
      const late = records.find((r) => r.month === later);
      if (late && (late.status === "COMPLETED" || late.status === "PENDING")) {
        if (!early) {
          return `فجوة: الشهر ${earlier} بلا سجل بينما الشهر ${later} له حالة ${statusLabel(late.status)}.`;
        }
        if (early.status === "MISSED" && late.status === "COMPLETED") {
          return `تنبيه: الشهر ${earlier} فائت بينما الشهر ${later} مكتمل.`;
        }
        if (early.status === "PENDING" && late.status === "COMPLETED") {
          return `فجوة: الشهر ${earlier} ما زال معلّقاً بينما الشهر ${later} مكتمل.`;
        }
      }
    }
  }
  return null;
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
  const [modalKind, setModalKind] = useState<ModalKind>(null);
  const [modalReason, setModalReason] = useState("");
  const [endConfirm, setEndConfirm] = useState(false);
  const [pending, startTransition] = useTransition();

  const grouped = useMemo(() => {
    const meta = new Map(
      employedBeneficiaries.map((b) => [
        b.id,
        {
          programStatus: b.followUpProgramStatus ?? null,
          pauseReason: b.followUpPauseReason ?? null,
          endReason: b.followUpEndReason ?? null,
          statusUpdatedAt: b.followUpStatusUpdatedAt ?? null,
        },
      ])
    );

    const map = new Map<string, GroupedBeneficiary>();
    for (const f of followUps) {
      const id = f.beneficiary.id;
      const m = meta.get(id);
      const existing = map.get(id);
      if (existing) {
        existing.records.push(f);
      } else {
        map.set(id, {
          id,
          name: f.beneficiary.name,
          phone: f.beneficiary.phone,
          records: [f],
          programStatus: m?.programStatus ?? null,
          pauseReason: m?.pauseReason ?? null,
          endReason: m?.endReason ?? null,
          statusUpdatedAt: m?.statusUpdatedAt ?? null,
        });
      }
    }
    for (const b of employedBeneficiaries) {
      if (!map.has(b.id)) {
        const m = meta.get(b.id);
        map.set(b.id, {
          id: b.id,
          name: b.name,
          phone: b.phone ?? "—",
          records: [],
          programStatus: m?.programStatus ?? null,
          pauseReason: m?.pauseReason ?? null,
          endReason: m?.endReason ?? null,
          statusUpdatedAt: m?.statusUpdatedAt ?? null,
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
    setModalKind(null);
    setModalReason("");
    setEndConfirm(false);
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

  function runProgramAction(
    beneficiaryId: string,
    action: "pause" | "resume" | "end",
    reason?: string
  ) {
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
      const messages: Record<string, string> = {
        pause: "تم إيقاف المتابعة مؤقتاً",
        resume: "تم استئناف المتابعة",
        end: "تم إنهاء برنامج المتابعة",
      };
      toastSuccess(messages[action]);
      setModalKind(null);
      setModalReason("");
      setEndConfirm(false);
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

  function sendReminder(beneficiaryId: string) {
    startTransition(async () => {
      const res = await fetch("/api/follow-ups/remind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beneficiaryId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "فشل إرسال التذكير");
        return;
      }
      const sentAt = new Date().toISOString();
      const active = selected ? getActivePendingRecord(selected.records) : null;
      if (active) {
        setFollowUps((prev) =>
          prev.map((f) =>
            f.id === active.id ? { ...f, lastReminderAt: sentAt } : f
          )
        );
        setSelected((s) =>
          s
            ? {
                ...s,
                records: s.records.map((r) =>
                  r.id === active.id ? { ...r, lastReminderAt: sentAt } : r
                ),
              }
            : s
        );
      }
      toastSuccess("تم إرسال تذكير المتابعة للمستفيد");
      router.refresh();
    });
  }

  const canPause = selected?.programStatus === "ACTIVE";
  /** Remind when ACTIVE, or legacy null status with pending/missed months — O(6). */
  const canRemind =
    selected != null &&
    (selected.programStatus === "ACTIVE" ||
      (selected.programStatus == null &&
        selected.records.some(
          (r) => r.status === "PENDING" || r.status === "MISSED"
        )));
  const remindDisabledReason = (() => {
    if (!selected || canRemind) return null;
    if (selected.programStatus === "PAUSED") {
      return "التذكير معطّل — البرنامج متوقف مؤقتاً. استأنف المتابعة أولاً.";
    }
    if (
      selected.programStatus === "COMPLETED" ||
      selected.programStatus === "WITHDRAWN"
    ) {
      return "التذكير معطّل — البرنامج منتهٍ.";
    }
    if (selected.programStatus == null) {
      return "التذكير معطّل — لا يوجد شهر متابعة معلّق لإرسال تذكير.";
    }
    return "التذكير معطّل — البرنامج غير نشط.";
  })();
  const canResume =
    selected?.programStatus === "PAUSED" || selected?.programStatus === "COMPLETED";
  const canEnd =
    selected != null &&
    selected.programStatus !== "COMPLETED" &&
    selected.programStatus !== "WITHDRAWN";
  const activePending = selected ? getActivePendingRecord(selected.records) : null;
  const programIncomplete = selected ? !isProgramComplete(selected.records) : false;

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
              <th className="px-4 py-3 text-end">رقم الجوال</th>
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
                  <td className="px-4 py-3 text-end font-mono text-xs" dir="ltr">
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
                  <td className="px-4 py-3 text-xs">{latestStatusLabel(g)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <FloatingModal title={`متابعة: ${selected.name}`} onClose={() => setSelected(null)} wide>
          <div className="space-y-4 text-start">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <a
                href={`/dashboard/admin?tab=management&beneficiary=${selected.id}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                الانتقال إلى بيانات المستفيد
              </a>
              <div className="flex flex-col items-stretch gap-1 sm:items-end">
                <button
                  type="button"
                  onClick={() => sendReminder(selected.id)}
                  disabled={pending || !canRemind}
                  className="btn-primary inline-flex justify-center !px-4 !py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  title={
                    canRemind
                      ? "إرسال تذكير يدوي للمستفيد"
                      : (remindDisabledReason ?? "التذكير غير متاح")
                  }
                >
                  <Bell className="h-4 w-4" />
                  إعادة إرسال تذكير
                </button>
                {remindDisabledReason && (
                  <span className="text-xs text-brand-gray">{remindDisabledReason}</span>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-surface-muted px-3 py-2 text-sm">
              <span className="font-semibold text-primary">حالة البرنامج: </span>
              {selected.programStatus
                ? FOLLOW_UP_PROGRAM_STATUS_LABELS[selected.programStatus]
                : "غير مفعّل (سيُفعَّل تلقائياً عند إرسال تذكير)"}
              {selected.statusUpdatedAt && (
                <span className="ms-2 text-xs text-brand-gray">
                  ({formatArDateTime(selected.statusUpdatedAt)})
                </span>
              )}
              {selected.pauseReason && (
                <p className="mt-1 text-xs text-brand-gray">
                  سبب الإيقاف: {selected.pauseReason}
                </p>
              )}
              {selected.endReason && (
                <p className="mt-1 text-xs text-brand-gray">
                  سبب الإنهاء: {selected.endReason}
                </p>
              )}
            </div>

            {activePending && (
              <div className="rounded-lg border border-primary/25 bg-primary/5 px-3 py-3 text-sm">
                <p className="font-semibold text-primary">
                  جدول الشهر {activePending.month}
                </p>
                <ul className="mt-2 space-y-1 text-brand-gray">
                  <li>يفتح في: {formatShortDate(activePending.opensAt)}</li>
                  <li>يستحق في: {formatShortDate(activePending.dueAt)}</li>
                  <li>
                    آخر تذكير:{" "}
                    {activePending.lastReminderAt
                      ? formatArDateTime(activePending.lastReminderAt)
                      : "—"}
                  </li>
                  <li className="font-medium text-primary">
                    {nextReminderHint(activePending.lastReminderAt)}
                  </li>
                  {activePending.opensAt &&
                    new Date(activePending.opensAt).getTime() > Date.now() && (
                      <li>
                        حتى الفتح:{" "}
                        {formatCountdown(new Date(activePending.opensAt))}
                      </li>
                    )}
                </ul>
              </div>
            )}

            {monthGapMessage(selected.records) && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                {monthGapMessage(selected.records)}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-primary/5 text-primary">
                  <tr>
                    <th className="px-3 py-2 text-start">الشهر</th>
                    <th className="px-3 py-2 text-start">الحالة</th>
                    <th className="px-3 py-2 text-start">يفتح</th>
                    <th className="px-3 py-2 text-start">الاستحقاق</th>
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
                          {record ? (
                            <span
                              className={
                                record.status === "MISSED"
                                  ? "font-semibold text-red-600"
                                  : record.status === "COMPLETED"
                                    ? "font-semibold text-green-700"
                                    : undefined
                              }
                            >
                              {statusLabel(record.status)}
                            </span>
                          ) : (
                            <span className="text-brand-gray">بلا سجل</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-brand-gray">
                          {formatShortDate(record?.opensAt)}
                        </td>
                        <td className="px-3 py-2 text-xs text-brand-gray">
                          {formatShortDate(record?.dueAt)}
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
              {canPause && (
                <button
                  type="button"
                  onClick={() => {
                    setModalKind("pause");
                    setModalReason("");
                  }}
                  disabled={pending}
                  className="btn-secondary inline-flex !px-4 !py-2 text-sm"
                >
                  <Pause className="h-4 w-4" />
                  إيقاف المتابعة مؤقتاً
                </button>
              )}
              {canResume && (
                <button
                  type="button"
                  onClick={() => runProgramAction(selected.id, "resume")}
                  disabled={pending}
                  className="btn-primary inline-flex !px-4 !py-2 text-sm"
                >
                  <Play className="h-4 w-4" />
                  استئناف المتابعة
                </button>
              )}
              {canEnd && (
                <button
                  type="button"
                  onClick={() => {
                    setModalKind("end");
                    setModalReason("");
                    setEndConfirm(false);
                  }}
                  disabled={pending}
                  className="btn-primary inline-flex !px-4 !py-2 text-sm"
                >
                  <StopCircle className="h-4 w-4" />
                  إنهاء/إكمال المتابعة
                </button>
              )}
            </div>
          </div>
        </FloatingModal>
      )}

      {modalKind === "pause" && selected && (
        <FloatingModal
          title="إيقاف المتابعة مؤقتاً"
          onClose={() => setModalKind(null)}
        >
          <div className="space-y-4 text-start">
            <p className="text-sm text-brand-gray">
              يُوقف إرسال النماذج والتذكيرات مؤقتاً دون فقدان التقدم المسجّل. استخدم
              هذا عند التحقق من البيانات أو عندما لا ترغب بإرسال رسائل للمستفيد
              (مثل فترة إجازة). يمكنك استئناف المتابعة لاحقاً من نفس الشاشة.
            </p>
            <FieldRow label="سبب الإيقاف" htmlFor="pause-reason" align="start">
              <textarea
                id="pause-reason"
                value={modalReason}
                onChange={(e) => setModalReason(e.target.value)}
                rows={3}
                className="input-field resize-none"
                placeholder="مثال: إجازة المستفيد — إيقاف التذكيرات حتى العودة"
                required
              />
            </FieldRow>
            <div className="flex gap-2">
              <SubmitButton
                loading={pending}
                disabled={!modalReason.trim()}
                onClick={() => runProgramAction(selected.id, "pause", modalReason)}
                className="btn-primary flex-1 !py-2 text-sm"
              >
                تأكيد الإيقاف المؤقت
              </SubmitButton>
              <button
                type="button"
                onClick={() => setModalKind(null)}
                className="btn-secondary flex-1 !py-2 text-sm"
              >
                إلغاء
              </button>
            </div>
          </div>
        </FloatingModal>
      )}

      {modalKind === "end" && selected && (
        <FloatingModal
          title="إنهاء/إكمال المتابعة"
          onClose={() => setModalKind(null)}
        >
          <div className="space-y-4 text-start">
            <div className="rounded-lg border-2 border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              تحذير: سيتم إغلاق برنامج المتابعة رسمياً. لن تُرسل نماذج أو تذكيرات
              جديدة. يمكنك استئناف المتابعة لاحقاً إذا رغبت بذلك.
            </div>
            {programIncomplete && (
              <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
                تنبيه: لم تكتمل جميع أشهر المتابعة ({progressSummary(selected.records)}).
                الإنهاء المبكر يتطلب سبباً واضحاً وسيُشعر المستفيد بالبريد.
              </div>
            )}
            <FieldRow label="سبب الإنهاء (إلزامي)" htmlFor="end-reason" align="start">
              <textarea
                id="end-reason"
                value={modalReason}
                onChange={(e) => setModalReason(e.target.value)}
                rows={3}
                className="input-field w-full min-w-0 resize-none"
                placeholder="اذكر سبب إنهاء البرنامج..."
                required
              />
            </FieldRow>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={endConfirm}
                onChange={(e) => setEndConfirm(e.target.checked)}
              />
              أؤكد إنهاء برنامج المتابعة لهذا المستفيد
            </label>
            <div className="flex gap-2">
              <SubmitButton
                loading={pending}
                disabled={!modalReason.trim() || !endConfirm}
                onClick={() => runProgramAction(selected.id, "end", modalReason)}
                className="btn-primary flex-1 !py-2 text-sm"
              >
                تأكيد الإنهاء
              </SubmitButton>
              <button
                type="button"
                onClick={() => setModalKind(null)}
                className="btn-secondary flex-1 !py-2 text-sm"
              >
                إلغاء
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
