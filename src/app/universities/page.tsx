import type { Metadata } from "next";
import Link from "next/link";
import { UniversityList } from "@/components/UniversityList";
import { countryByCode, DESTINATIONS } from "@/lib/reference";
import { countByUniversityDomain, listPublicScholarships } from "@/lib/scholarships";
import { getUniversities, normalizeName } from "@/lib/universities";
import { withParams } from "@/lib/url-state";

export const metadata: Metadata = { title: "Universities by country" };

const PAGE_SIZE = 40;

export default async function UniversitiesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const country = countryByCode(typeof sp.country === "string" ? sp.country : null);
  const q = typeof sp.q === "string" ? sp.q.slice(0, 100) : "";
  const pageParam = Number(typeof sp.page === "string" ? sp.page : 1) || 1;

  return (
    <div className="mx-auto max-w-page px-4 pb-16 pt-8">
      <h1 className="font-serif text-3xl text-ink">Universities{country ? ` in ${country.name}` : ""}</h1>
      <nav aria-label="Countries" className="mt-4 flex flex-wrap gap-2 text-sm">
        {DESTINATIONS.map((c) => (
          <Link key={c.code} href={`/universities?country=${c.code}`}
            className={`rounded-full border px-3 py-1 ${country?.code === c.code ? "border-ink bg-ink text-white" : "border-paper-line text-ink hover:border-ink"}`}>
            {c.name}
          </Link>
        ))}
      </nav>
      {country ? <CountryList code={country.code} q={q} page={pageParam} /> : <p className="mt-6 text-ink-soft">Choose a country.</p>}
    </div>
  );
}

async function CountryList({ code, q, page }: { code: string; q: string; page: number }) {
  const [{ items, error, origin }, pub] = await Promise.all([getUniversities(code), listPublicScholarships()]);
  const words = normalizeName(q).split(" ").filter(Boolean);
  const matched = items.filter((u) => words.every((w) => normalizeName(`${u.name} ${u.city ?? ""} ${u.officialDomain}`).includes(w)));
  const pages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE));
  const p = Math.min(Math.max(1, page), pages);
  return (
    <div className="mt-6">
      <form method="get" className="flex max-w-lg gap-2">
        <input type="hidden" name="country" value={code} />
        <input name="q" defaultValue={q} placeholder="Filter by name or city" className="w-full rounded-md border border-paper-line px-3 py-2 text-sm" aria-label="Filter universities" />
        <button className="rounded-md bg-ink px-4 py-2 text-sm text-white">Filter</button>
      </form>
      {error && items.length === 0 ? (
        <p className="mt-4 text-caution">{error}</p>
      ) : (
        <>
          <p className="mt-4 text-sm text-ink-soft">
            {matched.length} universities. Source: open Hipo list{origin === "database" ? " (synced to our database)" : " (cached server-side)"}.
          </p>
          <div className="mt-3"><UniversityList items={matched.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE)} scholarshipCounts={countByUniversityDomain(pub.items)} /></div>
          {pages > 1 && (
            <nav aria-label="Pages" className="mt-4 flex items-center justify-between text-sm">
              {p > 1 ? <Link className="text-route underline" href={withParams("/universities", { country: code, q, page: String(p - 1) })}>Previous</Link> : <span />}
              <span className="text-ink-soft">Page {p} of {pages}</span>
              {p < pages ? <Link className="text-route underline" href={withParams("/universities", { country: code, q, page: String(p + 1) })}>Next</Link> : <span />}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
