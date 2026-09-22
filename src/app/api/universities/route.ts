import { NextResponse, type NextRequest } from "next/server";
import { countryByCode } from "@/lib/reference";
import { getUniversities } from "@/lib/universities";

// GET /api/universities?country=IT — served from the database or the server-side provider cache.
export async function GET(req: NextRequest) {
  const c = countryByCode(req.nextUrl.searchParams.get("country"));
  if (!c) return NextResponse.json({ error: "Pass a supported ?country= ISO code" }, { status: 400 });
  const r = await getUniversities(c.code);
  return NextResponse.json(
    { country: c.name, count: r.items.length, origin: r.origin, error: r.error, results: r.items },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
  );
}
