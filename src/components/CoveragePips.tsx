import type { ScholarshipView } from "@/lib/types";

type State = "yes" | "partial" | "no" | "unknown";

/** Tuition / stipend / housing / insurance / travel, exactly as recorded from the source. */
export function CoveragePips({ s }: { s: ScholarshipView }) {
  const bool = (v: boolean | null): State => (v === true ? "yes" : v === false ? "no" : "unknown");
  const tuition: State =
    s.fundingType === "PARTIAL" ? "partial" : s.tuitionCoverage === true ? "yes" : bool(s.tuitionCoverage);
  const cells: { label: string; state: State; detail?: string }[] = [
    { label: "Tuition", state: tuition, detail: tuition === "partial" && s.fundingPercentage ? `${s.fundingPercentage}%` : undefined },
    { label: "Stipend", state: s.livingStipend ? "yes" : "unknown" },
    { label: "Housing", state: bool(s.accommodation) },
    { label: "Insurance", state: bool(s.healthInsurance) },
    { label: "Travel", state: bool(s.travelSupport) },
  ];
  const text: Record<State, string> = { yes: "Covered", partial: "Partly", no: "Not covered", unknown: "Not stated" };
  const bar: Record<State, string> = {
    yes: "bg-seal",
    partial: "bg-[linear-gradient(90deg,theme(colors.seal.DEFAULT)_50%,theme(colors.paper.line)_50%)]",
    no: "bg-paper-line",
    unknown: "border border-dashed border-paper-line",
  };
  return (
    <ul className="grid max-w-md grid-cols-5 gap-1" aria-label="What the official source says is covered">
      {cells.map((c) => (
        <li key={c.label} className="min-w-0">
          <div className={`h-1.5 rounded-full ${bar[c.state]}`} />
          <p className="mt-1 truncate text-[11px] leading-tight text-ink-soft">{c.label}</p>
          <p className={`truncate text-[11px] leading-tight ${c.state === "yes" ? "text-seal" : "text-ink-faint"}`}>
            {c.detail ?? text[c.state]}
          </p>
        </li>
      ))}
    </ul>
  );
}
