---
phase: 02-lead-capture-and-automation
verified: 2026-03-17T00:00:00Z
status: gaps_found
score: 14/16 must-haves verified
re_verification: false
gaps:
  - truth: "PIPE-04: Operator can manually update a lead's pipeline stage"
    status: failed
    reason: "No operator UI for manual stage update exists in the codebase. The callback API only allows Contacted and Signed via Make.com. The schema supports any stage value, but no API route or UI exposes a privileged manual stage-update endpoint for the operator. VALIDATION.md itself classifies this as Phase 3 scope (dashboard UI), but the PLAN frontmatter for 02-03 claims it as a Phase 2 requirement and the SUMMARY marks it completed."
    artifacts:
      - path: "app/api/leads/[id]/callback/route.ts"
        issue: "Allows only Contacted and Signed via Make.com — does not serve as an operator manual update endpoint; no auth for operator JWT, only shared secret"
    missing:
      - "An API route or server action that allows an authenticated operator to set any valid stage value (Interested/Contacted/Qualified/Signed) on any lead — OR explicit deferral of PIPE-04 to Phase 3 with removal from Phase 2 requirement claims"

  - truth: "AUTO-01/02/03: Make.com SMS within 60s, email within 60s, and 3+ nurture touchpoints are live and confirmed"
    status: partial
    reason: "Plan 02-04 is a manual-only checkpoint that was auto-approved with no code changes and no recorded human confirmation. The SUMMARY states 'auto_advance: true config' caused auto-approval without actual SMS/email delivery being tested. The infrastructure code is complete and correct, but the live Make.com scenario configuration and Twilio A2P 10DLC registration are external prerequisites that have not been confirmed as completed."
    artifacts: []
    missing:
      - "Human sign-off confirming: (1) Make.com scenario configured with trigger + GET /api/leads/[id] HTTP call + Twilio SMS step + email step + 3+ nurture touchpoints; (2) Twilio A2P 10DLC brand and campaign approved; (3) Real form submission on live/staging URL receives SMS and email within 60 seconds"
human_verification:
  - test: "AUTO-01: SMS delivery within 60 seconds"
    expected: "After submitting the form at /[lcc-slug] with a real phone number, the phone receives an SMS within 60 seconds"
    why_human: "Requires live Make.com scenario, active Twilio A2P 10DLC registration, and physical phone to receive SMS"
  - test: "AUTO-02: Email delivery within 60 seconds"
    expected: "After form submission, the email address receives an email within 60 seconds"
    why_human: "Requires live Make.com scenario and a real inbox to verify delivery"
  - test: "AUTO-03: Nurture sequence has 3+ touchpoints"
    expected: "Make.com scenario editor shows at least 3 scheduled follow-up steps after initial contact (e.g., Day 2 SMS, Day 4 email, Day 7 SMS)"
    why_human: "Make.com scenario configuration cannot be inspected programmatically from the codebase"
  - test: "PIPE-04: Clarify scope boundary"
    expected: "Either a manual stage-update mechanism exists (Supabase dashboard or new API route) and is documented, OR PIPE-04 is explicitly deferred to Phase 3 with REQUIREMENTS.md traceability updated"
    why_human: "Requires product decision on whether Supabase dashboard access satisfies PIPE-04 for Phase 2 or whether a dedicated endpoint is required"
---

# Phase 2: Lead Capture and Automation — Verification Report

