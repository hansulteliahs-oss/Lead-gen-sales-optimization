# Phase 6: Website Infrastructure - Research

**Researched:** 2026-04-04
**Domain:** Next.js 14 App Router layout composition, Supabase Storage bucket creation via migration, SQL schema extensions with RLS, Next.js middleware regex expansion, Tailwind CSS responsive navigation
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Navigation visual style**
- Background: white/transparent — clean, lets page content be the star
- Brand palette (sage green accent, warm cream tones) used for CTA and hover states
- LCC name displayed as plain text (no avatar/photo in nav) — name doubles as the home link back to `/[lccSlug]/`
- Current page link gets a subtle active state highlight (color or underline) for wayfinding
- Bottom border or shadow treatment: Claude's discretion

**CTA button style**
- Claude's discretion — pick whatever contrasts best against white nav and feels professional, using the existing brand palette

**Mobile menu behavior**
- Hamburger breakpoint: `md` (768px) — inline links above, hamburger below
- Menu style: dropdown panel that slides down from the nav (~200ms smooth transition)
- Nav links stack vertically with "Get Started" CTA at the bottom of the panel
- Tapping a nav link auto-closes the menu
- Hamburger icon toggles to X when menu is open

**Nav link set & order**
- Links: About | Au Pairs | FAQ | Testimonials
- No separate "Home" link — clicking the LCC name navigates to landing page
- "Get Started" CTA appears as a separate button after the nav links (not inline text)
- CTA behavior: on the landing page, smooth-scrolls to `#form`; on sub-pages, navigates to `/[lccSlug]/#form`
- Active state on current page's link

**Photo storage structure**
- Bucket: `lcc-photos` with public read access, authenticated-only write
- Folder structure: `lcc-photos/{lcc-slug}/profile.jpg` — each LCC gets their own folder
- Schema: single `photo_url` column on `lccs` table (not a separate photos table)
- URL format: store the full Supabase public URL in `photo_url` — drop directly into `<img>` src
- One profile photo per LCC for v2.0; gallery/multiple photos is future scope

### Claude's Discretion
- CTA button style (solid vs. outlined, exact colors)
- Nav bottom edge treatment (border vs. shadow-on-scroll vs. both)
- Exact nav padding, font sizes, and spacing
- Hamburger icon style and animation details
- Mobile dropdown background color and styling
- RLS policies on new tables (follow Phase 1 patterns)
- Exact migration SQL column types and constraints

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SITE-01 | The `lccs` table has new columns: `headline`, `subheadline`, `bio`, `bio_teaser`, `photo_url`, `custom_domain` (nullable) | SQL `ALTER TABLE` migration pattern — see Migration Patterns section |
| SITE-02 | New `lcc_testimonials` table with correct schema and FK constraints | `CREATE TABLE` migration with FK to `lccs.id`, RLS following Phase 1 pattern |
| SITE-03 | New `lcc_faqs` table with correct schema and FK constraints | `CREATE TABLE` migration with FK to `lccs.id`, RLS following Phase 1 pattern |
| SITE-04 | Supabase Storage `lcc-photos` bucket with public read access | Storage bucket creation via SQL migration using `storage.buckets` insert |
| SITE-05 | Middleware allows unauthenticated access to 4 new sub-routes | Regex extension at `middleware.ts:47` — see Middleware Regex section |
| SITE-06 | All LCC pages share sticky navigation (LCC name + nav links + CTA) | `app/[lccSlug]/layout.tsx` Server Component + `LccWebNav` Client Component |
| SITE-07 | Navigation collapses to hamburger on mobile viewports | `useState` toggle in Client Component, Tailwind `md:hidden` / `md:flex` |
</phase_requirements>

---

## Summary

Phase 6 has four distinct work tracks: (1) database schema extension via a single sequential migration, (2) Supabase Storage bucket provisioning, (3) middleware regex expansion, and (4) a new shared layout component with a sticky responsive nav for all public LCC pages.

All four tracks are well-understood, low-risk, and use patterns already established in this codebase. The migration track extends the existing `lccs` table with nullable columns (safe, non-destructive) and creates two new tables following the exact RLS pattern from Phase 1. The storage track creates one public-read bucket. Middleware is a single regex change. The nav is a Server Component layout wrapping a Client Component for interactivity — a standard Next.js 14 App Router pattern.

