# Phase 8: SEO - Context

**Gathered:** 2026-04-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Add `generateMetadata` to all 5 public LCC website pages (`/`, `/about`, `/au-pairs`, `/faq`, `/testimonials`) so each gets a unique `<title>`, `<meta name="description">`, and Open Graph tags (`og:title`, `og:description`, `og:image`). All metadata is driven by DB content (LCC name from `lccs` table). No new pages, no new DB columns — metadata layer only.

</domain>

<decisions>
## Implementation Decisions

### Title format
- Pattern: **`[LCC Name] | [Page Name]`** — LCC name first, pipe separator
- Landing page (`/`): `"Kim Arvdalen | Local Childcare Consultant"` — descriptive subtitle instead of a page name
- Sub-pages: `"Kim Arvdalen | About"`, `"Kim Arvdalen | Au Pairs"`, `"Kim Arvdalen | FAQ"`, `"Kim Arvdalen | Testimonials"`
- LCC name comes from `lccs.name` DB field — dynamic per LCC, not hardcoded

### Description source
- **Template-based** — static strings with LCC name injected (not pulled from DB content fields)
- **Unique per page** — each page has a different template
  - `/` (landing): Introduces who the LCC is and what she does
  - `/about`: Focuses on her background and approach
  - `/au-pairs`: Describes the au pair program information available
  - `/faq`: Frames the page as answering common family questions
  - `/testimonials`: Highlights family experiences and stories
- Claude picks exact copy for each template — keep warm, professional, family-facing tone

### og:image fallback
- When `photo_url` is NULL: **omit the `og:image` tag entirely** — no broken images, no placeholder asset needed
- When `photo_url` exists: include as `og:image` using the raw Supabase Storage URL

### Seed data update
- DB seed currently has "Kim Johnson" — **update to "Kim Arvdalen"** as part of this phase
- Slug may also need updating from `kim-johnson` to `kim-arvdalen` (planner to confirm impact on existing tests/URLs)

### Claude's Discretion
- Exact meta description copy for each page template
- Whether `generateMetadata` lives on each page individually or delegates through the shared `[lccSlug]/layout.tsx` (technical architecture — use whichever is cleaner in Next.js App Router)
- `og:type` value (`website` is standard)
- Whether to update the root `app/layout.tsx` static metadata (currently "Create Next App" placeholder) — planner should clean this up

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/[lccSlug]/layout.tsx` — already fetches `lccs.name` and `lccs.slug` from DB; `generateMetadata` can be co-located here or on each page
- `utils/supabase/admin.ts` — `createAdminClient()` is the established pattern for server-side DB reads on public pages
- Root `app/layout.tsx` — has a static `export const metadata: Metadata` placeholder ("Create Next App") that should be updated

### Established Patterns
- All LCC pages are server components — `generateMetadata` (async, receives `params`) is the correct Next.js 14 App Router mechanism
- `params.lccSlug` is available on all pages under `app/[lccSlug]/`
- `notFound()` from `next/navigation` is used when slug doesn't resolve — same guard needed in `generateMetadata`

### Integration Points
- 5 pages need metadata: `app/[lccSlug]/page.tsx`, `app/[lccSlug]/about/page.tsx`, `app/[lccSlug]/au-pairs/page.tsx`, `app/[lccSlug]/faq/page.tsx`, `app/[lccSlug]/testimonials/page.tsx`
- `lccs` table has `name`, `slug`, `photo_url` — all needed for metadata generation
- Supabase Storage URLs are already used as `<img src>` on pages (plain `img` tag, no Next.js image optimization) — same URL format for `og:image`

</code_context>

<specifics>
## Specific Ideas

- The `[lccSlug]/layout.tsx` already makes a DB call to fetch `name`/`slug` — the metadata query could reuse this same call to avoid a second round-trip, or `generateMetadata` can be placed per-page and make its own minimal query
- Kim's real last name is **Arvdalen** — seed data (name + slug) should be updated from the kim-johnson placeholder to kim-arvdalen as part of this phase

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-seo*
*Context gathered: 2026-04-08*
