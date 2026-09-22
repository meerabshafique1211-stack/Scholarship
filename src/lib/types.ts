// Front-end view models. These mirror prisma/schema.prisma so Phase 2 can swap
// the demo repository for a Prisma-backed one without touching components.

export type DegreeLevel = "bachelor" | "master" | "phd";
export type FundingType = "fully_funded" | "full_tuition" | "partial" | "other";
export type AppStatus = "open" | "upcoming" | "expected" | "closed" | "unknown";
export type DateKind = "official" | "expected";
export type VerificationStatus = "verified" | "needs_verification" | "unverified" | "demo";
export type NationalityRule = "all_international" | "only_listed" | "all_except_listed" | "not_verified";

export interface Country {
  code: string; // ISO-2
  name: string;
  slug: string;
  currency: string;
}

export interface University {
  id: string;
  name: string;
  slug: string;
  countryCode: string;
  city: string;
  type: "public" | "private";
  officialUrl: string | null;
  ranking: { publisher: string; year: number; rank: string; sourceUrl: string | null } | null;
  careerFacts: {
    label: string;
    value: string;
    origin: "official_university" | "external_labour_market";
    sourceUrl: string | null;
  }[];
  verificationStatus: VerificationStatus;
  lastVerifiedAt: string | null; // ISO date
}

export interface Program {
  id: string;
  universityId: string;
  name: string;
  degreeLevel: DegreeLevel;
  fields: string[];
  durationMonths: number | null;
  englishTaught: boolean | null;
  intakes: string[]; // "YYYY-MM"
  tuitionPerYear: number | null;
  tuitionCurrency: string | null;
  ieltsRequired: boolean | null;
  workExperienceRequired: boolean | null;
  applicationFee: number | null;
  officialUrl: string | null;
}

export interface DatedValue {
  date: string; // ISO date
  kind: DateKind;
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  universityId: string | null;
  programIds: string[];
  countryCode: string;
  cycle: string;
  degreeLevels: DegreeLevel[];
  nationalityRule: NationalityRule;
  nationalities: string[];
  fundingType: FundingType;
  fundingPercentage: number | null;
  fundingAmountNote: string | null;
  tuitionCoverage: boolean | null;
  livingStipend: string | null;
  accommodation: boolean | null;
  healthInsurance: boolean | null;
  travelSupport: boolean | null;
  opening: DatedValue | null;
  deadline: DatedValue | null;
  intake: string | null;
  officialUrl: string | null;
  applicationUrl: string | null;
  sourcePublisher: string | null;
  sourceUrl: string | null;
  eligibilityNote: string | null;
  verificationStatus: VerificationStatus;
  lastVerifiedAt: string | null;
}

/** One result row: Country → University → Program → (Scholarship | none). */
export interface Opportunity {
  key: string;
  country: Country;
  university: University;
  program: Program;
  scholarship: Scholarship | null;
  status: AppStatus;
}

export type FundingFilter =
  | "all"
  | "fully_funded"
  | "full_tuition"
  | "75"
  | "50"
  | "25"
  | "other_partial"
  | "none";

export interface Filters {
  q: string;
  countries: string[];
  citizenship: string | null;
  degree: DegreeLevel | null;
  field: string | null;
  intake: string | null; // "YYYY-MM" or "YYYY"
  funding: FundingFilter;
  minPercent: number | null;
  statuses: AppStatus[];
  englishOnly: boolean;
  noIelts: boolean;
  noWorkExperience: boolean;
  noApplicationFee: boolean;
  institutionType: "public" | "private" | null;
  sort: "deadline" | "funding" | "name";
}

export const EMPTY_FILTERS: Filters = {
  q: "",
  countries: [],
  citizenship: null,
  degree: null,
  field: null,
  intake: null,
  funding: "all",
  minPercent: null,
  statuses: [],
  englishOnly: false,
  noIelts: false,
  noWorkExperience: false,
  noApplicationFee: false,
  institutionType: null,
  sort: "deadline",
};
