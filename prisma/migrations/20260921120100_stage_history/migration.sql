-- Cumulative stage log. Time O(1) insert; index supports timeline reads O(log n + k).
CREATE TABLE "StageHistory" (
    "id" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "fromStage" "Stage" NOT NULL,
    "toStage" "Stage" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StageHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StageHistory_beneficiaryId_createdAt_idx" ON "StageHistory"("beneficiaryId", "createdAt");

ALTER TABLE "StageHistory" ADD CONSTRAINT "StageHistory_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
