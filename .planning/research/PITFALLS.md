# Pitfalls Research

**Domain:** Multi-tenant SaaS lead generation — done-for-you model, Supabase + Make.com + Stripe + Claude API
**Researched:** 2026-03-14
**Confidence:** HIGH (multiple verified sources per critical pitfall)

---

## Critical Pitfalls

### Pitfall 1: Supabase Service Role Key Exposed in Client Code

**What goes wrong:**
The `service_role` key is accidentally used in client-side code or prefixed with `NEXT_PUBLIC_` in the `.env` file. This key bypasses ALL Row Level Security policies and grants unrestricted read/write/delete access to every table. One exposed key means every LCC's leads, contact info, and pipeline data is fully readable by anyone who inspects the browser environment.

**Why it happens:**
Developers copy a code snippet, reach for the service role key to "make it work," or accidentally write `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` instead of `SUPABASE_SERVICE_ROLE_KEY`. The app continues working normally — there are no errors — so the exposure goes undetected.

**How to avoid:**
- Use two separate Supabase clients: `createBrowserClient` (anon key, client-safe) and `createServerClient` (service role, server-only via Route Handlers or Server Actions).
- Never prefix the service role key with `NEXT_PUBLIC_`, `VITE_`, or any public-facing prefix.
- Audit every `createClient` call: if it's in a file that could be bundled into client JS, it must use the anon key only.
- Add `SUPABASE_SERVICE_ROLE_KEY` (no `NEXT_PUBLIC_` prefix) to Vercel env as "Server" scope only.

