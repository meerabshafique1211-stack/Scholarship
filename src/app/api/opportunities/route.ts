import { NextResponse, type NextRequest } from "next/server";
import { applyFilters, buildOpportunities } from "@/lib/filters";
import { applyParsed, parseQuery } from "@/lib/query-parser";
import { DATA_MODE, loadDataset } from "@/lib/repository";
import { paramsToFilters } from "@/lib/url-state";

// GET /api/opportunities?q=...&country=IT,DE&funding=fully_funded&status=open
// Public, read-only. Input is whitelisted by paramsToFilters.
export async function GET(req: NextRequest) {
  const f = paramsToFilters(req.nextUrl.searchParams);
  const parsed = parseQuery(f.q);
  const effective = applyParsed(f, parsed);
  const { current, past } = buildOpportunities(await loadDataset());
  return NextResponse.json(
    {
      dataMode: DATA_MODE,
      interpreted: parsed,
      results: applyFilters(current, effective, parsed.residual),
      past: applyFilters(past, { ...effective, statuses: [] }, parsed.residual),
    },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
  );
}
