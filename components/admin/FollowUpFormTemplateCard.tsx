"use client";

type TemplateQuestion = {
  id: string;
  label: string;
  fieldType: string;
  options: string[];
  required: boolean;
  helperText: string;
};

export type FollowUpFormTemplate = {
  id: string;
  title: string;
  months: number[];
  questions: TemplateQuestion[];
};

type Props = {
  template: FollowUpFormTemplate;
  onEdit: () => void;
  onDelete: () => void;
  onPreview: () => void;
};

export default function FollowUpFormTemplateCard({
  template,
  onEdit,
  onDelete,
  onPreview,
}: Props) {
  return (
    <div className="rounded-lg border border-surface-border p-4 text-start">
      <h4 className="font-bold text-primary">{template.title}</h4>
      <p className="mt-1 text-xs text-brand-gray">
        الأشهر: {template.months.map((m) => `شهر ${m}`).join("، ")} · {template.questions.length}{" "}
        سؤال
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={onPreview} className="btn-secondary !px-3 !py-1.5 text-xs">
          معاينة
        </button>
        <button type="button" onClick={onEdit} className="btn-secondary !px-3 !py-1.5 text-xs">
          تعديل
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-danger hover:bg-dangerBg"
        >
          حذف
        </button>
      </div>
    </div>
  );
}
