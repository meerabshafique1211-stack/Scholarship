// Real reference data (not scholarship claims): countries and field taxonomy.
import type { Country } from "../lib/types";

export const DESTINATIONS: Country[] = [
  { code: "IT", name: "Italy", slug: "italy", currency: "EUR" },
  { code: "DE", name: "Germany", slug: "germany", currency: "EUR" },
  { code: "ES", name: "Spain", slug: "spain", currency: "EUR" },
  { code: "FI", name: "Finland", slug: "finland", currency: "EUR" },
  { code: "DK", name: "Denmark", slug: "denmark", currency: "DKK" },
  { code: "SE", name: "Sweden", slug: "sweden", currency: "SEK" },
  { code: "NL", name: "Netherlands", slug: "netherlands", currency: "EUR" },
  { code: "FR", name: "France", slug: "france", currency: "EUR" },
  { code: "IE", name: "Ireland", slug: "ireland", currency: "EUR" },
  { code: "HU", name: "Hungary", slug: "hungary", currency: "HUF" },
];

export const CITIZENSHIPS: { code: string; name: string; demonym: string[] }[] = [
  { code: "PK", name: "Pakistan", demonym: ["pakistani"] },
  { code: "IN", name: "India", demonym: ["indian"] },
  { code: "BD", name: "Bangladesh", demonym: ["bangladeshi"] },
  { code: "NG", name: "Nigeria", demonym: ["nigerian"] },
  { code: "NP", name: "Nepal", demonym: ["nepali", "nepalese"] },
  { code: "EG", name: "Egypt", demonym: ["egyptian"] },
  { code: "LK", name: "Sri Lanka", demonym: ["sri lankan"] },
  { code: "GH", name: "Ghana", demonym: ["ghanaian"] },
  { code: "KE", name: "Kenya", demonym: ["kenyan"] },
  { code: "ET", name: "Ethiopia", demonym: ["ethiopian"] },
  { code: "ID", name: "Indonesia", demonym: ["indonesian"] },
  { code: "VN", name: "Vietnam", demonym: ["vietnamese"] },
  { code: "PH", name: "Philippines", demonym: ["filipino", "philippine"] },
  { code: "IR", name: "Iran", demonym: ["iranian"] },
  { code: "TR", name: "Türkiye", demonym: ["turkish"] },
  { code: "BR", name: "Brazil", demonym: ["brazilian"] },
];

export const EU_EEA = ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE","IS","LI","NO","CH"];

export const FIELDS: { slug: string; label: string; synonyms: string[] }[] = [
  { slug: "computer-science", label: "Computer Science", synonyms: ["computer science", "cs", "computing", "software", "informatics"] },
  { slug: "ai", label: "Artificial Intelligence", synonyms: ["ai", "artificial intelligence", "machine learning", "ml"] },
  { slug: "data-science", label: "Data Science", synonyms: ["data science", "data analytics", "analytics"] },
  { slug: "project-management", label: "Project Management", synonyms: ["project management", "pm"] },
  { slug: "business", label: "Business & Management", synonyms: ["business", "management", "mba", "finance"] },
  { slug: "engineering", label: "Engineering", synonyms: ["engineering", "mechanical", "electrical", "civil"] },
  { slug: "public-health", label: "Public Health", synonyms: ["public health", "health", "epidemiology"] },
  { slug: "economics", label: "Economics", synonyms: ["economics", "econ"] },
];

export function countryByCode(code: string): Country | undefined {
  return DESTINATIONS.find((c) => c.code === code);
}
