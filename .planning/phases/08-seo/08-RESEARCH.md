# Phase 8: SEO - Research

**Researched:** 2026-04-08
**Domain:** Next.js 14 App Router metadata API — generateMetadata, Open Graph tags, dynamic metadata from DB
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Title format:** `[LCC Name] | [Page Name]` — LCC name first, pipe separator
  - Landing (`/`): `"Kim Arvdalen | Local Childcare Consultant"`
  - Sub-pages: `"Kim Arvdalen | About"`, `"Kim Arvdalen | Au Pairs"`, `"Kim Arvdalen | FAQ"`, `"Kim Arvdalen | Testimonials"`
  - LCC name from `lccs.name` DB field — dynamic per LCC, not hardcoded
- **Description source:** Template-based — static strings with LCC name injected (not pulled from DB content fields). Unique per page:
  - `/` (landing): Introduces who the LCC is and what she does
  - `/about`: Focuses on her background and approach
  - `/au-pairs`: Describes the au pair program information available
  - `/faq`: Frames the page as answering common family questions
  - `/testimonials`: Highlights family experiences and stories
- **og:image fallback:** When `photo_url` is NULL — omit `og:image` tag entirely (no broken images, no placeholder). When present — use raw Supabase Storage URL.
- **Seed data update:** Update DB seed from "Kim Johnson" / `kim-johnson` slug to "Kim Arvdalen" / `kim-arvdalen` as part of this phase.

### Claude's Discretion

- Exact meta description copy for each page template (warm, professional, family-facing tone)
- Whether `generateMetadata` lives on each page individually or delegates through the shared `[lccSlug]/layout.tsx`
- `og:type` value (`website` is standard)
- Whether to update root `app/layout.tsx` static metadata (currently "Create Next App" placeholder)

### Deferred Ideas (OUT OF SCOPE)

- None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SEO-01 | Each public LCC website page has a unique `<title>` and `<meta name="description">` tag generated from DB content | `generateMetadata` async function on each page exports; queries `lccs.name` from DB to inject into title template and description template |
| SEO-02 | Each public LCC website page has Open Graph tags (`og:title`, `og:description`, `og:image`) using the LCC's `photo_url` | Next.js `Metadata.openGraph` object; `og:image` conditionally included only when `photo_url` is non-null |
</phase_requirements>

---

## Summary

Phase 8 is a pure metadata layer: add `generateMetadata` exports to 5 existing server component pages under `app/[lccSlug]/`. No new routes, no schema changes, no new components. The only code changes are metadata exports and a seed update to rename Kim Johnson to Kim Arvdalen.

Next.js 14 App Router has a first-class `generateMetadata` API that handles `<title>`, `<meta name="description">`, and all Open Graph tags through a single typed async function. The function receives route `params`, can fetch from the DB, and returns a `Metadata` object. Next.js serializes this into the correct `<head>` tags automatically.

The key architectural question — per-page vs. layout-level metadata — is answered by the framework: `generateMetadata` in a `layout.tsx` sets metadata for the layout and all children but cannot set page-specific titles (child pages override). The cleanest approach for this phase is per-page `generateMetadata`, each making a minimal DB query for `name` and `photo_url`. The layout's existing DB call cannot be shared with page-level `generateMetadata` because Next.js deduplicates `fetch()` calls but Supabase uses the PostgREST client — however, the query is tiny (2 columns, one row) so the duplication is negligible.

**Primary recommendation:** Add `generateMetadata` to each of the 5 page files. Also update `app/layout.tsx` static metadata to remove the "Create Next App" placeholder. New seed migration renames kim-johnson to kim-arvdalen and updates all existing tests that hardcode `SLUG = 'kim-johnson'`.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` (built-in) | 14.2.35 (project) | `generateMetadata` async function, `Metadata` type | The only correct mechanism for dynamic metadata in Next.js 14 App Router |
| `@supabase/supabase-js` (via `createAdminClient`) | Existing | DB query for `lccs.name` and `lccs.photo_url` | Already used on all 5 pages; same pattern |

### No Additional Dependencies Needed

This phase requires zero new npm packages. Everything is already installed.

---

## Architecture Patterns

### Recommended Approach: generateMetadata Per Page

Each of the 5 page files exports a named `generateMetadata` async function alongside the default page export. This is the standard Next.js 14 App Router pattern for dynamic metadata.

```typescript
// Source: Next.js 14 official docs — generateMetadata
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin'

