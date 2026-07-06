"use client";

import { Plus, Trash2 } from "lucide-react";

type Props = {
  options: string[];
  onChange: (options: string[]) => void;
  placeholder?: string;
};

/** Dynamic options list — O(n) time, O(n) space */
export default function OptionsListEditor({
  options,
  onChange,
  placeholder = "نص الخيار",
}: Props) {
  function updateAt(index: number, value: string) {
    const next = [...options];
    next[index] = value;
    onChange(next);
  }

  function removeAt(index: number) {
    onChange(options.filter((_, i) => i !== index));
  }

  function addRow() {
    onChange([...options, ""]);
  }

  const rows = options.length > 0 ? options : [""];

  return (
    <div className="space-y-2">
      {rows.map((opt, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            className="input-field flex-1"
            value={opt}
            placeholder={`${placeholder} ${index + 1}`}
            onChange={(e) => updateAt(index, e.target.value)}
          />
          {rows.length > 1 && (
            <button
              type="button"
              onClick={() => removeAt(index)}
                className="shrink-0 text-danger"
              aria-label="حذف الخيار"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={addRow} className="btn-secondary flex w-full items-center justify-center gap-1 !py-2 text-sm">
        <Plus className="h-4 w-4" />
        إضافة خيار
      </button>
    </div>
  );
}
