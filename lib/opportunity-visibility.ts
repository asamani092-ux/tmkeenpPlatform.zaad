import type { OpportunityType, Stage } from "@/generated/prisma/client";

/** O(1) per opportunity when targetedOppIds is a Set */
export function beneficiaryCanSeeOpportunity(
  stage: Stage,
  opportunityType: OpportunityType,
  opportunityId: string,
  targetedOppIds: Set<string>
): boolean {
  if (targetedOppIds.has(opportunityId)) return true;
  if (stage === "TRAINING" && opportunityType === "TRAINING") return true;
  if (stage === "EMPLOYMENT" && opportunityType === "EMPLOYMENT") return true;
  return false;
}
