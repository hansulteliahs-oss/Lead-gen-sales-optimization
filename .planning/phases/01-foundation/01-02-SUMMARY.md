---
phase: 01-foundation
plan: 02
subsystem: database
tags: [supabase, postgres, rls, jwt, sql, multi-tenant]

# Dependency graph
requires:
  - phase: 01-01
    provides: Next.js project scaffold and Supabase client utilities (browser/server/admin)
provides:
  - Foundation schema migration SQL (lccs, profiles, leads tables with RLS)
  - Custom Access Token Hook injecting role and lcc_id into JWT app_metadata
  - Seed SQL for test users (operator, lcc1, lcc2) and 6 fake leads (3 per LCC)
affects: [01-03, 01-04, 02-foundation, all-phases]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "RLS tenant isolation: leads SELECT and INSERT policies compare lcc_id to ((SELECT auth.jwt()) -> 'app_metadata' ->> 'lcc_id')::uuid"
    - "Custom Access Token Hook reads profiles table at JWT issuance to inject role and lcc_id into app_metadata"
    - "Seed uses fixed UUIDs for idempotent reruns with ON CONFLICT DO NOTHING"

key-files:
  created:
    - supabase/migrations/20260314000000_foundation.sql
    - supabase/seed.sql
  modified: []

key-decisions:
  - "INSERT policy uses WITH CHECK (not USING) to enforce write-side tenant isolation"
  - "raw_app_meta_data in auth.users seed rows intentionally omits role/lcc_id — injection handled by custom_access_token_hook at JWT issuance time"
  - "Migration must be applied manually in Supabase Dashboard SQL editor (MCP tool not available to executor)"
  - "Hook requires manual registration in Supabase Dashboard > Auth > Hooks after migration runs"

patterns-established:
  - "Tenant isolation: all multi-tenant queries reference app_metadata.lcc_id from JWT, never a session variable"
  - "Operator users have null lcc_id in profiles — hook skips lcc_id injection for operators"

requirements-completed: [AUTH-05, AUTH-06]

# Metrics
duration: 3min
completed: 2026-03-15
---

# Phase 1 Plan 02: Foundation Schema Migration + Seed Summary

**PostgreSQL RLS multi-tenant isolation with Custom Access Token Hook injecting lcc_id into JWT app_metadata, plus idempotent seed for cross-tenant isolation testing**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-15T00:34:12Z
- **Completed:** 2026-03-15T00:37:00Z
- **Tasks:** 2 of 2 executed
- **Files modified:** 2

## Accomplishments
- Foundation schema SQL written: `lccs`, `profiles`, and `leads` tables with proper foreign keys
- RLS enabled on all three tables with tenant-scoped SELECT and INSERT policies on `leads`
- Custom Access Token Hook defined — reads `profiles` table at JWT issuance, injects `role` and `lcc_id` into `app_metadata`
- `supabase_auth_admin` granted execute on hook and select on profiles (required for hook to fire)
- Seed creates operator user, two LCC users, two LCC tenant records, and 6 fake leads (3 per LCC) with fixed UUIDs for idempotent reruns

## Task Commits

Each task was committed atomically:

1. **Task 1: Write foundation migration SQL (schema + RLS + hook)** - `a7c674c` (feat)
2. **Task 2: Write seed SQL (test users + fake leads for RLS verification)** - `09563ca` (feat)

**Plan metadata:** (docs commit — see final commit)

## Files Created/Modified
- `supabase/migrations/20260314000000_foundation.sql` - Schema DDL for lccs/profiles/leads, RLS policies, custom_access_token_hook function, supabase_auth_admin grants
- `supabase/seed.sql` - Test users (operator, lcc1, lcc2), LCC tenant records, 6 fake leads for AUTH-05 cross-tenant isolation testing

## Decisions Made
- INSERT policy on `leads` uses `WITH CHECK` (not `USING`) — this is the correct clause for write-side enforcement; `USING` only applies to SELECT/UPDATE/DELETE
- `raw_app_meta_data` in seed rows intentionally does NOT include `role` or `lcc_id` — the hook reads from `profiles` at JWT issuance time, so app_metadata stays clean in the users table
- Performance indexes added on `leads.lcc_id` and `profiles.lcc_id` — both are hot paths for RLS policy evaluation

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

### Manual Application Required — Not an Auth Gate

The plan states: "Apply it to the cloud Supabase project using the Supabase MCP tool." The MCP tool is not available in this execution context (sub-agent executor).

**Migration must be applied manually:**
1. Open Supabase Dashboard > SQL Editor: https://supabase.com/dashboard/project/tcplbkfoqmxrkeicopxj/sql/new
2. Paste and run `supabase/migrations/20260314000000_foundation.sql`
3. Then paste and run `supabase/seed.sql`
4. Then manually register the hook: Supabase Dashboard > Authentication > Hooks > Custom Access Token Hook > select `public.custom_access_token_hook`

**Verification after applying:**
- Supabase Dashboard > Table Editor shows `lccs`, `profiles`, `leads` tables
- Each table shows RLS badge as "Enabled"
- Authentication > Users shows 3 test users
- Log in as `lcc1@test.com` and query `leads` — should only see 3 rows (LCC 1 leads)
- Log in as `lcc2@test.com` and query `leads` — should only see 3 rows (LCC 2 leads, different ones)

## User Setup Required

**Apply migration and seed SQL to Supabase cloud project:**

1. Open SQL Editor: https://supabase.com/dashboard/project/tcplbkfoqmxrkeicopxj/sql/new
2. Copy and run: `supabase/migrations/20260314000000_foundation.sql`
3. Copy and run: `supabase/seed.sql`
4. Register Custom Access Token Hook:
   - Go to Authentication > Hooks
   - Enable "Custom Access Token" hook
   - Select function: `public.custom_access_token_hook`
   - Save

## Next Phase Readiness
- Schema is defined and RLS policies are written — ready for Plan 03 (auth UI/flows)
- Seed data enables immediate AUTH-05 cross-tenant isolation testing once migration is applied
- Custom Access Token Hook is defined but requires manual registration in Dashboard before JWT app_metadata injection will work
- Plan 03 auth flows depend on profiles table existing and hook being registered

---
*Phase: 01-foundation*
*Completed: 2026-03-15*
