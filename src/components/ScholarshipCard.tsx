import Link from "next/link";
import { CoveragePips } from "./CoveragePips";
import { StatusBadge, VerifiedSource } from "./Badges";
import { eligibleFor } from "@/lib/filter";
import { DEGREE_LABEL, FUNDING_LABEL, formatDate, formatIntake, fundingHeadline, hostOf } from "@/lib/format";
import { countryName } from "@/lib/reference";
import { canApplyNow, countdownLabel } from "@/lib/status";
import type { AppStatus, ScholarshipView } from "@/lib/types";

const btn = "inline-flex items-center justify-center rounded-md px-3.5 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-route";

export function ScholarshipCard({ s, status, citizenship }: { s: ScholarshipView; status: AppStatus; citizenship: string | null }) {
  const elig = eligibleFor(s, citizenship);
  const apply = canApplyNow(s, status);
  const countdown = countdownLabel(s, status);
  return (
    <article className="rounded-md border border-paper-line bg-paper p-4 sm:p-5">
      <p className="text-xs text-ink-soft">
        <span className="font-semibold text-ink">{countryName(s.countryCode)}</span>
        {s.university && <> › {s.university.name}</>}
        {!s.university && <> › {s.providerName}</>}
      </p>

      <div className="mt-2 grid gap-4 md:grid-cols-[1fr_14rem]">
        <div className="min-w-0">
          <p className="text-xs text-ink-soft">{FUNDING_LABEL[s.fundingType]}, provided by {s.providerName}</p>
          <h3 className="mt-0.5 font-serif text-xl leading-snug text-ink"><Link href={`/scholarships/${s.id}`} className="hover:text-route">{s.name}</Link></h3>
          <p className="mt-1 text-lg font-semibold text-ink">{fundingHeadline(s)}</p>
          <div className="mt-3"><CoveragePips s={s} /></div>

          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
            <div><dt className="text-xs text-ink-soft">Degree</dt><dd className="text-ink">{s.degreeLevels.map((d) => DEGREE_LABEL[d]).join(", ")}</dd></div>
            <div><dt className="text-xs text-ink-soft">Fields</dt><dd className="text-ink">{s.studyFields.length ? s.studyFields.join(", ") : "All fields (per source)"}</dd></div>
            <div><dt className="text-xs text-ink-soft">Intake</dt><dd className="text-ink">{s.intake ? formatIntake(s.intake) : "Not stated"}</dd></div>
          </dl>

          <div className="mt-3 text-sm">
            <p className="text-xs text-ink-soft">Eligibility (from the official source)</p>
            <p className="text-ink">{s.eligibilityText}</p>
            {citizenship && elig !== null && (
              <p className={`mt-1 ${elig ? "text-seal" : "text-dormant"}`}>
                {elig ? `Open to citizens of ${countryName(citizenship)}.` : `Not open to citizens of ${countryName(citizenship)}.`}
              </p>
            )}
          </div>
        </div>

        <aside className="flex flex-col gap-2 border-t border-paper-line pt-3 text-sm md:border-l md:border-t-0 md:pl-4 md:pt-0">
          <StatusBadge status={status} />
          {countdown && <p className={`text-sm font-semibold ${countdown.urgent ? "text-caution" : "text-route"}`}>{countdown.text}</p>}
          {s.deadline ? (
            <div><p className="text-ink-soft">Official deadline</p><p className="font-semibold text-ink">{formatDate(s.deadline)}</p></div>
          ) : (
            <p className="font-semibold text-ink">{s.cycle} application not announced</p>
          )}
          {status === "UPCOMING" && s.openingDate && <p className="text-ink-soft">Opens {formatDate(s.openingDate)}</p>}
          {s.previousCycleDeadline && (
            <p className="text-xs text-ink-soft">
              Historical: previous cycle{s.previousCycleLabel ? ` (${s.previousCycleLabel})` : ""} deadline was {formatDate(s.previousCycleDeadline)}. Not a current deadline.
            </p>
          )}
        </aside>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-paper-line pt-3 sm:flex-row sm:items-center sm:justify-between">
        <VerifiedSource s={s} />
        <div className="flex shrink-0 flex-wrap gap-2">
          {apply ? (
            <a className={`${btn} bg-ink text-white hover:bg-ink-soft`} href={s.officialApplicationUrl!} target="_blank" rel="noopener noreferrer" title={`Opens ${hostOf(s.officialApplicationUrl)}`}>
              Apply now
            </a>
          ) : (
            <>
              {status !== "OPEN" && <span className={`${btn} cursor-default bg-paper-tint text-ink-soft`}>Application not open</span>}
              <a className={`${btn} border border-ink text-ink hover:bg-paper-tint`} href={s.officialScholarshipUrl} target="_blank" rel="noopener noreferrer">
                View official information
              </a>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
