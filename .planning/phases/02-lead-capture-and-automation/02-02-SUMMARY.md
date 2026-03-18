---
phase: 02-lead-capture-and-automation
plan: 02
subsystem: ui, api, database
tags: [nextjs, supabase, tailwind, server-actions, tcpa, make.com, utm]

# Dependency graph
requires:
  - phase: 02-01
    provides: Phase 2 DB migration SQL (leads + lccs schema extension with TCPA, UTM, webhook columns)
  - phase: 01-foundation
    provides: middleware.ts auth gate pattern, createAdminClient(), server action pattern from login/actions.ts

provides:
  - Public /[lccSlug] landing page with LCC intro section and lead capture form (no auth required)
  - TCPA consent checkbox (required, blocks submission when unchecked) with LCC-name-interpolated consent text
  - app/[lccSlug]/actions.ts server action: upsert lead to Supabase, detect new vs. duplicate, fire Make.com webhook for new leads only
  - app/[lccSlug]/thank-you/page.tsx: confirmation page with optional per-LCC learn-more link
  - middleware.ts updated: /[slug] and /[slug]/thank-you routes pass through auth gate without redirect

affects:
  - 02-03 (Make.com callback API — consumes leads table rows created here)
  - 03-lcc-dashboard (reads pipeline from leads table written here)
  - 04-operator (may surface LCC webhook_url and learn_more_url in admin UI)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server action with FormData and redirect — submitLeadForm follows login/actions.ts pattern exactly
    - Upsert deduplication: ON CONFLICT (email, lcc_id) DO UPDATE with created_at timing to detect new vs. existing lead
    - Public route bypass in middleware via regex before auth check — /^\/[a-z0-9][a-z0-9-]*(?:\/thank-you)?$/
    - Client Component (LeadCaptureForm) with useFormStatus for pending state, wrapping Server Action form
    - TCPA consent text constructed server-side in actions.ts to match client-rendered text exactly
    - Webhook fire after lead commit — graceful failure (log + continue) so family always reaches thank-you

key-files:
  created:
    - app/[lccSlug]/page.tsx
    - app/[lccSlug]/LeadCaptureForm.tsx
    - app/[lccSlug]/thank-you/page.tsx
    - app/[lccSlug]/actions.ts
  modified:
    - middleware.ts
    - tests/e2e/lead-capture/landing-page.spec.ts
    - tests/e2e/lead-capture/form-submit.spec.ts
    - tests/e2e/lead-capture/tcpa-consent.spec.ts
    - tests/e2e/lead-capture/deduplication.spec.ts
    - tests/e2e/lead-capture/webhook-fire.spec.ts
    - tests/integration/lead-upsert.test.ts

key-decisions:
  - "Middleware public route detection: regex /^/[a-z0-9][a-z0-9-]*(?:/thank-you)?$/ applied after /login check but before !claims auth redirect — safe because /dashboard, /lcc/*, /operator/* don't match lowercase-slug-only pattern"
  - "New-lead detection: created_at < 5 seconds approach chosen over pre-upsert query to avoid extra DB round-trip; minor race condition accepted as trade-off"
  - "Webhook graceful failure: lead is always committed first; if Make.com call fails, family still redirected to thank-you; no retry logic (operator re-triggers manually)"
  - "UTM params passed as hidden form fields in FormData (not URL-forwarded to server action) — server-reads searchParams at page render, passes to LeadCaptureForm as props, LeadCaptureForm renders as hidden inputs"

patterns-established:
  - "Public Server Action pattern: 'use server' file, createAdminClient(), headers() for IP, redirect() to thank-you"
  - "Client form with server action: Client Component handles UX (checkbox state, submit pending), Server Component handles data (LCC lookup, UTM extraction)"
  - "LeadCaptureForm hidden fields: lccId, lccSlug, lccName, utmSource, utmMedium, utmCampaign, utmContent all passed as <input type='hidden'> within the form"

requirements-completed: [LEAD-01, LEAD-02, LEAD-03, LEAD-04, LEAD-05, LEAD-06, PIPE-01, PIPE-03, AUTO-06]

# Metrics
duration: 5min
completed: 2026-03-18
---

# Phase 2 Plan 02: Lead Capture Landing Page and Server Action Summary

