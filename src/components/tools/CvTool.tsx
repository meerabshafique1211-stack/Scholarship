"use client";

import Link from "next/link";
import { useState } from "react";
import type { CvFindings } from "@/lib/cv-analysis";
import { FileInput, List, TargetFields, postForm } from "./shared";

interface Result {
  findings: CvFindings;
  relevant: { id: string; name: string; provider: string; status: string; officialScholarshipUrl: string; indicators: string[] }[];
  verifiedTotal: number;
  ai: string | null;
  aiError: string | null;
  aiAvailable: boolean;
}

export function CvTool({ aiAvailable }: { aiAvailable: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [r, setR] = useState<Result | null>(null);

  return (
    <div>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true); setError(null); setR(null);
          const res = await postForm<Result>("/api/tools/cv", e.currentTarget);
          setBusy(false);
          if (res.ok) setR(res.data); else setError(res.error);
        }}
      >
        <FileInput name="file" label="Your CV" required />
        <TargetFields />
        {aiAvailable && (
          <label className="flex items-start gap-2 text-sm text-ink">
            <input type="checkbox" name="useAi" className="mt-0.5 h-4 w-4 accent-ink" />
            Also get written AI feedback. Your CV text is sent to Anthropic&apos;s API for this one request; see the privacy page.
          </label>
        )}
        <button disabled={busy} className="rounded-md bg-ink px-5 py-2.5 font-medium text-white disabled:opacity-60">{busy ? "Analysing…" : "Assess my CV"}</button>
      </form>

      {error && <p role="alert" className="mt-6 rounded-md bg-caution-tint p-4 text-caution">{error}</p>}
      {r && (
        <div className="mt-10 border-t border-paper-line pt-6" aria-live="polite">
          <h2 className="font-serif text-2xl text-ink">Profile summary</h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div><dt className="text-ink-soft">Degrees found</dt><dd>{r.findings.degrees.join(", ") || "None found"}</dd></div>
            <div><dt className="text-ink-soft">Institutions found</dt><dd>{r.findings.institutions.join("; ") || "None found"}</dd></div>
            <div><dt className="text-ink-soft">GPA/CGPA</dt><dd>{r.findings.gpa?.raw ?? "Not found"}</dd></div>
            <div><dt className="text-ink-soft">English tests</dt><dd>{r.findings.languageTests.map((t) => `${t.test} ${t.score}`).join(", ") || "Not found"}</dd></div>
            <div><dt className="text-ink-soft">Sections found</dt><dd>{Object.entries(r.findings.sections).filter(([, v]) => v).map(([k]) => k).join(", ") || "None"}</dd></div>
            <div><dt className="text-ink-soft">Length</dt><dd>{r.findings.wordCount} words</dd></div>
          </dl>
          <p className="mt-2 text-xs text-ink-soft">Extracted automatically from your file&apos;s text. If something is missing here, it may be in an image or table we couldn&apos;t read.</p>

          <List title="Strengths" items={r.findings.strengths} tone="seal" />
          <List title="Missing information" items={r.findings.missing} tone="caution" />
          <List title="Suggested improvements" items={r.findings.suggestions} />

          <section className="mt-8">
            <h3 className="font-serif text-xl text-ink">Scholarship eligibility indicators</h3>
            {r.relevant.length === 0 ? (
              <p className="mt-2 text-sm text-ink-soft">
                {r.verifiedTotal === 0 ? "No verified scholarships found for your selected criteria. None are published on this site yet." : "No verified scholarships found for your selected criteria."}
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {r.relevant.map((s) => (
                  <li key={s.id} className="rounded-md border border-paper-line p-3 text-sm">
                    <p className="font-medium text-ink"><Link href={`/scholarships/${s.id}`} className="underline">{s.name}</Link> <span className="text-ink-soft">({s.provider})</span></p>
                    <p className="text-xs text-ink-soft">Potentially relevant. Not a prediction of success.</p>
                    <ul className="mt-1 list-disc pl-5 text-ink-soft">{s.indicators.map((i) => <li key={i}>{i}</li>)}</ul>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {r.ai && (
            <section className="mt-8 rounded-md border border-paper-line p-4">
              <h3 className="font-serif text-xl text-ink">AI feedback (review carefully)</h3>
              <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-ink">{r.ai}</pre>
            </section>
          )}
          {r.aiError && <p className="mt-4 text-sm text-caution">{r.aiError}</p>}
        </div>
      )}
    </div>
  );
}
