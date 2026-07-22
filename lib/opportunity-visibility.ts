import type { OpportunityType, Stage } from "@/generated/prisma/client";

/** O(1) per opportunity */
export function beneficiaryCanSeeOpportunity(
  stage: Stage,
  opportunityType: OpportunityType,
  opportunityId: string,
  targetedOppIds: Set<string>,
  showToAll = false
): boolean {
  if (showToAll) return true;
  if (targetedOppIds.has(opportunityId)) return true;
  if (stage === "TRAINING" && opportunityType === "TRAINING") return true;
  if (stage === "EMPLOYMENT" && opportunityType === "EMPLOYMENT") return true;
  return false;
}
