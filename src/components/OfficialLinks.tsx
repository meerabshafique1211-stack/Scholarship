import type { AppStatus, Scholarship } from "@/lib/types";

const btn = "inline-flex items-center justify-center rounded-md px-3.5 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-route";

/**
 * Apply Now only appears for OPEN scholarships with a direct application URL.
 * Otherwise the student gets the official information page. Demo records never link out.
 */
export function ApplyAction({ s, status }: { s: Scholarship; status: AppStatus }) {
  if (s.verificationStatus === "demo") {
    return (
      <span className={`${btn} cursor-not-allowed border border-dashed border-paper-line text-ink-faint`} title="Demo records have no real links">
        {status === "open" && s.applicationUrl ? "Apply now (demo)" : "Official information (demo)"}
      </span>
    );
  }
  if (status === "open" && s.applicationUrl) {
    return (
      <a className={`${btn} bg-ink text-white hover:bg-ink-soft`} href={s.applicationUrl} target="_blank" rel="noopener noreferrer">
        Apply now
      </a>
    );
  }
  if (s.officialUrl) {
    return (
      <a className={`${btn} border border-ink text-ink hover:bg-paper-tint`} href={s.officialUrl} target="_blank" rel="noopener noreferrer">
        Official scholarship information
      </a>
    );
  }
  return <span className="text-sm text-caution">Official link not verified</span>;
}

export const secondaryBtn = `${btn} border border-paper-line text-ink hover:bg-paper-tint`;
