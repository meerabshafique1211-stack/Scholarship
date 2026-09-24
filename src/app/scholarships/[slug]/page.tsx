import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ResponsiveAd } from "@/components/ads/AdSlot";
import { CoveragePips } from "@/components/CoveragePips";
import { EmptyState } from "@/components/EmptyState";
import { JsonLd } from "@/components/JsonLd";
import { ScholarshipCard } from "@/components/ScholarshipCard";
import { StatusBadge, VerifiedSource } from "@/components/Badges";
import { AddToTracker } from "@/components/tools/AddToTracker";
import { filterScholarships } from "@/lib/filter";
import { DEGREE_LABEL, FUNDING_LABEL, SOURCE_LABEL, formatDate, formatIntake, fundingHeadline, hostOf } from "@/lib/format";
import { CITIZENSHIPS, DESTINATIONS, countryName } from "@/lib/reference";
import { getPublicScholarship, listPublicScholarships } from "@/lib/scholarships";
import { siteUrl } from "@/lib/site";
import { canApplyNow, deriveStatus } from "@/lib/status";
import { EMPTY_FILTERS, type ScholarshipView } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };
export const revalidate = 600;

const countryBySlug = (slug: string) => DESTINATIONS.find((c) => c.slug === slug.toLowerCase());

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = countryBySlug(slug);
  if (c) {
    const { items } = await listPublicScholarships();
    const n = filterScholarships(items, { ...EMPTY_FILTERS, countries: [c.code] }).length;
    return {
      title: `Verified scholarships in ${c.name}`,
      description: `Scholarships in ${c.name} checked against official sources, with funding, eligibility and deadlines.`,
      alternates: { canonical: `/scholarships/${c.slug}` },
      robots: n === 0 ? { index: false, follow: true } : undefined, // no thin pages in the index
    };
  }
  const s = await getPublicScholarship(slug);
  if (!s) return { title: "Scholarship not found", robots: { index: false } };
  const where = s.university?.name ?? s.providerName;
  return {
    title: `${s.name}: ${where}, ${countryName(s.countryCode)}`,
    description: `${fundingHeadline(s)}. ${s.degreeLevels.map((d) => DEGREE_LABEL[d]).join(", ")}. Official source and deadline, last verified ${formatDate(s.lastVerifiedAt)}.`,
    alternates: { canonical: `/scholarships/${s.id}` },
    openGraph: { title: s.name, url: `/scholarships/${s.id}`, type: "website" },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const c = countryBySlug(slug);
  if (c) return <CountryScholarships code={c.code} name={c.name} slug={c.slug} />;
  const s = await getPublicScholarship(slug);
  if (!s) notFound();
  return <ScholarshipDetail s={s} />;
}

async function CountryScholarships({ code, name, slug }: { code: string; name: string; slug: string }) {
  const { items, error } = await listPublicScholarships();
  const rows = filterScholarships(items, { ...EMPTY_FILTERS, countries: [code] });
  return (
    <div className="mx-auto max-w-page px-4 pb-16 pt-8">
      <p className="text-sm text-ink-soft"><Link href="/scholarships" className="underline">Scholarships</Link></p>
      <h1 className="mt-1 font-serif text-4xl text-ink">{rows.length} verified scholarship{rows.length === 1 ? "" : "s"} in {name}</h1>
      {error && <p className="mt-3 text-sm text-caution">{error}</p>}
      <div className="mt-8">
        {rows.length === 0 ? (
          <EmptyState title="No verified scholarships found for your selected criteria." links={[
            { href: `/universities/${slug}`, label: `Universities in ${name}` },
            { href: "/scholarships", label: "All verified scholarships" },
            { href: "/scholarships/upcoming", label: "Upcoming scholarships" },
          ]} />
        ) : (
          <ul className="space-y-4">{rows.map(({ s, status }, i) => (
            <li key={s.id}><ScholarshipCard s={s} status={status} citizenship={null} />{i === 2 && rows.length > 4 && <ResponsiveAd />}</li>
          ))}</ul>
        )}
      </div>
    </div>
  );
}

function nationalityText(s: ScholarshipView): string {
  const names = s.nationalities.map((n) => (n === "EU_EEA" ? "EU/EEA countries" : CITIZENSHIPS.find((c) => c.code === n)?.name ?? countryName(n)));
  if (s.nationalityRule === "ALL") return "All nationalities (per the official text)";
  if (s.nationalityRule === "ONLY_LISTED") return `Only: ${names.join(", ")}`;
  return `All except: ${names.join(", ")}`;
}

