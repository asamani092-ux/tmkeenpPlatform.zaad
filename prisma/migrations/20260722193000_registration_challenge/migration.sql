-- CreateTable
CREATE TABLE "RegistrationChallenge" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistrationChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RegistrationChallenge_email_idx" ON "RegistrationChallenge"("email");
