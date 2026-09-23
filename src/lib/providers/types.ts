import type { Country } from "../reference";

/** A university as reported by a provider. Every field group carries its source. */
export interface UniversityRecord {
  name: string;
  countryCode: string;
  country: string;
  state: string | null;
  city: string | null;
  domains: string[];
  officialDomain: string;
  officialWebsite: string | null; // exactly as returned by the source, never generated
  source: "HIPO" | "MANUAL_OFFICIAL";
  sourceUrl: string;
  openalexId: string | null;
  rorId: string | null;
  institutionType: string | null;
  worksCount: number | null;
  citedByCount: number | null;
  researchSource: "OPENALEX" | null;
  researchSourceUrl: string | null;
  fetchedAt: string; // when WE retrieved it from the source
}

/** Base institution lists. Add a new source by implementing this and registering it in universities.ts. */
export interface UniversityDataProvider {
  id: string;
  fetchByCountry(country: Country): Promise<UniversityRecord[]>;
  searchByName(name: string): Promise<UniversityRecord[]>;
}

/** Adds identifiers / research metadata to existing records. */
export interface UniversityEnrichmentProvider {
  id: string;
  enabled(): boolean;
  enrich(country: Country, records: UniversityRecord[]): Promise<UniversityRecord[]>;
  lookup(record: UniversityRecord): Promise<UniversityRecord>;
}
