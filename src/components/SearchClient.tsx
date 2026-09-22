"use client";

import { useEffect, useMemo, useState } from "react";
import { CITIZENSHIPS, DESTINATIONS, FIELDS } from "@/data/reference";
import { applyFilters, countByStatus } from "@/lib/filters";
import { applyParsed, parseQuery } from "@/lib/query-parser";
import { STATUS_META } from "@/lib/status";
import { EMPTY_FILTERS, type Filters, type Opportunity } from "@/lib/types";
import { filtersToParams } from "@/lib/url-state";
import { formatIntake } from "@/lib/format";
import { FilterPanel } from "./FilterPanel";
import { OpportunityCard } from "./OpportunityCard";
import { UniversityCard } from "./UniversityCard";
import { CompareDrawer } from "./CompareDrawer";

const MAX_COMPARE = 3;

export function SearchClient({ initial, current, past }: { initial: Filters; current: Opportunity[]; past: Opportunity[] }) {
  const [f, setF] = useState<Filters>(initial);
  const [draftQ, setDraftQ] = useState(initial.q);
  const [view, setView] = useState<"scholarships" | "universities">("scholarships");
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [compare, setCompare] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const set = (patch: Partial<Filters>) => setF((prev) => ({ ...prev, ...patch }));

  // The typed query is interpreted into structured filters; explicit panel choices win.
  const parsed = useMemo(() => parseQuery(f.q), [f.q]);
  const effective = useMemo(() => applyParsed(f, parsed), [f, parsed]);
  const results = useMemo(() => applyFilters(current, effective, parsed.residual), [current, effective, parsed.residual]);
  const pastResults = useMemo(() => applyFilters(past, { ...effective, statuses: [] }, parsed.residual), [past, effective, parsed.residual]);
  const counts = countByStatus(results);

  useEffect(() => {
    const qs = filtersToParams(f).toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [f]);

  const citizenshipName = CITIZENSHIPS.find((c) => c.code === effective.citizenship)?.name ?? null;
  const all = [...current, ...past];
  const compareRows = compare.map((k) => all.find((o) => o.key === k)).filter((o): o is Opportunity => Boolean(o));

  const toggleCompare = (key: string) => {
    setCompare((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= MAX_COMPARE) {
        setNotice(`You can compare up to ${MAX_COMPARE} at a time. Remove one to add another.`);
        return prev;
      }
      setNotice(null);
      return [...prev, key];
    });
  };
  const toggleSave = (key: string) =>
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const chips: string[] = [
    ...parsed.countries.map((c) => `Study in ${DESTINATIONS.find((d) => d.code === c)?.name}`),
    parsed.citizenship ? `Citizen of ${CITIZENSHIPS.find((c) => c.code === parsed.citizenship)?.name}` : "",
    parsed.degree ? { bachelor: "Bachelor's", master: "Master's", phd: "PhD" }[parsed.degree] : "",
    parsed.field ? FIELDS.find((x) => x.slug === parsed.field)?.label ?? "" : "",
    parsed.funding ? { all: "", fully_funded: "Fully funded", full_tuition: "100% tuition", "75": "75%", "50": "50%", "25": "25%", other_partial: "Partial", none: "No scholarship" }[parsed.funding] : "",
    parsed.minPercent ? `At least ${parsed.minPercent}% tuition` : "",
    ...parsed.statuses.map((s) => STATUS_META[s].label),
    parsed.intake ? `Intake ${formatIntake(parsed.intake)}` : "",
    ...parsed.residual.map((w) => `“${w}”`),
  ].filter(Boolean);

  const byUniversity: Opportunity[][] = Array.from(
    results.reduce((m, r) => m.set(r.university.id, [...(m.get(r.university.id) ?? []), r]), new Map<string, Opportunity[]>()).values(),
  );

  return (
    <div className="mx-auto max-w-page px-4 pb-28 pt-6">
      <form
        role="search"
        onSubmit={(e) => { e.preventDefault(); set({ q: draftQ.trim() }); }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <label htmlFor="q" className="sr-only">Search university, country, scholarship or program</label>
        <input id="q" value={draftQ} onChange={(e) => setDraftQ(e.target.value)} maxLength={200}
          placeholder="Search university, country, scholarship or program"
          className="w-full rounded-md border border-ink/30 bg-paper px-4 py-3 text-base text-ink placeholder:text-ink-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-route" />
        <button className="rounded-md bg-ink px-5 py-3 font-medium text-white hover:bg-ink-soft">Search</button>
      </form>
      {f.q && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-sm">
          <span className="text-ink-soft">Understood as:</span>
          {chips.length ? chips.map((c) => <span key={c} className="rounded-full bg-paper-tint px-2.5 py-0.5 text-ink">{c}</span>) : <span className="text-ink-soft">a keyword search</span>}
          <button type="button" className="ml-1 text-route underline" onClick={() => { setDraftQ(""); set({ q: "" }); }}>Clear search</button>
        </div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[17rem_1fr]">
        <aside>
          <button type="button" className="mb-3 w-full rounded-md border border-paper-line px-3 py-2 text-sm font-medium text-ink lg:hidden" aria-expanded={showFilters} onClick={() => setShowFilters((v) => !v)}>
            {showFilters ? "Hide filters" : "Show filters"}
          </button>
          <div className={`${showFilters ? "block" : "hidden"} lg:block lg:sticky lg:top-4`}>
            <FilterPanel f={f} set={set} onReset={() => { setF(EMPTY_FILTERS); setDraftQ(""); }} />
          </div>
        </aside>

        <section aria-labelledby="results-heading">
          <div className="flex flex-col gap-3 border-b border-paper-line pb-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 id="results-heading" className="font-serif text-2xl text-ink">
                {results.length} {results.length === 1 ? "result" : "results"}
              </h1>
              <p className="text-sm text-ink-soft" aria-live="polite">
                {counts.open ?? 0} open now, {counts.upcoming ?? 0} upcoming, {counts.expected ?? 0} expected
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <div className="inline-flex rounded-md border border-paper-line p-0.5" role="tablist" aria-label="Result view">
                {(["scholarships", "universities"] as const).map((v) => (
                  <button key={v} role="tab" aria-selected={view === v} type="button" onClick={() => setView(v)}
                    className={`rounded px-3 py-1.5 ${view === v ? "bg-ink text-white" : "text-ink"}`}>
                    By {v === "scholarships" ? "scholarship" : "university"}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-1.5 text-ink-soft">
                Sort
                <select value={f.sort} onChange={(e) => set({ sort: e.target.value as Filters["sort"] })} className="rounded-md border border-paper-line bg-paper px-2 py-1.5 text-ink">
                  <option value="deadline">Open first, then deadline</option>
                  <option value="funding">Most funding</option>
                  <option value="name">University name</option>
                </select>
              </label>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="mt-8 rounded-md border border-dashed border-paper-line p-6 text-ink">
              <p className="font-medium">No programs match these filters.</p>
              <p className="mt-1 text-sm text-ink-soft">Try removing a country, lowering the minimum funding, or clearing the requirement filters.</p>
            </div>
          ) : view === "scholarships" ? (
            <ul className="mt-4 space-y-4">
              {results.map((o) => (
                <li key={o.key}>
                  <OpportunityCard o={o} citizenship={effective.citizenship} citizenshipName={citizenshipName}
                    saved={saved.has(o.key)} compared={compare.includes(o.key)} onSave={() => toggleSave(o.key)} onCompare={() => toggleCompare(o.key)} />
                </li>
              ))}
            </ul>
          ) : (
            <ul className="mt-4 grid gap-4 xl:grid-cols-2">
              {byUniversity.map((rows) => <li key={rows[0].university.id}><UniversityCard rows={rows} /></li>)}
            </ul>
          )}

          {pastResults.length > 0 && (
            <details className="mt-10">
              <summary className="cursor-pointer font-serif text-xl text-ink">Past opportunities ({pastResults.length})</summary>
              <p className="mt-1 text-sm text-ink-soft">Closed cycles, kept so you can see what to expect next time. These are not current opportunities.</p>
              <ul className="mt-4 space-y-4 opacity-90">
                {pastResults.map((o) => (
                  <li key={o.key}>
                    <OpportunityCard past o={o} citizenship={effective.citizenship} citizenshipName={citizenshipName}
                      saved={saved.has(o.key)} compared={compare.includes(o.key)} onSave={() => toggleSave(o.key)} onCompare={() => toggleCompare(o.key)} />
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>
      </div>

      {(compare.length > 0 || saved.size > 0 || notice) && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-paper-line bg-paper/95 backdrop-blur">
          <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
            <p className="text-ink-soft">
              {saved.size} saved (kept for this visit until accounts arrive)
              {notice && <span className="ml-2 text-caution">{notice}</span>}
            </p>
            <button type="button" disabled={compare.length < 2} onClick={() => setShowCompare(true)}
              className="rounded-md bg-route px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50">
              Compare {compare.length} of {MAX_COMPARE}
            </button>
          </div>
        </div>
      )}
      {showCompare && compareRows.length > 0 && (
        <CompareDrawer rows={compareRows} onRemove={(k) => setCompare((p) => p.filter((x) => x !== k))} onClose={() => setShowCompare(false)} />
      )}
    </div>
  );
}
