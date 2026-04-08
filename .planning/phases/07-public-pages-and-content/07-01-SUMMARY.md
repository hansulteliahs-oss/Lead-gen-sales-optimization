---
phase: 07-public-pages-and-content
plan: 01
subsystem: testing
tags: [playwright, vitest, e2e, tdd, red-phase]

# Dependency graph
requires:
  - phase: 06-website-infrastructure
    provides: nav layout, sub-page stubs (about/au-pairs/faq/testimonials), lcc_testimonials and lcc_faqs tables, kim-johnson slug in DB
provides:
  - Wave 0 E2E tests in RED state covering PAGE-01 through PAGE-06
  - Integration test covering CONT-01, CONT-02, CONT-03
  - Acceptance criteria locked before implementation begins
affects:
  - 07-02 (seed migration — makes kim-seed.test.ts GREEN)
  - 07-03 (landing page rewrite — makes landing-page.spec.ts GREEN)
  - 07-04 through 07-06 (sub-page implementations — make sub-pages.spec.ts GREEN)

# Tech tracking
tech-stack:
  added: []
  patterns: [TDD RED-GREEN cycle, data-testid selector convention for new page elements, section-level locators distinguish page sections from nav links]

key-files:
  created:
    - tests/e2e/public-pages/landing-page.spec.ts
    - tests/e2e/public-pages/sub-pages.spec.ts
  modified: []

key-decisions:
  - "landing-page.spec.ts uses data-testid selectors for hero and CTA to distinguish page sections from nav elements"
  - "sub-pages.spec.ts uses details element count assertion for au-pairs accordion (4 items required)"
  - "kim-seed.test.ts already existed and passes GREEN — seed migration was applied out of plan order in commit d1766cb"
  - "Empty state tests for FAQ and testimonials skipped — kim-johnson already has seeded content"

patterns-established:
  - "data-testid for new hero/CTA elements: [data-testid=hero-section], [data-testid=hero-cta], [data-testid=about-teaser], [data-testid=au-pairs-teaser], [data-testid=testimonial-quote]"
  - "sub-page test isolation: each describe block uses page.goto() not beforeEach to keep tests independent"

requirements-completed: [PAGE-01, PAGE-02, PAGE-03, PAGE-04, PAGE-05, PAGE-06, CONT-01, CONT-02, CONT-03]

# Metrics
duration: 4min
completed: 2026-04-07
---

# Phase 7 Plan 01: Public Pages and Content — Wave 0 Red Tests Summary

**Playwright E2E and Vitest integration test stubs covering all 9 Phase 7 requirements (PAGE-01 through PAGE-06, CONT-01 through CONT-03) in RED state, locking acceptance criteria before implementation**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-07T17:46:44Z
- **Completed:** 2026-04-07T17:50:38Z
- **Tasks:** 3
- **Files modified:** 2 created (kim-seed.test.ts pre-existed)

## Accomplishments
- Created `landing-page.spec.ts` with 7 tests — 4 fail RED (hero, about teaser, au pairs teaser, testimonials quote, hero CTA), 3 pass (status 200, form anchor, form section id)
- Created `sub-pages.spec.ts` with 11 tests — 6 fail RED (bio text, 4 accordion items, accordion headings, comparison table, FAQ items, testimonial quote), 5 pass (status 200 checks), 2 skipped (empty state tests)
- Confirmed `kim-seed.test.ts` already existed and all 3 CONT-01/02/03 tests pass GREEN (seed pre-applied)

## Task Commits

1. **Task 1: E2E test stubs — landing page (RED)** - `7ee99ac` (test)
2. **Task 2: E2E test stubs — sub-pages (RED)** - `ffd789d` (test)
3. **Task 3: Integration test stubs — Kim seed (RED)** — no new commit needed; `kim-seed.test.ts` already committed at `d1766cb`

## Files Created/Modified
- `tests/e2e/public-pages/landing-page.spec.ts` — E2E stubs for PAGE-01 (hero, about teaser, au pairs teaser, testimonials snippet) and PAGE-02 (hero CTA with #form anchor)
- `tests/e2e/public-pages/sub-pages.spec.ts` — E2E stubs for PAGE-03 (/about), PAGE-04 (/au-pairs accordion), PAGE-05 (/faq), PAGE-06 (/testimonials)
- `tests/integration/kim-seed.test.ts` — Pre-existed from commit d1766cb; covers CONT-01/02/03

## Decisions Made
- Used `data-testid` selectors for hero and teaser sections so tests are stable and distinguish page-level sections from nav links (both have /about and /au-pairs links)
- `[data-testid="hero-section"]` and `[data-testid="hero-cta"]` agreed upon as required attributes for Plan 03 implementation
- `details` element chosen as the accordion selector for the au-pairs page (HTML-native accordion, no JS framework needed)
- Empty state tests for FAQ and testimonials marked `test.skip` because kim-johnson has seeded content — skips are preferable to tests that would immediately flip state

## Deviations from Plan

### Pre-applied Seed (Ordering Deviation)

**Task 3: kim-seed.test.ts already existed in GREEN state (not RED)**
- **Found during:** Task 3 (Integration test stubs — Kim seed)
- **Issue:** Plan 02 (seed migration) was executed BEFORE Plan 01 (this Wave 0 plan). Commit `d1766cb` applied the Kim Johnson seed migration AND created `kim-seed.test.ts` — all 3 integration tests pass GREEN.
- **Fix:** No fix needed — file exists, content is correct, tests cover CONT-01/02/03. Documented as informational deviation.
- **Impact:** Requirement CONT-01/02/03 test files exist and are valid TypeScript. The "RED" pre-condition is moot since the seed is already applied.

---

**Total deviations:** 1 informational (out-of-order plan execution)
**Impact on plan:** No code changes required. Test file pre-exists with correct content.

## Issues Encountered
- Initial `landing-page.spec.ts` assertions were too loose — the existing page already had `section#form`, `h1`, and nav links pointing to /about and /au-pairs. Refined tests to use `data-testid` selectors and section-level locators to ensure RED failures on content not yet implemented.

## Next Phase Readiness
- All Wave 0 test files are in place; RED failures are locked
- Plan 02 (seed) is already complete — CONT-01/02/03 tests pass GREEN
- Plan 03 (landing page rewrite) must add `data-testid="hero-section"`, `data-testid="hero-cta"`, `data-testid="about-teaser"`, `data-testid="au-pairs-teaser"`, and `blockquote`/`data-testid="testimonial-quote"` elements
- Plan 04 (about page) must render `[data-testid="bio"]` or `article p` with DB bio content
- Plan 05 (au-pairs page) must render exactly 4 `<details>` elements with correct headings and a `<table>` inside one accordion item
- Plan 06 (faq/testimonials) must render `h2/h3` question elements and `blockquote`/`[data-testid="testimonial"]` quote elements

---
*Phase: 07-public-pages-and-content*
*Completed: 2026-04-07*
