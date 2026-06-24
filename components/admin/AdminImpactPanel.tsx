"use client";

import { STAGE_LABELS } from "@/lib/stages";
import type { Stage } from "@/generated/prisma/client";
import { BarChart3 } from "lucide-react";

export type ImpactStats = {
  stageDistribution: { stage: Stage; count: number }[];
  totalBeneficiaries: number;
  totalSessions: number;
  attendedSessions: number;
  avgCommitment: number;
  followUpCompleted: number;
  followUpTotal: number;
  applicationsAccepted: number;
  applicationsTotal: number;
  employedCount: number;
  periodLabel: string;
};

type Props = {
  stats: ImpactStats;
};

export default function AdminImpactPanel({ stats }: Props) {
  const sessionRate =
    stats.totalSessions > 0
      ? Math.round((stats.attendedSessions / stats.totalSessions) * 100)
      : 0;
  const followUpRate =
    stats.followUpTotal > 0
      ? Math.round((stats.followUpCompleted / stats.followUpTotal) * 100)
      : 0;
  const acceptRate =
    stats.applicationsTotal > 0
      ? Math.round((stats.applicationsAccepted / stats.applicationsTotal) * 100)
      : 0;

  return (
    <div className="card space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-start">
          <BarChart3 className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold text-primary">قياس الأثر</h2>
            <p className="text-sm text-brand-gray">{stats.periodLabel}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-surface-muted p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats.totalBeneficiaries}</p>
          <p className="text-sm text-brand-gray">المستفيدون</p>
        </div>
        <div className="rounded-lg bg-surface-muted p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats.employedCount}</p>
          <p className="text-sm text-brand-gray">في التوظيف / متابعة</p>
        </div>
        <div className="rounded-lg bg-surface-muted p-4 text-center">
          <p className="text-2xl font-bold text-primary">{sessionRate}%</p>
          <p className="text-sm text-brand-gray">حضور الجلسات</p>
        </div>
        <div className="rounded-lg bg-surface-muted p-4 text-center">
          <p className="text-2xl font-bold text-primary">{followUpRate}%</p>
          <p className="text-sm text-brand-gray">إكمال المتابعة</p>
        </div>
        <div className="rounded-lg bg-surface-muted p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats.avgCommitment.toFixed(1)}/5</p>
          <p className="text-sm text-brand-gray">متوسط التزام الجلسات</p>
        </div>
        <div className="rounded-lg bg-surface-muted p-4 text-center">
          <p className="text-2xl font-bold text-primary">{acceptRate}%</p>
          <p className="text-sm text-brand-gray">معدل قبول التقديمات</p>
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-bold text-primary">توزيع المراحل</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stats.stageDistribution.map((s) => (
            <div
              key={s.stage}
              className="rounded-lg bg-surface-muted px-4 py-3 text-center"
            >
              <p className="text-xl font-bold text-primary">{s.count}</p>
              <p className="text-sm text-brand-gray">{STAGE_LABELS[s.stage]}</p>
              <p className="mt-1 text-xs text-brand-gray">
                {stats.totalBeneficiaries > 0
                  ? `${Math.round((s.count / stats.totalBeneficiaries) * 100)}%`
                  : "0%"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
