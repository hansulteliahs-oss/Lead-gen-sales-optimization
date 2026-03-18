---
phase: 02-lead-capture-and-automation
plan: "01"
subsystem: schema-and-test-stubs
tags: [schema, migration, supabase, test-stubs, playwright, vitest, wave-0]
dependency_graph:
  requires: [01-04-SUMMARY.md]
  provides: [supabase/migrations/20260315000000_phase2_lead_capture.sql, Wave 0 test stubs]
  affects: [02-02-PLAN.md, 02-03-PLAN.md]
tech_stack:
  added: []
  patterns: [ALTER TABLE IF NOT EXISTS, ON CONFLICT deduplication, test.skip Wave 0 stubs]
key_files:
  created:
    - supabase/migrations/20260315000000_phase2_lead_capture.sql
    - tests/e2e/lead-capture/landing-page.spec.ts
    - tests/e2e/lead-capture/form-submit.spec.ts
    - tests/e2e/lead-capture/tcpa-consent.spec.ts
    - tests/e2e/lead-capture/deduplication.spec.ts
    - tests/e2e/lead-capture/webhook-fire.spec.ts
    - tests/integration/lead-upsert.test.ts
    - tests/integration/callback-api.test.ts
  modified: []
decisions:
  - "Playwright 1.58.2 lacks test.todo() inside describe blocks — used test.skip(true, reason) as Wave 0 stub pattern instead"
metrics:
  duration: "2 minutes 24 seconds"
  completed_date: "2026-03-17"
  tasks_completed: 2
  files_created: 8
  files_modified: 0
---

# Phase 2 Plan 01: Schema Extension and Wave 0 Test Stubs Summary

**One-liner:** Phase 2 schema migration extending lccs/leads tables with all lead capture columns plus UNIQUE(email, lcc_id) deduplication, plus 7 Wave 0 test stub files covering all lead capture and automation requirements.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Write Phase 2 schema migration SQL | 6c657cd | supabase/migrations/20260315000000_phase2_lead_capture.sql |
| 2 | Create Wave 0 test stubs (7 files) | eeca1b6 | tests/e2e/lead-capture/*.spec.ts, tests/integration/*.test.ts |

## What Was Built

### Task 1: Phase 2 Schema Migration

File: `supabase/migrations/20260315000000_phase2_lead_capture.sql`

- **lccs table additions:** `webhook_url`, `referral_webhook_url`, `learn_more_url` (per-LCC Make.com config and thank-you page link)
- **leads table additions:** `phone`, `message`, `stage` (with CHECK constraint: Interested/Contacted/Qualified/Signed, default Interested), `consent_text`, `consent_timestamp`, `consent_ip`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `last_contacted_at`, `signed_at`
- **Deduplication constraint:** `UNIQUE(email, lcc_id)` via `ADD CONSTRAINT IF NOT EXISTS leads_email_lcc_unique` — enables ON CONFLICT DO UPDATE silent upsert
- **RLS policy:** `leads_select_operator` — SELECT for authenticated users with `app_metadata.role = operator` (enables future dashboard reads)
- **Performance indexes:** `leads_stage_idx` on `(stage)`, `leads_lcc_stage_idx` on `(lcc_id, stage)`

All statements use `IF NOT EXISTS` or `ADD COLUMN IF NOT EXISTS` for idempotent re-application safety.

### Task 2: Wave 0 Test Stubs (7 files)

E2E (Playwright — 16 tests skipped):
- `tests/e2e/lead-capture/landing-page.spec.ts` — LEAD-01: 4 tests for slug routing and public access
- `tests/e2e/lead-capture/form-submit.spec.ts` — LEAD-02/04: 5 tests for form submission and thank-you page
- `tests/e2e/lead-capture/tcpa-consent.spec.ts` — LEAD-03: 3 tests for consent checkbox enforcement
- `tests/e2e/lead-capture/deduplication.spec.ts` — LEAD-02 dup: 2 tests for silent upsert behavior
- `tests/e2e/lead-capture/webhook-fire.spec.ts` — LEAD-05: 2 tests for Make.com webhook trigger

Integration (Vitest — 14 todos):
- `tests/integration/lead-upsert.test.ts` — LEAD-03/06, PIPE-01/03, AUTO-06: 6 todos for DB upsert behavior
- `tests/integration/callback-api.test.ts` — PIPE-02/05, AUTO-04/05: 8 todos for Make.com callback API

## Verification Results

- Playwright: `16 skipped` — all test files parse and run without crash
- Vitest: `14 todo` — all integration stubs recognized without crash
- No existing tests broken (auth E2E suite unaffected)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Replaced test.todo() with test.skip() in Playwright E2E files**
- **Found during:** Task 2 verification
- **Issue:** Playwright 1.58.2 does not expose `test.todo()` as a callable function inside `test.describe()` blocks — calling it throws `TypeError: _test.test.todo is not a function`
- **Fix:** Replaced all `test.todo('description')` stubs with `test('description', async () => { test.skip(true, 'Wave 0 stub — not yet implemented') })` — semantically equivalent (tests are skipped, not absent) and correctly recognized by Playwright's reporter
- **Files modified:** All 5 E2E spec files under `tests/e2e/lead-capture/`
- **Commit:** eeca1b6

## Self-Check: PASSED

All 8 created files found on disk. Both task commits (6c657cd, eeca1b6) confirmed in git log.
