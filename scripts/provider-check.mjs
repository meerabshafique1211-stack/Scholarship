// Checks the EXTERNAL providers directly (run from any machine with internet):
//   node scripts/provider-check.mjs
//   OPENALEX_API_KEY=... node scripts/provider-check.mjs
const HIPO = "http://universities.hipolabs.com";
let failed = 0;
const log = (ok, msg) => { console.log(`${ok ? "PASS" : "FAIL"}  ${msg}`); if (!ok) failed++; };

async function get(url, timeout = 20000) {
  const t0 = Date.now();
  const res = await fetch(url, { signal: AbortSignal.timeout(timeout) });
  const body = await res.json().catch(() => null);
  return { status: res.status, body, ms: Date.now() - t0 };
}

async function check(label, url, test) {
  try {
    const r = await get(url);
    const [ok, detail] = test(r);
    log(ok, `${label} (HTTP ${r.status}, ${r.ms} ms) ${detail}`);
  } catch (e) {
    log(false, `${label}: ${e.name} ${e.message}`);
  }
}

const names = (b) => (Array.isArray(b) ? b.slice(0, 3).map((u) => u.name).join(" | ") : "");

await check("Hipo without search", `${HIPO}/search?name=`, (r) => [r.status === 200 && Array.isArray(r.body) && r.body.length > 100, `${r.body?.length ?? 0} rows`]);
for (const n of ["Oxford", "Harvard", "University of Lahore"])
  await check(`Hipo name "${n}"`, `${HIPO}/search?name=${encodeURIComponent(n)}`, (r) => [Array.isArray(r.body) && r.body.length > 0, names(r.body)]);
for (const c of ["Pakistan", "Italy", "Spain", "Denmark", "Finland", "United Kingdom", "United States"])
  await check(`Hipo country "${c}"`, `${HIPO}/search?country=${encodeURIComponent(c)}`, (r) => [Array.isArray(r.body) && r.body.length > 0, `${r.body?.length ?? 0} universities`]);
await check("Hipo nonexistent", `${HIPO}/search?name=zzqxv-no-such-university`, (r) => [Array.isArray(r.body) && r.body.length === 0, "empty as expected"]);

const key = process.env.OPENALEX_API_KEY;
if (!key) console.log("SKIP  OpenAlex (set OPENALEX_API_KEY to test)");
else
  await check("OpenAlex institution search \"Oxford\"", `https://api.openalex.org/institutions?search=Oxford&filter=country_code:GB&per_page=3&select=id,ror,display_name,homepage_url,type,works_count&api_key=${encodeURIComponent(key)}`,
    (r) => [r.status === 200 && r.body?.results?.length > 0, (r.body?.results ?? []).map((i) => `${i.display_name} <${i.homepage_url}>`).join(" | ")]);

console.log(failed ? `\n${failed} check(s) failed` : "\nAll provider checks passed");
process.exit(failed ? 1 : 0);
