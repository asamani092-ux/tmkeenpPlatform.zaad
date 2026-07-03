import { beneficiaryCopy } from "@/lib/copy/ar";

type CommitmentTrackerProps = {
  score: number;
  variant?: "card" | "inline";
};

export default function CommitmentTracker({
  score,
  variant = "card",
}: CommitmentTrackerProps) {
  const clamped = Math.min(100, Math.max(0, score));

  const gauge = (
    <>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="text-start">
          <h2 className="text-lg font-bold text-primary">{beneficiaryCopy.commitmentScore}</h2>
          <p className="text-xs text-brand-gray">
            يُحدَّث تراكمياً بتقييمات المرشد بعد الجلسات
          </p>
        </div>
        <span className="text-2xl font-bold text-primary">{clamped}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-gradient-to-l from-secondary to-primary transition-all"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </>
  );

  if (variant === "inline") {
    return <div className="text-start">{gauge}</div>;
  }

  return <div className="card">{gauge}</div>;
}
