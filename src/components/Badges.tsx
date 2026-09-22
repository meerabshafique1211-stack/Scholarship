import { STATUS_META } from "@/lib/status";
import { formatDate, SOURCE_LABEL } from "@/lib/format";
import type { AppStatus, ScholarshipView } from "@/lib/types";

const TONE = {
  seal: "bg-seal-tint text-seal border-seal/30",
  route: "bg-route-tint text-route border-route/30",
  caution: "bg-caution-tint text-caution border-caution/30",
  dormant: "bg-dormant-tint text-dormant border-dormant/30",
} as const;
const DOT = { seal: "bg-seal", route: "bg-route", caution: "bg-caution", dormant: "bg-dormant" } as const;

export function StatusBadge({ status }: { status: AppStatus }) {
  const m = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONE[m.tone]}`}>
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${DOT[m.tone]}`} />
      {m.label}
    </span>
  );
}

/** Shown on every public scholarship: status, last check date, source type and a link to the source. */
export function VerifiedSource({ s }: { s: ScholarshipView }) {
  return (
    <p className="text-sm text-seal">
      <span className="font-semibold">✓ Verified</span>
      <span className="text-ink-soft">
        {" "}Last checked {formatDate(s.lastVerifiedAt)}. Source: {SOURCE_LABEL[s.sourceType]} ({s.providerName}).{" "}
      </span>
      <a className="font-medium text-route underline underline-offset-2" href={s.sourceUrl} target="_blank" rel="noopener noreferrer">
        View official source
      </a>
    </p>
  );
}
