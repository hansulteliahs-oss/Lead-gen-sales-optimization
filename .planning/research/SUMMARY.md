# Project Research Summary

**Project:** LCC Lead Engine
**Domain:** Done-for-you lead generation SaaS — multi-tenant, au pair niche
**Researched:** 2026-03-14
**Confidence:** HIGH (stack and architecture); MEDIUM-HIGH (features); HIGH (pitfalls)

## Executive Summary

The LCC Lead Engine is a purpose-built, multi-tenant SaaS product that automates lead capture, nurture sequencing, and pipeline visibility for au pair Local Childcare Coordinators (LCCs). The system is operator-run: a single operator provisions LCC client accounts, each of which gets an isolated pipeline, a public lead capture form, automated SMS/email follow-up via Make.com, and a read-only dashboard. The closest market analog is GoHighLevel — but the lead engine wins by being niche-specific and done-for-you, requiring zero configuration from LCCs. Research confirms this is a well-understood architecture pattern (multi-tenant SaaS with RLS-based isolation) with a modern, stable stack: Next.js App Router + Supabase + Stripe + Make.com + Claude API.

The recommended approach is a phased build ordered strictly by data dependency: foundation (auth + schema + RLS) must precede every feature, because multi-tenant isolation is the security primitive everything else builds on. Lead capture comes second because it is the product's value trigger — speed-to-lead (first SMS within 60 seconds) is the core differentiator and must be proven working before any dashboard or billing work. AI personalization via Claude is an enhancement layer that should be added only after the base webhook/automation flow is stable, never in the first build pass.

The top risks are concentrated in two areas: security and compliance. Multi-tenant data leaks from incorrect RLS policies or an exposed Supabase service role key are catastrophic and irreversible. TCPA violations from sending automated SMS without explicit per-sender consent carry $500–$1,500 per-message fines with class-action exposure. Both risks must be addressed in Phase 1 (before any real lead data is captured), not retrofitted later. Stripe subscription lifecycle handling and Make.com idempotency are high-probability bugs that will hit in the first week of production if not explicitly designed for from the start.

---

## Key Findings

### Recommended Stack

The stack is modern, stable, and well-matched to the domain. Next.js 15 (App Router) with Supabase handles auth, multi-tenancy, and data in a single managed platform. Supabase RLS enforces tenant isolation at the database layer — application code never needs manual `WHERE lcc_id = ?` guards. The `@supabase/ssr` package (not the deprecated `auth-helpers`) is the required SSR auth integration for App Router. Make.com handles all outbound automation (SMS via Twilio, email via Resend) as an external bus — the app stays thin. Claude API is called server-side only via a Route Handler using the `claude-sonnet-4-6` model per project specification.

**Core technologies:**
- **Next.js 15 + React 19:** Full-stack framework with App Router route groups for operator/LCC/public separation
- **Supabase (postgres + auth):** Multi-tenancy via RLS; `@supabase/ssr` for cookie-based SSR sessions; service role client for privileged server operations only
- **Stripe (v20.x):** Subscription billing — setup fee + monthly retainer per LCC; all 4 webhook lifecycle events must be handled
- **Make.com:** Outbound automation bus for SMS/email nurture sequences; one webhook URL per LCC per trigger event stored in DB
- **Claude API (`@anthropic-ai/sdk` v0.78.x):** AI-personalized message generation, server-side only, with per-lead caching to control cost
- **Resend + Twilio:** Email and SMS delivery within Make.com scenarios; not called directly from app code in v1
- **Vercel:** Hosting with native Next.js support; required for `@supabase/ssr` cookie patterns and wildcard routing

**Critical version notes:** Use `@supabase/ssr` (not `@supabase/auth-helpers-nextjs` — deprecated). Use `date-fns 4.x` (React 19 compatibility). Service role key must never use `NEXT_PUBLIC_` prefix.

See [STACK.md](./STACK.md) for full version table, alternatives considered, and what not to use.

