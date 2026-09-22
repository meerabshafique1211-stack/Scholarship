// Static reference data (not scholarship claims): countries, citizenships, field taxonomy.

export interface Country {
  code: string;     // ISO-2, matches Hipo's alpha_two_code
  name: string;
  hipoName: string; // country name as used by the Hipo dataset
  slug: string;
}

const c = (code: string, name: string, hipoName = name): Country => ({
  code, name, hipoName, slug: name.toLowerCase().replace(/\s+/g, "-"),
});

export const DESTINATIONS: Country[] = [
  c("IT", "Italy"), c("ES", "Spain"), c("DE", "Germany"), c("FR", "France"),
  c("FI", "Finland"), c("DK", "Denmark"), c("SE", "Sweden"), c("NL", "Netherlands"),
  c("HU", "Hungary"), c("AT", "Austria"), c("BE", "Belgium"), c("IE", "Ireland"),
  c("PT", "Portugal"), c("NO", "Norway"), c("PL", "Poland"), c("CH", "Switzerland"),
  c("EE", "Estonia"), c("GB", "United Kingdom"),
].sort((a, b) => a.name.localeCompare(b.name));

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
  { slug: "project-management", label: "Project Management", synonyms: ["project management"] },
  { slug: "business", label: "Business & Management", synonyms: ["business", "management", "mba", "finance"] },
  { slug: "engineering", label: "Engineering", synonyms: ["engineering", "mechanical", "electrical", "civil"] },
  { slug: "public-health", label: "Public Health", synonyms: ["public health", "health", "epidemiology"] },
  { slug: "economics", label: "Economics", synonyms: ["economics", "econ"] },
];

export function countryByCode(code: string | null | undefined): Country | undefined {
  return DESTINATIONS.find((d) => d.code === code?.toUpperCase());
}

export function countryName(code: string): string {
  return countryByCode(code)?.name ?? CITIZENSHIPS.find((x) => x.code === code)?.name ?? code;
}