function ScholarshipDetail({ s }: { s: ScholarshipView }) {
  const status = deriveStatus(s);
  const apply = canApplyNow(s, status);
  const rows: [string, string][] = [
    ["University", s.university?.name ?? "Not tied to one university"],
    ["Provider", s.providerName],
    ["Country", countryName(s.countryCode)],
    ["Degree level", s.degreeLevels.map((d) => DEGREE_LABEL[d]).join(", ")],
    ["Fields", s.studyFields.length ? s.studyFields.join(", ") : "All fields (per source)"],
    ["Intake", s.intake ? formatIntake(s.intake) : "Not stated"],
    ["Eligible nationalities", nationalityText(s)],
    ["Funding type", FUNDING_LABEL[s.fundingType]],
    ["Funding", fundingHeadline(s)],
    ["Living stipend", s.livingStipend ?? "Not stated in source"],
    ["Other benefits", s.otherBenefits ?? "Not stated in source"],
    ["Application fee", s.applicationFee ?? "Not stated in source"],
    ["Opening date", s.openingDate ? formatDate(s.openingDate) : "Not announced"],
    ["Deadline", s.deadline ? formatDate(s.deadline) : `${s.cycle} application not announced`],
    ["Source", `${SOURCE_LABEL[s.sourceType]} (${hostOf(s.sourceUrl)})`],
    ["Last verified", formatDate(s.lastVerifiedAt)],
  ];
  return (
    <article className="mx-auto max-w-page px-4 pb-16 pt-8">
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "MonetaryGrant", name: s.name, url: `${siteUrl()}/scholarships/${s.id}`,
        funder: { "@type": "Organization", name: s.providerName, url: `https://${s.providerDomain}` }, sameAs: s.officialScholarshipUrl,
      }} />
      <p className="text-sm text-ink-soft"><Link href="/scholarships" className="underline">Scholarships</Link> › {countryName(s.countryCode)}</p>
      <h1 className="mt-1 font-serif text-4xl leading-tight text-ink">{s.name}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-3"><StatusBadge status={status} /><span className="text-lg font-semibold text-ink">{fundingHeadline(s)}</span></div>

      <p role="note" className="mt-6 rounded-md border border-caution/40 bg-caution-tint p-4 text-sm text-caution">
        Always confirm eligibility and deadlines on the official scholarship website before applying.
      </p>

      <section aria-labelledby="info" className="mt-8 grid gap-8 lg:grid-cols-[1fr_18rem]">
        <div>
          <h2 id="info" className="font-serif text-2xl text-ink">Scholarship information</h2>
          <div className="mt-4"><CoveragePips s={s} /></div>
          <dl className="mt-6 divide-y divide-paper-line border-y border-paper-line text-sm">
            {rows.map(([k, v]) => <div key={k} className="grid gap-1 py-2 sm:grid-cols-[12rem_1fr]"><dt className="text-ink-soft">{k}</dt><dd className="text-ink">{v}</dd></div>)}
          </dl>
          {s.previousCycleDeadline && <p className="mt-3 text-xs text-ink-soft">Historical: previous cycle{s.previousCycleLabel ? ` (${s.previousCycleLabel})` : ""} deadline was {formatDate(s.previousCycleDeadline)}. This is not a current deadline.</p>}
          <h3 className="mt-6 font-serif text-xl text-ink">Eligibility, as published</h3>
          <p className="mt-2 text-ink">{s.eligibilityText}</p>
        </div>
        <aside className="space-y-3">
          {apply ? (
            <a href={s.officialApplicationUrl!} target="_blank" rel="noopener noreferrer" className="block rounded-md bg-ink px-4 py-3 text-center font-medium text-white hover:bg-ink-soft">Apply now on {hostOf(s.officialApplicationUrl)}</a>
          ) : (
            <p className="rounded-md bg-paper-tint px-4 py-3 text-center text-sm text-ink-soft">Application not open</p>
          )}
          <a href={s.officialScholarshipUrl} target="_blank" rel="noopener noreferrer" className="block rounded-md border border-ink px-4 py-3 text-center font-medium text-ink hover:bg-paper-tint">View official information</a>
          <AddToTracker scholarshipId={s.id} scholarship={s.name} university={s.university?.name ?? s.providerName} deadline={s.deadline} applicationUrl={apply ? s.officialApplicationUrl : s.officialScholarshipUrl} />
          <VerifiedSource s={s} />
        </aside>
      </section>
      <ResponsiveAd />
    </article>
  );
}
