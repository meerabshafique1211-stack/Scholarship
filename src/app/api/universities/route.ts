import { NextResponse, type NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { countryByCode } from "@/lib/reference";
import { searchUniversities, UNAVAILABLE } from "@/lib/universities";

// GET /api/universities?search=oxford&country=GB&page=1
// The browser only ever calls this route; provider URLs and keys stay on the server.
export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = rateLimit(ip);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment and try again." }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  }

  const sp = req.nextUrl.searchParams;
  const search = (sp.get("search") ?? sp.get("q") ?? "").slice(0, 100);
  const countryParam = sp.get("country");
  const country = countryParam ? countryByCode(countryParam) : null;
  if (countryParam && !country) return NextResponse.json({ error: `Unsupported country "${countryParam}".` }, { status: 400 });
  const page = Math.min(Math.max(1, Number(sp.get("page")) || 1), 500);
  const pageSize = Math.min(Math.max(1, Number(sp.get("pageSize")) || 20), 50);

  const result = await searchUniversities({ query: search, countryCode: country?.code ?? null, page, pageSize });
  if (result.error) {
    return NextResponse.json({ ...result, error: UNAVAILABLE }, { status: 503, headers: { "Retry-After": "30", "Cache-Control": "no-store" } });
  }
  return NextResponse.json(result, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