**Warning signs:**
- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` appears anywhere in `.env` or `.env.local`.
- `createClient` with the service role key called inside a React component or `use client` file.
- You can query any LCC's data without being authenticated (test this explicitly).

**Phase to address:** Foundation / Auth + Multi-tenancy phase (before any data is written).

---

### Pitfall 2: RLS Enabled but Tenant Isolation Policies Are Wrong or Missing

**What goes wrong:**
RLS is enabled on the `leads` table but the policy uses `auth.uid() = user_id` instead of scoping to `lcc_id`. An LCC user's `auth.uid()` is their personal Supabase Auth UUID — it is not the same as the `lcc_id` foreign key on lead records unless you explicitly wire this up. Result: every authenticated LCC user sees zero leads (RLS blocks everything) OR, worse, a single broken policy written as `USING (true)` allows all LCCs to see each other's leads.

**Why it happens:**
The distinction between "authenticated user" and "tenant" is collapsed. The operator creates an LCC user in Supabase Auth, but the tenant context (which LCC organization this user belongs to) must be separately stored — typically in a `profiles` table or as a custom JWT claim — and correctly referenced in every RLS policy.

**How to avoid:**
- Add a `profiles` table: `id` (= `auth.uid()`), `lcc_id` (FK to `lccs`), `role` (`operator` | `lcc`).
- Write RLS policies that join through `profiles`: `USING (lcc_id = (SELECT lcc_id FROM profiles WHERE id = auth.uid()))`.
- For operator users, write a separate policy: `USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'operator')`.
- Test RLS from the client SDK (not the SQL Editor, which bypasses RLS) as each user role.
- Index `profiles.id` and `leads.lcc_id` — RLS subqueries run on every row fetch.

**Warning signs:**
- An LCC user login returns zero leads when they should have leads.
- You are testing RLS correctness from the Supabase SQL Editor (it bypasses RLS — invalid test).
- No `profiles` table linking `auth.uid()` to `lcc_id`.
- Slow lead list queries with no index on `lcc_id`.

**Phase to address:** Foundation / Auth + Multi-tenancy phase. Verify with explicit cross-tenant access tests before any feature work.

---

### Pitfall 3: Next.js ISR / CDN Caching Serves Wrong User's Session

**What goes wrong:**
A route that fetches LCC-specific pipeline data is cached by Vercel's CDN or Next.js ISR. When LCC-A's response is cached and served to LCC-B's browser, LCC-B sees LCC-A's pipeline. This is a cross-tenant data leak at the HTTP layer — RLS did its job correctly, but the response was cached before it reached the right user.

**Why it happens:**
Authenticated data fetches using `fetch()` in Next.js Server Components are opt-in to caching by default in some configurations. Developers building quickly often don't verify caching behavior on routes that involve session tokens.

**How to avoid:**
- Use `createServerClient` from `@supabase/ssr` in all authenticated routes — this opts fetch out of Next.js cache.
- Never statically generate or ISR-cache any route that renders user-specific or tenant-specific data.
- Add `export const dynamic = 'force-dynamic'` to all authenticated dashboard pages.
- Use `supabase.auth.getUser()` (not `getSession()`) in server-side code — `getSession()` reads from the cookie without re-validating with Supabase servers.

**Warning signs:**
- Dashboard pages do not have `dynamic = 'force-dynamic'` or equivalent cache-control headers.
- Authenticated routes are deployed without testing with two concurrent sessions from different LCC accounts.

**Phase to address:** Foundation / Auth phase. Set `force-dynamic` on all dashboard layouts from day one.

---

### Pitfall 4: Make.com Webhook Retry Creates Duplicate Leads

**What goes wrong:**
A family submits a landing page form. The app receives the webhook from Make.com and inserts a lead record, but returns a 500 error due to a transient DB issue. Make.com retries the webhook. The second delivery succeeds — now the same family is in the pipeline twice. The LCC gets duplicate follow-up SMS messages, the family gets texted twice, and the pipeline count is wrong.

**Why it happens:**
Webhook consumers are assumed to process each event exactly once. In practice, Make.com (and all webhook senders) retry on non-2xx responses. Without an idempotency check, the same event inserts a duplicate row.

**How to avoid:**
- Add a `webhook_event_id` column to the `leads` table with a UNIQUE constraint.
- Every lead insert must include the Make.com webhook event ID (pass it as a field in the payload or use Make's built-in execution ID).
- On insert: use `INSERT ... ON CONFLICT (webhook_event_id) DO NOTHING` — the duplicate silently no-ops.
- Return 200 immediately upon receiving the webhook, process asynchronously if needed (Stripe same pattern).
- For Make.com: set the webhook response timeout to async to prevent Make from waiting and retrying on slow DB operations.

**Warning signs:**
- No `webhook_event_id` or equivalent idempotency key on lead records.
- Duplicate family records in test data after simulating two webhook deliveries.
- Make.com scenario history shows retries on webhook modules.

**Phase to address:** Lead capture + Make.com integration phase. Add the unique constraint before inserting any real lead data.

---

### Pitfall 5: Make.com Scenario Fails Silently in Production

**What goes wrong:**
A Make.com scenario that sends the SMS follow-up sequence encounters an error (API key expired, Twilio number unregistered, malformed payload). Make.com logs the error internally, but the app has no visibility. The LCC sees "Contacted" leads in the pipeline but no SMS was actually sent. This goes undetected until the LCC asks why no families have responded.

**Why it happens:**
Make.com is a black box from the app's perspective. The app fires a webhook at Make.com and assumes the automation ran. Make.com's default queue size is 50 — traffic above this drops events entirely without error feedback to the sender.

**How to avoid:**
- Add a `last_contacted_at` and `contact_status` field to leads, updated by Make.com via a callback webhook back to the app after each send.
- Build a "heartbeat" check: if a lead is in `Contacted` stage but `last_contacted_at` is null after 30 minutes, flag it.
- Enable Make.com email error alerts for all production scenarios.
- Keep Make.com scenarios simple and single-purpose — one scenario per automation step, not one mega-scenario.
- Monitor Make.com's monthly operation count; approaching the plan limit silently pauses scenarios.

**Warning signs:**
- Make.com scenario has no error handler module attached.
- Lead moves to "Contacted" stage via server code before Make.com confirms the SMS was sent.
- No callback/confirmation webhook from Make.com back to the app.

**Phase to address:** Make.com + SMS nurture phase. Build the callback webhook before declaring the automation "working."

---

### Pitfall 6: Stripe Webhook Not Verified — Spoofable Payment Events

**What goes wrong:**
The Stripe webhook endpoint accepts any POST request and processes `checkout.session.completed` events without verifying the `Stripe-Signature` header. An attacker can POST a crafted payload claiming a payment succeeded for an LCC account, activating the account without paying.

**Why it happens:**
Fast development skips signature verification because "it just works without it in testing." The local dev flow using the Stripe CLI auto-injects signatures, so developers never notice it's missing in production.

**How to avoid:**
- Always call `stripe.webhooks.constructEvent(body, sig, webhookSecret)` before processing any event.
- Use the raw request body (not the parsed JSON) — Next.js must read the body as a buffer for signature verification to work. Parse it with `await req.text()` not `await req.json()`.
- Store a separate `STRIPE_WEBHOOK_SECRET` per environment (local CLI secret != production endpoint secret).
- Respond 200 immediately, then process asynchronously (Stripe times out handlers at 10 seconds).

**Warning signs:**
- Webhook handler calls `req.json()` before calling `constructEvent`.
- No `STRIPE_WEBHOOK_SECRET` env variable in production.
- Webhook endpoint is not idempotent — processing the same `checkout.session.completed` twice would activate the account twice or charge twice.

**Phase to address:** Stripe billing phase. Signature verification is non-negotiable before going live.

---

### Pitfall 7: Stripe Subscription Status Not Synced — LCC Access Persists After Cancellation

**What goes wrong:**
An LCC cancels their subscription or a payment fails. Stripe fires `customer.subscription.deleted` or `invoice.payment_failed`. If these events are not handled, the LCC retains dashboard access and continues receiving automated lead follow-ups indefinitely. The operator is doing unpaid work.

**Why it happens:**
Developers build the "happy path" (subscription created → access granted) but skip the cancellation/failure events. Stripe retries failed webhooks for 3 days, and out-of-order event delivery can cause missed state transitions.

**How to avoid:**
- Handle all four subscription lifecycle events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.
- Store `stripe_subscription_id` and `subscription_status` in the `lccs` table.
- On `customer.subscription.deleted`: set `subscription_status = 'cancelled'`, block LCC dashboard login.
- On `invoice.payment_failed`: set `subscription_status = 'past_due'`, send operator alert, optionally restrict access after N days.
- Make all webhook handlers idempotent: store `event.id` in a `processed_stripe_events` table before processing.

**Warning signs:**
- Only `checkout.session.completed` is handled; the other events have no handler.
- `subscription_status` is not a column in the `lccs` table.
- LCC accounts have no status-gating on dashboard access.

**Phase to address:** Stripe billing phase. Test cancellation flow explicitly before first real LCC is onboarded.

---

### Pitfall 8: Claude API Cost Runaway on Per-Lead Message Generation

**What goes wrong:**
Claude API is called once per lead to generate a personalized follow-up SMS. At 20 LCCs with 50 active leads each = 1,000 Claude calls during a nurture sequence flush. If sequences re-trigger due to a Make.com retry bug or a code error, costs spike unexpectedly. With `claude-opus-4-6` pricing, uncontrolled calls at scale become expensive fast.

**Why it happens:**
Claude calls feel lightweight in development (one lead at a time). There is no rate limiting at the application layer, so a bug that re-processes all leads calls Claude for every record in a loop.

**How to avoid:**
- Cache generated message text in the `leads` table: `generated_intro_message TEXT`. Only call Claude if this field is null.
- Set a hard `max_tokens` limit per call (personalized SMS copy is short — 150 tokens max is sufficient).
- Add an `anthropic_spend_limit` in the Anthropic console dashboard to cap monthly spend.
- Log every Claude API call with `lead_id`, `tokens_used`, `cost_estimate` to a `ai_calls` table.
- Never allow a background job to call Claude in a loop without a per-lead guard (`WHERE generated_intro_message IS NULL`).

**Warning signs:**
- Claude is called every time the lead record is fetched or updated, not just once.
- No caching field for generated message content.
- No Anthropic spend limit configured.
- Make.com retry + Claude call could mean 5x the expected Claude spend on a bad day.

**Phase to address:** Claude API + personalization phase. Caching and spend limits must be implemented before activating for real LCCs.

---

### Pitfall 9: TCPA Violations via Automated SMS Without Prior Express Written Consent

**What goes wrong:**
The system sends automated SMS nurture messages to families who submitted a landing page form. If the form does not include explicit TCPA-compliant consent language — specifically authorizing text messages via automated technology from this specific sender — each unauthorized SMS is a TCPA violation. Fines range from $500–$1,500 per message, and class-action exposure exists.

**Why it happens:**
Landing page forms are built quickly. A generic "by submitting you agree to be contacted" checkbox is not sufficient for TCPA. The 2025 FCC ruling requires consent tied specifically to the named sender, not generic lead aggregator language.

**How to avoid:**
- Every landing page form must include explicit consent text: "By submitting this form, I agree to receive automated text messages from [LCC Name / Company] at the number provided. Message and data rates may apply. Reply STOP to unsubscribe."
- Capture and store the consent timestamp and exact consent language with each lead record (`consent_text`, `consent_timestamp`, `consent_ip`).
- Do not send SMS to any lead where `consent_captured = false`.
- Every automated SMS sequence must include "Reply STOP to unsubscribe" in the first message.
- Process opt-outs within 10 business days (FCC 2025 requirement); Twilio handles STOP keyword automatically but the app must also mark `sms_opted_out = true` on the lead record and suppress Make.com triggers.

**Warning signs:**
- Landing page form has no TCPA consent language.
- `consent_timestamp` is not a column on the `leads` table.
- Make.com sequences have no check for `sms_opted_out` before sending.
- SMS messages do not include opt-out instructions.

**Phase to address:** Lead capture + landing page phase. TCPA consent is required before the first real lead is captured from any LCC's page.

---

### Pitfall 10: Operator Onboards New LCC but Forgets to Provision RLS-Linked Records

**What goes wrong:**
The operator creates a Supabase Auth user for a new LCC and then manually inserts an `lccs` record. But no `profiles` record linking `auth.uid()` → `lcc_id` is created. The LCC logs in, all RLS policy subqueries return null for `lcc_id`, and they see an empty dashboard. Worse, if the operator accidentally skips the `lccs` insert, a Stripe-active account has no pipeline backing it.

**Why it happens:**
Onboarding is manual in an operator-run model. Each step is done independently (create Auth user, create LCC record, create Stripe customer, create profiles row). One missed step causes silent failures that look like bugs.

**How to avoid:**
- Build a single operator "provision LCC" server action / API route that runs ALL steps atomically: create Auth user → insert `lccs` row → insert `profiles` row → create Stripe customer → store `stripe_customer_id` on LCC row.
- Wrap in a database transaction where possible; use compensating actions for Stripe (which can't be transactional).
- Build an operator health-check view: shows any LCC with missing `profiles`, missing `stripe_customer_id`, or missing `lccs` row.

**Warning signs:**
- Onboarding is a series of manual steps documented in a Notion doc rather than a single automated action.
- No validation query checking for "orphaned" Auth users without corresponding `profiles` or `lccs` rows.

**Phase to address:** Operator onboarding phase. The provision routine must be built and tested before the first real LCC is onboarded.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip RLS on internal tables (e.g., `audit_logs`) | Faster dev | Admin-only tables silently exposed if anon key used server-side | Never — enable RLS on every table, use restrictive default-deny policy |
| Hard-code LCC-specific config in Make.com scenarios | Ship faster | Adding a new LCC requires duplicating scenarios; n LCCs = n scenario copies | Never — parameterize via webhook payload from day one |
| Use `getSession()` instead of `getUser()` in server code | One line vs. two | Returns stale/spoofable session from cookie; security vulnerability | Never in server-side auth checks |
| Skip Stripe webhook signature verification in dev | Faster testing | Pattern carries to prod; event spoofing possible | Only in isolated local dev with Stripe CLI; NEVER in staging/prod |
| Generate Claude messages without caching | Simpler code | Cost multiplier on retries; uncapped spend | Never — always check cache before calling Claude |
| Store all LCC config as env variables | Simple early on | Can't add new LCC without a deploy; doesn't scale | MVP only if LCC count is 1; database-driven from first multi-LCC scenario |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase RLS | Testing policies from the SQL Editor | Test from client SDK (`createBrowserClient`) logged in as the actual user role |
| Supabase Auth | Using `getSession()` in server middleware | Use `getUser()` — it re-validates against Supabase servers, not just the cookie |
| Make.com | One mega-scenario per LCC | Single parameterized scenario; pass `lcc_id` in the webhook payload to route logic |
| Make.com | No callback to app after SMS send | Add a final Make.com step: POST back to app's `/api/webhooks/make-callback` to update `last_contacted_at` |
| Stripe | Parsing body as JSON before signature check | Read raw body with `req.text()`, then pass to `stripe.webhooks.constructEvent()` |
| Stripe | Only handling `checkout.session.completed` | Handle all 4 lifecycle events including `subscription.deleted` and `invoice.payment_failed` |
| Claude API | Calling Claude with no `max_tokens` cap | Always set `max_tokens: 150` for SMS copy generation; prevents runaway token usage |
| Twilio/Make.com | Not mirroring Twilio's STOP handling in app DB | When Twilio blocks a number (error 21610), also set `sms_opted_out = true` on the lead row |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| No index on `leads.lcc_id` | Lead list queries slow as LCC gets more leads; RLS subquery on every row fetch | `CREATE INDEX idx_leads_lcc_id ON leads(lcc_id)` in initial migration | ~500+ leads per LCC |
| No index on `profiles.id` (user_id) | RLS policy subquery to `profiles` scans entire table on every query | `profiles.id` should be the primary key (already indexed) — but verify | ~100+ LCC users |
| Make.com scenario with too many modules | Scenario execution time exceeds webhook timeout; Make retries → duplicates | Keep scenarios under 20 modules; break into chained scenarios | Any scenario with 5+ API calls in series |
| Claude called synchronously in lead webhook handler | Webhook handler times out (Vercel default: 10s, Make: similar) | Move Claude call to a background queue or async route handler | First lead with slow Claude response |
| Storing all pipeline data in a single unpartitioned table | Operator "all LCCs" dashboard query slows as total lead count grows | Add composite index on `(lcc_id, created_at)` for time-ranged queries | ~10,000+ total leads across all LCCs |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| `service_role` key in any client-accessible env var | Full database bypass — all LCC data exposed | Never use `NEXT_PUBLIC_` prefix; server-only env var; rotate immediately if leaked |
| RLS policy written as `USING (true)` | All authenticated users see all tenants' data | Always scope to `lcc_id` via `profiles` join; audit every policy |
| No consent record on leads | TCPA liability — $500–$1,500/message, class-action risk | Capture `consent_text`, `consent_timestamp`, `consent_ip` on every form submission |
| Stripe webhook endpoint without signature verification | Fake payment events can activate LCC accounts for free | `stripe.webhooks.constructEvent()` required; raw body required |
| LCC can access operator-only routes | LCC sees all other LCCs' data, billing info | Role check at route level via `profiles.role`; operator routes must verify role = 'operator' |
| Make.com webhook URL exposed without a secret | Anyone can trigger nurture sequences or spam leads | Add a shared secret header to all Make.com webhook calls; validate in the receiver |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| LCC dashboard shows "No leads yet" with no context | LCC thinks system is broken; churns early | Show pipeline stages even when empty; "Your first leads will appear here when families submit your form" |
| Lead status updates happen in the background with no visible feedback | LCC refreshes repeatedly; calls the operator | Optimistic UI updates; show "Last synced: X minutes ago" |
| Operator onboarding UI asks for all info at once | High friction; errors mid-form lose all data | Multi-step form with auto-save; provision can be completed in stages |
| No visual distinction between LCC view and operator view | Operator testing as LCC gets confused; support cost | Clear role badge in nav; separate URL paths `/operator/*` vs `/dashboard/*` |

---

## "Looks Done But Isn't" Checklist

- [ ] **RLS:** Table has RLS enabled AND a working tenant-scoped policy — verify by querying as LCC user from client SDK, not SQL Editor.
- [ ] **Multi-tenancy:** Cross-tenant test performed — log in as LCC-A and attempt to fetch LCC-B's lead IDs directly via API; should return 0 rows.
- [ ] **Stripe webhooks:** All 4 subscription lifecycle events handled, not just `checkout.session.completed` — verify with Stripe CLI event replay.
- [ ] **Make.com idempotency:** Trigger same webhook twice — verify only one lead record created; check `webhook_event_id` unique constraint holds.
- [ ] **TCPA consent:** Every landing page form has consent language and `consent_timestamp` is stored on the lead record — verify a real form submission has the field populated.
- [ ] **Opt-out suppression:** Send "STOP" reply to Twilio test number — verify `sms_opted_out = true` is set on the lead, and Make.com does not re-trigger a follow-up.
- [ ] **Claude caching:** Trigger lead creation twice for same lead — verify Claude is called only once and second call uses cached `generated_intro_message`.
- [ ] **LCC access revocation:** Cancel LCC subscription in Stripe test mode — verify LCC login is blocked within seconds via subscription status check.
- [ ] **Operator provisioning:** Create a new LCC through the operator panel — verify `lccs`, `profiles`, and Stripe customer all exist; verify LCC can log in and see empty (not broken) pipeline.
- [ ] **Make.com scenario health:** In production, after first real lead flows through, verify Make.com sent the callback to update `last_contacted_at` — not just that the scenario ran successfully in Make's logs.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Service role key leaked | HIGH | Rotate key immediately in Supabase dashboard; update all server env vars; audit access logs for unauthorized reads; notify affected LCCs if data was accessed |
| Duplicate leads from webhook retry | LOW | Query for `webhook_event_id` duplicates; delete duplicates; add unique constraint; test idempotency |
| TCPA violation (SMS without consent) | VERY HIGH | Immediately halt all automated SMS; add consent capture to forms retroactively; consult legal counsel; document all affected leads |
| Stripe webhooks not syncing subscription status | MEDIUM | Replay missed events via Stripe Dashboard; backfill `subscription_status` from Stripe API; add missing event handlers |
| Claude API spend spike | MEDIUM | Set spend limit in Anthropic console immediately; audit `ai_calls` log for the loop source; add `WHERE generated_intro_message IS NULL` guard |
| Make.com scenario silently failing | MEDIUM | Review Make.com execution history for error logs; replay failed executions from Make.com's incomplete executions queue; add error handlers to all scenarios |
| Cross-tenant data exposed via broken RLS | VERY HIGH | Disable public API access immediately; fix policy; audit query logs for cross-tenant reads; notify affected LCCs |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Service role key in client code | Phase 1: Foundation + Auth | Grep codebase for `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE`; attempt client-side service role access — must fail |
| RLS tenant isolation wrong | Phase 1: Foundation + Auth | Cross-tenant query test from client SDK as LCC user returns 0 rows |
| ISR/CDN caching serves wrong session | Phase 1: Foundation + Auth | Verify `force-dynamic` on all authenticated layouts; test two concurrent sessions |
| Make.com webhook creates duplicate leads | Phase 2: Lead Capture + Make.com | Fire same webhook twice; count leads — must still be 1 |
| Make.com silent scenario failure | Phase 2: Lead Capture + Make.com | Confirm callback webhook updates `last_contacted_at`; test with intentional scenario error |
| Stripe webhook not verified | Phase 3: Stripe Billing | Send unsigned POST to webhook endpoint — must return 400 |
| Stripe subscription not synced on cancel | Phase 3: Stripe Billing | Cancel via Stripe test mode; verify LCC access blocked within 60 seconds |
| Claude API cost runaway | Phase 4: Claude Personalization | Create lead twice; verify Claude called once; check Anthropic spend limit is set |
| TCPA consent not captured | Phase 2: Lead Capture (before first real LCC) | Inspect lead record after form submission — `consent_timestamp` and `consent_text` must be populated |
| Twilio opt-out not mirrored in DB | Phase 2: Lead Capture + Make.com | Send STOP to test number; verify `sms_opted_out = true` on lead; verify no subsequent Make.com trigger |
| Operator provisioning missing steps | Phase 5: Operator Onboarding | Provision test LCC; verify all 4 records exist; verify LCC login works |

---

## Sources

- [Supabase RLS Features — Official Docs](https://supabase.com/features/row-level-security)
- [Supabase: Setting up Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase: Understanding API Keys](https://supabase.com/docs/guides/api/api-keys)
- [Enforcing RLS in Supabase Multi-Tenant Architecture — DEV Community](https://dev.to/blackie360/-enforcing-row-level-security-in-supabase-a-deep-dive-into-lockins-multi-tenant-architecture-4hd2)
- [Supabase Best Practices: Security, Scaling & Maintainability](https://www.leanware.co/insights/supabase-best-practices)
- [Make.com Webhook Best Practices for Resilient Secure Workflows](https://4spotconsulting.com/make-com-webhooks-best-practices-for-resilient-secure-workflows/)
- [Stripe: Using Webhooks with Subscriptions](https://docs.stripe.com/billing/subscriptions/webhooks)
- [Stripe: Best Practices — Stigg Engineering Blog](https://www.stigg.io/blog-posts/best-practices-i-wish-we-knew-when-integrating-stripe-webhooks)
- [Stripe: Idempotent Requests](https://docs.stripe.com/api/idempotent_requests)
- [TCPA Compliance for Lead Generation 2025 — Phonexa](https://phonexa.com/blog/tcpa-compliant-lead-generation/)
- [TCPA Text Message Rules 2025–2026 — ActiveProspect](https://activeprospect.com/blog/tcpa-text-messages/)
- [New TCPA Rules 2025 — MoEngage](https://www.moengage.com/blog/new-tcpa-rules/)
- [Twilio Opt-Out Keywords Documentation](https://twilio.com/docs/messaging/tutorials/advanced-opt-out)
- [Twilio: FCC Opt-Out Keyword Updates (REVOKE, OPTOUT added April 2025)](https://www.twilio.com/en-us/changelog/opt-out-additional-keywords-added-per-fcc-ruling)
- [Claude API Rate Limits — Official Docs](https://platform.claude.com/docs/en/api/rate-limits)
- [Claude API Pricing — Official Docs](https://platform.claude.com/docs/en/about-claude/pricing)
- [AI API Rate Limiting and Cost Management Patterns — DEV Community](https://dev.to/myougatheaxo/ai-api-rate-limiting-and-cost-management-practical-patterns-with-claude-code-3b2e)
- [Webhook Idempotency Implementation — Hookdeck](https://hookdeck.com/webhooks/guides/implement-webhook-idempotency)
- [Multi-Tenant Architecture Risks — Clerk](https://clerk.com/blog/what-are-the-risks-and-challenges-of-multi-tenancy)

---
*Pitfalls research for: Multi-tenant SaaS lead generation (LCC Lead Engine) — Supabase + Make.com + Stripe + Claude API*
*Researched: 2026-03-14*
