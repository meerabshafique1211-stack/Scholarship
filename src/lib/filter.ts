import { EU_EEA } from "./reference";
import { deriveStatus } from "./status";
import type { AppStatus, Filters, ScholarshipView } from "./types";

export interface RankedScholarship {
  s: ScholarshipView;
  status: AppStatus;
}

/** true = eligible, false = not eligible (per stored official text). */
export function eligibleFor(s: ScholarshipView, citizenship: string | null): boolean | null {
  if (!citizenship) return null;
  const list = s.nationalities.flatMap((n) => (n === "EU_EEA" ? EU_EEA : [n]));
  switch (s.nationalityRule) {
    case "ALL": return true;
    case "ONLY_LISTED": return list.includes(citizenship);
    case "ALL_EXCEPT_LISTED": return !list.includes(citizenship);
  }
}

function matchesFunding(s: ScholarshipView, f: Filters): boolean {
  const p = s.fundingPercentage;
  switch (f.funding) {
    case "all": break;
    case "none": return false; // "No scholarship" lists universities only
    case "fully_funded": if (s.fundingType !== "FULLY_FUNDED") return false; break;
    // 100% tuition is its own category; fully funded is never folded into it or vice versa.
    case "full_tuition": if (s.fundingType !== "FULL_TUITION") return false; break;
    case "75": if (!(s.fundingType === "PARTIAL" && p === 75)) return false; break;
    case "50": if (!(s.fundingType === "PARTIAL" && p === 50)) return false; break;
    case "25": if (!(s.fundingType === "PARTIAL" && p === 25)) return false; break;
    case "other_partial":
      if (!(s.fundingType === "OTHER" || (s.fundingType === "PARTIAL" && (p === null || ![25, 50, 75].includes(p))))) return false;
      break;
    case "tuition_waiver": if (s.fundingType !== "TUITION_WAIVER") return false; break;
  }
  if (f.minPercent !== null) {
    const covered = s.fundingType === "FULLY_FUNDED" || s.fundingType === "FULL_TUITION" ? 100 : p;
    if (covered === null || covered < f.minPercent) return false;
  }
  return true;
}

const ORDER: Record<AppStatus, number> = { OPEN: 0, UPCOMING: 1, UNKNOWN: 2, NOT_ANNOUNCED: 3, CLOSED: 4 };

/** Public results: closed cycles are excluded (they become EXPIRED via the daily job). */
export function filterScholarships(list: ScholarshipView[], f: Filters, residual: string[] = [], today = new Date()): RankedScholarship[] {
  return list
    .map((s) => ({ s, status: deriveStatus(s, today) }))
    .filter(({ s, status }) => {
      if (s.verificationStatus !== "VERIFIED") return false;
      if (status === "CLOSED") return false;
      if (f.countries.length && !f.countries.includes(s.countryCode)) return false;
      if (f.degree && !s.degreeLevels.includes(f.degree)) return false;
      if (f.field && s.studyFields.length > 0 && !s.studyFields.includes(f.field)) return false;
      if (f.intake && !(s.intake ?? "").startsWith(f.intake)) return false;
      if (f.citizenship && eligibleFor(s, f.citizenship) === false) return false;
      if (f.statuses.length && !f.statuses.includes(status)) return false;
      if (!matchesFunding(s, f)) return false;
      if (residual.length) {
        const hay = [s.name, s.providerName, s.university?.name ?? ""].join(" ").toLowerCase();
        if (!residual.every((w) => hay.includes(w))) return false;
      }
      return true;
    })
    .sort((a, b) => ORDER[a.status] - ORDER[b.status] || (a.s.deadline ?? "9999").localeCompare(b.s.deadline ?? "9999"));
}
