import { z } from "zod";
import { hostOf } from "./format";

// Hosts that may help DISCOVER opportunities but can never be an authoritative source.
const NON_AUTHORITATIVE = [
  "blogspot.", "wordpress.com", "medium.com", "substack.com", "youtube.", "youtu.be", "reddit.", "facebook.", "instagram.",
  "tiktok.", "t.me", "telegram.", "linkedin.", "x.com", "twitter.", "whatsapp.",
  "scholarshipsads", "opportunitiesforafricans", "scholars4dev", "afterschoolafrica", "opportunitydesk", "youthop",
  "scholarshipdb", "wemakescholars", "scholarshiproar", "scholarshipunion", "scholarship-positions", "studyportals",
  "mastersportal", "bachelorsportal", "phdportal", "scholarshiptab", "scholarshipscorner", "chatgpt", "claude.ai",
];

const isHttps = (v: string) => /^https:\/\/[^\s]+$/i.test(v);
const emptyToNull = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : typeof v === "string" ? v.trim() : v);
const optStr = z.preprocess(emptyToNull, z.string().max(2000).nullable());
const optDate = z.preprocess(emptyToNull, z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD").nullable());
const optBool = z.preprocess((v) => (v === "yes" ? true : v === "no" ? false : null), z.boolean().nullable());
const list = z.preprocess(
  (v) => (typeof v === "string" ? v.split(/[,\n]/).map((x) => x.trim()).filter(Boolean) : v ?? []),
  z.array(z.string().max(60)),
);

export const scholarshipInput = z.object({
  name: z.string().trim().min(3, "Name is required").max(300),
  universityDomain: optStr,
  providerName: z.string().trim().min(2, "Provider name is required").max(300),
  providerDomain: z.string().trim().toLowerCase().min(3, "Provider's official domain is required")
    .transform((d) => d.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "")),
  countryCode: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/, "Choose a country"),
  degreeLevels: z.array(z.enum(["BACHELOR", "MASTER", "PHD"])).min(1, "Pick at least one degree level"),
  studyFields: list,
  nationalityRule: z.enum(["ALL", "ONLY_LISTED", "ALL_EXCEPT_LISTED"]),
  nationalities: list.transform((a) => a.map((x) => x.toUpperCase())),
  eligibilityText: z.string().trim().min(10, "Eligibility summary from the official source is required").max(4000),
  fundingType: z.enum(["FULLY_FUNDED", "FULL_TUITION", "PARTIAL", "TUITION_WAIVER", "OTHER"]),
  fundingPercentage: z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().int().min(1).max(100).nullable()),
  fundingAmountText: optStr,
  tuitionCoverage: optBool,
  livingStipend: optStr,
  accommodation: optBool,
  healthInsurance: optBool,
  travelSupport: optBool,
  applicationFee: optStr,
  cycle: z.string().trim().min(4, "Cycle is required, e.g. 2027-28").max(20),
  intake: z.preprocess(emptyToNull, z.string().regex(/^20\d{2}(-\d{2})?$/, "Intake as YYYY or YYYY-MM").nullable()),
  openingDate: optDate,
  deadline: optDate,
  statusUndetermined: z.preprocess((v) => v === "on", z.boolean()),
  previousCycleLabel: optStr,
  previousCycleDeadline: optDate,
  officialScholarshipUrl: z.string().trim().refine(isHttps, "Official scholarship URL must be an https:// link"),
  officialApplicationUrl: z.preprocess(emptyToNull, z.string().refine(isHttps, "Application URL must be an https:// link").nullable()),
  sourceUrl: z.string().trim().refine(isHttps, "Source URL must be an https:// link"),
  sourceType: z.enum(["UNIVERSITY_OFFICIAL", "GOVERNMENT_OFFICIAL", "ERASMUS_OFFICIAL", "SCHOLARSHIP_PROVIDER_OFFICIAL"]),
  verificationNotes: optStr,
  attest: z.preprocess((v) => v === "on", z.boolean()),
});

export type ScholarshipInput = z.infer<typeof scholarshipInput>;

function onDomain(url: string, domain: string): boolean {
  const h = hostOf(url);
  return Boolean(h && (h === domain || h.endsWith("." + domain)));
}

/** Rules that apply to every save (draft or verified). */
export function structuralProblems(i: ScholarshipInput): string[] {
  const p: string[] = [];
  for (const [label, url] of [["Provider domain", `https://${i.providerDomain}`], ["Source URL", i.sourceUrl], ["Official scholarship URL", i.officialScholarshipUrl], ["Application URL", i.officialApplicationUrl]] as const) {
    const h = hostOf(url);
    if (h && NON_AUTHORITATIVE.some((bad) => h.includes(bad))) p.push(`${label} (${h}) is not an authoritative source. Find the official page.`);
  }
  if (i.fundingType === "PARTIAL" && (i.fundingPercentage === null || i.fundingPercentage >= 100)) p.push("Partial funding needs a published percentage between 1 and 99.");
  if (i.nationalityRule !== "ALL" && i.nationalities.length === 0) p.push("List the nationalities (ISO codes, e.g. PK, IN) for this eligibility rule.");
  if (i.openingDate && i.deadline && i.deadline < i.openingDate) p.push("Deadline is before the opening date.");
  if (i.previousCycleDeadline && i.deadline && i.previousCycleDeadline >= i.deadline) p.push("Previous-cycle deadline must be earlier than the current deadline.");
  return p;
}

/** Extra rules before a record can become VERIFIED (and therefore public). */
export function verificationProblems(i: ScholarshipInput, universityDomain: string | null): string[] {
  const p = structuralProblems(i);
  if (!i.attest) p.push("Confirm you checked every field against the official source today.");
  if (!onDomain(i.sourceUrl, i.providerDomain)) p.push(`Source URL must be on the provider's official domain (${i.providerDomain}).`);
  if (!onDomain(i.officialScholarshipUrl, i.providerDomain) && !(universityDomain && onDomain(i.officialScholarshipUrl, universityDomain)))
    p.push("Official scholarship URL must be on the provider's or university's official domain.");
  if (i.sourceType === "UNIVERSITY_OFFICIAL") {
    if (!universityDomain) p.push("A university-official source needs the university's official domain (and the university must exist in the database).");
    else if (!(i.providerDomain === universityDomain || i.providerDomain.endsWith("." + universityDomain)))
      p.push(`For a university source, the provider domain must be ${universityDomain} or one of its subdomains.`);
  }
  if (i.fundingType === "FULLY_FUNDED") {
    if (i.tuitionCoverage !== true) p.push("Fully funded requires the source to confirm full tuition coverage.");
    if (!i.livingStipend && i.accommodation !== true) p.push("Fully funded requires a living stipend or accommodation confirmed by the source. Otherwise use 100% tuition.");
  }
  if (i.fundingType === "FULL_TUITION" && i.tuitionCoverage !== true) p.push("100% tuition requires tuition coverage = Yes.");
  if ((i.fundingType === "OTHER" || i.fundingType === "TUITION_WAIVER") && !i.fundingAmountText) p.push("Enter the funding amount or waiver exactly as published.");
  return p;
}
