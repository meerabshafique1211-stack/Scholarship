import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ResponsiveAd } from "@/components/ads/AdSlot";
import { JsonLd } from "@/components/JsonLd";
import { ScholarshipCard } from "@/components/ScholarshipCard";
import { UniversityCard } from "@/components/UniversityCard";
import { filterScholarships } from "@/lib/filter";
import { FUNDING_LABEL, formatCount, formatDate } from "@/lib/format";
import { DESTINATIONS } from "@/lib/reference";
import { countByUniversityDomain, listPublicScholarships } from "@/lib/scholarships";
import { siteUrl } from "@/lib/site";
import { EMPTY_FILTERS } from "@/lib/types";
import { getUniversities, getUniversityById } from "@/lib/universities";
import { withParams } from "@/lib/url-state";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ page?: string }> };
export const revalidate = 3600;

const countryBySlug = (slug: string) => DESTINATIONS.find((c) => c.slug === slug.toLowerCase());
const PAGE_SIZE = 50;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const c = countryBySlug(id);
  if (c) {
    return {
      title: `Universities in ${c.name}: official websites and verified scholarships`,
      description: `Real universities in ${c.name} from the open Hipo dataset, with official websites and any scholarships we have verified.`,
      alternates: { canonical: `/universities/${c.slug}` },
    };
  }
  const [{ university: u }, pub] = await Promise.all([getUniversityById(id), listPublicScholarships()]);
  if (!u) return { title: "University not found", robots: { index: false } };
  const n = u.domains.reduce((k, d) => k + (countByUniversityDomain(pub.items).get(d) ?? 0), 0);
  return {
    title: `${u.name} in ${u.country}: scholarships and official information`,
    description: `${u.name} (${u.officialDomain}), ${u.country}. ${n ? `${n} verified scholarship${n > 1 ? "s" : ""}` : "No verified scholarships yet"}, with official links and sources.`,
    alternates: { canonical: `/universities/${u.id}` },
    openGraph: { title: u.name, url: `/universities/${u.id}` },
    // Pages with only a name and a link are thin: keep them out of the index until they have verified scholarships.
    robots: n === 0 ? { index: false, follow: true } : undefined,
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { id } = await params;
  const c = countryBySlug(id);
  if (c) return <CountryUniversities code={c.code} name={c.name} slug={c.slug} page={Number((await searchParams).page) || 1} />;
  return <UniversityDetail id={id} />;
}

async function CountryUniversities({ code, name, slug, page }: { code: string; name: string; slug: string; page: number }) {
  const [{ items, error }, pub] = await Promise.all([getUniversities(code), listPublicScholarships()]);
  const counts = countByUniversityDomain(pub.items);
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const p = Math.min(Math.max(1, page), pages);
  const slice = items.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE);
  return (
    <div className="mx-auto max-w-page px-4 pb-16 pt-8">
      <p className="text-sm text-ink-soft"><Link href="/universities" className="underline">Universities</Link></p>
      <h1 className="mt-1 font-serif text-4xl text-ink">Universities in {name}</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        {error ? "" : `${items.length} institutions listed in the open Hipo university dataset. `}Listing a university doesn&apos;t mean it offers a scholarship; <Link href={`/scholarships/${slug}`} className="text-route underline">see verified scholarships in {name}</Link>.
      </p>
      {error ? (
        <p role="alert" className="mt-6 text-caution">{error}</p>
      ) : items.length === 0 ? (
        <p className="mt-6 font-medium text-ink">No verified universities found.</p>
      ) : (
        <>
          <div className="mt-6 border-t border-paper-line">
            {slice.map((u, i) => (
              <div key={u.id}>
                <UniversityCard u={u} scholarshipCount={u.domains.reduce((n, d) => n + (counts.get(d) ?? 0), 0)} />
                {i === 7 && <ResponsiveAd />}
              </div>
            ))}
          </div>
          {pages > 1 && (
            <nav aria-label="Pages" className="mt-4 flex items-center justify-between text-sm">
              {p > 1 ? <Link className="text-route underline" href={withParams(`/universities/${slug}`, { page: String(p - 1) })}>Previous</Link> : <span />}
              <span className="text-ink-soft">Page {p} of {pages}</span>
              {p < pages ? <Link className="text-route underline" href={withParams(`/universities/${slug}`, { page: String(p + 1) })}>Next</Link> : <span />}
            </nav>
          )}
        </>
      )}
    </div>
  );
}

