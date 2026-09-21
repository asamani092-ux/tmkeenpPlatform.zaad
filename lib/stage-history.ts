import type { Prisma, Stage } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type Db = Prisma.TransactionClient | typeof prisma;

/**
 * Append one stage transition. Never updates or deletes prior rows.
 * Time O(1), Space O(1).
 */
export async function recordStageTransition(
  db: Db,
  input: {
    beneficiaryId: string;
    fromStage: Stage;
    toStage: Stage;
    note?: string;
  }
): Promise<void> {
  if (input.fromStage === input.toStage) return;
  await db.stageHistory.create({
    data: {
      beneficiaryId: input.beneficiaryId,
      fromStage: input.fromStage,
      toStage: input.toStage,
      note: input.note?.trim() || null,
    },
  });
}
