"use server";

import { revalidatePath } from "next/cache";
import * as platform from "@/lib/platform-service";

export type ActionResult = platform.ActionResult;

export async function registerBeneficiary(
  data: Parameters<typeof platform.registerBeneficiary>[0]
) {
  const result = await platform.registerBeneficiary(data);
  return result;
}

export async function applyToOpportunity(opportunityId: string) {
  const result = await platform.applyToOpportunity(opportunityId);
  if (result.success) revalidatePath("/dashboard/beneficiary");
  return result;
}

export async function scheduleSession(
  data: Parameters<typeof platform.scheduleSession>[0]
) {
  const result = await platform.scheduleSession(data);
  if (result.success) {
    revalidatePath("/dashboard/guide");
    revalidatePath("/dashboard/beneficiary");
  }
  return result;
}

export async function updateCareerPlan(
  data: Parameters<typeof platform.updateCareerPlan>[0]
) {
  const result = await platform.updateCareerPlan(data);
  if (result.success) {
    revalidatePath("/dashboard/guide");
    revalidatePath("/dashboard/beneficiary");
  }
  return result;
}

export async function recommendStageUpgrade(beneficiaryId: string) {
  const result = await platform.recommendStageUpgrade(beneficiaryId);
  if (result.success) {
    revalidatePath("/dashboard/guide");
    revalidatePath("/dashboard/beneficiary");
    revalidatePath("/dashboard/admin");
  }
  return result;
}

export async function createOpportunity(
  data: Parameters<typeof platform.createOpportunity>[0]
) {
  const result = await platform.createOpportunity(data);
  if (result.success) {
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/beneficiary");
  }
  return result;
}
