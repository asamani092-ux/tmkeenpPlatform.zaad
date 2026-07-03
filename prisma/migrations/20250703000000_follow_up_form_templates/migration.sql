-- CreateTable
CREATE TABLE "FollowUpFormTemplate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "months" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FollowUpFormTemplate_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "FollowUpFormQuestion" ADD COLUMN "formId" TEXT;

-- CreateIndex
CREATE INDEX "FollowUpFormQuestion_formId_sortOrder_idx" ON "FollowUpFormQuestion"("formId", "sortOrder");

-- AddForeignKey
ALTER TABLE "FollowUpFormQuestion" ADD CONSTRAINT "FollowUpFormQuestion_formId_fkey" FOREIGN KEY ("formId") REFERENCES "FollowUpFormTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: one template per month that has questions
INSERT INTO "FollowUpFormTemplate" ("id", "title", "months", "createdAt", "updatedAt")
SELECT
    'backfill-template-month-' || m::text,
    'نموذج شهر ' || m::text,
    jsonb_build_array(m),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM generate_series(1, 6) AS m
WHERE EXISTS (
    SELECT 1 FROM "FollowUpFormQuestion" q WHERE q."month" = m
);

UPDATE "FollowUpFormQuestion" q
SET "formId" = 'backfill-template-month-' || q."month"::text
WHERE q."formId" IS NULL;
