# Phase 7: Public Pages and Content - Context

**Gathered:** 2026-04-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Full landing page redesign (hero → about teaser → au pairs teaser → testimonials snippet → lead form), four sub-pages filled in (/about, /au-pairs, /faq, /testimonials), and Kim's content seeded via a new migration. Nav layout and DB schema are already done (Phase 6). This phase adds all the visible page content and copy.

</domain>

<decisions>
## Implementation Decisions

### Landing page hero
- **Layout:** Two-column split — LCC photo left, headline + subheadline + CTA right
- **Photo shape:** Rounded rectangle (not circle)
- **Mobile collapse:** Photo stacks on top, text + CTA below (single column)
- **Background:** Warm cream (`brand-pageBg` #f7f1ef)
- **Height:** Full viewport height (`min-h-screen`) — strong first impression, pushes sections below the fold
- **CTA label:** "Get Started" — matches nav CTA, scrolls to `#form` anchor

### Landing page sections
- **Visual structure:** Alternating background rows (white → cream → white → cream) — no dividers needed, sections separate naturally
- **About teaser:** Section title + 2–3 sentences from `bio_teaser` DB field + "Read more →" link to `/about`. Text only, no secondary image.
- **Au Pairs teaser:** Section title + brief intro text + "Learn more →" link to `/au-pairs`. Text only.
- **Testimonials snippet:** Single featured testimonial (first from DB) displayed large — prominent quote styling + family name. "See all →" link to `/testimonials`. Not a 3-card grid.
- **Form section:** Section headline + 1-line subtext above the existing `LeadCaptureForm` (e.g., "Ready to find your au pair?" — Claude picks exact copy). Gives the form context as a named section.

### /about page
- Display LCC's full bio (`bio` column) and photo (`photo_url`) from DB
- If `photo_url` is NULL, render gracefully (no broken img — show no photo or initials fallback)
- No CTA needed — nav handles it

### /au-pairs page
- **Structure:** Accordion / expandable sections (not prose columns or cards)
- **4 accordion items:**
  1. How It Works
  2. Program Costs
  3. Au Pair vs. Nanny — uses a **comparison table** inside the accordion (not prose)
  4. Common Questions / Myths
- **Visa questions:** Not included on this page — deferred to Kim's FAQ entries
- **No CTA at bottom** — nav "Get Started" button handles it
- Static content, shared for all LCCs (not DB-driven)

### /faq page
- Render all `lcc_faqs` rows for the LCC ordered by `order_index`
- Simple list (question as heading, answer as paragraph) — no accordion needed since the page is just FAQs
- Empty state if no FAQs exist

### /testimonials page
- Render all `lcc_testimonials` rows ordered by `order_index`
- Each testimonial: quote (prominent) + family name
- Empty state if no testimonials exist

### Kim's seed content (migration)
- **Source:** Fully AI-drafted placeholder copy — operator/Kim swaps with real content before live demo
- **photo_url:** NULL — pages handle null gracefully. Real photo uploaded to Supabase Storage by operator.
- **Headline positioning:** Claude picks the best headline for a "Local Childcare Consultant who helps families find au pairs" — warm, professional, trust-building
- **bio_teaser:** 2–3 sentences for the landing page about teaser
- **bio:** Full paragraph(s) for /about page
- **Testimonials:** At least 3, all family-facing (quote + family first name/last initial)
- **FAQs:** At least 5, all family-facing: cost, timeline, matching process, living arrangement, what happens if it doesn't work out. Include 1–2 visa-related questions here (since /au-pairs page deferred visa content to FAQ).

### Claude's Discretion
- Exact copy for hero subheadline, Kim's headline, about section title, au pairs section title, form section headline/subtext
- Exact alternating section background assignments (which section is white vs. cream)
- Tailwind spacing, font sizes, and padding for all sections
- Comparison table column headers and row labels for au pair vs. nanny
- Accordion component implementation (shadcn Accordion or custom — whatever fits existing stack)
- Graceful fallback rendering when `photo_url` is NULL on landing page and /about

</decisions>

<specifics>
## Specific Ideas

- The existing `LeadCaptureForm` component is reused as-is — the form section on the landing page wraps it with a headline + subtext, not a replacement
- LCC = Local Childcare Consultant (user clarified) — copy should use this framing when referring to Kim's role
- Visa content deliberately excluded from /au-pairs — Cultural Care (the agency) handles visa, so this is outside LCC scope. Route those questions to Kim's FAQ instead.
- The single featured testimonial in the landing snippet is intentional — creates focus vs. a 3-card grid that could feel busy

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/[lccSlug]/LeadCaptureForm.tsx` — Existing form component with TCPA consent, reused as-is in the form section
- `app/[lccSlug]/layout.tsx` — Already wraps all pages with `LccWebNav` sticky nav; no changes needed to layout
- `components/LccWebNav.tsx` — Nav is complete with hamburger, active states, CTA logic
- `utils/supabase/admin.ts` — `createAdminClient()` used for public page data fetching (bypasses RLS for public reads)
- `tailwind.config.ts` — Brand palette: `brand-pageBg` (#f7f1ef), `brand-body` (#3d3535), `brand-gold` (#8fac94), `brand-muted` (#9e8a82), `brand-cardBg` (#fdfaf9)

### Established Patterns
- Page data fetching: Server components use `createAdminClient()` + `.from('lccs').select(...).eq('slug', params.lccSlug).single()` — same pattern for testimonials and FAQs
- `notFound()` from `next/navigation` for missing LCC slug
- Migrations in `/supabase/migrations/` — sequential SQL files

### Sub-page stubs (ready to fill in)
- `app/[lccSlug]/about/page.tsx` — stub returning placeholder div
- `app/[lccSlug]/faq/page.tsx` — stub returning placeholder div
- `app/[lccSlug]/testimonials/page.tsx` — stub returning placeholder div
- `app/[lccSlug]/au-pairs/page.tsx` — stub returning placeholder div

### Integration Points
- Landing page `app/[lccSlug]/page.tsx` — complete rewrite: fetch `headline`, `subheadline`, `bio_teaser`, `photo_url` from `lccs`; fetch up to 3 testimonials from `lcc_testimonials`; render hero + sections + form
- `lcc_testimonials` table — `id, lcc_id, family_name, quote, order_index, created_at`
- `lcc_faqs` table — `id, lcc_id, question, answer, order_index, created_at`
- New seed migration — inserts Kim's `headline`, `subheadline`, `bio`, `bio_teaser`, photo_url=NULL; inserts 3 testimonials + 5 FAQs for kim-johnson LCC row

</code_context>

<deferred>
## Deferred Ideas

- Visa questions on /au-pairs page — Cultural Care handles visa process, out of LCC scope. Kim's FAQ seed will include 1–2 visa-related questions instead.
- Multiple photos / gallery — single `photo_url` per LCC for v2.0
- LCC self-editing of bio/testimonials/FAQs — v2.1 (EDIT-01 through EDIT-04 in REQUIREMENTS.md)
- CTA button on /au-pairs page — user decided nav CTA is sufficient; bottom CTA deferred

</deferred>

---

*Phase: 07-public-pages-and-content*
*Context gathered: 2026-04-07*
