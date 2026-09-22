# Global Scholarship Finder

Find verified universities, scholarships and funding opportunities worldwide.

> **Status: Phase 1 (development preview).** The UI runs on a **fictional demo dataset**. Every record is labelled "Demo", has no real links, and must not be read as a real opportunity. Real, verified records arrive through the Phase 2 database and Phase 7 admin workflow.

## Run locally
```bash
npm install
npm run dev
# open http://localhost:3000
```
Requires Node.js 18.18+ (20+ recommended). A database is not needed for Phase 1.

## What's in Phase 1
- Homepage with sentence-style search and free-text search
- Search that understands queries like "AI Master's Finland September 2027"
- Filters: countries (multi-select), citizenship, degree, field, intake, funding (fully funded / 100% tuition / 75 / 50 / 25 / other / none), minimum percentage, status, English-taught, IELTS, work experience, application fee, public/private
- Scholarship cards with coverage strip, status, deadline, eligibility for your nationality, verification badge
- University cards grouped by institution
- Compare up to 3 side by side; Save (in-memory until accounts exist)
- Past opportunities kept separately
- `GET /api/opportunities` public JSON endpoint

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the schema, pages, API and phase plan.

## Principle
If we cannot verify it, we do not present it as fact.