**Phase Goal:** Enable LCCs to capture leads via a public landing page and automate follow-up through Make.com, so every new lead receives timely outreach without manual intervention.
**Verified:** 2026-03-17
**Status:** gaps_found — 14/16 must-haves verified; 2 gaps blocking full sign-off
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Family submitting form creates lead in Interested stage in correct LCC pipeline | VERIFIED | `actions.ts` upserts with `stage: 'Interested'`; migration adds stage column with DEFAULT 'Interested' and CHECK constraint |
| 2 | Lead stores all required fields (family_name, email, phone, stage, consent_text, consent_timestamp, consent_ip, UTM fields, last_contacted_at, signed_at) | VERIFIED | Migration SQL adds all columns; `actions.ts` populates all fields including IP from `x-forwarded-for`/`x-real-ip` headers |
| 3 | Each LCC has unique webhook URLs (main + referral) stored in lccs row | VERIFIED | Migration adds `webhook_url`, `referral_webhook_url`, `learn_more_url` to `public.lccs` |
| 4 | Form cannot be submitted without TCPA checkbox checked | VERIFIED | `LeadCaptureForm.tsx` renders `<input type="checkbox" required name="tcpaConsent">` — HTML5 `required` enforces client-side block |
| 5 | Duplicate email+lcc_id submission silently upserts rather than creating a new lead | VERIFIED | Migration adds `UNIQUE(email, lcc_id)` constraint; `actions.ts` uses `.upsert({onConflict: 'email,lcc_id', ignoreDuplicates: false})` |
| 6 | GET /[lccSlug] returns 200 for known slug, 404 for unknown slug | VERIFIED | `page.tsx` calls `notFound()` when `!lcc`; real Playwright assertions in `landing-page.spec.ts` |
| 7 | Landing page is reachable without auth cookie | VERIFIED | `middleware.ts` regex `/^\/[a-z0-9][a-z0-9-]*(?:\/thank-you)?$/` returns `supabaseResponse` before auth check |
| 8 | Submitting valid form redirects to /[lccSlug]/thank-you | VERIFIED | `actions.ts` calls `redirect(\`/${lccSlug}/thank-you\`)` in all code paths (success and DB error) |
| 9 | Make.com webhook fires on new lead only; no webhook on duplicate upsert | VERIFIED | `actions.ts` uses `created_at < 5s` timing to detect new vs existing lead; webhook only fires when `isNewLead === true` |
| 10 | UTM params from query string are stored on lead record | VERIFIED | `page.tsx` extracts `searchParams.utm_*`; `LeadCaptureForm` passes as hidden inputs; `actions.ts` reads and upserts them |
| 11 | Make.com can fetch full lead details via GET /api/leads/[id] with Bearer token | VERIFIED | `app/api/leads/[id]/route.ts` authenticates via `MAKE_WEBHOOK_SECRET`, returns lead+LCC join; 401 without valid token |
| 12 | Make.com can update last_contacted_at and stage via POST /api/leads/[id]/callback | VERIFIED | `callback/route.ts` handles both fields; 12 Vitest integration tests passing per SUMMARY |
| 13 | Callback only allows Interested->Contacted stage transition; Qualified rejected | VERIFIED | `CALLBACK_ALLOWED_STAGES = ['Contacted', 'Signed']`; Qualified returns 422 with clear error message |
| 14 | When callback sets stage=Signed, signed_at is stamped and referral_webhook_url fires | VERIFIED | `callback/route.ts` sets `updates.signed_at = new Date().toISOString()` and fetches `lcc.referral_webhook_url` |
| 15 | PIPE-04: Operator can manually update a lead's pipeline stage | FAILED | No operator-facing API route or UI for manual stage update exists. Callback endpoint uses shared Make.com secret, not operator JWT. Schema supports any stage but no privileged update endpoint exists. VALIDATION.md classifies this as Phase 3. |
| 16 | AUTO-01/02/03: SMS within 60s, email within 60s, 3+ nurture touchpoints confirmed live | PARTIAL | Infrastructure code complete. Plan 02-04 checkpoint was auto-approved without recorded human confirmation of actual SMS/email delivery or Make.com scenario configuration. |

