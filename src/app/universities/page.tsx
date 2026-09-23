import type { Metadata } from "next";
import { UniversitySearch } from "@/components/UniversitySearch";
import { countryByCode, DESTINATIONS } from "@/lib/reference";
import { searchUniversities } from "@/lib/universities";

export const metadata: Metadata = { title: "Find universities", description: "Search real universities worldwide by name or country." };

export default async function UniversitiesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 100) : "";
  const country = countryByCode(typeof sp.country === "string" ? sp.country : null)?.code ?? "";
  // Server-render the first page when the URL already has a search, so shared links load instantly.
  const initial = q.trim().length >= 2 || country
    ? await searchUniversities({ query: q, countryCode: country || null, page: 1, pageSize: 20 })
    : null;
  return (
    <div className="mx-auto max-w-page px-4 pb-16 pt-8">
      <h1 className="font-serif text-3xl text-ink">Find universities</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Real institutions from the open Hipo university list. A university appearing here does not mean it offers a scholarship. Each university page shows only scholarships we have verified.
      </p>
      <div className="mt-6">
        <UniversitySearch countries={DESTINATIONS} initialQuery={q} initialCountry={country} initial={initial} />
      </div>
    </div>
  );
}
