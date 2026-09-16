-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notifyOnRegistration" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_role_isActive_notifyOnRegistration_idx" ON "User"("role", "isActive", "notifyOnRegistration");
