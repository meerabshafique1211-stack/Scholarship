-- Global Scholarship Finder: initial schema for Supabase (PostgreSQL).
-- Mirrors prisma/schema.prisma exactly (Prisma naming), so the Prisma client works unchanged.
-- Contains NO data: universities are imported by the sync job, scholarships are added
-- by an admin from official sources.

BEGIN;

-- ── Enums ───────────────────────────────────────────────────────────────
CREATE TYPE "UniversityStatus" AS ENUM ('IMPORTED', 'VERIFIED', 'REJECTED');
CREATE TYPE "ScholarshipVerification" AS ENUM ('VERIFIED', 'NEEDS_VERIFICATION', 'EXPIRED', 'REJECTED');
CREATE TYPE "FundingType" AS ENUM ('FULLY_FUNDED', 'FULL_TUITION', 'PARTIAL', 'TUITION_WAIVER', 'OTHER');
CREATE TYPE "SourceType" AS ENUM ('UNIVERSITY_OFFICIAL', 'GOVERNMENT_OFFICIAL', 'ERASMUS_OFFICIAL', 'SCHOLARSHIP_PROVIDER_OFFICIAL');
CREATE TYPE "DegreeLevel" AS ENUM ('BACHELOR', 'MASTER', 'PHD');
CREATE TYPE "NationalityRule" AS ENUM ('ALL', 'ONLY_LISTED', 'ALL_EXCEPT_LISTED');

