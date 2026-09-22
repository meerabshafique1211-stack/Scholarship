import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-session";
import { db, hasDb } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { DESTINATIONS } from "@/lib/reference";
import { syncCountryAction } from "../actions";
import { AdminNav } from "../AdminNav";
import { DbSetup } from "../DbSetup";

export const metadata: Metadata = { title: "Admin: universities", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminUniversities({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  if (!hasDb()) return <div className="mx-auto max-w-page px-4 py-8"><AdminNav /><DbSetup /></div>;
  const sp = await searchParams;
  const [counts, runs] = await Promise.all([
    db().university.groupBy({ by: ["countryCode"], _count: { _all: true } }),
    db().syncRun.findMany({ orderBy: { startedAt: "desc" }, take: 10 }),
  ]);
  const count = new Map(counts.map((c) => [c.countryCode, c._count._all]));
  return (
    <div className="mx-auto max-w-page px-4 py-8">
      <AdminNav />
      <h1 className="font-serif text-3xl text-ink">Universities</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">Sync pulls names and domains from Hipo (plus OpenAlex research data when an API key is set), deduplicates by domain and normalized name, and stores them. A daily job also syncs three countries per run.</p>
      {sp.synced && <p role="status" className="mt-4 rounded-md bg-seal-tint px-4 py-2 text-sm text-seal">Synced {sp.synced}: {sp.inserted} new, {sp.updated} enriched.</p>}
      {sp.error && <p role="alert" className="mt-4 rounded-md bg-caution-tint px-4 py-2 text-sm text-caution">Sync failed: {sp.error}</p>}
      <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {DESTINATIONS.map((c) => (
          <li key={c.code} className="flex items-center justify-between rounded-md border border-paper-line px-3 py-2 text-sm">
            <span>{c.name} <span className="text-ink-soft">({count.get(c.code) ?? 0} stored)</span></span>
            <form action={syncCountryAction}><input type="hidden" name="country" value={c.code} /><button className="text-route underline">Sync now</button></form>
          </li>
        ))}
      </ul>
      <h2 className="mt-10 font-serif text-xl text-ink">Recent sync runs</h2>
      <ul className="mt-2 space-y-1 text-sm">
        {runs.map((r) => (
          <li key={r.id} className={r.error ? "text-caution" : "text-ink"}>
            {formatDate(r.startedAt)} {r.countryCode ?? ""} {r.provider ?? ""}: {r.error ? `error: ${r.error}` : `${r.inserted} new, ${r.updated} updated, ${r.skipped} skipped`}
          </li>
        ))}
      </ul>
    </div>
  );
}
