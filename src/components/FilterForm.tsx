import Link from "next/link";
import { CITIZENSHIPS, DESTINATIONS, FIELDS } from "@/lib/reference";
import { STATUS_META } from "@/lib/status";
import type { Filters, FundingFilter } from "@/lib/types";

const FUNDING: { value: FundingFilter; label: string }[] = [
  { value: "all", label: "Any" },
  { value: "fully_funded", label: "Fully funded" },
  { value: "full_tuition", label: "100% tuition" },
  { value: "75", label: "75%" },
  { value: "50", label: "50%" },
  { value: "25", label: "25%" },
  { value: "other_partial", label: "Other partial" },
  { value: "tuition_waiver", label: "Tuition waiver" },
  { value: "none", label: "No scholarship found" },
];

const field = "w-full rounded-md border border-paper-line bg-paper px-2.5 py-2 text-sm text-ink";

/** Plain GET form: works without JavaScript, and every result page has a shareable URL. */
export function FilterForm({ f }: { f: Filters }) {
  return (
    <form action="/search" method="get" className="space-y-6 text-sm">
      <input type="hidden" name="q" value={f.q} />
      {f.university && (
        <p className="text-ink">
          <input type="hidden" name="university" value={f.university} />
          Scholarships at <strong>{f.university}</strong>. <Link href="/search" className="text-route underline">Clear</Link>
        </p>
      )}
      <fieldset>
        <legend className="mb-2 font-semibold text-ink">Study in</legend>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {DESTINATIONS.map((c) => (
            <label key={c.code} className="flex items-center gap-2 text-ink">
              <input type="checkbox" name="country" value={c.code} defaultChecked={f.countries.includes(c.code)} className="h-4 w-4 accent-ink" />
              {c.name}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 font-semibold text-ink">My citizenship</legend>
        <select name="citizenship" defaultValue={f.citizenship ?? ""} className={field} aria-label="Citizenship">
          <option value="">Not set</option>
          {CITIZENSHIPS.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
      </fieldset>

      <fieldset>
        <legend className="mb-2 font-semibold text-ink">Funding</legend>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {FUNDING.map((o) => (
            <label key={o.value} className="flex items-center gap-2 text-ink">
              <input type="radio" name="funding" value={o.value} defaultChecked={f.funding === o.value} className="h-4 w-4 accent-ink" />
              {o.label}
            </label>
          ))}
        </div>
        <label className="mt-3 block text-ink">
          Minimum tuition covered
          <select name="min" defaultValue={f.minPercent ? String(f.minPercent) : ""} className={`${field} mt-1`}>
            <option value="">Any</option>
            <option value="25">25% or more</option>
            <option value="50">50% or more</option>
            <option value="75">75% or more</option>
            <option value="100">100%</option>
          </select>
        </label>
      </fieldset>

      <fieldset>
        <legend className="mb-2 font-semibold text-ink">Application status</legend>
        {(["OPEN", "UPCOMING", "NOT_ANNOUNCED", "UNKNOWN"] as const).map((s) => (
          <label key={s} className="flex items-center gap-2 text-ink">
            <input type="checkbox" name="status" value={s} defaultChecked={f.statuses.includes(s)} className="h-4 w-4 accent-ink" />
            {STATUS_META[s].label}
          </label>
        ))}
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="mb-2 font-semibold text-ink">Program</legend>
        <select name="degree" defaultValue={f.degree ?? ""} className={field} aria-label="Degree">
          <option value="">Any degree</option>
          <option value="BACHELOR">Bachelor&apos;s</option>
          <option value="MASTER">Master&apos;s</option>
          <option value="PHD">PhD</option>
        </select>
        <select name="field" defaultValue={f.field ?? ""} className={field} aria-label="Field">
          <option value="">Any field</option>
          {FIELDS.map((x) => <option key={x.slug} value={x.slug}>{x.label}</option>)}
        </select>
        <input name="intake" defaultValue={f.intake ?? ""} placeholder="Intake, e.g. 2027-09" pattern="20\d{2}(-\d{2})?" className={field} aria-label="Intake" />
        <p className="text-xs text-ink-soft">Degree, field and intake filter scholarships. Program-level data for universities isn&apos;t connected yet.</p>
      </fieldset>

      <div className="flex items-center gap-3">
        <button className="rounded-md bg-ink px-4 py-2 font-medium text-white hover:bg-ink-soft">Apply filters</button>
        <Link href="/search" className="text-route underline underline-offset-2">Clear all</Link>
      </div>
    </form>
  );
}
