import { beneficiaryCopy } from "@/lib/copy/ar";

type CommitmentTrackerProps = {
  score: number;
};

export default function CommitmentTracker({ score }: CommitmentTrackerProps) {
  const clamped = Math.min(100, Math.max(0, score));

  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-primary">{clamped}</span>
        <h2 className="text-lg font-bold text-primary">{beneficiaryCopy.commitmentScore}</h2>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-gradient-to-l from-secondary to-primary transition-all"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-brand-gray">
        يُحدَّث تراكمياً بتقييمات المرشد بعد الجلسات
      </p>
    </div>
  );
}
