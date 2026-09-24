# Global Scholarship Finder

Find real universities and **verified** scholarships. Nothing fake is ever shown: if no verified record matches, the site says so.

## Data rules
- **Universities** come from the open [Hipo university-domains list](https://github.com/Hipo/university-domains-list) (names, countries, domains, websites), optionally enriched with research metadata from [OpenAlex](https://openalex.org) when `OPENALEX_API_KEY` is set. Listing a university never implies a scholarship.
- **Scholarships** are entered by an admin from an official university, government, Erasmus Mundus or provider page. They are public only when `verificationStatus = VERIFIED` and `isDemo = false`, and only while their official deadline hasn't passed.
- **Apply now** appears only when the record is verified, the official window is open today, and an official application URL is recorded.
- Deadlines are never inferred. Unannounced cycles show "2027-28 deadline not announced"; previous-cycle dates are labelled as history.
- There is no demo dataset and no fallback data anywhere in the code.

## Features
- Real university search (Hipo) with OpenAlex research enrichment, country pages (`/universities/italy`) and detail pages.
- Verified-only scholarships with detail pages (`/scholarships/[id]`), country pages (`/scholarships/italy`), open-now and upcoming lists.
- Tools: CV assessment, transcript check, motivation-letter assistant, application tracker (`/tools`). Uploads are processed in memory and never stored.
- Guides (`/guides`), About, Contact, Privacy and Terms pages; sitemap.xml, robots.txt, canonical URLs, JSON-LD.
- AdSense-ready components that render nothing until real IDs are configured; `/ads.txt` generated from the publisher ID.
- Daily cron: expires passed deadlines, re-checks official pages (changes go back to human review), refreshes universities.
- `/api/health` reports configuration and database status without revealing secrets.

## Setup
1. **Database (Supabase):** run `supabase/migrations/20260923000000_init.sql` once (SQL Editor → paste → Run). Then set `DATABASE_URL` in Vercel to the Supabase transaction-pooler string (port 6543) with `?pgbouncer=true&connection_limit=1`. The migration enables Row Level Security, so Supabase's public API keys can't read or write these tables.
2. **Admin:** set `ADMIN_PASSWORD` and `AUTH_SECRET` (32+ random characters). Sign in at `/admin`.
3. **Cron:** set `CRON_SECRET`. `/api/cron/sync` runs daily: it expires passed deadlines and syncs three countries' universities per run.
4. **Optional:** `OPENALEX_API_KEY` (free at openalex.org/settings/api) for research indicators and cities.

Local: `cp .env.example .env`, fill it in, then `npm install && npm run dev`.

## University search
- `/universities`: live search by name (e.g. "Oxford") or country, 400 ms debounce, request cancellation, "Show more" pagination, and separate empty / error / "that's a field of study" states.
- `/universities/[id]` (id = `<country>-<domain>`, e.g. `gb-ox.ac.uk`): official website and domains from Hipo, research data from OpenAlex (matched by domain; research output only), and verified scholarships only.
- Browser → `/api/universities` → university service → Hipo (+ OpenAlex) → normalized records. The browser never calls external APIs.
- Caching: country lists 7 days, name searches 1 day, OpenAlex lookups 30 days. Timeouts and at most 2 retries on 5xx/network errors; 429 is never retried. Per-IP limit of 60 requests/min on the API route.

## Testing the real APIs
```bash
node scripts/provider-check.mjs                        # Hipo + OpenAlex directly (set OPENALEX_API_KEY to include OpenAlex)
node scripts/smoke-test.mjs https://<your-site>.vercel.app   # the deployed internal API end to end
```

## Architecture
```
Official sources ──(admin verifies)──► Scholarship table ──► public pages (VERIFIED only)
Hipo API / dataset ─┐
OpenAlex (optional) ┴► UniversityDataProvider / EnrichmentProvider ─► sync ─► University table ─► pages
                                                   └─► 7-day server cache when a country isn't synced yet
```
See `docs/ARCHITECTURE.md`.
