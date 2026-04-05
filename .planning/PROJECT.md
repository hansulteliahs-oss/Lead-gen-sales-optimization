# LCC Lead Engine

## What This Is

A done-for-you lead generation system for au pair LCCs (Local Childcare Coordinators). The operator (the builder) runs the full system; each LCC client gets a personal website for family discovery, a simple dashboard login to see their pipeline, and fully automated lead nurture. The system captures, nurtures, and converts families interested in au pairs on autopilot — delivered as a retainer service priced at $1,000–2,000 setup + $500–1,500/month.

## Current Milestone: v2.0 — LCC Personal Website

**Goal:** Transform each LCC's public URL into a full personal website — a multi-page, DB-driven site with bio, au pair education, testimonials, and FAQ — turning the SaaS pitch from "lead pipeline tool" to "your own personal website + automated lead capture + dashboard."

**Target features:**
- Full scrollable landing page with hero, about teaser, au pair teaser, testimonials snippet, and lead form
- Sub-pages: /about, /au-pairs (static), /faq, /testimonials
- Sticky navigation with hamburger menu on mobile
- DB-driven content per LCC (bio, testimonials, FAQs) seeded for Kim
- Supabase Storage bucket for LCC photos
- Basic SEO (meta tags, Open Graph) on every page

## Core Value

More families signed for each LCC — a fully automated lead generation and nurture system that turns family interest into au pair sign-ups, without the LCC lifting a finger.

## Requirements

### Validated

- ✓ Multi-tenant data isolation via Supabase RLS — v1.0
- ✓ Families can submit interest via LCC-specific landing pages/forms — v1.0
- ✓ Leads instantly captured and routed to the correct LCC's pipeline — v1.0
- ✓ Make.com webhook triggered on new lead for SMS/email nurture sequence — v1.0
- ✓ Claude API generates personalized follow-up message per lead — v1.0
- ✓ Referral automation triggers on family sign-up — v1.0
- ✓ LCCs can log in and view their pipeline by stage — v1.0
- ✓ LCCs can see lead details and conversion metrics — v1.0

### Active (v2.0)

- [ ] Each LCC has a full personal website (landing + sub-pages) at their slug URL
- [ ] Website has sticky navigation with hamburger on mobile
- [ ] DB-driven content per LCC: bio, testimonials, FAQs
- [ ] Supabase Storage bucket for LCC photos
- [ ] Kim's content seeded (bio, testimonials, FAQs, photo)
- [ ] Basic SEO on all public website pages
- [ ] Operator admin dashboard and LCC provisioning
- [ ] Stripe subscription billing

### Out of Scope

- Mobile native app — web-first; mobile responsive is sufficient for v1
- LCC self-service signup — operator-managed onboarding for white-glove delivery model
- Direct messaging between LCC and families inside app — use SMS/email via Make.com
- Custom white-labeling per LCC — single brand for v1

## Context

- **Sales channel:** Builder has direct personal relationships with LCCs — first sales are close
- **MCP leverage:** Supabase, Stripe, Make.com, and Notion MCP connections available — infrastructure can be provisioned programmatically during build
- **Lead sources:** Facebook/Instagram ads, landing pages, existing LCC outreach, referral automation
- **Industry:** Au pair industry — families pay agencies, LCCs earn commission per sign-up
- **Pipeline stages:** Interested → Contacted → Qualified → Signed
- **Automation platform:** Make.com handles nurture sequences, triggered by webhooks from the app
- **AI usage:** Claude API (claude-opus-4-6) for personalized follow-up message generation and monthly report narratives

## Constraints

- **Speed:** Prioritize shipping over polish — weeks not months, first sale is close
- **Tech Stack:** Next.js 14 (App Router), Supabase, Tailwind CSS + shadcn/ui, Stripe, Make.com, Claude API, Twilio or Resend, Vercel
- **Delivery model:** Operator-run (operator manages all LCC accounts; LCCs get read-only pipeline view)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js 14 App Router | Full-stack, fast to ship, Vercel deployment | — Pending |
| Supabase for DB + Auth | MCP provisioning, built-in RLS for multi-tenancy, auth included | — Pending |
| Make.com for automations | MCP can build and activate scenarios during build, no code needed | — Pending |
| Claude API for personalization | Differentiated follow-up messages increase conversion rates | — Pending |
| Stripe via MCP | Subscription billing provisioned programmatically, no manual dashboard | — Pending |
| Notion for operator CRM | MCP can create operator client management docs during build | — Pending |
| YOLO mode | Maximum automation, ship fast | — Pending |
| LCC login (not operator-only) | Perceived value for LCCs = retention; they see their pipeline working | — Pending |
| Done-for-you delivery | Higher ticket, retainer-friendly, matches existing LCC relationships | — Pending |
| Website as SaaS template | Each LCC gets same website template — Kim is v1; scales to all future LCCs | — Pending |
| Expand /[lccSlug]/ route (not separate site) | Keeps form integration, auth, and DB in one codebase; zero extra hosting cost | — Pending |
| Custom domain routing deferred | Build public site first; add hostname-based routing in a future milestone when Kim has a domain | — Pending |
| DB-driven content from day one | LCC self-editing dashboard planned for v2.1; DB schema must exist now to support it | — Pending |

---
*Last updated: 2026-04-04 after v2.0 milestone start*
