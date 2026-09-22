import { STATUS_META, effectiveVerification } from "@/lib/status";
import { formatDate } from "@/lib/format";
import type { AppStatus, VerificationStatus } from "@/lib/types";

const TONE: Record<string, string> = {
  seal: "bg-seal-tint text-seal border-seal/30",
  route: "bg-route-tint text-route border-route/30",
  caution: "bg-caution-tint text-caution border-caution/30",
  dormant: "bg-dormant-tint text-dormant border-dormant/30",
};

const DOT: Record<string, string> = { seal: "bg-seal", route: "bg-route", caution: "bg-caution", dormant: "bg-dormant" };

export function StatusBadge({ status, long = false }: { status: AppStatus; long?: boolean }) {
  const m = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONE[m.tone]}`}>
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${DOT[m.tone]}`} />
      {long ? m.label : m.short}
    </span>
  );
}

export function VerificationBadge({
  status,
  lastVerifiedAt,
  publisher,
  sourceUrl,
}: {
  status: VerificationStatus;
  lastVerifiedAt: string | null;
  publisher: string | null;
  sourceUrl: string | null;
}) {
  const eff = effectiveVerification(status, lastVerifiedAt);
  if (eff === "demo") {
    return (
      <p className="text-xs text-caution">
        <span className="font-semibold">Demo record.</span> Fictional data for development, not a real opportunity.
      </p>
    );
  }
  if (eff === "verified") {
    return (
      <p className="text-xs text-seal">
        <span className="font-semibold">✓ Officially verified</span>
        {publisher && <> against {publisher}</>}, {formatDate(lastVerifiedAt)}.{" "}
        {sourceUrl && (
          <a className="underline underline-offset-2" href={sourceUrl} target="_blank" rel="noopener noreferrer">
            View source
          </a>
        )}
      </p>
    );
  }
  return (
    <p className="text-xs text-caution">
      <span className="font-semibold">⚠ Verification required.</span>{" "}
      {lastVerifiedAt ? <>Last verified {formatDate(lastVerifiedAt)}; details may have changed.</> : <>Not yet checked against an official source.</>}
    </p>
  );
}

export function DemoBanner() {
  return (
    <div role="note" className="border-b border-caution/30 bg-caution-tint text-caution">
      <p className="mx-auto max-w-page px-4 py-2 text-sm">
        <span className="font-semibold">Development preview.</span> All universities and scholarships shown are fictional demo
        records. No verified data is connected yet.
      </p>
    </div>
  );
}
