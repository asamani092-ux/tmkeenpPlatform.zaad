-- Hot-path indexes for frequently filtered columns (audit fix)

-- CreateIndex
CREATE INDEX "User_guideId_idx" ON "User"("guideId");

-- CreateIndex
CREATE INDEX "User_role_stage_idx" ON "User"("role", "stage");

-- CreateIndex
CREATE INDEX "InAppNotification_userId_isRead_idx" ON "InAppNotification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Note_beneficiaryId_idx" ON "Note"("beneficiaryId");

-- CreateIndex
CREATE INDEX "Note_guideId_idx" ON "Note"("guideId");

-- CreateIndex
CREATE INDEX "Session_beneficiaryId_idx" ON "Session"("beneficiaryId");

-- CreateIndex
CREATE INDEX "Session_guideId_idx" ON "Session"("guideId");

-- CreateIndex
CREATE INDEX "Task_beneficiaryId_idx" ON "Task"("beneficiaryId");

-- CreateIndex
CREATE INDEX "Task_guideId_idx" ON "Task"("guideId");

-- CreateIndex
CREATE INDEX "Application_opportunityId_idx" ON "Application"("opportunityId");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");
