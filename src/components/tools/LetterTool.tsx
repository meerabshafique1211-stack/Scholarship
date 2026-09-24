"use client";

import { useState } from "react";
import { FileInput, inputCls, labelCls, postForm } from "./shared";

export function LetterTool({ aiAvailable }: { aiAvailable: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const [mode, setMode] = useState<string | null>(null);

  return (
    <div>
      <form className="space-y-4" onSubmit={async (e) => {
        e.preventDefault(); setBusy(true); setError(null);
        const res = await postForm<{ draft: string; mode: string }>("/api/tools/letter", e.currentTarget);
        setBusy(false);
        if (res.ok) { setDraft(res.data.draft); setMode(res.data.mode); } else setError(res.error);
      }}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={labelCls}>Target university<input name="university" required className={inputCls} /></label>
          <label className={labelCls}>Programme<input name="program" required className={inputCls} /></label>
          <label className={labelCls}>Scholarship (optional)<input name="scholarship" className={inputCls} /></label>
          <label className={labelCls}>Degree level<input name="degree" className={inputCls} placeholder="e.g. Master's" /></label>
          <label className={`${labelCls} sm:col-span-2`}>Field of study<input name="field" className={inputCls} /></label>
        </div>
        <label className={labelCls}>Your relevant experience, in your own words<textarea name="experience" rows={3} className={inputCls} /></label>
        <label className={labelCls}>Why this programme (use facts from its official page)<textarea name="whyProgram" rows={3} className={inputCls} /></label>
        <label className={labelCls}>Career goals<textarea name="goals" rows={2} className={inputCls} /></label>
        <div className="grid gap-3 sm:grid-cols-2">
          <FileInput name="cv" label="CV (optional)" />
          <FileInput name="transcript" label="Transcript (optional)" />
        </div>
        {aiAvailable
          ? <p className="text-xs text-ink-soft">Your inputs and file text are sent to Anthropic&apos;s API to write the draft. See the privacy page.</p>
          : <p className="text-xs text-ink-soft">AI drafting is not enabled on this site, so you&apos;ll get a structured outline built only from your inputs.</p>}
        <button disabled={busy} className="rounded-md bg-ink px-5 py-2.5 font-medium text-white disabled:opacity-60">{busy ? "Writing…" : aiAvailable ? "Generate draft" : "Build outline"}</button>
      </form>

      {error && <p role="alert" className="mt-6 rounded-md bg-caution-tint p-4 text-caution">{error}</p>}
      {draft !== null && (
        <section className="mt-10 border-t border-paper-line pt-6" aria-live="polite">
          <h2 className="font-serif text-2xl text-ink">{mode === "ai" ? "Draft: review and edit before using" : "Outline: fill in the brackets"}</h2>
          <p className="mt-1 text-sm text-caution">Anything in [square brackets] needs your real details. Remove anything that isn&apos;t true for you.</p>
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={24} className={`${inputCls} font-serif leading-relaxed`} aria-label="Editable letter draft" />
          <button type="button" onClick={() => navigator.clipboard?.writeText(draft)} className="mt-2 rounded-md border border-paper-line px-4 py-2 text-sm text-ink">Copy text</button>
        </section>
      )}
    </div>
  );
}
