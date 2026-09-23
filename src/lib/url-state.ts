import { EMPTY_FILTERS, type AppStatus, type DegreeLevel, type Filters, type FundingFilter } from "./types";

type Params = Record<string, string | string[] | undefined>;

const DEGREES: DegreeLevel[] = ["BACHELOR", "MASTER", "PHD"];
const FUNDING: FundingFilter[] = ["all", "fully_funded", "full_tuition", "75", "50", "25", "other_partial", "tuition_waiver", "none"];
const STATUSES: AppStatus[] = ["OPEN", "UPCOMING", "NOT_ANNOUNCED", "UNKNOWN"];

function all(p: Params, k: string): string[] {
  const v = p[k];
  const arr = Array.isArray(v) ? v : v ? [v] : [];
  return arr.flatMap((x) => x.split(",")).map((x) => x.trim()).filter(Boolean);
}
function one(p: Params, k: string): string | null {
  return all(p, k)[0] ?? null;
}

/** Whitelists every query parameter. Unknown values are dropped, never trusted. */
export function paramsToFilters(p: Params): Filters {
  const degree = one(p, "degree")?.toUpperCase() as DegreeLevel | undefined;
  const funding = one(p, "funding") as FundingFilter | null;
  const min = one(p, "min");
  const intake = one(p, "intake");
  const page = Number(one(p, "page"));
  return {
    ...EMPTY_FILTERS,
    q: (one(p, "q") ?? "").slice(0, 200),
    countries: all(p, "country").map((c) => c.toUpperCase()).filter((c) => /^[A-Z]{2}$/.test(c)),
    university: one(p, "university")?.toLowerCase().match(/^[a-z0-9.-]+\.[a-z]{2,}$/)?.[0] ?? null,
    citizenship: one(p, "citizenship")?.toUpperCase().match(/^[A-Z]{2}$/)?.[0] ?? null,
    degree: degree && DEGREES.includes(degree) ? degree : null,
    field: one(p, "field")?.slice(0, 60) ?? null,
    intake: intake && /^20\d{2}(-\d{2})?$/.test(intake) ? intake : null,
    funding: funding && FUNDING.includes(funding) ? funding : "all",
    minPercent: min && /^\d{1,3}$/.test(min) && Number(min) > 0 ? Math.min(100, Number(min)) : null,
    statuses: all(p, "status").map((s) => s.toUpperCase()).filter((s): s is AppStatus => STATUSES.includes(s as AppStatus)),
    page: Number.isInteger(page) && page > 0 && page < 1000 ? page : 1,
  };
}

export function withParams(base: string, params: Record<string, string | string[] | null | undefined>): string {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined || v === "") continue;
    if (Array.isArray(v)) { if (v.length) u.set(k, v.join(",")); } else u.set(k, v);
  }
  const qs = u.toString();
  return qs ? `${base}?${qs}` : base;
}
