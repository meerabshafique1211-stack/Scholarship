import { EMPTY_FILTERS, type AppStatus, type DegreeLevel, type Filters, type FundingFilter } from "./types";

// Filters live in the URL so results are shareable and SEO-crawlable.
export function filtersToParams(f: Filters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.countries.length) p.set("country", f.countries.join(","));
  if (f.citizenship) p.set("citizenship", f.citizenship);
  if (f.degree) p.set("degree", f.degree);
  if (f.field) p.set("field", f.field);
  if (f.intake) p.set("intake", f.intake);
  if (f.funding !== "all") p.set("funding", f.funding);
  if (f.minPercent !== null) p.set("min", String(f.minPercent));
  if (f.statuses.length) p.set("status", f.statuses.join(","));
  if (f.englishOnly) p.set("english", "1");
  if (f.noIelts) p.set("noielts", "1");
  if (f.noWorkExperience) p.set("noexp", "1");
  if (f.noApplicationFee) p.set("nofee", "1");
  if (f.institutionType) p.set("type", f.institutionType);
  if (f.sort !== "deadline") p.set("sort", f.sort);
  return p;
}

const DEGREES: DegreeLevel[] = ["bachelor", "master", "phd"];
const FUNDING: FundingFilter[] = ["all", "fully_funded", "full_tuition", "75", "50", "25", "other_partial", "none"];
const STATUSES: AppStatus[] = ["open", "upcoming", "expected", "closed", "unknown"];

export function paramsToFilters(p: URLSearchParams): Filters {
  const list = (k: string) => (p.get(k) ?? "").split(",").filter(Boolean);
  const degree = p.get("degree") as DegreeLevel | null;
  const funding = p.get("funding") as FundingFilter | null;
  const min = p.get("min");
  const type = p.get("type");
  const sort = p.get("sort");
  return {
    ...EMPTY_FILTERS,
    q: (p.get("q") ?? "").slice(0, 200),
    countries: list("country").map((c) => c.toUpperCase().slice(0, 2)),
    citizenship: p.get("citizenship")?.toUpperCase().slice(0, 2) ?? null,
    degree: degree && DEGREES.includes(degree) ? degree : null,
    field: p.get("field")?.slice(0, 60) ?? null,
    intake: /^20\d{2}(-\d{2})?$/.test(p.get("intake") ?? "") ? p.get("intake") : null,
    funding: funding && FUNDING.includes(funding) ? funding : "all",
    minPercent: min && /^\d{1,3}$/.test(min) ? Math.min(100, Number(min)) : null,
    statuses: list("status").filter((s): s is AppStatus => STATUSES.includes(s as AppStatus)),
    englishOnly: p.get("english") === "1",
    noIelts: p.get("noielts") === "1",
    noWorkExperience: p.get("noexp") === "1",
    noApplicationFee: p.get("nofee") === "1",
    institutionType: type === "public" || type === "private" ? type : null,
    sort: sort === "funding" || sort === "name" ? sort : "deadline",
  };
}
