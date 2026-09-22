import { unstable_cache } from "next/cache";
import { db, hasDb } from "./db";
import { countryByCode } from "./reference";
import { hipoProvider } from "./providers/hipo";
import { openAlexProvider } from "./providers/openalex";
import type { UniversityDataProvider, UniversityEnrichmentProvider, UniversityRecord } from "./providers/types";
import type { UniversityView } from "./types";

// To add a source (e.g. a national registry), implement one of these interfaces and list it here.
const PROVIDERS: UniversityDataProvider[] = [hipoProvider];
const ENRICHERS: UniversityEnrichmentProvider[] = [openAlexProvider];

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

/** Same institution if it shares any domain, or the same normalized name in the same country. */
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

/** Fetches fresh data from all providers for one country (used by sync and the cache). */
export async function collectFromProviders(countryCode: string): Promise<UniversityRecord[]> {
  const c = countryByCode(countryCode);
  if (!c) return [];
  const all: UniversityRecord[] = [];
  const errors: string[] = [];
  for (const p of PROVIDERS) {
    try {
      all.push(...(await p.fetchByCountry(c)));
    } catch (e) {
      errors.push(`${p.id}: ${(e as Error).message}`);
    }
  }
  if (all.length === 0 && errors.length) throw new Error(errors.join("; "));
  let out = dedupe(all);
  for (const e of ENRICHERS) {
    if (!e.enabled()) continue;
    try {
      out = await e.enrich(c, out);
    } catch (err) {
      console.warn(`[${e.id}] enrichment failed for ${c.code}:`, (err as Error).message);
    }
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

// API → server cache (7 days) → pages. Users never trigger provider calls directly
// except on a cold cache, and each country is fetched at most once per week.
const cachedCollect = unstable_cache(collectFromProviders, ["universities-by-country-v2"], {
  revalidate: 60 * 60 * 24 * 7,
  tags: ["universities"],
});

function fromRecord(r: UniversityRecord): UniversityView {
  return {
    key: r.officialDomain, name: r.name, countryCode: r.countryCode, country: r.country,
    city: r.city, state: r.state, officialWebsite: r.officialWebsite, officialDomain: r.officialDomain,
    openalexId: r.openalexId, rorId: r.rorId, worksCount: r.worksCount, citedByCount: r.citedByCount,
    source: r.source, sourceUrl: r.sourceUrl, researchSource: r.researchSource, researchSourceUrl: r.researchSourceUrl,
    lastVerifiedAt: r.fetchedAt, verificationStatus: "IMPORTED",
  };
}

export interface UniversityResult {
  items: UniversityView[];
  origin: "database" | "provider";
  error: string | null;
}

/** Database first (synced records); provider cache when the country hasn't been synced yet. */
export async function getUniversities(countryCode: string): Promise<UniversityResult> {
  if (hasDb()) {
    try {
      const rows = await db().university.findMany({
        where: { countryCode, verificationStatus: { not: "REJECTED" } },
        orderBy: { name: "asc" },
      });
      if (rows.length) {
        return {
          origin: "database",
          error: null,
          items: rows.map((r) => ({
            key: r.officialDomain, name: r.name, countryCode: r.countryCode, country: r.country,
            city: r.city, state: r.state, officialWebsite: r.officialWebsite, officialDomain: r.officialDomain,
            openalexId: r.openalexId, rorId: r.rorId, worksCount: r.worksCount, citedByCount: r.citedByCount,
            source: r.source, sourceUrl: r.sourceUrl, researchSource: r.researchSource, researchSourceUrl: r.researchSourceUrl,
            lastVerifiedAt: r.lastVerifiedAt.toISOString(),
            verificationStatus: r.verificationStatus === "VERIFIED" ? "VERIFIED" : "IMPORTED",
          })),
        };
      }
    } catch (e) {
      console.error("[universities] database read failed:", e);
    }
  }
  try {
    return { origin: "provider", error: null, items: (await cachedCollect(countryCode)).map(fromRecord) };
  } catch (e) {
    console.error("[universities] providers failed:", e);
    return { origin: "provider", error: "The university data source is temporarily unavailable. Please try again later.", items: [] };
  }
}

/** Upserts one country into the database. Admin-rejected records are never revived. */
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
            city: r.city, openalexId: r.openalexId, rorId: r.rorId, worksCount: r.worksCount,
            citedByCount: r.citedByCount, researchSource: r.researchSource, researchSourceUrl: r.researchSourceUrl, lastVerifiedAt: now,
          },
          });
          updated++;
        } catch {
          skipped++; // e.g. OpenAlex ID already linked to another record — left for admin review
        }
      }
    }
    if (toCreate.length) {
      await db().university.createMany({
        skipDuplicates: true,
        data: toCreate.map((r) => ({
          name: r.name, normalizedName: normalizeName(r.name), countryCode: r.countryCode, country: r.country,
          city: r.city, state: r.state, officialWebsite: r.officialWebsite, officialDomain: r.officialDomain,
          domains: r.domains, openalexId: r.openalexId, rorId: r.rorId, worksCount: r.worksCount,
          citedByCount: r.citedByCount, source: r.source, sourceUrl: r.sourceUrl, researchSource: r.researchSource,
          researchSourceUrl: r.researchSourceUrl, lastVerifiedAt: now,
        })),
      });
    }
    // Refresh the "last checked against source" date for every record still present in the source.
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
