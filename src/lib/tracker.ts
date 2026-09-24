// Application tracker storage: this browser only (localStorage). Nothing is sent to the server.
export const STATUSES = ["Interested", "Shortlisted", "Preparing", "Documents Ready", "Applied", "Interview", "Offer", "Rejected", "Withdrawn"] as const;
export const DOCUMENTS = ["CV", "Transcript", "Passport", "IELTS", "Recommendation Letter", "Motivation Letter", "Financial Documents"] as const;
export type TrackerStatus = (typeof STATUSES)[number];

export interface TrackedApplication {
  id: string;
  university: string;
  scholarship: string;
  scholarshipId: string | null;
  deadline: string; // YYYY-MM-DD or ""
  applicationUrl: string;
  status: TrackerStatus;
  documents: Record<string, boolean>;
  notes: string;
  updatedAt: string;
}

const KEY = "gsf.tracker.v1";

export function loadTracker(): TrackedApplication[] {
  try {
    const raw = localStorage.getItem(KEY);
    const data = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(data) ? (data.filter((x) => x && typeof x === "object" && typeof (x as TrackedApplication).id === "string") as TrackedApplication[]) : [];
  } catch {
    return [];
  }
}

export function saveTracker(items: TrackedApplication[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}

export function newApplication(p: Partial<TrackedApplication>): TrackedApplication {
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()),
    university: p.university ?? "",
    scholarship: p.scholarship ?? "",
    scholarshipId: p.scholarshipId ?? null,
    deadline: p.deadline ?? "",
    applicationUrl: p.applicationUrl ?? "",
    status: "Interested",
    documents: Object.fromEntries(DOCUMENTS.map((d) => [d, false])),
    notes: "",
    updatedAt: new Date().toISOString(),
  };
}
