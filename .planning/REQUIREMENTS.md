# Requirements: LCC Lead Engine

**Defined:** 2026-03-14
**Updated for v2.0:** 2026-04-04
**Core Value:** More families signed for each LCC — a fully automated lead generation and nurture system that turns family interest into au pair sign-ups, without the LCC lifting a finger.

---

## v1.0 Requirements (Complete)

### Authentication & Multi-Tenancy

- [x] **AUTH-01**: Operator can log in with email and password and access all LCC accounts
- [x] **AUTH-02**: LCC can log in with email and password and see only their own pipeline data
- [x] **AUTH-03**: User session persists across browser refresh
- [x] **AUTH-04**: Unauthenticated users are redirected to login (middleware-enforced)
- [x] **AUTH-05**: Each LCC's data is isolated via Supabase RLS — an LCC cannot access another LCC's leads
- [x] **AUTH-06**: Operator account bypasses RLS to access all tenant data

### Lead Capture

- [x] **LEAD-01**: Each LCC has a unique public landing page with a family interest form
- [x] **LEAD-02**: Family can submit name, email, phone, and optional message via the form
- [x] **LEAD-03**: Form captures TCPA consent (explicit opt-in checkbox with consent text and timestamp stored)
- [x] **LEAD-04**: On form submit, lead is instantly created in the LCC's pipeline as "Interested"
- [x] **LEAD-05**: On form submit, Make.com webhook is triggered with lead data to start nurture sequence
- [x] **LEAD-06**: Lead source (landing page, ad UTM, referral) is captured and stored

### Pipeline Management

- [x] **PIPE-01**: Leads move through stages: Interested → Contacted → Qualified → Signed
- [x] **PIPE-02**: Pipeline stage updates when Make.com automation callback fires (confirming contact was made)
- [x] **PIPE-03**: Lead record stores: family name, email, phone, source, stage, last contacted date, created date
- [x] **PIPE-04**: Operator can manually update a lead's pipeline stage
- [x] **PIPE-05**: Signed leads are marked with sign-up date for commission tracking

### Automation (Make.com)

- [x] **AUTO-01**: On new lead: Make.com triggers immediate SMS to family within 60 seconds
- [x] **AUTO-02**: On new lead: Make.com triggers immediate email to family within 60 seconds
- [x] **AUTO-03**: Make.com runs a nurture sequence (at minimum 3 follow-up touchpoints) over the following days
- [x] **AUTO-04**: Make.com callbacks update lead's `last_contacted_at` and stage in the database
- [x] **AUTO-05**: On family sign-up (stage = Signed): Make.com triggers referral request SMS/email to that family
- [x] **AUTO-06**: Each LCC has their own Make.com webhook URLs stored in the database (not shared)

### AI Personalization

- [x] **AI-01**: Claude API generates personalized follow-up message text per lead (based on family name, source, LCC name)
- [x] **AI-02**: Generated message text is cached per lead to prevent redundant API calls
- [x] **AI-03**: Personalized message text is passed to Make.com webhook payload for use in SMS/email templates

### LCC Dashboard

- [x] **DASH-01**: LCC can view their full lead pipeline grouped by stage
- [x] **DASH-02**: LCC can click a lead to see full details (family info, source, all activity timestamps)
- [x] **DASH-03**: LCC can see count of leads at each pipeline stage
- [x] **DASH-04**: LCC can see total signed families and estimated commission progress
- [x] **DASH-05**: LCC can see which automations are active on their account

---

## v2.0 Requirements — LCC Personal Website

### Website Infrastructure

- [x] **SITE-01**: The `lccs` table has new columns: `headline`, `subheadline`, `bio`, `bio_teaser`, `photo_url`, `custom_domain` (nullable, for future use)
- [x] **SITE-02**: New `lcc_testimonials` table exists with columns: `id`, `lcc_id` (FK), `family_name`, `quote`, `order_index`, `created_at`
- [x] **SITE-03**: New `lcc_faqs` table exists with columns: `id`, `lcc_id` (FK), `question`, `answer`, `order_index`, `created_at`
- [x] **SITE-04**: A Supabase Storage bucket (`lcc-photos`) exists with public read access for LCC photo assets
- [x] **SITE-05**: Middleware allows unauthenticated access to `/[lccSlug]/about`, `/[lccSlug]/au-pairs`, `/[lccSlug]/faq`, and `/[lccSlug]/testimonials`
- [x] **SITE-06**: All LCC website pages share a sticky navigation layout (LCC name + nav links + "Get Started" CTA)
- [x] **SITE-07**: The navigation collapses to a hamburger menu on mobile viewports

### Public Pages

- [x] **PAGE-01**: The LCC landing page (`/[lccSlug]/`) is a full scrollable page with: Hero (photo, headline, CTA), About teaser, Au Pair teaser, Testimonials snippet (up to 3), and the lead capture form
- [x] **PAGE-02**: The "Get Started" nav CTA scrolls to the lead capture form on the landing page (via `id="form"` anchor)
- [x] **PAGE-03**: The `/[lccSlug]/about` page displays the LCC's full bio and photo (from DB)
- [x] **PAGE-04**: The `/[lccSlug]/au-pairs` page displays a static educational explainer about the au pair program (costs, how it works, visa, vs. nanny — shared content for all LCCs)
- [x] **PAGE-05**: The `/[lccSlug]/faq` page displays the LCC's FAQ entries in order (from DB)
- [x] **PAGE-06**: The `/[lccSlug]/testimonials` page displays all of the LCC's testimonials in order (from DB)

