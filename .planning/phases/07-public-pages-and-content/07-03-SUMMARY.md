---
phase: 07-public-pages-and-content
plan: 03
subsystem: ui
tags: [nextjs, react, tailwind, supabase, landing-page, e2e]

# Dependency graph
requires:
  - phase: 07-public-pages-and-content
    provides: Wave 0 RED tests (07-01), kim-johnson seed data with testimonials/bio (07-02)
  - phase: 06-website-infrastructure
    provides: nav layout, lcc_testimonials table, lccs website columns, brand tokens in tailwind.config.ts
provides:
  - Full 5-section landing page at /[lccSlug]/ with hero, about teaser, au pairs teaser, testimonials snippet, lead form
  - PAGE-01 and PAGE-02 acceptance criteria turned GREEN
affects: [07-04-sub-pages, 07-05-faq, 07-06-testimonials]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 5-section landing page with alternating bg-brand-pageBg / bg-white backgrounds
    - Plain img tag (not next/image) for LCC photos — no remotePatterns configured
    - Initials fallback when photo_url is NULL — no broken img elements
    - data-testid attributes on hero, CTA, about teaser, au pairs teaser for stable test selectors
    - Sequential DB fetches: lccs row first (for lcc.id), then lcc_testimonials

key-files:
  created: []
  modified:
    - app/[lccSlug]/page.tsx

key-decisions:
  - "Plain img tag used instead of next/image — no remotePatterns configured for Supabase Storage CDN URLs"
  - "data-testid attributes on hero-section, hero-cta, about-teaser, au-pairs-teaser match test expectations from 07-01"
  - "All LCC copy (headline, subheadline, bio_teaser) comes from DB — no hardcoded content in the component"
  - "Testimonials section renders gracefully with null fallback when featuredTestimonial is null"

patterns-established:
  - "id='form' on the outermost section wrapper (not a child div) — required for anchor scroll from nav Get Started CTA"
  - "Sequential supabase queries: fetch lcc row first to get lcc.id, then query child tables with that ID"

requirements-completed: [PAGE-01, PAGE-02]

# Metrics
duration: 1min
completed: 2026-04-08
---

# Phase 7 Plan 03: Landing Page Rewrite Summary

**5-section LCC landing page (hero with photo fallback, about teaser, au pairs teaser, testimonials snippet, lead form) replacing the minimal single-section form page — all 7 landing-page.spec.ts tests GREEN**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-04-08T00:53:27Z
- **Completed:** 2026-04-08T00:54:22Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Rewrote `app/[lccSlug]/page.tsx` from 47 lines to 155 lines with 5 distinct sections
- All 7 E2E tests in `landing-page.spec.ts` now pass GREEN (4 were RED before this plan)
- Hero section: two-column grid on md+, photo left with initials fallback, headline/CTA right, collapses to single column on mobile
- Testimonials snippet renders a `<blockquote>` for the first DB testimonial ordered by order_index
- `id="form"` anchor on the form section wrapper enables the nav Get Started CTA scroll (PAGE-02)
- TypeScript compiles clean with no errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite landing page with hero + sections + form** - `5821766` (feat)

**Plan metadata:** (pending)

## Files Created/Modified
- `app/[lccSlug]/page.tsx` — Full 5-section landing page pulling from lccs and lcc_testimonials tables

## Decisions Made
- Used plain `<img>` tag (not `next/image`) because no remotePatterns are configured for the Supabase Storage CDN, which would throw a runtime error
- Added `data-testid` attributes matching exactly what 07-01 tests expect: `hero-section`, `hero-cta`, `about-teaser`, `au-pairs-teaser`
- All LCC content (headline, subheadline, bio_teaser) sourced from DB — no hardcoded Kim Johnson copy in the component

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None — DB content was already seeded by Plan 02 (kim-johnson seed migration), so the page immediately fetched and rendered real data in tests.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Landing page is complete; PAGE-01 and PAGE-02 are GREEN
- Plans 07-04, 07-05, 07-06 can proceed to implement sub-pages (/about, /au-pairs, /faq, /testimonials)
- Sub-page tests in `sub-pages.spec.ts` are still RED — they will be turned GREEN by Plans 04-06

---
*Phase: 07-public-pages-and-content*
*Completed: 2026-04-08*

## Self-Check: PASSED

- FOUND: app/[lccSlug]/page.tsx
- FOUND: commit 5821766
- FOUND: .planning/phases/07-public-pages-and-content/07-03-SUMMARY.md
