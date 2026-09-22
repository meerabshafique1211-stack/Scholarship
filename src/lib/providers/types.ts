import type { Country } from "../reference";

/** A university as reported by a data provider, with the source of every field group. */
export interface UniversityRecord {
  name: string;
  countryCode: string;
  country: string;
  state: string | null;
  city: string | null;
  domains: string[];
  officialDomain: string;
  officialWebsite: string | null;
  source: "HIPO" | "MANUAL_OFFICIAL";
  sourceUrl: string;
  openalexId: string | null;
  rorId: string | null;
  worksCount: number | null;
  citedByCount: number | null;
  researchSource: "OPENALEX" | null;
  researchSourceUrl: string | null;
  fetchedAt: string;
}

/** Base list of institutions (names, countries, domains). Add new providers here. */
export interface UniversityDataProvider {
  id: string;
  fetchByCountry(country: Country): Promise<UniversityRecord[]>;
}

/** Adds fields (research metadata, identifiers, city) to existing records. */
export interface UniversityEnrichmentProvider {
  id: string;
  enabled(): boolean;
  enrich(country: Country, records: UniversityRecord[]): Promise<UniversityRecord[]>;
}
