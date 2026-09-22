export type DegreeLevel = "BACHELOR" | "MASTER" | "PHD";
export type FundingType = "FULLY_FUNDED" | "FULL_TUITION" | "PARTIAL" | "TUITION_WAIVER" | "OTHER";
export type SourceType = "UNIVERSITY_OFFICIAL" | "GOVERNMENT_OFFICIAL" | "ERASMUS_OFFICIAL" | "SCHOLARSHIP_PROVIDER_OFFICIAL";
export type ScholarshipVerification = "VERIFIED" | "NEEDS_VERIFICATION" | "EXPIRED" | "REJECTED";
export type NationalityRule = "ALL" | "ONLY_LISTED" | "ALL_EXCEPT_LISTED";
export type AppStatus = "OPEN" | "UPCOMING" | "CLOSED" | "NOT_ANNOUNCED" | "UNKNOWN";

export interface UniversityView {
  key: string;
  name: string;
  countryCode: string;
  country: string;
  city: string | null;
  state: string | null;
  officialWebsite: string | null;
  officialDomain: string;
  openalexId: string | null;
  rorId: string | null;
  worksCount: number | null;
  citedByCount: number | null;
  source: string;
  sourceUrl: string;
  researchSource: string | null;
  researchSourceUrl: string | null;
  lastVerifiedAt: string;
  verificationStatus: "IMPORTED" | "VERIFIED";
}

export interface ScholarshipView {
  id: string;
  name: string;
  university: { name: string; officialDomain: string; officialWebsite: string | null } | null;
  providerName: string;
  providerDomain: string;
  countryCode: string;
  degreeLevels: DegreeLevel[];
  studyFields: string[];
  nationalityRule: NationalityRule;
  nationalities: string[];
  eligibilityText: string;
  fundingType: FundingType;
  fundingPercentage: number | null;
  fundingAmountText: string | null;
  tuitionCoverage: boolean | null;
  livingStipend: string | null;
  accommodation: boolean | null;
  healthInsurance: boolean | null;
  travelSupport: boolean | null;
  applicationFee: string | null;
  cycle: string;
  intake: string | null;
  openingDate: string | null;
  deadline: string | null;
  statusUndetermined: boolean;
  previousCycleLabel: string | null;
  previousCycleDeadline: string | null;
  officialScholarshipUrl: string;
  officialApplicationUrl: string | null;
  sourceUrl: string;
  sourceType: SourceType;
  verificationStatus: ScholarshipVerification;
  lastVerifiedAt: string | null;
}

export type FundingFilter = "all" | "fully_funded" | "full_tuition" | "75" | "50" | "25" | "other_partial" | "tuition_waiver" | "none";

export interface Filters {
  q: string;
  countries: string[];
  citizenship: string | null;
  degree: DegreeLevel | null;
  field: string | null;
  intake: string | null;
  funding: FundingFilter;
  minPercent: number | null;
  statuses: AppStatus[];
  page: number;
}

export const EMPTY_FILTERS: Filters = {
  q: "", countries: [], citizenship: null, degree: null, field: null, intake: null,
  funding: "all", minPercent: null, statuses: [], page: 1,
};
