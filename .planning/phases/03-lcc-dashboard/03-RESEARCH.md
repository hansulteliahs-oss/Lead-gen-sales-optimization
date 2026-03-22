# Phase 3: LCC Dashboard - Research

**Researched:** 2026-03-22
**Domain:** Next.js 14 App Router Server Components + Supabase RLS-scoped data fetching + authenticated dashboard UI
**Confidence:** HIGH

<user_constraints>
## User Constraints (from phase brief)

### Locked Decisions

- DASH-04 commission: show signed count only, no dollar figures, no schema migration
- Color palette (from Make.com Gmail email template):
  - `#1a1a2e` navy (header/primary)
  - `#f5f5f5` page background
  - `#f8f4f0` warm card background
  - `#c9a96e` gold accent border
  - `#ffffff` white card
  - `#444` body text
  - `#999` muted text
  - Use inline styles or extend `tailwind.config.ts` — these are not standard Tailwind colors
- No UI component library (Tailwind only)
- Server Components for data fetching (not useState/useEffect)
- `getClaims()` for JWT auth (not `getSession()`) — established pattern
- `createClient()` from `utils/supabase/server.ts` for server-side queries
- RLS auto-scopes all LCC queries to their tenant (no manual `lcc_id` filter needed)
- Stack: Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase (Postgres + RLS + SSR auth)
- Testing: Playwright (E2E) + Vitest (unit)

### Claude's Discretion

- Route structure within `/lcc/dashboard` (sub-routes, lead detail page vs. modal)
- Tailwind config extension vs. inline styles for brand colors
- Component file organization within the LCC route group
- Lead detail display: dedicated page `/lcc/dashboard/leads/[id]` vs. query-param-driven modal
- Exact layout of pipeline stage columns
- Exact wording and arrangement of the commission progress section
- PIPE-04 endpoint placement: `app/api/leads/[id]/stage/route.ts` or extended callback

### Deferred Ideas (OUT OF SCOPE)

- Phase 4: Operator dashboard (OPS-01 through OPS-05)
- Dollar figures or configurable commission rates (deferred to Phase 4+)
- AI-generated insights (Phase 5)
- Billing / subscription gating (Phase 4)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DASH-01 | LCC can view their full lead pipeline grouped by stage | Server Component queries `leads` via `createClient()` — RLS auto-filters to the LCC's own leads; group by `stage` column |
| DASH-02 | LCC can click a lead to see full details (family info, source, all activity timestamps) | Dedicated page `app/(lcc)/lcc/dashboard/leads/[id]/page.tsx` — `createClient()` query with `.eq('id', id).single()` — RLS ensures only own leads accessible |
| DASH-03 | LCC can see count of leads at each pipeline stage | `SELECT stage, COUNT(*) FROM leads GROUP BY stage` or client-side grouping of fetched records |
| DASH-04 | LCC can see total signed families and estimated commission progress | Count of `leads` where `stage = 'Signed'`; display signed count only — no dollar figures; no schema migration |
| DASH-05 | LCC can see which automations are active on their account | Query `lccs` table for `webhook_url` and `referral_webhook_url` — non-null = active; display status indicators |
| PIPE-04 | Operator can manually update a lead's pipeline stage | New `PATCH /api/leads/[id]/stage` route handler; operator-only via JWT role check; accepts `{ stage: string }` for any valid stage value; uses `createAdminClient()` |
</phase_requirements>

---

## Summary

Phase 3 builds on the complete, working Phase 2 foundation: the `leads` and `lccs` tables are fully populated with all required columns, RLS policies are active, and the Supabase server client (`createClient()` from `utils/supabase/server.ts`) is established. The dashboard is entirely read-heavy — all data fetching uses Server Components with the session-scoped server client, and RLS automatically restricts queries to the authenticated LCC's own tenant without any manual filtering.

The main architectural concern is how to structure the LCC dashboard route group. The stub `app/(lcc)/lcc/dashboard/page.tsx` is the starting point. It needs to be expanded into a pipeline overview (grouped by stage) and a lead detail sub-route. The dashboard requires no new schema — all columns (`stage`, `signed_at`, `last_contacted_at`, `created_at`, `utm_source`, etc.) exist from Phase 2.

