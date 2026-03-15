# Requirements: LCC Lead Engine

**Defined:** 2026-03-14
**Core Value:** More families signed for each LCC — a fully automated lead generation and nurture system that turns family interest into au pair sign-ups, without the LCC lifting a finger.

## v1 Requirements

### Authentication & Multi-Tenancy

- [x] **AUTH-01**: Operator can log in with email and password and access all LCC accounts
- [x] **AUTH-02**: LCC can log in with email and password and see only their own pipeline data
- [ ] **AUTH-03**: User session persists across browser refresh
- [ ] **AUTH-04**: Unauthenticated users are redirected to login (middleware-enforced)
- [ ] **AUTH-05**: Each LCC's data is isolated via Supabase RLS — an LCC cannot access another LCC's leads
- [x] **AUTH-06**: Operator account bypasses RLS to access all tenant data

### Lead Capture

- [ ] **LEAD-01**: Each LCC has a unique public landing page with a family interest form
- [ ] **LEAD-02**: Family can submit name, email, phone, and optional message via the form
- [ ] **LEAD-03**: Form captures TCPA consent (explicit opt-in checkbox with consent text and timestamp stored)
- [ ] **LEAD-04**: On form submit, lead is instantly created in the LCC's pipeline as "Interested"
- [ ] **LEAD-05**: On form submit, Make.com webhook is triggered with lead data to start nurture sequence
- [ ] **LEAD-06**: Lead source (landing page, ad UTM, referral) is captured and stored

### Pipeline Management

- [ ] **PIPE-01**: Leads move through stages: Interested → Contacted → Qualified → Signed
- [ ] **PIPE-02**: Pipeline stage updates when Make.com automation callback fires (confirming contact was made)
- [ ] **PIPE-03**: Lead record stores: family name, email, phone, source, stage, last contacted date, created date
- [ ] **PIPE-04**: Operator can manually update a lead's pipeline stage
- [ ] **PIPE-05**: Signed leads are marked with sign-up date for commission tracking

### Automation (Make.com)

- [ ] **AUTO-01**: On new lead: Make.com triggers immediate SMS to family within 60 seconds
- [ ] **AUTO-02**: On new lead: Make.com triggers immediate email to family within 60 seconds
- [ ] **AUTO-03**: Make.com runs a nurture sequence (at minimum 3 follow-up touchpoints) over the following days
- [ ] **AUTO-04**: Make.com callbacks update lead's `last_contacted_at` and stage in the database
- [ ] **AUTO-05**: On family sign-up (stage = Signed): Make.com triggers referral request SMS/email to that family
- [ ] **AUTO-06**: Each LCC has their own Make.com webhook URLs stored in the database (not shared)

### AI Personalization

- [ ] **AI-01**: Claude API generates personalized follow-up message text per lead (based on family name, source, LCC name)
- [ ] **AI-02**: Generated message text is cached per lead to prevent redundant API calls
- [ ] **AI-03**: Personalized message text is passed to Make.com webhook payload for use in SMS/email templates

### LCC Dashboard

- [ ] **DASH-01**: LCC can view their full lead pipeline grouped by stage
- [ ] **DASH-02**: LCC can click a lead to see full details (family info, source, all activity timestamps)
- [ ] **DASH-03**: LCC can see count of leads at each pipeline stage
- [ ] **DASH-04**: LCC can see total signed families and estimated commission progress
- [ ] **DASH-05**: LCC can see which automations are active on their account

### Operator Admin

- [ ] **OPS-01**: Operator can view all LCC accounts and their pipeline summaries in one view
- [ ] **OPS-02**: Operator can create a new LCC account (provisions Supabase auth user + RLS tenant)
- [ ] **OPS-03**: Operator can configure Make.com webhook URLs for each LCC's automations
- [ ] **OPS-04**: Operator can view any individual LCC's full pipeline (bypassing RLS)
- [ ] **OPS-05**: Operator can manually move leads through stages for any LCC

### Billing

- [ ] **BILL-01**: Stripe subscription product exists for monthly retainer ($500–$1,500/month tier)
- [ ] **BILL-02**: LCC account is linked to a Stripe subscription customer
- [ ] **BILL-03**: Failed payment or subscription cancellation disables LCC's active automations
- [ ] **BILL-04**: Stripe webhook handles: subscription created, payment failed, subscription cancelled

---

## v2 Requirements

### Enhanced Analytics

- **ANLT-01**: Monthly automated report generated via Claude API summarizing LCC's pipeline performance
- **ANLT-02**: Conversion rate by lead source (ad vs landing page vs referral)
- **ANLT-03**: Average days-to-sign tracking

### Advanced Automation

- **AUTO-07**: Operator can duplicate a Make.com scenario for a new LCC from within the app UI
- **AUTO-08**: A/B testing of follow-up message variants

### Family-Facing

- **FAM-01**: Facebook Lead Ads integration (leads ingested directly from FB without a landing page visit)
- **FAM-02**: Referral tracking link (unique URL per referring family)

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Mobile native app | Web-first; mobile-responsive sufficient for v1 |
| LCC self-service signup | Operator-managed onboarding — done-for-you model requires manual setup |
| In-app messaging (LCC ↔ family) | SMS/email via Make.com handles all communication; in-app messaging adds complexity without retainer value |
| LCC-editable automation sequences | Done-for-you means operator controls sequences; LCC editing undermines the model |
| White-labeling per LCC | Single brand for v1 |
| OAuth / magic link login | Email/password sufficient for operator + LCC login volume |
| Real-time chat | Out of scope — see in-app messaging above |

---

## Traceability

*Updated after roadmap creation — 2026-03-14*

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Pending |
| AUTH-06 | Phase 1 | Complete |
| LEAD-01 | Phase 2 | Pending |
| LEAD-02 | Phase 2 | Pending |
| LEAD-03 | Phase 2 | Pending |
| LEAD-04 | Phase 2 | Pending |
| LEAD-05 | Phase 2 | Pending |
| LEAD-06 | Phase 2 | Pending |
| PIPE-01 | Phase 2 | Pending |
| PIPE-02 | Phase 2 | Pending |
| PIPE-03 | Phase 2 | Pending |
| PIPE-04 | Phase 2 | Pending |
| PIPE-05 | Phase 2 | Pending |
| AUTO-01 | Phase 2 | Pending |
| AUTO-02 | Phase 2 | Pending |
| AUTO-03 | Phase 2 | Pending |
| AUTO-04 | Phase 2 | Pending |
| AUTO-05 | Phase 2 | Pending |
| AUTO-06 | Phase 2 | Pending |
| DASH-01 | Phase 3 | Pending |
| DASH-02 | Phase 3 | Pending |
| DASH-03 | Phase 3 | Pending |
| DASH-04 | Phase 3 | Pending |
| DASH-05 | Phase 3 | Pending |
| OPS-01 | Phase 4 | Pending |
| OPS-02 | Phase 4 | Pending |
| OPS-03 | Phase 4 | Pending |
| OPS-04 | Phase 4 | Pending |
| OPS-05 | Phase 4 | Pending |
| BILL-01 | Phase 4 | Pending |
| BILL-02 | Phase 4 | Pending |
| BILL-03 | Phase 4 | Pending |
| BILL-04 | Phase 4 | Pending |
| AI-01 | Phase 5 | Pending |
| AI-02 | Phase 5 | Pending |
| AI-03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 38 total
- Mapped to phases: 38
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-14*
*Last updated: 2026-03-14 after roadmap creation*
