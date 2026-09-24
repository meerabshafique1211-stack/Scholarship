"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { UniversityCard } from "./UniversityCard";
import { ResponsiveAd } from "./ads/AdSlot";
import type { UniversityView } from "@/lib/types";

interface ApiResult {
  items: UniversityView[];
  total: number;
  page: number;
  pageSize: number;
  hint: "field_of_study" | "too_short" | null;
  error: string | null;
}

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; data: ApiResult; items: UniversityView[] }
  | { kind: "error"; message: string };

const DEBOUNCE_MS = 400;

export function UniversitySearch({
  countries, initialQuery, initialCountry, initial,
}: {
  countries: { code: string; name: string }[];
  initialQuery: string;
  initialCountry: string;
  initial: ApiResult | null;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [country, setCountry] = useState(initialCountry);
  const [state, setState] = useState<State>(initial ? { kind: "ok", data: initial, items: initial.items } : { kind: "idle" });
  const [loadingMore, setLoadingMore] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const first = useRef(true);

  const run = useCallback(async (q: string, c: string, page = 1) => {
    abortRef.current?.abort(); // cancel the previous in-flight request
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const params = new URLSearchParams();
    if (q.trim()) params.set("search", q.trim());
    if (c) params.set("country", c);
    params.set("page", String(page));
    window.history.replaceState(null, "", `/universities?${new URLSearchParams({ ...(q.trim() ? { q: q.trim() } : {}), ...(c ? { country: c } : {}) })}`);
    if (page === 1) setState({ kind: "loading" });
    else setLoadingMore(true);
    try {
      const res = await fetch(`/api/universities?${params}`, { signal: ctrl.signal });
      const body = (await res.json().catch(() => null)) as (ApiResult & { error: string | null }) | null;
      if (!res.ok || !body || body.error) {
        const msg = res.status === 429 ? "Too many searches in a short time. Please wait a moment." : "University data is temporarily unavailable. Please try again.";
        setState({ kind: "error", message: msg });
        return;
      }
      setState((prev) => (page > 1 && prev.kind === "ok" ? { kind: "ok", data: body, items: [...prev.items, ...body.items] } : { kind: "ok", data: body, items: body.items }));
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setState({ kind: "error", message: "University data is temporarily unavailable. Please try again." });
    } finally {
      if (abortRef.current === ctrl) setLoadingMore(false);
    }
  }, []);

  // Debounced search: one request after the user pauses typing, not one per keystroke.
  useEffect(() => {
    if (first.current) { first.current = false; if (initial) return; }
    const q = query.trim();
    if (!country && q.length < 2) { abortRef.current?.abort(); setState({ kind: "idle" }); return; }
    const t = setTimeout(() => run(q, country), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query, country, run, initial]);

  useEffect(() => () => abortRef.current?.abort(), []);

  return (
    <div>
      <form role="search" onSubmit={(e) => { e.preventDefault(); run(query, country); }} className="grid gap-2 sm:grid-cols-[1fr_14rem_auto]">
        <label className="sr-only" htmlFor="uni-q">University name</label>
        <input id="uni-q" value={query} onChange={(e) => setQuery(e.target.value)} maxLength={100} autoComplete="off"
          placeholder="University name, e.g. Oxford" className="rounded-md border border-ink/30 bg-paper px-4 py-3 text-ink placeholder:text-ink-faint" />
        <label className="sr-only" htmlFor="uni-c">Country</label>
        <select id="uni-c" value={country} onChange={(e) => setCountry(e.target.value)} className="rounded-md border border-ink/30 bg-paper px-3 py-3 text-ink">
          <option value="">All countries</option>
          {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
        <button className="rounded-md bg-ink px-5 py-3 font-medium text-white hover:bg-ink-soft">Search</button>
      </form>

      <div className="mt-6" aria-live="polite" aria-busy={state.kind === "loading"}>
        {state.kind === "idle" && <p className="text-ink-soft">Type at least 2 letters of a university name, or choose a country.</p>}

        {state.kind === "loading" && (
          <p className="mb-3 text-ink-soft">Finding universities...</p>
          <ul className="space-y-3" aria-label="Loading">
            {[0, 1, 2].map((i) => <li key={i} className="h-16 animate-pulse rounded-md bg-paper-tint" />)}
          </ul>
        )}

        {state.kind === "error" && (
          <div role="alert" className="rounded-md border border-caution/40 bg-caution-tint p-4 text-caution">
            <p className="font-medium">{state.message}</p>
            <button type="button" onClick={() => run(query, country)} className="mt-2 text-sm underline">Try again</button>
          </div>
        )}

        {state.kind === "ok" && state.data.hint === "field_of_study" && (
          <div className="rounded-md border border-paper-line p-4">
            <p className="text-ink">&ldquo;{query}&rdquo; looks like a field of study, not a university name.</p>
            <p className="mt-1 text-sm text-ink-soft">University search matches institution names. To find programs and scholarships in this field, use scholarship search.</p>
            <Link href={`/search?q=${encodeURIComponent(query)}`} className="mt-3 inline-block text-sm font-medium text-route underline">Search scholarships for &ldquo;{query}&rdquo;</Link>
          </div>
        )}

        {state.kind === "ok" && !state.data.hint && state.data.total === 0 && (
          <div className="rounded-md border border-dashed border-ink/25 p-5">
            <p className="font-medium text-ink">No verified universities found for your search.</p>
            <p className="mt-1 text-sm text-ink-soft">Try another university name or country.</p>
          </div>
        )}

        {state.kind === "ok" && state.data.total > 0 && (
          <>
            <p className="text-sm text-ink-soft">{state.data.total} {state.data.total === 1 ? "university" : "universities"} found</p>
            <div className="mt-2 border-t border-paper-line">
              {state.items.map((u, i) => (
                <div key={u.id}>
                  <UniversityCard u={u} />
                  {i === 5 && state.items.length > 8 && <ResponsiveAd />}
                </div>
              ))}
            </div>
            {state.items.length < state.data.total && (
              <button type="button" disabled={loadingMore} onClick={() => run(query, country, state.data.page + 1)}
                className="mt-4 rounded-md border border-ink px-4 py-2 text-sm font-medium text-ink disabled:opacity-60">
                {loadingMore ? "Loading…" : `Show more (${state.data.total - state.items.length} remaining)`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
