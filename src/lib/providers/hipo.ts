import { fetchJson, ProviderError } from "../http";
import { countryByCode, type Country } from "../reference";
import type { UniversityDataProvider, UniversityRecord } from "./types";

// The hosted Hipo API is free, keyless and HTTP-only, and Hipo asks bigger projects to
// avoid heavy use. We only call it server-side, cache results, and fall back to the same
// open dataset on GitHub (MIT) when the API is down or doesn't recognise a country name.
const API = "http://universities.hipolabs.com/search";
const DATASET = "https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json";

interface HipoRow {
  name: string;
  country: string;
  alpha_two_code: string;
  domains: string[] | null;
  web_pages: string[] | null;
  "state-province": string | null;
}

let datasetPromise: Promise<HipoRow[]> | null = null;
function dataset(): Promise<HipoRow[]> {
  datasetPromise ??= fetchJson<HipoRow[]>("Hipo dataset", DATASET, { timeoutMs: 25_000, retries: 1 });
  return datasetPromise.catch((e) => {
    datasetPromise = null;
    throw e;
  });
}

export function cleanDomain(d: string): string {
  return d.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/[/?#].*$/, "");
}

const fold = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function toRecord(r: HipoRow, sourceUrl: string, fetchedAt: string): UniversityRecord | null {
  const code = r.alpha_two_code?.toUpperCase();
  const pages = (r.web_pages ?? []).map((p) => p.trim()).filter((p) => /^https?:\/\//i.test(p));
  const domains = Array.from(new Set([...(r.domains ?? []), ...pages].map(cleanDomain).filter((d) => d.includes("."))));
  if (!r.name?.trim() || !code || domains.length === 0) return null;
  return {
    name: r.name.trim().replace(/\s+/g, " "),
    countryCode: code,
    country: countryByCode(code)?.name ?? r.country,
    state: r["state-province"]?.trim() || null,
    city: null,
    domains,
    officialDomain: domains[0],
    officialWebsite: pages[0] ?? null, // only a URL the source actually lists
    source: "HIPO",
    sourceUrl,
    openalexId: null, rorId: null, institutionType: null, worksCount: null, citedByCount: null,
    researchSource: null, researchSourceUrl: null,
    fetchedAt,
  };
}

function toRecords(rows: HipoRow[], sourceUrl: string): UniversityRecord[] {
  const at = new Date().toISOString();
  return rows.map((r) => toRecord(r, sourceUrl, at)).filter((r): r is UniversityRecord => r !== null);
}

export const hipoProvider: UniversityDataProvider = {
  id: "HIPO",

  async fetchByCountry(c: Country) {
    const url = `${API}?country=${encodeURIComponent(c.hipoName)}`;
    try {
      const rows = (await fetchJson<HipoRow[]>("Hipo API", url)).filter((r) => r.alpha_two_code?.toUpperCase() === c.code);
      if (rows.length) return toRecords(rows, url);
      // Empty usually means the country name differs in Hipo's list (e.g. "Turkiye"); match by ISO code instead.
    } catch (e) {
      if (e instanceof ProviderError && e.kind === "rate_limited") console.warn("[hipo] rate limited; using dataset");
      else console.warn("[hipo] API failed; using dataset:", (e as Error).message);
    }
    return toRecords((await dataset()).filter((r) => r.alpha_two_code?.toUpperCase() === c.code), DATASET);
  },

  async searchByName(name: string) {
    const url = `${API}?name=${encodeURIComponent(name)}`;
    try {
      return toRecords(await fetchJson<HipoRow[]>("Hipo API", url), url);
    } catch (e) {
      console.warn("[hipo] name search failed; using dataset:", (e as Error).message);
    }
    const q = fold(name);
    return toRecords((await dataset()).filter((r) => fold(r.name ?? "").includes(q)), DATASET);
  },
};
