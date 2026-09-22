import { NextResponse, type NextRequest } from "next/server";
import { db, hasDb } from "@/lib/db";
import { DESTINATIONS } from "@/lib/reference";
import { syncCountry } from "@/lib/universities";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const COUNTRIES_PER_RUN = 3;

// Daily job (vercel.json): expire passed deadlines, then sync a rotating set of countries.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasDb()) return NextResponse.json({ skipped: "DATABASE_URL not configured" });

  const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z");
  const due = await db().scholarship.findMany({ where: { verificationStatus: "VERIFIED", deadline: { lt: today } }, select: { id: true } });
  if (due.length) {
    const ids = due.map((d) => d.id);
    await db().$transaction([
      db().scholarship.updateMany({ where: { id: { in: ids } }, data: { verificationStatus: "EXPIRED" } }),
      db().verificationLog.createMany({ data: ids.map((id) => ({ scholarshipId: id, action: "auto_expired", note: "Official deadline passed", actor: "cron" })) }),
    ]);
  }

  const dayIndex = Math.floor(Date.now() / 86_400_000);
  const start = (dayIndex * COUNTRIES_PER_RUN) % DESTINATIONS.length;
  const batch = Array.from({ length: COUNTRIES_PER_RUN }, (_, i) => DESTINATIONS[(start + i) % DESTINATIONS.length]);
  const synced: Record<string, unknown> = {};
  for (const c of batch) {
    try {
      synced[c.code] = await syncCountry(c.code);
    } catch (e) {
      synced[c.code] = { error: (e as Error).message };
    }
  }
  return NextResponse.json({ expired: due.length, synced });
}
