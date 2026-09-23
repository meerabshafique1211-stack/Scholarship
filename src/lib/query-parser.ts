import { CITIZENSHIPS, DESTINATIONS, FIELDS } from "./reference";
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
  residual: string[]; // uninterpreted words, matched against names
}

const MONTHS = ["january","february","march","april","may","june","july","august","september","october","november","december"];
const STOPWORDS = new Set(["in","for","the","a","an","and","of","to","at","with","students","student","scholarship","scholarships","programs","program","programme","degree","study","studies","university","universities","from","international","intake","show","me","find","funding","funded","i","want","course","courses","s","verified"]);

function esc(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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

  // 1) "from X" or a demonym ("Pakistani") → citizenship
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
    }
  }
  // 2) any other country name ("in Italy", "Pakistan") → where to study
  for (const d of DESTINATIONS) {
    [hit, t] = take(t, d.name.toLowerCase());
    if (!hit && d.hipoName !== d.name) [hit, t] = take(t, d.hipoName.toLowerCase());
    if (hit) out.countries.push(d.code);
  }
  // 3) citizenship-only countries not in the destination list
  if (!out.citizenship) {
    for (const c of CITIZENSHIPS) {
      if (DESTINATIONS.some((d) => d.code === c.code)) continue;
      [hit, t] = take(t, c.name.toLowerCase());
      if (hit) { out.citizenship = c.code; break; }
    }
  }

  for (const [phrase, f] of [["fully funded", "fully_funded"], ["fully-funded", "fully_funded"], ["full tuition", "full_tuition"], ["100% tuition", "full_tuition"], ["tuition waiver", "tuition_waiver"], ["fee waiver", "tuition_waiver"], ["no scholarship", "none"], ["partial", "other_partial"]] as const) {
    [hit, t] = take(t, phrase);
    if (hit) { out.funding = f; break; }
  }
  const pct = /(\d{1,3})\s*%/.exec(t);
  if (pct) {
    out.minPercent = Math.min(100, parseInt(pct[1], 10));
    t = t.replace(pct[0], " ");
  }

  for (const [phrase, s] of [["open now", "OPEN"], ["apply now", "OPEN"], ["currently open", "OPEN"], ["upcoming", "UPCOMING"], ["open", "OPEN"]] as const) {
    [hit, t] = take(t, phrase);
    if (hit && !out.statuses.includes(s)) out.statuses.push(s);
  }

  for (const [words, level] of [
    [["master's", "masters", "master", "msc", "m.sc", "ma", "mba", "meng", "postgraduate"], "MASTER"],
    [["bachelor's", "bachelors", "bachelor", "bsc", "b.sc", "undergraduate", "ba"], "BACHELOR"],
    [["phd", "ph.d", "doctoral", "doctorate"], "PHD"],
  ] as const) {
    for (const w of words) {
      [hit, t] = take(t, w);
      if (hit) { out.degree = level; break; }
    }
    if (out.degree) break;
  }

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

  const syn = FIELDS.flatMap((f) => f.synonyms.map((s) => ({ s, slug: f.slug }))).sort((a, b) => b.s.length - a.s.length);
  for (const { s, slug } of syn) {
    [hit, t] = take(t, s);
    if (hit) { out.field = slug; break; }
  }

  out.residual = t.split(/[^a-z0-9à-ÿ]+/).filter((w) => w.length > 1 && !STOPWORDS.has(w));
  return out;
}

/** Parsed values only fill in blanks; explicit filter choices win. */
export function applyParsed(f: Filters, p: ParsedQuery): Filters {
  return {
    ...f,
    countries: p.countries.length ? Array.from(new Set([...f.countries, ...p.countries])) : f.countries,
    citizenship: f.citizenship ?? p.citizenship,
    degree: f.degree ?? p.degree,
    field: f.field ?? p.field,
    funding: f.funding !== "all" ? f.funding : p.funding ?? "all",
    minPercent: f.minPercent ?? p.minPercent,
    statuses: f.statuses.length ? f.statuses : p.statuses,
    intake: f.intake ?? p.intake,
  };
}
