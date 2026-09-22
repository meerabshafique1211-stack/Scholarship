import { StatusBadge, VerificationBadge } from "./Badges";
import { fundingHeadline, formatDate, formatMoney } from "@/lib/format";
import type { Opportunity } from "@/lib/types";

/** Groups result rows by university: one card per institution with its matching programs. */
export function UniversityCard({ rows }: { rows: Opportunity[] }) {
  const { university: u, country } = rows[0];
  const programs = Array.from(new Map(rows.map((r) => [r.program.id, r.program])).values());
  const funded = rows.filter((r) => r.scholarship);
  const initials = u.name.replace(/\(.*?\)/g, "").split(/\s+/).filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join("");

  return (
    <article className="rounded-md border border-paper-line bg-paper p-4 sm:p-5">
      <header className="flex items-start gap-3">
        <div aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-ink font-serif text-lg text-white">{initials}</div>
        <div className="min-w-0">
          <h3 className="font-serif text-xl leading-snug text-ink">{u.name}</h3>
          <p className="text-sm text-ink-soft">
            {u.city}, {country.name}. {u.type === "public" ? "Public" : "Private"} university.{" "}
            {u.ranking ? `${u.ranking.publisher} ${u.ranking.year}: ${u.ranking.rank}` : "Ranking not listed"}
          </p>
        </div>
      </header>

      <ul className="mt-4 divide-y divide-paper-line border-y border-paper-line">
        {programs.map((p) => {
          const best = funded.filter((r) => r.program.id === p.id);
          return (
            <li key={p.id} className="py-2.5 text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-medium text-ink">{p.name}</span>
                <span className="text-ink-soft">{formatMoney(p.tuitionPerYear, p.tuitionCurrency)} / year</span>
              </div>
              {best.length ? (
                best.map((r) => (
                  <div key={r.key} className="mt-1 flex flex-wrap items-center gap-2">
                    <StatusBadge status={r.status} />
                    <span className="text-ink">{fundingHeadline(r.scholarship!)}</span>
                    <span className="text-ink-soft">
                      {r.scholarship!.deadline ? `deadline ${formatDate(r.scholarship!.deadline.date)}` : "deadline not available"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="mt-1 text-ink-soft">No scholarship verified</p>
              )}
            </li>
          );
        })}
      </ul>

      <section className="mt-3 text-sm">
        <h4 className="font-medium text-ink">Career information</h4>
        {u.careerFacts.length ? (
          <ul className="mt-1 text-ink-soft">
            {u.careerFacts.map((c) => (
              <li key={c.label}>
                {c.label}: {c.value}{" "}
                <span className="text-xs">({c.origin === "official_university" ? "university source" : "external labour-market source"})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ink-soft">Data unavailable</p>
        )}
      </section>

      <div className="mt-3 border-t border-paper-line pt-3">
        <VerificationBadge status={u.verificationStatus} lastVerifiedAt={u.lastVerifiedAt} publisher={null} sourceUrl={u.officialUrl} />
      </div>
    </article>
  );
}
