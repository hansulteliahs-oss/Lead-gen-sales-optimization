---
phase: 06-website-infrastructure
plan: 03
subsystem: ui
tags: [nextjs, react, tailwind, playwright, nav, layout, responsive]

# Dependency graph
requires:
  - phase: 06-01
    provides: lccs schema with name/slug columns for nav data fetching
  - phase: 06-02
    provides: middleware allowing sub-routes and stub pages for nav targets

provides:
  - Server Component layout at app/[lccSlug]/layout.tsx wrapping all LCC pages with nav
  - Client Component LccWebNav.tsx with sticky nav, hamburger toggle, and CTA routing
  - id="form" anchor on landing page for CTA smooth-scroll
  - scroll-smooth on root html element for anchor behavior
  - E2E tests covering SITE-06 (nav on all pages) and SITE-07 (hamburger on mobile)

affects: [07-lcc-website-pages]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server Component layout fetches LCC data via createAdminClient and passes to Client Component nav
    - Client Component nav uses usePathname() for active link detection and CTA routing logic
    - Tailwind hidden/md:flex and md:hidden pattern for responsive desktop/mobile nav split
    - max-h-0 to max-h-64 CSS transition for slide-down mobile dropdown (~200ms)

key-files:
  created:
    - app/[lccSlug]/layout.tsx
    - components/LccWebNav.tsx
    - tests/e2e/website-infrastructure/nav-layout.spec.ts
  modified:
    - app/[lccSlug]/page.tsx
    - app/layout.tsx

key-decisions:
  - "Nav uses <a> (not <Link>) for CTA Get Started button to allow #fragment anchor scroll behavior"
  - "CTA href is #form on landing page and /[slug]/#form on sub-pages, detected via usePathname()"
  - "Active link styling uses text-brand-gold + border-b-2 border-brand-gold for clear current-page indicator"
  - "Mobile dropdown uses max-h-0/max-h-64 transition rather than opacity/visibility to preserve layout flow"

patterns-established:
  - "Pattern: Server layout fetches DB data → passes as props to Client nav — keeps service role key server-side"
  - "Pattern: E2E mobile tests use test.use({ viewport }) with beforeEach for consistent mobile simulation"

requirements-completed: [SITE-06, SITE-07]

# Metrics
duration: 2min
completed: 2026-04-07
---

# Phase 06 Plan 03: LCC Layout and Sticky Responsive Nav Summary

**Sticky responsive nav with LCC name home link, 4 section links, smooth-scroll CTA, and hamburger dropdown toggling to X on mobile — verified by 12 Playwright E2E tests**

## Performance

- **Duration:** ~2 min (prior session)
- **Started:** 2026-04-07T22:09:00Z
- **Completed:** 2026-04-07T22:11:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Server Component layout (`app/[lccSlug]/layout.tsx`) fetches LCC name/slug via admin client and renders sticky nav above all LCC pages
- Client Component `LccWebNav.tsx` implements full sticky nav: LCC name as home link, 4 nav links with active state highlighting, Get Started CTA with smart #form routing, hamburger toggle with X icon and animated dropdown
- 12 E2E tests verifying SITE-06 (nav on all 5 LCC pages) and SITE-07 (hamburger opens/closes, links auto-close menu, aria-labels toggle)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create layout and nav component** - `81df357` (feat)
2. **Task 2: Write E2E tests for nav layout and hamburger** - `9c6a266` (test)

**Plan metadata:** (this commit)

## Files Created/Modified
- `app/[lccSlug]/layout.tsx` - Server Component layout: fetches LCC name/slug, calls notFound() for unknown slugs, renders LccWebNav + main children
- `components/LccWebNav.tsx` - Client Component: sticky nav with hamburger, active link detection via usePathname(), smart CTA routing
- `app/[lccSlug]/page.tsx` - Added `id="form"` on section wrapping LeadCaptureForm for anchor scroll target
- `app/layout.tsx` - Added `className="scroll-smooth"` to html element for CSS smooth scrolling
- `tests/e2e/website-infrastructure/nav-layout.spec.ts` - 12 Playwright E2E tests for SITE-06 and SITE-07

## Decisions Made
- `<a>` tag used for CTA instead of `<Link>` to allow `#fragment` anchor navigation — Next.js Link doesn't support hash-only hrefs reliably for same-page scrolling
- CTA href detection: `pathname === /${lccSlug}` → `#form`, else `/${lccSlug}/#form` — simple string comparison sufficient
- Active state: `text-brand-gold font-medium border-b-2 border-brand-gold` on active desktop links — uses existing brand color token
- Mobile dropdown: `max-h-0` / `max-h-64` with `duration-200` — avoids JS-driven animation, pure CSS transition

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- First E2E test run showed 4 failures — on second immediate run all 12 passed. Root cause: dev server cold-start latency on first run (pages compiling on first request). No code changes required.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All LCC website pages now have a consistent sticky nav shell — Phase 7 content pages will render inside this layout automatically
- Active state highlighting will work for Phase 7 pages since they are already in the nav link list
- No blockers for Phase 7

---
*Phase: 06-website-infrastructure*
*Completed: 2026-04-07*
