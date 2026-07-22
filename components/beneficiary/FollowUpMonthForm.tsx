"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import FieldRow from "@/components/ui/FieldRow";
import SubmitButton from "@/components/ui/SubmitButton";
import FloatingModal from "@/components/admin/FloatingModal";
import { toastSuccess, toastError } from "@/lib/toast";
import { ClipboardList } from "lucide-react";

type Question = {
  id: string;
  label: string;
  fieldType: string;
  options: string[];
  required: boolean;
  helperText: string;
};

type FollowUpRecord = {
  month: number;
  status: string;
  submittedAt: string | null;
  dueAt: string | null;
};

type Props = {
  activeMonth: number | null;
  questions: Question[];
  records: FollowUpRecord[];
};

export default function FollowUpMonthForm({ activeMonth, questions, records }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!activeMonth) return;
    const openFromHash = () => {
      if (window.location.hash === `#follow-up-month-${activeMonth}`) {
        setOpen(true);
      }
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [activeMonth]);

  if (!activeMonth) {
    return (
      <section id="follow-up" className="card">
        <h2 className="mb-2 flex items-center gap-2 text-xl font-bold text-primary">
          <ClipboardList className="h-6 w-6" />
          متابعة ما بعد التوظيف
        </h2>
        <p className="text-brand-gray">انتهى برنامج المتابعة أو لم يبدأ بعد.</p>
      </section>
    );
  }

  const current = records.find((r) => r.month === activeMonth);
  if (current?.status === "COMPLETED") {
    return (
      <section id={`follow-up-month-${activeMonth}`} className="card">
        <h2 className="mb-2 text-xl font-bold text-primary">متابعة — الشهر {activeMonth}</h2>
        <p className="text-green-700">تم إرسال نموذج هذا الشهر بنجاح.</p>
      </section>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await fetch("/api/follow-up-program/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: activeMonth, answers }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "فشل الإرسال");
        return;
      }
      toastSuccess("تم إرسال النموذج بنجاح");
      setOpen(false);
      router.refresh();
    });
  }

  function openModal() {
    setOpen(true);
    if (typeof window !== "undefined") {
      window.history.replaceState(
        null,
        "",
        `#follow-up-month-${activeMonth}`
      );
    }
  }

  function closeModal() {
    setOpen(false);
    if (typeof window !== "undefined" && window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }

  return (
    <>
      <section
        id={`follow-up-month-${activeMonth}`}
        className="card border-2 border-primary/20"
      >
        <div className="flex items-start gap-3">
          <ClipboardList className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
          <div className="min-w-0 flex-1 text-start">
            <h2 className="text-lg font-bold text-primary">متابعة ما بعد التوظيف</h2>
            <button
              type="button"
              onClick={openModal}
              className="mt-3 text-start text-sm font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
            >
              نموذج متابعة لشهر {activeMonth} مطلوب الآن — انقر هنا لتعبئته
            </button>
          </div>
        </div>
      </section>

      {open && (
        <FloatingModal
          title={`متابعة ما بعد التوظيف — الشهر ${activeMonth}`}
          onClose={closeModal}
          wide
        >
          {questions.length === 0 ? (
            <p className="text-brand-gray">لم يُعدّ المدير أسئلة هذا الشهر بعد.</p>
          ) : (
            <form noValidate onSubmit={handleSubmit} className="space-y-5">
              {questions.map((q, index) => (
                <FieldRow
                  key={q.id}
                  label={`${index + 1}. ${q.label}${q.required ? " *" : ""}`}
                  variant="plain"
                  htmlFor={`fu-q-${q.id}`}
                >
                  <div className="w-full">
                    {q.helperText && (
                      <p className="mb-1.5 text-xs text-brand-gray">{q.helperText}</p>
                    )}
                    {q.fieldType === "textarea" ? (
                      <textarea
                        id={`fu-q-${q.id}`}
                        className="input-field w-full resize-none"
                        rows={3}
                        required={q.required}
                        value={answers[q.id] ?? ""}
                        onChange={(e) =>
                          setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                        }
                      />
                    ) : q.fieldType === "yes_no" ? (
                      <select
                        id={`fu-q-${q.id}`}
                        className="input-field w-full"
                        required={q.required}
                        value={answers[q.id] ?? ""}
                        onChange={(e) =>
                          setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                        }
                      >
                        <option value="">اختر...</option>
                        <option value="نعم">نعم</option>
                        <option value="لا">لا</option>
                      </select>
                    ) : q.fieldType === "select" ? (
                      <select
                        id={`fu-q-${q.id}`}
                        className="input-field w-full"
                        required={q.required}
                        value={answers[q.id] ?? ""}
                        onChange={(e) =>
                          setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                        }
                      >
                        <option value="">اختر...</option>
                        {q.options.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : q.fieldType === "radio" ? (
                      <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap">
                        {q.options.map((o) => (
                          <label
                            key={o}
                            className="flex items-center gap-2 rounded-lg border border-surface-border px-3 py-2 text-sm"
                          >
                            <input
                              type="radio"
                              name={`q-${q.id}`}
                              value={o}
                              required={q.required}
                              checked={answers[q.id] === o}
                              onChange={() =>
                                setAnswers((a) => ({ ...a, [q.id]: o }))
                              }
                            />
                            {o}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        id={`fu-q-${q.id}`}
                        className="input-field w-full"
                        required={q.required}
                        value={answers[q.id] ?? ""}
                        onChange={(e) =>
                          setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                        }
                      />
                    )}
                  </div>
                </FieldRow>
              ))}
              <SubmitButton loading={pending} className="btn-primary mt-2 w-full !py-3">
                إرسال النموذج
              </SubmitButton>
            </form>
          )}
        </FloatingModal>
      )}
    </>
  );
}
