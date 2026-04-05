# Phase 6: Website Infrastructure - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

<domain>
## Phase Boundary

DB schema extensions (new columns on `lccs`, new `lcc_testimonials` and `lcc_faqs` tables), Supabase Storage bucket for LCC photos, middleware expansion to allow four new public sub-routes, and a shared sticky navigation layout component used by all LCC website pages. No page content or design beyond the nav — that's Phase 7.

</domain>

<decisions>
## Implementation Decisions

### Navigation visual style
- Background: white/transparent — clean, lets page content be the star
- Brand palette (sage green accent, warm cream tones) used for CTA and hover states
- LCC name displayed as plain text (no avatar/photo in nav) — name doubles as the home link back to `/[lccSlug]/`
- Current page link gets a subtle active state highlight (color or underline) for wayfinding
- Bottom border or shadow treatment: Claude's discretion

### CTA button style
- Claude's discretion — pick whatever contrasts best against white nav and feels professional, using the existing brand palette

### Mobile menu behavior
- Hamburger breakpoint: `md` (768px) — inline links above, hamburger below
- Menu style: dropdown panel that slides down from the nav (~200ms smooth transition)
- Nav links stack vertically with "Get Started" CTA at the bottom of the panel
- Tapping a nav link auto-closes the menu
- Hamburger icon toggles to X when menu is open

### Nav link set & order
- Links: About | Au Pairs | FAQ | Testimonials
- No separate "Home" link — clicking the LCC name navigates to landing page
- "Get Started" CTA appears as a separate button after the nav links (not inline text)
- CTA behavior: on the landing page, smooth-scrolls to `#form`; on sub-pages, navigates to `/[lccSlug]/#form`
- Active state on current page's link

### Photo storage structure
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

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `tailwind.config.ts` — Brand palette already defined: `brand-navy` (#fdfaf9), `brand-pageBg` (#f7f1ef), `brand-cardBg` (#fdfaf9), `brand-gold` (#8fac94 sage green), `brand-body` (#3d3535), `brand-muted` (#9e8a82)
- `app/(lcc)/layout.tsx` — LCC dashboard layout with header pattern (brand-navy bg, sage accent border, brand-body text). Public website nav is a separate component but can reference this style
- `utils/supabase/admin.ts` — Admin client for bypassing RLS (needed for public page data fetching)
- `utils/supabase/server.ts` — Server client for authenticated contexts

### Established Patterns
- Middleware public route check: regex at `middleware.ts:47` — `/^\/[a-z0-9][a-z0-9-]*(?:\/thank-you)?$/` must be extended to include `/about`, `/au-pairs`, `/faq`, `/testimonials`
- Migrations in `/supabase/migrations/` — sequential SQL files
- Route groups: `(auth)`, `(lcc)`, `(operator)` — public LCC pages live in `app/[lccSlug]/`
- Server actions pattern from `app/[lccSlug]/actions.ts`
- JWT auth: `getClaims()` is the secure pattern (never `getSession()`)

### Integration Points
- `middleware.ts` — regex must expand to allow 4 new sub-paths publicly
- `app/[lccSlug]/` — needs a `layout.tsx` with the shared sticky nav (currently no layout exists for this route segment)
- `lccs` table — new columns: `headline`, `subheadline`, `bio`, `bio_teaser`, `photo_url`, `custom_domain`
- New tables: `lcc_testimonials` (id, lcc_id FK, family_name, quote, order_index, created_at), `lcc_faqs` (id, lcc_id FK, question, answer, order_index, created_at)
- Supabase Storage — new `lcc-photos` bucket via migration or MCP

</code_context>

<specifics>
## Specific Ideas

- The nav layout component will live in `app/[lccSlug]/layout.tsx` — wrapping the landing page, thank-you page, and all new sub-pages with the sticky nav
- The existing landing page (`app/[lccSlug]/page.tsx`) and thank-you page continue to work within the new layout — the nav is additive, not a redesign of page content (that's Phase 7)
- Photo folder convention (`{lcc-slug}/profile.jpg`) scales cleanly if more asset types are added later (e.g., `{lcc-slug}/hero.jpg`, `{lcc-slug}/gallery/`)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-website-infrastructure*
*Context gathered: 2026-04-04*