-- ── Universities (from Hipo, enriched by OpenAlex) ──────────────────────
CREATE TABLE "University" (
    "id"                 TEXT NOT NULL,
    "name"               TEXT NOT NULL,
    "normalizedName"     TEXT NOT NULL,
    "countryCode"        CHAR(2) NOT NULL,
    "country"            TEXT NOT NULL,
    "city"               TEXT,
    "state"              TEXT,
    "officialWebsite"    TEXT,
    "officialDomain"     TEXT NOT NULL,
    "domains"            TEXT[],
    "logoUrl"            TEXT,
    "openalexId"         TEXT,
    "rorId"              TEXT,
    "institutionType"    TEXT,
    "worksCount"         INTEGER,
    "citedByCount"       INTEGER,
    "source"             TEXT NOT NULL,
    "sourceUrl"          TEXT NOT NULL,
    "researchSource"     TEXT,
    "researchSourceUrl"  TEXT,
    "verificationStatus" "UniversityStatus" NOT NULL DEFAULT 'IMPORTED',
    "lastVerifiedAt"     TIMESTAMP(3) NOT NULL,
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL,
    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "University_officialDomain_key" ON "University"("officialDomain");
CREATE UNIQUE INDEX "University_openalexId_key" ON "University"("openalexId");
CREATE INDEX "University_countryCode_idx" ON "University"("countryCode");
CREATE INDEX "University_normalizedName_countryCode_idx" ON "University"("normalizedName", "countryCode");

CREATE TABLE "SyncRun" (
    "id"          TEXT NOT NULL,
    "job"         TEXT NOT NULL,
    "countryCode" TEXT,
    "provider"    TEXT,
    "inserted"    INTEGER NOT NULL DEFAULT 0,
    "updated"     INTEGER NOT NULL DEFAULT 0,
    "skipped"     INTEGER NOT NULL DEFAULT 0,
    "error"       TEXT,
    "startedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt"  TIMESTAMP(3),
    CONSTRAINT "SyncRun_pkey" PRIMARY KEY ("id")
);

-- ── Scholarships (verified against official sources only) ───────────────
CREATE TABLE "Scholarship" (
    "id"                     TEXT NOT NULL,
    "name"                   TEXT NOT NULL,
    "universityId"           TEXT,
    "providerName"           TEXT NOT NULL,
    "providerDomain"         TEXT NOT NULL,
    "countryCode"            CHAR(2) NOT NULL,
    "degreeLevels"           "DegreeLevel"[],
    "studyFields"            TEXT[],
    "nationalityRule"        "NationalityRule" NOT NULL,
    "nationalities"          TEXT[],
    "eligibilityText"        TEXT NOT NULL,
    "fundingType"            "FundingType" NOT NULL,
    "fundingPercentage"      INTEGER,
    "fundingAmountText"      TEXT,
    "tuitionCoverage"        BOOLEAN,
    "livingStipend"          TEXT,
    "accommodation"          BOOLEAN,
    "healthInsurance"        BOOLEAN,
    "travelSupport"          BOOLEAN,
    "applicationFee"         TEXT,
    "cycle"                  TEXT NOT NULL,
    "intake"                 TEXT,
    "openingDate"            TIMESTAMP(3),
    "deadline"               TIMESTAMP(3),
    "statusUndetermined"     BOOLEAN NOT NULL DEFAULT false,
    "previousCycleLabel"     TEXT,
    "previousCycleDeadline"  TIMESTAMP(3),
    "officialScholarshipUrl" TEXT NOT NULL,
    "officialApplicationUrl" TEXT,
    "sourceUrl"              TEXT NOT NULL,
    "sourceType"             "SourceType" NOT NULL,
    "verificationStatus"     "ScholarshipVerification" NOT NULL DEFAULT 'NEEDS_VERIFICATION',
    "verificationNotes"      TEXT,
    "lastVerifiedAt"         TIMESTAMP(3),
    "isDemo"                 BOOLEAN NOT NULL DEFAULT false,
    "createdAt"              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"              TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Scholarship_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Scholarship_verificationStatus_isDemo_countryCode_idx" ON "Scholarship"("verificationStatus", "isDemo", "countryCode");
CREATE INDEX "Scholarship_deadline_idx" ON "Scholarship"("deadline");

CREATE TABLE "ScholarshipSource" (
    "id"                 TEXT NOT NULL,
    "scholarshipId"      TEXT NOT NULL,
    "sourceType"         "SourceType" NOT NULL,
    "sourceUrl"          TEXT NOT NULL,
    "providerName"       TEXT NOT NULL,
    "lastChecked"        TIMESTAMP(3) NOT NULL,
    "verificationStatus" "ScholarshipVerification" NOT NULL,
    CONSTRAINT "ScholarshipSource_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ScholarshipSource_scholarshipId_idx" ON "ScholarshipSource"("scholarshipId");

CREATE TABLE "VerificationLog" (
    "id"            TEXT NOT NULL,
    "scholarshipId" TEXT NOT NULL,
    "action"        TEXT NOT NULL,
    "note"          TEXT,
    "actor"         TEXT NOT NULL,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VerificationLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "VerificationLog_scholarshipId_createdAt_idx" ON "VerificationLog"("scholarshipId", "createdAt");

-- ── Foreign keys ────────────────────────────────────────────────────────
ALTER TABLE "Scholarship" ADD CONSTRAINT "Scholarship_universityId_fkey"
    FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ScholarshipSource" ADD CONSTRAINT "ScholarshipSource_scholarshipId_fkey"
    FOREIGN KEY ("scholarshipId") REFERENCES "Scholarship"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VerificationLog" ADD CONSTRAINT "VerificationLog_scholarshipId_fkey"
    FOREIGN KEY ("scholarshipId") REFERENCES "Scholarship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── Integrity guards (defence in depth; the admin form enforces these too) ──
ALTER TABLE "Scholarship" ADD CONSTRAINT "Scholarship_fundingPercentage_range"
    CHECK ("fundingPercentage" IS NULL OR ("fundingPercentage" BETWEEN 1 AND 100));
ALTER TABLE "Scholarship" ADD CONSTRAINT "Scholarship_dates_order"
    CHECK ("openingDate" IS NULL OR "deadline" IS NULL OR "deadline" >= "openingDate");
ALTER TABLE "Scholarship" ADD CONSTRAINT "Scholarship_verified_has_date"
    CHECK ("verificationStatus" <> 'VERIFIED' OR "lastVerifiedAt" IS NOT NULL);
ALTER TABLE "Scholarship" ADD CONSTRAINT "Scholarship_https_urls"
    CHECK ("officialScholarshipUrl" LIKE 'https://%' AND "sourceUrl" LIKE 'https://%'
           AND ("officialApplicationUrl" IS NULL OR "officialApplicationUrl" LIKE 'https://%'));

-- ── Security: block Supabase's public Data API (anon / authenticated keys) ──
-- The app talks to Postgres directly as the table owner (bypasses RLS).
-- With RLS on and no policies, the publishable key can read or write nothing here.
ALTER TABLE "University"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SyncRun"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Scholarship"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ScholarshipSource" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationLog"   ENABLE ROW LEVEL SECURITY;

COMMIT;
