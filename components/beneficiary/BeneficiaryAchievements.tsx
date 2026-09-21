import { STAGE_LABELS } from "@/lib/stages";
import type { Stage } from "@/generated/prisma/client";
import { Award } from "lucide-react";

type StageRow = {
  id: string;
  fromStage: Stage;
  toStage: Stage;
  note: string | null;
  createdAt: string;
};

type CompletedRow = {
  id: string;
  title: string;
  type: string;
  completedAt: string | null;
};

type Props = {
  stages: StageRow[];
  completed: CompletedRow[];
};

/** Achievements timeline. Render O(n), no mutation. */
export default function BeneficiaryAchievements({ stages, completed }: Props) {
  if (stages.length === 0 && completed.length === 0) return null;

  return (
    <section className="card text-start" aria-label="إنجازاتي">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-primary">
        <Award className="h-6 w-6 shrink-0" />
        إنجازاتي
      </h2>
      {stages.length > 0 && (
        <ol className="space-y-3">
          {stages.map((row) => (
            <li key={row.id} className="rounded-lg bg-surface-muted px-4 py-3 text-sm">
              <p className="font-semibold text-primary">
                من {STAGE_LABELS[row.fromStage]} إلى {STAGE_LABELS[row.toStage]}
              </p>
              <p className="text-brand-gray">
                {row.note ? `${row.note} · ` : ""}
                {row.createdAt}
              </p>
            </li>
          ))}
        </ol>
      )}
      {completed.length > 0 && (
        <ul className="mt-4 space-y-2">
          {completed.map((item) => (
            <li key={item.id} className="rounded-lg border border-surface-border px-4 py-3 text-sm">
              <span className="font-semibold text-primary">{item.title}</span>
              <span className="text-brand-gray">
                {" "}
                — {item.type === "TRAINING" ? "تدريب مكتمل" : "فرصة مكتملة"}
                {item.completedAt ? ` · ${item.completedAt}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