async function UniversityDetail({ id }: { id: string }) {
  const [{ university: u, error }, pub] = await Promise.all([getUniversityById(id), listPublicScholarships()]);
  if (error) return <div className="mx-auto max-w-page px-4 py-10"><p role="alert" className="text-caution">{error}</p></div>;
  if (!u) notFound();
  const mine = filterScholarships(pub.items.filter((s) => s.university && u.domains.includes(s.university.officialDomain)), EMPTY_FILTERS);
  const categories = Array.from(new Set(mine.map(({ s }) => FUNDING_LABEL[s.fundingType])));
  const country = DESTINATIONS.find((d) => d.code === u.countryCode);

  return (
    <div className="mx-auto max-w-page px-4 pb-16 pt-8">
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "CollegeOrUniversity", name: u.name, url: u.officialWebsite ?? undefined,
        address: { "@type": "PostalAddress", addressCountry: u.countryCode, ...(u.city ? { addressLocality: u.city } : {}) },
        ...(u.rorId ? { sameAs: [u.rorId] } : {}), mainEntityOfPage: `${siteUrl()}/universities/${u.id}`,
      }} />
      <p className="text-sm text-ink-soft"><Link href={country ? `/universities/${country.slug}` : "/universities"} className="underline">Universities in {u.country}</Link></p>
      <h1 className="mt-1 font-serif text-4xl leading-tight text-ink">{u.name}</h1>

      <section aria-labelledby="uinfo" className="mt-8">
        <h2 id="uinfo" className="font-serif text-2xl text-ink">University information</h2>
        <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div><dt className="text-xs text-ink-soft">Country</dt><dd className="text-ink">{u.country}</dd></div>
          <div><dt className="text-xs text-ink-soft">Location</dt><dd className="text-ink">{[u.city, u.state].filter(Boolean).join(", ") || "Not provided by the source"}</dd></div>
          <div><dt className="text-xs text-ink-soft">Official website</dt><dd>{u.officialWebsite ? <a href={u.officialWebsite} target="_blank" rel="noopener noreferrer" className="break-all text-route underline">{u.officialWebsite}</a> : <span className="text-ink-soft">Not listed by the source</span>}</dd></div>
          <div><dt className="text-xs text-ink-soft">Official domain{u.domains.length > 1 ? "s" : ""}</dt><dd className="text-ink">{u.domains.join(", ")}</dd></div>
          <div><dt className="text-xs text-ink-soft">Source</dt><dd className="text-ink"><a href={u.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">Hipo university list</a>, retrieved {formatDate(u.lastVerifiedAt)}</dd></div>
          {u.rorId && <div><dt className="text-xs text-ink-soft">ROR ID</dt><dd><a href={u.rorId} target="_blank" rel="noopener noreferrer" className="text-route underline">{u.rorId.replace("https://ror.org/", "")}</a></dd></div>}
        </dl>
      </section>

      <section aria-labelledby="sch" className="mt-12">
        <h2 id="sch" className="font-serif text-2xl text-ink">Scholarship information: {mine.length} verified</h2>
        {categories.length > 0 && <p className="mt-1 text-sm text-ink-soft">Funding types: {categories.join(", ")}</p>}
        {mine.length === 0 ? (
          <div className="mt-4 rounded-md border border-dashed border-ink/25 p-5">
            <p className="font-medium text-ink">No verified scholarships found for this university.</p>
            <p className="mt-1 text-sm text-ink-soft">This means we haven&apos;t verified one yet, not that the university offers none. Check the university&apos;s official website for its current funding options.</p>
          </div>
        ) : (
          <ul className="mt-4 space-y-4">{mine.map(({ s, status }) => <li key={s.id}><ScholarshipCard s={s} status={status} citizenship={null} /></li>)}</ul>
        )}
      </section>

      <ResponsiveAd />

      <section aria-labelledby="research" className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 id="research" className="font-serif text-2xl text-ink">Research information</h2>
          {u.researchSource ? (
            <>
              <dl className="mt-3 space-y-2 text-sm">
                {u.institutionType && <div><dt className="inline text-ink-soft">Institution type: </dt><dd className="inline text-ink">{u.institutionType}</dd></div>}
                {u.worksCount !== null && <div><dt className="inline text-ink-soft">Research works indexed: </dt><dd className="inline text-ink">{formatCount(u.worksCount)}</dd></div>}
                {u.citedByCount !== null && <div><dt className="inline text-ink-soft">Citations: </dt><dd className="inline text-ink">{formatCount(u.citedByCount)}</dd></div>}
              </dl>
              <p className="mt-2 text-xs text-ink-soft">Source: <a href={u.researchSourceUrl ?? undefined} target="_blank" rel="noopener noreferrer" className="underline">OpenAlex</a>, matched by website domain. These measure research output, not teaching quality or graduate employment.</p>
            </>
          ) : (
            <p className="mt-3 text-sm text-ink-soft">Research data not available for this institution.</p>
          )}
        </div>
        <div>
          <h2 className="font-serif text-2xl text-ink">Career information</h2>
          <p className="mt-3 text-sm text-ink-soft">Career data not available. We only show employment rates, salaries or rankings when they come from a documented, current source.</p>
        </div>
      </section>
    </div>
  );
}