PIPE-04 is the only write operation in this phase: a new `PATCH /api/leads/[id]/stage` route, operator-only, that allows any valid stage transition. This is intentionally minimal — no UI in the LCC dashboard; the operator calls it via the existing API surface. Full operator UI comes in Phase 4.

**Primary recommendation:** Build the LCC dashboard as pure Server Components reading from RLS-scoped `createClient()`. Add one sub-route for lead detail. Add PIPE-04 as a `PATCH` API route handler gated to `role === 'operator'` in JWT claims.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | 14.2.35 (installed) | App Router, Server Components, route handlers | Core framework — already installed |
| `@supabase/supabase-js` | 2.99.1 (installed) | Database queries, auth session | Official Supabase JS client — already in use |
| `@supabase/ssr` | 0.9.0 (installed) | Cookie-based session for Server Components | Established project pattern |
| `tailwindcss` | 3.4.1 (installed) | Utility-class styling | Project standard — no component library |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `typescript` | 5.x (installed) | Type safety for DB row shapes and API payloads | All new files — established project pattern |

### No New Dependencies

This phase requires zero new npm packages. All capabilities needed (auth, DB client, styling, testing) are already installed.

**Installation:**
```bash
# No new packages required
```

---

## Architecture Patterns

### Route Structure Within LCC Group

```
app/
├── (lcc)/
│   ├── lcc/
│   │   └── dashboard/
│   │       ├── page.tsx                  # Pipeline overview (DASH-01, DASH-03, DASH-04, DASH-05)
│   │       └── leads/
│   │           └── [id]/
│   │               └── page.tsx          # Lead detail (DASH-02)
app/
└── api/
    └── leads/
        └── [id]/
            ├── route.ts                  # GET — existing Make.com fetch endpoint
            ├── callback/
            │   └── route.ts              # POST — existing Make.com callback
            └── stage/
                └── route.ts              # PATCH — new PIPE-04 operator stage update
```

### Tailwind Color Extension

The brand colors are not standard Tailwind values. Extend `tailwind.config.ts` rather than scattering inline styles across components:

```typescript
// tailwind.config.ts — theme.extend.colors additions
colors: {
  brand: {
    navy:    '#1a1a2e',
    pageBg:  '#f5f5f5',
    cardBg:  '#f8f4f0',
    gold:    '#c9a96e',
    white:   '#ffffff',
    body:    '#444444',
    muted:   '#999999',
  }
}
```

This lets components use `bg-brand-navy`, `text-brand-body`, `border-brand-gold` etc. — readable, consistent, no inline style bleed.

### Pattern 1: Server Component Data Fetch (RLS-scoped)

**What:** Async Server Component that calls `createClient()` from `utils/supabase/server.ts`. Because the user is authenticated, the client carries their JWT; RLS on `leads` auto-filters to their `lcc_id`. No manual `.eq('lcc_id', ...)` needed.

**When to use:** Every LCC dashboard read — pipeline data, lead detail, automation status.

```typescript
// app/(lcc)/lcc/dashboard/page.tsx
import { createClient } from '@/utils/supabase/server'

export default async function LccDashboardPage() {
  const supabase = await createClient()

  // RLS auto-scopes this to the authenticated LCC's tenant
  const { data: leads } = await supabase
    .from('leads')
    .select('id, family_name, email, phone, stage, utm_source, last_contacted_at, signed_at, created_at')
    .order('created_at', { ascending: false })

  // Group by stage client-side — avoids a second round-trip
  const byStage = {
    Interested:  leads?.filter(l => l.stage === 'Interested')  ?? [],
    Contacted:   leads?.filter(l => l.stage === 'Contacted')   ?? [],
    Qualified:   leads?.filter(l => l.stage === 'Qualified')   ?? [],
    Signed:      leads?.filter(l => l.stage === 'Signed')      ?? [],
  }

  return ( /* ... */ )
}
```

### Pattern 2: JWT Claims in Server Component (LCC identity)

**What:** In a Server Component, `createClient()` automatically carries the session cookie. For displaying "Hello, [LCC Name]" or fetching LCC-specific config, call `getClaims()` on the server client — same pattern as middleware but inside a Server Component.

