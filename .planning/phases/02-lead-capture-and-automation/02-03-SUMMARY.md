---
phase: 02-lead-capture-and-automation
plan: 03
subsystem: api
tags: [make.com, webhook, nextjs, supabase, bearer-token, referral]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: createAdminClient() utility, Supabase schema with leads and lccs tables
  - phase: 02-lead-capture-and-automation
    plan: 01
    provides: leads schema with stage, signed_at, last_contacted_at, lcc.referral_webhook_url columns
provides:
  - GET /api/leads/[id] — full lead + LCC data for Make.com message personalization
  - POST /api/leads/[id]/callback — stage update, last_contacted_at update, signed_at stamp, referral webhook trigger
affects:
  - 02-lead-capture-and-automation (Make.com automation scenarios require these endpoints)
  - 03-operator-dashboard (lead stage display depends on callback updating stage correctly)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "MAKE_WEBHOOK_SECRET Bearer token auth pattern for shared-secret API routes"
    - "TDD red-green with vi.mock for Supabase admin client in route handler tests"
    - "Chained vi.fn().mockReturnValueOnce() for multi-call Supabase mock sequences"

key-files:
  created:
    - app/api/leads/[id]/route.ts
    - app/api/leads/[id]/callback/route.ts
  modified:
    - .env.example
    - tests/integration/callback-api.test.ts

key-decisions:
  - "CALLBACK_ALLOWED_STAGES = ['Contacted', 'Signed'] — Qualified is operator-only (Phase 3+)"
  - "Referral webhook fires on Signed via fire-and-forget fetch with 10s timeout; failure is logged not fatal"
  - "signed_at is set server-side via new Date().toISOString() when stage=Signed callback arrives"
  - "Empty body (no stage, no last_contacted_at) returns 422 rather than silently succeeding"

patterns-established:
  - "Bearer token auth: check Authorization header against MAKE_WEBHOOK_SECRET env var, return 401 if mismatch"
  - "Admin route handler structure: auth check → validate body → fetch existing → build updates → DB write → side effects"

requirements-completed: [PIPE-02, PIPE-04, PIPE-05, AUTO-01, AUTO-02, AUTO-03, AUTO-04, AUTO-05, AUTO-06]

# Metrics
duration: 3min
completed: 2026-03-17
---

# Phase 2 Plan 03: Make.com Lead Fetch and Callback Endpoints Summary

**Two authenticated Make.com API routes: GET /api/leads/[id] returning full lead+LCC data for message personalization, and POST /api/leads/[id]/callback updating stage/last_contacted_at with referral webhook trigger on Signed.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-18T03:48:38Z
- **Completed:** 2026-03-18T03:50:10Z
- **Tasks:** 2 (TDD: 2 RED commits + 1 GREEN commit covering both tasks)
- **Files modified:** 4

## Accomplishments
- GET /api/leads/[id] authenticates via MAKE_WEBHOOK_SECRET Bearer token, returns full lead + nested LCC (name, slug) for personalization
- POST /api/leads/[id]/callback handles stage transitions (Interested→Contacted, any→Signed), last_contacted_at updates, stamps signed_at, and fires referral webhook
- Stage=Qualified and other disallowed stages rejected with 422; auth failures return 401; missing body returns 422
- 12 Vitest integration tests covering all behaviors, all passing

## Task Commits

Each task was committed atomically:

1. **Task 1+2 RED: Failing tests** - `4506555` (test)
2. **Task 1+2 GREEN: Route implementations + .env.example** - `7bf8db2` (feat)

_Note: Tests for both tasks written together in RED phase since they share the same test file. Implementation committed together in GREEN phase._

## Files Created/Modified
- `app/api/leads/[id]/route.ts` — GET handler authenticating via Bearer token, fetching lead+LCC from Supabase
- `app/api/leads/[id]/callback/route.ts` — POST handler for stage updates, last_contacted_at, signed_at stamp, referral webhook
- `tests/integration/callback-api.test.ts` — 12 integration tests (GET auth, GET 404/200, POST auth, POST 422 cases, POST 200 updates, POST Signed with referral)
- `.env.example` — Documents MAKE_WEBHOOK_SECRET with generation instructions

## Decisions Made
- `CALLBACK_ALLOWED_STAGES = ['Contacted', 'Signed']` — plan clarifies Signed IS allowed via callback (Make.com triggers it when family converts for AUTO-05); Qualified is operator-only
- Referral webhook is fire-and-forget with 10s timeout — webhook failure is logged but does not fail the 200 response
- `signed_at` is server-stamped (not caller-supplied) to prevent spoofing

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
Add `MAKE_WEBHOOK_SECRET` to `.env.local` (generate with `openssl rand -hex 32`) and configure the same value in Make.com scenario HTTP headers as `Authorization: Bearer <secret>`.

## Next Phase Readiness
- Make.com integration loop is complete: webhook trigger (02-01) → lead fetch (02-03 GET) → message send → callback update (02-03 POST)
- Phase 3 operator dashboard can display lead pipeline stage knowing callbacks correctly update it
- No blockers

---
*Phase: 02-lead-capture-and-automation*
*Completed: 2026-03-17*
