import { NextResponse, type NextRequest } from "next/server";
import { filterScholarships } from "@/lib/filter";
import { applyParsed, parseQuery } from "@/lib/query-parser";
import { listPublicScholarships } from "@/lib/scholarships";
import { paramsToFilters } from "@/lib/url-state";

// GET /api/scholarships?country=IT&funding=fully_funded — verified records only.
export async function GET(req: NextRequest) {
  const raw = paramsToFilters(Object.fromEntries(req.nextUrl.searchParams.entries()));
  const parsed = parseQuery(raw.q);
  const f = applyParsed(raw, parsed);
  const { items, connected, error } = await listPublicScholarships();
  const results = filterScholarships(items, f, parsed.residual).map(({ s, status }) => ({ ...s, applicationStatus: status }));
  return NextResponse.json(
    { count: results.length, results, databaseConnected: connected, error, message: results.length ? null : "No verified scholarships found." },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
  );
}
