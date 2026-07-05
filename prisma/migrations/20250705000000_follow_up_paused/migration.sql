-- AlterEnum
ALTER TYPE "FollowUpProgramStatus" ADD VALUE 'PAUSED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN "followUpPauseReason" TEXT,
ADD COLUMN "followUpEndReason" TEXT,
ADD COLUMN "followUpStatusUpdatedAt" TIMESTAMP(3);