**When to use:** When the dashboard needs the current LCC's `lcc_id` to fetch their `lccs` row (automation status, name).

```typescript
// Inside Server Component
const supabase = await createClient()
const { data: claimsData } = await supabase.auth.getClaims()
const lccId = claimsData?.claims?.app_metadata?.lcc_id as string

const { data: lcc } = await supabase
  .from('lccs')
  .select('name, webhook_url, referral_webhook_url')
  .eq('id', lccId)
  .single()
```

### Pattern 3: Lead Detail Sub-Route

**What:** A sub-page at `/lcc/dashboard/leads/[id]` that fetches a single lead record. RLS ensures the LCC can only access their own leads — if they somehow craft a URL with another LCC's lead ID, the query returns no row and the page returns 404.

```typescript
// app/(lcc)/lcc/dashboard/leads/[id]/page.tsx
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: lead } = await supabase
    .from('leads')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!lead) notFound()

  return ( /* ... */ )
}
```

### Pattern 4: PIPE-04 Operator Stage Update Route

**What:** `PATCH /api/leads/[id]/stage` — operator-only endpoint that allows setting any valid stage. Uses `createAdminClient()` (bypasses RLS) after verifying the caller's JWT role is `operator`. Returns the updated lead record.

**When to use:** Operator manually moves a lead to any stage (Interested / Contacted / Qualified / Signed).

```typescript
// app/api/leads/[id]/stage/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/utils/supabase/admin'

const VALID_STAGES = ['Interested', 'Contacted', 'Qualified', 'Signed'] as const

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify caller is authenticated operator via JWT claims
  // (use getClaims() on a server client built from request cookies)
  const { stage } = await request.json()
  if (!VALID_STAGES.includes(stage)) {
    return NextResponse.json({ error: 'Invalid stage' }, { status: 422 })
  }

  // ... role check, then:
  const supabase = createAdminClient()
  const updates: Record<string, unknown> = { stage }
  if (stage === 'Signed') updates.signed_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
```

**Note on auth for PATCH route:** The API route must authenticate the caller. In Phase 2, API routes use a shared `MAKE_WEBHOOK_SECRET`. For PIPE-04 the caller is an authenticated operator browser session, so use `getClaims()` via the SSR server client built from `request.cookies`. This is a new pattern for API routes in this project.