**Score:** 14/16 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/20260315000000_phase2_lead_capture.sql` | Schema additions to lccs and leads tables | VERIFIED | 64 lines; all required columns, UNIQUE constraint, RLS policy, performance indexes — all present |
| `app/[lccSlug]/page.tsx` | Public landing page with LCC intro and lead capture form | VERIFIED | 45 lines; async Server Component, LCC lookup, notFound() for unknown slug, UTM extraction, renders LeadCaptureForm |
| `app/[lccSlug]/LeadCaptureForm.tsx` | Client Component with TCPA checkbox and form fields | VERIFIED | 131 lines; useFormStatus, required TCPA checkbox, hidden UTM fields, phone pattern validation, submitLeadForm action wired |
| `app/[lccSlug]/actions.ts` | Server action: upsert lead, fire webhook, redirect | VERIFIED | 105 lines; 'use server', createAdminClient, consent capture, UTM storage, new-lead detection, webhook fire, redirect |
| `app/[lccSlug]/thank-you/page.tsx` | Thank-you page with LCC name and optional learn-more link | VERIFIED | 58 lines; async Server Component, LCC lookup, notFound(), confirmation message with lcc.name, conditional learn_more_url link |
| `middleware.ts` | Updated matcher excluding /[lccSlug] public routes | VERIFIED | isPublicLandingPage regex added before auth check; correctly placed after /login check |
| `app/api/leads/[id]/route.ts` | GET endpoint returning full lead + LCC data | VERIFIED | 47 lines; exports GET; MAKE_WEBHOOK_SECRET auth; lead+LCC join query; 401/404 handled |
| `app/api/leads/[id]/callback/route.ts` | POST endpoint for Make.com stage update and referral trigger | VERIFIED | 107 lines; exports POST; auth check; stage validation; last_contacted_at + stage updates; signed_at server-stamped; referral webhook fired |
| `.env.example` | Documents MAKE_WEBHOOK_SECRET env var | VERIFIED | Line 8-10: MAKE_WEBHOOK_SECRET documented with generation instructions |
| `tests/e2e/lead-capture/landing-page.spec.ts` | E2E tests for landing page behavior | VERIFIED | 4 real assertions (not stubs); 200/404 checks, LCC name display, no-auth-cookie access |
| `tests/e2e/lead-capture/form-submit.spec.ts` | E2E tests for form submission flow | VERIFIED | 5 real assertions; submit+redirect, thank-you content, required field validation, phone pattern |
| `tests/e2e/lead-capture/tcpa-consent.spec.ts` | E2E tests for TCPA enforcement | VERIFIED | 3 real assertions; checkbox visibility, consent text content, unchecked prevention |
| `tests/e2e/lead-capture/deduplication.spec.ts` | E2E tests for duplicate submission behavior | VERIFIED | 2 real assertions; double-submit reaches thank-you without error |
| `tests/e2e/lead-capture/webhook-fire.spec.ts` | E2E tests for webhook trigger behavior | VERIFIED | 2 assertions; E2E verifies form submission completes (webhook fires or gracefully fails server-side) |
| `tests/integration/lead-upsert.test.ts` | Integration tests for lead DB operations | VERIFIED | 6 real DB assertions against live Supabase; requires Phase 2 migration applied |
| `tests/integration/callback-api.test.ts` | Integration tests for Make.com callback API | VERIFIED | 12 Vitest tests with full vi.mock; covers GET 401/404/200, POST 401/422/404/200, Signed+referral |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `leads` table | `lccs` table | lcc_id foreign key | VERIFIED | Migration contains `REFERENCES public.lccs(id)` from Phase 1 foundation; Phase 2 adds new columns without breaking FK |
| `leads` UNIQUE constraint | deduplication behavior | `UNIQUE(email, lcc_id)` | VERIFIED | Line 45 of migration: `ADD CONSTRAINT IF NOT EXISTS leads_email_lcc_unique UNIQUE (email, lcc_id)` |
| `actions.ts` | supabase leads table | admin client upsert ON CONFLICT (email, lcc_id) DO UPDATE | VERIFIED | Lines 39-60 of `actions.ts`: `.upsert({...}, {onConflict: 'email,lcc_id', ignoreDuplicates: false})` |
| `actions.ts` | `lccs.webhook_url` | fetch() to LCC's webhook URL after upsert | VERIFIED | Lines 85-101 of `actions.ts`: `if (lcc?.webhook_url) { fetch(lcc.webhook_url, ...)` }` |
| `middleware.ts` | `app/[lccSlug]/page.tsx` | regex excludes lccSlug routes from auth | VERIFIED | Line 46: `/^\/[a-z0-9][a-z0-9-]*(?:\/thank-you)?$/` — correct placement before `!claims` check |
| `app/api/leads/[id]/route.ts` | Authorization header | Bearer token vs MAKE_WEBHOOK_SECRET | VERIFIED | Lines 9-12: `authHeader !== \`Bearer ${expectedToken}\`` returns 401 |
| `app/api/leads/[id]/callback/route.ts` | `lccs.referral_webhook_url` | fetch() when stage=Signed | VERIFIED | Lines 82-104: `if (stage === 'Signed') { ... fetch(lcc.referral_webhook_url, ...) }` |
| `app/api/leads/[id]/callback/route.ts` | `leads.signed_at` | UPDATE leads SET signed_at when stage=Signed | VERIFIED | Line 67: `updates.signed_at = new Date().toISOString()` |
| `LeadCaptureForm.tsx` | `actions.ts` (submitLeadForm) | form action prop | VERIFIED | Line 40: `<form action={submitLeadForm}>` — imported from `./actions` at line 3 |

---

### Requirements Coverage

All 17 requirement IDs declared across the four plans are cross-referenced below.

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| LEAD-01 | 02-01, 02-02 | Each LCC has a unique public landing page | SATISFIED | `app/[lccSlug]/page.tsx` routes on slug; `notFound()` for unknown slugs |
| LEAD-02 | 02-01, 02-02 | Family can submit name, email, phone, optional message | SATISFIED | `LeadCaptureForm.tsx` has all four fields; actions.ts reads and stores them |
| LEAD-03 | 02-01, 02-02 | TCPA consent with opt-in checkbox, consent text, timestamp stored | SATISFIED | `required` checkbox in form; consent_text, consent_timestamp, consent_ip stored in actions.ts |
| LEAD-04 | 02-01, 02-02 | Lead created in Interested stage instantly on submit | SATISFIED | actions.ts upserts with `stage: 'Interested'`; migration DEFAULT 'Interested' |
| LEAD-05 | 02-01, 02-02 | Make.com webhook triggered on form submit | SATISFIED | actions.ts fires webhook to `lccs.webhook_url` on new lead only |
| LEAD-06 | 02-01, 02-02 | Lead source / UTM captured and stored | SATISFIED | page.tsx extracts utm_* searchParams; actions.ts stores utm_source/medium/campaign/content |
| PIPE-01 | 02-01, 02-02 | Leads move through stages: Interested/Contacted/Qualified/Signed | SATISFIED | Migration adds `stage TEXT CHECK(...)` with all four values; callback API enforces transitions |
| PIPE-02 | 02-01, 02-03 | Stage updates when Make.com callback fires | SATISFIED | `callback/route.ts` updates stage column; 12 integration tests verify behavior |
| PIPE-03 | 02-01, 02-02 | Lead record stores family name, email, phone, source, stage, last contacted, created date | SATISFIED | Migration adds all columns; actions.ts populates them all |
| PIPE-04 | 02-03 | Operator can manually update a lead's pipeline stage | FAILED | No operator-facing endpoint or UI exists in Phase 2 code. VALIDATION.md scopes this to Phase 3 dashboard. Callback API uses Make.com shared secret, not operator JWT. |
| PIPE-05 | 02-01, 02-03 | Signed leads marked with sign-up date | SATISFIED | callback/route.ts stamps `signed_at = new Date().toISOString()` on stage=Signed |
| AUTO-01 | 02-03, 02-04 | SMS within 60 seconds of form submit | PARTIAL (NEEDS HUMAN) | Infrastructure wired (webhook fires, Make.com receives leadId, GET /api/leads/[id] returns data for personalization). Live SMS delivery not confirmed — Plan 02-04 auto-approved without human sign-off. |
| AUTO-02 | 02-03, 02-04 | Email within 60 seconds of form submit | PARTIAL (NEEDS HUMAN) | Same as AUTO-01 — infrastructure complete, live delivery not confirmed. |
| AUTO-03 | 02-03, 02-04 | 3+ nurture touchpoints in sequence | PARTIAL (NEEDS HUMAN) | Same as AUTO-01 — Make.com scenario configuration not verifiable from codebase. |
| AUTO-04 | 02-01, 02-03 | Make.com callbacks update last_contacted_at and stage | SATISFIED | callback/route.ts handles both `last_contacted_at` and `stage` fields; integration tests pass |
| AUTO-05 | 02-01, 02-03 | On Signed: referral SMS/email triggered | SATISFIED | callback/route.ts fires `referral_webhook_url` when stage=Signed; Vitest test verifies fetch is called |
| AUTO-06 | 02-01, 02-02, 02-03 | Per-LCC webhook URLs stored in DB (not shared) | SATISFIED | Migration adds webhook_url, referral_webhook_url to lccs table; each LCC row independently configurable |

**Orphaned requirements check:** All 17 IDs declared in plans are accounted for. No Phase 2 requirements in REQUIREMENTS.md are unaddressed by any plan declaration.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `app/[lccSlug]/actions.ts` | 72-74 | New-lead detection via created_at < 5s timing — minor race condition under concurrent load | Info | In high-concurrency scenarios, a new lead inserted just over 5 seconds after the upsert call starts could be miscategorized as an update, suppressing the webhook. Extremely unlikely at current scale. Documented in code comments. |
| `tests/integration/lead-upsert.test.ts` | 7 | `createAdminClient()` called at module level (outside beforeAll) — requires live Supabase connection at test collection time | Warning | Tests fail silently if migration not applied, rather than with a clear prerequisite error. Already documented in SUMMARY. No fix required but worth noting. |

No blockers found. No TODO/FIXME/placeholder patterns in any implementation file.

---

### Human Verification Required

#### 1. AUTO-01: SMS Delivery Within 60 Seconds

**Test:** Configure Make.com scenario with trigger webhook + HTTP GET to `/api/leads/[id]` with Bearer token + Twilio SMS step. Submit form at `https://[domain]/[lcc-slug]` with a real test phone number and email.
**Expected:** Test phone receives SMS within 60 seconds of submit. Make.com execution history shows successful run and GET call.
**Why human:** Requires live Make.com scenario, active Twilio A2P 10DLC brand + campaign approval, and a physical phone to verify SMS receipt.

#### 2. AUTO-02: Email Delivery Within 60 Seconds

**Test:** Same form submission as AUTO-01.
**Expected:** Test email inbox receives email within 60 seconds.
**Why human:** Requires live email send step in Make.com scenario and a real inbox.

#### 3. AUTO-03: 3+ Nurture Touchpoints in Make.com Scenario

**Test:** Open Make.com scenario editor for the LCC webhook scenario.
**Expected:** Scenario shows at minimum 3 scheduled follow-up steps after the initial send (e.g., Day 2 SMS, Day 4 email, Day 7 SMS).
**Why human:** Make.com scenario structure is external to the codebase and cannot be inspected programmatically.

#### 4. PIPE-04: Scope Boundary Decision

**Test:** Determine whether Supabase Dashboard direct SQL edit satisfies PIPE-04 for Phase 2, or whether a privileged API endpoint for operator manual stage updates is required before Phase 2 closes.
**Expected:** Either (A) PIPE-04 is explicitly deferred to Phase 3 and REQUIREMENTS.md traceability is updated, or (B) a new server action or API route is built that allows an authenticated operator (JWT with `app_metadata.role = 'operator'`) to set any valid stage on any lead.
**Why human:** Requires product decision on whether the current Phase 2 implementation satisfies the requirement intent.

---

### Gaps Summary

Two gaps prevent full Phase 2 sign-off:

**Gap 1: PIPE-04 (Operator manual stage update) — Scope mismatch**

The 02-03-PLAN.md `requirements` frontmatter claims PIPE-04, and 02-03-SUMMARY marks it completed. However, no code in Phase 2 provides an operator-authenticated endpoint for manual stage updates. The callback API uses a Make.com shared secret (not operator JWT) and deliberately restricts stages to Contacted and Signed. VALIDATION.md explicitly classifies PIPE-04 as "UI interaction in dashboard (Phase 3 scope)." Either the plan's requirements field overclaimed PIPE-04, or a minimal implementation is needed. This is a planning artifact mismatch that requires a product decision to resolve cleanly.

**Gap 2: AUTO-01/02/03 (Live automation) — Checkpoint auto-approved without human confirmation**

Plan 02-04 is a human-verify checkpoint that was auto-approved via `auto_advance: true` config without recorded evidence of actual Make.com + Twilio delivery. The code infrastructure is complete and correct — webhook fires, GET /api/leads/[id] returns personalization data, referral webhook triggers on Signed. The gap is exclusively in the external Make.com scenario configuration and Twilio A2P 10DLC prerequisites, which are operator responsibilities. These are genuine NEEDS_HUMAN items, not code failures.

The core Phase 2 goal — a family submitting a form creates a lead, stores consent + UTM, fires a webhook, and the Make.com integration loop is correctly wired — is achieved in code. The two gaps are a planning/scope mismatch (PIPE-04) and an unconfirmed live deployment checkpoint (AUTO-01/02/03).

---

### Commit Verification

All implementation commits confirmed in git history:

| Commit | Description |
|--------|-------------|
| `6c657cd` | feat(02-01): Phase 2 schema migration |
| `eeca1b6` | feat(02-01): Wave 0 test stubs (7 files) |
| `a70b865` | test(02-02): failing TDD tests for landing page, form, TCPA, dedup, webhook |
| `782c739` | feat(02-02): middleware update, landing page, thank-you page |
| `59e7c40` | feat(02-02): lead capture server action |
| `4506555` | test(02-03): failing tests for GET/POST callback API |
| `7bf8db2` | feat(02-03): GET /api/leads/[id] and POST /api/leads/[id]/callback |

---

_Verified: 2026-03-17_
_Verifier: Claude (gsd-verifier)_
