import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-session";
import { db, hasDb } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { DESTINATIONS } from "@/lib/reference";
import { needsReverification } from "@/lib/status";
import { AdminNav } from "../../AdminNav";
import { DbSetup } from "../../DbSetup";
import { ScholarshipForm } from "../../ScholarshipForm";

export const metadata: Metadata = { title: "Admin: edit scholarship", robots: { index: false } };
export const dynamic = "force-dynamic";

const ymd = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");
const yn = (b: boolean | null) => (b === true ? "yes" : b === false ? "no" : "");

export default async function EditScholarship({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  if (!hasDb()) return <div className="mx-auto max-w-page px-4 py-8"><AdminNav /><DbSetup /></div>;
  const { id } = await params;
  const { saved } = await searchParams;
  const r = await db().scholarship.findUnique({
    where: { id },
    include: { university: true, logs: { orderBy: { createdAt: "desc" }, take: 20 }, sources: { orderBy: { lastChecked: "desc" }, take: 10 } },
  });
  if (!r) notFound();
  return (
    <div className="mx-auto max-w-page px-4 py-8">
      <AdminNav />
      {saved && <p role="status" className="mb-4 rounded-md bg-seal-tint px-4 py-2 text-sm text-seal">Saved. Status: {saved.replace("_", " ").toLowerCase()}.</p>}
      <h1 className="font-serif text-3xl text-ink">{r.name}</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Status: <strong>{r.verificationStatus.replace("_", " ").toLowerCase()}</strong>. Last verified {formatDate(r.lastVerifiedAt)}.
        {r.verificationStatus === "VERIFIED" && needsReverification(r.lastVerifiedAt) && <span className="text-caution"> Needs re-verification.</span>}
        {r.verificationStatus === "VERIFIED" ? " Visible to the public." : " Not visible to the public."}
      </p>
      <div className="mt-6 grid gap-10 xl:grid-cols-[1fr_20rem]">
        <ScholarshipForm
          countries={DESTINATIONS}
          d={{
            id: r.id, name: r.name, universityDomain: r.university?.officialDomain ?? "", providerName: r.providerName, providerDomain: r.providerDomain,
            countryCode: r.countryCode, degreeLevels: r.degreeLevels, studyFields: r.studyFields.join(", "), nationalityRule: r.nationalityRule,
            nationalities: r.nationalities.join(", "), eligibilityText: r.eligibilityText, fundingType: r.fundingType,
            fundingPercentage: r.fundingPercentage?.toString() ?? "", fundingAmountText: r.fundingAmountText ?? "", tuitionCoverage: yn(r.tuitionCoverage),
            livingStipend: r.livingStipend ?? "", accommodation: yn(r.accommodation), healthInsurance: yn(r.healthInsurance), travelSupport: yn(r.travelSupport),
            applicationFee: r.applicationFee ?? "", cycle: r.cycle, intake: r.intake ?? "", openingDate: ymd(r.openingDate), deadline: ymd(r.deadline),
            statusUndetermined: r.statusUndetermined, previousCycleLabel: r.previousCycleLabel ?? "", previousCycleDeadline: ymd(r.previousCycleDeadline),
            officialScholarshipUrl: r.officialScholarshipUrl, officialApplicationUrl: r.officialApplicationUrl ?? "", sourceUrl: r.sourceUrl,
            sourceType: r.sourceType, verificationNotes: r.verificationNotes ?? "",
          }}
        />
        <aside className="space-y-6 text-sm">
          <section>
            <h2 className="font-serif text-lg text-ink">Checked sources</h2>
            {r.sources.length ? (
              <ul className="mt-2 space-y-2">{r.sources.map((s) => (
                <li key={s.id}><a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="break-all text-route underline">{s.sourceUrl}</a><div className="text-ink-soft">{formatDate(s.lastChecked)}</div></li>
              ))}</ul>
            ) : <p className="mt-2 text-ink-soft">Not yet verified.</p>}
          </section>
          <section>
            <h2 className="font-serif text-lg text-ink">History</h2>
            <ul className="mt-2 space-y-1.5">{r.logs.map((l) => (
              <li key={l.id}><span className="text-ink">{l.action.replace("_", " ")}</span> <span className="text-ink-soft">{formatDate(l.createdAt)} by {l.actor}</span>{l.note && <div className="text-ink-soft">{l.note}</div>}</li>
            ))}</ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
