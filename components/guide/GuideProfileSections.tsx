"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { guideCopy } from "@/lib/copy/ar";
import { Save } from "lucide-react";

type TrainingCourse = { id: string; title: string; provider: string };

type Props = {
  beneficiaryId: string;
  cvContent: string;
  professionalRecommendations: string;
  selectedCourseIds: string[];
  trainingCourses: TrainingCourse[];
  onSaved?: () => void;
};

export default function GuideProfileSections({
  beneficiaryId,
  cvContent: initialCv,
  professionalRecommendations: initialRecs,
  selectedCourseIds: initialCourses,
  trainingCourses,
  onSaved,
}: Props) {
  const router = useRouter();
  const [cvContent, setCvContent] = useState(initialCv);
  const [recommendations, setRecommendations] = useState(initialRecs);
  const [selected, setSelected] = useState<Set<string>>(new Set(initialCourses));
  const [message, setMessage] = useState("");
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
    setMessage("");
    startTransition(async () => {
      const res = await fetch(`/api/beneficiaries/${beneficiaryId}/guide-profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvContent,
          professionalRecommendations: recommendations,
          selectedTrainingCourseIds: [...selected],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "فشل الحفظ");
        return;
      }
      setMessage("تم حفظ التعديلات");
      onSaved?.();
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="card-section space-y-2">
        <h4 className="font-bold text-primary">{guideCopy.cvSection}</h4>
        <textarea
          value={cvContent}
          onChange={(e) => setCvContent(e.target.value)}
          rows={5}
          className="input-field resize-none font-mono text-sm"
          placeholder="اكتب أو عدّل محتوى السيرة الذاتية..."
        />
      </div>

      <div className="card-section space-y-2">
        <h4 className="font-bold text-primary">{guideCopy.recommendationsSection}</h4>
        <textarea
          value={recommendations}
          onChange={(e) => setRecommendations(e.target.value)}
          rows={4}
          className="input-field resize-none"
          placeholder="اكتب التوصيات المهنية للمستفيد..."
        />
      </div>

      <div className="card-section space-y-2">
        <h4 className="font-bold text-primary">{guideCopy.trainingCoursesSection}</h4>
        {trainingCourses.length === 0 ? (
          <p className="text-sm text-brand-gray">لا توجد دورات تدريبية متاحة حالياً</p>
        ) : (
          <ul className="max-h-40 space-y-1 overflow-y-auto">
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

      {message && (
        <p className="rounded-lg bg-secondary/20 px-3 py-2 text-sm text-primary">{message}</p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={pending}
        className="btn-primary flex w-full items-center justify-center gap-2 !py-2 text-sm"
      >
        <Save className="h-4 w-4" />
        {pending ? "جاري الحفظ..." : guideCopy.saveProfileSections}
      </button>
    </div>
  );
}
