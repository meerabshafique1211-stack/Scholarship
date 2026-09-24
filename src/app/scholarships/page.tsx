import type { Metadata } from "next";
import Link from "next/link";
import { ResponsiveAd } from "@/components/ads/AdSlot";
import { EmptyState } from "@/components/EmptyState";
import { ScholarshipCard } from "@/components/ScholarshipCard";
import { filterScholarships } from "@/lib/filter";
import { DESTINATIONS } from "@/lib/reference";
import { listPublicScholarships } from "@/lib/scholarships";
import { EMPTY_FILTERS } from "@/lib/types";

export const metadata: Metadata = {
  title: "Verified scholarships for international students",
  description: "Scholarships checked against official university, government and provider sources, with deadlines and official links.",
  alternates: { canonical: "/scholarships" },
};
export const revalidate = 600;

export default async function ScholarshipsIndex() {
  const { items, error } = await listPublicScholarships();
  const rows = filterScholarships(items, EMPTY_FILTERS);
  const withData = new Set(rows.map((r) => r.s.countryCode));
  return (
    <div className="mx-auto max-w-page px-4 pb-16 pt-8">
      <h1 className="font-serif text-4xl text-ink">{rows.length} verified scholarship{rows.length === 1 ? "" : "s"}</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">Each one is checked against its official source before it appears here. <Link href="/search" className="text-route underline">Filter by country, degree, funding and status</Link>.</p>
      {error && <p className="mt-3 text-sm text-caution">{error}</p>}
      <nav aria-label="By country" className="mt-6 flex flex-wrap gap-2 text-sm">
        {DESTINATIONS.filter((c) => withData.has(c.code) || ["IT", "ES", "DK", "FI", "DE"].includes(c.code)).map((c) => (
          <Link key={c.code} href={`/scholarships/${c.slug}`} className="rounded-full border border-paper-line px-3 py-1 text-ink hover:border-ink">{c.name}</Link>
        ))}
      </nav>
      <div className="mt-8">
        {rows.length === 0 ? (
          <EmptyState title="No verified scholarships found for your selected criteria." links={[{ href: "/universities", label: "View universities" }, { href: "/guides/how-to-find-masters-scholarships", label: "How to find scholarships" }]} />
        ) : (
          <ul className="space-y-4">
            {rows.map(({ s, status }, i) => (
              <li key={s.id}>
                <ScholarshipCard s={s} status={status} citizenship={null} />
                {i === 2 && rows.length > 4 && <ResponsiveAd />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