### Content Seeding (Kim)

- [x] **CONT-01**: Kim's website content is seeded via migration: `headline`, `subheadline`, `bio`, `bio_teaser`, `photo_url` (AI-drafted copy, placeholder photo URL)
- [x] **CONT-02**: At least 3 placeholder testimonials are seeded for Kim via migration (AI-drafted, to be replaced with real ones)
- [x] **CONT-03**: At least 5 FAQ entries are seeded for Kim via migration (AI-drafted, covering common family questions)

### SEO

- [ ] **SEO-01**: Each public LCC website page has a unique `<title>` and `<meta name="description">` tag generated from DB content
- [ ] **SEO-02**: Each public LCC website page has Open Graph tags (`og:title`, `og:description`, `og:image`) using the LCC's `photo_url`

---

## Future Requirements

### Custom Domain Support (v2.1)

- **DOM-01**: Middleware detects incoming hostname and maps it to the correct LCC slug (via `custom_domain` column)
- **DOM-02**: When an LCC has a `custom_domain` set, visiting `/[lccSlug]/` redirects (301) to their custom domain
- **DOM-03**: LCC setup flow: buy domain → point DNS to Vercel → operator sets `custom_domain` in DB

### LCC Self-Editing (v2.1)

- **EDIT-01**: LCC can edit their bio and bio teaser from the dashboard
- **EDIT-02**: LCC can add, edit, and delete testimonials from the dashboard
- **EDIT-03**: LCC can add, edit, and delete FAQ entries from the dashboard
- **EDIT-04**: LCC can update their photo URL from the dashboard

### Operator Admin (Carried from v1.0)

- **OPS-01**: Operator can view all LCC accounts and their pipeline summaries in one view
- **OPS-02**: Operator can create a new LCC account (provisions Supabase auth user + RLS tenant)
- **OPS-03**: Operator can configure Make.com webhook URLs for each LCC's automations
- **OPS-04**: Operator can view any individual LCC's full pipeline (bypassing RLS)
- **OPS-05**: Operator can manually move leads through stages for any LCC

### Billing (Carried from v1.0)

- **BILL-01**: Stripe subscription product exists for monthly retainer ($500–$1,500/month tier)
- **BILL-02**: LCC account is linked to a Stripe subscription customer
- **BILL-03**: Failed payment or subscription cancellation disables LCC's active automations
- **BILL-04**: Stripe webhook handles: subscription created, payment failed, subscription cancelled

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Mobile native app | Web-first; mobile-responsive sufficient |
| LCC self-service signup | Operator-managed onboarding — done-for-you model |
| In-app messaging (LCC ↔ family) | SMS/email via Make.com handles all communication |
| LCC-editable automation sequences | Done-for-you means operator controls sequences |
| Custom domain routing | Deferred to v2.1 — build site first, domain infra later |
| LCC self-editing dashboard UI | Deferred to v2.1 — site ships with operator-seeded content |
| File upload UI for photos | Operator uploads to Supabase Storage directly; no UI needed for v2.0 |
| Analytics / reporting | Deferred |

---

## Traceability

*Updated after roadmap creation*

### v1.0 (Complete)

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01–06 | Phase 1 | Complete |
| LEAD-01–06 | Phase 2 | Complete |
| PIPE-01–05 | Phase 2–3 | Complete |
| AUTO-01–06 | Phase 2 | Complete |
| DASH-01–05 | Phase 3 | Complete |
| AI-01–03 | Phase 5 | Complete |

### v2.0 (This Milestone)

| Requirement | Phase | Status |
|-------------|-------|--------|
| SITE-01 | Phase 6 | Complete |
| SITE-02 | Phase 6 | Complete |
| SITE-03 | Phase 6 | Complete |
| SITE-04 | Phase 6 | Complete |
| SITE-05 | Phase 6 | Complete |
| SITE-06 | Phase 6 | Complete |
| SITE-07 | Phase 6 | Complete |
| PAGE-01 | Phase 7 | Complete |
| PAGE-02 | Phase 7 | Complete |
| PAGE-03 | Phase 7 | Complete |
| PAGE-04 | Phase 7 | Complete |
| PAGE-05 | Phase 7 | Complete |
| PAGE-06 | Phase 7 | Complete |
| CONT-01 | Phase 7 | Complete |
| CONT-02 | Phase 7 | Complete |
| CONT-03 | Phase 7 | Complete |
| SEO-01 | Phase 8 | Pending |
| SEO-02 | Phase 8 | Pending |

**Coverage:**
- v2.0 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0

---
*Requirements defined: 2026-03-14*
*Last updated: 2026-04-04 — v2.0 traceability completed after roadmap creation*
