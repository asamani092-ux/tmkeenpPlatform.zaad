import { Stage } from "@/generated/prisma/client";
import { STAGE_LABELS, STAGE_ORDER, getStageProgress } from "@/lib/stages";
import { Check } from "lucide-react";

type Props = {
  currentStage: Stage;
  stageEnteredAt?: Date | string | null;
};

export default function VerticalStageTimeline({ currentStage, stageEnteredAt }: Props) {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  const progress = getStageProgress(currentStage);
  const enteredLabel = stageEnteredAt
    ? new Date(stageEnteredAt).toLocaleDateString("ar-SA")
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-start">
          <h2 className="text-lg font-bold text-primary">مسار التمكين</h2>
          {enteredLabel && (
            <p className="text-xs text-brand-gray">في المرحلة الحالية منذ {enteredLabel}</p>
          )}
        </div>
        <span className="text-2xl font-bold text-primary">{progress}%</span>
      </div>

      <ol className="relative space-y-0 ps-1">
        {STAGE_ORDER.map((stage, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isLast = index === STAGE_ORDER.length - 1;

          return (
            <li key={stage} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast && (
                <span
                  className={`absolute start-[15px] top-8 h-[calc(100%-8px)] w-0.5 ${
                    isComplete ? "bg-secondary" : "bg-primary/20"
                  }`}
                  aria-hidden
                />
              )}
              <div className="relative z-10 shrink-0">
                {isComplete ? (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-red-900">
                    <Check className="h-4 w-4" />
                  </span>
                ) : (
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold ${
                      isCurrent
                        ? "border-primary bg-primary text-white"
                        : "border-primary/30 bg-surface text-brand-gray"
                    }`}
                  >
                    {index + 1}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1 pt-0.5 text-start">
                <p
                  className={`text-sm leading-snug ${
                    isCurrent
                      ? "font-bold text-primary"
                      : isComplete
                        ? "font-semibold text-primary"
                        : "text-brand-gray"
                  }`}
                >
                  {STAGE_LABELS[stage]}
                </p>
                {isCurrent && (
                  <p className="mt-0.5 text-xs font-semibold text-secondary-dark">
                    المرحلة الحالية · {progress}%
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
