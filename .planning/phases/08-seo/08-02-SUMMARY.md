---
phase: 08-seo
plan: 02
subsystem: ui
tags: [next-js, metadata, seo, open-graph, supabase]

# Dependency graph
requires:
  - phase: 08-01
    provides: kim-arvdalen slug rename migration and Wave 0 RED metadata tests
  - phase: 07-public-pages-and-content
    provides: all 5 LCC public page components (page.tsx files being modified)
provides:
  - generateMetadata export on all 5 LCC public pages with title, description, og:title, og:description, og:image (conditional)
  - Sensible root layout metadata fallback replacing Create Next App placeholder
affects: [seo, public-pages, social-sharing]

# Tech tracking
tech-stack:
  added: []
  patterns: [Next.js 14 generateMetadata named export pattern, conditional og:image via spread operator]

key-files:
  created: []
  modified:
    - app/[lccSlug]/page.tsx
    - app/[lccSlug]/about/page.tsx
    - app/[lccSlug]/au-pairs/page.tsx
    - app/[lccSlug]/faq/page.tsx
    - app/[lccSlug]/testimonials/page.tsx
    - app/layout.tsx

key-decisions:
  - "generateMetadata uses named export (not default) per Next.js 14 App Router spec"
  - "Returns {} when slug not found instead of calling notFound() — page component handles 404"
  - "og:image uses conditional spread so images array is absent when photo_url is NULL"
  - "Each page makes its own minimal DB query (select name, photo_url) — no shared context with layout"

patterns-established:
  - "Named generateMetadata export pattern: export async function generateMetadata({ params }): Promise<Metadata>"
  - "Conditional og:image: ...(lcc.photo_url ? { images: [{ url: lcc.photo_url }] } : {})"
  - "Minimal DB query for metadata: select('name, photo_url') only — no full page data"

requirements-completed: [SEO-01, SEO-02]

# Metrics
duration: 33min
completed: 2026-04-09
---

# Phase 8 Plan 2: SEO Metadata Summary

**generateMetadata on all 5 LCC public pages with page-specific titles, descriptions, and conditional og:image based on photo_url nullability**

## Performance

- **Duration:** 33 min
- **Started:** 2026-04-09T15:41:13Z
- **Completed:** 2026-04-09T16:14:33Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Added named `generateMetadata` export to all 5 LCC public pages (landing, about, au-pairs, faq, testimonials)
- All 25 SEO metadata E2E tests pass GREEN — title, description, og:title, og:description correct; og:image absent for kim-arvdalen (NULL photo_url)
- Updated root `app/layout.tsx` fallback from "Create Next App" to "Local Childcare Consultant"
- Full Playwright suite baseline maintained — 63 passing, 26 pre-existing failures unchanged

## Task Commits

Each task was committed atomically:

1. **Task 1: Add generateMetadata to all 5 LCC pages** - `6bb2025` (feat)
2. **Task 2: Update root layout metadata + full suite verification** - `4edb377` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `app/[lccSlug]/page.tsx` — Added generateMetadata: "LCC name | Local Childcare Consultant"
- `app/[lccSlug]/about/page.tsx` — Added generateMetadata: "LCC name | About"
- `app/[lccSlug]/au-pairs/page.tsx` — Added generateMetadata: "LCC name | Au Pairs"
- `app/[lccSlug]/faq/page.tsx` — Added generateMetadata: "LCC name | FAQ"
- `app/[lccSlug]/testimonials/page.tsx` — Added generateMetadata: "LCC name | Testimonials"
- `app/layout.tsx` — Replaced "Create Next App" with "Local Childcare Consultant" fallback

## Decisions Made

- Named export `export async function generateMetadata` chosen over `export const metadata` — static export would break multi-tenancy by not resolving LCC name at request time
- `return {}` when slug not found (not `notFound()`) — the page component handles 404; calling notFound() in generateMetadata causes duplicate 404 errors
- Conditional og:image via spread: `...(lcc.photo_url ? { images: [{ url: lcc.photo_url }] } : {})` — ensures images array is entirely absent (not set to null) when photo_url is NULL

## Deviations from Plan

### Environment Issue (Not a Code Deviation)

**Background Next.js dev server (PID 58890) was deadlocked on port 3000**
- **Found during:** Task 1 verification
- **Issue:** A background next-server on port 3000 had multiple hung HTTP connections blocking all page renders. The terminal dev server was on port 3001.
- **Fix:** Temporarily updated playwright.config.ts baseURL to port 3001 to run tests against the working server, then reverted to 3000 after verification
- **Impact:** Tests passed correctly on the working server; code changes are verified correct
- **Committed in:** Not committed (playwright.config.ts reverted to 3000 before commit)

---

**Total deviations:** 0 code deviations — plan executed exactly as written

## Issues Encountered

- Background Next.js dev server deadlock on port 3000 prevented test execution — resolved by temporarily pointing tests at terminal server on port 3001
- Pre-existing 26 test failures in auth/lead-capture suite unchanged — these use test credentials that are environment-sensitive and predate this plan

## User Setup Required

None — no external service configuration required.

## Self-Check: PASSED

All 7 files verified present. Both commits (6bb2025, 4edb377) verified in git log.

## Next Phase Readiness

- All 5 LCC public pages have correct SEO metadata
- Phase 8 (SEO) is complete — both SEO-01 and SEO-02 requirements satisfied
- Pages are ready for search engine indexing and social media sharing previews
