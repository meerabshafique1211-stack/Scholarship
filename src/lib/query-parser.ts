import { CITIZENSHIPS, DESTINATIONS, FIELDS } from "../data/reference";
import type { AppStatus, DegreeLevel, Filters, FundingFilter } from "./types";

export interface ParsedQuery {
  countries: string[];
  citizenship: string | null;
  degree: DegreeLevel | null;
  field: string | null;
  funding: FundingFilter | null;
  minPercent: number | null;
  statuses: AppStatus[];
  intake: string | null;
  residual: string[]; // words we couldn't interpret — used as free-text match
}

const MONTHS = ["january","february","march","april","may","june","july","august","september","october","november","december"];
const STOPWORDS = new Set(["in","for","the","a","an","and","of","to","at","with","students","student","scholarship","scholarships","programs","program","programme","degree","study","studies","university","universities","from","international","intake","show","me","find","funding","funded","me","i","want","course","courses","s"]);

function esc(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Removes the first whole-word match of `phrase` from `text`; returns [matched, newText]. */
function take(text: string, phrase: string): [boolean, string] {
  const re = new RegExp(`(^|[^a-z0-9])${esc(phrase)}(?=$|[^a-z0-9])`);
  const m = re.exec(text);
  if (!m) return [false, text];
  return [true, text.slice(0, m.index) + m[1] + " " + text.slice(m.index + m[0].length)];
}

export function parseQuery(input: string): ParsedQuery {
  let t = " " + input.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ") + " ";
  let hit: boolean;
  const out: ParsedQuery = { countries: [], citizenship: null, degree: null, field: null, funding: null, minPercent: null, statuses: [], intake: null, residual: [] };

  // Citizenship: "from <country>" or a demonym ("pakistani students")
  for (const c of [...CITIZENSHIPS, ...DESTINATIONS.map((d) => ({ code: d.code, name: d.name, demonym: [] as string[] }))]) {
    [hit, t] = take(t, `from ${c.name.toLowerCase()}`);
    if (hit) { out.citizenship = c.code; break; }
  }
  if (!out.citizenship) {
    outer: for (const c of CITIZENSHIPS) {
      for (const d of c.demonym) {
        [hit, t] = take(t, d);
        if (hit) { out.citizenship = c.code; break outer; }
      }
      [hit, t] = take(t, c.name.toLowerCase());
      if (hit) { out.citizenship = c.code; break; }
    }
  }

  // Destinations
  for (const d of DESTINATIONS) {
    [hit, t] = take(t, d.name.toLowerCase());
    if (hit) out.countries.push(d.code);
  }

  // Funding
  for (const [phrase, f] of [["fully funded", "fully_funded"], ["fully-funded", "fully_funded"], ["full tuition", "full_tuition"], ["100% tuition", "full_tuition"], ["no scholarship", "none"], ["partial", "other_partial"]] as const) {
    [hit, t] = take(t, phrase);
    if (hit) { out.funding = f; break; }
  }
  const pct = /(\d{1,3})\s*%/.exec(t);
  if (pct) {
    const n = Math.min(100, parseInt(pct[1], 10));
    out.minPercent = n;
    t = t.replace(pct[0], " ");
  }

  // Status
  for (const [phrase, s] of [["open now", "open"], ["apply now", "open"], ["currently open", "open"], ["upcoming", "upcoming"], ["open", "open"]] as const) {
    [hit, t] = take(t, phrase);
    if (hit && !out.statuses.includes(s)) out.statuses.push(s);
  }

  // Degree
  for (const [words, level] of [
    [["master's", "masters", "master", "msc", "m.sc", "ma", "mba", "meng", "postgraduate"], "master"],
    [["bachelor's", "bachelors", "bachelor", "bsc", "b.sc", "undergraduate", "ba"], "bachelor"],
    [["phd", "ph.d", "doctoral", "doctorate"], "phd"],
  ] as const) {
    for (const w of words) {
      [hit, t] = take(t, w);
      if (hit) { out.degree = level; break; }
    }
    if (out.degree) break;
  }

  // Intake: "september 2027" | "sep 2027" | "2027"
  const monthRe = new RegExp(`(${MONTHS.map((m) => `${m}|${m.slice(0, 3)}`).join("|")})\\s+(20\\d{2})`);
  const mi = monthRe.exec(t);
  if (mi) {
    const idx = MONTHS.findIndex((m) => m.startsWith(mi[1].slice(0, 3)));
    out.intake = `${mi[2]}-${String(idx + 1).padStart(2, "0")}`;
    t = t.replace(mi[0], " ");
  } else {
    const yi = /(^|\s)(20\d{2})(?=\s|$)/.exec(t);
    if (yi) { out.intake = yi[2]; t = t.replace(yi[2], " "); }
  }

  // Field (longest synonyms first so "project management" beats "management")
  const syn = FIELDS.flatMap((f) => f.synonyms.map((s) => ({ s, slug: f.slug }))).sort((a, b) => b.s.length - a.s.length);
  for (const { s, slug } of syn) {
    [hit, t] = take(t, s);
    if (hit) { out.field = slug; break; }
  }

  out.residual = t.split(/[^a-z0-9]+/).filter((w) => w.length > 1 && !STOPWORDS.has(w));
  return out;
}

/** Merge a parsed query into filters. Parsed values only fill in; they never erase explicit choices. */
export function applyParsed(f: Filters, p: ParsedQuery): Filters {
  return {
    ...f,
    countries: p.countries.length ? Array.from(new Set([...f.countries, ...p.countries])) : f.countries,
    citizenship: p.citizenship ?? f.citizenship,
    degree: p.degree ?? f.degree,
    field: p.field ?? f.field,
    funding: p.funding ?? f.funding,
    minPercent: p.minPercent ?? f.minPercent,
    statuses: p.statuses.length ? p.statuses : f.statuses,
    intake: p.intake ?? f.intake,
  };
}
