"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import SubmitButton from "@/components/ui/SubmitButton";
import { toastSuccess, toastError } from "@/lib/toast";
import { Plus, Trash2, Eye } from "lucide-react";

type Question = {
  id: string;
  month: number;
  label: string;
  fieldType: string;
  options: string[];
  sortOrder: number;
  required: boolean;
  helperText: string;
};

const FIELD_TYPES = [
  { value: "text", label: "نص قصير" },
  { value: "textarea", label: "نص طويل" },
  { value: "yes_no", label: "نعم / لا" },
  { value: "select", label: "قائمة منسدلة" },
];

export default function FollowUpFormBuilder() {
  const router = useRouter();
  const [month, setMonth] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [preview, setPreview] = useState(false);
  const [form, setForm] = useState({
    label: "",
    fieldType: "text",
    options: "",
    required: true,
    helperText: "",
  });

  async function loadQuestions(m: number) {
    setLoading(true);
    const res = await fetch(`/api/follow-up-form/questions?month=${m}`);
    const data = await res.json();
    setQuestions(
      (data.questions ?? []).map((q: Question & { options: unknown }) => ({
        ...q,
        options: Array.isArray(q.options) ? q.options.map(String) : [],
      }))
    );
    setLoading(false);
  }

  function onMonthChange(m: number) {
    setMonth(m);
    setPreview(false);
    loadQuestions(m);
  }

  useEffect(() => {
    loadQuestions(month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.label.trim()) return;
    startTransition(async () => {
      const res = await fetch("/api/follow-up-form/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month,
          label: form.label,
          fieldType: form.fieldType,
          options: form.options
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          required: form.required,
          helperText: form.helperText,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "فشل الإضافة");
        return;
      }
      toastSuccess("تمت إضافة السؤال");
      setForm({ label: "", fieldType: "text", options: "", required: true, helperText: "" });
      await loadQuestions(month);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const res = await fetch(`/api/follow-up-form/questions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toastError("فشل الحذف");
        return;
      }
      toastSuccess("تم الحذف");
      await loadQuestions(month);
    });
  }

  const monthQuestions = questions.filter((q) => q.month === month);

  return (
    <div className="card space-y-4">
      <h3 className="text-lg font-bold text-primary">نماذج متابعة ما بعد التوظيف</h3>
      <p className="text-sm text-brand-gray">
        أنشئ أسئلة لكل شهر (1–6). يظهر للمستفيد نموذج الشهر النشط فقط.
      </p>

      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6].map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onMonthChange(m)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
              month === m ? "bg-primary text-white" : "bg-surface-muted text-brand-gray"
            }`}
          >
            شهر {m}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          className="ms-auto flex items-center gap-1 rounded-lg border border-surface-border px-3 py-1.5 text-sm"
        >
          <Eye className="h-4 w-4" />
          {preview ? "إخفاء المعاينة" : "معاينة"}
        </button>
      </div>

      {preview ? (
        <div className="card-section space-y-3">
          <p className="font-semibold text-primary">معاينة — شهر {month}</p>
          {monthQuestions.length === 0 ? (
            <p className="text-sm text-brand-gray">لا أسئلة بعد</p>
          ) : (
            monthQuestions.map((q) => (
              <div key={q.id}>
                <label className="label-field">{q.label}{q.required ? " *" : ""}</label>
                {q.helperText && <p className="mb-1 text-xs text-brand-gray">{q.helperText}</p>}
                {q.fieldType === "textarea" ? (
                  <textarea className="input-field resize-none" rows={2} disabled />
                ) : q.fieldType === "yes_no" ? (
                  <div className="flex gap-4 text-sm">
                    <span>نعم</span>
                    <span>لا</span>
                  </div>
                ) : q.fieldType === "select" ? (
                  <select className="input-field" disabled>
                    <option>اختر...</option>
                    {q.options.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                ) : (
                  <input className="input-field" disabled />
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <>
          {loading ? (
            <p className="text-sm text-brand-gray">جاري التحميل...</p>
          ) : (
            <ul className="space-y-2">
              {monthQuestions.map((q) => (
                <li
                  key={q.id}
                  className="flex items-start justify-between gap-2 rounded-lg border border-surface-border p-3 text-sm"
                >
                  <div className="min-w-0 flex-1 text-start">
                    <p className="font-semibold text-primary">{q.label}</p>
                    <p className="text-xs text-brand-gray">
                      {FIELD_TYPES.find((f) => f.value === q.fieldType)?.label}
                      {q.required ? " · مطلوب" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(q.id)}
                    disabled={pending}
                    className="shrink-0 text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleAdd} className="card-section space-y-3">
            <p className="flex items-center gap-2 font-semibold text-primary">
              <Plus className="h-4 w-4" />
              إضافة سؤال — شهر {month}
            </p>
            <input
              className="input-field"
              placeholder="نص السؤال"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              required
            />
            <select
              className="input-field"
              value={form.fieldType}
              onChange={(e) => setForm((f) => ({ ...f, fieldType: e.target.value }))}
            >
              {FIELD_TYPES.map((ft) => (
                <option key={ft.value} value={ft.value}>
                  {ft.label}
                </option>
              ))}
            </select>
            {form.fieldType === "select" && (
              <input
                className="input-field"
                placeholder="خيارات مفصولة بفاصلة"
                value={form.options}
                onChange={(e) => setForm((f) => ({ ...f, options: e.target.value }))}
              />
            )}
            <input
              className="input-field"
              placeholder="نص توضيحي (اختياري)"
              value={form.helperText}
              onChange={(e) => setForm((f) => ({ ...f, helperText: e.target.value }))}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.required}
                onChange={(e) => setForm((f) => ({ ...f, required: e.target.checked }))}
              />
              مطلوب
            </label>
            <SubmitButton loading={pending} className="btn-primary w-full !py-2 text-sm">
              إضافة السؤال
            </SubmitButton>
          </form>
        </>
      )}
    </div>
  );
}
