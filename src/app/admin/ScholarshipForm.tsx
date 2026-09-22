"use client";

import { useActionState } from "react";
import { saveScholarship, type FormState } from "./actions";

export interface FormDefaults {
  id?: string;
  name?: string; universityDomain?: string; providerName?: string; providerDomain?: string; countryCode?: string;
  degreeLevels?: string[]; studyFields?: string; nationalityRule?: string; nationalities?: string; eligibilityText?: string;
  fundingType?: string; fundingPercentage?: string; fundingAmountText?: string; tuitionCoverage?: string; livingStipend?: string;
  accommodation?: string; healthInsurance?: string; travelSupport?: string; applicationFee?: string; cycle?: string; intake?: string;
  openingDate?: string; deadline?: string; statusUndetermined?: boolean; previousCycleLabel?: string; previousCycleDeadline?: string;
  officialScholarshipUrl?: string; officialApplicationUrl?: string; sourceUrl?: string; sourceType?: string; verificationNotes?: string;
}

const input = "mt-1 w-full rounded-md border border-paper-line bg-paper px-2.5 py-2 text-sm text-ink";
const label = "block text-sm text-ink";

function YesNo({ name, value, text }: { name: string; value?: string; text: string }) {
  return (
    <label className={label}>
      {text}
      <select name={name} defaultValue={value ?? ""} className={input}>
        <option value="">Not stated in source</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
    </label>
  );
}

