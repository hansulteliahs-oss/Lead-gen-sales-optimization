---
phase: 07-public-pages-and-content
plan: 04
subsystem: ui
tags: [nextjs, supabase, tailwind, server-components, accordion, postgres]

requires:
  - phase: 07-public-pages-and-content-01
    provides: Wave 0 RED E2E tests for PAGE-03 through PAGE-06
  - phase: 07-public-pages-and-content-02
    provides: kim-johnson seed data (bio, FAQs, testimonials) in remote DB
  - phase: 06-website-infrastructure
    provides: createAdminClient(), LccLayout with notFound(), brand tokens

provides:
  - About page rendering LCC bio and name from lccs table with null-photo handling
  - FAQ page fetching lcc_faqs ordered by order_index with empty state
  - Testimonials page fetching lcc_testimonials ordered by order_index with blockquote styling
  - Au pairs static accordion page with 4 details/summary sections and comparison table

affects:
  - phase 07-05 (any remaining public pages sub-routes)
  - future LCC self-editing (v2.1) — pages consume exactly the DB columns that self-edit will write

tech-stack:
  added: []
  patterns:
    - Two-query DB pattern (fetch lcc by slug first, then fetch child rows by lcc.id)
    - data-testid="bio" on bio paragraph to satisfy E2E locator
    - details[open] attribute on comparison-table accordion section for initial visibility

key-files:
  created: []
  modified:
    - app/[lccSlug]/about/page.tsx
    - app/[lccSlug]/au-pairs/page.tsx
    - app/[lccSlug]/faq/page.tsx
    - app/[lccSlug]/testimonials/page.tsx

key-decisions:
  - "data-testid='bio' added to about page bio paragraph to match E2E locator [data-testid='bio']"
  - "Au Pair vs. Nanny details section rendered open by default so table is immediately visible — required for E2E toBeVisible() assertion"
  - "blockquote uses HTML entities (&ldquo;/&rdquo;) instead of template literal quotes for typographic correctness"

patterns-established:
  - "Sub-page DB pattern: fetch lcc by slug → notFound() if missing → fetch child rows by lcc.id"
  - "Static pages still verify LCC exists via DB slug lookup before rendering static content"
  - "Comparison table kept open by default (details[open]) when E2E tests assert toBeVisible on hidden elements"

requirements-completed: [PAGE-03, PAGE-04, PAGE-05, PAGE-06]

duration: 12min
completed: 2026-04-08
---

# Phase 07 Plan 04: Sub-page Implementation Summary

**Four LCC sub-pages implemented: DB-driven about/faq/testimonials and static au-pairs accordion with comparison table**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-04-08T00:43:00Z
- **Completed:** 2026-04-08T00:55:50Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- About page renders LCC name, bio (whitespace-pre-wrap), and gracefully skips photo when null
- FAQ page fetches lcc_faqs by order_index; renders list or empty state
- Testimonials page fetches lcc_testimonials; renders blockquote list with left gold border or empty state
- Au pairs page: 4 details/summary accordions; Au Pair vs. Nanny section has 6-row comparison table; Common Questions section has myth-busting prose list

## Task Commits

1. **Task 1: About, FAQ, Testimonials pages** - `8cdbfb3` (feat)
2. **Task 2: Au Pairs accordion page** - `c568d43` (feat)

**Plan metadata:** _(docs commit follows)_

## Files Created/Modified
- `app/[lccSlug]/about/page.tsx` - DB-driven about page with null-photo handling and data-testid="bio"
- `app/[lccSlug]/faq/page.tsx` - DB-driven FAQ list ordered by order_index with empty state
- `app/[lccSlug]/testimonials/page.tsx` - DB-driven testimonials list with blockquote styling and empty state
- `app/[lccSlug]/au-pairs/page.tsx` - Static accordion with 4 sections and comparison table

## Decisions Made
- Added `data-testid="bio"` to the bio paragraph — the E2E test locator uses `[data-testid="bio"]` as first option and the bio element needed to match it.
- Made "Au Pair vs. Nanny" `<details>` element render with `open` attribute by default — the E2E test asserts `toBeVisible()` on the `<table>` which is hidden inside a collapsed accordion without this.
- Used HTML entities (`&ldquo;`/`&rdquo;`) for quote wrapping in testimonials for typographic correctness.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added data-testid="bio" to about page bio paragraph**
- **Found during:** Task 1 (About page implementation)
- **Issue:** E2E test locator `[data-testid="bio"], p.bio, .bio-content, article p` didn't match the bare `<p>` rendered without any class or id
- **Fix:** Added `data-testid="bio"` attribute to the bio paragraph element
- **Files modified:** `app/[lccSlug]/about/page.tsx`
- **Verification:** E2E "contains bio text from DB" test passed GREEN
- **Committed in:** 8cdbfb3 (Task 1 commit)

**2. [Rule 1 - Bug] Added open attribute to Au Pair vs. Nanny accordion**
- **Found during:** Task 2 (Au Pairs accordion page)
- **Issue:** E2E test `await expect(table).toBeVisible()` failed because the `<table>` was inside a collapsed `<details>` element (visibility: hidden)
- **Fix:** Added `open` attribute to the Au Pair vs. Nanny `<details>` element so it renders expanded by default
- **Files modified:** `app/[lccSlug]/au-pairs/page.tsx`
- **Verification:** E2E "contains a comparison table" test passed GREEN
- **Committed in:** c568d43 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 — bugs causing test failure)
**Impact on plan:** Both fixes were necessary for E2E tests to pass. No scope creep.

## Issues Encountered
None beyond the two auto-fixed test failures above.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- PAGE-03, PAGE-04, PAGE-05, PAGE-06 all GREEN
- Full sub-pages E2E suite: 11 passed, 2 skipped (intentional), 0 failed
- TypeScript compiles clean
- Ready for Phase 07-05 (if any remaining plans) or Phase 08

---
*Phase: 07-public-pages-and-content*
*Completed: 2026-04-08*
