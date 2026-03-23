---
phase: 03-lcc-dashboard
plan: "04"
subsystem: api
tags: [nextjs, supabase, jwt, route-handler, operator, pipeline]

# Dependency graph
requires:
  - phase: 03-lcc-dashboard-01
    provides: Wave 0 test stubs for PIPE-04 in stage-update.test.ts
  - phase: 01-foundation
    provides: createAdminClient, createServerClient SSR pattern, JWT getClaims() pattern
provides:
  - PATCH /api/leads/[id]/stage — operator-only stage update endpoint
  - JWT role-guard pattern for route handlers (not Bearer token)
  - signed_at auto-timestamp when stage transitions to Signed
affects: [04-operator-ui, phase-04-commission-tracker]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Route handler JWT auth: createServerClient with request.cookies.getAll() (not next/headers cookies())"
    - "Admin client for operator cross-tenant writes — bypasses RLS"
    - "Stage validation with as const tuple + type guard before DB write"

key-files:
  created:
    - app/api/leads/[id]/stage/route.ts
  modified:
    - tests/integration/stage-update.test.ts

key-decisions:
  - "Tests updated from Wave 0 stubs: mock chain extended to .select().single() and assertion changed to body.id (returns updated lead record, not {success:true})"
  - "createServerClient from @supabase/ssr with request.cookies.getAll() — server.ts helper uses next/headers which is unavailable in route handlers"
  - "createAdminClient() for the DB update — bypasses RLS so operator can update leads belonging to any LCC"

patterns-established:
  - "JWT route guard pattern: createServerClient(url, publishable_key, {cookies:{getAll:()=>request.cookies.getAll(), setAll:()=>{}}}) then getClaims()"

requirements-completed: [PIPE-04]

# Metrics
duration: 7min
completed: 2026-03-22
---

# Phase 3 Plan 04: Stage Update API Summary

**PATCH /api/leads/[id]/stage operator endpoint with JWT role guard, stage validation, and signed_at auto-timestamp using createServerClient + createAdminClient dual-client pattern**

## Performance

- **Duration:** ~7 min
- **Started:** 2026-03-23T02:16:10Z
- **Completed:** 2026-03-23T02:23:00Z
- **Tasks:** 1 (TDD: RED + GREEN)
- **Files modified:** 2

## Accomplishments
- Created `app/api/leads/[id]/stage/route.ts` exporting PATCH handler (62 lines)
- JWT role guard via `getClaims()` — returns 403 for any caller whose role is not 'operator'
- Stage validation against `VALID_STAGES` constant — returns 422 for invalid values
- `signed_at` auto-set to UTC ISO timestamp when stage transitions to Signed; not touched otherwise
- Admin client bypasses RLS enabling operator to update leads across all LCCs
- All 5 Vitest tests pass, `tsc --noEmit` clean

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Add failing tests** - `2d42408` (test)
2. **Task 1 GREEN: Implement route** - `c9d8353` (feat)

_Note: TDD tasks have two commits (test → feat)_

## Files Created/Modified
- `app/api/leads/[id]/stage/route.ts` - PATCH handler for operator stage updates
- `tests/integration/stage-update.test.ts` - Unskipped Wave 0 stubs; updated mock chain for .select().single()

## Decisions Made
- Wave 0 test stubs expected `body.success === true` but plan spec says "returns updated lead record" — updated tests to assert `body.id` instead, matching the plan's specification. The mock chain was also extended to include `.select().single()` to match the implementation's query chain.
- Used `createServerClient` directly from `@supabase/ssr` with `request.cookies.getAll()` rather than the `utils/supabase/server.ts` helper, because `next/headers cookies()` is not available in route handlers.

## Deviations from Plan

None - plan executed exactly as written. The test update (removing `it.skip`, updating mock chain) was the planned Wave 0 activation step, not a deviation.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- PIPE-04 complete — operator stage update API is live
- Phase 4 operator UI can call `PATCH /api/leads/[id]/stage` with a valid operator session
- The endpoint returns the full updated lead record, suitable for optimistic UI updates

---
*Phase: 03-lcc-dashboard*
*Completed: 2026-03-22*
