-- Phase 1 data foundation. Applied to project ojnibypshpsgiqbvgqzi on 27 Sep 2026 via the Supabase connector.
-- (Identical to the applied migration "phase1_data_foundation"; kept here for version control.)
CREATE TYPE "RecordVerification" AS ENUM ('VERIFIED', 'PARTIALLY_VERIFIED', 'NEEDS_REVIEW', 'EXPIRED', 'UNKNOWN');
CREATE TYPE "DataSourceType" AS ENUM ('OFFICIAL_API', 'OFFICIAL_DATASET', 'OFFICIAL_WEBSITE', 'GOVERNMENT', 'SCHOLARSHIP_PROVIDER', 'APPROVED_SECONDARY', 'MANUAL');
CREATE TYPE "DataSourceStatus" AS ENUM ('ACTIVE', 'PLANNED', 'PAUSED', 'ERROR', 'BLOCKED_LICENSE');
CREATE TYPE "CommercialUse" AS ENUM ('ALLOWED', 'NEEDS_PERMISSION', 'NOT_ALLOWED', 'UNKNOWN');
CREATE TYPE "SyncFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'MANUAL');
CREATE TABLE "DataSource" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "sourceType" "DataSourceType" NOT NULL, "apiUrl" TEXT, "websiteUrl" TEXT NOT NULL, "license" TEXT, "attribution" TEXT, "commercialUse" "CommercialUse" NOT NULL DEFAULT 'UNKNOWN', "coverage" TEXT, "providesFields" TEXT[], "syncFrequency" "SyncFrequency" NOT NULL DEFAULT 'MANUAL', "lastSyncAt" TIMESTAMP(3), "status" "DataSourceStatus" NOT NULL DEFAULT 'PLANNED', "lastError" TEXT, "notes" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "DataSource_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Program" ("id" TEXT NOT NULL, "universityId" TEXT NOT NULL, "name" TEXT NOT NULL, "slug" TEXT NOT NULL, "degreeLevel" "DegreeLevel" NOT NULL, "subjects" TEXT[], "languages" TEXT[], "durationMonths" INTEGER, "tuitionAmount" DECIMAL(12,2), "tuitionCurrency" CHAR(3), "tuitionPeriod" TEXT, "tuitionAppliesTo" TEXT, "intakes" TEXT[], "applicationFeeText" TEXT, "englishRequirementText" TEXT, "ieltsMin" DECIMAL(3,1), "toeflMin" INTEGER, "gpaRequirementText" TEXT, "officialUrl" TEXT NOT NULL, "applicationUrl" TEXT, "sourceId" TEXT, "sourceUrl" TEXT NOT NULL, "verificationStatus" "RecordVerification" NOT NULL DEFAULT 'NEEDS_REVIEW', "lastVerifiedAt" TIMESTAMP(3), "lastCheckedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Program_pkey" PRIMARY KEY ("id"), CONSTRAINT "Program_https" CHECK ("officialUrl" LIKE 'https://%' AND "sourceUrl" LIKE 'https://%' AND ("applicationUrl" IS NULL OR "applicationUrl" LIKE 'https://%')), CONSTRAINT "Program_ielts_range" CHECK ("ieltsMin" IS NULL OR ("ieltsMin" BETWEEN 0 AND 9)), CONSTRAINT "Program_verified_has_date" CHECK ("verificationStatus" <> 'VERIFIED' OR "lastVerifiedAt" IS NOT NULL));
CREATE UNIQUE INDEX "Program_universityId_slug_key" ON "Program"("universityId", "slug");
CREATE INDEX "Program_degreeLevel_idx" ON "Program"("degreeLevel");
CREATE INDEX "Program_verificationStatus_idx" ON "Program"("verificationStatus");
CREATE TABLE "ProgramDeadline" ("id" TEXT NOT NULL, "programId" TEXT NOT NULL, "intake" TEXT NOT NULL, "label" TEXT NOT NULL, "applicantGroup" TEXT NOT NULL DEFAULT 'ALL', "deadline" TIMESTAMP(3) NOT NULL, "deadlineTimeText" TEXT, "sourceUrl" TEXT NOT NULL, "lastVerifiedAt" TIMESTAMP(3) NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ProgramDeadline_pkey" PRIMARY KEY ("id"));
CREATE INDEX "ProgramDeadline_programId_idx" ON "ProgramDeadline"("programId");
CREATE INDEX "ProgramDeadline_deadline_idx" ON "ProgramDeadline"("deadline");
CREATE TABLE "RecordChange" ("id" TEXT NOT NULL, "entityType" TEXT NOT NULL, "entityId" TEXT NOT NULL, "field" TEXT NOT NULL, "oldValue" TEXT, "newValue" TEXT, "sourceId" TEXT, "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "reviewedAt" TIMESTAMP(3), "actor" TEXT NOT NULL, CONSTRAINT "RecordChange_pkey" PRIMARY KEY ("id"));
CREATE INDEX "RecordChange_entity_idx" ON "RecordChange"("entityType", "entityId", "detectedAt");
ALTER TABLE "Scholarship" ADD COLUMN "sourceId" TEXT;
ALTER TABLE "University" ADD COLUMN "sourceId" TEXT;
ALTER TABLE "Program" ADD CONSTRAINT "Program_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Program" ADD CONSTRAINT "Program_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProgramDeadline" ADD CONSTRAINT "ProgramDeadline_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecordChange" ADD CONSTRAINT "RecordChange_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Scholarship" ADD CONSTRAINT "Scholarship_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "University" ADD CONSTRAINT "University_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DataSource" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Program" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProgramDeadline" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RecordChange" ENABLE ROW LEVEL SECURITY;
