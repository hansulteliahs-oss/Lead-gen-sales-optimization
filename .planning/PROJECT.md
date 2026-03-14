# LCC Lead Engine

## What This Is

A done-for-you lead generation system for au pair LCCs (Local Childcare Coordinators). The operator (the builder) runs the full system; each LCC client gets a simple dashboard login to see their pipeline. The system captures, nurtures, and converts families interested in au pairs on autopilot — delivered as a retainer service priced at $1,000–2,000 setup + $500–1,500/month.

## Core Value

More families signed for each LCC — a fully automated lead generation and nurture system that turns family interest into au pair sign-ups, without the LCC lifting a finger.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Families can submit interest via LCC-specific landing pages/forms
- [ ] Leads are instantly captured and routed to the correct LCC's pipeline
- [ ] System sends automated SMS/email follow-up sequences via Make.com
- [ ] Claude API generates personalized follow-up messages per family
- [ ] After family signs up, referral automation triggers to request referrals
- [ ] LCCs can log in and view their own pipeline (interested → contacted → qualified → signed)
- [ ] LCCs can see lead details (family info, source, last contacted date)
- [ ] LCCs can see conversion metrics and commission progress
- [ ] Operator can view all LCCs and their clients in a single dashboard
- [ ] Operator can onboard new LCC clients and provision their pipeline
- [ ] Stripe subscription billing handles setup fees and monthly retainers
- [ ] Multi-tenant data isolation: each LCC only sees their own leads

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

---
*Last updated: 2026-03-14 after initialization*
