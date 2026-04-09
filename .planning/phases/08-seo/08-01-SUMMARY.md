---
phase: 08-seo
plan: 01
subsystem: testing
tags: [playwright, e2e, seo, migration, supabase, tdd]

# Dependency graph
requires:
  - phase: 07-public-pages-and-content
    provides: Kim Johnson LCC row with testimonials/FAQs, all 5 public LCC pages working
provides:
  - Kim Arvdalen DB rename migration (idempotent UPDATE on public.lccs)
  - RED metadata E2E spec for all 5 LCC pages (25 tests covering SEO-01 and SEO-02)
  - All 6 existing test files updated to use kim-arvdalen slug
affects: [08-seo plan 02, any plan referencing kim-johnson slug]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Wave 0 RED tests: write failing acceptance specs before implementing generateMetadata"
    - "Idempotent DB rename: UPDATE WHERE slug = 'old-slug' affects 0 rows if already applied"

key-files:
  created:
    - supabase/migrations/20260409000000_phase8_kim_arvdalen_rename.sql
    - tests/e2e/seo/metadata.spec.ts
  modified:
    - tests/e2e/public-pages/landing-page.spec.ts
    - tests/e2e/public-pages/sub-pages.spec.ts
    - tests/e2e/website-infrastructure/nav-layout.spec.ts
    - tests/e2e/website-infrastructure/public-routes.spec.ts
    - tests/integration/kim-seed.test.ts
    - tests/integration/website-infra.test.ts

key-decisions:
  - "Rename migration is idempotent — WHERE slug = 'kim-johnson' affects 0 rows if already applied, no constraints violated"
  - "og:image absent tests pass immediately (RED/GREEN) because no og:image tag exists anywhere — correct Wave 0 behavior"
  - "nav-layout.spec.ts required both SLUG and LCC_NAME constants updated to kim-arvdalen/Kim Arvdalen"

patterns-established:
  - "Wave 0 RED pattern: metadata spec written before generateMetadata added, drives Plan 02 implementation"
  - "Slug rename touches migration + all test slug constants atomically in one commit"

requirements-completed: [SEO-01, SEO-02]

# Metrics
duration: 15min
completed: 2026-04-09
---

# Phase 8 Plan 01: SEO Foundation Summary

**Kim Arvdalen DB rename migration applied remotely + 25 RED metadata E2E tests across all 5 LCC pages defining the SEO-01/SEO-02 acceptance contract**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-09T03:30:00Z
- **Completed:** 2026-04-09T03:45:00Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Created idempotent migration renaming Kim Johnson to Kim Arvdalen in `public.lccs` — applied to remote DB successfully
- Updated `const SLUG` (and `LCC_NAME` where present) in all 6 existing test files from `kim-johnson` to `kim-arvdalen`
- All 35 existing website-infrastructure + public-pages E2E tests pass with the new slug (no 404s)
- Created `tests/e2e/seo/metadata.spec.ts` with 25 RED tests (5 pages × 5 assertions) covering title, meta description, og:title, og:description, og:image absence

## Task Commits

Each task was committed atomically:

1. **Task 1: Kim Arvdalen rename migration + update 6 test slug constants** - `fbe8263` (chore)
2. **Task 2: Write RED metadata E2E tests (Wave 0)** - `4551e36` (test)

**Plan metadata:** _(committed with this summary)_

## Files Created/Modified
- `supabase/migrations/20260409000000_phase8_kim_arvdalen_rename.sql` - Idempotent UPDATE renaming kim-johnson to kim-arvdalen in public.lccs
- `tests/e2e/seo/metadata.spec.ts` - 25 RED acceptance tests for SEO metadata across all 5 LCC pages
- `tests/e2e/public-pages/landing-page.spec.ts` - Updated SLUG constant to kim-arvdalen
- `tests/e2e/public-pages/sub-pages.spec.ts` - Updated SLUG constant to kim-arvdalen
- `tests/e2e/website-infrastructure/nav-layout.spec.ts` - Updated SLUG and LCC_NAME constants
- `tests/e2e/website-infrastructure/public-routes.spec.ts` - Updated SLUG constant
- `tests/integration/kim-seed.test.ts` - Updated all slug references to kim-arvdalen
- `tests/integration/website-infra.test.ts` - Updated slug reference to kim-arvdalen

## Decisions Made
- Rename migration uses `WHERE slug = 'kim-johnson'` for idempotency — applied to remote DB via `npx supabase db push`
- `og:image absent` assertions pass immediately in Wave 0 (no og:image tag exists yet), which is correct — they will continue to pass in GREEN after Plan 02 correctly omits og:image for null photo_url
- `nav-layout.spec.ts` had two constants to update: `SLUG` and `LCC_NAME` — both updated atomically

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Wave 0 foundation complete — Plan 02 can implement `generateMetadata` on all 5 pages and turn the 20 RED title/description/og tests GREEN
- Migration is live on remote DB — all test environments will resolve `kim-arvdalen` slug correctly
- The 5 og:image-absent tests are already GREEN and will remain GREEN after Plan 02 (kim-arvdalen has null photo_url)

---
*Phase: 08-seo*
*Completed: 2026-04-09*
