import type { Metadata } from "next";
import { SearchClient } from "@/components/SearchClient";
import { buildOpportunities } from "@/lib/filters";
import { loadDataset } from "@/lib/repository";
import { paramsToFilters } from "@/lib/url-state";

export const metadata: Metadata = {
  title: "Search universities and scholarships",
  description: "Filter universities, programs and scholarships by country, citizenship, degree, funding and application status.",
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (typeof v === "string") params.set(k, v);
  const { current, past } = buildOpportunities(await loadDataset());
  return <SearchClient initial={paramsToFilters(params)} current={current} past={past} />;
}
