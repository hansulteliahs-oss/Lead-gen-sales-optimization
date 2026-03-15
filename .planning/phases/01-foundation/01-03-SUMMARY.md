---
phase: 01-foundation
plan: 03
subsystem: auth
tags: [supabase, nextjs, middleware, jwt, role-based-routing, server-actions]

# Dependency graph
requires:
  - phase: 01-foundation plan 01
    provides: Supabase client utilities (browser/server/admin) in utils/supabase/
  - phase: 01-foundation plan 02
    provides: profiles table with role column and Custom Access Token Hook injecting role into JWT app_metadata

provides:
  - Next.js middleware enforcing auth on all routes (getClaims JWT validation)
  - Role-based routing: /dashboard hub routes operator → /operator/dashboard, lcc → /lcc/dashboard
  - Cross-role access silently redirects to own dashboard (no 403)
  - Login page at /login with email+password form (server action)
  - Server action calling signInWithPassword and redirecting to /dashboard
  - Operator dashboard placeholder at /operator/dashboard
  - LCC dashboard placeholder at /lcc/dashboard

affects: [phase-02, phase-03, phase-04, all-authenticated-routes]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - getClaims() for JWT validation in middleware (NOT getSession())
    - Route groups (auth), (operator), (lcc) for layout isolation without URL segments
    - /dashboard as post-login routing hub — middleware redirects before page renders
    - Server Actions with 'use server' directive for form submission

key-files:
  created:
    - middleware.ts
    - app/(auth)/login/page.tsx
    - app/(auth)/login/actions.ts
    - app/dashboard/page.tsx
    - app/(operator)/operator/dashboard/page.tsx
    - app/(lcc)/lcc/dashboard/page.tsx
  modified: []

key-decisions:
  - "getClaims() used for JWT validation in middleware — validates cryptographic signature server-side; getSession() explicitly avoided as it trusts unverified cookie data"
  - "Route groups (auth), (operator), (lcc) used for layout isolation — URL segments come from nested folders, not group names"
  - "/dashboard serves as post-login routing hub — middleware intercepts and redirects by role before the page component renders"
  - "Cross-role access results in silent redirect to own dashboard (no 403 error page) per AUTH-03 requirement"

patterns-established:
  - "Middleware pattern: createServerClient in middleware with request cookie passthrough + supabaseResponse cookie setAll"
  - "Auth enforcement: getClaims() → check claims → role from claims.app_metadata.role"
  - "Server Action pattern: 'use server' + createClient() + supabase call + redirect"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04]

# Metrics
duration: 8min
completed: 2026-03-15
---

# Phase 1 Plan 03: Authentication Middleware and Login Flow Summary

**Next.js middleware using getClaims() JWT validation with role-based routing, login server action, and stub dashboards for operator and LCC route groups**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-15T00:37:45Z
- **Completed:** 2026-03-15T00:45:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Middleware enforces auth on all routes using getClaims() JWT cryptographic signature validation
- /dashboard post-login hub routes operator to /operator/dashboard and lcc to /lcc/dashboard
- Cross-role access (lcc hitting /operator/*, operator hitting /lcc/*) silently redirects to own dashboard
- Login form at /login with server action calling signInWithPassword
- Route group structure (auth), (operator), (lcc) established for layout isolation

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement middleware with session refresh and role-based routing** - `c7496d6` (feat)
2. **Task 2: Build login page, server action, and stub dashboards** - `5dd060d` (feat)

**Plan metadata:** (docs commit — see final commit below)

## Files Created/Modified
- `middleware.ts` - Session refresh + auth enforcement + role-based routing using getClaims()
- `app/(auth)/login/page.tsx` - Login form with email/password inputs and error display
- `app/(auth)/login/actions.ts` - Server action: signInWithPassword → redirect /dashboard
- `app/dashboard/page.tsx` - Post-login routing hub (middleware redirects before render)
- `app/(operator)/operator/dashboard/page.tsx` - Operator dashboard Phase 1 placeholder
- `app/(lcc)/lcc/dashboard/page.tsx` - LCC dashboard Phase 1 placeholder

## Decisions Made
- `getClaims()` is used instead of `getSession()` — getClaims() validates JWT signature server-side; getSession() trusts unverified cookie data and is a security risk. Supabase 2.99.1 confirmed to have getClaims() available.
- Route groups `(auth)`, `(operator)`, `(lcc)` chosen for layout isolation — no URL segment contribution, allows future layout.tsx files per role without affecting URLs.
- `/dashboard` is a stateless routing hub — middleware intercepts every authenticated request to /dashboard and redirects by role before the page component renders.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Verified getClaims() availability in supabase-js 2.99.1 before implementing (confirmed present — no fallback to getUser() needed).

## User Setup Required
None - no external service configuration required. Supabase project and env vars were set up in Plan 01.

## Next Phase Readiness
- Auth foundation complete: middleware guards all routes, login flow operational, role-based routing enforced
- Phase 2 (lead capture webhook) can be built assuming authenticated operator context
- Stub dashboards ready to receive real content in Phase 3 (LCC portal) and Phase 4 (operator dashboard)
- No blockers for Phase 2

---
*Phase: 01-foundation*
*Completed: 2026-03-15*

## Self-Check: PASSED

- middleware.ts: FOUND
- app/(auth)/login/page.tsx: FOUND
- app/(auth)/login/actions.ts: FOUND
- app/dashboard/page.tsx: FOUND
- app/(operator)/operator/dashboard/page.tsx: FOUND
- app/(lcc)/lcc/dashboard/page.tsx: FOUND
- .planning/phases/01-foundation/01-03-SUMMARY.md: FOUND
- Commit c7496d6: FOUND
- Commit 5dd060d: FOUND
