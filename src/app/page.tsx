import type { Metadata } from "next";
import Link from "next/link";
import { AdBanner } from "@/components/ads/AdSlot";
import { GUIDES } from "@/lib/guides";
import { JsonLd } from "@/components/JsonLd";
import { SITE_NAME, siteUrl } from "@/lib/site";
import { SentenceSearch } from "@/components/SentenceSearch";
import { StatusBadge } from "@/components/Badges";
import { DESTINATIONS } from "@/lib/reference";
import { filterScholarships } from "@/lib/filter";
import { formatDate, fundingHeadline } from "@/lib/format";
import { listPublicScholarships } from "@/lib/scholarships";
import { countryName } from "@/lib/reference";
import { EMPTY_FILTERS } from "@/lib/types";

export const revalidate = 600;
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function Home() {
  const { items } = await listPublicScholarships();
  const current = filterScholarships(items, EMPTY_FILTERS);
  const open = current.filter((r) => r.status === "OPEN").slice(0, 5);
  const upcoming = current.filter((r) => r.status === "UPCOMING").slice(0, 5);

  const base = siteUrl();
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "WebSite", "@id": `${base}/#website`, url: base, name: SITE_NAME,
            potentialAction: { "@type": "SearchAction", target: `${base}/search?q={search_term_string}`, "query-input": "required name=search_term_string" } },
          { "@type": "Organization", "@id": `${base}/#org`, name: SITE_NAME, url: base },
        ],
      }} />
      <section className="border-b border-paper-line bg-paper-tint">
        <div className="mx-auto max-w-page px-4 py-12 sm:py-16">
          <h1 className="font-serif text-4xl leading-[1.1] text-ink sm:text-6xl">
            Find your university.<br />Find your scholarship.<br />Plan your future.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink-soft">
            Real universities from open data. Scholarships only after they are checked against the official source.
          </p>
          <SentenceSearch />
        </div>
      </section>
      <div className="mx-auto max-w-page px-4"><AdBanner /></div>

      <div className="mx-auto max-w-page space-y-14 px-4 py-12">
        <p className="text-ink">
          <span className="font-serif text-2xl">{current.length}</span>{" "}
          verified scholarship{current.length === 1 ? "" : "s"} in the database right now.
        </p>

        <div className="grid gap-10 lg:grid-cols-2">
          <ShortList title="Verified and open now" href="/scholarships/open-now" rows={open}
            empty="No verified scholarships are currently open." />
          <ShortList title="Opening soon" href="/scholarships/upcoming" rows={upcoming}
            empty="No verified upcoming scholarships yet." />
        </div>

        <section aria-labelledby="countries">
          <h2 id="countries" className="font-serif text-2xl text-ink">Universities by country</h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-6 sm:grid-cols-3 lg:grid-cols-6">
            {DESTINATIONS.map((c) => (
              <li key={c.code} className="border-b border-paper-line">
                <Link href={`/universities/${c.slug}`} className="block py-2 text-ink hover:text-route">{c.name}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="tools" className="rounded-md bg-ink p-6 text-white sm:p-8">
          <h2 id="tools" className="font-serif text-2xl">Prepare your application</h2>
          <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["/tools/cv", "Assess my CV", "Strengths, missing information and potentially relevant verified scholarships."],
              ["/tools/transcript", "Check my transcript", "Read your GPA and courses and compare with a published minimum."],
              ["/tools/motivation-letter", "Motivation letter", "A draft built only from your own facts, with gaps marked."],
              ["/tools/tracker", "Application tracker", "Deadlines, statuses and documents, saved in your browser."],
            ].map(([href, t, d]) => (
              <li key={href}><Link href={href} className="font-medium underline-offset-2 hover:underline">{t}</Link><p className="mt-1 text-sm text-white/75">{d}</p></li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="guides">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="guides" className="font-serif text-2xl text-ink">Guides</h2>
            <Link href="/guides" className="text-sm text-route underline underline-offset-2">All guides</Link>
          </div>
          <ul className="mt-3 grid gap-x-8 sm:grid-cols-2">
            {GUIDES.slice(0, 6).map((g) => (
              <li key={g.slug} className="border-b border-paper-line"><Link href={`/guides/${g.slug}`} className="block py-2 text-ink hover:text-route">{g.title}</Link></li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="trust" className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 id="trust" className="font-serif text-2xl text-ink">Why trust this platform?</h2>
            <p className="mt-3 text-ink">If we can&apos;t verify it, we don&apos;t show it.</p>
          </div>
          <ul className="space-y-2 text-ink-soft">
            <li>Every scholarship links to an official university, government, Erasmus Mundus or provider page, with the date it was last checked.</li>
            <li>&ldquo;Apply now&rdquo; appears only when the call is officially open and an official application portal exists.</li>
            <li>Deadlines are never guessed from previous years. Past deadlines are labelled as history.</li>
            <li>&ldquo;Fully funded&rdquo; means the source confirms support beyond tuition. Tuition-only awards are labelled 100% tuition.</li>
            <li>No invented rankings, success chances, employment rates or salaries.</li>
          </ul>
        </section>
      </div>
    </>
  );
}

function ShortList({ title, href, rows, empty }: { title: string; href: string; rows: ReturnType<typeof filterScholarships>; empty: string }) {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-serif text-2xl text-ink">{title}</h2>
        <Link href={href} className="text-sm text-route underline underline-offset-2">See all</Link>
      </div>
      {rows.length === 0 ? (
        <p className="mt-3 text-ink-soft">{empty}</p>
      ) : (
        <ul className="mt-3 divide-y divide-paper-line border-y border-paper-line">
          {rows.map(({ s, status }) => (
            <li key={s.id} className="py-3">
              <p className="text-xs text-ink-soft">{countryName(s.countryCode)} › {s.university?.name ?? s.providerName}</p>
              <p className="font-medium text-ink">{s.name}</p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                <span>{fundingHeadline(s)}</span>
                <StatusBadge status={status} />
                {s.deadline && <span className="text-ink-soft">Deadline {formatDate(s.deadline)}</span>}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
