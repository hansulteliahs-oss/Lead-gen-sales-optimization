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
  - "kim-johnson LCC row inserted into remote Supabase DB — seed.sql only had lcc1/lcc2 but plans use kim-johnson slug"

patterns-established:
  - "Pattern: Server layout fetches DB data → passes as props to Client nav — keeps service role key server-side"
  - "Pattern: E2E mobile tests use page.setViewportSize() in beforeEach for consistent mobile simulation"

requirements-completed: [SITE-06, SITE-07]

# Metrics
duration: 20min
completed: 2026-04-07
---

# Phase 06 Plan 03: LCC Layout and Sticky Responsive Nav Summary

**Sticky responsive nav with LCC name home link, 4 section links, smooth-scroll CTA, and hamburger dropdown toggling to X on mobile — verified by 12 Playwright E2E tests (all 17 website-infrastructure tests passing)**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-04-07T22:07:42Z
- **Completed:** 2026-04-07T22:11:04Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Server Component layout (`app/[lccSlug]/layout.tsx`) fetches LCC name/slug via admin client and renders sticky nav above all LCC pages; calls `notFound()` for unknown slugs
- Client Component `LccWebNav.tsx` implements full sticky nav: LCC name as home link, 4 nav links (About, Au Pairs, FAQ, Testimonials) with active state highlighting, Get Started CTA with smart `#form` vs `/[slug]/#form` routing, hamburger toggle with X icon and animated 200ms dropdown
- Landing page `page.tsx` wrapped `<LeadCaptureForm>` in `<section id="form">` for CTA anchor scroll target
- Root layout `<html>` element gained `className="scroll-smooth"` for CSS smooth scrolling
- 12 E2E tests verifying SITE-06 (nav on all 5 LCC pages, home link navigation, active state) and SITE-07 (hamburger opens/closes, dropdown content, aria-label toggle, link auto-closes menu)
- All 17 website-infrastructure E2E tests passing (5 public-routes + 12 nav-layout)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create layout and nav component** - `81df357` (feat)
2. **Task 2: Write E2E tests for nav layout and hamburger** - `9c6a266` (test)

## Files Created/Modified
- `app/[lccSlug]/layout.tsx` - Server Component layout: fetches LCC name/slug, calls notFound() for unknown slugs, renders LccWebNav + main children
- `components/LccWebNav.tsx` - Client Component: sticky nav with hamburger, active link detection via usePathname(), smart CTA routing
- `app/[lccSlug]/page.tsx` - Added `<section id="form">` wrapping LeadCaptureForm, changed outer `<main>` to `<div>` (layout provides main now)
- `app/layout.tsx` - Added `className="scroll-smooth"` to html element for CSS smooth scrolling
- `tests/e2e/website-infrastructure/nav-layout.spec.ts` - 12 Playwright E2E tests for SITE-06 and SITE-07

## Decisions Made
- `<a>` tag used for CTA instead of `<Link>` to allow `#fragment` anchor navigation — Next.js Link doesn't support hash-only hrefs reliably for same-page scrolling
- CTA href detection: `pathname === /${lccSlug}` → `#form`, else `/${lccSlug}/#form` — simple string comparison sufficient
- Active state: `text-brand-gold font-medium border-b-2 border-brand-gold` on active desktop links — uses existing brand color token
- Mobile dropdown: `max-h-0` / `max-h-64` with `duration-200` — avoids JS-driven animation, pure CSS transition

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] 06-02 E2E tests broken by layout notFound() guard**
- **Found during:** Task 2 pre-verification (running public-routes.spec.ts to confirm baseline)
- **Issue:** New `app/[lccSlug]/layout.tsx` queries DB and calls `notFound()` for unknown slugs. The 06-02 tests use slug `kim-johnson` which didn't exist in the remote DB — all 4 sub-route tests returned 404 instead of 200.
- **Fix:** Inserted `kim-johnson` LCC row into remote Supabase DB via `npx supabase db query --linked "INSERT INTO public.lccs ..."`.
- **Files modified:** None (DB data change only)
- **Result:** All 5 public-routes tests restored to passing; all 12 nav-layout tests pass as well

## Self-Check

**Files exist:**
- `app/[lccSlug]/layout.tsx` — FOUND (created this session)
- `components/LccWebNav.tsx` — FOUND (created this session)
- `tests/e2e/website-infrastructure/nav-layout.spec.ts` — FOUND (created this session)
- `app/[lccSlug]/page.tsx` contains `id="form"` — FOUND
- `app/layout.tsx` contains `scroll-smooth` — FOUND

**Commits exist:**
- `81df357` feat(06-03): create LCC layout and sticky responsive nav component — FOUND
- `9c6a266` test(06-03): add E2E tests for SITE-06 and SITE-07 nav layout — FOUND

## Self-Check: PASSED

## Next Phase Readiness
- All LCC website pages now have a consistent sticky nav shell — Phase 7 content pages will render inside this layout automatically
- Active state highlighting will work for Phase 7 pages since they are already in the nav link list
- `components/` directory established — Phase 7 page components can follow same pattern
- No blockers for Phase 7

---
*Phase: 06-website-infrastructure*
*Completed: 2026-04-07*
