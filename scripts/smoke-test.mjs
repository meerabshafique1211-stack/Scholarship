// End-to-end checks against the DEPLOYED app's internal API (not the external providers):
//   node scripts/smoke-test.mjs https://scholarship-project-sigma.vercel.app
const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
let failed = 0;
const log = (ok, msg) => { console.log(`${ok ? "PASS" : "FAIL"}  ${msg}`); if (!ok) failed++; };

async function api(path) {
  const res = await fetch(base + path, { signal: AbortSignal.timeout(30000) });
  return { status: res.status, body: await res.json().catch(() => null) };
}

async function uni(label, qs, test) {
  try {
    const r = await api(`/api/universities?${qs}`);
    const [ok, detail] = test(r);
    log(ok, `${label} (HTTP ${r.status}) ${detail}`);
  } catch (e) {
    log(false, `${label}: ${e.message}`);
  }
}
const first = (b) => (b?.items ?? []).slice(0, 3).map((u) => `${u.name} [${u.officialWebsite ?? "no website"}]`).join(" | ");

for (const n of ["Oxford", "Harvard", "University of Lahore"])
  await uni(`name "${n}"`, `search=${encodeURIComponent(n)}`, (r) => [r.status === 200 && r.body.total > 0, `${r.body?.total} found: ${first(r.body)}`]);
for (const c of ["PK", "IT", "ES", "DK", "FI"])
  await uni(`country ${c}`, `country=${c}`, (r) => [r.status === 200 && r.body.total > 0 && r.body.items.every((u) => u.countryCode === c), `${r.body?.total} universities, all ${c}`]);
await uni("typed country name \"Pakistan\"", "search=Pakistan", (r) => [r.status === 200 && r.body.total > 0 && r.body.items.every((u) => u.countryCode === "PK"), `${r.body?.total} universities`]);
await uni("nonexistent university", "search=zzqxv%20no%20such%20university", (r) => [r.status === 200 && r.body.total === 0 && r.body.items.length === 0, "empty state, no substitutes"]);
await uni("field of study is not sent as a name", "search=computer%20science", (r) => [r.status === 200 && r.body.hint === "field_of_study" && r.body.total === 0, `hint=${r.body?.hint}`]);
await uni("unsupported country rejected", "country=XX", (r) => [r.status === 400, r.body?.error ?? ""]);
await uni("website links come from the source", "search=Oxford", (r) => [r.body?.items?.every((u) => u.officialWebsite === null || /^https?:\/\//.test(u.officialWebsite)), "all http(s) or absent"]);

try {
  const s = await api("/api/scholarships");
  const bad = (s.body?.results ?? []).filter((x) => x.verificationStatus !== "VERIFIED" || !x.sourceUrl || !x.lastVerifiedAt);
  log(s.status === 200 && bad.length === 0, `scholarships: ${s.body?.count} public, all VERIFIED with source + date`);
  const apply = (s.body?.results ?? []).filter((x) => x.officialApplicationUrl && x.applicationStatus === "OPEN");
  log(true, `scholarships currently open with an official application URL: ${apply.length}`);
} catch (e) {
  log(false, `scholarships: ${e.message}`);
}

try {
  const html = await (await fetch(base + "/universities?q=Oxford", { signal: AbortSignal.timeout(30000) })).text();
  log(!/OPENALEX_API_KEY|api_key=/i.test(html), "no API key in rendered HTML");
} catch (e) {
  log(false, `HTML check: ${e.message}`);
}

console.log(failed ? `\n${failed} check(s) failed` : "\nAll smoke tests passed");
process.exit(failed ? 1 : 0);
