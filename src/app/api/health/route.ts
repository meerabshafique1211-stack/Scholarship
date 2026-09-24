import { NextResponse } from "next/server";
import { db, hasDb } from "@/lib/db";
import { aiEnabled } from "@/lib/ai";

export const dynamic = "force-dynamic";

// Reports configuration and database reachability WITHOUT revealing any secret values.
export async function GET() {
  let database: string = "not_configured";
  let detail: string | null = null;
  if (hasDb()) {
    const url = process.env.DATABASE_URL ?? "";
    try {
      await db().$queryRawUnsafe('SELECT 1 FROM "Scholarship" LIMIT 1');
      database = "ok";
    } catch (e) {
      const code = (e as { errorCode?: string; code?: string }).errorCode ?? (e as { code?: string }).code ?? "";
      const msg = (e as Error).message ?? "";
      database =
        code === "P1001" || /can't reach|ENOTFOUND|ECONNREFUSED|ETIMEDOUT/i.test(msg) ? "unreachable"
        : code === "P1000" || /authentication failed|password/i.test(msg) ? "auth_failed"
        : /relation .* does not exist|P2021/i.test(msg + code) ? "schema_missing"
        : /prepared statement/i.test(msg) ? "pooler_needs_pgbouncer_flag"
        : "error";
      detail = code || null;
    }
    const direct = /@db\.[a-z0-9]+\.supabase\.co/i.test(url);
    const pooler6543 = /pooler\.supabase\.com:6543/i.test(url);
    return NextResponse.json({
      database, detail,
      hints: {
        usesSupabaseDirectHost: direct, // IPv6-only: not reachable from Vercel
        usesTransactionPooler: pooler6543,
        hasPgbouncerFlag: /pgbouncer=true/i.test(url),
        hasPlaceholderPassword: /\[YOUR-PASSWORD\]|<db-password>|YOUR_PASSWORD/i.test(url),
      },
      openalex: Boolean(process.env.OPENALEX_API_KEY),
      ai: aiEnabled(),
      adsense: Boolean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID),
      admin: Boolean(process.env.ADMIN_PASSWORD && process.env.AUTH_SECRET),
    }, { headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json({ database }, { headers: { "Cache-Control": "no-store" } });
}
