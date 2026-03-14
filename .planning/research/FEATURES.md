# Feature Research

**Domain:** Done-for-you lead generation SaaS — niche service business (au pair LCC)
**Researched:** 2026-03-14
**Confidence:** MEDIUM-HIGH (GoHighLevel/agency CRM ecosystem well-documented; au pair niche specifics inferred from lead gen patterns)

---

## User Types

| Role | What They Care About |
|------|----------------------|
| **Operator** | All LCCs in one view, onboarding, billing, system health |
| **LCC (client)** | My pipeline, my leads, my metrics — read-only reassurance |
| **Family (lead)** | Simple form, fast follow-up, no login required |

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features the Operator and LCCs assume exist. Missing these = product feels unfinished or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| LCC-specific lead capture form/landing page | Every lead gen tool has a unique intake URL per client | LOW | Simple form: family name, email, phone, zip, source. One URL per LCC tenant. |
| Automated lead routing to correct LCC | Submitted form must land in the right pipeline instantly | LOW | Determined by form URL/slug — no manual sorting. |
| Pipeline stage view (Interested → Contacted → Qualified → Signed) | Any CRM has stages; LCC must see where each lead stands | LOW | 4 fixed stages for v1; no custom stages needed. |
| Lead detail record | Name, email, phone, source, created date, last contacted | LOW | Basic contact card. LCC can read; Operator can edit. |
| Multi-tenant data isolation | LCC A cannot see LCC B's leads under any circumstance | MEDIUM | Supabase Row Level Security (RLS) enforces this at DB layer. Critical. |
| LCC login and dashboard | LCC needs proof the system is working; this is the retention hook | MEDIUM | Read-only. Auth via Supabase Auth + role flag. |
| Automated SMS follow-up sequence | Table stakes for lead nurture — speed-to-lead is critical | MEDIUM | Triggered by webhook to Make.com scenario. Twilio or similar. |
| Automated email follow-up sequence | Expected alongside SMS; multi-channel nurture is the standard | MEDIUM | Make.com + Resend. Triggered same webhook as SMS. |
| Operator admin view (all LCCs + all pipelines) | Operator needs to manage accounts without logging into each one | MEDIUM | Single super-admin dashboard. List of LCCs, aggregate stats. |
| Operator: onboard new LCC | Must provision a new LCC pipeline without code | MEDIUM | Form in admin UI creates Supabase tenant row + Make.com scenario copy + login credentials. |
| Stripe billing | Operator bills LCCs; system must automate invoicing | MEDIUM | Stripe Subscriptions: setup fee (one-time) + monthly retainer. |
| Conversion metrics visible to LCC | LCC needs to see leads signed vs. leads in pipeline — their ROI signal | LOW | Simple counts: total leads, by stage, signed this month. |

### Differentiators (Competitive Advantage)

Features that justify the $500–1,500/month retainer over a generic CRM and give the Operator a defensible product.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| AI-personalized follow-up messages | Generic SMS/email gets ignored; personalized copy lifts reply rates and sets this apart from DIY tools | HIGH | Claude API generates message variants from family's name, source, and interest signal. Make.com passes context; Claude returns message body. |
| Post-sign referral automation | Every signed family is a referral machine — most operators ignore this entirely | MEDIUM | Triggered on stage change to "Signed". Make.com sends templated SMS asking for 1–2 family referrals with LCC's name. |
| LCC commission progress tracker | LCC cares most about "how many signed = how much money?" — show it directly | LOW | Simple: signed count × commission rate. Commission rate set per LCC by Operator. |
| AI-generated monthly summary report | LCC gets a narrative "this month your pipeline grew by X, here's what's next" — feels premium | MEDIUM | Claude API generates a 2–3 sentence summary from monthly metrics. Delivered via email. |
| Speed-to-lead trigger (< 60 second first SMS) | Research shows contact within 5 minutes increases conversion 9x; sub-60s is a selling point | LOW | Webhook fires on form submit → Make.com → immediate SMS. No batching. |
| Source tracking per lead | Operator can show LCC which ad/channel is converting, proving ad spend ROI | LOW | UTM param or hidden form field captured at submission. Stored on lead record. |

