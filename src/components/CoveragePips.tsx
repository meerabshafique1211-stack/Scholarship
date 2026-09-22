import type { Scholarship } from "@/lib/types";

type Cell = { label: string; value: boolean | null; detail?: string | null };

/** Five-part coverage strip: makes "fully funded" vs "tuition only" legible at a glance. */
export function CoveragePips({ s }: { s: Scholarship }) {
  const tuition: Cell = {
    label: "Tuition",
    value: s.tuitionCoverage === true ? true : s.fundingPercentage ? null : s.tuitionCoverage,
    detail: s.fundingPercentage !== null && s.fundingPercentage < 100 ? `${s.fundingPercentage}%` : null,
  };
  const cells: Cell[] = [
    tuition,
    { label: "Stipend", value: s.livingStipend ? true : s.fundingType === "fully_funded" ? null : false },
    { label: "Housing", value: s.accommodation },
    { label: "Insurance", value: s.healthInsurance },
    { label: "Travel", value: s.travelSupport },
  ];
  return (
    <ul className="grid grid-cols-5 gap-1" aria-label="What this scholarship covers">
      {cells.map((c) => {
        const partial = c.detail != null;
        const state = partial ? "partial" : c.value === true ? "yes" : c.value === false ? "no" : "unknown";
        const bar = {
          yes: "bg-seal",
          partial: "bg-[linear-gradient(90deg,theme(colors.seal.DEFAULT)_50%,theme(colors.paper.line)_50%)]",
          no: "bg-paper-line",
          unknown: "bg-[repeating-linear-gradient(135deg,theme(colors.paper.line)_0_4px,transparent_4px_8px)] border border-paper-line",
        }[state];
        const text = { yes: "Covered", partial: `${c.detail} covered`, no: "Not covered", unknown: "Not verified" }[state];
        return (
          <li key={c.label} className="min-w-0">
            <div className={`h-1.5 rounded-full ${bar}`} />
            <p className="mt-1 truncate text-[11px] leading-tight text-ink-soft">
              {c.label}
              <span className="sr-only">: {text}</span>
            </p>
            <p aria-hidden className={`truncate text-[11px] leading-tight ${state === "yes" ? "text-seal" : state === "unknown" ? "text-caution" : "text-ink-faint"}`}>
              {text}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
