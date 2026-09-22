# Global Scholarship Finder

Find real universities and **verified** scholarships. Nothing fake is ever shown: if no verified record matches, the site says so.

## Data rules
- **Universities** come from the open [Hipo university-domains list](https://github.com/Hipo/university-domains-list) (names, countries, domains, websites), optionally enriched with research metadata from [OpenAlex](https://openalex.org) when `OPENALEX_API_KEY` is set. Listing a university never implies a scholarship.
- **Scholarships** are entered by an admin from an official university, government, Erasmus Mundus or provider page. They are public only when `verificationStatus = VERIFIED` and `isDemo = false`, and only while their official deadline hasn't passed.
- **Apply now** appears only when the record is verified, the official window is open today, and an official application URL is recorded.
- Deadlines are never inferred. Unannounced cycles show "2027-28 deadline not announced"; previous-cycle dates are labelled as history.
- There is no demo dataset and no fallback data anywhere in the code.

## Setup
1. **Database:** Vercel → Project → Storage → create Postgres (e.g. Neon) → connect. This sets `DATABASE_URL`; the schema is applied during the next build.
2. **Admin:** set `ADMIN_PASSWORD` and `AUTH_SECRET` (32+ random characters). Sign in at `/admin`.
3. **Cron:** set `CRON_SECRET`. `/api/cron/sync` runs daily: it expires passed deadlines and syncs three countries' universities per run.
4. **Optional:** `OPENALEX_API_KEY` (free at openalex.org/settings/api) for research indicators and cities.

Local: `cp .env.example .env`, fill it in, then `npm install && npm run dev`.

## Architecture
```
Official sources ──(admin verifies)──► Scholarship table ──► public pages (VERIFIED only)
Hipo API / dataset ─┐
OpenAlex (optional) ┴► UniversityDataProvider / EnrichmentProvider ─► sync ─► University table ─► pages
                                                   └─► 7-day server cache when a country isn't synced yet
```
See `docs/ARCHITECTURE.md`.
