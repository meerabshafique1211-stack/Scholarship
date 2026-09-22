import { CoveragePips } from "./CoveragePips";
import { StatusBadge, VerificationBadge } from "./Badges";
import { ApplyAction, secondaryBtn } from "./OfficialLinks";
import { eligibleFor } from "@/lib/filters";
import { fundingHeadline, fundingLabel, formatDate, formatMoney, formatIntake } from "@/lib/format";
import type { Opportunity } from "@/lib/types";

const DEGREE = { bachelor: "Bachelor's", master: "Master's", phd: "PhD" } as const;

export function OpportunityCard({
  o,
  citizenship,
  citizenshipName,
  saved,
  compared,
  onSave,
  onCompare,
  past = false,
}: {
  o: Opportunity;
  citizenship: string | null;
  citizenshipName: string | null;
  saved: boolean;
  compared: boolean;
  onSave: () => void;
  onCompare: () => void;
  past?: boolean;
}) {
  const { country, university: u, program: p, scholarship: s, status } = o;
  const elig = s ? eligibleFor(s, citizenship) : null;
  const statusEdge = !s ? "border-l-paper-line" : { open: "border-l-seal", upcoming: "border-l-route", expected: "border-l-caution", closed: "border-l-dormant", unknown: "border-l-dormant" }[status];

  return (
    <article className={`rounded-md border border-paper-line border-l-4 ${statusEdge} bg-paper p-4 sm:p-5`}>
      {/* Country → University → Program → Scholarship */}
      <nav aria-label="Location" className="text-xs text-ink-soft">
        <ol className="flex flex-wrap items-center gap-x-1.5">
          <li className="font-semibold text-ink">{country.name}</li>
          <li aria-hidden>›</li>
          <li>{u.name}, {u.city}</li>
          <li aria-hidden>›</li>
          <li>{p.name}</li>
        </ol>
      </nav>

      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_13rem]">
        <div className="min-w-0">
          {s ? (
            <>
              <p className="text-xs text-ink-soft">{fundingLabel(s.fundingType)}, awarded by {s.provider}</p>
              <h3 className="mt-0.5 font-serif text-xl leading-snug text-ink">{s.name}</h3>
              <p className="mt-1 text-lg font-semibold text-ink">{fundingHeadline(s)}</p>
              <div className="mt-3 max-w-md"><CoveragePips s={s} /></div>
            </>
          ) : (
            <>
              <p className="text-xs text-ink-soft">No scholarship verified</p>
              <h3 className="mt-0.5 font-serif text-xl leading-snug text-ink">{p.name}</h3>
              <p className="mt-1 text-sm text-ink-soft">
                The program is open to international applicants, but we have not verified a scholarship for it. You would pay full tuition.
              </p>
            </>
          )}

          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
            <Fact label="Degree" value={DEGREE[p.degreeLevel]} />
            <Fact label="Tuition / year" value={formatMoney(p.tuitionPerYear, p.tuitionCurrency)} />
            <Fact label="Taught in English" value={p.englishTaught === null ? "Not verified" : p.englishTaught ? "Yes" : "No"} />
            <Fact label="Intake" value={p.intakes.length ? p.intakes.map(formatIntake).join(", ") : "Not verified"} />
          </dl>

          {s && citizenship && (
            <p className={`mt-3 text-sm ${elig === true ? "text-seal" : elig === false ? "text-dormant" : "text-caution"}`}>
              {elig === true && <>Open to applicants from {citizenshipName}.</>}
              {elig === false && <>Not open to applicants from {citizenshipName}.</>}
              {elig === null && <>Eligibility for {citizenshipName} not verified. Check the official terms.</>}
            </p>
          )}
          {s?.eligibilityNote && <p className="mt-1 text-sm text-ink-soft">{s.eligibilityNote}</p>}
        </div>

        <aside className="flex flex-col gap-2 border-t border-paper-line pt-3 md:border-l md:border-t-0 md:pl-4 md:pt-0">
          {s ? (
            <>
              <StatusBadge status={status} long />
              {past && <p className="text-xs font-medium text-dormant">{s.cycle} cycle, closed</p>}
              <div className="text-sm">
                <p className="text-ink-soft">{s.deadline?.kind === "expected" ? "Expected deadline" : "Deadline"}</p>
                <p className="font-semibold text-ink">{s.deadline ? formatDate(s.deadline.date) : "Information not available"}</p>
                {s.deadline?.kind === "expected" && <p className="text-xs text-caution">Based on previous cycles, not announced.</p>}
              </div>
              {s.opening && status === "upcoming" && (
                <p className="text-sm text-ink-soft">
                  Opens {formatDate(s.opening.date)}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-ink-soft">Check the program page for admission deadlines.</p>
          )}
        </aside>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-paper-line pt-3 sm:flex-row sm:items-center sm:justify-between">
        {s ? (
          <VerificationBadge status={s.verificationStatus} lastVerifiedAt={s.lastVerifiedAt} publisher={s.sourcePublisher} sourceUrl={s.sourceUrl} />
        ) : (
          <VerificationBadge status={u.verificationStatus} lastVerifiedAt={u.lastVerifiedAt} publisher={null} sourceUrl={null} />
        )}
        <div className="flex flex-wrap gap-2">
          {s && !past && <ApplyAction s={s} status={status} />}
          <button type="button" onClick={onCompare} aria-pressed={compared} className={`${secondaryBtn} ${compared ? "border-route bg-route-tint text-route" : ""}`}>
            {compared ? "Comparing" : "Compare"}
          </button>
          <button type="button" onClick={onSave} aria-pressed={saved} className={`${secondaryBtn} ${saved ? "border-seal bg-seal-tint text-seal" : ""}`}>
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-ink-soft">{label}</dt>
      <dd className={`truncate ${value === "Not verified" ? "text-caution" : "text-ink"}`}>{value}</dd>
    </div>
  );
}
