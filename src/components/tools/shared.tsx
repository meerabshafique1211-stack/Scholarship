"use client";

import { CITIZENSHIPS, DESTINATIONS, FIELDS } from "@/lib/reference";

export const inputCls = "mt-1 w-full rounded-md border border-paper-line bg-paper px-2.5 py-2 text-sm text-ink";
export const labelCls = "block text-sm text-ink";

export async function postForm<T>(url: string, form: HTMLFormElement): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(url, { method: "POST", body: new FormData(form) });
    const body = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
    if (!res.ok || !body) return { ok: false, error: body?.error ?? "Something went wrong. Please try again." };
    return { ok: true, data: body };
  } catch {
    return { ok: false, error: "Network error. Please check your connection and try again." };
  }
}

export function FileInput({ name, label, required = false }: { name: string; label: string; required?: boolean }) {
  return (
    <label className={labelCls}>
      {label}
      <input type="file" name={name} required={required} accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" className={`${inputCls} file:mr-3 file:rounded file:border-0 file:bg-paper-tint file:px-3 file:py-1`} />
      <span className="mt-1 block text-xs text-ink-soft">PDF, DOCX or TXT, up to 5 MB. Read in memory for this request only; never stored.</span>
    </label>
  );
}

export function TargetFields() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className={labelCls}>Target country<select name="country" className={inputCls} defaultValue=""><option value="">Any</option>{DESTINATIONS.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}</select></label>
      <label className={labelCls}>Target degree<select name="degree" className={inputCls} defaultValue=""><option value="">Any</option><option value="BACHELOR">Bachelor&apos;s</option><option value="MASTER">Master&apos;s</option><option value="PHD">PhD</option></select></label>
      <label className={labelCls}>Target field<select name="field" className={inputCls} defaultValue=""><option value="">Any</option>{FIELDS.map((f) => <option key={f.slug} value={f.slug}>{f.label}</option>)}</select></label>
      <label className={labelCls}>Your nationality<select name="nationality" className={inputCls} defaultValue=""><option value="">Not set</option>{CITIZENSHIPS.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}</select></label>
    </div>
  );
}

export function List({ title, items, tone = "ink" }: { title: string; items: string[]; tone?: "ink" | "seal" | "caution" }) {
  if (!items.length) return null;
  const color = tone === "seal" ? "text-seal" : tone === "caution" ? "text-caution" : "text-ink";
  return (
    <section className="mt-6">
      <h3 className="font-serif text-xl text-ink">{title}</h3>
      <ul className={`mt-2 list-disc space-y-1 pl-5 text-sm ${color}`}>{items.map((i) => <li key={i}>{i}</li>)}</ul>
    </section>
  );
}