### Anti-Features (Deliberately Not Building)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| LCC self-service signup flow | "Make it scalable, let LCCs sign up themselves" | Destroys the done-for-you value prop; operator loses white-glove positioning and ability to vet LCCs | Operator-managed onboarding — keeps retention and quality control |
| In-app messaging between LCC and families | "LCC should be able to message leads from the app" | Duplicates SMS/email channel, adds compliance complexity (TCPA, CAN-SPAM), hard to build well | All outreach goes through Make.com automation — no inbox needed in v1 |
| Native mobile app | "LCCs want an app" | High build cost, app store friction, mobile-responsive web is sufficient for a dashboard LCCs check occasionally | Responsive Next.js web app — works on mobile without native overhead |
| Custom white-labeling per LCC | "Each LCC wants their own brand" | Custom domain management, SSL per tenant, branding variations = ops nightmare at small scale | Single brand for v1; introduce white-label at v2 if LCCs request it |
| LCC-editable nurture sequences | "Let LCCs customize their own follow-up messages" | Kills the "done-for-you" promise; LCCs don't want to do this work | Operator manages sequences; AI personalization handles the variation families care about |
| Real-time chat / live lead notification | "Alert LCC the second a lead comes in" | Complex websocket infrastructure; LCCs are part-time coordinators, not full-time sales reps | Email digest or daily summary email to LCC is sufficient for v1 |
| Lead scoring / predictive qualification | "Rank leads by likelihood to convert" | Requires training data the product doesn't have yet; adds build time for unproven value | Pipeline stages are the qualification signal; add scoring in v2 after data accumulates |
| Two-way SMS inbox for LCC | "LCC wants to reply to leads from dashboard" | Compliance risk, support burden, LCC engagement model doesn't require it | Operator monitors replies via Make.com; LCC only sees pipeline outcomes |

---

## Feature Dependencies

```
[Family fills LCC form]
    └──triggers──> [Lead capture + routing]
                       └──requires──> [Multi-tenant data isolation (RLS)]
                       └──triggers──> [Automated SMS + email nurture]
                                          └──requires──> [Make.com webhook integration]
                                          └──enhances──> [AI-personalized messages (Claude API)]

[LCC dashboard]
    └──requires──> [Multi-tenant data isolation]
    └──requires──> [LCC login + auth]
    └──displays──> [Pipeline stage view]
    └──displays──> [Conversion metrics + commission progress]

[Operator admin view]
    └──requires──> [LCC login + auth (roles: operator vs. LCC)]
    └──requires──> [Multi-tenant data isolation]
    └──includes──> [Operator: onboard new LCC]
                       └──triggers──> [Stripe subscription creation]
                       └──triggers──> [Make.com scenario provisioning]

[Post-sign referral automation]
    └──requires──> [Pipeline stage: Signed]
    └──requires──> [Make.com webhook integration]

[AI monthly summary report]
    └──requires──> [Conversion metrics data]
    └──requires──> [Claude API integration]
    └──enhances──> [LCC retention / perceived value]

[Source tracking]
    └──requires──> [Lead capture form (UTM/hidden field)]
    └──enhances──> [LCC conversion metrics dashboard]
```

### Dependency Notes

- **Multi-tenant data isolation requires Supabase RLS:** This is the foundation. Auth, LCC dashboard, and Operator view all depend on correct tenant scoping. Must be built before any UI that displays lead data.
- **Make.com webhook integration required for SMS/email AND referral automation:** Both nurture sequences and post-sign referral requests share the same triggering pattern. Build the webhook contract once; Make.com scenarios consume it.
- **Operator onboarding requires Stripe, Make.com, and tenant provisioning to all work:** These three things fire together when an LCC is onboarded. Complexity is moderate but the coordination is where bugs hide.
- **AI personalization enhances but does not block nurture sequences:** Ship plain-text SMS/email sequences first. Layer in Claude API message generation once the core trigger flow is verified working.
- **Commission progress requires commission rate per LCC:** Operator must set a commission value when onboarding each LCC. Simple field; don't skip it or the metrics widget breaks.

---

## MVP Definition

### Launch With (v1)

Minimum to deliver to first paying LCC client.

- [ ] LCC-specific lead capture form with instant pipeline routing — without this, there's no lead data
- [ ] Multi-tenant RLS in Supabase — without this, data isolation is broken at the foundation
- [ ] Automated SMS + email nurture sequence via Make.com — this is the core product promise
- [ ] Speed-to-lead: < 60 second first SMS on form submit — conversion lift is the key selling point
- [ ] Pipeline stage view in LCC dashboard (Interested → Contacted → Qualified → Signed) — LCC login with real data = retention
- [ ] Lead detail records visible to LCC — name, source, last contacted
- [ ] Conversion metrics + commission progress on LCC dashboard — answers "is this worth my money?"
- [ ] Operator admin view: all LCCs, all pipelines — operator needs to manage accounts
- [ ] Operator: onboard new LCC (provision tenant + Stripe subscription) — required to sell to second client
- [ ] Stripe billing: setup fee + monthly retainer — required to get paid

### Add After Validation (v1.x)

Add once first 2–3 LCCs are live and pipeline data is accumulating.

- [ ] AI-personalized follow-up messages (Claude API) — validate base system works first; add AI layer after confirming webhook flow is reliable
- [ ] Post-sign referral automation — add when first family reaches "Signed" stage; easy Make.com trigger
- [ ] Source tracking (UTM on form) — add when LCC asks "where are my best leads coming from?"
- [ ] AI monthly summary report email to LCC — add when monthly billing cycle has completed once

