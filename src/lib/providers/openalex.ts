import { fetchJson, ProviderError } from "../http";
import type { UniversityEnrichmentProvider, UniversityRecord } from "./types";
import { cleanDomain } from "./hipo";

// OpenAlex needs a free API key (since Feb 2026), read ONLY from the server env var
// OPENALEX_API_KEY. It is never sent to the browser. Research metrics are academic
// output indicators, not employment data, and are labelled that way in the UI.
const BASE = "https://api.openalex.org/institutions";
const SELECT = "id,ror,display_name,homepage_url,geo,type,works_count,cited_by_count";

interface Inst {
  id: string;
  ror: string | null;
  display_name: string;
  homepage_url: string | null;
  geo: { city: string | null; region: string | null; country_code: string | null } | null;
  type: string | null;
  works_count: number | null;
  cited_by_count: number | null;
}

const key = () => process.env.OPENALEX_API_KEY ?? "";

function domainMatch(host: string, domain: string): boolean {
  return host === domain || host.endsWith("." + domain) || domain.endsWith("." + host);
}

function apply(r: UniversityRecord, i: Inst): UniversityRecord {
  return {
    ...r,
    city: i.geo?.city ?? r.city,
    state: r.state ?? i.geo?.region ?? null,
    openalexId: i.id,
    rorId: i.ror,
    institutionType: i.type,
    worksCount: i.works_count,
    citedByCount: i.cited_by_count,
    researchSource: "OPENALEX",
    researchSourceUrl: i.id, // canonical https://openalex.org/I… page
  };
}

function findMatch(r: UniversityRecord, insts: Inst[]): Inst | undefined {
  return insts.find((i) => i.homepage_url && r.domains.some((d) => domainMatch(cleanDomain(i.homepage_url!), d)));
}

export const openAlexProvider: UniversityEnrichmentProvider = {
  id: "OPENALEX",
  enabled: () => key().length > 0,

  /** Country-wide enrichment used by the database sync (≤10 list requests per country). */
  async enrich(c, records) {
    if (!key()) return records;
    const insts: Inst[] = [];
    let cursor: string | null = "*";
    for (let page = 0; page < 10 && cursor; page++) {
      const url: string = `${BASE}?filter=country_code:${c.code},type:education&per_page=200&select=${SELECT}&cursor=${encodeURIComponent(cursor)}&api_key=${encodeURIComponent(key())}`;
      try {
        const json: { results: Inst[]; meta?: { next_cursor?: string | null } } = await fetchJson("OpenAlex", url, { timeoutMs: 15_000, retries: 1 });
        insts.push(...json.results);
        cursor = json.results.length ? json.meta?.next_cursor ?? null : null;
      } catch (e) {
        console.warn(`[openalex] ${c.code} enrichment stopped:`, (e as Error).message);
        break;
      }
    }
    return records.map((r) => {
      const m = findMatch(r, insts);
      return m ? apply(r, m) : r;
    });
  },

  /** Single-institution lookup for the details page: one search request, matched by domain. */
  async lookup(r) {
    if (!key()) return r;
    const url = `${BASE}?search=${encodeURIComponent(r.name)}&filter=country_code:${r.countryCode}&per_page=10&select=${SELECT}&api_key=${encodeURIComponent(key())}`;
    try {
      const json = await fetchJson<{ results: Inst[] }>("OpenAlex", url, { timeoutMs: 8_000, retries: 1 });
      const m = findMatch(r, json.results);
      return m ? apply(r, m) : r; // no domain match → no enrichment (never guess by name alone)
    } catch (e) {
      if (!(e instanceof ProviderError && e.kind === "rate_limited")) console.warn("[openalex] lookup failed:", (e as Error).message);
      return r;
    }
  },
};