The only meaningful complexity is the CTA behavior: on the landing page it must smooth-scroll to `#form`; on sub-pages it must navigate to `/[lccSlug]/#form`. This requires the nav to know the current `lccSlug` and use `usePathname()` to distinguish the two cases.

**Primary recommendation:** Implement all four tracks in three sequential tasks: (1) migration + storage, (2) middleware, (3) layout + nav component. The migration and storage bucket can share one migration file since they are deployment-coupled.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 14.2.35 (project-pinned) | Route segments, layouts, Server Components | Already in use — `app/[lccSlug]/layout.tsx` is the target file |
| React | 18 (project-pinned) | Client Component state for hamburger toggle | Already in use |
| Tailwind CSS | 3.4.1 (project-pinned) | Responsive classes (`md:hidden`, `md:flex`), transitions | Already in use; brand palette in `tailwind.config.ts` |
| `@supabase/supabase-js` | 2.99.1 (project-pinned) | Admin client for public page data fetching | Already in use; `createAdminClient()` established |

### Supporting
| Library | Purpose | When to Use |
|---------|---------|-------------|
| `next/navigation` (`usePathname`) | Detect current route in Client Component for active link + CTA behavior | Required in nav Client Component |
| `next/link` | Client-side navigation without full page reload | All nav links and LCC name link |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind for hamburger transition | Headless UI `<Transition>` | Overkill — a single `max-height` or `translateY` CSS transition in Tailwind is sufficient for a single dropdown |
| `usePathname` for active state | Server-side route comparison | `usePathname` is the idiomatic App Router approach; avoids prop drilling lccSlug into a Server Component just for active state |

**Installation:** No new packages required — all dependencies already in `package.json`.

---

## Architecture Patterns

### Recommended Project Structure

```
app/
└── [lccSlug]/
    ├── layout.tsx          # NEW: Server Component — fetches LCC name, renders LccWebNav
    ├── page.tsx            # EXISTING: landing page (now wrapped by layout)
    ├── thank-you/
    │   └── page.tsx        # EXISTING: thank-you page (now wrapped by layout)
    ├── about/
    │   └── page.tsx        # STUB: placeholder for Phase 7 content
    ├── au-pairs/
    │   └── page.tsx        # STUB: placeholder for Phase 7 content
    ├── faq/
    │   └── page.tsx        # STUB: placeholder for Phase 7 content
    └── testimonials/
        └── page.tsx        # STUB: placeholder for Phase 7 content
components/
└── LccWebNav.tsx           # NEW: Client Component — sticky nav with hamburger
supabase/
└── migrations/
    └── 20260406000000_phase6_website_infra.sql  # NEW: ALTER TABLE + CREATE TABLE + storage bucket
middleware.ts               # MODIFIED: regex extended to allow 4 new sub-paths
```

### Pattern 1: Server Component Layout Fetching LCC Data

**What:** `app/[lccSlug]/layout.tsx` is an async Server Component that fetches the LCC's `name` (and `slug`) using the admin client, then passes it to a Client Component for the interactive nav.

**When to use:** When a shared wrapper needs DB data but the interactive behavior (toggle state) belongs in a Client Component. Server-fetches once per request; no client-side data fetching needed.

**Example:**
```typescript
// app/[lccSlug]/layout.tsx
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin'
import LccWebNav from '@/components/LccWebNav'

interface Props {
  params: { lccSlug: string }
  children: React.ReactNode
}

export default async function LccWebLayout({ params, children }: Props) {
  const supabase = createAdminClient()
  const { data: lcc } = await supabase
    .from('lccs')
    .select('name, slug')
    .eq('slug', params.lccSlug)
    .single()

  if (!lcc) notFound()

  return (
    <>
      <LccWebNav lccName={lcc.name} lccSlug={lcc.slug} />
      <main>{children}</main>
    </>
  )
}
```

### Pattern 2: Client Component Nav with Hamburger Toggle

**What:** `LccWebNav` is a `'use client'` component that uses `useState` for open/closed state and `usePathname` for active link detection and CTA routing.

**When to use:** Any time a layout element needs browser-side interactivity (click handlers, state) but the data was already fetched server-side and passed as props.

