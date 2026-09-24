import { NextResponse, type NextRequest } from "next/server";
import { db, hasDb } from "@/lib/db";
import { DESTINATIONS } from "@/lib/reference";
import { fingerprintPage } from "@/lib/source-monitor";
import { syncCountry } from "@/lib/universities";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const COUNTRIES_PER_RUN = 2;
const SOURCES_PER_RUN = 15;

// Daily (vercel.json). Order: expire passed deadlines → re-check official pages → refresh universities.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasDb()) return NextResponse.json({ skipped: "DATABASE_URL not configured" });
  const started = Date.now();

  // 1) Expire: official deadline passed.
  const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z");
  const due = await db().scholarship.findMany({ where: { verificationStatus: "VERIFIED", deadline: { lt: today } }, select: { id: true } });
  if (due.length) {
    const ids = due.map((d) => d.id);
    await db().$transaction([
      db().scholarship.updateMany({ where: { id: { in: ids } }, data: { verificationStatus: "EXPIRED" } }),
      db().verificationLog.createMany({ data: ids.map((id) => ({ scholarshipId: id, action: "auto_expired", note: "Official deadline passed", actor: "cron" })) }),
    ]);
  }

  // 2) Re-check official source pages. An unchanged page only updates sourceLastCheckedAt;
  //    it never refreshes lastVerifiedAt (a page that loads is not proof the call is still valid).
  const toCheck = await db().scholarship.findMany({
    where: { verificationStatus: "VERIFIED" },
    orderBy: [{ sourceLastCheckedAt: { sort: "asc", nulls: "first" } }],
    take: SOURCES_PER_RUN,
    select: { id: true, sourceUrl: true, sourceContentHash: true },
  });
  const checks = { unchanged: 0, changed: 0, unreachable: 0 };
  for (const s of toCheck) {
    if (Date.now() - started > 35_000) break;
    const fp = await fingerprintPage(s.sourceUrl);
    const now = new Date();
    if (fp.ok && s.sourceContentHash && fp.hash === s.sourceContentHash) {
      checks.unchanged++;
      await db().scholarship.update({ where: { id: s.id }, data: { sourceLastCheckedAt: now } });
      continue;
    }
    const note = fp.ok ? (s.sourceContentHash ? "Official page content changed since verification" : "No baseline fingerprint; needs review") : `Official page check failed: ${fp.reason}`;
    if (fp.ok) checks.changed++;
    else checks.unreachable++;
    await db().$transaction([
      db().scholarship.update({ where: { id: s.id }, data: { verificationStatus: "NEEDS_VERIFICATION", sourceLastCheckedAt: now, verificationNotes: note } }),
      db().verificationLog.create({ data: { scholarshipId: s.id, action: "flagged", note, actor: "cron" } }),
    ]);
  }

  // 3) Refresh a rotating subset of university countries.
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  const start = (dayIndex * COUNTRIES_PER_RUN) % DESTINATIONS.length;
  const synced: Record<string, unknown> = {};
  for (let i = 0; i < COUNTRIES_PER_RUN; i++) {
    if (Date.now() - started > 45_000) break;
    const c = DESTINATIONS[(start + i) % DESTINATIONS.length];
    try {
      synced[c.code] = await syncCountry(c.code);
    } catch (e) {
      synced[c.code] = { error: (e as Error).message };
    }
  }
  return NextResponse.json({ expired: due.length, sourceChecks: checks, synced });
}