### Future Consideration (v2+)

Defer until product-market fit is established with 5+ paying LCCs.

- [ ] White-label per LCC — only relevant if a specific LCC requests it and will pay a premium
- [ ] Two-way SMS inbox (Operator-facing only, not LCC) — useful for Operator to manage edge case replies
- [ ] Lead scoring — needs 100+ historical signed leads to have meaningful signal
- [ ] Multi-sequence variant testing (A/B nurture sequences) — premature until conversion baseline exists

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Lead capture form + routing | HIGH | LOW | P1 |
| Multi-tenant RLS | HIGH | MEDIUM | P1 |
| SMS + email nurture via Make.com | HIGH | MEDIUM | P1 |
| Speed-to-lead (< 60s first SMS) | HIGH | LOW | P1 |
| LCC dashboard + pipeline view | HIGH | MEDIUM | P1 |
| Conversion metrics + commission tracker | HIGH | LOW | P1 |
| Operator admin view | HIGH | MEDIUM | P1 |
| Operator LCC onboarding flow | HIGH | MEDIUM | P1 |
| Stripe billing integration | HIGH | MEDIUM | P1 |
| AI-personalized messages (Claude API) | HIGH | MEDIUM | P2 |
| Post-sign referral automation | MEDIUM | LOW | P2 |
| Source tracking (UTM) | MEDIUM | LOW | P2 |
| AI monthly report narrative | MEDIUM | LOW | P2 |
| White-label per LCC | LOW | HIGH | P3 |
| Lead scoring | LOW | HIGH | P3 |
| Two-way SMS inbox | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | GoHighLevel (agency CRM) | Standard CRM (HubSpot/Pipedrive) | LCC Lead Engine |
|---------|--------------------------|-----------------------------------|-----------------|
| Multi-tenant sub-accounts | Yes, built-in architecture | No (single-account tools) | Yes — Supabase RLS |
| Automated SMS/email nurture | Yes, native | Via integrations | Yes — Make.com |
| Client (LCC) read-only dashboard | Configurable per sub-account | Limited | Yes — core feature |
| Operator "all clients" view | Yes, top-level agency view | No | Yes — operator admin |
| AI message personalization | Basic AI features in 2026 | No | Yes — Claude API (differentiator) |
| Post-sign referral automation | Manual trigger or Zap | No | Yes — Make.com scenario |
| Commission progress tracker | No | No | Yes — niche-specific differentiator |
| Stripe billing management | Yes (SaaS mode) | No | Yes — Stripe Subscriptions |
| Setup cost | $497–$997/month platform fee | $45–$800/month | Custom build — no platform fee |
| Niche fit for au pair LCCs | Generic, requires heavy config | Generic | Purpose-built — instant fit |

**Key competitive insight:** GoHighLevel is the closest analog. The LCC Lead Engine wins not by having more features, but by being purpose-built for this niche — no configuration, no learning curve, delivered as a service. The done-for-you model means LCCs never log into a complex tool; they see a clean dashboard with their numbers.

---

## Sources

- [GoHighLevel Features 2026: CRM, Automation, AI & More](https://www.centripe.ai/gohighlevel-features) — MEDIUM confidence (product marketing, verified against multiple GHL sources)
- [GoHighLevel CRM Explained: What It Is & How It Works (2026)](https://www.digital4design.com/blog/gohighlevel-crm-explained/) — MEDIUM confidence
- [White Label CRM for Agencies — What to Look For](https://ghl-services-playbooks-automation-crm-marketing.ghost.io/white-label-crm-for-agencies-what-to-look-for-what-to-avoid-and-why-most-agencies-pick-highlevel/) — MEDIUM confidence
- [Top SMS Strategies for Effective Lead Nurturing in 2025](https://www.textmagic.com/blog/lead-nurturing-strategies-with-sms-marketing/) — MEDIUM confidence
- [Automated Follow-Up Emails: Best Practices for 2025](https://www.smartlead.ai/blog/automated-follow-up-emails) — MEDIUM confidence
- [CRM Dashboards: Real-Time KPIs, Pipeline Views, and Examples](https://monday.com/blog/crm-and-sales/crm-dashboards/) — MEDIUM confidence
- [Au Pair Agency Software for Placement & Scheduling](https://enginehire.io/au-pair-agency-software/) — LOW confidence (narrow source, au pair niche)
- Industry pattern: speed-to-lead (< 5 min = 9x conversion) is widely cited across lead gen literature — HIGH confidence

---

*Feature research for: LCC Lead Engine — done-for-you lead generation SaaS for au pair LCCs*
*Researched: 2026-03-14*