### Expected Features

The product is built for three user types: Operator (manages all LCCs), LCC (read-only pipeline view), and Family (form submitter, no login). The MVP scope is tighter than it initially appears — there are many things that seem like obvious features but are explicitly anti-features for a done-for-you model (self-service LCC signup, in-app messaging, LCC-editable sequences).

**Must have (table stakes — v1 launch):**
- Lead capture form per LCC with instant pipeline routing — without this, no leads exist
- Multi-tenant RLS in Supabase — without this, the foundation is broken
- Automated SMS + email nurture sequence via Make.com — this is the core product promise
- Speed-to-lead: first SMS within 60 seconds of form submission — the key selling point
- LCC dashboard: pipeline stage view (Interested → Contacted → Qualified → Signed)
- Lead detail records (name, email, phone, source, last contacted)
- Conversion metrics + commission progress tracker on LCC dashboard
- Operator admin view: all LCCs, pipeline counts, MRR
- Operator LCC onboarding flow: single atomic action that provisions tenant + Stripe + auth
- Stripe billing: setup fee + monthly retainer, with subscription status gating LCC access

**Should have (differentiators — add after first 2-3 LCCs are live):**
- AI-personalized follow-up messages via Claude API — validate base SMS flow first
- Post-sign referral automation — easy Make.com trigger once "Signed" stage exists
- Source tracking via UTM params on form — add when LCCs ask about lead quality
- AI-generated monthly narrative summary email to LCC — adds perceived premium value

**Defer to v2+:**
- White-label per LCC (custom domains, branding)
- Two-way SMS inbox (operator-facing only, if needed)
- Lead scoring (requires 100+ historical signed leads)
- Multi-sequence A/B variant testing

See [FEATURES.md](./FEATURES.md) for competitor analysis (GoHighLevel comparison), anti-features rationale, and full prioritization matrix.

### Architecture Approach

The system uses a standard multi-tenant SaaS monolith on Vercel with three Next.js App Router route groups: `(operator)` for all-tenant management, `(lcc)` for single-tenant pipeline view, and `(public)` for family-facing lead forms. Middleware routes users to the correct group based on `app_role` in the Supabase JWT. All external integrations (Make.com, Claude, Stripe) live in Route Handlers under `app/api/` — never in Server Components or client code. Tenant isolation is enforced at the database layer via RLS policies keyed to a `lcc_id` custom JWT claim, backed by a `profiles` table linking `auth.uid()` to `lcc_id`.

**Major components:**
1. **Supabase Auth + RLS** — Session management, custom JWT hook injects `lcc_id` and `app_role`; all tables have RLS enabled with default-deny policies
2. **Public route group `(public)/[lccSlug]`** — Family landing pages with TCPA-compliant consent form; Server Action writes lead + fires Make.com trigger
3. **Webhook ingest Route Handler** — `app/api/webhooks/lead/route.ts`; uses service-role client; validates HMAC secret; idempotency via `webhook_event_id` unique constraint
4. **Make.com automation bus** — Per-LCC webhook URLs stored in `automations` table; app POSTs to trigger nurture sequences; Make.com POSTs callback to update `last_contacted_at`
5. **LCC dashboard `(lcc)` route group** — Server Components with `force-dynamic`; RLS-enforced queries return only that LCC's leads; @tanstack/react-query for client refresh
6. **Operator dashboard `(operator)` route group** — Service-role provisioning for LCC onboarding; Stripe subscription management; all-tenant aggregate view
7. **Claude message API** — `app/api/messages/generate/route.ts`; fetches lead context, calls Anthropic SDK, caches result on `leads.generated_intro_message`; never called from client

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full schema, data flow diagrams, anti-patterns, and build order dependency graph.

### Critical Pitfalls

Research identified 10 named pitfalls across the stack. The top 5 by severity and probability:

