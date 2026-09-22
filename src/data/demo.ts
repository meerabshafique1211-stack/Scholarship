// ─────────────────────────────────────────────────────────────────────────────
//  DEMO DATA — FICTIONAL. FOR DEVELOPMENT ONLY.
//  Every university, program and scholarship below is invented to exercise the
//  UI states (fully funded, partial, none, open, upcoming, expected, closed…).
//  None of these are real opportunities. All records carry verificationStatus
//  "demo" and the UI never renders their links as real application links.
//  Replace with verified records via the admin workflow in Phase 2/7.
// ─────────────────────────────────────────────────────────────────────────────
import type { Program, Scholarship, University } from "../lib/types";

const DEMO_URL = "https://example.org/demo"; // reserved documentation domain

const uni = (u: Omit<University, "verificationStatus" | "lastVerifiedAt" | "officialUrl" | "ranking" | "careerFacts"> & Partial<University>): University => ({
  officialUrl: DEMO_URL,
  ranking: null,
  careerFacts: [],
  verificationStatus: "demo",
  lastVerifiedAt: null,
  ...u,
});

export const DEMO_UNIVERSITIES: University[] = [
  uni({ id: "u-it-1", name: "Example Polytechnic of Lombardy (Demo)", slug: "example-polytechnic-lombardy", countryCode: "IT", city: "Milan", type: "public",
    careerFacts: [{ label: "Industry partnerships", value: "Demo value", origin: "official_university", sourceUrl: null }] }),
  uni({ id: "u-it-2", name: "Example University of Tuscany (Demo)", slug: "example-university-tuscany", countryCode: "IT", city: "Florence", type: "public" }),
  uni({ id: "u-de-1", name: "Example Technical University Saxony (Demo)", slug: "example-tu-saxony", countryCode: "DE", city: "Dresden", type: "public" }),
  uni({ id: "u-fi-1", name: "Example Nordic University (Demo)", slug: "example-nordic-university", countryCode: "FI", city: "Helsinki", type: "public" }),
  uni({ id: "u-dk-1", name: "Example Business School Copenhagen (Demo)", slug: "example-bs-copenhagen", countryCode: "DK", city: "Copenhagen", type: "private" }),
  uni({ id: "u-se-1", name: "Example Institute of Technology (Demo)", slug: "example-it-sweden", countryCode: "SE", city: "Uppsala", type: "public" }),
  uni({ id: "u-nl-1", name: "Example University Eindhoven (Demo)", slug: "example-university-eindhoven", countryCode: "NL", city: "Eindhoven", type: "public" }),
  uni({ id: "u-es-1", name: "Example University Madrid (Demo)", slug: "example-university-madrid", countryCode: "ES", city: "Madrid", type: "private" }),
];

const prog = (p: Omit<Program, "officialUrl" | "applicationFee"> & Partial<Program>): Program => ({
  officialUrl: DEMO_URL,
  applicationFee: null,
  ...p,
});