**Public /[lccSlug] landing page with TCPA form, Supabase upsert deduplication, and Make.com webhook trigger on new lead creation only**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-18T03:48:54Z
- **Completed:** 2026-03-18T03:53:35Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments

- Built public landing page at `/[lccSlug]` — fetches LCC by slug, calls notFound() for unknown slugs, renders LCC name + TCPA form; no auth cookie required
- Implemented `submitLeadForm` server action with Supabase upsert (ON CONFLICT email,lcc_id), consent fields, UTM capture, new-lead detection, and Make.com webhook fire with graceful error handling
- Updated middleware to bypass auth gate for `/[slug]` and `/[slug]/thank-you` routes using regex check before the `!claims` redirect
- Replaced all Wave 0 test stubs with real assertions across 5 E2E spec files and the lead-upsert integration test

## Task Commits

Each task was committed atomically:

1. **TDD RED (both tasks)** - `a70b865` (test) — failing tests: landing-page, form-submit, tcpa-consent, deduplication, webhook-fire specs + lead-upsert integration
2. **Task 1: Middleware + landing page + thank-you page** - `782c739` (feat) — middleware.ts updated, page.tsx, LeadCaptureForm.tsx, thank-you/page.tsx created
3. **Task 2: Lead capture server action** - `59e7c40` (feat) — actions.ts with upsert, webhook trigger, consent storage, UTM capture

## Files Created/Modified

- `app/[lccSlug]/page.tsx` - Async Server Component: LCC lookup by slug, notFound() for unknown, renders LCC name heading + LeadCaptureForm
- `app/[lccSlug]/LeadCaptureForm.tsx` - Client Component: form fields (name, email, phone, message), TCPA checkbox (required), UTM hidden fields, useFormStatus pending state, amber Tailwind styling
- `app/[lccSlug]/thank-you/page.tsx` - Async Server Component: confirmation message with LCC name, optional learn-more link when lccs.learn_more_url is set
- `app/[lccSlug]/actions.ts` - Server action: upsert lead, store TCPA consent + IP, store UTM params, detect new lead via created_at timing, fire webhook to lccs.webhook_url, always redirect to thank-you
- `middleware.ts` - Added isPublicLandingPage regex check before auth gate
- `tests/e2e/lead-capture/*.spec.ts` (5 files) - Replaced test.skip stubs with real Playwright assertions
- `tests/integration/lead-upsert.test.ts` - Real DB assertions for upsert, consent fields, UTM, dedup, LCC webhook columns

## Decisions Made

- **Middleware placement:** Public route check placed AFTER `/login` check but BEFORE `!claims` redirect. The regex `/^\/[a-z0-9][a-z0-9-]*(?:\/thank-you)?$/` matches lowercase-slug-only paths and does not match `/dashboard`, `/lcc/*`, `/operator/*`.
- **New-lead detection via created_at:** Upsert preserves original created_at on conflict. If returned created_at is < 5 seconds old, it's a new insert. Avoids a pre-upsert query round-trip; minor race condition under extreme concurrent load is accepted.
- **Webhook graceful failure:** Lead is committed to DB before webhook fires. Webhook errors are logged server-side; family always redirected to thank-you regardless of webhook outcome.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

- Integration test `lead-upsert.test.ts` fails with "No LCC found in DB" because the Phase 2 migration SQL has not been applied in Supabase Dashboard yet. This is the expected `user_setup` gate documented in the plan. Tests will pass once migration is applied and seed data exists.

## User Setup Required

The following manual steps are required before the landing page and server action work end-to-end:

1. **Apply Phase 2 migration SQL** — Supabase Dashboard → SQL Editor → paste and run `supabase/migrations/20260315000000_phase2_lead_capture.sql`
2. **Set MAKE_WEBHOOK_SECRET** — Create a secure random string (e.g. `openssl rand -hex 32`), add to `.env.local` and `.env.example`
3. **(Optional) Set webhook_url on an LCC row** — needed to test actual webhook firing; can set to a Make.com webhook URL or a test service like webhook.site

## Next Phase Readiness

- Plan 02-03 (Make.com lead fetch + callback endpoints) can proceed — the leads table and schema are defined
- Phase 2 landing page, form, and server action are complete and TypeScript-clean
- E2E tests will pass once the dev server is running and the Phase 2 migration is applied

---
*Phase: 02-lead-capture-and-automation*
*Completed: 2026-03-18*
