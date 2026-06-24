import { Stage } from "@/generated/prisma/client";
import { STAGE_LABELS, STAGE_ORDER, getStageProgress } from "@/lib/stages";
import { Check } from "lucide-react";

type StageProgressProps = {
  currentStage: Stage;
  stageEnteredAt?: Date | string | null;
};

export default function StageProgress({ currentStage, stageEnteredAt }: StageProgressProps) {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  const progress = getStageProgress(currentStage);
  const enteredLabel = stageEnteredAt
    ? new Date(stageEnteredAt).toLocaleDateString("ar-SA")
    : null;

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-primary">{progress}%</span>
        <div className="text-start">
          <h2 className="text-lg font-bold text-primary">مسار التمكين</h2>
          {enteredLabel && (
            <p className="text-xs text-brand-gray">في المرحلة الحالية منذ {enteredLabel}</p>
          )}
        </div>
      </div>

      <div className="mb-6 h-3 overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-gradient-to-l from-secondary to-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {STAGE_ORDER.map((stage, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <li
              key={stage}
              className={`rounded-lg border px-3 py-3 text-center text-sm transition ${
                isCurrent
                  ? "border-primary bg-primary/5 font-bold text-primary"
                  : isComplete
                    ? "border-secondary/50 bg-secondary/10 text-primary-dark"
                    : "border-surface-border bg-surface-muted text-brand-gray"
              }`}
            >
              <div className="mb-1 flex justify-center">
                {isComplete ? (
                  <Check className="h-4 w-4 text-secondary-dark" />
                ) : (
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                      isCurrent
                        ? "bg-primary text-white"
                        : "bg-surface-border text-brand-gray"
                    }`}
                  >
                    {index + 1}
                  </span>
                )}
              </div>
              {STAGE_LABELS[stage]}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
