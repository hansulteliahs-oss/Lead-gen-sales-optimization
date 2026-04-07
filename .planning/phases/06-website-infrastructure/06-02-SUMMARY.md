---
phase: 06-website-infrastructure
plan: 02
subsystem: infra
tags: [nextjs, middleware, playwright, e2e, routing]

# Dependency graph
requires:
  - phase: 02-lead-capture-and-automation
    provides: "Middleware public route regex pattern (/[slug] and /[slug]/thank-you)"
provides:
  - "Middleware regex extended to allow 4 new sub-paths: /about, /au-pairs, /faq, /testimonials"
  - "4 stub pages returning 200 for unauthenticated users"
  - "E2E tests confirming SITE-05: public sub-routes accessible without auth"
affects: [07-website-content, 06-03-nav-component]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Explicit allowlist regex in middleware for public sub-routes", "Stub pages as placeholders before content implementation"]

key-files:
  created:
    - app/[lccSlug]/about/page.tsx
    - app/[lccSlug]/au-pairs/page.tsx
    - app/[lccSlug]/faq/page.tsx
    - app/[lccSlug]/testimonials/page.tsx
    - tests/e2e/website-infrastructure/public-routes.spec.ts
  modified:
    - middleware.ts

key-decisions:
  - "Middleware variable renamed from isPublicLandingPage to isPublicLccPage to reflect broader scope beyond just the landing page"
  - "Non-allowlisted sub-paths (e.g., /secret-admin) remain gated — regex is an explicit allowlist not a wildcard"

patterns-established:
  - "Public route allowlist: extend middleware regex with (?:\/(?:thank-you|about|au-pairs|faq|testimonials))? pattern"
  - "Stub pages: minimal Server Component returning placeholder div — no data fetching, no notFound() call"

requirements-completed: [SITE-05]

# Metrics
duration: 15min
completed: 2026-04-07
---

# Phase 6 Plan 02: Public Sub-Routes Summary

**Middleware regex extended to allowlist 4 sub-routes (/about, /au-pairs, /faq, /testimonials) with stub pages and E2E tests confirming unauthenticated 200 responses**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-07T21:50:00Z
- **Completed:** 2026-04-07T22:06:01Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Middleware regex updated from `(?:\/thank-you)?` to `(?:\/(?:thank-you|about|au-pairs|faq|testimonials))?` — explicit allowlist for 4 new sub-paths
- Variable renamed `isPublicLandingPage` → `isPublicLccPage` to reflect broader scope
- 4 minimal stub pages created: about, au-pairs, faq, testimonials — each returns 200 with placeholder div
- E2E test suite (5 tests) written and verified passing: 4 positive tests (200 without auth) + 1 negative test (non-allowlisted path still gated)

## Task Commits

Each task was committed atomically:

1. **Task 1: Expand middleware regex and create stub pages** - `11920f6` (feat)
2. **Task 2: Write E2E test for public route access** - `5c34db5` (test)

**Plan metadata:** (to be created)

## Files Created/Modified
- `middleware.ts` - Extended regex + variable rename (isPublicLandingPage → isPublicLccPage)
- `app/[lccSlug]/about/page.tsx` - Stub page returning "About page — coming soon"
- `app/[lccSlug]/au-pairs/page.tsx` - Stub page returning "Au Pairs page — coming soon"
- `app/[lccSlug]/faq/page.tsx` - Stub page returning "FAQ page — coming soon"
- `app/[lccSlug]/testimonials/page.tsx` - Stub page returning "Testimonials page — coming soon"
- `tests/e2e/website-infrastructure/public-routes.spec.ts` - 5 E2E tests for SITE-05

## Decisions Made
- Renamed `isPublicLandingPage` to `isPublicLccPage` since the variable now covers more than just the root landing page — future readers will understand the scope correctly
- Stub pages intentionally have no data fetching or layout — Phase 7 replaces content, keeping this plan minimal and focused

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Port 3000 was occupied by an Express static file server (not Next.js) when the E2E tests were first run, causing 404s. Killed the stale process and restarted Next.js dev server on port 3000 — all 5 tests then passed.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Middleware now allows unauthenticated access to all 4 sub-routes
- Stub pages exist so Next.js returns 200 (not 404) for all 4 paths
- Plan 03 (nav component) can now safely link to /about, /au-pairs, /faq, /testimonials
- Phase 7 (content implementation) can replace stub page content without any middleware changes

---
*Phase: 06-website-infrastructure*
*Completed: 2026-04-07*