export const DEMO_PROGRAMS: Program[] = [
  prog({ id: "p-it-1-cs", universityId: "u-it-1", name: "MSc Computer Science and Engineering", degreeLevel: "master", fields: ["computer-science", "ai"], durationMonths: 24, englishTaught: true, intakes: ["2027-09"], tuitionPerYear: 3900, tuitionCurrency: "EUR", ieltsRequired: true, workExperienceRequired: false, applicationFee: 30 }),
  prog({ id: "p-it-2-ds", universityId: "u-it-2", name: "MSc Data Science", degreeLevel: "master", fields: ["data-science", "computer-science"], durationMonths: 24, englishTaught: true, intakes: ["2027-09"], tuitionPerYear: 2800, tuitionCurrency: "EUR", ieltsRequired: false, workExperienceRequired: false, applicationFee: 0 }),
  prog({ id: "p-it-2-econ", universityId: "u-it-2", name: "MSc Economics", degreeLevel: "master", fields: ["economics"], durationMonths: 24, englishTaught: true, intakes: ["2027-09"], tuitionPerYear: 2800, tuitionCurrency: "EUR", ieltsRequired: false, workExperienceRequired: false, applicationFee: 0 }),
  prog({ id: "p-de-1-cs", universityId: "u-de-1", name: "MSc Computational Science", degreeLevel: "master", fields: ["computer-science", "engineering"], durationMonths: 24, englishTaught: true, intakes: ["2027-04", "2027-10"], tuitionPerYear: 0, tuitionCurrency: "EUR", ieltsRequired: true, workExperienceRequired: false, applicationFee: 75 }),
  prog({ id: "p-de-1-ph", universityId: "u-de-1", name: "MSc Public Health", degreeLevel: "master", fields: ["public-health"], durationMonths: 24, englishTaught: true, intakes: ["2027-10"], tuitionPerYear: 0, tuitionCurrency: "EUR", ieltsRequired: true, workExperienceRequired: true, applicationFee: 75 }),
  prog({ id: "p-fi-1-ai", universityId: "u-fi-1", name: "MSc Artificial Intelligence", degreeLevel: "master", fields: ["ai", "computer-science"], durationMonths: 24, englishTaught: true, intakes: ["2027-09"], tuitionPerYear: 15000, tuitionCurrency: "EUR", ieltsRequired: true, workExperienceRequired: false, applicationFee: 100 }),
  prog({ id: "p-dk-1-pm", universityId: "u-dk-1", name: "MSc Project Management", degreeLevel: "master", fields: ["project-management", "business"], durationMonths: 24, englishTaught: true, intakes: ["2027-09"], tuitionPerYear: 16000, tuitionCurrency: "EUR", ieltsRequired: true, workExperienceRequired: true }),
  prog({ id: "p-se-1-eng", universityId: "u-se-1", name: "MSc Sustainable Engineering", degreeLevel: "master", fields: ["engineering"], durationMonths: 24, englishTaught: true, intakes: ["2027-08"], tuitionPerYear: 145000, tuitionCurrency: "SEK", ieltsRequired: true, workExperienceRequired: false, applicationFee: 900 }),
  prog({ id: "p-nl-1-ds", universityId: "u-nl-1", name: "MSc Data Science and AI", degreeLevel: "master", fields: ["data-science", "ai"], durationMonths: 24, englishTaught: true, intakes: ["2027-09"], tuitionPerYear: 18500, tuitionCurrency: "EUR", ieltsRequired: true, workExperienceRequired: false }),
  prog({ id: "p-nl-1-bsc", universityId: "u-nl-1", name: "BSc Computer Science", degreeLevel: "bachelor", fields: ["computer-science"], durationMonths: 36, englishTaught: true, intakes: ["2027-09"], tuitionPerYear: 16000, tuitionCurrency: "EUR", ieltsRequired: true, workExperienceRequired: false }),
  prog({ id: "p-es-1-mba", universityId: "u-es-1", name: "Master in Business Analytics", degreeLevel: "master", fields: ["business", "data-science"], durationMonths: 12, englishTaught: true, intakes: ["2027-01", "2027-09"], tuitionPerYear: 24000, tuitionCurrency: "EUR", ieltsRequired: false, workExperienceRequired: true, applicationFee: 125 }),
  prog({ id: "p-fi-1-phd", universityId: "u-fi-1", name: "Doctoral Programme in Computer Science", degreeLevel: "phd", fields: ["computer-science", "ai"], durationMonths: 48, englishTaught: true, intakes: ["2027-01"], tuitionPerYear: 0, tuitionCurrency: "EUR", ieltsRequired: true, workExperienceRequired: false }),
];

const sch = (s: Omit<Scholarship, "verificationStatus" | "lastVerifiedAt" | "officialUrl" | "sourceUrl" | "sourcePublisher" | "eligibilityNote" | "fundingAmountNote"> & Partial<Scholarship>): Scholarship => ({
  officialUrl: DEMO_URL,
  sourceUrl: DEMO_URL,
  sourcePublisher: "Demo data",
  eligibilityNote: null,
  fundingAmountNote: null,
  verificationStatus: "demo",
  lastVerifiedAt: null,
  ...s,
});