```typescript
// Building a request-scoped server client inside an API route handler
import { createServerClient } from '@supabase/ssr'

const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: () => {}, // read-only in route handlers is fine
    },
  }
)
const { data } = await supabase.auth.getClaims()
const role = data?.claims?.app_metadata?.role
if (role !== 'operator') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

### Anti-Patterns to Avoid

- **Using `createAdminClient()` for LCC reads:** The admin client bypasses RLS. LCC data reads MUST use `createClient()` (session-scoped) so RLS isolation is enforced at query time, not by application logic.
- **Using `getSession()` instead of `getClaims()`:** Established project constraint — `getSession()` trusts unverified cookie data; `getClaims()` validates JWT signature server-side.
- **Client Components with `useEffect` for data fetching:** Decided against — all data comes from Server Components. Avoids hydration issues and keeps auth server-side.
- **Manual `lcc_id` filtering in LCC queries:** RLS handles this. Adding manual `.eq('lcc_id', x)` is redundant and fragile — if the RLS policy is the last line of defense, manual filters don't add security.
- **Putting `signed_at` logic only in PIPE-04:** The existing callback route also sets `signed_at` when stage transitions to Signed. PIPE-04 must do the same for consistency.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tenant data isolation | Manual `lcc_id` WHERE clauses in every query | Supabase RLS (`leads_select_lcc` policy) | Already implemented — enforced at DB level, bulletproof against application bugs |
| Session cookie parsing in Server Components | Custom cookie reader | `createClient()` from `utils/supabase/server.ts` | Already built and tested in Phase 1 |
| JWT role extraction in API routes | Custom JWT decode | `createServerClient()` + `getClaims()` | Validates cryptographic signature — never decode JWT manually |
| Pipeline stage grouping | Separate DB query per stage | Single query + JS `.filter()` by stage | One round-trip vs. four; data volume is small (100s not millions of leads per LCC) |
| Commission calculation | Commission rate × signed count | Signed count only (no dollar math) | Locked decision — DASH-04 says no dollar figures, no new schema |

**Key insight:** This phase is almost entirely UI composition on top of an already-working data layer. Resist the urge to add complexity (state management, real-time subscriptions, client-side fetching) where Server Components + RLS already solve the problem cleanly.

---

## Common Pitfalls

### Pitfall 1: Forgetting `await` on `createClient()`

**What goes wrong:** `createClient()` from `utils/supabase/server.ts` is async (it awaits `cookies()`). Calling it without `await` gives a Promise, not a client — all subsequent `.from()` calls silently fail or throw at runtime.

**Why it happens:** Developers familiar with the synchronous browser client (`createBrowserClient`) miss the `await`.

**How to avoid:** Always `const supabase = await createClient()` in Server Components and Server Actions.

**Warning signs:** TypeScript error "Property 'from' does not exist on type Promise<...>" — but only if strict mode is on.

### Pitfall 2: Wrong Client for the Use Case

**What goes wrong:** Using `createAdminClient()` for LCC dashboard reads bypasses RLS — an LCC could see all tenants' data if application code has a bug. Using `createClient()` for PIPE-04 (operator stage update) would fail because the LCC's RLS SELECT policy blocks leads belonging to other LCCs and the UPDATE would fail too.

**Why it happens:** The three-client pattern (browser / server / admin) requires deliberate choice at each use site.

**How to avoid:** Rule of thumb — LCC reads always use `createClient()` (RLS-enforced); operator writes / Make.com endpoints always use `createAdminClient()` (RLS bypassed with service role).

### Pitfall 3: Lead Detail Page Has No RLS Guard

**What goes wrong:** If `app/(lcc)/lcc/dashboard/leads/[id]/page.tsx` uses `createAdminClient()` instead of `createClient()`, an authenticated LCC could access lead detail for a lead belonging to a different LCC by directly navigating to the URL.

**Why it happens:** Using the admin client "just to be safe" about the data being found.

**How to avoid:** Use `createClient()` for the detail page. RLS will return no row if the lead doesn't belong to the LCC — then call `notFound()`. This is the correct behavior.

### Pitfall 4: PIPE-04 Sets `stage` Without Setting `signed_at`

**What goes wrong:** When the operator manually sets stage to `Signed` via PIPE-04, `signed_at` remains null. The dashboard commission count (`WHERE stage = 'Signed'`) would show the lead but `signed_at` data would be missing for future analytics.

**Why it happens:** The callback route (Phase 2) already handles this, but PIPE-04 is new code and might omit the `signed_at` side effect.

**How to avoid:** In PIPE-04, mirror the callback route logic — when `stage === 'Signed'`, include `signed_at: new Date().toISOString()` in the update payload.

### Pitfall 5: Tailwind Brand Colors Not Applied Consistently

**What goes wrong:** Using inline styles in some components and Tailwind classes in others for the same color creates drift and makes global theme changes painful.

**Why it happens:** Inline styles are the path of least resistance when colors aren't in Tailwind's config.

**How to avoid:** Extend `tailwind.config.ts` with the brand color palette first (Wave 0 task). Then use only Tailwind classes (`bg-brand-navy`, `border-brand-gold`, etc.) across all Phase 3 components.

### Pitfall 6: Automation Status Shows Wrong State

**What goes wrong:** Checking only `webhook_url IS NOT NULL` to show "automation active" may be misleading — a URL could be stored but the Make.com scenario could be paused or deleted.

**Why it happens:** The app has no direct Make.com API integration to check live scenario status.

**How to avoid:** Per the requirement scope (DASH-05), show webhook URL presence/absence as a proxy for "configured" vs. "not configured". Do not claim to show real-time Make.com scenario health. Label it "Webhook configured" not "Automation running".

---

## Code Examples

Verified patterns from existing codebase:

### Server Component with RLS-Scoped Client

```typescript
// Established pattern — used in Server Actions and API routes already
import { createClient } from '@/utils/supabase/server'

// In an async Server Component:
const supabase = await createClient()
const { data: leads, error } = await supabase
  .from('leads')
  .select('id, family_name, stage, created_at')
  .order('created_at', { ascending: false })
