import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/admin-session";
import { db, hasDb } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { countryName } from "@/lib/reference";
import { needsReverification, REVERIFY_AFTER_DAYS } from "@/lib/status";
import { AdminNav } from "../AdminNav";
import { DbSetup } from "../DbSetup";

export const metadata: Metadata = { title: "Admin: scholarships", robots: { index: false } };
export const dynamic = "force-dynamic";

const VIEWS: { key: string; label: string; where: () => Prisma.ScholarshipWhereInput }[] = [
  { key: "all", label: "All", where: () => ({}) },
  { key: "VERIFIED", label: "Verified", where: () => ({ verificationStatus: "VERIFIED" }) },
  { key: "NEEDS_VERIFICATION", label: "Needs verification", where: () => ({ verificationStatus: "NEEDS_VERIFICATION" }) },
  { key: "stale", label: `Needs re-verification (>${REVERIFY_AFTER_DAYS} days)`, where: () => ({ verificationStatus: "VERIFIED", lastVerifiedAt: { lt: new Date(Date.now() - REVERIFY_AFTER_DAYS * 86_400_000) } }) },
  { key: "EXPIRED", label: "Expired", where: () => ({ verificationStatus: "EXPIRED" }) },
  { key: "REJECTED", label: "Rejected", where: () => ({ verificationStatus: "REJECTED" }) },
  { key: "missing_app", label: "Missing application URL", where: () => ({ officialApplicationUrl: null, verificationStatus: { in: ["VERIFIED", "NEEDS_VERIFICATION"] } }) },
  { key: "missing_deadline", label: "Missing deadline", where: () => ({ deadline: null, verificationStatus: { in: ["VERIFIED", "NEEDS_VERIFICATION"] } }) },
  { key: "missing_source", label: "No checked source on record", where: () => ({ sources: { none: {} } }) },
];

export default async function AdminScholarships({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  await requireAdmin();
  if (!hasDb()) return <div className="mx-auto max-w-page px-4 py-8"><AdminNav /><DbSetup /></div>;
  const { view: v } = await searchParams;
  const view = VIEWS.find((x) => x.key === v) ?? VIEWS[0];
  const rows = await db().scholarship.findMany({
    where: view.where(),
    orderBy: { updatedAt: "desc" },
    take: 300,
    select: { id: true, name: true, countryCode: true, verificationStatus: true, deadline: true, lastVerifiedAt: true, providerName: true, isDemo: true },
  });
  return (
    <div className="mx-auto max-w-page px-4 py-8">
      <AdminNav />
      <h1 className="font-serif text-3xl text-ink">Scholarships</h1>
      <nav className="mt-4 flex flex-wrap gap-2 text-sm" aria-label="Filter">
        {VIEWS.map((x) => (
          <Link key={x.key} href={`/admin/scholarships?view=${x.key}`}
            className={`rounded-full border px-3 py-1 ${x.key === view.key ? "border-ink bg-ink text-white" : "border-paper-line text-ink"}`}>{x.label}</Link>
        ))}
      </nav>
      {rows.length === 0 ? (
        <p className="mt-6 text-ink-soft">No records in this view. <Link href="/admin/scholarships/new" className="text-route underline">Add a scholarship</Link> from its official source.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[44rem] text-sm">
            <thead><tr className="border-b border-paper-line text-left text-ink-soft">
              <th className="p-2 font-medium">Name</th><th className="p-2 font-medium">Country</th><th className="p-2 font-medium">Status</th>
              <th className="p-2 font-medium">Deadline</th><th className="p-2 font-medium">Last verified</th>
            </tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-paper-line">
                  <td className="p-2"><Link href={`/admin/scholarships/${r.id}`} className="font-medium text-route underline">{r.name}</Link><div className="text-xs text-ink-soft">{r.providerName}{r.isDemo ? " (demo flag set: hidden)" : ""}</div></td>
                  <td className="p-2">{countryName(r.countryCode)}</td>
                  <td className="p-2">{r.verificationStatus.replace("_", " ").toLowerCase()}</td>
                  <td className="p-2">{r.deadline ? formatDate(r.deadline) : <span className="text-caution">Not announced</span>}</td>
                  <td className="p-2">
                    {r.lastVerifiedAt ? formatDate(r.lastVerifiedAt) : "Never"}
                    {r.verificationStatus === "VERIFIED" && needsReverification(r.lastVerifiedAt) && <div className="text-xs text-caution">Needs re-verification</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