1. **Supabase service role key in client code** — Results in full RLS bypass and multi-tenant data exposure. Prevention: never use `NEXT_PUBLIC_` prefix; isolate service role client to `lib/supabase/admin.ts` used only in Route Handlers. Address in Phase 1 before any data is written.

2. **RLS tenant isolation policies are wrong or missing** — `USING (auth.uid() = user_id)` is not the same as tenant scoping; requires a `profiles` table join. Test from the client SDK as each user role, not from the Supabase SQL Editor (which bypasses RLS). Address in Phase 1 with explicit cross-tenant access tests.

3. **TCPA violations from automated SMS without explicit consent** — $500–$1,500 per message, class-action exposure. Every landing page form must include named-sender consent language; store `consent_text`, `consent_timestamp`, `consent_ip` on every lead record. Address before the first real LCC form goes live.

4. **Make.com webhook retry creates duplicate leads** — Return 200 immediately; use `INSERT ... ON CONFLICT (webhook_event_id) DO NOTHING` with a unique constraint. Address in Phase 2 before any real lead data is written.

5. **Stripe subscription status not synced on cancellation** — Handle all 4 lifecycle events (`checkout.session.completed`, `subscription.updated`, `subscription.deleted`, `invoice.payment_failed`); gate LCC dashboard access on `subscription_status`. Address in the billing phase before first paid LCC goes live.

See [PITFALLS.md](./PITFALLS.md) for full pitfall list including Claude cost runaway, CDN caching of session data, operator provisioning gaps, and the "looks done but isn't" verification checklist.

---

## Implications for Roadmap

Based on combined research, the architecture's own dependency graph is the natural phase structure. There is no ambiguity about ordering — each phase unlocks the next.

### Phase 1: Foundation — Auth, Schema, and Tenant Isolation

**Rationale:** Everything depends on this. RLS and auth must be correct before any feature that displays or writes lead data. Getting this wrong means all subsequent phases are built on a broken security model.

**Delivers:** Working Supabase project with migrations, RLS policies on all tables, custom JWT hook injecting `lcc_id` and `app_role`, Next.js middleware routing operator vs. LCC vs. public routes, and a verified cross-tenant isolation test.

**Addresses:** Multi-tenant data isolation (table stakes feature), LCC login (table stakes feature)

**Avoids:** Service role key exposure, broken RLS policies, ISR/CDN caching serving wrong session — all must be addressed here with explicit verification steps

**Research flag:** Standard patterns — well-documented Supabase + Next.js App Router integration; skip research-phase

---

### Phase 2: Lead Capture and Make.com Automation

**Rationale:** This is the core product promise. A working form-to-SMS flow is what an LCC is paying for. It must be built and verified before any dashboard work, because without leads in the database the dashboard has nothing to show.

**Delivers:** Public landing page per LCC slug with TCPA-compliant consent form; webhook ingest Route Handler with HMAC validation and idempotency; Make.com scenario triggering SMS + email sequence; Make.com callback updating `last_contacted_at`; speed-to-lead under 60 seconds verified.

**Addresses:** Lead capture form + routing (P1), automated SMS/email nurture (P1), speed-to-lead (P1)

**Avoids:** TCPA violations (consent capture required on form before first real submission), Make.com duplicate leads (idempotency constraint required before real data), Make.com silent failures (callback webhook required to confirm sends)

**Research flag:** Make.com integration patterns are MEDIUM confidence (community patterns only, no official Next.js guide) — may need a focused research pass on Make.com webhook authentication and callback patterns during planning

---

### Phase 3: LCC Dashboard

**Rationale:** Once leads exist and are flowing through the pipeline via automation, the LCC needs visibility. This is the retention hook. Build it second because it requires Phase 1 auth (RLS-enforced queries) and Phase 2 lead data.

**Delivers:** LCC route group with authenticated layout; pipeline kanban view by stage; lead detail page; conversion metrics (totals by stage, signed this month); commission progress tracker.

