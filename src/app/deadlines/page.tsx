import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { filterScholarships } from "@/lib/filter";
import { formatDate, fundingHeadline } from "@/lib/format";
import { countryName } from "@/lib/reference";
import { listPublicScholarships } from "@/lib/scholarships";
import { countdownLabel } from "@/lib/status";
import { EMPTY_FILTERS } from "@/lib/types";

export const metadata: Metadata = {
  title: "Scholarship deadlines calendar",
  description: "Official deadlines of verified scholarships, grouped by month, with closing-soon countdowns.",
  alternates: { canonical: "/deadlines" },
};
export const revalidate = 600;

const MONTH = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

export default async function DeadlinesPage() {
  const { items } = await listPublicScholarships();
  // Only records with an OFFICIAL deadline that hasn't passed; never estimated dates.
  const rows = filterScholarships(items, EMPTY_FILTERS).filter((r) => r.s.deadline && (r.status === "OPEN" || r.status === "UPCOMING"));
  const notAnnounced = filterScholarships(items, EMPTY_FILTERS).filter((r) => r.status === "NOT_ANNOUNCED").length;
  const byMonth = new Map<string, typeof rows>();
  for (const r of rows) {
    const key = MONTH.format(new Date(r.s.deadline!));
    byMonth.set(key, [...(byMonth.get(key) ?? []), r]);
  }
  return (
    <div className="mx-auto max-w-page px-4 pb-16 pt-8">
      <h1 className="font-serif text-4xl text-ink">Scholarship deadlines</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">Official deadlines of verified scholarships that are open or opening soon. Dates come from each official source; we never estimate a deadline from a previous year.</p>
      {rows.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No verified scholarships with an announced deadline right now." links={[{ href: "/scholarships", label: "All verified scholarships" }, { href: "/guides", label: "Guides" }]} />
        </div>
      ) : (
        Array.from(byMonth.entries()).map(([month, list]) => (
          <section key={month} className="mt-10">
            <h2 className="font-serif text-2xl text-ink">{month}</h2>
            <ul className="mt-3 divide-y divide-paper-line border-y border-paper-line">
              {list.map(({ s, status }) => {
                const c = countdownLabel(s, status);
                return (
                  <li key={s.id} className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr_auto] sm:items-center sm:gap-4">
                    <span className="font-semibold text-ink">{formatDate(s.deadline)}</span>
                    <span>
                      <Link href={`/scholarships/${s.id}`} className="font-medium text-ink hover:text-route">{s.name}</Link>
                      <span className="block text-sm text-ink-soft">{countryName(s.countryCode)} · {fundingHeadline(s)}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      {c && <span className={`text-sm font-semibold ${c.urgent ? "text-caution" : "text-route"}`}>{c.text}</span>}
                      <StatusBadge status={status} />
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
      {notAnnounced > 0 && <p className="mt-8 text-sm text-ink-soft">{notAnnounced} more verified scholarship{notAnnounced === 1 ? " has" : "s have"} not announced dates for the new cycle yet.</p>}
    </div>
  );
}
