import { ApplicationStatus, FollowUpStatus, SessionStatus } from "@/generated/prisma/client";

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  SCHEDULED: "مجدولة",
  ATTENDED: "حضر",
  MISSED: "غاب",
  COMPLETED: "مكتملة",
  CANCELED: "ملغاة",
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: "قيد الانتظار",
  ACCEPTED: "مقبول",
  REJECTED: "مرفوض",
};

export const FOLLOW_UP_STATUS_LABELS: Record<FollowUpStatus, string> = {
  PENDING: "قيد الانتظار",
  COMPLETED: "مكتمل",
  MISSED: "فائت",
};

export const OPPORTUNITY_STATUS = ["متاحة", "مغلقة"] as const;

export const OPPORTUNITY_STATUS_LABELS: Record<(typeof OPPORTUNITY_STATUS)[number], string> = {
  متاحة: "متاحة",
  مغلقة: "مغلقة",
};

export const OPPORTUNITY_STATUS_OPTIONS = ["متاحة", "مغلقة"] as const;
export type OpportunityStatusOption = (typeof OPPORTUNITY_STATUS_OPTIONS)[number];
