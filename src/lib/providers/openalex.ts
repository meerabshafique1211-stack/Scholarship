import type { UniversityEnrichmentProvider, UniversityRecord } from "./types";
import { cleanDomain } from "./hipo";

// OpenAlex requires a (free) API key since Feb 2026. Enrichment is off without one.
const BASE = "https://api.openalex.org/institutions";

interface Inst {
  id: string;
  ror: string | null;
  display_name: string;
  homepage_url: string | null;
  geo: { city: string | null; region: string | null } | null;
  works_count: number | null;
  cited_by_count: number | null;
}

function matches(host: string, domain: string): boolean {
  return host === domain || host.endsWith("." + domain) || domain.endsWith("." + host);
}

export const openAlexProvider: UniversityEnrichmentProvider = {
  id: "OPENALEX",
  enabled: () => Boolean(process.env.OPENALEX_API_KEY),
  async enrich(c, records) {
    const key = process.env.OPENALEX_API_KEY;
    if (!key) return records;
    const insts: Inst[] = [];
    let cursor: string | null = "*";
    for (let page = 0; page < 10 && cursor; page++) {
      const url =
        `${BASE}?filter=country_code:${c.code},type:education&per_page=200` +
        `&select=id,ror,display_name,homepage_url,geo,works_count,cited_by_count` +
        `&cursor=${encodeURIComponent(cursor)}&api_key=${encodeURIComponent(key)}`;
      const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(15_000) });
      if (!res.ok) {
        console.warn(`[openalex] ${res.status} for ${c.code}; enrichment skipped for remaining pages`);
        break;
      }
      const json = (await res.json()) as { results: Inst[]; meta?: { next_cursor?: string | null } };
      insts.push(...json.results);
      cursor = json.results.length ? json.meta?.next_cursor ?? null : null;
    }
    const withHost = insts
      .map((i) => ({ i, host: i.homepage_url ? cleanDomain(i.homepage_url) : null }))
      .filter((x): x is { i: Inst; host: string } => Boolean(x.host));

    return records.map((r): UniversityRecord => {
      const hit = withHost.find(({ host }) => r.domains.some((d) => matches(host, d)));
      if (!hit) return r;
      return {
        ...r,
        city: hit.i.geo?.city ?? r.city,
        state: r.state ?? hit.i.geo?.region ?? null,
        openalexId: hit.i.id,
        rorId: hit.i.ror,
        worksCount: hit.i.works_count,
        citedByCount: hit.i.cited_by_count,
        researchSource: "OPENALEX",
        researchSourceUrl: hit.i.id, // canonical OpenAlex URL, e.g. https://openalex.org/I123
      };
    });
  },
};
