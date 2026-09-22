# Architecture and plan

## 1. Inspection of the existing project
The GitHub repository `meerabshafique1211-stack/Scholarship` was empty at the start (no commits). There was no existing code, components, dependencies or database configuration to preserve, so this is a new Next.js project.

## 2. Architecture
One Next.js 15 (App Router) application in TypeScript, styled with Tailwind CSS.

```
Browser ──> Next.js pages (server components render data; client components handle filters)
        ──> Next.js route handlers (/api/*)  ──> repository layer ──> PostgreSQL (Prisma)
                                                                   └> private object storage (CVs, transcripts)
                                                                   └> LLM API (server-side only)
```

The **repository layer** (`src/lib/repository.ts`) is the only place that knows where data comes from. Phase 1 reads a fictional demo dataset; Phase 2 swaps it for Prisma queries that return only `PUBLISHED` records. Components and API routes don't change.

Key modules:

| File | Responsibility |
|---|---|
| `src/lib/status.ts` | Derives Open / Upcoming / Expected / Closed / Unknown from dates. Expected dates are never promoted to official. Records older than 90 days show "Needs verification". |
| `src/lib/query-parser.ts` | Turns "Fully funded Master's in Italy for Pakistani students" into structured filters. |
| `src/lib/filters.ts` | Builds Country → University → Program → Scholarship rows, filtering, eligibility by nationality, sorting. Programs without scholarships are kept. |
| `src/lib/url-state.ts` | Filters ⇄ URL (whitelisted), so every search is shareable and crawlable. |
| `src/data/reference.ts` | Real reference data: countries, citizenships, field taxonomy. |
| `src/data/demo.ts` | **Fictional** dev dataset, every record flagged `demo`. |

## 3. Reusable components (built in Phase 1)
`StatusBadge`, `VerificationBadge`, `DemoBanner`, `CoveragePips`, `ApplyAction`, `OpportunityCard` (scholarship card), `UniversityCard`, `FilterPanel`, `CompareDrawer`, `SentenceSearch`, `SearchClient`.

## 4. Dependencies
Runtime: `next`, `react`, `react-dom`, `@prisma/client`, `zod`. Dev: `typescript`, `tailwindcss`, `postcss`, `autoprefixer`, `prisma`, `eslint`.
Planned additions per phase: `next-auth` (Auth.js) in Phase 3; `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`, `pdf-parse`, `mammoth` in Phase 4; `@anthropic-ai/sdk` in Phase 5.

## 5. Database configuration
PostgreSQL via Prisma. Connection string in `DATABASE_URL` (see `.env.example`). Schema in `prisma/schema.prisma`; not yet migrated.

## 6. Database schema (summary)
Tables: `Country`, `CountryFact`, `University`, `UniversityRanking`, `CareerFact`, `Program`, `Scholarship`, `ScholarshipRequirement`, `ScholarshipSource`, `VerificationLog`, `Deadline`, `User`, `UserProfile`, `UserDocument`, `CvAssessment`, `TranscriptAssessment`, `MotivationLetter`, `SavedUniversity`, `SavedScholarship`, `Application`.

Integrity decisions:
- Dates carry a `DateKind` (`OFFICIAL` / `EXPECTED`). Status is derived, not typed in by hand.
- Coverage fields (`tuitionCoverage`, `accommodation`, ...) are nullable: `null` means **not verified**, which the UI shows explicitly.
- Nationality eligibility is a rule plus a list (`ALL_INTERNATIONAL`, `ONLY_LISTED`, `ALL_EXCEPT_LISTED`, `NOT_VERIFIED`).
- `SourceKind.SECONDARY` can help discover a scholarship but cannot on its own verify it.
- `PublishState.ARCHIVED` keeps past cycles for the "Past opportunities" section; nothing is deleted.
- `CareerFact.origin` separates university claims from external labour-market data.
- Rankings are stored per publisher and year; there is no blended "best university" score.
- Student files are stored by key only; access is through short-lived signed URLs.

Publishing validation (Phase 2/7, zod): a scholarship cannot be published without name, university or provider, country, degree level, funding type, an official source URL and a status; status `OPEN` additionally requires an `applicationUrl`.

## 7. Page structure
| Route | Phase | Notes |
|---|---|---|
| `/` | 1 ✅ | Sentence search, open now, fully funded, deadlines, countries, fields, trust |
| `/search` | 1 ✅ | Filters, scholarship and university views, compare, past opportunities |
| `/scholarships/[slug]` | 2 | Scholarship detail with sources and verification log |
| `/universities/[slug]` | 2/6 | Overview, programs, scholarships, costs, admission, career, international students |
| `/countries/[slug]`, `/scholarships/[country]`, `/universities/[country]` | 6 | SEO landing pages with sourced country facts |
| `/scholarships/fully-funded`, `/programs/[field]` | 6 | SEO landing pages |
| `/login`, `/profile` | 3 | Auth and student profile |
| `/applications` | 3 | Tracker with statuses and adaptive checklists |
| `/tools/cv`, `/tools/transcript` | 4 | Private uploads and assessment |
| `/tools/match`, `/tools/motivation-letter` | 5 | Matching (Strong / Possible / Weak, no probabilities) and letter assistant |
| `/compare` | 6 | Shareable comparison (Phase 1 has an in-page drawer) |
| `/admin/*` | 7 | Role-gated CRUD, verification queue, stale-record report |

## 8. API structure
| Endpoint | Auth | Phase |
|---|---|---|
| `GET /api/opportunities` | public | 1 ✅ |
| `GET /api/scholarships/[id]`, `GET /api/universities/[id]` | public | 2 |
| `GET/PUT /api/me/profile` | student | 3 |
| `GET/POST/DELETE /api/me/saved` | student | 3 |
| `GET/POST/PATCH /api/me/applications` | student | 3 |
| `POST /api/me/documents` (returns signed upload URL) | student | 4 |
| `POST /api/me/assessments/cv`, `/transcript` | student, rate-limited | 4 |
| `POST /api/me/match` | student | 5 |
| `POST /api/me/letters`, `/letters/[id]/revise`, `/letters/[id]/check` | student, rate-limited | 5 |
| `/api/admin/*` (universities, programs, scholarships, sources, verify, archive) | editor/admin | 7 |

All student endpoints check ownership of every record (authorization, not just authentication). LLM calls happen only on the server.

## 9. Data rules the AI features must follow
Never invent scholarships, deadlines, requirements, funding, statistics, achievements, experience or grades. Never guarantee admission, funding, employment or visas. When unknown, say "Information not available / requires verification."
