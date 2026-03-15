# Roadmap: LCC Lead Engine

## Overview

The LCC Lead Engine builds in strict dependency order: tenant security must be airtight before any lead data is written; lead capture and automation must work before the dashboard has anything to show; the LCC dashboard must exist before billing can gate access to it; and AI personalization is an enhancement layer added only after the base system is proven in production. Five phases, each delivering one complete and verifiable capability.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Supabase project, schema, RLS policies, auth, and Next.js middleware routing — verified secure before any lead data exists
- [ ] **Phase 2: Lead Capture and Automation** - Public family form per LCC slug, TCPA consent capture, Make.com webhook trigger, full nurture sequence, and referral automation — with speed-to-lead under 60 seconds
- [ ] **Phase 3: LCC Dashboard** - Authenticated LCC pipeline view by stage, lead detail records, conversion metrics, and commission progress tracker
- [ ] **Phase 4: Operator Admin and Billing** - Operator dashboard, atomic LCC provisioning, Stripe subscription lifecycle, and LCC access gated on billing status
- [ ] **Phase 5: AI Personalization** - Claude API personalized message generation per lead with per-lead caching, passed through to Make.com nurture sequences

## Phase Details

### Phase 1: Foundation
**Goal**: The system has a secure, multi-tenant data layer that correctly isolates every LCC's data before any real information is written
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06
**Success Criteria** (what must be TRUE):
  1. Operator can log in and is routed to the operator route group; LCC can log in and is routed to the LCC route group; unauthenticated requests are redirected to login
  2. Sessions persist across browser refresh for both operator and LCC roles
  3. An LCC user querying the database cannot retrieve leads or records belonging to a different LCC (RLS cross-tenant isolation verified from the client SDK, not the SQL editor)
  4. Operator account can read all tenant data, bypassing per-tenant RLS
  5. Supabase service role key is not exposed in any client-accessible environment variable
**Plans**: 4 plans

Plans:
- [ ] 01-01-PLAN.md — Next.js scaffold + Supabase cloud provisioning + client utilities
- [ ] 01-02-PLAN.md — Foundation migration SQL (schema + RLS + hook) + seed data
- [ ] 01-03-PLAN.md — Middleware + login page + route groups + stub dashboards
- [ ] 01-04-PLAN.md — Test infrastructure (Playwright + Vitest) + auth hook registration checkpoint

### Phase 2: Lead Capture and Automation
**Goal**: A family can submit interest on an LCC-specific landing page and receive an automated SMS and email within 60 seconds, with the lead appearing in the correct LCC's pipeline — and signed families trigger referral outreach automatically
**Depends on**: Phase 1
**Requirements**: LEAD-01, LEAD-02, LEAD-03, LEAD-04, LEAD-05, LEAD-06, PIPE-01, PIPE-02, PIPE-03, PIPE-04, PIPE-05, AUTO-01, AUTO-02, AUTO-03, AUTO-04, AUTO-05, AUTO-06
**Success Criteria** (what must be TRUE):
  1. A family submitting a form on `/[lccSlug]` with name, email, phone, and optional message creates a lead record in "Interested" stage under the correct LCC within seconds; lead source and UTM parameters are stored on the record
  2. The form captures explicit TCPA consent with consent text, timestamp, and IP stored on the lead record; the form cannot be submitted without checking the consent checkbox
  3. The family receives an SMS and email from the LCC's automation within 60 seconds of form submission
  4. A three-or-more-touchpoint nurture sequence fires over the following days; each send updates `last_contacted_at` on the lead record via Make.com callback
  5. Submitting the same form twice (webhook retry simulation) does not create a duplicate lead record; when a family's stage moves to Signed, Make.com triggers a referral request SMS/email to that family
**Plans**: TBD

### Phase 3: LCC Dashboard
**Goal**: An authenticated LCC can log in and see their live pipeline, understand where each family stands, and track their commission progress — without operator involvement
**Depends on**: Phase 2
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05
**Success Criteria** (what must be TRUE):
  1. LCC can view their leads grouped by stage (Interested / Contacted / Qualified / Signed) with counts per stage
  2. LCC can click any lead to see full detail: family name, email, phone, source, all activity timestamps
  3. LCC can see total signed families and an estimated commission progress figure on their dashboard
  4. LCC can see which automations are active on their account
**Plans**: TBD

### Phase 4: Operator Admin and Billing
**Goal**: The operator can provision new LCC clients from a dashboard, manage all accounts in one view, and Stripe subscription status gates LCC access to the system
**Depends on**: Phase 3
**Requirements**: OPS-01, OPS-02, OPS-03, OPS-04, OPS-05, BILL-01, BILL-02, BILL-03, BILL-04
**Success Criteria** (what must be TRUE):
  1. Operator can create a new LCC account from a single form — the action atomically creates a Supabase auth user, LCC record, and Stripe customer; the new LCC can log in immediately
  2. Operator can view all LCC accounts with pipeline stage counts in one aggregated view, and can open any individual LCC's full pipeline
  3. Operator can configure Make.com webhook URLs for each LCC's automations from the operator dashboard
  4. When a Stripe subscription is cancelled or payment fails, the affected LCC's active automations are disabled and their dashboard reflects suspended status
  5. Stripe webhook signature verification rejects unauthenticated payloads; all four lifecycle events (created, updated, payment failed, cancelled) update the LCC's subscription status in the database
**Plans**: TBD

### Phase 5: AI Personalization
**Goal**: Every new lead receives a Claude-generated personalized follow-up message that is passed to Make.com for use in SMS and email sequences, with per-lead caching to prevent redundant API calls
**Depends on**: Phase 4
**Requirements**: AI-01, AI-02, AI-03
**Success Criteria** (what must be TRUE):
  1. The Make.com webhook payload for a new lead includes a personalized intro message generated by Claude, referencing the family name, lead source, and LCC name
  2. Submitting a second webhook for the same lead does not call the Claude API again — the cached `generated_intro_message` on the lead record is reused
  3. Every Claude API call is logged; a spend limit is configured in the Anthropic console; no Claude call is made from client-side code
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 1/4 | In Progress|  |
| 2. Lead Capture and Automation | 0/? | Not started | - |
| 3. LCC Dashboard | 0/? | Not started | - |
| 4. Operator Admin and Billing | 0/? | Not started | - |
| 5. AI Personalization | 0/? | Not started | - |
