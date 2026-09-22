import type { Country } from "../reference";
import type { UniversityDataProvider, UniversityRecord } from "./types";

// Hipo's hosted API is HTTP-only and Hipo asks larger projects not to lean on it heavily,
// so results are cached server-side (see universities.ts) and the open GitHub copy of the
// same dataset is used as a fallback when the API is unavailable.
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

async function fromApi(c: Country): Promise<HipoRow[]> {
  const res = await fetch(`${API}?country=${encodeURIComponent(c.hipoName)}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Hipo API ${res.status}`);
  return (await res.json()) as HipoRow[];
}

async function fromDataset(): Promise<HipoRow[]> {
  datasetPromise ??= fetch(DATASET, { cache: "no-store", signal: AbortSignal.timeout(25_000) }).then(async (r) => {
    if (!r.ok) throw new Error(`Hipo dataset ${r.status}`);
    return (await r.json()) as HipoRow[];
  });
  try {
    return await datasetPromise;
  } catch (e) {
    datasetPromise = null;
    throw e;
  }
}

export function cleanDomain(d: string): string {
  return d.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
}

function toRecord(r: HipoRow, c: Country, sourceUrl: string, fetchedAt: string): UniversityRecord | null {
  const pages = (r.web_pages ?? []).filter(Boolean);
  const domains = Array.from(new Set([...(r.domains ?? []), ...pages].map(cleanDomain).filter((d) => d.includes("."))));
  if (!r.name?.trim() || domains.length === 0) return null;
  return {
    name: r.name.trim().replace(/\s+/g, " "),
    countryCode: c.code,
    country: c.name,
    state: r["state-province"]?.trim() || null,
    city: null,
    domains,
    officialDomain: domains[0],
    officialWebsite: pages[0] ?? `https://${domains[0]}`,
    source: "HIPO",
    sourceUrl,
    openalexId: null,
    rorId: null,
    worksCount: null,
    citedByCount: null,
    researchSource: null,
    researchSourceUrl: null,
    fetchedAt,
  };
}

export const hipoProvider: UniversityDataProvider = {
  id: "HIPO",
  async fetchByCountry(c) {
    const fetchedAt = new Date().toISOString();
    let rows: HipoRow[];
    let sourceUrl: string;
    try {
      rows = await fromApi(c);
      sourceUrl = `${API}?country=${encodeURIComponent(c.hipoName)}`;
      if (rows.length === 0) throw new Error("empty API response");
    } catch (err) {
      console.warn(`[hipo] API failed for ${c.code}, using dataset:`, (err as Error).message);
      rows = await fromDataset();
      sourceUrl = DATASET;
    }
    return rows
      .filter((r) => r.alpha_two_code?.toUpperCase() === c.code)
      .map((r) => toRecord(r, c, sourceUrl, fetchedAt))
      .filter((r): r is UniversityRecord => r !== null);
  },
};