**Addresses:** Pipeline stage view (P1), lead detail records (P1), conversion metrics + commission tracker (P1)

**Avoids:** CDN caching of session data (`force-dynamic` on all authenticated layouts), empty state confusion (show empty pipeline stages with contextual message, not blank screen)

**Research flag:** Standard patterns — Next.js Server Components + Supabase RLS queries are well-documented; skip research-phase

---

### Phase 4: Operator Admin and LCC Onboarding

**Rationale:** Required to sell to a second LCC. The operator needs to provision accounts without code changes. Stripe billing must be connected here because the onboarding flow must create Stripe customers atomically with the LCC record.

**Delivers:** Operator dashboard with all-LCC aggregate view; single atomic "provision LCC" server action (creates Supabase Auth user + `lccs` row + `profiles` row + Stripe customer atomically); Stripe webhook handler for all 4 subscription lifecycle events; LCC access gated on `subscription_status`.

**Addresses:** Operator admin view (P1), operator LCC onboarding (P1), Stripe billing (P1)

**Avoids:** Operator provisioning missing steps (all-or-nothing provision routine with health-check view), Stripe subscription not synced on cancellation (all 4 lifecycle events required), Stripe webhook spoofing (signature verification required)

**Research flag:** Standard patterns for Stripe billing — Stripe docs are comprehensive; skip research-phase

---

### Phase 5: AI Personalization and v1.x Enhancements

**Rationale:** Add after at least 2 LCCs are live and the base automation flow is confirmed reliable. Claude API is an enhancement layer that lifts reply rates but does not change the core workflow. Building it before the base is proven stable risks adding cost-control complexity to an unvalidated system.

**Delivers:** Claude message generation Route Handler with per-lead caching; `generated_intro_message` field on leads with cache guard; Anthropic spend limit configured; post-sign referral automation trigger in Make.com; source tracking (UTM) on forms; AI monthly summary report to LCC via email.

**Addresses:** AI-personalized messages (P2), post-sign referral automation (P2), source tracking (P2), AI monthly report (P2)

**Avoids:** Claude API cost runaway (cache before calling; `max_tokens: 150` cap; spend limit in Anthropic console; log every call)

**Research flag:** Claude API integration is well-documented via official SDK; cost control patterns are verified — skip research-phase. Make.com referral automation trigger may need a focused pass on chained scenario patterns.

---

### Phase Ordering Rationale

- **Phases 1 before everything:** RLS and auth correctness is a prerequisite, not a parallel track. A broken tenant isolation model cannot be safely patched after leads from real LCCs exist in the database.
- **Phase 2 before Phase 3:** The LCC dashboard is only valuable if it has data. A working automation flow also validates that the webhook contract (lead schema, Make.com trigger) is correct before building UI against it.
- **Phase 4 after Phase 3:** Stripe billing gates LCC access. Building billing after the dashboard means the access-gating logic can be added cleanly once the protected resource (the dashboard) exists.
- **Phase 5 last:** AI features are additive. Nothing in Phases 1–4 depends on Claude API. Adding AI after the base is stable avoids debugging two unknown systems simultaneously.
- **No parallel tracks:** The dependency graph is linear enough that parallelism adds coordination overhead without meaningful time savings in a single-developer build.

### Research Flags

Phases needing deeper research during planning:
- **Phase 2 (Make.com integration):** Make.com webhook authentication and callback patterns are MEDIUM confidence. Research the specific Make.com webhook headers, payload format, and how to trigger a POST back to the app from a scenario. Verify current Make.com plan limits (queue size, monthly operations) before committing to a scenario architecture.

