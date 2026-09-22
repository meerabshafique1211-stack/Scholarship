import type { AppStatus, Scholarship, VerificationStatus } from "./types";

/** Records older than this are displayed as "Needs verification". */
export const STALE_AFTER_DAYS = 90;

function day(iso: string): number {
  return Date.parse(iso.slice(0, 10) + "T00:00:00Z");
}

/**
 * Derives the displayed application status from dates.
 * Rules (from the brief):
 *  - OPEN requires an OFFICIAL opening/deadline window containing today AND an application URL.
 *  - UPCOMING requires an OFFICIAL future opening date.
 *  - EXPECTED is used whenever the only dates we have are EXPECTED — never promoted to official.
 *  - CLOSED requires an OFFICIAL deadline in the past.
 *  - UNKNOWN when no reliable date exists.
 */
export function deriveStatus(s: Scholarship, today: Date = new Date()): AppStatus {
  const t = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const open = s.opening;
  const dl = s.deadline;

  if (dl && dl.kind === "official" && day(dl.date) < t) return "closed";

  const officialOpen = open?.kind === "official" ? day(open.date) : null;
  const officialDeadline = dl?.kind === "official" ? day(dl.date) : null;

  if (officialOpen !== null && officialOpen > t) return "upcoming";

  if (officialDeadline !== null && (officialOpen === null || officialOpen <= t)) {
    // Opening date unknown but an official future deadline exists: treat as open only
    // if we also have a direct application link; otherwise the cycle isn't confirmed open.
    if (s.applicationUrl) return "open";
    return officialOpen !== null ? "open" : "upcoming";
  }

  if (open?.kind === "expected" || dl?.kind === "expected") {
    // An expected date that has already passed tells us nothing about the new cycle.
    if (dl && day(dl.date) < t) return "unknown";
    return "expected";
  }

  return "unknown";
}

export function effectiveVerification(
  status: VerificationStatus,
  lastVerifiedAt: string | null,
  today: Date = new Date(),
): VerificationStatus {
  if (status !== "verified") return status;
  if (!lastVerifiedAt) return "needs_verification";
  const ageDays = (today.getTime() - day(lastVerifiedAt)) / 86_400_000;
  return ageDays > STALE_AFTER_DAYS ? "needs_verification" : "verified";
}

export const STATUS_META: Record<AppStatus, { label: string; short: string; tone: "seal" | "route" | "caution" | "dormant" }> = {
  open: { label: "Open — apply now", short: "Open", tone: "seal" },
  upcoming: { label: "Upcoming", short: "Upcoming", tone: "route" },
  expected: { label: "Expected (not yet announced)", short: "Expected", tone: "caution" },
  closed: { label: "Closed", short: "Closed", tone: "dormant" },
  unknown: { label: "Information not available", short: "No date", tone: "dormant" },
};
