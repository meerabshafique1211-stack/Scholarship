"use client";

import { useState } from "react";
import type { TranscriptFindings } from "@/lib/transcript-analysis";
import { FileInput, List, inputCls, labelCls, postForm } from "./shared";

interface Result {
  findings: TranscriptFindings;
  comparison: { status: string; message: string };
  requirementSource: string | null;
}

export function TranscriptTool() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [r, setR] = useState<Result | null>(null);
  const tone = r?.comparison.status === "meets" ? "text-seal" : r?.comparison.status === "below" ? "text-caution" : "text-ink";

  return (
    <div>
      <form className="space-y-4" onSubmit={async (e) => {
        e.preventDefault(); setBusy(true); setError(null); setR(null);
        const res = await postForm<Result>("/api/tools/transcript", e.currentTarget);
        setBusy(false);
        if (res.ok) setR(res.data); else setError(res.error);
      }}>
        <FileInput name="file" label="Your transcript" required />
        <fieldset className="rounded-md border border-paper-line p-4">
          <legend className="px-1 text-sm font-medium text-ink">Published requirement (optional)</legend>
          <p className="text-xs text-ink-soft">Copy the minimum from the official programme or scholarship page, and paste that page&apos;s link.</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            <label className={labelCls}>Minimum GPA<input name="minGpa" inputMode="decimal" className={inputCls} placeholder="e.g. 3.0" /></label>
            <label className={labelCls}>On a scale of<input name="minScale" inputMode="decimal" className={inputCls} placeholder="e.g. 4" /></label>
            <label className={labelCls}>Official page URL<input name="sourceUrl" type="url" className={inputCls} placeholder="https://" /></label>
          </div>
        </fieldset>
        <button disabled={busy} className="rounded-md bg-ink px-5 py-2.5 font-medium text-white disabled:opacity-60">{busy ? "Reading…" : "Check my transcript"}</button>
      </form>

      {error && <p role="alert" className="mt-6 rounded-md bg-caution-tint p-4 text-caution">{error}</p>}
      {r && (
        <div className="mt-10 border-t border-paper-line pt-6" aria-live="polite">
          <h2 className="font-serif text-2xl text-ink">What we could read</h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div><dt className="text-ink-soft">Degree</dt><dd>{r.findings.degree ?? "Not found"}</dd></div>
            <div><dt className="text-ink-soft">Major</dt><dd>{r.findings.major ?? "Not found"}</dd></div>
            <div><dt className="text-ink-soft">GPA/CGPA</dt><dd>{r.findings.gpa?.raw ?? "Not found"}</dd></div>
            <div><dt className="text-ink-soft">Credits</dt><dd>{r.findings.credits?.raw ?? "Not found"}</dd></div>
            <div><dt className="text-ink-soft">Graduation date</dt><dd>{r.findings.graduation ?? "Not found"}</dd></div>
            <div><dt className="text-ink-soft">Course rows read</dt><dd>{r.findings.courses.length}</dd></div>
          </dl>
          <div className={`mt-6 rounded-md border border-paper-line p-4 text-sm ${tone}`}>
            <p className="font-medium">Requirement check</p>
            <p className="mt-1">{r.comparison.message}</p>
            {r.requirementSource && <p className="mt-1 text-ink-soft">Requirement source: <a className="underline" href={r.requirementSource} target="_blank" rel="noopener noreferrer">{r.requirementSource}</a></p>}
            <p className="mt-2 text-xs text-ink-soft">This is not an official credential evaluation.</p>
          </div>
          <List title="Notes" items={r.findings.notes} tone="caution" />
          {r.findings.courses.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[32rem] text-sm">
                <thead><tr className="border-b border-paper-line text-left text-ink-soft"><th className="p-2">Code</th><th className="p-2">Course</th><th className="p-2">Credits</th><th className="p-2">Grade</th></tr></thead>
                <tbody>{r.findings.courses.map((c, i) => <tr key={i} className="border-b border-paper-line"><td className="p-2">{c.code}</td><td className="p-2">{c.title}</td><td className="p-2">{c.credits ?? ""}</td><td className="p-2">{c.grade}</td></tr>)}</tbody>
              </table>
              <p className="mt-2 text-xs text-ink-soft">Rows exactly as read from your file. Check them against your official transcript.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
