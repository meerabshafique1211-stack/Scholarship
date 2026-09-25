import type { Metadata } from "next";
import Link from "next/link";
import { ScholarshipCard } from "@/components/ScholarshipCard";
import { filterScholarships } from "@/lib/filter";
import { listPublicScholarships } from "@/lib/scholarships";
import { EMPTY_FILTERS } from "@/lib/types";

export const metadata: Metadata = { title: "Verified upcoming scholarships", description: "Verified scholarships whose official opening date for the new cycle has been published.", alternates: { canonical: "/scholarships/upcoming" } };
export const dynamic = "force-dynamic";

export default async function UpcomingPage() {
  const { items, error } = await listPublicScholarships();
  const rows = filterScholarships(items, { ...EMPTY_FILTERS, statuses: ["UPCOMING"] });
  return (
    <div className="mx-auto max-w-page px-4 pb-16 pt-8">
      {rows.length === 0 ? (
        <div className="max-w-2xl">
          <h1 className="font-serif text-3xl text-ink">No verified upcoming scholarships yet.</h1>
          {error && <p className="mt-2 text-sm text-caution">{error}</p>}
          <p className="mt-3 text-ink-soft">A scholarship appears here once its official opening date for the new cycle has been published and checked.</p>
          <Link href="/universities" className="mt-5 inline-block rounded-md bg-ink px-4 py-2 font-medium text-white hover:bg-ink-soft">Browse universities</Link>
        </div>
      ) : (
        <>
          <h1 className="font-serif text-3xl text-ink">{rows.length} verified upcoming scholarship{rows.length === 1 ? "" : "s"}</h1>
          <ul className="mt-6 space-y-4">
            {rows.map(({ s, status }) => <li key={s.id}><ScholarshipCard s={s} status={status} citizenship={null} /></li>)}
          </ul>
        </>
      )}
    </div>
  );
}
