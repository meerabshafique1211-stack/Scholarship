import type { Metadata } from "next";
import Link from "next/link";
import { ResponsiveAd } from "@/components/ads/AdSlot";
import { EmptyState } from "@/components/EmptyState";
import { FilterForm } from "@/components/FilterForm";
import { ScholarshipCard } from "@/components/ScholarshipCard";
import { UniversityCard } from "@/components/UniversityCard";
import { filterScholarships } from "@/lib/filter";
import { applyParsed, parseQuery } from "@/lib/query-parser";
import { countryName } from "@/lib/reference";
import { countByUniversityDomain, listPublicScholarships } from "@/lib/scholarships";
import { searchUniversities } from "@/lib/universities";
import { paramsToFilters, withParams } from "@/lib/url-state";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const hasParams = Object.keys(await searchParams).length > 0;
  return {
    title: "Search verified scholarships and universities",
    description: "Filter verified scholarships by country, degree, field, funding and application status, and find real universities.",
    alternates: { canonical: "/search" },
    robots: hasParams ? { index: false, follow: true } : undefined,
  };
}

const PAGE_SIZE = 30;

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = paramsToFilters(await searchParams);
  const parsed = parseQuery(raw.q);
  const f = applyParsed(raw, parsed);

  const pub = await listPublicScholarships();
  const scholarships = f.funding === "none" ? [] : filterScholarships(pub.items, f, parsed.residual);

  // University section: separate from scholarship search. Name words left over after the
  // parser removed field/degree/funding terms are matched against institution names only.
  const nameQuery = parsed.residual.join(" ");
  const uniCountry = f.countries.length === 1 ? f.countries[0] : null;
  const uni = uniCountry || nameQuery.length >= 2
    ? await searchUniversities({ query: nameQuery, countryCode: uniCountry, page: f.page, pageSize: PAGE_SIZE })
    : null;
  const pages = uni ? Math.max(1, Math.ceil(uni.total / PAGE_SIZE)) : 1;
  const page = uni?.page ?? 1;
  const counts = countByUniversityDomain(pub.items);

  const base = { q: raw.q, country: f.countries, university: f.university, citizenship: f.citizenship, degree: f.degree, field: f.field, intake: f.intake, funding: f.funding === "all" ? null : f.funding, min: f.minPercent ? String(f.minPercent) : null, status: f.statuses };

  return (
    <div className="mx-auto max-w-page px-4 pb-16 pt-6">
      <form action="/search" method="get" role="search" className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="q" className="sr-only">Search university, country, scholarship or program</label>
        <input id="q" name="q" defaultValue={raw.q} maxLength={200} placeholder="Search university, country, scholarship or program"
          className="w-full rounded-md border border-ink/30 bg-paper px-4 py-3 text-ink placeholder:text-ink-faint" />
        {raw.countries.map((c) => <input key={c} type="hidden" name="country" value={c} />)}
        {raw.citizenship && <input type="hidden" name="citizenship" value={raw.citizenship} />}
        <button className="rounded-md bg-ink px-5 py-3 font-medium text-white hover:bg-ink-soft">Search</button>
      </form>

      <div className="mt-6 grid gap-8 lg:grid-cols-[17rem_1fr]">
        <aside>
          <details className="lg:hidden">
            <summary className="mb-3 cursor-pointer rounded-md border border-paper-line px-3 py-2 text-sm font-medium">Filters</summary>
            <FilterForm f={f} />
          </details>
          <div className="hidden lg:block"><FilterForm f={f} /></div>
        </aside>

        <div className="min-w-0 space-y-12">
          <section aria-labelledby="sch-heading">
            <h1 id="sch-heading" className="font-serif text-2xl text-ink">
              {f.funding === "none"
                ? "Scholarships hidden (No scholarship selected)"
                : `${scholarships.length} verified scholarship${scholarships.length === 1 ? "" : "s"} found`}
            </h1>
            {pub.error && <p className="mt-2 text-sm text-caution">{pub.error}</p>}
            {f.funding !== "none" && (scholarships.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  title="No verified scholarships found for your selected criteria."
                  links={[
                    { href: withParams("/search", { ...base, country: [] }), label: "Change country" },
                    { href: withParams("/search", { ...base, degree: null }), label: "Change degree" },
                    { href: withParams("/search", { ...base, funding: null, min: null }), label: "Remove funding filter" },
                    { href: withParams("/universities", { country: f.countries[0] ?? null }), label: "View universities" },
                    { href: "/scholarships/upcoming", label: "View upcoming scholarships" },
                  ]}
                />
              </div>
            ) : (
              <ul className="mt-4 space-y-4">
                {scholarships.map(({ s, status }, i) => (
                  <li key={s.id}>
                    <ScholarshipCard s={s} status={status} citizenship={f.citizenship} />
                    {i === 2 && scholarships.length > 4 && <ResponsiveAd />}
                  </li>
                ))}
              </ul>
            ))}
          </section>

          <section aria-labelledby="uni-heading">
            <h2 id="uni-heading" className="font-serif text-2xl text-ink">
              {uni && !uni.error ? `${uni.total} universit${uni.total === 1 ? "y" : "ies"}${uniCountry ? ` in ${countryName(uniCountry)}` : ""}${nameQuery ? ` matching “${nameQuery}”` : ""}` : "Universities"}
            </h2>
            {!uni ? (
              <p className="mt-2 text-ink-soft">
                {f.countries.length > 1 ? "Choose a single country to list its universities, or " : "Choose a country to list its universities, or "}
                <Link href="/universities" className="text-route underline">search universities by name</Link>.
              </p>
            ) : uni.error ? (
              <p role="alert" className="mt-2 text-caution">{uni.error}</p>
            ) : uni.total === 0 ? (
              <div className="mt-3 rounded-md border border-dashed border-ink/25 p-5">
                <p className="font-medium text-ink">No verified universities found for your search.</p>
                <p className="mt-1 text-sm text-ink-soft">Try another university name or country.</p>
              </div>
            ) : (
              <>
                <p className="mt-1 text-sm text-ink-soft">From the open Hipo university list. Listing a university does not imply it offers a scholarship.</p>
                <div className="mt-3 border-t border-paper-line">
                  {uni.items.map((u) => <UniversityCard key={u.id} u={u} scholarshipCount={u.domains.reduce((n, d) => n + (counts.get(d) ?? 0), 0)} />)}
                </div>
                {pages > 1 && (
                  <nav aria-label="Pages" className="mt-4 flex items-center justify-between text-sm">
                    {page > 1 ? <Link className="text-route underline" href={withParams("/search", { ...base, page: String(page - 1) })}>Previous</Link> : <span />}
                    <span className="text-ink-soft">Page {page} of {pages}</span>
                    {page < pages ? <Link className="text-route underline" href={withParams("/search", { ...base, page: String(page + 1) })}>Next</Link> : <span />}
                  </nav>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