// RLS auto-filters to current LCC's lcc_id — no .eq() needed
```

### getClaims() in Server Context (from middleware.ts)

```typescript
// Established pattern from middleware.ts — same approach in Server Components
const { data } = await supabase.auth.getClaims()
const claims = data?.claims
const lccId = claims?.app_metadata?.lcc_id as string | undefined
const role  = claims?.app_metadata?.role   as string | undefined
```

### Admin Client for Operator Writes (from callback/route.ts)

```typescript
// Established pattern — admin client bypasses RLS for cross-tenant operations
import { createAdminClient } from '@/utils/supabase/admin'
const supabase = createAdminClient()
const { error } = await supabase
  .from('leads')
  .update({ stage: 'Qualified', /* ... */ })
  .eq('id', leadId)
```

### Building SSR Client Inside an API Route Handler (new in Phase 3)

```typescript
// Required for PIPE-04 JWT role check in an API route handler
import { createServerClient } from '@supabase/ssr'
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: () => {},
    },
  }
)
const { data } = await supabase.auth.getClaims()
const role = data?.claims?.app_metadata?.role
```

### Playwright Auth Pattern (from existing tests)

```typescript
// Login helper used across existing E2E tests
await page.goto('/login')
await page.fill('input[name="email"]', 'lcc1@test.com')
await page.fill('input[name="password"]', 'password')
await page.click('button[type="submit"]')
await expect(page).toHaveURL('/lcc/dashboard', { timeout: 10_000 })
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `getSession()` in middleware | `getClaims()` — validates JWT signature | Phase 1 decision | Security — `getSession()` trusts unverified cookie data |
| `auth-helpers-nextjs` package | `@supabase/ssr` | Supabase deprecation (2024) | `@supabase/ssr` is the current official package |
| Client Components + `useEffect` for data | Server Components (async) | Next.js 13+ App Router | Simpler code, no hydration mismatch, auth stays server-side |
| Four separate DB calls (one per stage) for pipeline grouping | Single query + JS grouping | — | One round-trip; acceptable at LCC data volumes |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Deprecated — project already uses `@supabase/ssr`.
- `getSession()`: Explicitly banned in this project (see middleware.ts comment).
- `useEffect` + client fetching: Against project decisions — Server Components only for data.

---

## Open Questions

1. **PIPE-04 auth mechanism for API route**
   - What we know: Phase 2 API routes use a shared `MAKE_WEBHOOK_SECRET` Bearer token. PIPE-04 is called by an authenticated operator browser session, not Make.com.
   - What's unclear: Does the operator trigger stage updates from a UI button (Phase 4 will build the UI) or purely via direct API call in Phase 3?
   - Recommendation: Build PIPE-04 as a proper JWT-authenticated PATCH route (using `getClaims()` via an SSR client built from request cookies). This keeps Phase 3 self-contained and Phase 4 can add the operator UI without touching the API layer.

2. **LCC layout file**
   - What we know: `app/(lcc)/lcc/dashboard/page.tsx` is a stub. There is no `app/(lcc)/layout.tsx` file (confirmed by directory scan — only the `page.tsx` exists).
   - What's unclear: Should Phase 3 add a shared layout for the LCC route group (nav bar, logout button)?
   - Recommendation: Add a minimal `app/(lcc)/layout.tsx` with the brand header and a logout action. This is necessary for the dashboard to feel like a real product, and deferred to Phase 3 since Phase 1 only needed the stub.

3. **Lead count query strategy**
   - What we know: Supabase supports both `SELECT stage, COUNT(*)` with `.select('stage').eq(...)` chains and simple JS grouping after a full `SELECT *`.
   - What's unclear: At scale, a SQL-level GROUP BY is more efficient; at current LCC volumes (10s–100s of leads), JS grouping after a single fetch is negligible.
   - Recommendation: Single `SELECT` of all lead columns + JS `.filter()` grouping. Simpler code, one round-trip, and avoids premature optimization at this scale.

---

## Validation Architecture

