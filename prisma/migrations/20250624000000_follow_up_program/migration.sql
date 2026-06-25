-- CreateEnum
CREATE TYPE "FollowUpProgramStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'WITHDRAWN');

-- AlterTable User
ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "followUpProgramStatus" "FollowUpProgramStatus";
ALTER TABLE "User" ADD COLUMN "followUpProgramStartedAt" TIMESTAMP(3);

-- AlterTable FollowUp
ALTER TABLE "FollowUp" ADD COLUMN "answers" JSONB;
ALTER TABLE "FollowUp" ADD COLUMN "opensAt" TIMESTAMP(3);
ALTER TABLE "FollowUp" ADD COLUMN "dueAt" TIMESTAMP(3);
ALTER TABLE "FollowUp" ADD COLUMN "submittedAt" TIMESTAMP(3);
ALTER TABLE "FollowUp" ADD COLUMN "lastReminderAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "FollowUpFormQuestion" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "fieldType" TEXT NOT NULL DEFAULT 'text',
    "options" JSONB NOT NULL DEFAULT '[]',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "helperText" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FollowUpFormQuestion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FollowUpFormQuestion_month_sortOrder_idx" ON "FollowUpFormQuestion"("month", "sortOrder");
