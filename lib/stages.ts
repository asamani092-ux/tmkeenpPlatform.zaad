import { Stage } from "@/generated/prisma/client";

export const STAGE_ORDER: Stage[] = [
  "PENDING_APPROVAL",
  "GUIDANCE",
  "TRAINING",
  "EMPLOYMENT",
  "FOLLOW_UP",
  "CLOSED",
];

export const STAGE_LABELS: Record<Stage, string> = {
  PENDING_APPROVAL: "تسجيل جديد يحتاج اعتماد",
  GUIDANCE: "الإرشاد",
  TRAINING: "التدريب",
  EMPLOYMENT: "التوظيف",
  FOLLOW_UP: "متابعة ما بعد التوظيف",
  CLOSED: "حالة مغلقة",
};

export function getNextStage(current: Stage): Stage | null {
  const index = STAGE_ORDER.indexOf(current);
  if (index === -1 || index >= STAGE_ORDER.length - 1) return null;
  return STAGE_ORDER[index + 1];
}

export function getStageProgress(current: Stage): number {
  const index = STAGE_ORDER.indexOf(current);
  if (index === -1) return 0;
  return Math.round(((index + 1) / STAGE_ORDER.length) * 100);
}
