"use client";

import { useState, useTransition } from "react";
import FloatingModal from "@/components/admin/FloatingModal";
import FieldRow from "@/components/ui/FieldRow";
import SubmitButton from "@/components/ui/SubmitButton";
import OptionsListEditor from "@/components/admin/OptionsListEditor";
import { toastSuccess, toastError } from "@/lib/toast";
import { Plus, Trash2 } from "lucide-react";
import type { FollowUpFormTemplate } from "@/components/admin/FollowUpFormTemplateCard";

const FIELD_TYPES = [
  { value: "text", label: "نص قصير" },
  { value: "textarea", label: "نص طويل" },
  { value: "yes_no", label: "نعم / لا" },
  { value: "select", label: "خيار متعدد" },
];

type DraftQuestion = {
  label: string;
  fieldType: string;
  options: string[];
  required: boolean;
  helperText: string;
};

type Props = {
  mode: "create" | "edit";
  initial?: FollowUpFormTemplate;
  onClose: () => void;
  onSaved: () => void;
};

export default function FollowUpFormTemplateModal({
  mode,
  initial,
  onClose,
  onSaved,
}: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [months, setMonths] = useState<number[]>(initial?.months ?? []);
  const [questions, setQuestions] = useState<DraftQuestion[]>(
    initial?.questions.map((q) => ({
      label: q.label,
      fieldType: q.fieldType,
      options: q.options.length > 0 ? q.options : [""],
      required: q.required,
      helperText: q.helperText,
    })) ?? []
  );
  const [draft, setDraft] = useState<DraftQuestion>({
    label: "",
    fieldType: "text",
    options: [""],
    required: true,
    helperText: "",
  });
  const [pending, startTransition] = useTransition();

  function toggleMonth(m: number) {
    setMonths((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m].sort((a, b) => a - b)
    );
  }

  function addQuestion() {
    if (!draft.label.trim()) return;
    const options = draft.fieldType === "select"
      ? draft.options.map((s) => s.trim()).filter(Boolean)
      : [];
    setQuestions((prev) => [
      ...prev,
      { ...draft, label: draft.label.trim(), options },
    ]);
    setDraft({ label: "", fieldType: "text", options: [""], required: true, helperText: "" });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || months.length === 0) {
      toastError("العنوان والأشهر مطلوبة");
      return;
    }

    const payload = {
      title: title.trim(),
      months,
      questions: questions.map((q) => ({
        label: q.label,
        fieldType: q.fieldType,
        options:
          q.fieldType === "select"
            ? q.options.map((s) => s.trim()).filter(Boolean)
            : [],
        required: q.required,
        helperText: q.helperText,
      })),
    };

    startTransition(async () => {
      const url =
        mode === "edit" && initial
          ? `/api/follow-up-form/templates/${initial.id}`
          : "/api/follow-up-form/templates";
      const res = await fetch(url, {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "فشل الحفظ");
        return;
      }
      toastSuccess(mode === "edit" ? "تم تحديث النموذج" : "تم إنشاء النموذج");
      onSaved();
      onClose();
    });
  }

  return (
    <FloatingModal
      title={mode === "edit" ? "تعديل نموذج المتابعة" : "نموذج متابعة جديد"}
      onClose={onClose}
      wide
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-4 text-start">
        <FieldRow label="عنوان النموذج" htmlFor="template-title">
          <input
            id="template-title"
            className="input-field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </FieldRow>

        <div>
          <p className="label-field">الأشهر المرتبطة</p>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((m) => (
              <label
                key={m}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${
                  months.includes(m)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-surface-border text-brand-gray"
                }`}
              >
                <input
                  type="checkbox"
                  checked={months.includes(m)}
                  onChange={() => toggleMonth(m)}
                  className="shrink-0"
                />
                شهر {m}
              </label>
            ))}
          </div>
        </div>

        <div className="card-section space-y-2">
          <p className="font-semibold text-primary">الأسئلة ({questions.length})</p>
          {questions.map((q, i) => (
            <div
              key={`${q.label}-${i}`}
              className="flex items-start justify-between gap-2 rounded-lg border border-surface-border p-2 text-sm"
            >
              <div>
                <p className="font-medium text-primary">{q.label}</p>
                <p className="text-xs text-brand-gray">
                  {FIELD_TYPES.find((f) => f.value === q.fieldType)?.label}
                  {q.fieldType === "select" && q.options.length > 0
                    ? ` · ${q.options.join(" | ")}`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuestions((prev) => prev.filter((_, idx) => idx !== i))}
                className="btn-danger-ghost !min-h-0"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          <div className="space-y-2 border-t border-surface-border pt-3">
            <p className="flex items-center gap-1 text-sm font-semibold text-primary">
              <Plus className="h-4 w-4" />
              إضافة سؤال
            </p>
            <input
              className="input-field"
              placeholder="نص السؤال"
              value={draft.label}
              onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
            />
            <select
              className="input-field"
              value={draft.fieldType}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  fieldType: e.target.value,
                  options: e.target.value === "select" ? d.options : [""],
                }))
              }
            >
              {FIELD_TYPES.map((ft) => (
                <option key={ft.value} value={ft.value}>
                  {ft.label}
                </option>
              ))}
            </select>
            {draft.fieldType === "select" && (
              <OptionsListEditor
                options={draft.options}
                onChange={(options) => setDraft((d) => ({ ...d, options }))}
              />
            )}
            <input
              className="input-field"
              placeholder="نص توضيحي (اختياري)"
              value={draft.helperText}
              onChange={(e) => setDraft((d) => ({ ...d, helperText: e.target.value }))}
            />
            <button type="button" onClick={addQuestion} className="btn-secondary w-full !py-2 text-sm">
              إضافة للقائمة
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <SubmitButton loading={pending} className="btn-primary flex-1 !py-2 text-sm">
            {mode === "edit" ? "حفظ التعديلات" : "حفظ النموذج"}
          </SubmitButton>
          <button type="button" onClick={onClose} className="btn-secondary flex-1 !py-2 text-sm">
            إلغاء
          </button>
        </div>
      </form>
    </FloatingModal>
  );
}