Phases with standard patterns (skip research-phase):
- **Phase 1:** Supabase RLS + `@supabase/ssr` + Next.js App Router middleware are all covered by official docs with code examples.
- **Phase 3:** Next.js Server Components + Supabase queries + `@tanstack/react-query` pattern is widely documented.
- **Phase 4:** Stripe Subscriptions webhook handling is among the most documented SaaS patterns in existence.
- **Phase 5:** Anthropic SDK direct usage is simple; Claude cost control patterns are documented.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All core package versions verified via npm; official docs for Supabase SSR, Stripe webhooks, Next.js App Router confirmed. `@supabase/auth-helpers` deprecation verified. |
| Features | MEDIUM-HIGH | GoHighLevel comparisons are from product marketing (MEDIUM); speed-to-lead conversion data is widely cited across multiple lead gen sources (HIGH); au pair niche specifics inferred from general lead gen patterns (MEDIUM) |
| Architecture | HIGH | Supabase RLS patterns, Next.js route groups, service role isolation, and Make.com webhook patterns all verified via official or high-quality community sources |
| Pitfalls | HIGH | TCPA compliance verified via FCC ruling sources and legal compliance blogs; Stripe webhook pitfalls from official Stripe docs; Supabase key exposure patterns from official docs and real-world architecture writeups |

**Overall confidence:** HIGH

### Gaps to Address

- **Make.com authentication headers and callback format:** Community patterns suggest HMAC secret via header, but no official Make.com/Next.js integration guide was found. During Phase 2 planning, verify exact header names, payload format, and retry behavior against Make.com's webhook documentation.
- **Make.com plan limits:** The 50-operation queue limit cited in PITFALLS.md should be verified against the current Make.com plan the operator has. If volume exceeds plan, silent event dropping is the failure mode.
- **Au pair LCC commission structure:** The commission tracker feature assumes a single per-LCC commission rate. If LCCs have variable rates per placement type, the data model and UI need a richer structure. Validate with the operator before building.
- **Twilio number registration:** A2P 10DLC registration is required for business SMS in the US. Twilio's registration process (brand + campaign) must be completed before production SMS sends are possible. This is an ops prerequisite, not a code task, but it blocks Phase 2 going live.

---

## Sources

### Primary (HIGH confidence)
- [Next.js App Router multi-tenant guide](https://nextjs.org/docs/app/guides/multi-tenant) — routing patterns, route groups
- [Supabase RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security) — policy patterns, tenant isolation
- [Supabase SSR auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) — `@supabase/ssr` usage, cookie sessions
- [Supabase Custom Claims & RBAC](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac) — JWT custom claims pattern
- [Stripe subscriptions webhook docs](https://docs.stripe.com/billing/subscriptions/webhooks) — lifecycle events, signature verification
- [TCPA Text Message Rules 2025–2026 — ActiveProspect](https://activeprospect.com/blog/tcpa-text-messages/) — consent requirements, per-sender rule
- [Claude API Pricing](https://platform.claude.com/docs/en/about-claude/pricing) — cost control, `max_tokens` guidance
- npm package version confirmations: `@supabase/supabase-js`, `@supabase/ssr`, `stripe`, `@anthropic-ai/sdk`, `resend`, `twilio`

### Secondary (MEDIUM confidence)
- [GoHighLevel Features 2026](https://www.centripe.ai/gohighlevel-features) — competitor feature comparison
- [LockIn multi-tenant RLS deep dive](https://dev.to/blackie360/-enforcing-row-level-security-in-supabase-a-deep-dive-into-lockins-multi-tenant-architecture-4hd2) — real-world RLS implementation pattern
- [Make.com Webhook Best Practices](https://4spotconsulting.com/make-com-webhooks-best-practices-for-resilient-secure-workflows/) — idempotency and retry handling
- [Makerkit Supabase RLS best practices](https://makerkit.dev/blog/tutorials/supabase-rls-best-practices) — policy structure patterns
- Community: Resend + Twilio split pattern (email/SMS) confirmed across multiple sources

### Tertiary (LOW confidence)
- [Au Pair Agency Software](https://enginehire.io/au-pair-agency-software/) — niche-specific feature inference; validate commission structure with operator before building

---

*Research completed: 2026-03-14*
*Ready for roadmap: yes*
