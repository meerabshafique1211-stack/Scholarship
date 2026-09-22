import type { Metadata } from "next";
import Link from "next/link";
import { ScholarshipCard } from "@/components/ScholarshipCard";
import { filterScholarships } from "@/lib/filter";
import { listPublicScholarships } from "@/lib/scholarships";
import { EMPTY_FILTERS } from "@/lib/types";

export const metadata: Metadata = { title: "Verified scholarships open now" };
export const dynamic = "force-dynamic";

export default async function OpenNowPage() {
  const { items, error } = await listPublicScholarships();
  // VERIFIED + status OPEN + official application URL. Nothing else qualifies.
  const rows = filterScholarships(items, { ...EMPTY_FILTERS, statuses: ["OPEN"] }).filter((r) => Boolean(r.s.officialApplicationUrl));
  return (
    <div className="mx-auto max-w-page px-4 pb-16 pt-8">
      {rows.length === 0 ? (
        <div className="max-w-2xl">
          <h1 className="font-serif text-3xl text-ink">No verified scholarships are currently open.</h1>
          {error && <p className="mt-2 text-sm text-caution">{error}</p>}
          <p className="mt-3 text-ink-soft">This page lists only scholarships whose official application window is open today and whose official application portal we have confirmed.</p>
          <Link href="/scholarships/upcoming" className="mt-5 inline-block rounded-md bg-ink px-4 py-2 font-medium text-white hover:bg-ink-soft">Try upcoming scholarships</Link>
        </div>
      ) : (
        <>
          <h1 className="font-serif text-3xl text-ink">{rows.length} verified scholarship{rows.length === 1 ? "" : "s"} open now</h1>
          <ul className="mt-6 space-y-4">
            {rows.map(({ s, status }) => <li key={s.id}><ScholarshipCard s={s} status={status} citizenship={null} /></li>)}
          </ul>
        </>
      )}
    </div>
  );
}