interface Props {
  params: { lccSlug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createAdminClient()
  const { data: lcc } = await supabase
    .from('lccs')
    .select('name, photo_url')
    .eq('slug', params.lccSlug)
    .single()

  if (!lcc) return {}  // notFound() is called in the page component itself

  const title = `${lcc.name} | About`
  const description = `Learn about ${lcc.name}'s background, approach, and years of experience helping families find the perfect au pair match.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(lcc.photo_url ? { images: [{ url: lcc.photo_url }] } : {}),
    },
  }
}

export default async function AboutPage({ params }: Props) {
  // ... existing page component unchanged
}
```

### Landing Page Pattern (different title format)

```typescript
// Landing page uses descriptive subtitle instead of page name
const title = `${lcc.name} | Local Childcare Consultant`
const description = `${lcc.name} is a certified Local Childcare Consultant with Cultural Care Au Pair, helping families in your area find the perfect live-in childcare solution.`
```

### Conditional og:image

```typescript
// Omit og:image entirely when photo_url is NULL — do not set a placeholder
...(lcc.photo_url ? { images: [{ url: lcc.photo_url }] } : {})
```

### Root Layout Metadata Update

`app/layout.tsx` currently has a "Create Next App" placeholder. Update to a sensible fallback:

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: 'Local Childcare Consultant',
  description: 'Connect with your Local Childcare Consultant and discover the au pair program.',
}
```

This serves as a fallback for any route that does not define its own metadata.

### generateMetadata in layout.tsx vs. page.tsx

**Decision: use page-level `generateMetadata`, not layout-level.**

Reason: The layout's `generateMetadata` cannot know which page is being rendered (landing vs. FAQ vs. testimonials), so it cannot set page-specific titles. Each page needs its own title template. Page-level `generateMetadata` overrides layout-level metadata for `<title>` and `<meta name="description">`.

The layout file (`[lccSlug]/layout.tsx`) does NOT need a `generateMetadata` export for this phase.

### Anti-Patterns to Avoid

- **Do not import the layout's DB result into generateMetadata.** Next.js does not share server component render context across layout and generateMetadata. Each must make its own fetch. The query is tiny (2 cols, 1 row) — duplication is acceptable.
- **Do not use `export const metadata`** (static export) for these pages — they require dynamic DB data, so `generateMetadata` (async function) is mandatory.
- **Do not throw `notFound()` inside `generateMetadata`.** Return an empty `{}` or minimal metadata if the slug is not found. The page component handles `notFound()` separately.
- **Do not wrap `og:image` in an array of objects unnecessarily.** The minimal form `images: [{ url: string }]` is sufficient. Do not add `width`/`height` fields unless you know the dimensions.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| `<title>` tag injection | Custom `<Head>` component or manual `document.title` | `generateMetadata` return value | Next.js App Router does not support `<Head>` from pages router; `generateMetadata` is the only correct mechanism |
| Open Graph tags | Manually rendering `<meta property="og:...">` in JSX | `openGraph` key in `Metadata` object | Framework renders tags with correct placement in `<head>`, handles escaping, deduplication |
| Meta description | `<meta name="description">` in JSX | `description` key in `Metadata` object | Same as above |

---

## Common Pitfalls

### Pitfall 1: generateMetadata Not Exported (Named Export Required)

**What goes wrong:** Developer writes `export default async function generateMetadata()` — this is silently ignored by Next.js, which expects a **named** export.
**Why it happens:** Confusion with the default page export pattern.
**How to avoid:** Always `export async function generateMetadata(...)` — named, not default.
**Warning signs:** `<title>` shows the root layout fallback ("Local Childcare Consultant") instead of the page-specific title.

### Pitfall 2: Static metadata Object on a Dynamic Page

**What goes wrong:** Developer writes `export const metadata: Metadata = { title: 'Kim Arvdalen | FAQ' }` — this hardcodes the LCC name and breaks multi-tenancy.
**Why it happens:** Static metadata export is simpler; developer forgets this is a dynamic multi-tenant route.
**How to avoid:** Always use `generateMetadata` (async function) for any page under `[lccSlug]/` — never `export const metadata`.
**Warning signs:** Title shows one LCC name for all LCC slugs.

### Pitfall 3: Returning notFound() from generateMetadata

**What goes wrong:** `notFound()` is called inside `generateMetadata` when slug is not found. This can cause an unhandled error before the page component runs.
**Why it happens:** Developers copy the page component pattern into generateMetadata.
**How to avoid:** Return `{}` (empty metadata object) or a minimal fallback from `generateMetadata` when the slug doesn't exist. Let the page component handle `notFound()`.

### Pitfall 4: Slug Rename Cascades to Tests

**What goes wrong:** Seed migration renames `kim-johnson` to `kim-arvdalen`, but test files still hardcode `const SLUG = 'kim-johnson'` — all E2E tests fail.
**Why it happens:** Tests are not updated alongside the migration.
**How to avoid:** Update SLUG constant in all 6 affected test files atomically with the seed migration. Files that reference `kim-johnson`:
  - `tests/e2e/public-pages/landing-page.spec.ts`
  - `tests/e2e/public-pages/sub-pages.spec.ts`
  - `tests/e2e/website-infrastructure/nav-layout.spec.ts`
  - `tests/e2e/website-infrastructure/public-routes.spec.ts`
  - `tests/integration/kim-seed.test.ts`
  - `tests/integration/website-infra.test.ts`
**Warning signs:** All E2E public-pages tests 404 after seed migration.

### Pitfall 5: og:image with NULL photo_url Renders Broken Tag

**What goes wrong:** `images: [{ url: null }]` or `images: [{ url: '' }]` is included in the openGraph object when `photo_url` is NULL — social preview shows a broken image.
**Why it happens:** Unconditional spread of `lcc.photo_url` into images array.
**How to avoid:** Use the conditional spread pattern: `...(lcc.photo_url ? { images: [{ url: lcc.photo_url }] } : {})`. When `photo_url` is NULL, the `images` key is absent entirely.

---

## Code Examples

### Full generateMetadata Pattern (About Page Example)

```typescript
// Source: Next.js 14 App Router docs — https://nextjs.org/docs/app/api-reference/functions/generate-metadata
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin'

interface Props {
  params: { lccSlug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createAdminClient()
  const { data: lcc } = await supabase
    .from('lccs')
    .select('name, photo_url')
    .eq('slug', params.lccSlug)
    .single()

  if (!lcc) return {}

  const title = `${lcc.name} | About`
  const description = `Learn about ${lcc.name}'s background, experience, and approach to helping families find their perfect au pair match through Cultural Care.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(lcc.photo_url ? { images: [{ url: lcc.photo_url }] } : {}),
    },
  }
}
```

### Title Templates for All 5 Pages

```typescript
// Landing (/)
title = `${lcc.name} | Local Childcare Consultant`
description = `${lcc.name} is a certified Local Childcare Consultant with Cultural Care Au Pair, helping families in your area find flexible, affordable live-in childcare through the au pair program.`

// About (/about)
title = `${lcc.name} | About`
description = `Learn about ${lcc.name}'s background, experience, and personal approach to guiding families through the au pair placement process.`

// Au Pairs (/au-pairs)
title = `${lcc.name} | Au Pairs`
description = `Explore how the au pair program works — costs, the matching process, visa requirements, and how an au pair compares to a nanny. Guidance from ${lcc.name}.`

// FAQ (/faq)
title = `${lcc.name} | FAQ`
description = `Common questions families ask about the au pair program, answered by ${lcc.name} — your Local Childcare Consultant.`

// Testimonials (/testimonials)
title = `${lcc.name} | Testimonials`
description = `Read stories from families who worked with ${lcc.name} to welcome an au pair into their home and transform their childcare experience.`
```

### Seed Migration Pattern for Kim Arvdalen Rename

```sql
-- New migration: update slug and name atomically
UPDATE public.lccs
SET
  name = 'Kim Arvdalen',
  slug = 'kim-arvdalen'
WHERE slug = 'kim-johnson';

-- Also update FKs if needed — lcc_testimonials and lcc_faqs use lcc_id (UUID FK),
-- not slug, so they are unaffected by slug rename.
```

### Root Layout Metadata Update

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: 'Local Childcare Consultant',
  description: 'Connect with your Local Childcare Consultant and discover the au pair program.',
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `<Head>` component from `next/head` | `generateMetadata` / `export const metadata` | Next.js 13 App Router | Pages Router `<Head>` does not work in App Router components |
| Manual `<meta>` tags in JSX | `Metadata` object returned from `generateMetadata` | Next.js 13+ | Framework handles rendering, deduplication, and proper `<head>` placement |

**Deprecated/outdated:**

- `next/head` / `<Head>` component: Works only in Pages Router. This project uses App Router exclusively — never use it.
- `export const metadata` (static): Valid for static pages, but incompatible with dynamic per-LCC titles. For `[lccSlug]/` pages, always use `generateMetadata`.

---

## Open Questions

1. **Slug rename impact on remote Supabase DB**
   - What we know: Migration applies locally via `supabase db push`. The `kim-johnson` row exists in remote DB (inserted during Phase 6 as a data fix).
   - What's unclear: Whether the slug rename migration will cleanly apply to remote without manual intervention.
   - Recommendation: Write the migration with `WHERE slug = 'kim-johnson'` (idempotent if run twice on a row already renamed). Plan should note that `supabase db push` to remote is required after local verification.

2. **og:type for individual pages**
   - What we know: `website` is the standard `og:type` for most web pages.
   - What's unclear: Whether any social platform benefits from `og:type: 'profile'` for the About page.
   - Recommendation: Use `website` for all 5 pages — `profile` requires additional properties and offers no meaningful benefit here.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Playwright (E2E) |
| Config file | `playwright.config.ts` |
| Quick run command | `npx playwright test tests/e2e/seo/ --project=chromium` |
| Full suite command | `npx playwright test --project=chromium` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SEO-01 | Each page has unique `<title>` with LCC name | E2E | `npx playwright test tests/e2e/seo/metadata.spec.ts --project=chromium` | ❌ Wave 0 |
| SEO-01 | Each page has `<meta name="description">` with LCC name | E2E | `npx playwright test tests/e2e/seo/metadata.spec.ts --project=chromium` | ❌ Wave 0 |
| SEO-02 | Each page has `og:title` and `og:description` tags | E2E | `npx playwright test tests/e2e/seo/metadata.spec.ts --project=chromium` | ❌ Wave 0 |
| SEO-02 | `og:image` uses `photo_url` when present, omitted when NULL | E2E | `npx playwright test tests/e2e/seo/metadata.spec.ts --project=chromium` | ❌ Wave 0 |

**Test approach for metadata:** Playwright can inspect `<head>` content via `page.locator('head title').textContent()` and `page.locator('meta[name="description"]').getAttribute('content')`. Open Graph tags are accessible via `page.locator('meta[property="og:title"]').getAttribute('content')`.

### Sampling Rate

- **Per task commit:** `npx playwright test tests/e2e/seo/ --project=chromium`
- **Per wave merge:** `npx playwright test --project=chromium`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/e2e/seo/metadata.spec.ts` — covers SEO-01 and SEO-02 for all 5 pages using `kim-arvdalen` slug
- [ ] Update `SLUG = 'kim-arvdalen'` in 6 existing test files (not new files, but required before any test can pass after seed rename)

---

## Sources

### Primary (HIGH confidence)

- Next.js 14 official docs — `generateMetadata` function API, Metadata object shape, openGraph field spec — verified against `next@14.2.35` in project `package.json`
- Direct code inspection of `app/[lccSlug]/layout.tsx`, all 5 page files, `app/layout.tsx`, `supabase/migrations/20260407000000_phase7_kim_seed.sql`, `tests/e2e/` directory

### Secondary (MEDIUM confidence)

- Next.js App Router metadata docs confirming `generateMetadata` must be a named export (not default)
- Open Graph protocol specification confirming `og:type: 'website'` as standard for web pages

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — Next.js 14 `generateMetadata` API is stable, well-documented, and already used in the codebase pattern (root `app/layout.tsx` uses static `metadata` export)
- Architecture: HIGH — per-page `generateMetadata` is the only correct mechanism for page-specific dynamic titles in App Router; confirmed by direct code inspection
- Pitfalls: HIGH — slug rename impact on tests is confirmed by direct inspection of 6 test files all hardcoding `const SLUG = 'kim-johnson'`

**Research date:** 2026-04-08
**Valid until:** 2026-05-08 (Next.js 14 metadata API is stable; low churn risk)