export function ScholarshipForm({ d, countries }: { d: FormDefaults; countries: { code: string; name: string }[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveScholarship, null);
  return (
    <form action={action} className="space-y-8">
      {d.id && <input type="hidden" name="id" value={d.id} />}
      {state?.errors.length ? (
        <div role="alert" className="rounded-md border border-caution/40 bg-caution-tint p-4 text-sm text-caution">
          <p className="font-semibold">Not saved. Fix these first:</p>
          <ul className="mt-1 list-disc pl-5">{state.errors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      ) : null}

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 font-serif text-xl text-ink">Scholarship and provider</legend>
        <label className={`${label} sm:col-span-2`}>Scholarship name (as published)<input name="name" required defaultValue={d.name} className={input} /></label>
        <label className={label}>Provider name<input name="providerName" required defaultValue={d.providerName} className={input} placeholder="e.g. University of Bologna" /></label>
        <label className={label}>Provider&apos;s official domain<input name="providerDomain" required defaultValue={d.providerDomain} className={input} placeholder="e.g. unibo.it" /></label>
        <label className={label}>University official domain (optional)<input name="universityDomain" defaultValue={d.universityDomain} className={input} placeholder="Must exist in the university database" /></label>
        <label className={label}>Country
          <select name="countryCode" required defaultValue={d.countryCode ?? ""} className={input}>
            <option value="">Choose</option>
            {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </label>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 font-serif text-xl text-ink">Official sources</legend>
        <label className={label}>Source type
          <select name="sourceType" required defaultValue={d.sourceType ?? ""} className={input}>
            <option value="">Choose</option>
            <option value="UNIVERSITY_OFFICIAL">Official university page</option>
            <option value="GOVERNMENT_OFFICIAL">Official government portal</option>
            <option value="ERASMUS_OFFICIAL">Official Erasmus Mundus source</option>
            <option value="SCHOLARSHIP_PROVIDER_OFFICIAL">Official scholarship provider</option>
          </select>
        </label>
        <label className={label}>Source URL (page you checked)<input name="sourceUrl" type="url" required defaultValue={d.sourceUrl} className={input} placeholder="https://" /></label>
        <label className={label}>Official scholarship page URL<input name="officialScholarshipUrl" type="url" required defaultValue={d.officialScholarshipUrl} className={input} placeholder="https://" /></label>
        <label className={label}>Official application portal URL (only if it exists)<input name="officialApplicationUrl" type="url" defaultValue={d.officialApplicationUrl} className={input} placeholder="https://" /></label>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 font-serif text-xl text-ink">Eligibility</legend>
        <div className="text-sm text-ink sm:col-span-2">
          Degree levels
          <div className="mt-1 flex gap-4">
            {[["BACHELOR", "Bachelor's"], ["MASTER", "Master's"], ["PHD", "PhD"]].map(([v, t]) => (
              <label key={v} className="flex items-center gap-2"><input type="checkbox" name="degreeLevels" value={v} defaultChecked={d.degreeLevels?.includes(v)} className="h-4 w-4 accent-ink" />{t}</label>
            ))}
          </div>
        </div>
        <label className={label}>Study fields (comma-separated slugs, empty = all)<input name="studyFields" defaultValue={d.studyFields} className={input} placeholder="computer-science, ai" /></label>
        <label className={label}>Nationality rule
          <select name="nationalityRule" defaultValue={d.nationalityRule ?? "ALL"} className={input}>
            <option value="ALL">Open to all nationalities</option>
            <option value="ONLY_LISTED">Only the listed nationalities</option>
            <option value="ALL_EXCEPT_LISTED">All except the listed nationalities</option>
          </select>
        </label>
        <label className={label}>Nationalities (ISO codes; EU_EEA allowed)<input name="nationalities" defaultValue={d.nationalities} className={input} placeholder="PK, IN, BD" /></label>
        <label className={`${label} sm:col-span-2`}>Eligibility summary, as published<textarea name="eligibilityText" required rows={3} defaultValue={d.eligibilityText} className={input} /></label>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-2 font-serif text-xl text-ink">Funding (only what the source states)</legend>
        <label className={label}>Funding type
          <select name="fundingType" required defaultValue={d.fundingType ?? ""} className={input}>
            <option value="">Choose</option>
            <option value="FULLY_FUNDED">Fully funded (tuition + living support)</option>
            <option value="FULL_TUITION">100% tuition only</option>
            <option value="PARTIAL">Partial (% of tuition)</option>
            <option value="TUITION_WAIVER">Tuition waiver</option>
            <option value="OTHER">Other funding</option>
          </select>
        </label>
        <label className={label}>Percentage of tuition (partial only)<input name="fundingPercentage" type="number" min={1} max={100} defaultValue={d.fundingPercentage} className={input} /></label>
        <label className={label}>Amount as published<input name="fundingAmountText" defaultValue={d.fundingAmountText} className={input} placeholder="e.g. €5,000 per year" /></label>
        <YesNo name="tuitionCoverage" value={d.tuitionCoverage} text="Full tuition covered?" />
        <label className={label}>Living stipend (amount as published)<input name="livingStipend" defaultValue={d.livingStipend} className={input} placeholder="e.g. €934/month" /></label>
        <YesNo name="accommodation" value={d.accommodation} text="Accommodation?" />
        <YesNo name="healthInsurance" value={d.healthInsurance} text="Health insurance?" />
        <YesNo name="travelSupport" value={d.travelSupport} text="Travel support?" />
        <label className={label}>Application fee<input name="applicationFee" defaultValue={d.applicationFee} className={input} placeholder="e.g. None / €30" /></label>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-2 font-serif text-xl text-ink">Dates (official for this cycle only)</legend>
        <label className={label}>Cycle<input name="cycle" required defaultValue={d.cycle} className={input} placeholder="2027-28" /></label>
        <label className={label}>Intake<input name="intake" defaultValue={d.intake} className={input} placeholder="2027-09" /></label>
        <span />
        <label className={label}>Official opening date<input name="openingDate" type="date" defaultValue={d.openingDate} className={input} /></label>
        <label className={label}>Official deadline<input name="deadline" type="date" defaultValue={d.deadline} className={input} /></label>
        <label className="flex items-end gap-2 pb-2 text-sm text-ink"><input type="checkbox" name="statusUndetermined" defaultChecked={d.statusUndetermined} className="h-4 w-4 accent-ink" />Source exists but status is unclear</label>
        <p className="text-xs text-ink-soft sm:col-span-3">Leave dates empty if this cycle hasn&apos;t been announced. Never copy last year&apos;s dates here. If the page says applications are open but gives no opening date, enter the date you confirmed it was open.</p>
        <label className={label}>Previous cycle label (history)<input name="previousCycleLabel" defaultValue={d.previousCycleLabel} className={input} placeholder="2026-27" /></label>
        <label className={label}>Previous cycle deadline (history)<input name="previousCycleDeadline" type="date" defaultValue={d.previousCycleDeadline} className={input} /></label>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-2 font-serif text-xl text-ink">Verification</legend>
        <label className={label}>Verification notes<textarea name="verificationNotes" rows={2} defaultValue={d.verificationNotes} className={input} /></label>
        <label className="flex items-start gap-2 text-sm text-ink">
          <input type="checkbox" name="attest" className="mt-0.5 h-4 w-4 accent-ink" />
          I checked every field above against the official source today, and nothing was copied from a blog, aggregator or AI answer.
        </label>
      </fieldset>

      <div className="flex flex-wrap gap-2 border-t border-paper-line pt-4">
        <button name="intent" value="verify" disabled={pending} className="rounded-md bg-seal px-4 py-2 font-medium text-white disabled:opacity-60">Verify and publish</button>
        <button name="intent" value="save" disabled={pending} className="rounded-md border border-ink px-4 py-2 font-medium text-ink disabled:opacity-60">Save as needs verification</button>
        {d.id && <button name="intent" value="expire" disabled={pending} formNoValidate className="rounded-md border border-paper-line px-4 py-2 text-ink disabled:opacity-60">Mark expired</button>}
        {d.id && <button name="intent" value="reject" disabled={pending} formNoValidate className="rounded-md border border-caution/50 px-4 py-2 text-caution disabled:opacity-60">Reject</button>}
      </div>
    </form>
  );
}
