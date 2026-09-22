# Architecture (v2: verified data only)

## What changed from v1
v1 rendered a fictional dataset from `src/data/demo.ts` through `src/lib/repository.ts`. Both files are deleted. There is no hardcoded scholarship array, no seed file and no "if empty, show sample data" path. Empty results render an honest empty state.

## Universities
- `UniversityDataProvider` (base lists) and `UniversityEnrichmentProvider` (extra fields) live in `src/lib/providers/`.
  - `HipoProvider`: `http://universities.hipolabs.com/search?country=…` (the hosted API is HTTP-only). Falls back to the same open dataset on GitHub if the API fails.
  - `OpenAlexProvider`: `https://api.openalex.org/institutions?filter=country_code:XX,type:education`. Since Feb 2026 OpenAlex requires a free API key; enrichment is disabled without `OPENALEX_API_KEY`. Matching is by homepage domain.
  - Add a source by implementing an interface and listing it in `src/lib/universities.ts`.
- Pipeline: fetch → normalize name/country → clean domains → dedupe (shared domain, or same normalized name in the same country) → enrich → store with `source`, `sourceUrl`, `lastVerifiedAt`.
- Reads: database first; if a country hasn't been synced yet, a 7-day server-side cache of the provider result. Users never hit provider APIs on each page load.
- `University.verificationStatus`: `IMPORTED` (from the dataset), `VERIFIED` (admin-checked), `REJECTED` (never shown, never revived by sync).

## Scholarships
- Separate `Scholarship` table with `ScholarshipSource` (every checked official page + date) and `VerificationLog` (audit trail).
- Statuses: `VERIFIED` (public), `NEEDS_VERIFICATION`, `EXPIRED`, `REJECTED` (admin only). Any edit that isn't re-verified drops the record back to `NEEDS_VERIFICATION`.
- Verification gates (`src/lib/verification.ts`):
  - Source and scholarship URLs must be https and on the provider's declared official domain. For a university source, that must be the university's domain as stored.
  - Blogs, social media, video sites, aggregators and AI chat sites are rejected as sources.
  - Fully funded requires the source to confirm full tuition AND a stipend or accommodation; otherwise use 100% tuition.
  - Partial requires a published percentage; other/waiver requires the published amount.
  - A past deadline cannot be verified as current.
  - The admin must attest they checked the source that day.
- Application status (`src/lib/status.ts`) is derived from official dates only:
  - OPEN: official opening ≤ today ≤ official deadline.
  - UPCOMING: the official opening date is in the future.
  - CLOSED: the official deadline has passed.
  - NOT_ANNOUNCED: no official dates.
  - UNKNOWN: only one date is published, or the admin flagged the status as unclear.
- The daily cron marks verified records with passed deadlines as `EXPIRED`. Records not checked in `REVERIFY_AFTER_DAYS` (default 30) are flagged "Needs re-verification" in admin.

## Pages
`/`, `/search`, `/universities`, `/scholarships/open-now` (VERIFIED + OPEN + application URL), `/scholarships/upcoming`, `/admin/scholarships` (views: verified, needs verification, needs re-verification, expired, rejected, missing application URL, missing deadline, no checked source), `/admin/scholarships/new`, `/admin/scholarships/[id]`, `/admin/universities` (sync per country).

## APIs
`GET /api/scholarships` (verified only), `GET /api/universities?country=IT`, `GET /api/cron/sync` (Bearer `CRON_SECRET`).

## Security
Admin routes are protected by middleware plus a server-side check in every admin page and action. Sessions are HMAC-signed, httpOnly, secure, SameSite=strict cookies. Query parameters are whitelisted. Secrets live only in server environment variables.

## Not in this version
Programs (degree/field/intake at university level), rankings, career statistics, user accounts, CV/transcript tools and comparison. The UI says "not available" rather than estimating.
