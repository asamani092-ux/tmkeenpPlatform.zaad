import { Stage } from "@/generated/prisma/client";
import { STAGE_LABELS, STAGE_ORDER, getStageProgress } from "@/lib/stages";
import { Check } from "lucide-react";

type Props = {
  currentStage: Stage;
  stageEnteredAt?: Date | string | null;
};

function StageDot({
  index,
  isComplete,
  isCurrent,
}: {
  index: number;
  isComplete: boolean;
  isCurrent: boolean;
}) {
  if (isComplete) {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-red-900">
        <Check className="h-3.5 w-3.5" />
      </span>
    );
  }
  return (
    <span
      className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-bold ${
        isCurrent
          ? "border-primary bg-primary text-white"
          : "border-primary/30 bg-transparent text-brand-gray"
      }`}
    >
      {index + 1}
    </span>
  );
}

export default function VerticalStageTimeline({ currentStage, stageEnteredAt }: Props) {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  const progress = getStageProgress(currentStage);
  const enteredLabel = stageEnteredAt
    ? new Date(stageEnteredAt).toLocaleDateString("ar-SA")
    : null;

  return (
    <section className="w-full bg-transparent p-0 lg:max-w-[16.5rem]">
      <div className="mb-3 text-start">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-bold text-primary">مسار المرحلة</h2>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
            {progress}%
          </span>
        </div>
        {enteredLabel && (
          <p className="mt-1 text-[11px] text-brand-gray">في المرحلة الحالية منذ {enteredLabel}</p>
        )}
      </div>

      {/* Mobile: fixed horizontal row — no scroll; tighter gaps on small widths */}
      <ol className="flex w-full items-start justify-between gap-0 lg:hidden">
        {STAGE_ORDER.map((stage, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isLast = index === STAGE_ORDER.length - 1;

          return (
            <li
              key={`h-${stage}`}
              className="relative flex min-w-0 flex-1 flex-col items-center px-0.5 text-center"
            >
              {!isLast && (
                <span
                  className={`absolute start-1/2 top-[11px] h-0.5 w-full ${
                    isComplete ? "bg-secondary" : "bg-primary/20"
                  }`}
                  aria-hidden
                />
              )}
              <div className="relative z-10 mb-1 scale-90 sm:mb-1.5 sm:scale-100">
                <StageDot index={index} isComplete={isComplete} isCurrent={isCurrent} />
              </div>
              <p
                className={`w-full truncate text-[9px] leading-tight sm:text-[11px] ${
                  isCurrent
                    ? "font-bold text-primary"
                    : isComplete
                      ? "font-semibold text-primary"
                      : "text-brand-gray"
                }`}
                title={STAGE_LABELS[stage]}
              >
                {STAGE_LABELS[stage]}
              </p>
              {isCurrent && (
                <p className="mt-0.5 text-[9px] font-semibold text-secondary-dark sm:text-[10px]">
                  الحالية
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {/* Desktop: vertical beside profile */}
      <ol className="relative hidden space-y-0 ps-0.5 lg:block">
        {STAGE_ORDER.map((stage, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isLast = index === STAGE_ORDER.length - 1;

          return (
            <li key={`v-${stage}`} className="relative flex gap-3 pb-4 last:pb-0">
              {!isLast && (
                <span
                  className={`absolute start-[13px] top-7 h-[calc(100%-6px)] w-0.5 ${
                    isComplete ? "bg-secondary" : "bg-primary/20"
                  }`}
                  aria-hidden
                />
              )}
              <div className="relative z-10 shrink-0">
                <StageDot index={index} isComplete={isComplete} isCurrent={isCurrent} />
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
                  <p className="mt-0.5 text-xs font-semibold text-secondary-dark">المرحلة الحالية</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
