---
phase: 07-public-pages-and-content
plan: 02
subsystem: database
tags: [supabase, sql, migration, seed-data, content]

# Dependency graph
requires:
  - phase: 06-website-infrastructure
    provides: lcc_testimonials and lcc_faqs tables, lccs website content columns (headline, subheadline, bio, bio_teaser, photo_url)
provides:
  - Kim Johnson seed migration with website copy, 3 testimonials, 6 FAQs
  - kim-seed.test.ts integration test suite (CONT-01, CONT-02, CONT-03)
affects: [07-03-landing-page, 07-04-sub-pages, 07-public-pages-and-content]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - DELETE-before-INSERT idempotency pattern for seed migrations
    - Subquery for lcc_id in testimonials/FAQs inserts (never hardcoded UUID)

key-files:
  created:
    - supabase/migrations/20260407000000_phase7_kim_seed.sql
    - tests/integration/kim-seed.test.ts
  modified: []

key-decisions:
  - "DELETE-before-INSERT (not ON CONFLICT DO NOTHING) chosen for testimonials/FAQs seed to allow content updates — re-running migration replaces all seed data cleanly"
  - "6 FAQs inserted (minimum was 5) — added au pair vs. nanny comparison to improve family-facing value"
  - "photo_url explicitly set to NULL in UPDATE — pages must render gracefully without photo"

patterns-established:
  - "Seed migration pattern: UPDATE lccs for copy fields, DELETE+INSERT for child table rows, subquery for lcc_id"

requirements-completed: [CONT-01, CONT-02, CONT-03]

# Metrics
duration: 2min
completed: 2026-04-08
---

# Phase 7 Plan 02: Kim Johnson Seed Migration Summary

**AI-drafted placeholder copy seeded for kim-johnson: headline, bio, bio_teaser, 3 testimonials, and 6 FAQs applied via idempotent SQL migration — all 3 integration tests GREEN**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-04-08T00:47:02Z
- **Completed:** 2026-04-08T00:48:24Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- Migration `20260407000000_phase7_kim_seed.sql` created and applied via `npx supabase db push --linked`
- kim-johnson lccs row updated with headline, subheadline, bio_teaser, bio, photo_url=NULL (CONT-01)
- 3 testimonials seeded for kim-johnson (CONT-02)
- 6 FAQs seeded for kim-johnson — covers cost, timeline, living arrangement, rematch, visa, au pair vs. nanny (CONT-03)
- Integration test suite `kim-seed.test.ts` created and passing 3/3 GREEN

## Task Commits

Each task was committed atomically:

1. **Task 1: Write Kim seed migration and apply to Supabase** - `d1766cb` (feat)

**Plan metadata:** (pending)

## Files Created/Modified
- `supabase/migrations/20260407000000_phase7_kim_seed.sql` - Kim Johnson seed migration with UPDATE for lccs copy, DELETE+INSERT for testimonials and FAQs
- `tests/integration/kim-seed.test.ts` - Integration tests for CONT-01, CONT-02, CONT-03

## Decisions Made
- DELETE-before-INSERT chosen over ON CONFLICT DO NOTHING so re-running the migration cleanly replaces seed content rather than silently skipping updates
- 6 FAQs inserted instead of the minimum 5 — added au pair vs. nanny comparison FAQ (order_index 5) which adds meaningful family-facing value
- photo_url explicitly set to NULL (not omitted) to document the deliberate choice and ensure page fallback logic is exercised

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created missing kim-seed.test.ts from Plan 01**
- **Found during:** Task 1 (pre-execution check)
- **Issue:** Plan 02 verify step calls `npx vitest run tests/integration/kim-seed.test.ts` but the file didn't exist — Plan 01 (TDD RED phase) had not yet been executed
- **Fix:** Created `tests/integration/kim-seed.test.ts` matching the spec from Plan 01 Task 3, following the website-infra.test.ts pattern with createAdminClient()
- **Files modified:** tests/integration/kim-seed.test.ts
- **Verification:** File runs without TypeScript errors, 3 tests failed RED before migration, 3 tests passed GREEN after migration
- **Committed in:** d1766cb (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 - blocking prerequisite)
**Impact on plan:** Auto-fix was necessary — migration verification required the test file. No scope creep.

## Issues Encountered
None — migration applied cleanly on first attempt, all tests passed immediately after.

## User Setup Required
None - no external service configuration required. Migration applied automatically to remote Supabase. Real content swap is an operator task before live demo.

## Next Phase Readiness
- kim-johnson DB content fully seeded — Plans 07-03 (landing page) and 07-04 (sub-pages) can now fetch and render real content
- photo_url is NULL — page implementations must include graceful null fallback
- FAQs and testimonials are ordered by order_index — pages should sort by this column

---
*Phase: 07-public-pages-and-content*
*Completed: 2026-04-08*

## Self-Check: PASSED

- FOUND: supabase/migrations/20260407000000_phase7_kim_seed.sql
- FOUND: tests/integration/kim-seed.test.ts
- FOUND: commit d1766cb
