import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-session";
import { db, hasDb } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { AdminNav } from "../AdminNav";
import { DbSetup } from "../DbSetup";

export const metadata: Metadata = { title: "Admin: data sources", robots: { index: false } };
export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, string> = {
  ACTIVE: "text-seal", PLANNED: "text-route", PAUSED: "text-dormant", ERROR: "text-caution", BLOCKED_LICENSE: "text-caution",
};

export default async function AdminSources() {
  await requireAdmin();
  if (!hasDb()) return <div className="mx-auto max-w-page px-4 py-8"><AdminNav /><DbSetup /></div>;
  const sources = await db().dataSource.findMany({ orderBy: [{ status: "asc" }, { name: "asc" }] });
  return (
    <div className="mx-auto max-w-page px-4 py-8">
      <AdminNav />
      <h1 className="font-serif text-3xl text-ink">Data sources</h1>
      <p className="mt-2 max-w-3xl text-sm text-ink-soft">Every place data comes from, what it actually provides, and whether its licence allows our use. A connector may only import from sources marked ACTIVE with commercial use ALLOWED or explicit permission.</p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[56rem] text-sm">
          <thead><tr className="border-b border-paper-line text-left text-ink-soft">
            <th className="p-2 font-medium">Source</th><th className="p-2 font-medium">Status</th><th className="p-2 font-medium">Licence / commercial use</th>
            <th className="p-2 font-medium">Provides</th><th className="p-2 font-medium">Sync</th>
          </tr></thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.id} className="border-b border-paper-line align-top">
                <td className="p-2">
                  <a href={s.websiteUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-route underline">{s.name}</a>
                  <div className="text-xs text-ink-soft">{s.sourceType.replace(/_/g, " ").toLowerCase()} · {s.coverage}</div>
                  {s.notes && <div className="mt-1 text-xs text-ink-soft">{s.notes}</div>}
                </td>
                <td className={`p-2 font-medium ${STATUS_TONE[s.status] ?? ""}`}>{s.status.replace("_", " ").toLowerCase()}{s.lastError && <div className="text-xs text-caution">{s.lastError}</div>}</td>
                <td className="p-2">{s.license ?? "Not recorded"}<div className="text-xs text-ink-soft">Commercial use: {s.commercialUse.replace("_", " ").toLowerCase()}</div></td>
                <td className="p-2 text-xs">{s.providesFields.join(", ")}</td>
                <td className="p-2 text-xs">{s.syncFrequency.toLowerCase()}<div className="text-ink-soft">Last: {s.lastSyncAt ? formatDate(s.lastSyncAt) : "never"}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
