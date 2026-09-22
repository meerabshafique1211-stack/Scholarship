import type { DegreeLevel, FundingType, ScholarshipView, SourceType } from "./types";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

/** "DD Month YYYY" */
export function formatDate(v: string | Date | null | undefined): string {
  if (!v) return "Not available";
  const iso = typeof v === "string" ? v : v.toISOString();
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${String(d).padStart(2, "0")} ${MONTHS[m - 1]} ${y}`;
}

export function formatIntake(v: string): string {
  const [y, m] = v.split("-").map(Number);
  return m ? `${MONTHS[m - 1]} ${y}` : String(y);
}

export function formatCount(n: number): string {
  return new Intl.NumberFormat("en-GB").format(n);
}

export const DEGREE_LABEL: Record<DegreeLevel, string> = { BACHELOR: "Bachelor's", MASTER: "Master's", PHD: "PhD" };

export const FUNDING_LABEL: Record<FundingType, string> = {
  FULLY_FUNDED: "Fully funded",
  FULL_TUITION: "100% tuition",
  PARTIAL: "Partial tuition",
  TUITION_WAIVER: "Tuition waiver",
  OTHER: "Other funding",
};

export const SOURCE_LABEL: Record<SourceType, string> = {
  UNIVERSITY_OFFICIAL: "Official university page",
  GOVERNMENT_OFFICIAL: "Official government portal",
  ERASMUS_OFFICIAL: "Official Erasmus Mundus source",
  SCHOLARSHIP_PROVIDER_OFFICIAL: "Official scholarship provider",
};

/** e.g. "100% tuition + €600/month stipend". Uses only stored, sourced values. */
export function fundingHeadline(s: ScholarshipView): string {
  switch (s.fundingType) {
    case "FULLY_FUNDED":
      return s.livingStipend ? `Fully funded: 100% tuition + ${s.livingStipend} stipend` : "Fully funded";
    case "FULL_TUITION":
      return "100% tuition";
    case "PARTIAL":
      return s.fundingPercentage !== null ? `${s.fundingPercentage}% of tuition` : "Partial tuition";
    case "TUITION_WAIVER":
      return s.fundingAmountText ?? "Tuition waiver";
    case "OTHER":
      return s.fundingAmountText ?? "Other funding";
  }
}

export function hostOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}
