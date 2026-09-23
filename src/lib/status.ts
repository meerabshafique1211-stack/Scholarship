import type { AppStatus, ScholarshipView } from "./types";

export const REVERIFY_AFTER_DAYS = Number(process.env.REVERIFY_AFTER_DAYS ?? 30) || 30;

const DAY = 86_400_000;
function utcDay(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}
function day(iso: string): number {
  return Date.parse(iso.slice(0, 10) + "T00:00:00Z");
}

/**
 * Application status from OFFICIAL dates only (the database never stores inferred dates).
 *  OPEN          official opening ≤ today ≤ official deadline
 *  UPCOMING      official opening date is in the future
 *  CLOSED        official deadline has passed
 *  NOT_ANNOUNCED no official date published for this cycle
 *  UNKNOWN       official source exists but status can't be determined
 */
export function deriveStatus(
  s: Pick<ScholarshipView, "openingDate" | "deadline" | "statusUndetermined">,
  today: Date = new Date(),
): AppStatus {
  if (s.statusUndetermined) return "UNKNOWN";
  const t = utcDay(today);
  const open = s.openingDate ? day(s.openingDate) : null;
  const dl = s.deadline ? day(s.deadline) : null;
  if (dl !== null && dl < t) return "CLOSED";
  if (open !== null && open > t) return "UPCOMING";
  if (open !== null && dl !== null) return "OPEN";
  if (open === null && dl === null) return "NOT_ANNOUNCED";
  return "UNKNOWN"; // only one of the two dates is published
}

function onDomain(url: string, domain: string | null | undefined): boolean {
  if (!domain) return false;
  try {
    const h = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    return h === domain || h.endsWith("." + domain);
  } catch {
    return false;
  }
}

/**
 * Apply Now requires ALL of: verified record, official application URL, window open today
 * (deadline not passed), and the URL is on the provider's or university's official domain.
 */
export function canApplyNow(s: ScholarshipView, status: AppStatus): boolean {
  const url = s.officialApplicationUrl;
  if (s.verificationStatus !== "VERIFIED" || status !== "OPEN" || !url) return false;
  return onDomain(url, s.providerDomain) || onDomain(url, s.university?.officialDomain);
}

export function needsReverification(lastVerifiedAt: string | Date | null, today: Date = new Date()): boolean {
  if (!lastVerifiedAt) return true;
  const t = typeof lastVerifiedAt === "string" ? Date.parse(lastVerifiedAt) : lastVerifiedAt.getTime();
  return today.getTime() - t > REVERIFY_AFTER_DAYS * DAY;
}

export const STATUS_META: Record<AppStatus, { label: string; tone: "seal" | "route" | "caution" | "dormant" }> = {
  OPEN: { label: "Open", tone: "seal" },
  UPCOMING: { label: "Upcoming", tone: "route" },
  CLOSED: { label: "Closed", tone: "dormant" },
  NOT_ANNOUNCED: { label: "Not announced", tone: "caution" },
  UNKNOWN: { label: "Status unclear", tone: "caution" },
};
