"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import SubmitButton from "@/components/ui/SubmitButton";
import { toastSuccess, toastError } from "@/lib/toast";
import { guideCopy } from "@/lib/copy/ar";
import { Save } from "lucide-react";

type TrainingCourse = { id: string; title: string; provider: string };

type Props = {
  beneficiaryId: string;
  professionalRecommendations: string;
  selectedCourseIds: string[];
  trainingCourses: TrainingCourse[];
  onSaved?: (recommendations: string, courseIds: string[]) => void;
};

export default function GuideEvaluationsTab({
  beneficiaryId,
  professionalRecommendations: initialRecs,
  selectedCourseIds: initialCourses,
  trainingCourses,
  onSaved,
}: Props) {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState(initialRecs);
  const [selected, setSelected] = useState<Set<string>>(new Set(initialCourses));
  const [pending, startTransition] = useTransition();

  function toggleCourse(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSave() {
    const courseIds = [...selected];
    startTransition(async () => {
      const res = await fetch(`/api/beneficiaries/${beneficiaryId}/guide-profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalRecommendations: recommendations,
          selectedTrainingCourseIds: courseIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "فشل الحفظ");
        return;
      }
      toastSuccess("تم حفظ التقييم والتوصيات");
      onSaved?.(recommendations, courseIds);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="card-section space-y-2">
        <h4 className="font-bold text-primary">{guideCopy.recommendationsSection}</h4>
        <textarea
          value={recommendations}
          onChange={(e) => setRecommendations(e.target.value)}
          rows={5}
          className="input-field resize-none"
          placeholder="اكتب التوصيات المهنية للمستفيد..."
        />
      </div>

      <div className="card-section space-y-2">
        <h4 className="font-bold text-primary">{guideCopy.trainingCoursesSection}</h4>
        {trainingCourses.length === 0 ? (
          <p className="text-sm text-brand-gray">لا توجد دورات تدريبية متاحة حالياً</p>
        ) : (
          <ul className="max-h-48 space-y-1 overflow-y-auto">
            {trainingCourses.map((c) => (
              <li key={c.id}>
                <label className="flex cursor-pointer items-center justify-end gap-2 rounded px-2 py-1.5 text-sm hover:bg-surface-muted">
                  <span>
                    {c.title} — {c.provider}
                  </span>
                  <input
                    type="checkbox"
                    checked={selected.has(c.id)}
                    onChange={() => toggleCourse(c.id)}
                  />
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      <SubmitButton
        type="button"
        onClick={handleSave}
        loading={pending}
        className="btn-primary flex w-full !py-2 text-sm"
      >
        <Save className="h-4 w-4" />
        {guideCopy.saveProfileSections}
      </SubmitButton>
    </div>
  );
}
