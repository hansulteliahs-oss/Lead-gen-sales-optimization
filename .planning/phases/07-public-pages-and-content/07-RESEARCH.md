# Phase 7: Public Pages and Content - Research

**Researched:** 2026-04-07
**Domain:** Next.js 14 App Router — server components, page composition, Tailwind UI, Supabase data fetching, SQL migrations
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Landing page hero:**
- Layout: Two-column split — LCC photo left, headline + subheadline + CTA right
- Photo shape: Rounded rectangle (not circle)
- Mobile collapse: Photo stacks on top, text + CTA below (single column)
- Background: Warm cream (`brand-pageBg` #f7f1ef)
- Height: Full viewport height (`min-h-screen`)
- CTA label: "Get Started" — scrolls to `#form` anchor

**Landing page sections:**
- Visual structure: Alternating background rows (white → cream → white → cream) — no dividers needed
- About teaser: Section title + 2–3 sentences from `bio_teaser` DB field + "Read more →" link to `/about`. Text only, no secondary image.
- Au Pairs teaser: Section title + brief intro text + "Learn more →" link to `/au-pairs`. Text only.
- Testimonials snippet: Single featured testimonial (first from DB) displayed large — prominent quote styling + family name. "See all →" link to `/testimonials`. Not a 3-card grid.
- Form section: Section headline + 1-line subtext above existing `LeadCaptureForm`

**About page (`/[lccSlug]/about`):**
- Display LCC's full bio (`bio` column) and photo (`photo_url`) from DB
- If `photo_url` is NULL, render gracefully — no broken img, show no photo or initials fallback
- No CTA needed

**Au Pairs page (`/[lccSlug]/au-pairs`):**
- Structure: Accordion / expandable sections
- 4 accordion items: How It Works, Program Costs, Au Pair vs. Nanny (comparison table inside), Common Questions / Myths
- Visa questions NOT included — deferred to Kim's FAQ entries
- No CTA at bottom
- Static content, shared for all LCCs (not DB-driven)

**FAQ page (`/[lccSlug]/faq`):**
- Render all `lcc_faqs` rows for the LCC ordered by `order_index`
- Simple list (question as heading, answer as paragraph) — no accordion
- Empty state if no FAQs exist

**Testimonials page (`/[lccSlug]/testimonials`):**
- Render all `lcc_testimonials` rows ordered by `order_index`
- Each testimonial: quote (prominent) + family name
- Empty state if no testimonials exist

**Kim's seed content (migration):**
- Source: Fully AI-drafted placeholder copy
- photo_url: NULL — pages handle null gracefully
- Headline: Claude picks best headline for a "Local Childcare Consultant who helps families find au pairs"
- bio_teaser: 2–3 sentences for landing page about teaser
- bio: Full paragraph(s) for /about page
- Testimonials: At least 3, family-facing (quote + family first name/last initial)
- FAQs: At least 5, family-facing: cost, timeline, matching process, living arrangement, what happens if it doesn't work out. Include 1–2 visa-related questions.

### Claude's Discretion
- Exact copy for hero subheadline, Kim's headline, about section title, au pairs section title, form section headline/subtext
- Exact alternating section background assignments (which section is white vs. cream)
- Tailwind spacing, font sizes, and padding for all sections
- Comparison table column headers and row labels for au pair vs. nanny
- Accordion component implementation (shadcn Accordion or custom — whatever fits existing stack)
- Graceful fallback rendering when `photo_url` is NULL on landing page and /about

### Deferred Ideas (OUT OF SCOPE)
- Visa questions on /au-pairs page
- Multiple photos / gallery
- LCC self-editing of bio/testimonials/FAQs (v2.1)
- CTA button on /au-pairs page
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PAGE-01 | Landing page at `/[lccSlug]/` with hero, about teaser, au pairs teaser, testimonials snippet, lead capture form | Hero layout pattern, alternating sections, Supabase data fetch for headline/bio_teaser/photo_url + first testimonial |
| PAGE-02 | "Get Started" nav CTA scrolls to lead form via `id="form"` anchor | Anchor already exists in current page.tsx; nav already uses `#form` href. No new work — just preserve the id on the form section |
| PAGE-03 | `/[lccSlug]/about` displays LCC full bio and photo from DB | Server component fetch pattern, Next.js Image with null guard |
| PAGE-04 | `/[lccSlug]/au-pairs` displays static educational explainer with accordion | Custom accordion with `<details>`/`<summary>` HTML (no external dep), comparison table inside one accordion panel |
| PAGE-05 | `/[lccSlug]/faq` displays LCC FAQ entries ordered by `order_index` | Same server component fetch pattern; simple list render; empty state |
| PAGE-06 | `/[lccSlug]/testimonials` displays all testimonials ordered by `order_index` | Same fetch pattern; quote + family name; empty state |
| CONT-01 | Kim's `headline`, `subheadline`, `bio`, `bio_teaser`, `photo_url`=NULL seeded via migration | SQL UPDATE on kim-johnson row; migration file in `/supabase/migrations/` |
| CONT-02 | At least 3 placeholder testimonials seeded for Kim via migration | SQL INSERT into `lcc_testimonials` using kim-johnson's UUID subquery |
| CONT-03 | At least 5 FAQ entries seeded for Kim via migration | SQL INSERT into `lcc_faqs` using kim-johnson's UUID subquery |
</phase_requirements>

---

## Summary

Phase 7 is entirely a UI and content phase — no new schema, no middleware changes, no new API routes. The database tables (`lcc_testimonials`, `lcc_faqs`), all nullable `lccs` columns, storage bucket, RLS policies, middleware allowlist, nav, and layout are fully complete from Phase 6. The sub-page files exist as stubs. This phase fills in the stubs and rewrites the landing page.

The technical scope is: (1) rewrite `app/[lccSlug]/page.tsx` with the multi-section layout, (2) fill four sub-page stubs with real content and data fetching, (3) write one SQL migration that seeds Kim's copy. All page data fetching follows the already-established pattern of `createAdminClient()` + select + notFound() used in the existing layout and landing page.

The only discretionary implementation decision is the accordion component for `/au-pairs`. The project has no installed component library (no shadcn, no radix). The correct approach is a custom accordion built with native HTML `<details>`/`<summary>` elements — zero dependencies, accessible by default, fully styleable with Tailwind.

**Primary recommendation:** Build all pages as Next.js 14 async server components following the `createAdminClient()` data-fetching pattern already in the codebase. Use native `<details>`/`<summary>` for the au-pairs accordion. Write a single sequential migration for Kim's seed content.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 14.2.35 (pinned) | Server components, page routing | Already in use — all pages are RSC |
| Supabase JS | ^2.99.1 | DB queries from server components | Already in use — `createAdminClient()` established |
| Tailwind CSS | ^3.4.1 | All styling | Already in use — brand tokens in tailwind.config.ts |
| React | ^18 | Client components (accordion toggle if needed) | Already in use |

### No New Dependencies Required
The project has no component library installed. The accordion for `/au-pairs` is implemented with native `<details>`/`<summary>` HTML — zero npm installs, accessible by default, Tailwind-styleable. This is consistent with the project's pattern of building minimal custom components.

---

## Architecture Patterns

### Established Data-Fetching Pattern (HIGH confidence)
Every public page is an `async` server component. The pattern from Phase 6 layout and the existing landing page:

```typescript
// Source: app/[lccSlug]/layout.tsx (existing)
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin'

export default async function SomePage({ params }: { params: { lccSlug: string } }) {
  const supabase = createAdminClient()
  const { data: lcc } = await supabase
    .from('lccs')
    .select('id, headline, subheadline, bio_teaser, photo_url')
    .eq('slug', params.lccSlug)
    .single()

  if (!lcc) notFound()

  return <div>{/* render lcc data */}</div>
}
```

### Fetching Related Records (testimonials, faqs)
```typescript
// Source: established pattern — same admin client, order by order_index
const { data: testimonials } = await supabase
  .from('lcc_testimonials')
  .select('id, family_name, quote, order_index')
  .eq('lcc_id', lcc.id)
  .order('order_index', { ascending: true })

// testimonials will be [] (empty array) if none — not null — safe to render
const { data: faqs } = await supabase
  .from('lcc_faqs')
  .select('id, question, answer, order_index')
  .eq('lcc_id', lcc.id)
  .order('order_index', { ascending: true })
```

Note: Supabase `.from().select()` without `.single()` returns `data: T[] | null`. Safe to default to `[]`.

### Landing Page Multi-Section Layout
The landing page is a complete rewrite of `app/[lccSlug]/page.tsx`. It needs two fetches: one for the LCC row (headline, subheadline, bio_teaser, photo_url), one for testimonials (limit 1 for snippet). Both can run with `await Promise.all([...])` — parallel server fetches are fine in server components (only `triggerAndWait` parallelism is forbidden in Trigger.dev tasks, not in Next.js server components).

```typescript
// Two parallel fetches — fine in RSC
const [{ data: lcc }, { data: testimonials }] = await Promise.all([
  supabase.from('lccs').select('id, name, headline, subheadline, bio_teaser, photo_url').eq('slug', params.lccSlug).single(),
  supabase.from('lcc_testimonials').select('family_name, quote').eq('lcc_id', /* lcc.id needed first */)
])
```

Important: `lcc.id` is needed to fetch testimonials. Sequential fetches are required here:

```typescript
const supabase = createAdminClient()
const { data: lcc } = await supabase
  .from('lccs')
  .select('id, name, slug, headline, subheadline, bio_teaser, photo_url')
  .eq('slug', params.lccSlug)
  .single()

if (!lcc) notFound()

const { data: testimonials } = await supabase
  .from('lcc_testimonials')
  .select('family_name, quote')
  .eq('lcc_id', lcc.id)
  .order('order_index', { ascending: true })
  .limit(1)

const featuredTestimonial = testimonials?.[0] ?? null
```

### Recommended Page Structure
```
app/[lccSlug]/
├── page.tsx                  # REWRITE — full landing page
├── LeadCaptureForm.tsx       # UNCHANGED — reused as-is
├── layout.tsx                # UNCHANGED — wraps all pages with LccWebNav
├── about/
│   └── page.tsx              # FILL IN — bio + photo from DB
├── au-pairs/
│   └── page.tsx              # FILL IN — static accordion content
├── faq/
│   └── page.tsx              # FILL IN — faqs from DB
└── testimonials/
    └── page.tsx              # FILL IN — testimonials from DB

supabase/migrations/
└── 20260407000000_phase7_kim_seed.sql   # NEW — Kim's content seed
```

### Native Accordion Pattern (no dependencies)
The `/au-pairs` page uses native HTML `<details>`/`<summary>` elements. This is the correct approach given no component library is installed.

```typescript
// Tailwind-styled details/summary accordion
<details className="group border-b border-gray-200">
  <summary className="flex items-center justify-between py-4 cursor-pointer list-none text-brand-body font-medium hover:text-brand-gold">
    How It Works
    {/* Chevron rotates open */}
    <span className="transition-transform group-open:rotate-180">▾</span>
  </summary>
  <div className="pb-4 text-brand-muted leading-relaxed">
    {/* content */}
  </div>
</details>
```

The `group-open:` Tailwind variant targets the open state of `<details>` when the parent has `group` class. This works in Tailwind v3 out of the box.

### Comparison Table (inside accordion)
```typescript
// Au Pair vs. Nanny comparison — inside the third accordion panel
<table className="w-full text-sm border-collapse mt-4">
  <thead>
    <tr className="bg-brand-pageBg">
      <th className="text-left py-2 px-3 font-medium text-brand-body">Feature</th>
      <th className="text-left py-2 px-3 font-medium text-brand-body">Au Pair</th>
      <th className="text-left py-2 px-3 font-medium text-brand-body">Nanny</th>
    </tr>
  </thead>
  <tbody>
    {/* rows */}
  </tbody>
</table>
```

### NULL photo_url Graceful Fallback
When `photo_url` is NULL (Kim's seed state), show no broken image. Two safe approaches:

```typescript
// Option A: Conditional render — show initials box if no photo
{lcc.photo_url ? (
  <img
    src={lcc.photo_url}
    alt={`${lcc.name} photo`}
    className="w-full h-full object-cover rounded-xl"
  />
) : (
  <div className="w-full h-full bg-brand-pageBg rounded-xl flex items-center justify-center">
    <span className="text-4xl font-semibold text-brand-muted">
      {lcc.name.charAt(0)}
    </span>
  </div>
)}
```

Note: The project does NOT use `next/image` (no image domain config in `next.config.mjs`). Use a plain `<img>` tag. If `next/image` is desired, `next.config.mjs` must add `images.remotePatterns` for the Supabase storage domain — this is additional scope. Use `<img>` to stay in bounds.

### Alternating Section Backgrounds
Locked decision: alternating white → cream → white → cream. Recommended assignment:
- Hero: `bg-brand-pageBg` (cream) — full viewport
- About teaser: `bg-white`
- Au Pairs teaser: `bg-brand-pageBg` (cream)
- Testimonials snippet: `bg-white`
- Form section: `bg-brand-pageBg` (cream) — form stands out on cream

### Seed Migration Pattern
Follows existing migrations in `/supabase/migrations/`. Use UPDATE for the lccs row (kim-johnson exists from Phase 6 seed) and INSERT for testimonials/faqs with a subquery for the LCC ID.

```sql
-- 20260407000000_phase7_kim_seed.sql

-- CONT-01: Update Kim Johnson's website content
UPDATE public.lccs
SET
  headline    = 'Your Local Guide to Au Pair Childcare',
  subheadline = 'I help families find the perfect au pair — a trusted, live-in childcare partner who fits your home and your schedule.',
  bio_teaser  = 'I''ve spent years helping local families discover the au pair program — a childcare solution that combines flexibility, affordability, and cultural exchange. As your Local Childcare Consultant, I''m here to walk you through every step.',
  bio         = 'Kim Johnson is a certified Local Childcare Consultant with Cultural Care Au Pair, serving families across the area. With a background in early childhood education and a passion for connecting cultures, Kim has guided dozens of families through the process of welcoming an au pair into their home. She offers personalized consultations, answers to every question, and ongoing support from your first call through your au pair''s arrival — and beyond. When she''s not helping families, Kim volunteers with local parent groups and enjoys hiking with her own family.',
  photo_url   = NULL
WHERE slug = 'kim-johnson';

-- CONT-02: Seed at least 3 testimonials for Kim Johnson
INSERT INTO public.lcc_testimonials (lcc_id, family_name, quote, order_index)
SELECT
  id,
  'The Martinez Family',
  'Kim made the whole process feel manageable. She answered every question we had and our au pair has been an incredible addition to our family.',
  0
FROM public.lccs WHERE slug = 'kim-johnson';

-- ... additional inserts for CONT-02 and CONT-03 (at least 3 total testimonials, 5 total FAQs)
```

### Anti-Patterns to Avoid
- **Hardcoding copy in page components:** All LCC-specific copy (headline, bio, testimonials, FAQs) must come from the database. Only the static au pairs educational content is hardcoded.
- **Using `next/image` without domain config:** Plain `<img>` is correct until `next.config.mjs` adds `images.remotePatterns`. Using `<Image>` without config causes a runtime error.
- **Calling `.single()` on testimonials/faqs queries:** These return arrays. `.single()` would throw if there are multiple rows.
- **Forgetting the `id="form"` attribute on the form section wrapper:** PAGE-02 depends on it. The existing `page.tsx` already has `<section id="form">` — must preserve it in the rewrite.
- **Wrapping testimonials fetch in Promise.all with LCC fetch:** Can't fetch testimonials until `lcc.id` is known. Sequential fetches required.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accordion UI | Custom React state toggle | Native `<details>`/`<summary>` | Zero JS, accessible by default, Tailwind `group-open:` handles styling |
| Image optimization | Custom resizing | Plain `<img>` tag (not `next/image`) | No domain config in next.config — `next/image` requires `remotePatterns` for external URLs |
| DB queries | Custom fetch wrappers | `createAdminClient()` pattern | Already established, bypasses RLS, server-only |

---

## Common Pitfalls

### Pitfall 1: next/image Without Domain Config
**What goes wrong:** Using `<Image src={lcc.photo_url} />` from `next/image` throws a runtime error: "hostname not configured under images in your next.config"
**Why it happens:** `photo_url` points to Supabase Storage which is an external domain not in `next.config.mjs`
**How to avoid:** Use a plain `<img>` tag. If future phases want `next/image`, that requires adding `images.remotePatterns` to `next.config.mjs` first.

### Pitfall 2: Missing `id="form"` on Form Section
**What goes wrong:** PAGE-02 fails — "Get Started" CTA in nav scrolls to nothing
**Why it happens:** Landing page is a complete rewrite; easy to forget the anchor
**How to avoid:** The form section wrapper must be `<section id="form">`. The nav CTA uses `href="#form"` (existing LccWebNav.tsx, confirmed).

### Pitfall 3: Null Supabase Array vs. Empty Array
**What goes wrong:** `testimonials?.map(...)` works but `testimonials.length` throws if data is null (not just empty)
**Why it happens:** Supabase returns `null` for data on error, `[]` for empty result set — but it can be null if network fails
**How to avoid:** Default: `const items = testimonials ?? []`. Always null-coalesce before array operations.

### Pitfall 4: Seed Migration Uses Wrong LCC ID
**What goes wrong:** `lcc_testimonials` INSERT uses a hardcoded UUID that differs between local and production DB
**Why it happens:** LCC UUIDs are generated at seed time and differ per environment
**How to avoid:** Use a subquery: `SELECT id FROM public.lccs WHERE slug = 'kim-johnson'` inline in the INSERT. Already documented in the migration pattern above.

### Pitfall 5: Sub-page Stubs Missing `params` Prop
**What goes wrong:** About/FAQ/testimonials pages can't identify which LCC to query — they currently accept no props
**Why it happens:** The stubs were written without params
**How to avoid:** All sub-pages need `({ params }: { params: { lccSlug: string } })` — same signature as layout.tsx.

### Pitfall 6: Tailwind `group-open:` Not Working
**What goes wrong:** Accordion chevron doesn't rotate, content area doesn't animate
**Why it happens:** `group-open:` requires the `group` class on the parent `<details>` element specifically — not a wrapper div
**How to avoid:** Put `className="group ..."` directly on the `<details>` element, not a container around it.

---

## Code Examples

### Landing Page: Minimal Viable Server Component Structure
```typescript
// app/[lccSlug]/page.tsx (rewrite)
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin'
import LeadCaptureForm from './LeadCaptureForm'

interface Props {
  params: { lccSlug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function LandingPage({ params, searchParams }: Props) {
  const supabase = createAdminClient()

  const { data: lcc } = await supabase
    .from('lccs')
    .select('id, name, slug, headline, subheadline, bio_teaser, photo_url, webhook_url')
    .eq('slug', params.lccSlug)
    .single()

  if (!lcc) notFound()

  const { data: testimonials } = await supabase
    .from('lcc_testimonials')
    .select('family_name, quote')
    .eq('lcc_id', lcc.id)
    .order('order_index', { ascending: true })
    .limit(1)

  const featuredTestimonial = (testimonials ?? [])[0] ?? null

  const utmSource = typeof searchParams.utm_source === 'string' ? searchParams.utm_source : null
  // ... other UTM params

  return (
    <>
      {/* Hero section — brand-pageBg, min-h-screen */}
      <section className="bg-brand-pageBg min-h-screen flex items-center">
        {/* two-column grid, mobile single-column */}
      </section>

      {/* About teaser — white */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2>About {lcc.name}</h2>
          <p>{lcc.bio_teaser ?? 'Learn more about your Local Childcare Consultant.'}</p>
          <a href={`/${lcc.slug}/about`}>Read more →</a>
        </div>
      </section>

      {/* Au Pairs teaser — pageBg */}
      {/* Testimonials snippet — white */}
      {/* Form section — pageBg */}
      <section id="form" className="bg-brand-pageBg py-16 px-4">
        <div className="max-w-lg mx-auto">
          <h2>Ready to find your au pair?</h2>
          <LeadCaptureForm lccId={lcc.id} lccSlug={lcc.slug} lccName={lcc.name}
            utmSource={utmSource} utmMedium={null} utmCampaign={null} utmContent={null} />
        </div>
      </section>
    </>
  )
}
```

### Sub-page: About Page Pattern
```typescript
// app/[lccSlug]/about/page.tsx
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin'

export default async function AboutPage({ params }: { params: { lccSlug: string } }) {
  const supabase = createAdminClient()
  const { data: lcc } = await supabase
    .from('lccs')
    .select('name, bio, photo_url')
    .eq('slug', params.lccSlug)
    .single()

  if (!lcc) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {lcc.photo_url ? (
        <img src={lcc.photo_url} alt={`${lcc.name}`} className="rounded-xl mb-8 w-48 h-48 object-cover" />
      ) : null}
      <h1 className="text-3xl font-semibold text-brand-body mb-6">{lcc.name}</h1>
      <div className="text-brand-body leading-relaxed whitespace-pre-wrap">
        {lcc.bio ?? 'Bio coming soon.'}
      </div>
    </div>
  )
}
```

### Sub-page: FAQ Page Pattern
```typescript
// app/[lccSlug]/faq/page.tsx
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin'

export default async function FAQPage({ params }: { params: { lccSlug: string } }) {
  const supabase = createAdminClient()
  const { data: lcc } = await supabase
    .from('lccs').select('id, name').eq('slug', params.lccSlug).single()

  if (!lcc) notFound()

  const { data: faqs } = await supabase
    .from('lcc_faqs')
    .select('id, question, answer')
    .eq('lcc_id', lcc.id)
    .order('order_index', { ascending: true })

  const items = faqs ?? []

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold text-brand-body mb-8">Frequently Asked Questions</h1>
      {items.length === 0 ? (
        <p className="text-brand-muted">No FAQs yet.</p>
      ) : (
        <ul className="space-y-8">
          {items.map((faq) => (
            <li key={faq.id}>
              <h2 className="text-lg font-semibold text-brand-body mb-2">{faq.question}</h2>
              <p className="text-brand-muted leading-relaxed">{faq.answer}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

### Accordion Component (native HTML, no dependencies)
```typescript
// Inside app/[lccSlug]/au-pairs/page.tsx
const SECTIONS = [
  { title: 'How It Works', content: <HowItWorksContent /> },
  { title: 'Program Costs', content: <ProgramCostsContent /> },
  { title: 'Au Pair vs. Nanny', content: <ComparisonTableContent /> },
  { title: 'Common Questions & Myths', content: <CommonQuestionsContent /> },
]

// Rendered as:
{SECTIONS.map(({ title, content }) => (
  <details key={title} className="group border-b border-gray-200 last:border-b-0">
    <summary className="flex items-center justify-between py-5 cursor-pointer list-none font-medium text-brand-body hover:text-brand-gold transition-colors">
      {title}
      <svg className="h-5 w-5 transition-transform group-open:rotate-180" ...chevron... />
    </summary>
    <div className="pb-6 text-brand-muted leading-relaxed">
      {content}
    </div>
  </details>
))}
```

### Seed Migration: Correct UUID Subquery Pattern
```sql
-- CONT-02: Insert testimonials using subquery (not hardcoded UUID)
INSERT INTO public.lcc_testimonials (lcc_id, family_name, quote, order_index)
VALUES
  ((SELECT id FROM public.lccs WHERE slug = 'kim-johnson'), 'The Martinez Family', '...quote...', 0),
  ((SELECT id FROM public.lccs WHERE slug = 'kim-johnson'), 'Sarah T.', '...quote...', 1),
  ((SELECT id FROM public.lccs WHERE slug = 'kim-johnson'), 'The Nguyen Family', '...quote...', 2);
```

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright 1.58.2 (E2E) + Vitest 4.1.0 (integration) |
| Config file | `playwright.config.ts` / `vitest.config.ts` |
| Quick run command | `npx playwright test tests/e2e/public-pages/ --project=chromium` |
| Full suite command | `npx playwright test --project=chromium` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PAGE-01 | Landing page renders hero, about teaser, au pairs teaser, testimonials snippet, form | E2E smoke | `npx playwright test tests/e2e/public-pages/landing-page.spec.ts --project=chromium` | ❌ Wave 0 |
| PAGE-02 | "Get Started" scrolls to form (id="form" anchor exists) | E2E | `npx playwright test tests/e2e/public-pages/landing-page.spec.ts --project=chromium` | ❌ Wave 0 |
| PAGE-03 | /about renders bio text and handles null photo_url | E2E smoke | `npx playwright test tests/e2e/public-pages/sub-pages.spec.ts --project=chromium` | ❌ Wave 0 |
| PAGE-04 | /au-pairs renders 4 accordion sections including comparison table | E2E smoke | `npx playwright test tests/e2e/public-pages/sub-pages.spec.ts --project=chromium` | ❌ Wave 0 |
| PAGE-05 | /faq renders FAQ items from DB; shows empty state if none | E2E smoke | `npx playwright test tests/e2e/public-pages/sub-pages.spec.ts --project=chromium` | ❌ Wave 0 |
| PAGE-06 | /testimonials renders testimonials from DB; shows empty state | E2E smoke | `npx playwright test tests/e2e/public-pages/sub-pages.spec.ts --project=chromium` | ❌ Wave 0 |
| CONT-01 | Kim's headline/subheadline/bio/bio_teaser appear in rendered pages | E2E + integration | `npx vitest run tests/integration/kim-seed.test.ts` | ❌ Wave 0 |
| CONT-02 | At least 3 testimonials exist for kim-johnson in DB | Integration | `npx vitest run tests/integration/kim-seed.test.ts` | ❌ Wave 0 |
| CONT-03 | At least 5 FAQ entries exist for kim-johnson in DB | Integration | `npx vitest run tests/integration/kim-seed.test.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx playwright test tests/e2e/public-pages/ --project=chromium`
- **Per wave merge:** `npx playwright test --project=chromium && npx vitest run tests/integration/`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/e2e/public-pages/landing-page.spec.ts` — covers PAGE-01, PAGE-02
- [ ] `tests/e2e/public-pages/sub-pages.spec.ts` — covers PAGE-03, PAGE-04, PAGE-05, PAGE-06
- [ ] `tests/integration/kim-seed.test.ts` — covers CONT-01, CONT-02, CONT-03

*(All use `kim-johnson` slug, matching existing Phase 6 test convention)*

---

## Open Questions

1. **hero image dimensions on mobile**
   - What we know: Photo is left column on desktop, stacks on top on mobile
   - What's unclear: Photo aspect ratio and max-height — landscape or square crop?
   - Recommendation: Use `aspect-[3/4]` (portrait) on desktop column, `aspect-video` or `aspect-square` on mobile stacked. Claude's discretion.

2. **`bio` field line breaks**
   - What we know: `bio` is a TEXT column storing multi-paragraph prose
   - What's unclear: Whether Kim's seeded bio uses `\n` newlines or `<br>` tags
   - Recommendation: Use `whitespace-pre-wrap` on the bio container — renders newlines as line breaks without any HTML injection risk. If the copy uses paragraph structure, wrap in `<p>` tags by splitting on `\n\n`.

3. **Seed migration filename timestamp**
   - What we know: Latest migration is `20260405000000_phase6_website_infra.sql`
   - What's unclear: Whether to use today's date (20260407) or a later date
   - Recommendation: Use `20260407000000_phase7_kim_seed.sql` — sequential by date, consistent with existing convention.

---

## Sources

### Primary (HIGH confidence)
- Codebase inspection — `app/[lccSlug]/layout.tsx`, `page.tsx`, `components/LccWebNav.tsx`, `tailwind.config.ts`, `package.json`
- Codebase inspection — `supabase/migrations/20260405000000_phase6_website_infra.sql` — confirmed schema shape
- Codebase inspection — `tests/e2e/website-infrastructure/nav-layout.spec.ts` — confirmed test conventions
- MDN Web Docs — `<details>`/`<summary>` native accordion semantics

### Secondary (MEDIUM confidence)
- Tailwind CSS v3 docs — `group-open:` variant for `<details>` open state styling
- Next.js 14 docs — App Router server components, `notFound()`, `params` type

### Tertiary (LOW confidence)
- None — all claims are grounded in direct codebase inspection or established documentation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies verified from package.json
- Architecture: HIGH — patterns verified from existing working code in codebase
- Pitfalls: HIGH — derived from direct code inspection (null handling, id="form" anchor, UUID subquery)
- Seed migration: HIGH — pattern verified against existing migration files

**Research date:** 2026-04-07
**Valid until:** 2026-05-07 (stable stack — 30 days)