> `workflow.nyquist_validation` is `true` in `.planning/config.json` — this section is required.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Playwright 1.58.2 (E2E) + Vitest 4.1.0 (unit) |
| Playwright config | `playwright.config.ts` (root) — `testDir: ./tests/e2e`, `baseURL: http://localhost:3000` |
| Vitest config | `vitest.config.ts` (root) — `environment: node`, loads `.env.local` |
| Quick run (Playwright) | `npx playwright test tests/e2e/lcc-dashboard/` |
| Quick run (Vitest) | `npx vitest run tests/integration/stage-update.test.ts` |
| Full suite | `npx playwright test && npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DASH-01 | LCC sees leads grouped by pipeline stage after login | Playwright E2E | `npx playwright test tests/e2e/lcc-dashboard/pipeline-view.spec.ts` | Wave 0 |
| DASH-02 | LCC clicks a lead card and sees full detail page | Playwright E2E | `npx playwright test tests/e2e/lcc-dashboard/lead-detail.spec.ts` | Wave 0 |
| DASH-03 | Stage count badges show correct numbers per stage | Playwright E2E | `npx playwright test tests/e2e/lcc-dashboard/stage-counts.spec.ts -g "DASH-03"` | Wave 0 (inline in pipeline-view) |
| DASH-04 | Commission section shows signed count, no dollar amounts | Playwright E2E | `npx playwright test tests/e2e/lcc-dashboard/commission.spec.ts` | Wave 0 |
| DASH-05 | Automation status section shows webhook configured/not configured | Playwright E2E | `npx playwright test tests/e2e/lcc-dashboard/automations.spec.ts` | Wave 0 |
| PIPE-04 | PATCH /api/leads/[id]/stage updates stage; returns 403 for LCC role | Vitest unit | `npx vitest run tests/integration/stage-update.test.ts` | Wave 0 |
| PIPE-04 | PATCH /api/leads/[id]/stage sets signed_at when stage is Signed | Vitest unit | `npx vitest run tests/integration/stage-update.test.ts -t "sets signed_at"` | Wave 0 |
| PIPE-04 | PATCH /api/leads/[id]/stage rejects invalid stage values | Vitest unit | `npx vitest run tests/integration/stage-update.test.ts -t "rejects invalid"` | Wave 0 |
| DASH-02 | Lead detail page returns 404 for another LCC's lead ID (RLS) | Playwright E2E | `npx playwright test tests/e2e/lcc-dashboard/lead-detail.spec.ts -g "RLS"` | Wave 0 |

### Specific Test Cases

**DASH-01/DASH-03 — Pipeline view with stage grouping:**
```typescript
// tests/e2e/lcc-dashboard/pipeline-view.spec.ts
test('DASH-01: lcc1 sees leads grouped by stage with counts', async ({ page }) => {
  // Login as lcc1 (seed has known leads at various stages)
  await page.goto('/login')
  await page.fill('input[name="email"]', 'lcc1@test.com')
  await page.fill('input[name="password"]', 'password')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/lcc/dashboard', { timeout: 10_000 })

  // Expect four stage columns/sections visible
  await expect(page.getByTestId('stage-Interested')).toBeVisible()
  await expect(page.getByTestId('stage-Contacted')).toBeVisible()
  await expect(page.getByTestId('stage-Qualified')).toBeVisible()
  await expect(page.getByTestId('stage-Signed')).toBeVisible()
})
```

**DASH-02 — Lead detail:**
```typescript
// tests/e2e/lcc-dashboard/lead-detail.spec.ts
test('DASH-02: clicking a lead navigates to full detail page', async ({ page }) => {
  // ... login as lcc1 ...
  await page.goto('/lcc/dashboard')
  await page.getByTestId('lead-card').first().click()
  await expect(page).toHaveURL(/\/lcc\/dashboard\/leads\/[a-f0-9-]+/)
  await expect(page.getByTestId('lead-family-name')).toBeVisible()
  await expect(page.getByTestId('lead-email')).toBeVisible()
  await expect(page.getByTestId('lead-phone')).toBeVisible()
  await expect(page.getByTestId('lead-created-at')).toBeVisible()
})

