import { DESTINATIONS, EU_EEA } from "../data/reference";
import { deriveStatus } from "./status";
import type { Filters, Opportunity, Program, Scholarship, University } from "./types";

export interface Dataset {
  universities: University[];
  programs: Program[];
  scholarships: Scholarship[];
}

/** true = eligible, false = not eligible, null = eligibility not verified */
export function eligibleFor(s: Scholarship, citizenship: string | null): boolean | null {
  if (!citizenship) return null;
  const list = s.nationalities.flatMap((n) => (n === "EU_EEA" ? EU_EEA : [n]));
  switch (s.nationalityRule) {
    case "all_international": return true;
    case "only_listed": return list.includes(citizenship);
    case "all_except_listed": return !list.includes(citizenship);
    case "not_verified": return null;
  }
}

/**
 * Builds result rows. Every program appears: with each current scholarship,
 * or once with `scholarship: null` if none is current. Closed scholarships
 * are returned separately as past opportunities.
 */
export function buildOpportunities(ds: Dataset, today = new Date()): { current: Opportunity[]; past: Opportunity[] } {
  const current: Opportunity[] = [];
  const past: Opportunity[] = [];
  for (const program of ds.programs) {
    const university = ds.universities.find((u) => u.id === program.universityId);
    const country = university && DESTINATIONS.find((c) => c.code === university.countryCode);
    if (!university || !country) continue;
    const base = { country, university, program };
    let hasCurrent = false;
    for (const s of ds.scholarships.filter((s) => s.programIds.includes(program.id))) {
      const status = deriveStatus(s, today);
      const row: Opportunity = { ...base, key: `${program.id}:${s.id}`, scholarship: s, status };
      if (status === "closed") past.push(row);
      else { current.push(row); hasCurrent = true; }
    }
    if (!hasCurrent) current.push({ ...base, key: `${program.id}:none`, scholarship: null, status: "unknown" });
  }
  return { current, past };
}

function matchesFunding(o: Opportunity, f: Filters): boolean {
  const s = o.scholarship;
  if (f.funding === "none") return s === null;
  if (f.funding !== "all") {
    if (!s) return false;
    const p = s.fundingPercentage;
    switch (f.funding) {
      case "fully_funded": if (s.fundingType !== "fully_funded") return false; break;
      case "full_tuition": if (s.fundingType !== "full_tuition") return false; break;
      case "75": if (!(s.fundingType === "partial" && p === 75)) return false; break;
      case "50": if (!(s.fundingType === "partial" && p === 50)) return false; break;
      case "25": if (!(s.fundingType === "partial" && p === 25)) return false; break;
      case "other_partial":
        if (!(s.fundingType === "other" || (s.fundingType === "partial" && (p === null || ![25, 50, 75].includes(p))))) return false;
        break;
    }
  }
  if (f.minPercent !== null) {
    if (!s || s.fundingPercentage === null || s.fundingPercentage < f.minPercent) return false;
  }
  return true;
}

export function applyFilters(rows: Opportunity[], f: Filters, residual: string[] = []): Opportunity[] {
  const out = rows.filter((o) => {
    const { program: p, university: u, scholarship: s } = o;
    if (f.countries.length && !f.countries.includes(o.country.code)) return false;
    if (f.degree && p.degreeLevel !== f.degree) return false;
    if (f.field && !p.fields.includes(f.field)) return false;
    if (f.intake && !p.intakes.some((i) => i.startsWith(f.intake!))) return false;
    if (f.englishOnly && p.englishTaught !== true) return false;
    if (f.noIelts && p.ieltsRequired !== false) return false;
    if (f.noWorkExperience && p.workExperienceRequired !== false) return false;
    if (f.noApplicationFee && p.applicationFee !== 0) return false;
    if (f.institutionType && u.type !== f.institutionType) return false;
    if (f.statuses.length && (!s || !f.statuses.includes(o.status))) return false;
    // Hide only scholarships we KNOW the student is ineligible for; unverified stays visible and is labelled.
    if (f.citizenship && s && eligibleFor(s, f.citizenship) === false) return false;
    if (!matchesFunding(o, f)) return false;
    if (residual.length) {
      const hay = [u.name, u.city, o.country.name, p.name, s?.name ?? "", s?.provider ?? ""].join(" ").toLowerCase();
      if (!residual.every((w) => hay.includes(w))) return false;
    }
    return true;
  });
  return sortRows(out, f.sort);
}

const STATUS_ORDER = { open: 0, upcoming: 1, expected: 2, unknown: 3, closed: 4 } as const;

function fundingRank(o: Opportunity): number {
  const s = o.scholarship;
  if (!s) return -1;
  if (s.fundingType === "fully_funded") return 200;
  return s.fundingPercentage ?? (s.fundingType === "other" ? 10 : 0);
}

export function sortRows(rows: Opportunity[], sort: Filters["sort"]): Opportunity[] {
  const copy = [...rows];
  if (sort === "name") return copy.sort((a, b) => a.university.name.localeCompare(b.university.name));
  if (sort === "funding") return copy.sort((a, b) => fundingRank(b) - fundingRank(a));
  return copy.sort((a, b) => {
    const so = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (so) return so;
    const da = a.scholarship?.deadline?.date ?? "9999";
    const db = b.scholarship?.deadline?.date ?? "9999";
    return da.localeCompare(db);
  });
}

export function countByStatus(rows: Opportunity[]) {
  return rows.reduce<Record<string, number>>((acc, r) => {
    if (r.scholarship) acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});
}
