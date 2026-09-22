"use client";

import { fundingHeadline, formatDate, formatMoney } from "@/lib/format";
import { STATUS_META } from "@/lib/status";
import type { Opportunity } from "@/lib/types";

export function CompareDrawer({ rows, onRemove, onClose }: { rows: Opportunity[]; onRemove: (key: string) => void; onClose: () => void }) {
  const lines: [string, (o: Opportunity) => string][] = [
    ["Country", (o) => o.country.name],
    ["University", (o) => o.university.name],
    ["Program", (o) => o.program.name],
    ["Tuition / year", (o) => formatMoney(o.program.tuitionPerYear, o.program.tuitionCurrency)],
    ["Scholarship", (o) => (o.scholarship ? fundingHeadline(o.scholarship) : "None verified")],
    ["Living support", (o) => (!o.scholarship ? "No" : o.scholarship.livingStipend ?? (o.scholarship.fundingType === "fully_funded" ? "Not verified" : "No"))],
    ["Duration", (o) => (o.program.durationMonths ? `${o.program.durationMonths / 12} years` : "Not verified")],
    ["Taught in English", (o) => (o.program.englishTaught === null ? "Not verified" : o.program.englishTaught ? "Yes" : "No")],
    ["Application status", (o) => (o.scholarship ? STATUS_META[o.status].label : "No scholarship")],
    ["Deadline", (o) => (o.scholarship?.deadline ? formatDate(o.scholarship.deadline.date) + (o.scholarship.deadline.kind === "expected" ? " (expected)" : "") : "Not available")],
    ["Career indicators", (o) => (o.university.careerFacts.length ? o.university.careerFacts.map((c) => `${c.label}: ${c.value}`).join("; ") : "Data unavailable")],
  ];
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="compare-title" className="fixed inset-0 z-50 flex items-end bg-ink/40 sm:items-center sm:justify-center sm:p-6">
      <div className="max-h-[90vh] w-full overflow-auto rounded-t-lg bg-paper p-4 sm:max-w-5xl sm:rounded-lg sm:p-6">
        <div className="flex items-center justify-between">
          <h2 id="compare-title" className="font-serif text-2xl text-ink">Compare side by side</h2>
          <button type="button" onClick={onClose} className="rounded-md px-3 py-1.5 text-sm text-ink hover:bg-paper-tint">Close</button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-40 border-b border-paper-line p-2 text-left font-medium text-ink-soft">Criteria</th>
                {rows.map((o) => (
                  <th key={o.key} className="border-b border-paper-line p-2 text-left align-bottom font-medium text-ink">
                    {o.program.name}
                    <button type="button" onClick={() => onRemove(o.key)} className="ml-2 text-xs font-normal text-route underline">Remove</button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lines.map(([label, get]) => (
                <tr key={label} className="even:bg-paper-tint">
                  <th scope="row" className="p-2 text-left font-normal text-ink-soft">{label}</th>
                  {rows.map((o) => {
                    const v = get(o);
                    return <td key={o.key} className={`p-2 align-top ${/not verified|unavailable|not available/i.test(v) ? "text-caution" : "text-ink"}`}>{v}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-ink-soft">No overall &ldquo;best university&rdquo; score is shown. Each row is a separate, sourced fact.</p>
      </div>
    </div>
  );
}