test('DASH-02 RLS: lcc1 cannot access lcc2 lead detail by URL', async ({ page }) => {
  // ... login as lcc1 ...
  // Navigate to a known lcc2 lead ID (from seed data)
  await page.goto('/lcc/dashboard/leads/KNOWN_LCC2_LEAD_ID')
  // Should get Next.js 404 — RLS returns no row, page calls notFound()
  await expect(page).toHaveURL(/\/lcc\/dashboard\/leads\//)
  await expect(page.getByText('404')).toBeVisible()
})
```

**DASH-04 — Commission section:**
```typescript
// tests/e2e/lcc-dashboard/commission.spec.ts
test('DASH-04: commission section shows signed count, not dollar amount', async ({ page }) => {
  // ... login as lcc1 ...
  await page.goto('/lcc/dashboard')
  const commissionSection = page.getByTestId('commission-section')
  await expect(commissionSection).toBeVisible()
  await expect(commissionSection.getByTestId('signed-count')).toBeVisible()
  // No dollar sign anywhere in commission section
  await expect(commissionSection).not.toContainText('$')
})
```

**PIPE-04 — Stage update unit tests:**
```typescript
// tests/integration/stage-update.test.ts
// Pattern mirrors callback-api.test.ts — mock createAdminClient, mock getClaims
describe('PATCH /api/leads/[id]/stage', () => {
  it('returns 403 when caller is not operator role', async () => { /* ... */ })
  it('returns 422 for an invalid stage value', async () => { /* ... */ })
  it('updates stage and returns 200 for valid operator request', async () => { /* ... */ })
  it('sets signed_at when stage is set to Signed', async () => { /* ... */ })
  it('does not set signed_at when stage is not Signed', async () => { /* ... */ })
})
```

### Sampling Rate

- **Per task commit:** `npx playwright test tests/e2e/lcc-dashboard/ && npx vitest run tests/integration/stage-update.test.ts`
- **Per wave merge:** `npx playwright test && npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/e2e/lcc-dashboard/pipeline-view.spec.ts` — covers DASH-01, DASH-03
- [ ] `tests/e2e/lcc-dashboard/lead-detail.spec.ts` — covers DASH-02 (navigation + RLS)
- [ ] `tests/e2e/lcc-dashboard/commission.spec.ts` — covers DASH-04
- [ ] `tests/e2e/lcc-dashboard/automations.spec.ts` — covers DASH-05
- [ ] `tests/integration/stage-update.test.ts` — covers PIPE-04 (unit, mocked admin client)

Note: The existing test infrastructure (Playwright config, Vitest config, `tests/e2e/` and `tests/integration/` directories) is already in place. Wave 0 only needs new spec files, no framework setup.

---

## Sources

### Primary (HIGH confidence)

- Codebase inspection: `utils/supabase/server.ts`, `utils/supabase/admin.ts`, `middleware.ts` — actual implementation patterns
- Codebase inspection: `app/api/leads/[id]/callback/route.ts` — admin client + update pattern
- Codebase inspection: `supabase/migrations/20260315000000_phase2_lead_capture.sql` — confirmed column names and RLS policy names
- Codebase inspection: `tests/e2e/auth/rls-isolation.spec.ts`, `tests/integration/callback-api.test.ts` — confirmed test patterns
- `playwright.config.ts` + `vitest.config.ts` — confirmed framework versions and commands
- `package.json` — confirmed installed versions: next@14.2.35, @supabase/ssr@0.9.0, @supabase/supabase-js@2.99.1, playwright@1.58.2, vitest@4.1.0

### Secondary (MEDIUM confidence)

- Phase brief and additional context — locked decisions on color palette, DASH-04 commission scope, auth patterns
- Prior RESEARCH.md files (Phase 1, Phase 2) — confirmed `getClaims()` security rationale, three-client pattern, async `createClient()` requirement

### Tertiary (LOW confidence)

- None — all claims are grounded in direct codebase inspection or established project decisions.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages confirmed installed, versions pinned
- Architecture: HIGH — all patterns derived from existing working code in the same codebase
- Pitfalls: HIGH — derived from known decisions (three-client pattern, `getClaims()`, RLS) and codebase inspection
- Test architecture: HIGH — existing test infrastructure confirmed; only new spec files needed

**Research date:** 2026-03-22
**Valid until:** 2026-04-22 (stable stack — Supabase + Next.js 14 LTS; no fast-moving dependencies)