export const DEMO_SCHOLARSHIPS: Scholarship[] = [
  sch({ id: "s-it-regional", name: "Regional Study Grant (Demo)", provider: "Example Regional Agency", universityId: null, programIds: ["p-it-1-cs", "p-it-2-ds", "p-it-2-econ"], countryCode: "IT", cycle: "2027-28",
    degreeLevels: ["bachelor", "master"], nationalityRule: "all_international", nationalities: [], fundingType: "fully_funded", fundingPercentage: 100,
    tuitionCoverage: true, livingStipend: "€600/month", accommodation: true, healthInsurance: null, travelSupport: false,
    opening: { date: "2026-07-15", kind: "official" }, deadline: { date: "2026-10-15", kind: "official" }, intake: "2027-09",
    applicationUrl: "https://example.org/demo-apply", eligibilityNote: "Income-based. Family income documents required." }),
  sch({ id: "s-it-1-merit", name: "International Excellence Award (Demo)", provider: "Example Polytechnic of Lombardy", universityId: "u-it-1", programIds: ["p-it-1-cs"], countryCode: "IT", cycle: "2027-28",
    degreeLevels: ["master"], nationalityRule: "all_international", nationalities: [], fundingType: "full_tuition", fundingPercentage: 100,
    tuitionCoverage: true, livingStipend: null, accommodation: false, healthInsurance: false, travelSupport: false,
    opening: { date: "2027-01-10", kind: "expected" }, deadline: { date: "2027-03-01", kind: "expected" }, intake: "2027-09", applicationUrl: null }),
  sch({ id: "s-de-gov", name: "Development-Related Postgraduate Grant (Demo)", provider: "Example Federal Exchange Service", universityId: null, programIds: ["p-de-1-cs", "p-de-1-ph"], countryCode: "DE", cycle: "2027-28",
    degreeLevels: ["master", "phd"], nationalityRule: "only_listed", nationalities: ["PK", "IN", "BD", "NG", "NP", "EG", "GH", "KE", "ET"], fundingType: "fully_funded", fundingPercentage: 100,
    tuitionCoverage: true, livingStipend: "€992/month", accommodation: false, healthInsurance: true, travelSupport: true,
    opening: { date: "2026-08-01", kind: "official" }, deadline: { date: "2026-10-31", kind: "official" }, intake: "2027-10",
    applicationUrl: "https://example.org/demo-apply", eligibilityNote: "Requires at least 2 years of relevant work experience." }),
  sch({ id: "s-de-1-deutschland", name: "Merit Stipend (Demo)", provider: "Example Technical University Saxony", universityId: "u-de-1", programIds: ["p-de-1-cs"], countryCode: "DE", cycle: "2027-28",
    degreeLevels: ["master"], nationalityRule: "all_international", nationalities: [], fundingType: "other", fundingPercentage: null, fundingAmountNote: "€300/month for 12 months",
    tuitionCoverage: false, livingStipend: "€300/month", accommodation: false, healthInsurance: false, travelSupport: false,
    opening: { date: "2026-11-01", kind: "official" }, deadline: { date: "2027-01-15", kind: "official" }, intake: "2027-04", applicationUrl: null }),
  sch({ id: "s-fi-1-full", name: "Nordic Tuition Scholarship 100% (Demo)", provider: "Example Nordic University", universityId: "u-fi-1", programIds: ["p-fi-1-ai"], countryCode: "FI", cycle: "2027-28",
    degreeLevels: ["master"], nationalityRule: "all_except_listed", nationalities: ["EU_EEA"], fundingType: "full_tuition", fundingPercentage: 100,
    tuitionCoverage: true, livingStipend: null, accommodation: false, healthInsurance: false, travelSupport: false,
    opening: { date: "2026-12-01", kind: "official" }, deadline: { date: "2027-01-20", kind: "official" }, intake: "2027-09", applicationUrl: null,
    eligibilityNote: "For fee-paying students outside the EU/EEA. Applied for together with the admission application." }),
  sch({ id: "s-fi-1-half", name: "Nordic Tuition Scholarship 50% (Demo)", provider: "Example Nordic University", universityId: "u-fi-1", programIds: ["p-fi-1-ai"], countryCode: "FI", cycle: "2027-28",
    degreeLevels: ["master"], nationalityRule: "all_except_listed", nationalities: ["EU_EEA"], fundingType: "partial", fundingPercentage: 50,
    tuitionCoverage: false, livingStipend: null, accommodation: false, healthInsurance: false, travelSupport: false,
    opening: { date: "2026-12-01", kind: "official" }, deadline: { date: "2027-01-20", kind: "official" }, intake: "2027-09", applicationUrl: null }),
  sch({ id: "s-dk-1-75", name: "Global Leaders Tuition Waiver 75% (Demo)", provider: "Example Business School Copenhagen", universityId: "u-dk-1", programIds: ["p-dk-1-pm"], countryCode: "DK", cycle: "2027-28",
    degreeLevels: ["master"], nationalityRule: "not_verified", nationalities: [], fundingType: "partial", fundingPercentage: 75,
    tuitionCoverage: false, livingStipend: null, accommodation: null, healthInsurance: null, travelSupport: null,
    opening: null, deadline: null, intake: "2027-09", applicationUrl: null }),
  sch({ id: "s-se-1-25", name: "Institute Scholarship 25% (Demo)", provider: "Example Institute of Technology", universityId: "u-se-1", programIds: ["p-se-1-eng"], countryCode: "SE", cycle: "2026-27",
    degreeLevels: ["master"], nationalityRule: "all_except_listed", nationalities: ["EU_EEA"], fundingType: "partial", fundingPercentage: 25,
    tuitionCoverage: false, livingStipend: null, accommodation: false, healthInsurance: false, travelSupport: false,
    opening: { date: "2025-10-15", kind: "official" }, deadline: { date: "2026-01-15", kind: "official" }, intake: "2026-08", applicationUrl: null }),
  sch({ id: "s-nl-1-discount", name: "Early Applicant Tuition Discount (Demo)", provider: "Example University Eindhoven", universityId: "u-nl-1", programIds: ["p-nl-1-ds"], countryCode: "NL", cycle: "2027-28",
    degreeLevels: ["master"], nationalityRule: "all_international", nationalities: [], fundingType: "other", fundingPercentage: null, fundingAmountNote: "€5,000 off first-year tuition",
    tuitionCoverage: false, livingStipend: null, accommodation: false, healthInsurance: false, travelSupport: false,
    opening: { date: "2026-09-01", kind: "official" }, deadline: { date: "2027-02-01", kind: "official" }, intake: "2027-09", applicationUrl: "https://example.org/demo-apply" }),
  sch({ id: "s-es-1-30", name: "Analytics Talent Scholarship 30% (Demo)", provider: "Example University Madrid", universityId: "u-es-1", programIds: ["p-es-1-mba"], countryCode: "ES", cycle: "2027",
    degreeLevels: ["master"], nationalityRule: "all_international", nationalities: [], fundingType: "partial", fundingPercentage: 30,
    tuitionCoverage: false, livingStipend: null, accommodation: false, healthInsurance: false, travelSupport: false,
    opening: { date: "2026-06-01", kind: "official" }, deadline: { date: "2026-11-30", kind: "official" }, intake: "2027-01", applicationUrl: "https://example.org/demo-apply" }),
  sch({ id: "s-fi-1-phd", name: "Doctoral Researcher Position (Demo)", provider: "Example Nordic University", universityId: "u-fi-1", programIds: ["p-fi-1-phd"], countryCode: "FI", cycle: "2027",
    degreeLevels: ["phd"], nationalityRule: "all_international", nationalities: [], fundingType: "fully_funded", fundingPercentage: 100,
    tuitionCoverage: true, livingStipend: "€2,600/month salary", accommodation: false, healthInsurance: true, travelSupport: false,
    opening: { date: "2026-09-01", kind: "official" }, deadline: { date: "2026-10-05", kind: "official" }, intake: "2027-01", applicationUrl: "https://example.org/demo-apply" }),
];
