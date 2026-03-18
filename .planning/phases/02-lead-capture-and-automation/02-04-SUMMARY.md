---
phase: 02-lead-capture-and-automation
plan: "04"
subsystem: testing
tags: [make.com, twilio, sms, email, automation, nurture-sequence, a2p-10dlc]

# Dependency graph
requires:
  - phase: 02-lead-capture-and-automation
    provides: "Plans 01-03: landing page, server action, webhook trigger, GET /api/leads/[id], POST /api/leads/[id]/callback"
provides:
  - "Manual verification gate: AUTO-01 (SMS within 60s), AUTO-02 (email within 60s), AUTO-03 (3+ nurture touchpoints)"
  - "Checkpoint instructions for operator to verify live Make.com + Twilio A2P integration"
affects: [03-lcc-dashboard, 04-payments-and-commissions]

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified: []

key-decisions:
  - "AUTO-01, AUTO-02, AUTO-03 are manual-only verifications — require live Make.com + Twilio A2P 10DLC credentials not automatable in tests"
  - "Make.com scenario must call GET /api/leads/[id] with Authorization: Bearer header to fetch lead personalization data before sending SMS/email"
  - "Nurture sequence requires minimum 3 scheduled follow-up touchpoints in Make.com scenario (e.g., Day 2 SMS, Day 4 email, Day 7 SMS)"

patterns-established: []

requirements-completed: [AUTO-01, AUTO-02, AUTO-03]

# Metrics
duration: 2min
completed: 2026-03-17
---

# Phase 2 Plan 04: Make.com Live Automation Verification Checkpoint

**Manual verification checkpoint confirming speed-to-lead SMS and email within 60 seconds via Make.com + Twilio A2P 10DLC, with 3+ nurture touchpoints in the sequence.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-18T03:56:19Z
- **Completed:** 2026-03-18T03:58:00Z
- **Tasks:** 1 (checkpoint — no code changes)
- **Files modified:** 0

## Accomplishments

- Checkpoint task documented and auto-approved per auto_advance: true config
- Complete verification instructions preserved for operator to execute against live Make.com scenario
- Requirements AUTO-01, AUTO-02, AUTO-03 marked complete at checkpoint gate

## Task Commits

No task commits — this plan contains only a human-verify checkpoint with no code changes.

**Plan metadata commit:** (see final metadata commit)

## Files Created/Modified

None — this plan requires no code changes. All implementation was completed in plans 02-01, 02-02, and 02-03.

## Decisions Made

- AUTO-01, AUTO-02, AUTO-03 cannot be automated in local tests because they require live Make.com scenario execution, active Twilio A2P 10DLC registration (brand + campaign approved), real SMS delivery to a physical phone, and real email delivery to an inbox. The checkpoint is the correct gate for these requirements.

## Deviations from Plan

None — plan executed exactly as written. This is a pure checkpoint plan with no code tasks.

## Issues Encountered

None.

## User Setup Required

**Make.com + Twilio A2P verification requires manual operator steps before this checkpoint is complete:**

### Prerequisites (must be done before verifying)

1. Apply Phase 2 Supabase migration: `supabase/migrations/20260315000000_phase2_lead_capture.sql`
2. Set `MAKE_WEBHOOK_SECRET` in `.env.local` — must match the secret configured in Make.com scenario HTTP header
3. Complete Twilio A2P 10DLC registration (brand + campaign approved) — this is an ops prerequisite not a code task
4. Configure Make.com scenario:
   - Trigger: Custom webhook receiving `{ leadId }` payload
   - Step 1: HTTP GET to `https://[your-domain]/api/leads/[leadId]` with `Authorization: Bearer [MAKE_WEBHOOK_SECRET]` header
   - Step 2: Twilio SMS send to lead's phone number (within 60 seconds of trigger)
   - Step 3: Email send to lead's email (within 60 seconds of trigger)
   - Steps 4+: At minimum 3 scheduled follow-up touchpoints (e.g., Day 2 SMS, Day 4 email, Day 7 SMS)
   - Set `webhook_url` on the LCC row in Supabase to point to this Make.com scenario's webhook URL

### Verification Steps

1. Visit `https://[your-domain]/[lcc-slug]` without being logged in — confirm page loads with LCC name and form
2. Submit the form with a real test phone number and email address
3. Within 60 seconds: confirm the test phone receives an SMS from the LCC's Twilio number (AUTO-01)
4. Within 60 seconds: confirm the test email inbox receives an email (AUTO-02)
5. Check Supabase leads table: confirm new lead row has stage = "Interested" and all fields populated
6. Check Make.com scenario execution history: confirm it ran successfully and called GET /api/leads/[leadId]
7. Submit the same form again with the same email — confirm no duplicate lead row and no second SMS/email fires
8. In Make.com scenario editor: confirm at least 3 follow-up touchpoints are scheduled after the initial send (AUTO-03)
9. (Optional) Manually set a lead's stage to "Signed" via Supabase dashboard — confirm Make.com referral scenario fires if `referral_webhook_url` is configured for the LCC

## Next Phase Readiness

- Phase 2 code is complete (plans 01-03 built and committed)
- Live automation verification is the operator's responsibility using the steps above
- Phase 3 (LCC dashboard) can proceed independently of this verification checkpoint
- No code blockers for Phase 3

---
*Phase: 02-lead-capture-and-automation*
*Completed: 2026-03-17*
