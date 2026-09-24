-- Automatic source monitoring for scholarship re-verification.
ALTER TABLE "Scholarship" ADD COLUMN "sourceContentHash" TEXT;
ALTER TABLE "Scholarship" ADD COLUMN "sourceLastCheckedAt" TIMESTAMP(3);
ALTER TABLE "Scholarship" ADD COLUMN "otherBenefits" TEXT;
CREATE INDEX "Scholarship_sourceLastCheckedAt_idx" ON "Scholarship"("sourceLastCheckedAt");
