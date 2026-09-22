import Link from "next/link";
import { SentenceSearch } from "@/components/SentenceSearch";
import { StatusBadge } from "@/components/Badges";
import { DESTINATIONS, FIELDS } from "@/data/reference";
import { buildOpportunities } from "@/lib/filters";
import { formatDate, fundingHeadline } from "@/lib/format";
import { loadDataset } from "@/lib/repository";

export const revalidate = 3600; // statuses depend on today's date

export default async function Home() {
  const ds = await loadDataset();
  const { current } = buildOpportunities(ds);
  const withS = current.filter((o) => o.scholarship);
  const openNow = withS.filter((o) => o.status === "open").slice(0, 4);
  const fullyFunded = withS.filter((o) => o.scholarship!.fundingType === "fully_funded").slice(0, 4);
  const deadlines = withS
    .filter((o) => o.scholarship!.deadline?.kind === "official" && (o.status === "open" || o.status === "upcoming"))
    .sort((a, b) => a.scholarship!.deadline!.date.localeCompare(b.scholarship!.deadline!.date))
    .slice(0, 5);
  const perCountry = DESTINATIONS.map((c) => ({ c, n: new Set(current.filter((o) => o.country.code === c.code).map((o) => o.university.id)).size }));

  return (
    <>
      <section className="border-b border-paper-line bg-paper-tint">
        <div className="mx-auto max-w-page px-4 py-12 sm:py-16">
          <h1 className="font-serif text-4xl leading-[1.1] text-ink sm:text-6xl">
            Find your university.<br />Find your scholarship.<br />Plan your future.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink-soft">
            Find verified universities, scholarships and funding opportunities worldwide, with the official link to apply.
          </p>
          <SentenceSearch />
        </div>
      </section>

      <div className="mx-auto max-w-page space-y-14 px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          <ShortList title="Scholarships open now" href="/search?status=open" rows={openNow} empty="No scholarships are open right now." />
          <ShortList title="Fully funded opportunities" href="/search?funding=fully_funded" rows={fullyFunded} empty="No fully funded scholarships listed yet." />
        </div>

        <section aria-labelledby="deadlines">
          <SectionHead id="deadlines" title="Upcoming deadlines" href="/search?status=open,upcoming" />
          <ol className="mt-3 divide-y divide-paper-line border-y border-paper-line">
            {deadlines.map((o) => (
              <li key={o.key} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr_auto] sm:items-center sm:gap-4">
                <span className="font-semibold text-ink">{formatDate(o.scholarship!.deadline!.date)}</span>
                <span className="text-ink">{o.scholarship!.name} <span className="text-ink-soft">at {o.university.name}, {o.country.name}</span></span>
                <StatusBadge status={o.status} />
              </li>
            ))}
          </ol>
        </section>

        <div className="grid gap-10 lg:grid-cols-2">
          <section aria-labelledby="countries">
            <SectionHead id="countries" title="Universities by country" />
            <ul className="mt-3 grid grid-cols-2 gap-x-6 sm:grid-cols-3">
              {perCountry.map(({ c, n }) => (
                <li key={c.code} className="border-b border-paper-line">
                  <Link href={`/search?country=${c.code}`} className="flex justify-between py-2 text-ink hover:text-route">
                    {c.name}<span className="text-ink-soft">{n}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="fields">
            <SectionHead id="fields" title="Popular fields" />
            <ul className="mt-3 flex flex-wrap gap-2">
              {FIELDS.map((f) => (
                <li key={f.slug}>
                  <Link href={`/search?field=${f.slug}`} className="inline-block rounded-full border border-paper-line px-3 py-1.5 text-sm text-ink hover:border-ink">{f.label}</Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section aria-labelledby="tools" className="rounded-md bg-ink p-6 text-white sm:p-8">
          <h2 id="tools" className="font-serif text-2xl">Prepare your application</h2>
          <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Compare universities", "Put up to three programs side by side on tuition, funding, deadlines and sourced career data.", "Available in search"],
              ["Assess your CV", "See strengths, gaps and missing information for the programs you pick.", "Coming in phase 4"],
              ["Check your transcript", "Compare your courses and CGPA with program requirements.", "Coming in phase 4"],
              ["Build your motivation letter", "Draft from your own CV and the program's real features. Nothing invented.", "Coming in phase 5"],
            ].map(([t, d, s]) => (
              <li key={t}>
                <h3 className="font-medium">{t}</h3>
                <p className="mt-1 text-sm text-white/75">{d}</p>
                <p className="mt-2 text-xs text-white/60">{s}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <section aria-labelledby="how">
            <h2 id="how" className="font-serif text-2xl text-ink">How it works</h2>
            <ol className="mt-4 space-y-2.5">
              {["Create your profile", "Upload your CV and transcript", "Choose your countries", "Find scholarships", "Check your eligibility", "Prepare your application", "Apply on the official portal"].map((s, i) => (
                <li key={s} className="flex items-baseline gap-3 text-ink">
                  <span className="w-6 shrink-0 font-serif text-lg text-route">{i + 1}</span>{s}
                </li>
              ))}
            </ol>
          </section>
          <section aria-labelledby="trust">
            <h2 id="trust" className="font-serif text-2xl text-ink">Why trust this platform?</h2>
            <p className="mt-4 text-ink">If we can&apos;t verify something, we don&apos;t present it as fact.</p>
            <ul className="mt-3 space-y-2 text-ink-soft">
              <li>Every scholarship links to its official source and shows when it was last verified.</li>
              <li>&ldquo;Apply now&rdquo; goes to the official application portal, never a blog or search page.</li>
              <li>Expected dates are labelled as expected, never shown as official deadlines.</li>
              <li>Programs without a scholarship stay visible, clearly marked, so you see your real options.</li>
              <li>No invented rankings, success chances or job statistics.</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}

function SectionHead({ id, title, href }: { id: string; title: string; href?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 id={id} className="font-serif text-2xl text-ink">{title}</h2>
      {href && <Link href={href} className="text-sm text-route underline underline-offset-2">See all</Link>}
    </div>
  );
}

function ShortList({ title, href, rows, empty }: { title: string; href: string; rows: ReturnType<typeof buildOpportunities>["current"]; empty: string }) {
  const id = title.toLowerCase().replace(/\W+/g, "-");
  return (
    <section aria-labelledby={id}>
      <SectionHead id={id} title={title} href={href} />
      {rows.length === 0 ? (
        <p className="mt-3 text-ink-soft">{empty}</p>
      ) : (
        <ul className="mt-3 divide-y divide-paper-line border-y border-paper-line">
          {rows.map((o) => (
            <li key={o.key} className="py-3">
              <p className="text-xs text-ink-soft">{o.country.name} › {o.university.name} › {o.program.name}</p>
              <p className="mt-0.5 font-medium text-ink">{o.scholarship!.name}</p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-ink">{fundingHeadline(o.scholarship!)}</span>
                <StatusBadge status={o.status} />
                {o.scholarship!.deadline && <span className="text-ink-soft">by {formatDate(o.scholarship!.deadline.date)}</span>}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
