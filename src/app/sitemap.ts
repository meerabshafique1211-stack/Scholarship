import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/guides";
import { DESTINATIONS } from "@/lib/reference";
import { listPublicScholarships } from "@/lib/scholarships";
import { siteUrl } from "@/lib/site";
import { filterScholarships } from "@/lib/filter";
import { EMPTY_FILTERS } from "@/lib/types";
import { universityId } from "@/lib/universities";

export const revalidate = 3600;

// Only pages with real content: no empty scholarship pages, no bare university stubs.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();
  const staticPages = ["", "/search", "/universities", "/scholarships", "/guides", "/tools", "/tools/cv", "/tools/transcript", "/tools/motivation-letter", "/about", "/contact", "/privacy", "/terms", "/disclaimer", "/editorial-policy"]
    .map((p) => ({ url: `${base}${p}`, lastModified: now }));
  const guides = GUIDES.map((g) => ({ url: `${base}/guides/${g.slug}`, lastModified: new Date(g.updated) }));

  const { items } = await listPublicScholarships();
  const current = filterScholarships(items, EMPTY_FILTERS).map((r) => r.s);
  const scholarshipCountries = Array.from(new Set(current.map((s) => s.countryCode)))
    .map((code) => DESTINATIONS.find((d) => d.code === code))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .map((c) => ({ url: `${base}/scholarships/${c.slug}`, lastModified: now }));
  const scholarships = current.map((s) => ({ url: `${base}/scholarships/${s.id}`, lastModified: s.lastVerifiedAt ? new Date(s.lastVerifiedAt) : now }));
  const universities = Array.from(new Set(current.filter((s) => s.university).map((s) => universityId(s.countryCode, s.university!.officialDomain))))
    .map((id) => ({ url: `${base}/universities/${id}`, lastModified: now }));

  return [...staticPages, ...guides, ...scholarshipCountries, ...scholarships, ...universities];
}
