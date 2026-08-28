---
client: Kim Arvdalen (anonymized in published versions as "an LCC from Cultural Care Au Pair")
company: Cultural Care Au Pair (parent network)
slug: kim-cultural-care
status: v2-refresh
created: 2026-05-08
last_grilled: 2026-05-08
gaps_open: 3
permissions:
  public_name: no
  company_name: yes
  metrics: unknown
  logo: yes (Cultural Care logo OK to use with the name removed; visual mark only)
---

# Kim / Cultural Care Au Pair — case study

## one-liner

Built a Local Childcare Coordinator with Cultural Care Au Pair her first real online presence: a personal website, a speed-to-lead capture system, and SEO that is already pulling Google traffic. She had nothing pulling families in before. Now there is a site, a form, automated first-touch email, and a Google Business Profile working in her favor.

> Note: site went live in early May 2026. Google traffic is starting to show up. Conversion metrics (leads through the site, families signed) are still pre-data. Quote and metrics permissions are flagged as gaps.

## before

- No website. No way for a host family to find her by searching.
- No lead capture. Anyone interested had to know her personally or be referred.
- A handful of families per year, mostly word-of-mouth and existing host-family referrals.
- Context on the role: an LCC (Local Childcare Coordinator) is part sales rep, part area manager. Kim earns a commission for every host family that signs through her, and she manages 10 to 15 au pairs in her local area. Her main income is the sales side, so families-in is the lever. Before the site, that lever had no leverage.

## why they reached out

Kim is family (my dad's girlfriend). She mentioned she wanted to seriously try to grow her host-family roster and that she had nothing in place to do it. This was right around the time I was getting deep into Claude Code and AI builds. Once I saw what Claude Code could actually do, I told her I could build it. It took a while because I was learning, and then I did.

## what we built

- **Personal website** at `/kim-arvdalen` on the LCC lead engine: home, about, au pairs, FAQ, testimonials.
- **Dynamic content** — bio, FAQs, testimonials, photo all live in Supabase and are served at request time. No code deploy when she wants to update something.
- **Speed-to-lead capture system**: contact form on every page with TCPA-compliant consent. Form submit triggers an automated first-touch email back to the family in under a minute, generated with Claude API and personalized to the inquiry. SMS path also wired (Twilio). Make.com handles the orchestration.
- **SEO setup**: per-page titles, meta descriptions, Open Graph tags, dynamic metadata pulled from the database. Already showing up in Google.
- **Google Business Profile** so families searching her area can find her. This is the channel showing the earliest signal.
- **Stack**: Next.js 14 (App Router), Tailwind CSS, shadcn/ui, Supabase (Postgres + Row Level Security), Vercel, Make.com, Claude API, Twilio, Resend.
- **Timeline**: started March 2026. Site went live in early May 2026. Most complex build to date.
- **Why this stack**: same architecture is meant to scale to other LCCs on the Cultural Care network. The multi-tenant backbone is already there even though Kim is the only one on it today.

## after

- **time saved:** `[GAP: site just went live. No measured time saved yet. Re-grill 30 days post-launch or after the first 5 inquiries come through, whichever first. See gaps.md.]`
- **money saved or made:** Kim earns about $800 per host family signed (Cultural Care commission). Lift attributable to the site is `[GAP: pre-data. Re-grill once families have come through and we can attribute signups to the site vs. her existing word-of-mouth flow.]`
- **friction removed:**
  - She has somewhere to send a curious family. Before, the answer was "let me text you my info." Now it is a real URL with an about page, an FAQ, and a contact form.
  - First-touch is automatic. Form submit triggers a personalized email back inside a minute, so a family that fills it out at 11pm does not wait until morning to feel responded to.
  - Google Business Profile + on-page SEO mean her name is showing up in local searches she was invisible to before. Earliest measurable signal so far.

## quote

`[GAP: testimonial pending. Informal positive vibes only so far. Re-grill after 2 weeks of live traffic, when there is a real "this changed something" moment to anchor the ask. Suggested phrasing in gaps.md.]`

## what's next

Site is live. Watch Google signal for the next two weeks, then push on a marketing engine on top: automated content distribution to drive more families to the site (auto-posting, content repurposing, channel mix open). Multi-tenant backbone is already in place if a second LCC wants the same setup.

## permissions

- **public name**: no. Use "an LCC from Cultural Care Au Pair" in published versions, including handledbuilds.com, LinkedIn, and cold-email use.
- **company name**: yes. Cultural Care Au Pair is OK to name as the parent network.
- **logo**: yes, with the name removed. Visual mark only. Do not use the wordmark.
- **metrics public**: unknown. Revisit once there are real numbers to publish, and ask Kim explicitly.

## related

- `projects/kim-cultural-care.md` — combined case study + project overview (frontend-emphasized, with tech stack and multi-tenant architecture folded in; refreshed 2026-05-14)
- `drafts/case-studies/kim-cultural-care/gaps.md` — open chase-actions
