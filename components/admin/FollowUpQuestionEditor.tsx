"use client";

import { useState } from "react";
import FieldRow from "@/components/ui/FieldRow";
import SubmitButton from "@/components/ui/SubmitButton";
import OptionsListEditor from "@/components/admin/OptionsListEditor";

export type FollowUpQuestionDraft = {
  label: string;
  fieldType: string;
  options: string[];
  required: boolean;
  helperText: string;
};

type Props = {
  month: number;
  initial?: FollowUpQuestionDraft;
  loading?: boolean;
  submitLabel: string;
  onSubmit: (draft: FollowUpQuestionDraft) => void;
  onCancel?: () => void;
};

const FIELD_TYPES = [
  { value: "text", label: "نص قصير" },
  { value: "textarea", label: "نص طويل" },
  { value: "yes_no", label: "نعم / لا" },
  { value: "select", label: "قائمة منسدلة" },
  { value: "radio", label: "اختيار واحد" },
];

export default function FollowUpQuestionEditor({
  month,
  initial,
  loading = false,
  submitLabel,
  onSubmit,
  onCancel,
}: Props) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [fieldType, setFieldType] = useState(initial?.fieldType ?? "text");
  const [options, setOptions] = useState<string[]>(
    initial?.options?.length ? initial.options : [""]
  );
  const [required, setRequired] = useState(initial?.required ?? true);
  const [helperText, setHelperText] = useState(initial?.helperText ?? "");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit({
      label: label.trim(),
      fieldType,
      options:
        fieldType === "select" || fieldType === "radio"
          ? options.map((s) => s.trim()).filter(Boolean)
          : [],
      required,
      helperText: helperText.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card-section space-y-3">
      <p className="font-semibold text-primary">
        {initial ? "تعديل سؤال" : "إضافة سؤال"} — شهر {month}
      </p>
      <FieldRow label="نص السؤال" htmlFor="question-label">
        <input
          id="question-label"
          className="input-field"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
        />
      </FieldRow>
      <FieldRow label="نوع الحقل" htmlFor="question-fieldType">
        <select
          id="question-fieldType"
          className="input-field"
          value={fieldType}
          onChange={(e) => {
            const next = e.target.value;
            setFieldType(next);
            if (next !== "select" && next !== "radio") setOptions([""]);
          }}
        >
          {FIELD_TYPES.map((ft) => (
            <option key={ft.value} value={ft.value}>
              {ft.label}
            </option>
          ))}
        </select>
      </FieldRow>
      {(fieldType === "select" || fieldType === "radio") && (
        <FieldRow label="خيارات الإجابة" htmlFor="question-options-0">
          <OptionsListEditor options={options} onChange={setOptions} />
        </FieldRow>
      )}
      <FieldRow label="نص توضيحي (اختياري)" htmlFor="question-helperText">
        <input
          id="question-helperText"
          className="input-field"
          value={helperText}
          onChange={(e) => setHelperText(e.target.value)}
        />
      </FieldRow>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={required}
          onChange={(e) => setRequired(e.target.checked)}
        />
        مطلوب
      </label>
      <div className="flex gap-2">
        <SubmitButton loading={loading} className="btn-primary flex-1 !py-2 text-sm">
          {submitLabel}
        </SubmitButton>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary flex-1 !py-2 text-sm">
            إلغاء
          </button>
        )}
      </div>
    </form>
  );
}
