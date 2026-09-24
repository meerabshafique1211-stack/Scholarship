"use client";

import { useEffect, useState } from "react";
import { DOCUMENTS, STATUSES, loadTracker, newApplication, saveTracker, type TrackedApplication, type TrackerStatus } from "@/lib/tracker";

const input = "w-full rounded-md border border-paper-line bg-paper px-2.5 py-2 text-sm text-ink";

export function Tracker() {
  const [items, setItems] = useState<TrackedApplication[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => setItems(loadTracker()), []);
  const commit = (next: TrackedApplication[]) => {
    setItems(next);
    if (!saveTracker(next)) setMessage("Your browser blocked local storage, so changes won't be kept after you close this page.");
  };
  const update = (id: string, patch: Partial<TrackedApplication>) =>
    commit((items ?? []).map((a) => (a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a)));

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(items ?? [], null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "scholarship-applications.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importJson = async (file: File | undefined) => {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text()) as TrackedApplication[];
      if (!Array.isArray(data)) throw new Error();
      commit(data.filter((d) => typeof d?.id === "string").slice(0, 500));
      setMessage(`Imported ${data.length} applications.`);
    } catch {
      setMessage("That file isn't a tracker export.");
    }
  };

  if (items === null) return <p className="text-ink-soft">Loading your tracker…</p>;
  const sorted = [...items].sort((a, b) => (a.deadline || "9999").localeCompare(b.deadline || "9999"));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => commit([...items, newApplication({})])} className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white">Add application</button>
        <button type="button" onClick={exportJson} disabled={!items.length} className="rounded-md border border-paper-line px-4 py-2 text-sm text-ink disabled:opacity-50">Export</button>
        <label className="cursor-pointer rounded-md border border-paper-line px-4 py-2 text-sm text-ink">
          Import<input type="file" accept="application/json" className="sr-only" onChange={(e) => importJson(e.target.files?.[0])} />
        </label>
      </div>
      {message && <p role="status" className="mt-3 text-sm text-caution">{message}</p>}
      {sorted.length === 0 ? (
        <p className="mt-6 text-ink-soft">No applications yet. Add one here, or use &ldquo;Add to my tracker&rdquo; on any verified scholarship.</p>
      ) : (
        <ul className="mt-6 space-y-5">
          {sorted.map((a) => {
            const done = DOCUMENTS.filter((d) => a.documents[d]).length;
            const overdue = a.deadline && a.deadline < today && !["Applied", "Interview", "Offer", "Rejected", "Withdrawn"].includes(a.status);
            return (
              <li key={a.id} className="rounded-md border border-paper-line p-4">
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  <label className="text-xs text-ink-soft">University<input className={input} value={a.university} onChange={(e) => update(a.id, { university: e.target.value })} /></label>
                  <label className="text-xs text-ink-soft">Scholarship<input className={input} value={a.scholarship} onChange={(e) => update(a.id, { scholarship: e.target.value })} /></label>
                  <label className="text-xs text-ink-soft">Status
                    <select className={input} value={a.status} onChange={(e) => update(a.id, { status: e.target.value as TrackerStatus })}>
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </label>
                  <label className="text-xs text-ink-soft">Deadline (from the official page)<input type="date" className={input} value={a.deadline} onChange={(e) => update(a.id, { deadline: e.target.value })} /></label>
                  <label className="text-xs text-ink-soft md:col-span-2">Official application URL<input type="url" className={input} value={a.applicationUrl} onChange={(e) => update(a.id, { applicationUrl: e.target.value })} placeholder="https://" /></label>
                </div>
                {overdue && <p className="mt-2 text-sm text-caution">This deadline has passed.</p>}
                <fieldset className="mt-3">
                  <legend className="text-xs text-ink-soft">Documents ({done}/{DOCUMENTS.length} ready)</legend>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    {DOCUMENTS.map((d) => (
                      <label key={d} className="flex items-center gap-1.5 text-sm text-ink">
                        <input type="checkbox" className="h-4 w-4 accent-ink" checked={Boolean(a.documents[d])} onChange={(e) => update(a.id, { documents: { ...a.documents, [d]: e.target.checked } })} />{d}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label className="mt-3 block text-xs text-ink-soft">Notes<textarea rows={2} className={input} value={a.notes} onChange={(e) => update(a.id, { notes: e.target.value })} /></label>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  {/^https:\/\//.test(a.applicationUrl) && <a href={a.applicationUrl} target="_blank" rel="noopener noreferrer" className="text-route underline">Open application page</a>}
                  {a.scholarshipId && <a href={`/scholarships/${a.scholarshipId}`} className="text-route underline">Scholarship details</a>}
                  <button type="button" onClick={() => commit(items.filter((x) => x.id !== a.id))} className="ml-auto text-caution underline">Remove</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