**Example:**
```typescript
// components/LccWebNav.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  lccName: string
  lccSlug: string
}

const NAV_LINKS = [
  { label: 'About', path: 'about' },
  { label: 'Au Pairs', path: 'au-pairs' },
  { label: 'FAQ', path: 'faq' },
  { label: 'Testimonials', path: 'testimonials' },
]

export default function LccWebNav({ lccName, lccSlug }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  // CTA: smooth-scroll on landing page, hard-nav on sub-pages
  const isLandingPage = pathname === `/${lccSlug}`
  const ctaHref = isLandingPage ? '#form' : `/${lccSlug}#form`

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-brand-gold/20">
      {/* Desktop row */}
      <div className="flex items-center justify-between px-6 py-3">
        <Link href={`/${lccSlug}`} className="font-semibold text-brand-body">
          {lccName}
        </Link>
        {/* Desktop links — hidden below md */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ label, path }) => {
            const isActive = pathname === `/${lccSlug}/${path}`
            return (
              <Link
                key={path}
                href={`/${lccSlug}/${path}`}
                className={`text-sm transition-colors ${
                  isActive
                    ? 'text-brand-gold border-b border-brand-gold'
                    : 'text-brand-muted hover:text-brand-body'
                }`}
              >
                {label}
              </Link>
            )
          })}
          <a
            href={ctaHref}
            className="ml-4 px-4 py-2 rounded bg-brand-gold text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Get Started
          </a>
        </div>
        {/* Hamburger — visible below md */}
        <button
          className="md:hidden text-brand-body"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
      {/* Mobile dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-200 ${
          menuOpen ? 'max-h-64' : 'max-h-0'
        }`}
      >
        <div className="flex flex-col px-6 pb-4 gap-4 bg-white">
          {NAV_LINKS.map(({ label, path }) => {
            const isActive = pathname === `/${lccSlug}/${path}`
            return (
              <Link
                key={path}
                href={`/${lccSlug}/${path}`}
                onClick={() => setMenuOpen(false)}
                className={`text-sm ${
                  isActive ? 'text-brand-gold font-medium' : 'text-brand-muted'
                }`}
              >
                {label}
              </Link>
            )
          })}
          <a
            href={ctaHref}
            onClick={() => setMenuOpen(false)}
            className="px-4 py-2 rounded bg-brand-gold text-white text-sm font-medium text-center hover:opacity-90 transition-opacity"
          >
            Get Started
          </a>
        </div>
      </div>
    </nav>
  )
}
```

### Pattern 3: Migration — ALTER TABLE + CREATE TABLE + Storage Bucket

**What:** A single sequential SQL migration file that (a) adds nullable columns to `lccs`, (b) creates `lcc_testimonials` and `lcc_faqs` with FK constraints and RLS, and (c) inserts the `lcc-photos` storage bucket record.

**When to use:** When multiple schema changes are deployment-coupled (must all succeed or fail together).

**Key insight on Storage bucket via SQL migration:** Supabase Storage is backed by the `storage.buckets` and `storage.objects` tables. Creating a bucket via SQL is the migration-safe approach — the bucket record is created atomically with the schema changes. Storage policies live in `storage.objects` and follow the same RLS pattern.

**Example:**
```sql
-- supabase/migrations/20260406000000_phase6_website_infra.sql

-- =============================================================
-- 1. Extend lccs table with website content columns
-- =============================================================
ALTER TABLE public.lccs
  ADD COLUMN IF NOT EXISTS headline       TEXT,
  ADD COLUMN IF NOT EXISTS subheadline    TEXT,
  ADD COLUMN IF NOT EXISTS bio            TEXT,
  ADD COLUMN IF NOT EXISTS bio_teaser     TEXT,
  ADD COLUMN IF NOT EXISTS photo_url      TEXT,
  ADD COLUMN IF NOT EXISTS custom_domain  TEXT;

-- =============================================================
-- 2. lcc_testimonials
-- =============================================================
CREATE TABLE IF NOT EXISTS public.lcc_testimonials (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lcc_id      UUID NOT NULL REFERENCES public.lccs(id) ON DELETE CASCADE,
  family_name TEXT NOT NULL,
  quote       TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.lcc_testimonials ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS lcc_testimonials_lcc_id_idx ON public.lcc_testimonials (lcc_id);

-- =============================================================
-- 3. lcc_faqs
-- =============================================================
CREATE TABLE IF NOT EXISTS public.lcc_faqs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lcc_id      UUID NOT NULL REFERENCES public.lccs(id) ON DELETE CASCADE,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.lcc_faqs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS lcc_faqs_lcc_id_idx ON public.lcc_faqs (lcc_id);

-- =============================================================
-- 4. RLS policies for new tables (public read, no write from client)
-- =============================================================
-- Testimonials: anyone can read (public website); no client writes needed in v2.0
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'lcc_testimonials' AND policyname = 'testimonials_public_read'
  ) THEN
    CREATE POLICY "testimonials_public_read"
    ON public.lcc_testimonials FOR SELECT
    TO anon, authenticated
    USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'lcc_faqs' AND policyname = 'faqs_public_read'
  ) THEN
    CREATE POLICY "faqs_public_read"
    ON public.lcc_faqs FOR SELECT
    TO anon, authenticated
    USING (true);
  END IF;
END $$;

-- =============================================================
-- 5. Supabase Storage: lcc-photos bucket
-- =============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('lcc-photos', 'lcc-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Public read policy on storage objects
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage'
    AND policyname = 'lcc_photos_public_read'
  ) THEN
    CREATE POLICY "lcc_photos_public_read"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'lcc-photos');
  END IF;
END $$;
```

### Pattern 4: Middleware Regex Extension

**What:** Extend the public route regex at `middleware.ts:47` to also allow the four new sub-paths without authentication.

**When to use:** Any time a new public route is added under `/[lccSlug]/`.

**Current regex:**
```typescript
/^\/[a-z0-9][a-z0-9-]*(?:\/thank-you)?$/
```

**New regex:**
```typescript
/^\/[a-z0-9][a-z0-9-]*(?:\/(?:thank-you|about|au-pairs|faq|testimonials))?$/
```

This continues to block everything except the slug root and explicitly-listed sub-paths. The non-capturing group `(?:...)` keeps the pattern clean.

### Anti-Patterns to Avoid

- **Fetching LCC data in the nav Client Component:** The nav is `'use client'`; it cannot be async or call server-only utilities. Fetch in the layout Server Component and pass as props.
- **Creating the storage bucket with Supabase CLI `storage create` command instead of a migration:** CLI commands are not reproducible across environments. SQL migrations are.
- **Using `getSession()` for public page data access:** The CONTEXT.md and existing code are explicit — use `createAdminClient()` for public pages. `getSession()` is banned project-wide.
- **Putting the sticky nav in `app/layout.tsx` (root layout):** The nav belongs only on LCC website pages. Root layout wraps all routes including `/login` and dashboard routes.
- **Making the sub-page stubs `notFound()` by default:** They should render a minimal placeholder (even just an empty `<div>`) so the middleware test (SITE-05) returns 200, not 404.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sticky positioning | CSS `position: sticky` manually with JS scroll listeners | Tailwind `sticky top-0 z-50` | Already in standard Tailwind — no JS needed |
| Mobile dropdown animation | Custom JS `requestAnimationFrame` height animation | Tailwind `transition-all duration-200 max-h-0/max-h-64` | The `max-height` CSS transition is the established pattern for unknown-height dropdowns in Tailwind |
| Active link detection | Manual string comparison of `params.lccSlug` | `usePathname()` from `next/navigation` | Built into App Router; automatically reactive to route changes |
| Storage bucket creation | Custom API route or seed script | SQL migration via `storage.buckets` INSERT | Reproducible, atomic, environment-agnostic |

---

## Common Pitfalls

### Pitfall 1: Layout Wrapping the Thank-You Page Unexpectedly

**What goes wrong:** Adding `app/[lccSlug]/layout.tsx` wraps ALL routes under `[lccSlug]/`, including `thank-you/`. The thank-you page will gain a sticky nav showing the LCC name and "Get Started" — which may be undesirable post-conversion.

**Why it happens:** Next.js App Router layouts apply to all children in the segment automatically.

**How to avoid:** Per the CONTEXT.md, the nav is additive and the existing thank-you page continues to work within the new layout. This is explicitly acceptable for Phase 6. If Phase 7 ever needs to suppress the nav on thank-you, a `(website)` route group can be introduced to scope the layout — but that is out of scope for Phase 6.

**Warning signs:** If thank-you page tests break after adding the layout, the layout's `notFound()` for missing LCC is the likely culprit — ensure the thank-you page's `params.lccSlug` lookup still resolves.

### Pitfall 2: Middleware Regex Too Permissive

**What goes wrong:** A regex like `/^\/[a-z0-9][a-z0-9-]*\/.*$/` (wildcard sub-path) allows unauthenticated access to any future sub-route, including authenticated ones.

**Why it happens:** Over-eager regex to "just make it work."

**How to avoid:** The new regex uses an explicit allowlist of sub-path names: `(?:thank-you|about|au-pairs|faq|testimonials)`. Adding a new public route requires a deliberate regex change.

### Pitfall 3: Storage Bucket `ON CONFLICT DO NOTHING` Missing

**What goes wrong:** The migration fails on second run (e.g., after `supabase db reset`) with a duplicate key error on `storage.buckets`.

**Why it happens:** The bucket INSERT is not idempotent without `ON CONFLICT`.

**How to avoid:** Always use `INSERT INTO storage.buckets ... ON CONFLICT (id) DO NOTHING` — same idempotency pattern used throughout existing migrations with `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS`.

### Pitfall 4: CTA `#form` Anchor Scroll on Sub-pages

**What goes wrong:** On sub-pages, `href="#form"` scrolls within the current page (which has no `#form`), doing nothing. Or using `<Link href={...}>` for `#form` on the landing page causes a hard navigation instead of smooth scroll.

**Why it happens:** `<Link>` with a hash navigates to the page with that fragment, which Next.js handles as a scroll-to-element — but the smooth scroll CSS (`scroll-behavior: smooth` on `<html>`) must be set for it to animate. Using a plain `<a href="#form">` on the landing page works with CSS smooth scroll.

**How to avoid:** Use `<a>` (not `<Link>`) for the CTA in both cases. On the landing page: `href="#form"`. On sub-pages: `href="/${lccSlug}#form"`. The existing landing page must have `id="form"` on the form container — verify this in the landing page implementation.

**Warning signs:** CTA click on landing page causes a full page reload rather than smooth scroll — check that `<a>` is used (not `<Link>`).

### Pitfall 5: Sub-page Stubs Returning 404

**What goes wrong:** SITE-05 test fails because `/[lccSlug]/about` etc. return 404 (Next.js default for missing `page.tsx` files) even after middleware allows them.

**Why it happens:** Middleware returning 200 and Next.js returning 200 are separate concerns. Middleware allows the request through; Next.js still needs a `page.tsx` to serve.

**How to avoid:** Create minimal stub `page.tsx` files for all four sub-pages in Phase 6. Content is added in Phase 7.

---

## Code Examples

Verified patterns from existing codebase:

### Admin Client Usage (for public pages)
```typescript
// Source: app/[lccSlug]/page.tsx (existing)
import { createAdminClient } from '@/utils/supabase/admin'

const supabase = createAdminClient()
const { data: lcc } = await supabase
  .from('lccs')
  .select('id, name, slug')
  .eq('slug', params.lccSlug)
  .single()

if (!lcc) notFound()
```

### Brand Palette Tokens (from tailwind.config.ts)
```
bg-brand-navy     → #fdfaf9 (warm white — use as nav background or card bg)
bg-brand-pageBg   → #f7f1ef (page background)
text-brand-gold   → #8fac94 (sage green — CTA, accent, active state)
text-brand-body   → #3d3535 (primary text)
text-brand-muted  → #9e8a82 (secondary/muted text)
border-brand-gold → #8fac94 (accent border)
```

### Existing Middleware Pattern (current regex location)
```typescript
// Source: middleware.ts:47
const isPublicLandingPage =
  /^\/[a-z0-9][a-z0-9-]*(?:\/thank-you)?$/.test(pathname) &&
  !pathname.startsWith('/dashboard') &&
  !pathname.startsWith('/lcc') &&
  !pathname.startsWith('/operator')
```

### Phase 1 RLS Idempotency Pattern
```sql
-- Source: supabase/migrations/20260314000000_foundation.sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'leads_select_lcc'
  ) THEN
    CREATE POLICY "leads_select_lcc" ON public.leads ...
  END IF;
END $$;
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Pages Router `_app.tsx` shared layout | App Router `layout.tsx` per route segment | Layout colocated with route; Server Component by default |
| Supabase bucket creation via Dashboard UI | SQL migration INSERT to `storage.buckets` | Reproducible across local dev, staging, production |
| `getSession()` for server-side auth checks | `getClaims()` for JWT validation | Security: `getSession()` trusts unverified cookie data; banned in this project |

**Deprecated/outdated in this project:**
- `getSession()`: Explicitly banned in `middleware.ts` comment — use `getClaims()` or `getUser()` only
- Creating buckets via Supabase Dashboard (not reproducible): Use SQL migration

---

## Open Questions

1. **Does `app/[lccSlug]/page.tsx` have `id="form"` on the form container?**
   - What we know: The landing page renders `<LeadCaptureForm>` — but whether the wrapping element has `id="form"` is not confirmed from code inspection.
   - What's unclear: If `id="form"` is missing, the CTA scroll-to behavior (PAGE-02) will silently fail.
   - Recommendation: Verify in Phase 6 plan that the form anchor ID is present; add it if not (it's a one-line change in `page.tsx`).

2. **Does `scroll-behavior: smooth` exist globally?**
   - What we know: `tailwind.config.ts` does not add it; `globals.css` was not inspected.
   - What's unclear: Whether the `<html>` element has smooth scroll set.
   - Recommendation: The nav plan task should verify and add `scroll-smooth` class to `<html>` in the root layout if missing (Tailwind utility).

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright 1.58.2 (e2e) + Vitest 4.1.0 (integration) |
| Config file | `playwright.config.ts` (e2e), `vitest.config.ts` (integration) |
| Quick run command | `npx playwright test tests/e2e/website-infrastructure/ --project=chromium` |
| Full suite command | `npx playwright test --project=chromium` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SITE-01 | `lccs` table has new columns | integration | `npx vitest run tests/integration/website-infra.test.ts` | ❌ Wave 0 |
| SITE-02 | `lcc_testimonials` table exists with FK | integration | `npx vitest run tests/integration/website-infra.test.ts` | ❌ Wave 0 |
| SITE-03 | `lcc_faqs` table exists with FK | integration | `npx vitest run tests/integration/website-infra.test.ts` | ❌ Wave 0 |
| SITE-04 | `lcc-photos` bucket exists and is public | integration | `npx vitest run tests/integration/website-infra.test.ts` | ❌ Wave 0 |
| SITE-05 | 4 sub-routes return 200 unauthenticated | e2e | `npx playwright test tests/e2e/website-infrastructure/public-routes.spec.ts --project=chromium` | ❌ Wave 0 |
| SITE-06 | Sticky nav renders on all LCC pages | e2e | `npx playwright test tests/e2e/website-infrastructure/nav-layout.spec.ts --project=chromium` | ❌ Wave 0 |
| SITE-07 | Hamburger menu opens/closes on mobile | e2e | `npx playwright test tests/e2e/website-infrastructure/nav-layout.spec.ts --project=chromium` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx playwright test tests/e2e/website-infrastructure/ --project=chromium`
- **Per wave merge:** `npx playwright test --project=chromium`
- **Phase gate:** Full Playwright suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/integration/website-infra.test.ts` — covers SITE-01, SITE-02, SITE-03, SITE-04 (schema and storage assertions via admin client)
- [ ] `tests/e2e/website-infrastructure/public-routes.spec.ts` — covers SITE-05 (unauthenticated 200 checks for 4 sub-routes)
- [ ] `tests/e2e/website-infrastructure/nav-layout.spec.ts` — covers SITE-06, SITE-07 (nav presence, hamburger toggle at mobile viewport)

---

## Sources

### Primary (HIGH confidence)
- Existing codebase — `middleware.ts`, `tailwind.config.ts`, `app/[lccSlug]/page.tsx`, `app/(lcc)/layout.tsx`, `supabase/migrations/20260314000000_foundation.sql`
- Next.js 14 App Router docs — layout composition and Server/Client Component boundary patterns
- Supabase Storage docs — `storage.buckets` table structure for SQL-based bucket creation

### Secondary (MEDIUM confidence)
- Existing test infrastructure patterns — `tests/e2e/auth/unauthenticated-redirect.spec.ts`, `tests/integration/lead-upsert.test.ts` — used to model new test file structure

### Tertiary (LOW confidence)
- None — all critical claims verified against existing codebase or established Next.js/Supabase patterns

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in `package.json`; no new dependencies needed
- Architecture: HIGH — layout pattern verified against existing `app/(lcc)/layout.tsx`; migration pattern verified against `20260314000000_foundation.sql`
- Middleware regex: HIGH — current regex read directly from `middleware.ts:47`; extension is additive
- Storage bucket via SQL: HIGH — `storage.buckets` is a standard Supabase table; `ON CONFLICT DO NOTHING` is standard SQL
- Pitfalls: HIGH — all pitfalls derived from reading actual codebase state
- Test architecture: HIGH — Playwright and Vitest configs both confirmed; test directory structure confirmed

**Research date:** 2026-04-04
**Valid until:** 2026-05-04 (stable framework versions; 30-day validity)
