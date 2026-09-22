"use client";

import { CITIZENSHIPS, DESTINATIONS, FIELDS } from "@/data/reference";
import { STATUS_META } from "@/lib/status";
import type { AppStatus, Filters, FundingFilter } from "@/lib/types";

const FUNDING_OPTIONS: { value: FundingFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "fully_funded", label: "Fully funded" },
  { value: "full_tuition", label: "100% tuition" },
  { value: "75", label: "75%" },
  { value: "50", label: "50%" },
  { value: "25", label: "25%" },
  { value: "other_partial", label: "Other partial" },
  { value: "none", label: "No scholarship" },
];

const STATUSES: AppStatus[] = ["open", "upcoming", "expected", "unknown"];

const select = "w-full rounded-md border border-paper-line bg-paper px-2.5 py-2 text-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-route";

export function FilterPanel({ f, set, onReset }: { f: Filters; set: (patch: Partial<Filters>) => void; onReset: () => void }) {
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <div className="space-y-6 text-sm">
      <Group title="Study in">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {DESTINATIONS.map((c) => (
            <label key={c.code} className="flex items-center gap-2 text-ink">
              <input type="checkbox" className="h-4 w-4 accent-ink" checked={f.countries.includes(c.code)} onChange={() => set({ countries: toggle(f.countries, c.code) })} />
              {c.name}
            </label>
          ))}
        </div>
      </Group>

      <Group title="My citizenship">
        <select aria-label="Citizenship" className={select} value={f.citizenship ?? ""} onChange={(e) => set({ citizenship: e.target.value || null })}>
          <option value="">Not set</option>
          {CITIZENSHIPS.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
        <p className="mt-1 text-xs text-ink-soft">Hides scholarships you are confirmed ineligible for. Unverified eligibility stays visible and labelled.</p>
      </Group>

      <Group title="Funding">
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Funding">
          {FUNDING_OPTIONS.map((o) => (
            <button key={o.value} type="button" role="radio" aria-checked={f.funding === o.value} onClick={() => set({ funding: o.value })}
              className={`rounded-full border px-3 py-1 ${f.funding === o.value ? "border-ink bg-ink text-white" : "border-paper-line text-ink hover:border-ink-soft"}`}>
              {o.label}
            </button>
          ))}
        </div>
        <label className="mt-3 block text-ink">
          Minimum tuition covered: <span className="font-semibold">{f.minPercent ? `${f.minPercent}% or more` : "any"}</span>
          <input type="range" min={0} max={100} step={25} value={f.minPercent ?? 0} className="mt-1 w-full accent-ink"
            onChange={(e) => set({ minPercent: Number(e.target.value) || null })} />
        </label>
      </Group>

      <Group title="Application status">
        <div className="space-y-1.5">
          {STATUSES.map((s) => (
            <label key={s} className="flex items-center gap-2 text-ink">
              <input type="checkbox" className="h-4 w-4 accent-ink" checked={f.statuses.includes(s)} onChange={() => set({ statuses: toggle(f.statuses, s) })} />
              {STATUS_META[s].label}
            </label>
          ))}
        </div>
      </Group>

      <Group title="Program">
        <div className="space-y-2">
          <select aria-label="Degree" className={select} value={f.degree ?? ""} onChange={(e) => set({ degree: (e.target.value || null) as Filters["degree"] })}>
            <option value="">Any degree</option>
            <option value="bachelor">Bachelor&apos;s</option>
            <option value="master">Master&apos;s</option>
            <option value="phd">PhD</option>
          </select>
          <select aria-label="Field" className={select} value={f.field ?? ""} onChange={(e) => set({ field: e.target.value || null })}>
            <option value="">Any field</option>
            {FIELDS.map((x) => <option key={x.slug} value={x.slug}>{x.label}</option>)}
          </select>
          <select aria-label="Intake" className={select} value={f.intake ?? ""} onChange={(e) => set({ intake: e.target.value || null })}>
            <option value="">Any intake</option>
            {["2027-01", "2027-04", "2027-08", "2027-09", "2027-10", "2027"].map((i) => (
              <option key={i} value={i}>{i.length === 4 ? `Any time in ${i}` : new Date(i + "-01T00:00:00Z").toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" })}</option>
            ))}
          </select>
          <select aria-label="Institution type" className={select} value={f.institutionType ?? ""} onChange={(e) => set({ institutionType: (e.target.value || null) as Filters["institutionType"] })}>
            <option value="">Public or private</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
      </Group>

      <Group title="Requirements">
        <div className="space-y-1.5">
          {([["englishOnly", "Taught in English"], ["noIelts", "No IELTS required"], ["noWorkExperience", "No work experience required"], ["noApplicationFee", "No application fee"]] as const).map(([k, label]) => (
            <label key={k} className="flex items-center gap-2 text-ink">
              <input type="checkbox" className="h-4 w-4 accent-ink" checked={f[k]} onChange={() => set({ [k]: !f[k] } as Partial<Filters>)} />
              {label}
            </label>
          ))}
        </div>
        <p className="mt-1 text-xs text-ink-soft">Programs whose requirement is not verified are excluded when these are on.</p>
      </Group>

      <button type="button" onClick={onReset} className="text-sm font-medium text-route underline underline-offset-2">Clear all filters</button>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 font-semibold text-ink">{title}</legend>
      {children}
    </fieldset>
  );
}
