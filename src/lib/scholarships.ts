import type { Prisma } from "@prisma/client";
import { db, hasDb } from "./db";
import type { ScholarshipView } from "./types";

/** The only filter that can ever produce public results. No fallback data exists anywhere. */
export const PUBLIC_WHERE: Prisma.ScholarshipWhereInput = { verificationStatus: "VERIFIED", isDemo: false };

type Row = Prisma.ScholarshipGetPayload<{ include: { university: { select: { name: true; officialDomain: true; officialWebsite: true } } } }>;

const iso = (d: Date | null) => (d ? d.toISOString() : null);

export function toView(r: Row): ScholarshipView {
  return {
    id: r.id,
    name: r.name,
    university: r.university,
    providerName: r.providerName,
    providerDomain: r.providerDomain,
    countryCode: r.countryCode,
    degreeLevels: r.degreeLevels,
    studyFields: r.studyFields,
    nationalityRule: r.nationalityRule,
    nationalities: r.nationalities,
    eligibilityText: r.eligibilityText,
    fundingType: r.fundingType,
    fundingPercentage: r.fundingPercentage,
    fundingAmountText: r.fundingAmountText,
    tuitionCoverage: r.tuitionCoverage,
    livingStipend: r.livingStipend,
    accommodation: r.accommodation,
    healthInsurance: r.healthInsurance,
    travelSupport: r.travelSupport,
    applicationFee: r.applicationFee,
    otherBenefits: r.otherBenefits,
    cycle: r.cycle,
    intake: r.intake,
    openingDate: iso(r.openingDate),
    deadline: iso(r.deadline),
    statusUndetermined: r.statusUndetermined,
    previousCycleLabel: r.previousCycleLabel,
    previousCycleDeadline: iso(r.previousCycleDeadline),
    officialScholarshipUrl: r.officialScholarshipUrl,
    officialApplicationUrl: r.officialApplicationUrl,
    sourceUrl: r.sourceUrl,
    sourceType: r.sourceType,
    verificationStatus: r.verificationStatus,
    lastVerifiedAt: iso(r.lastVerifiedAt),
  };
}

export const withUniversity = { university: { select: { name: true, officialDomain: true, officialWebsite: true } } } as const;

export interface PublicScholarships {
  items: ScholarshipView[];
  connected: boolean; // false when no database is configured
  error: string | null;
}

/** Verified, non-demo scholarships only. Returns an empty list (never sample data) when unavailable. */
export async function listPublicScholarships(): Promise<PublicScholarships> {
  if (!hasDb()) return { items: [], connected: false, error: null };
  try {
    const rows = await db().scholarship.findMany({ where: PUBLIC_WHERE, include: withUniversity, orderBy: { deadline: "asc" } });
    return { items: rows.map(toView), connected: true, error: null };
  } catch (e) {
    console.error("[scholarships] read failed:", e);
    return { items: [], connected: true, error: null }; // logged above; public pages show the normal empty state
  }
}

/** Number of verified scholarships per university domain (for "No verified scholarship found"). */
export function countByUniversityDomain(items: ScholarshipView[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const s of items) if (s.university) m.set(s.university.officialDomain, (m.get(s.university.officialDomain) ?? 0) + 1);
  return m;
}

/** One verified, public scholarship by id (null when missing, unverified or demo). */
export async function getPublicScholarship(id: string): Promise<ScholarshipView | null> {
  if (!hasDb() || !/^[a-z0-9]{10,40}$/i.test(id)) return null;
  try {
    const r = await db().scholarship.findFirst({ where: { ...PUBLIC_WHERE, id }, include: withUniversity });
    return r ? toView(r) : null;
  } catch (e) {
    console.error("[scholarships] read failed:", e);
    return null;
  }
}
