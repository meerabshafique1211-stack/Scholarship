import { unstable_cache } from "next/cache";
import { db, hasDb } from "./db";
import { ProviderError } from "./http";
import { parseQuery } from "./query-parser";
import { countryByCode } from "./reference";
import { cleanDomain, hipoProvider } from "./providers/hipo";
import { openAlexProvider } from "./providers/openalex";
import type { UniversityDataProvider, UniversityEnrichmentProvider, UniversityRecord } from "./providers/types";
import type { UniversityView } from "./types";

// Register additional trusted sources here (e.g. an OfficialUniversityProvider for a national registry).
const PROVIDERS: UniversityDataProvider[] = [hipoProvider];
const ENRICHERS: UniversityEnrichmentProvider[] = [openAlexProvider];

export const UNAVAILABLE = "University data is temporarily unavailable. Please try again.";

export function normalizeName(name: string): string {
  return name
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\b(the)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const universityId = (countryCode: string, domain: string) => `${countryCode.toLowerCase()}-${domain}`;

/** Same institution when any domain is shared, or the normalized name matches within one country. */
export function dedupe(records: UniversityRecord[]): UniversityRecord[] {
  const out: UniversityRecord[] = [];
  const byDomain = new Map<string, UniversityRecord>();
  const byName = new Map<string, UniversityRecord>();
  for (const r of records) {
    const nameKey = `${r.countryCode}:${normalizeName(r.name)}`;
    const existing = r.domains.map((d) => byDomain.get(d)).find(Boolean) ?? byName.get(nameKey);
    if (existing) {
      for (const d of r.domains) if (!existing.domains.includes(d)) existing.domains.push(d);
      for (const d of existing.domains) byDomain.set(d, existing);
      continue;
    }
    const copy = { ...r, domains: [...r.domains] };
    out.push(copy);
    for (const d of copy.domains) byDomain.set(d, copy);
    byName.set(nameKey, copy);
  }
  return out;
}

function toView(r: UniversityRecord, status: "IMPORTED" | "VERIFIED" = "IMPORTED", lastVerifiedAt?: string): UniversityView {
  return {
    id: universityId(r.countryCode, r.officialDomain),
    key: r.officialDomain,
    name: r.name, countryCode: r.countryCode, country: r.country, city: r.city, state: r.state,
    officialWebsite: r.officialWebsite, officialDomain: r.officialDomain, domains: r.domains,
    openalexId: r.openalexId, rorId: r.rorId, institutionType: r.institutionType,
    worksCount: r.worksCount, citedByCount: r.citedByCount,
    source: r.source, sourceUrl: r.sourceUrl, researchSource: r.researchSource, researchSourceUrl: r.researchSourceUrl,
    lastVerifiedAt: lastVerifiedAt ?? r.fetchedAt, verificationStatus: status,
  };
}

// ───────────── Provider pipeline (server-side only, cached) ─────────────

export async function collectFromProviders(countryCode: string, { enrich = true } = {}): Promise<UniversityRecord[]> {
  const c = countryByCode(countryCode);
  if (!c) return [];
  const all: UniversityRecord[] = [];
  const errors: Error[] = [];
  for (const p of PROVIDERS) {
    try {
      all.push(...(await p.fetchByCountry(c)));
    } catch (e) {
      errors.push(e as Error);
    }
  }
  if (all.length === 0 && errors.length) throw errors[0];
  let out = dedupe(all);
  if (enrich) {
    for (const e of ENRICHERS) {
      if (!e.enabled()) continue;
      try {
        out = await e.enrich(c, out);
      } catch (err) {
        console.warn(`[${e.id}] enrichment failed for ${c.code}:`, (err as Error).message);
      }
    }
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

// Country lists change rarely: cache 7 days. Page views never call providers directly on a warm cache.
const cachedCountry = unstable_cache((cc: string) => collectFromProviders(cc, { enrich: false }), ["hipo-country-v3"], {
  revalidate: 60 * 60 * 24 * 7,
  tags: ["universities"],
});

const cachedNameSearch = unstable_cache(
  async (q: string) => {
    const all: UniversityRecord[] = [];
    const errors: Error[] = [];
    for (const p of PROVIDERS) {
      try {
        all.push(...(await p.searchByName(q)));
      } catch (e) {
        errors.push(e as Error);
      }
    }
    if (all.length === 0 && errors.length) throw errors[0];
    return dedupe(all).sort((a, b) => a.name.localeCompare(b.name));
  },
  ["hipo-name-v3"],
  { revalidate: 60 * 60 * 24, tags: ["universities"] },
);

const cachedLookup = unstable_cache(
  async (r: UniversityRecord) => {
    let out = r;
    for (const e of ENRICHERS) if (e.enabled()) out = await e.lookup(out);
    return out;
  },
  ["openalex-lookup-v1"],
  { revalidate: 60 * 60 * 24 * 30, tags: ["universities"] },
);

// ───────────── Reads ─────────────

export interface UniversityResult {
  items: UniversityView[];
  origin: "database" | "provider";
  error: string | null;
}

/** All universities for a country: database (synced) first, then the cached provider pipeline. */
export async function getUniversities(countryCode: string): Promise<UniversityResult> {
  if (hasDb()) {
    try {
      const rows = await db().university.findMany({ where: { countryCode, verificationStatus: { not: "REJECTED" } }, orderBy: { name: "asc" } });
      if (rows.length) {
        return {
          origin: "database",
          error: null,
          items: rows.map((r) =>
            toView(
              {
                name: r.name, countryCode: r.countryCode, country: r.country, state: r.state, city: r.city, domains: r.domains,
                officialDomain: r.officialDomain, officialWebsite: r.officialWebsite, source: r.source as "HIPO",
                sourceUrl: r.sourceUrl, openalexId: r.openalexId, rorId: r.rorId, institutionType: r.institutionType,
                worksCount: r.worksCount, citedByCount: r.citedByCount, researchSource: r.researchSource as "OPENALEX" | null,
                researchSourceUrl: r.researchSourceUrl, fetchedAt: r.lastVerifiedAt.toISOString(),
              },
              r.verificationStatus === "VERIFIED" ? "VERIFIED" : "IMPORTED",
            ),
          ),
        };
      }
    } catch (e) {
      console.error("[universities] database read failed:", e);
    }
  }
  try {
    return { origin: "provider", error: null, items: (await cachedCountry(countryCode)).map((r) => toView(r)) };
  } catch (e) {
    console.error("[universities] providers failed:", e);
    return { origin: "provider", error: UNAVAILABLE, items: [] };
  }
}

export interface SearchParams {
  query: string;
  countryCode: string | null;
  page: number;
  pageSize: number;
}

export interface SearchResult {
  items: UniversityView[];
  total: number;
  page: number;
  pageSize: number;
  hint: "field_of_study" | "too_short" | null;
  error: string | null;
}

/**
 * University NAME search. Fields of study ("computer science") are not institution names,
 * so they are never sent to Hipo; the caller gets a hint to use scholarship search instead.
 */
export async function searchUniversities(params: SearchParams): Promise<SearchResult> {
  const { page, pageSize } = params;
  const q = params.query.trim().replace(/\s+/g, " ").slice(0, 100);
  const base = { page, pageSize, total: 0, items: [] as UniversityView[] };
  const parsed = q ? parseQuery(q) : null;

  // "computer science" is a field of study, not an institution name: never send it to Hipo.
  if (parsed?.field && parsed.residual.length === 0 && parsed.countries.length === 0) {
    return { ...base, hint: "field_of_study", error: null };
  }

  // A country named in the text ("Pakistan", "universities in Italy") selects that country.
  let countryCode = params.countryCode;
  let nameWords = normalizeName(q).split(" ").filter(Boolean);
  if (parsed && parsed.countries.length === 1) {
    countryCode ??= parsed.countries[0];
    nameWords = parsed.residual.map(normalizeName).filter(Boolean);
  }
  if (!countryCode && q.length < 2) return { ...base, hint: "too_short", error: null };

  let items: UniversityView[];
  if (countryCode) {
    const r = await getUniversities(countryCode);
    if (r.error) return { ...base, hint: null, error: r.error };
    items = r.items.filter((u) => {
      const hay = normalizeName(`${u.name} ${u.city ?? ""} ${u.state ?? ""} ${u.domains.join(" ")}`);
      return nameWords.every((w) => hay.includes(w));
    });
  } else {
    try {
      items = (await cachedNameSearch(q)).map((r) => toView(r));
    } catch (e) {
      console.error("[universities] name search failed:", e instanceof ProviderError ? `${e.kind} ${e.status}` : e);
      return { ...base, hint: null, error: UNAVAILABLE };
    }
  }
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total: items.length, page, pageSize, hint: null, error: null };
}

/** Details page lookup by stable id "<cc>-<domain>". Returns null if the source doesn't list it. */
export async function getUniversityById(id: string): Promise<{ university: UniversityView | null; error: string | null }> {
  const m = /^([a-z]{2})-([a-z0-9.-]+\.[a-z]{2,})$/i.exec(id);
  const c = m && countryByCode(m[1]);
  if (!m || !c) return { university: null, error: null };
  const domain = cleanDomain(m[2]);
  const list = await getUniversities(c.code);
  if (list.error) return { university: null, error: list.error };
  const u = list.items.find((x) => x.officialDomain === domain || x.domains.includes(domain));
  if (!u) return { university: null, error: null };
  if (u.researchSource) return { university: u, error: null };
  // One OpenAlex request (cached 30 days) for this institution only.
  const rec: UniversityRecord = {
    name: u.name, countryCode: u.countryCode, country: u.country, state: u.state, city: u.city, domains: u.domains,
    officialDomain: u.officialDomain, officialWebsite: u.officialWebsite, source: u.source as "HIPO", sourceUrl: u.sourceUrl,
    openalexId: null, rorId: null, institutionType: null, worksCount: null, citedByCount: null, researchSource: null,
    researchSourceUrl: null, fetchedAt: u.lastVerifiedAt,
  };
  const enriched = await cachedLookup(rec).catch(() => rec);
  return { university: toView(enriched, u.verificationStatus, u.lastVerifiedAt), error: null };
}

// ───────────── Database sync (admin button + daily cron) ─────────────

export async function syncCountry(countryCode: string): Promise<{ inserted: number; updated: number; skipped: number }> {
  if (!hasDb()) throw new Error("DATABASE_URL is not configured");
  const run = await db().syncRun.create({ data: { job: "universities", countryCode, provider: PROVIDERS.map((p) => p.id).join("+") } });
  try {
    const records = await collectFromProviders(countryCode);
    const existing = await db().university.findMany({
      where: { OR: [{ countryCode }, { officialDomain: { in: records.map((r) => r.officialDomain) } }] },
      select: { id: true, officialDomain: true, normalizedName: true, countryCode: true, verificationStatus: true },
    });
    const byDomain = new Map(existing.map((e) => [e.officialDomain, e]));
    const byName = new Map(existing.map((e) => [`${e.countryCode}:${e.normalizedName}`, e]));
    const now = new Date();
    const toCreate: UniversityRecord[] = [];
    let updated = 0;
    let skipped = 0;
    for (const r of records) {
      const match = byDomain.get(r.officialDomain) ?? byName.get(`${r.countryCode}:${normalizeName(r.name)}`);
      if (!match) { toCreate.push(r); continue; }
      if (match.verificationStatus === "REJECTED") { skipped++; continue; }
      if (r.researchSource) {
        try {
          await db().university.update({
            where: { id: match.id },
            data: {
              city: r.city, openalexId: r.openalexId, rorId: r.rorId, institutionType: r.institutionType, worksCount: r.worksCount,
              citedByCount: r.citedByCount, researchSource: r.researchSource, researchSourceUrl: r.researchSourceUrl, lastVerifiedAt: now,
            },
          });
          updated++;
        } catch {
          skipped++; // e.g. OpenAlex ID already linked to another record
        }
      }
    }
    if (toCreate.length) {
      await db().university.createMany({
        skipDuplicates: true,
        data: toCreate.map((r) => ({
          name: r.name, normalizedName: normalizeName(r.name), countryCode: r.countryCode, country: r.country,
          city: r.city, state: r.state, officialWebsite: r.officialWebsite, officialDomain: r.officialDomain,
          domains: r.domains, openalexId: r.openalexId, rorId: r.rorId, institutionType: r.institutionType,
          worksCount: r.worksCount, citedByCount: r.citedByCount, source: r.source, sourceUrl: r.sourceUrl,
          researchSource: r.researchSource, researchSourceUrl: r.researchSourceUrl, lastVerifiedAt: now,
        })),
      });
    }
    await db().university.updateMany({
      where: { officialDomain: { in: records.map((r) => r.officialDomain) }, verificationStatus: { not: "REJECTED" } },
      data: { lastVerifiedAt: now },
    });
    const result = { inserted: toCreate.length, updated, skipped };
    await db().syncRun.update({ where: { id: run.id }, data: { ...result, finishedAt: new Date() } });
    return result;
  } catch (e) {
    await db().syncRun.update({ where: { id: run.id }, data: { error: (e as Error).message.slice(0, 500), finishedAt: new Date() } });
    throw e;
  }
}
