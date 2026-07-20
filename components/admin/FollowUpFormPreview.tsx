"use client";

import { useState } from "react";
import FieldRow from "@/components/ui/FieldRow";

type PreviewQuestion = {
  id: string;
  label: string;
  fieldType: string;
  options: string[];
  required: boolean;
  helperText: string;
};

type Props = {
  month: number;
  questions: PreviewQuestion[];
};

/** Interactive preview — O(n) time, O(n) space for local answers */
export default function FollowUpFormPreview({ month, questions }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  function setAnswer(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  return (
    <div className="card-section space-y-3">
      <p className="font-semibold text-primary">معاينة — شهر {month}</p>
      <p className="text-xs text-brand-gray">معاينة تفاعلية — لن تُحفظ الإجابات</p>
      {questions.length === 0 ? (
        <p className="text-sm text-brand-gray">لا أسئلة بعد</p>
      ) : (
        questions.map((q) => (
          <FieldRow
            key={q.id}
            label={`${q.label}${q.required ? " *" : ""}`}
            htmlFor={`preview-${q.id}`}
            align={q.fieldType === "textarea" ? "start" : "center"}
          >
            {q.helperText && <p className="mb-1 text-xs text-brand-gray">{q.helperText}</p>}
            {q.fieldType === "textarea" ? (
              <textarea
                id={`preview-${q.id}`}
                className="input-field resize-none"
                rows={2}
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswer(q.id, e.target.value)}
              />
            ) : q.fieldType === "yes_no" || q.fieldType === "radio" ? (
              <div className="flex flex-wrap gap-4 text-sm">
                {(q.fieldType === "yes_no" ? ["نعم", "لا"] : q.options).map((o) => (
                  <label key={o} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name={`preview-${q.id}`}
                      checked={answers[q.id] === o}
                      onChange={() => setAnswer(q.id, o)}
                    />
                    {o}
                  </label>
                ))}
              </div>
            ) : q.fieldType === "select" ? (
              <select
                id={`preview-${q.id}`}
                className="input-field"
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswer(q.id, e.target.value)}
              >
                <option value="">اختر...</option>
                {q.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={`preview-${q.id}`}
                className="input-field"
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswer(q.id, e.target.value)}
              />
            )}
          </FieldRow>
        ))
      )}
    </div>
  );
}
