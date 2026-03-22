---
status: complete
phase: 02-lead-capture-and-automation
source: 02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md, 02-04-SUMMARY.md
started: 2026-03-19T00:00:00Z
updated: 2026-03-22T21:20:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running dev server. Start fresh with `npm run dev`. Server boots without errors and the app is reachable (no crash on startup, no missing env var panics).
result: pass

### 2. Landing Page Loads for Valid Slug
expected: Navigate to `/[your-lcc-slug]` (a real LCC slug from your DB). Page renders with the LCC's name as the heading and a lead capture form below it. No login required — no redirect to /login.
result: pass

### 3. Landing Page Returns 404 for Unknown Slug
expected: Navigate to `/totally-fake-slug-xyz`. Page shows a 404 / Not Found response (Next.js default 404 or custom). No server error.
result: pass

### 4. Form Accessible Without Login
expected: Open an incognito/private browser window (no cookies). Navigate to `/[your-lcc-slug]`. Page loads normally — no redirect to /login, form is visible and interactive.
result: pass

### 5. TCPA Checkbox Required
expected: Fill in name, email, and phone but leave the TCPA consent checkbox unchecked. Click submit. The form does NOT submit — browser shows a validation error on the checkbox field. No redirect happens.
result: pass

### 6. Form Submission Redirects to Thank-You Page
expected: Fill in all required fields (name, email, phone) and check the TCPA checkbox. Submit the form. You are redirected to `/[your-lcc-slug]/thank-you` and the page shows a confirmation message mentioning the LCC's name.
result: pass

### 7. Duplicate Submission Reaches Thank-You Without Error
expected: Submit the form a second time with the exact same email address and same LCC slug. You still land on the thank-you page. No error is shown. Checking Supabase leads table: only one row exists for that email + LCC combination (not two).
result: pass

### 8. GET /api/leads/[id] — Unauthorized Without Token
expected: Make a GET request to `/api/leads/[some-lead-id]` with no Authorization header (e.g., via browser or curl). Response is HTTP 401 with `{"error":"Unauthorized"}`. No lead data is returned.
result: pass

### 9. GET /api/leads/[id] — Returns Lead + LCC Data With Valid Token
expected: Make a GET request to `/api/leads/[real-lead-id]` with header `Authorization: Bearer [your MAKE_WEBHOOK_SECRET]`. Response is HTTP 200 and body contains the lead's family_name, email, phone, stage, and a nested `lcc` object with the LCC's name and slug.
result: pass

### 10. POST Callback — Updates Stage to Contacted
expected: POST to `/api/leads/[real-lead-id]/callback` with header `Authorization: Bearer [your MAKE_WEBHOOK_SECRET]` and body `{"stage":"Contacted","last_contacted_at":"2026-03-22T00:00:00Z"}`. Response is HTTP 200 `{"success":true,...}`. Checking Supabase: lead's stage is now "Contacted" and last_contacted_at is updated.
result: pass

### 11. POST Callback — Rejects Qualified Stage
expected: POST to `/api/leads/[real-lead-id]/callback` with valid auth and body `{"stage":"Qualified"}`. Response is HTTP 422 with an error message stating Qualified is not allowed via callback.
result: pass

### 12. POST Callback — Signed Stamps signed_at
expected: POST to `/api/leads/[real-lead-id]/callback` with valid auth and body `{"stage":"Signed"}`. Response is HTTP 200. Checking Supabase: lead's stage is "Signed" and signed_at is now populated with a timestamp.
result: pass

### 13. Make.com Live Automation (AUTO-01/02/03)
expected: SKIP — Make.com scenario and Twilio A2P 10DLC setup deferred (Gap 2). Will verify after operator configures Make.com and Twilio.
result: skipped
reason: Deferred per Gap 2 resolution — requires live Make.com scenario and Twilio A2P 10DLC approval. User will configure Make.com separately.

## Summary

total: 13
passed: 12
issues: 0
pending: 0
skipped: 1

## Gaps

[none]
