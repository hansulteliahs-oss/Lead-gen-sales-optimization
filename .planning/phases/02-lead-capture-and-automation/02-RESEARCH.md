# Phase 2: Lead Capture and Automation - Research

**Researched:** 2026-03-17
**Domain:** Next.js 14 server actions + dynamic routes + Supabase upsert + Make.com webhook + API route handlers
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Landing page content & style**
- Route: `/[lccSlug]` — dynamic public page, not protected by middleware
- Page structure: LCC intro section (LCC name + headline) above the form — not just the form alone
- Intro headline: "Interested in au pair childcare? Fill out the form below and [LCC Name] will be in touch."
- Visual style: Clean but slightly warmer than the login page — white background, slightly larger typography, warmer feel. Still Tailwind utility classes only — no new design system components
- Slug format: first initial + last name, auto-derived at LCC creation (e.g., Sarah Johnson → `s-johnson`). Stored in `lccs.slug` column. URL-safe, lowercase, hyphen-separated

**Post-submit family experience**
- After successful form submission: redirect to `/[lccSlug]/thank-you`
- Thank-you page message: "Thanks! [LCC Name] will reach out to you shortly."
- Thank-you page includes a "Learn more about au pairs" link — URL is a per-LCC configurable field stored in `lccs` table. Requires a `learn_more_url` column in `lccs`
- Thank-you page: confirmation message + learn more link only — no other CTAs

**TCPA consent**
- Checkbox is required — form cannot be submitted without checking it (hard block, client-side validation)
- Consent text (dynamic per page, inserts LCC name): "By checking this box, I consent to receive automated SMS text messages and emails from [LCC Name] regarding au pair childcare services. Message frequency varies. Message and data rates may apply. Reply STOP to opt out. Consent is not a condition of any purchase or service."
- Data stored on lead record: verbatim consent text + submission timestamp + submitter IP address
- Consent text references the specific LCC's name (not a generic brand name)

**Duplicate submission behavior**
- Uniqueness key: `(email, lcc_id)` — one lead per email per LCC
- On duplicate submission: silent upsert — update the existing lead record (timestamp, message) rather than creating a new one. No error shown to the family
- Make.com webhook only fires on first submission (new lead creation). On upsert of an existing lead, the webhook is NOT re-triggered

**Make.com webhook trigger**
- Trigger point: inside the form's server action — after INSERT/upsert commits, before redirect to thank-you page
- Webhook failure behavior: lead is always committed first. If the webhook call fails, the failure is logged server-side and the family still sees the success/thank-you redirect. No retry logic
- Webhook payload: lead ID only. Make.com fetches full lead details by calling back to `GET /api/leads/[id]`
- The `GET /api/leads/[id]` endpoint is secured by shared secret header (`Authorization: Bearer <MAKE_SECRET>`). Secret stored in env var `MAKE_WEBHOOK_SECRET`
- Each LCC has their own Make.com webhook URL stored in `lccs` table. App fires the URL stored for that LCC on lead creation

**UTM / lead source capture**
- UTM params captured server-side at page render (Next.js dynamic route reads searchParams). Stored as hidden form fields, submitted with the form
- Fields stored on lead record: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`
- If no UTM params present, values are null (no synthetic "direct" label)

**Form fields**
- Required fields: name, email, phone
- Optional field: message (free text)
- Phone validation: US format only, 10 digits. Client-side hint shown ("(555) 867-5309"). Store as raw digits

**Make.com callback API (pipeline stage updates)**
- Endpoint: `POST /api/leads/[id]/callback`
- Auth: same shared secret header as the lead fetch endpoint (`MAKE_WEBHOOK_SECRET`)
- Payload: `{ stage?: string, last_contacted_at?: ISO timestamp }`
- Allowed stage transitions via callback: **Interested → Contacted only**
- Referral trigger: LCC has a separate Make.com webhook URL for referral automation, stored in `lccs` table as `lccs.referral_webhook_url`. App fires this URL when a lead's stage is set to Signed

### Claude's Discretion
- Exact Supabase schema additions (column names for slug, learn_more_url, referral_webhook_url, UTM fields, TCPA consent fields)
- Middleware matcher update to exclude `/[lccSlug]` routes from auth protection
- Error handling for 404 when an unknown slug is accessed (LCC not found)
- Form loading/disabled state during submission
- Exact phone number validation regex
- Styling details (exact color values, spacing, typography sizes within "slightly warmer" direction)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LEAD-01 | Each LCC has a unique public landing page with a family interest form | Next.js App Router dynamic route `app/[lccSlug]/page.tsx`; middleware matcher excludes this segment |
| LEAD-02 | Family can submit name, email, phone, and optional message via the form | Server Action pattern from `app/(auth)/login/actions.ts`; `FormData.get()` extracts all fields |
| LEAD-03 | Form captures TCPA consent (explicit opt-in checkbox with consent text and timestamp stored) | HTML `required` on checkbox for client-side block; server stores verbatim text, timestamp, IP via `request.headers.get('x-forwarded-for')` in middleware context |
| LEAD-04 | On form submit, lead is instantly created in the LCC's pipeline as "Interested" | Supabase admin client `INSERT` (upsert with `onConflict: 'email,lcc_id'`); uses `createAdminClient()` since this route is public (no user session) |
| LEAD-05 | On form submit, Make.com webhook is triggered with lead data to start nurture sequence | `fetch()` called inside Server Action after DB commit; lead ID in payload; failure logged but does not block redirect |
| LEAD-06 | Lead source (landing page, ad UTM, referral) is captured and stored | `searchParams` prop (synchronous in Next.js 14) passed as hidden form fields; stored on lead record |
| PIPE-01 | Leads move through stages: Interested → Contacted → Qualified → Signed | `stage` column on `leads` table; default `'Interested'` on insert; enum-style check constraint |
| PIPE-02 | Pipeline stage updates when Make.com automation callback fires | `POST /api/leads/[id]/callback` Route Handler; updates `stage` and `last_contacted_at` |
| PIPE-03 | Lead record stores: family name, email, phone, source, stage, last contacted date, created date | Migration adds all columns to `leads` table; Phase 1 only had `family_name`, `email`, `lcc_id` |
| PIPE-04 | Operator can manually update a lead's pipeline stage | `stage` column allows any authorized update; no restriction on manual transitions (operator uses admin client) |
| PIPE-05 | Signed leads are marked with sign-up date for commission tracking | `signed_at TIMESTAMPTZ` column on `leads`; set when stage transitions to `'Signed'` |
| AUTO-01 | On new lead: Make.com triggers immediate SMS to family within 60 seconds | Webhook fires synchronously in Server Action before redirect; Make.com receives lead ID, fetches details, triggers Twilio SMS |
| AUTO-02 | On new lead: Make.com triggers immediate email to family within 60 seconds | Same webhook fires for both SMS and email; Make.com scenario handles both channels |
| AUTO-03 | Make.com runs a nurture sequence (at minimum 3 follow-up touchpoints) over the following days | Make.com scenario design (not app code); app's role is the initial webhook trigger only |
| AUTO-04 | Make.com callbacks update lead's `last_contacted_at` and stage in the database | `POST /api/leads/[id]/callback` Route Handler; `MAKE_WEBHOOK_SECRET` Bearer auth |
| AUTO-05 | On family sign-up (stage = Signed): Make.com triggers referral request SMS/email to that family | Callback endpoint detects `stage === 'Signed'` transition and fires `lccs.referral_webhook_url` |
| AUTO-06 | Each LCC has their own Make.com webhook URLs stored in the database (not shared) | `lccs.webhook_url` and `lccs.referral_webhook_url` columns; app reads per-LCC URL at trigger time |
</phase_requirements>

---

## Summary

Phase 2 extends the Phase 1 foundation by adding three distinct capability layers: a public-facing lead capture page, a Supabase schema migration that fully builds out the `leads` and `lccs` tables, and two Next.js API Route Handlers that Make.com calls back into. The core technical challenge is making the landing page public (excluded from the auth middleware) while keeping all other routes protected. The second challenge is the upsert pattern: a UNIQUE constraint on `(email, lcc_id)` enforces deduplication at the database level, and the server action must distinguish between a new insert and an upsert to decide whether to fire the Make.com webhook.

The existing code base gives Phase 2 everything it needs. The `createAdminClient()` function (service role) is the correct client for the public landing page server action — there is no authenticated user session in that context, so the standard `createClient()` (anon key) won't work for writing lead records protected by RLS. The login page's server action and form structure are the exact patterns to follow. The middleware `matcher` regex is the only functional change needed to existing code.

The API Route Handlers (`GET /api/leads/[id]` and `POST /api/leads/[id]/callback`) are net-new. They use the Next.js 14 App Router `app/api/` file convention, read `Authorization: Bearer` headers from the request object directly, and use `createAdminClient()` to bypass RLS since Make.com is not an authenticated Supabase user.

**Primary recommendation:** Use `createAdminClient()` in the lead capture server action and both API route handlers (all three are public endpoints without user sessions). Use a UNIQUE constraint on `(email, lcc_id)` with Supabase upsert `onConflict: 'email,lcc_id'` for deduplication. Fire the Make.com webhook with `fetch()` inside the server action — do not await it blocking the response; use a fire-and-log pattern.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | ^2.99.1 (already installed) | Admin client for lead INSERT/upsert in public server action | Service role bypasses RLS — correct for public endpoints with no user session |
| `@supabase/ssr` | ^0.9.0 (already installed) | Not used in public routes; used for authenticated routes in later phases | Established in Phase 1 |
| `next` | 14.2.35 (already installed) | App Router dynamic routes, server actions, route handlers | Core framework |
| `tailwindcss` | ^3.4.1 (already installed) | Landing page styling | Established in Phase 1 |

### No New Dependencies
Phase 2 requires zero new npm packages. All capabilities (server actions, route handlers, `fetch`, Supabase admin client) are provided by the already-installed stack.

**Installation:**
```bash
# No new packages required
```

---

## Architecture Patterns

### Recommended Project Structure
```
app/
├── [lccSlug]/                   # Public dynamic route — no auth
│   ├── page.tsx                 # Landing page (server component)
│   ├── actions.ts               # Lead capture server action ('use server')
│   └── thank-you/
│       └── page.tsx             # Thank-you page (server component)
├── api/
│   └── leads/
│       └── [id]/
│           ├── route.ts         # GET /api/leads/[id] — Make.com fetches lead detail
│           └── callback/
│               └── route.ts    # POST /api/leads/[id]/callback — Make.com stage update
supabase/
└── migrations/
    └── 20260317000000_phase2_lead_capture.sql   # Schema additions
```

### Pattern 1: Dynamic Public Page with searchParams (Next.js 14)
**What:** A server component page at `app/[lccSlug]/page.tsx` receives `params.lccSlug` and `searchParams` (both synchronous in Next.js 14) to look up the LCC and capture UTM data.

**When to use:** All pages in this phase. Note: Next.js 14 uses synchronous `params` and `searchParams` (not Promises — that's Next.js 15+).

**Example:**
```typescript
// Source: https://nextjs.org/docs/14/app/api-reference/file-conventions/page
// app/[lccSlug]/page.tsx

import { createAdminClient } from '@/utils/supabase/admin'
import { notFound } from 'next/navigation'
import LeadForm from './lead-form'

export default async function LandingPage({
  params,
  searchParams,
}: {
  params: { lccSlug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { lccSlug } = params

  // Look up LCC by slug (admin client — no user session on this public page)
  const admin = createAdminClient()
  const { data: lcc } = await admin
    .from('lccs')
    .select('id, name, slug, learn_more_url, webhook_url')
    .eq('slug', lccSlug)
    .single()

  if (!lcc) notFound()

  // Capture UTM params server-side (synchronous in Next.js 14)
  const utmSource = (searchParams.utm_source as string) ?? null
  const utmMedium = (searchParams.utm_medium as string) ?? null
  const utmCampaign = (searchParams.utm_campaign as string) ?? null
  const utmContent = (searchParams.utm_content as string) ?? null

  return (
    <main>
      <h1>Interested in au pair childcare? Fill out the form below and {lcc.name} will be in touch.</h1>
      <LeadForm
        lccId={lcc.id}
        lccName={lcc.name}
        lccSlug={lcc.slug}
        utmSource={utmSource}
        utmMedium={utmMedium}
        utmCampaign={utmCampaign}
        utmContent={utmContent}
      />
    </main>
  )
}
```

### Pattern 2: Lead Capture Server Action with Upsert and Webhook Fire
**What:** Server action reads FormData, upserts to `leads` table via admin client, fires Make.com webhook only on first creation, redirects to thank-you page.

**Critical detail:** Use `createAdminClient()` not `createClient()` — there is no authenticated user session on the public landing page. The anon-key client would be blocked by RLS.

**Upsert pattern:** Supabase `.upsert()` with `onConflict: 'email,lcc_id'` and `ignoreDuplicates: false`. The upsert updates the record but the webhook fires only when a new record is created. To distinguish insert from upsert, check if `created_at` equals `updated_at` (or compare the returned row's `created_at` to `NOW()` within a short threshold). A simpler and more reliable approach: use raw SQL `INSERT ... ON CONFLICT DO UPDATE ... RETURNING (xmax = 0) AS was_inserted` — `xmax = 0` is true for a new insert.

**Example:**
```typescript
// Source: https://supabase.com/docs/reference/javascript/upsert
// app/[lccSlug]/actions.ts
'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function submitLeadForm(formData: FormData) {
  const admin = createAdminClient()

  const lccId = formData.get('lcc_id') as string
  const lccSlug = formData.get('lcc_slug') as string
  const name = formData.get('name') as string
  const email = (formData.get('email') as string).toLowerCase().trim()
  const phone = (formData.get('phone') as string).replace(/\D/g, '')
  const message = (formData.get('message') as string) || null
  const consentText = formData.get('consent_text') as string
  const utmSource = (formData.get('utm_source') as string) || null
  const utmMedium = (formData.get('utm_medium') as string) || null
  const utmCampaign = (formData.get('utm_campaign') as string) || null
  const utmContent = (formData.get('utm_content') as string) || null

  // Get submitter IP for TCPA record
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null

  const consentTimestamp = new Date().toISOString()

  // Upsert lead — unique on (email, lcc_id)
  // ignoreDuplicates: false means on conflict, UPDATE the row (not skip)
  const { data: lead, error } = await admin
    .from('leads')
    .upsert(
      {
        lcc_id: lccId,
        family_name: name,
        email,
        phone,
        message,
        stage: 'Interested',
        consent_text: consentText,
        consent_timestamp: consentTimestamp,
        consent_ip: ip,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_content: utmContent,
        updated_at: consentTimestamp,
      },
      {
        onConflict: 'email,lcc_id',
        ignoreDuplicates: false,  // false = UPDATE on conflict; true = skip
      }
    )
    .select('id, created_at, updated_at')
    .single()

  if (error || !lead) {
    console.error('[lead-capture] DB upsert error:', error)
    redirect(`/${lccSlug}/thank-you`) // Still redirect — family sees success
  }

  // Fire webhook only on new lead creation
  // A new insert has created_at == updated_at (within the same second)
  // This is a heuristic — the postgres xmax approach is more reliable
  // but requires raw SQL. The timestamp approach works for this use case.
  const isNew = lead.created_at === lead.updated_at

  if (isNew) {
    const webhookUrl = formData.get('webhook_url') as string
    if (webhookUrl) {
      // Fire-and-log: do not await blocking the user response
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id }),
      }).catch((err) => {
        console.error('[make-webhook] Outbound webhook failed:', err)
      })
    }
  }

  redirect(`/${lccSlug}/thank-you`)
}
```

**Important caveat on webhook fire:** The `fetch().catch()` fire-and-log works in Node.js runtime (default for Next.js). The redirect is called before the fetch resolves, but Node.js will keep the process alive for the in-flight promise. This is acceptable for this use case.

### Pattern 3: API Route Handler — Make.com Lead Detail Fetch
**What:** `GET /api/leads/[id]/route.ts` validates Bearer token, fetches lead + LCC data, returns JSON for Make.com to personalize messages.

**File:** `app/api/leads/[id]/route.ts` — note this is at `/api/leads/[id]` NOT conflicting with the page at `[lccSlug]`.

**Example:**
```typescript
// Source: https://nextjs.org/docs/14/app/building-your-application/routing/route-handlers
// app/api/leads/[id]/route.ts

import { NextRequest } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Validate Bearer token
  const authHeader = request.headers.get('authorization')
  const expectedToken = `Bearer ${process.env.MAKE_WEBHOOK_SECRET}`
  if (!authHeader || authHeader !== expectedToken) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const admin = createAdminClient()
  const { data: lead, error } = await admin
    .from('leads')
    .select(`
      id, family_name, email, phone, message, stage,
      consent_timestamp, utm_source, utm_medium, utm_campaign, utm_content,
      created_at, last_contacted_at,
      lccs (id, name, slug)
    `)
    .eq('id', params.id)
    .single()

  if (error || !lead) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return Response.json(lead)
}
```

### Pattern 4: API Route Handler — Make.com Stage Callback
**What:** `POST /api/leads/[id]/callback/route.ts` validates Bearer token, applies allowed stage transition (Interested → Contacted only), fires referral webhook if stage transitions to Signed.

**Example:**
```typescript
// app/api/leads/[id]/callback/route.ts
import { NextRequest } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || authHeader !== `Bearer ${process.env.MAKE_WEBHOOK_SECRET}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const body = await request.json()
  const { stage, last_contacted_at } = body as {
    stage?: string
    last_contacted_at?: string
  }

  const admin = createAdminClient()

  // Build update payload
  const updatePayload: Record<string, unknown> = {}
  if (last_contacted_at) {
    updatePayload.last_contacted_at = last_contacted_at
  }
  // Callback can only move stage from Interested → Contacted
  if (stage === 'Contacted') {
    updatePayload.stage = 'Contacted'
  }
  // Signed stage transition: also set signed_at
  if (stage === 'Signed') {
    updatePayload.stage = 'Signed'
    updatePayload.signed_at = new Date().toISOString()

    // Fire referral webhook
    const { data: lead } = await admin
      .from('leads')
      .select('lccs(referral_webhook_url)')
      .eq('id', params.id)
      .single()

    const referralUrl = (lead?.lccs as { referral_webhook_url?: string } | null)?.referral_webhook_url
    if (referralUrl) {
      fetch(referralUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: params.id }),
      }).catch((err) => console.error('[referral-webhook] Failed:', err))
    }
  }

  if (Object.keys(updatePayload).length === 0) {
    return Response.json({ ok: true, updated: false })
  }

  const { error } = await admin
    .from('leads')
    .update(updatePayload)
    .eq('id', params.id)

  if (error) {
    console.error('[callback] DB update error:', error)
    return new Response(JSON.stringify({ error: 'Update failed' }), { status: 500 })
  }

  return Response.json({ ok: true, updated: true })
}
```

### Pattern 5: Middleware Matcher Update
**What:** The existing middleware matcher regex `'/((?!_next/static|_next/image|favicon.ico|api).*)'` already excludes `api` routes. It needs to also exclude `[lccSlug]` pages and the thank-you sub-route.

**Current matcher (Phase 1):**
```typescript
matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)']
```

**Updated matcher approach — add LCC slug detection:**

The middleware `matcher` must be a static regex (no dynamic runtime values). The correct approach is to handle the exclusion inside the middleware function logic rather than the matcher, since slug patterns are dynamic. The matcher stays the same (or broad), and the middleware body returns early for requests that match the public slug pattern.

**Inside middleware.ts — add early return for public slug routes:**
```typescript
// In the middleware function body, BEFORE the auth check:
// Detect public LCC landing page routes: /[lccSlug] and /[lccSlug]/thank-you
// These are any paths that do NOT start with a known protected prefix
const isProtectedRoute =
  pathname.startsWith('/operator') ||
  pathname.startsWith('/lcc') ||
  pathname === '/dashboard' ||
  pathname === '/login'

if (!isProtectedRoute) {
  return supabaseResponse // Pass through without auth check
}
```

**Alternative: negative lookahead in matcher for known prefixes** (simpler):
```typescript
export const config = {
  matcher: [
    // Only run middleware on protected routes
    '/dashboard',
    '/operator/:path*',
    '/lcc/:path*',
  ],
}
```

The positive allowlist matcher is simpler and more performant than a broad negative lookahead. It explicitly lists which routes get middleware. Public routes (`/[lccSlug]`, `/[lccSlug]/thank-you`, `/login`) simply don't run middleware.

**Recommended:** Switch to a positive allowlist matcher in Phase 2.

### Anti-Patterns to Avoid

- **Using `createClient()` (anon key) in the lead capture server action:** No user session exists on the public landing page. The anon key client hits RLS and would block the INSERT. Always use `createAdminClient()` for server actions on public pages.
- **Awaiting the Make.com webhook call before redirecting:** The 60-second SLA is for Make.com's internal SMS trigger, not the webhook receipt. The family should see the thank-you page immediately; webhook delivery happens async. Never `await` a non-critical external call before `redirect()`.
- **Storing the MAKE_WEBHOOK_SECRET as a NEXT_PUBLIC_ env var:** It would be visible in the browser bundle. It must be server-side only (no `NEXT_PUBLIC_` prefix).
- **Re-triggering webhook on duplicate submission:** The upsert updates the record silently; the webhook check for `isNew` prevents double-messaging a family who resubmits.
- **Calling `headers()` synchronously in server actions:** In Next.js 14 App Router, `headers()` from `next/headers` is a function that returns synchronously (not a Promise) in Server Actions context. Avoid the async/await pattern for `headers()`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Lead deduplication | Custom lookup + conditional insert logic | Supabase `.upsert()` with `onConflict: 'email,lcc_id'` | DB-level constraint is atomic; app-level check-then-insert is a race condition |
| Webhook secret validation | Custom crypto comparison | String equality check on `Authorization: Bearer` header | The secret is a random string, not a HMAC — constant-time comparison via `crypto.timingSafeEqual` is best practice but string comparison is acceptable for this use case |
| Phone number storage normalization | Custom regex with multiple formats | Strip non-digits: `.replace(/\D/g, '')` | Raw 10 digits works universally for Twilio and Make.com templates |
| IP address capture | Third-party geolocation | `x-forwarded-for` header in server action via `headers()` | Sufficient for TCPA compliance; no geo lookup needed |
| UTM parameter persistence | Cookie-based session, localStorage | Hidden `<input type="hidden">` fields populated at page render | Simpler, works without JS, no state management overhead |
| 404 for unknown slug | Custom error component | Next.js `notFound()` from `next/navigation` | Produces correct 404 HTTP response and triggers `not-found.tsx` boundary |

**Key insight:** Phase 2 has zero external service dependencies in application code. Make.com, Twilio, and email providers are all external to the codebase — the app only fires HTTP webhooks at URL strings. This means Phase 2 code has no API keys for external messaging services.

---

## Common Pitfalls

### Pitfall 1: Using `createClient()` Instead of `createAdminClient()` on Public Routes
**What goes wrong:** The anon-key Supabase client (`createClient()`) on a public server action has no user session. The `leads` INSERT policy requires `lcc_id = auth.jwt() → app_metadata → lcc_id`, which returns null for unauthenticated requests. The INSERT is blocked by RLS with a "new row violates row-level security policy" error.

**Why it happens:** Developers use `createClient()` by default because it's the standard pattern from Phase 1. But Phase 1 server actions all ran in authenticated contexts (post-login). The lead capture form is public.

**How to avoid:** Any server action or route handler that does not have a user session MUST use `createAdminClient()`. Document this rule prominently in the server action file.

**Warning signs:** Supabase error "new row violates row-level security policy" in server action on the public landing page.

### Pitfall 2: Webhook Fires on Duplicate Submissions
**What goes wrong:** A family submits the form twice (double-click, retry). The upsert updates the record but the code fires the Make.com webhook again, triggering a second SMS to the family.

**Why it happens:** The upsert always succeeds — it's not possible to distinguish insert from update unless you check explicitly.

**How to avoid:** Compare `created_at` and `updated_at` on the returned row. If equal (within the same second), it's a new insert. If `updated_at` is later than `created_at`, it's an upsert of an existing record. A more reliable approach: add an `is_new` boolean from the DB using `INSERT ... ON CONFLICT DO UPDATE ... RETURNING (xmax = 0) AS is_new` — `xmax = 0` in PostgreSQL means the row was freshly inserted (not updated). The Supabase JS client doesn't directly support this in `.upsert()`, so it requires a raw SQL call via `.rpc()` if needed.

**Warning signs:** Families receive duplicate SMS messages. Look for webhook fires where `lead.created_at !== lead.updated_at`.

### Pitfall 3: Middleware Runs on the Public Landing Page and Redirects to Login
**What goes wrong:** The family visits `/s-johnson` and is redirected to `/login` because the middleware's auth check fires on that route.

**Why it happens:** The current middleware matcher `'/((?!_next/static|_next/image|favicon.ico|api).*)'` matches `/s-johnson`. No public route exception exists yet.

**How to avoid:** Switch to a positive allowlist matcher (`/dashboard`, `/operator/:path*`, `/lcc/:path*`) so only known protected routes run middleware. All other routes — including `/[lccSlug]` — pass through untouched.

**Warning signs:** 302 redirects to `/login` for the landing page URL in browser network tab.

### Pitfall 4: `searchParams` Type Mismatch — Next.js 14 vs 15
**What goes wrong:** `searchParams.utm_source` returns `string | string[] | undefined` but is used as if it's always a `string`. When a UTM parameter appears multiple times in a URL (e.g., `?utm_source=a&utm_source=b`), it becomes an array, causing a type error or unexpected stored value.

**Why it happens:** The Next.js 14 `searchParams` type is `{ [key: string]: string | string[] | undefined }`. Developers often cast directly to `string` without the array check.

**How to avoid:** Use `(Array.isArray(v) ? v[0] : v) ?? null` or just `formData.get()` on the hidden fields (where the page already serialized the first value into the hidden input).

**Warning signs:** TypeScript errors on `formData.get('utm_source')` or runtime `[object Array]` stored in the database.

### Pitfall 5: `Authorization: Bearer` Header Not Passed by Make.com HTTP Module
**What goes wrong:** Make.com's HTTP module sends the request but the `Authorization` header is missing or malformed. The callback endpoint returns 401 for every Make.com call.

**Why it happens:** Make.com's HTTP request module has a specific field for "Authorization" versus custom headers. The Bearer token must be placed in the correct field in the Make.com scenario configuration, not a generic custom header.

**How to avoid:** In Make.com scenario setup, use the built-in `Authorization` header field (or the equivalent "Headers" key with the value `Bearer <secret>`). Document the expected header format in the `.env.example`. The STATE.md already flags this as MEDIUM confidence — verify in Make.com before building.

**Warning signs:** 401 responses in Make.com HTTP module execution logs.

### Pitfall 6: TCPA Consent Checkbox Validation Bypassed Without JavaScript
**What goes wrong:** The `required` HTML attribute on the checkbox prevents submission in-browser. But if JavaScript is disabled or the form is submitted directly (e.g., via cURL or a bot), the consent is not captured. The server action receives a form submission without the consent field.

**Why it happens:** HTML `required` is client-side only. Server-side validation must also confirm the consent field is present.

**How to avoid:** In the server action, check `formData.get('consent') === 'on'` and return early (or redirect with an error) if consent is absent. This is a secondary guard; the checkbox's `required` attribute handles the normal browser case.

**Warning signs:** Lead records in the database with null `consent_text` or `consent_timestamp`.

### Pitfall 7: `redirect()` Inside `try/catch` Throws
**What goes wrong:** Calling `redirect()` from `next/navigation` inside a `try/catch` block causes an unexpected error. The `redirect()` function works by throwing a special error object internally — catching it swallows the redirect.

**Why it happens:** Developers wrap the entire server action in `try/catch` and call `redirect()` inside the block.

**How to avoid:** Always call `redirect()` OUTSIDE of `try/catch`. Perform DB operations inside `try/catch`, then call `redirect()` at the end of the function (Next.js 14 pattern from the official docs).

**Warning signs:** `redirect()` appears to do nothing; the page doesn't navigate after form submission.

---

## Code Examples

### Phase 2 Migration SQL
```sql
-- supabase/migrations/20260317000000_phase2_lead_capture.sql

-- Add new columns to lccs table
ALTER TABLE public.lccs
  ADD COLUMN IF NOT EXISTS learn_more_url TEXT,
  ADD COLUMN IF NOT EXISTS webhook_url TEXT,
  ADD COLUMN IF NOT EXISTS referral_webhook_url TEXT;

-- lccs.slug was already added in Phase 1 migration

-- Extend leads table with full Phase 2 schema
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS message TEXT,
  ADD COLUMN IF NOT EXISTS stage TEXT NOT NULL DEFAULT 'Interested'
    CHECK (stage IN ('Interested', 'Contacted', 'Qualified', 'Signed')),
  ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS signed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_text TEXT,
  ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_ip TEXT,
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS utm_content TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Uniqueness constraint for deduplication
ALTER TABLE public.leads
  ADD CONSTRAINT leads_email_lcc_id_unique UNIQUE (email, lcc_id);

-- Performance indexes
CREATE INDEX IF NOT EXISTS leads_stage_idx ON public.leads (stage);
CREATE INDEX IF NOT EXISTS leads_email_idx ON public.leads (email);
CREATE INDEX IF NOT EXISTS lccs_slug_idx ON public.lccs (slug);

-- RLS: Allow public (anon/service role) insert on leads
-- The admin client bypasses RLS entirely via service role key.
-- No additional RLS policy needed for public INSERT — the admin client handles it.
-- The existing authenticated SELECT/INSERT policies from Phase 1 remain.
```

**Note on existing `slug` column:** The Phase 1 migration already added `slug TEXT NOT NULL UNIQUE` to `lccs`. The Phase 2 migration only adds the new columns.

### Lead Form Hidden Fields for UTM + LCC Context
```typescript
// In the page.tsx, pass context as hidden fields to the server action:
<form action={submitLeadForm}>
  <input type="hidden" name="lcc_id" value={lcc.id} />
  <input type="hidden" name="lcc_slug" value={lcc.slug} />
  <input type="hidden" name="webhook_url" value={lcc.webhook_url ?? ''} />
  <input type="hidden" name="utm_source" value={utmSource ?? ''} />
  <input type="hidden" name="utm_medium" value={utmMedium ?? ''} />
  <input type="hidden" name="utm_campaign" value={utmCampaign ?? ''} />
  <input type="hidden" name="utm_content" value={utmContent ?? ''} />
  <input type="hidden" name="consent_text" value={consentText} />
  {/* Visible fields */}
  <input name="name" required />
  <input name="email" type="email" required />
  <input name="phone" type="tel" required placeholder="(555) 867-5309" />
  <textarea name="message" />
  <input type="checkbox" name="consent" required />
</form>
```

### US Phone Validation Regex
```typescript
// Validate 10 digits after stripping non-digits
// Client-side hint: "(555) 867-5309"
// Storage: raw digits "5558675309"
function isValidUSPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, '')
  return /^[2-9]\d{9}$/.test(digits)  // US numbers: area code starts 2-9
}
```

### TCPA Consent Text (Dynamic)
```typescript
// Consent text with LCC name interpolated
const consentText = `By checking this box, I consent to receive automated SMS text messages and emails from ${lcc.name} regarding au pair childcare services. Message frequency varies. Message and data rates may apply. Reply STOP to opt out. Consent is not a condition of any purchase or service.`
```

This string is stored verbatim on the lead record as `consent_text` at submission time.

### Seed Data Update for Phase 2
```sql
-- Add to supabase/seed.sql — update LCC records with slug and webhook fields
UPDATE public.lccs
SET
  slug = 's-johnson',
  learn_more_url = 'https://aupair.com/learn-more',
  webhook_url = 'https://hook.make.com/placeholder-lcc1',
  referral_webhook_url = 'https://hook.make.com/referral-lcc1'
WHERE name = 'Sarah Johnson';
-- Repeat for lcc2
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `pages/api/` Route Handlers | `app/api/` Route Handlers | Next.js 13 (App Router) | `route.ts` files in `app/api/`; no `bodyParser` config needed |
| Synchronous `params`/`searchParams` | Async Promise-based `params`/`searchParams` | Next.js 15 | **This project is on Next.js 14 — use synchronous access** |
| `headers()` synchronous (always) | `headers()` still synchronous in Next.js 14 | Async in Next.js 15+ | Call `headers()` without await in Next.js 14 server actions |
| `Response.json()` TypeScript warning | `NextResponse.json()` for TypeScript < 5.2 | TypeScript 5.2 | Project uses TypeScript 5.x — `Response.json()` is fine |

**Deprecated/outdated:**
- `pages/api/` directory: All new API routes go in `app/api/` — this project has no `pages/` directory
- `bodyParser` config in API routes: Not needed in App Router Route Handlers — `await request.json()` works natively

---

## Open Questions

1. **Make.com webhook authentication header format**
   - What we know: Make.com HTTP module supports custom headers including `Authorization`. The app sends `Authorization: Bearer <MAKE_WEBHOOK_SECRET>`.
   - What's unclear: Whether Make.com's webhook trigger (inbound) or HTTP request module (outbound) uses a different header convention. STATE.md flags this as MEDIUM confidence.
   - Recommendation: During Phase 2 execution, verify with a test Make.com scenario before finalizing the route handler. The app's implementation (Bearer token on `Authorization` header) follows standard HTTP conventions and should work.

2. **`isNew` detection reliability for webhook gate**
   - What we know: Comparing `created_at === updated_at` is a heuristic. The Supabase JS `.upsert()` does not return an `is_new` flag.
   - What's unclear: Whether microsecond precision in `updated_at` timestamps could ever match `created_at` on an update (if the upsert runs within the same microsecond as the original insert).
   - Recommendation: The heuristic is reliable enough for this use case — the upsert updates `updated_at` to `NOW()` at time of conflict resolution, which will always be at least milliseconds after `created_at`. A raw SQL `INSERT ... ON CONFLICT DO UPDATE ... RETURNING (xmax = 0) AS is_new` via `.rpc()` is the bulletproof alternative if the heuristic causes issues.

3. **Twilio A2P 10DLC registration (operational prerequisite)**
   - What we know: US SMS via Twilio requires A2P 10DLC brand and campaign registration before production sends. This is an ops step, not a code task.
   - What's unclear: Timeline for 10DLC approval (typically 3-5 business days after submission). This blocks Phase 2 going live with real SMS sends.
   - Recommendation: Note this as a non-code blocker. Phase 2 code can be shipped and tested with Make.com in test mode; 10DLC registration runs in parallel.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright 1.58.2 (E2E) + Vitest 4.1.0 (integration) — both already installed |
| Config file | `playwright.config.ts` (E2E: `tests/e2e/`), `vitest.config.ts` (integration: `tests/integration/`) |
| Quick run command | `npx playwright test lead-capture/ --reporter=line` |
| Full suite command | `npx playwright test && npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LEAD-01 | `/s-johnson` returns 200 and shows LCC name | E2E | `npx playwright test lead-capture/landing-page.spec.ts` | Wave 0 |
| LEAD-01 | `/unknown-slug` returns 404 | E2E | `npx playwright test lead-capture/landing-page.spec.ts` | Wave 0 |
| LEAD-02 | Form submission with valid fields creates lead in DB | E2E | `npx playwright test lead-capture/form-submit.spec.ts` | Wave 0 |
| LEAD-03 | Form cannot be submitted without consent checkbox | E2E | `npx playwright test lead-capture/tcpa-consent.spec.ts` | Wave 0 |
| LEAD-03 | DB lead record has consent_text, consent_timestamp, consent_ip | Integration | `npx vitest run tests/integration/lead-upsert.test.ts` | Wave 0 |
| LEAD-04 | Lead appears in DB with stage='Interested' within 2s of submit | E2E | `npx playwright test lead-capture/form-submit.spec.ts` | Wave 0 |
| LEAD-05 | Webhook URL receives POST with leadId (mock server) | E2E | `npx playwright test lead-capture/webhook-fire.spec.ts` | Wave 0 |
| LEAD-06 | UTM params in URL are stored on lead record | Integration | `npx vitest run tests/integration/lead-upsert.test.ts` | Wave 0 |
| PIPE-01 | Lead stage defaults to 'Interested' on insert | Integration | `npx vitest run tests/integration/lead-upsert.test.ts` | Wave 0 |
| PIPE-02 | POST /api/leads/[id]/callback updates stage and last_contacted_at | Integration | `npx vitest run tests/integration/callback-api.test.ts` | Wave 0 |
| PIPE-03 | Lead record has all required fields after form submit | Integration | `npx vitest run tests/integration/lead-upsert.test.ts` | Wave 0 |
| PIPE-05 | Stage='Signed' sets signed_at timestamp | Integration | `npx vitest run tests/integration/callback-api.test.ts` | Wave 0 |
| AUTO-04 | Callback with invalid Bearer token returns 401 | Integration | `npx vitest run tests/integration/callback-api.test.ts` | Wave 0 |
| AUTO-05 | Stage='Signed' fires referral_webhook_url (mock) | Integration | `npx vitest run tests/integration/callback-api.test.ts` | Wave 0 |
| AUTO-06 | Each LCC has distinct webhook_url in DB | Integration | `npx vitest run tests/integration/lead-upsert.test.ts` | Wave 0 |
| LEAD-02 | Duplicate submission (same email+lcc) does not create second row | E2E | `npx playwright test lead-capture/deduplication.spec.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx playwright test lead-capture/ --reporter=line` (lead capture suite, ~30s)
- **Per wave merge:** `npx playwright test && npx vitest run` (full suite)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/e2e/lead-capture/landing-page.spec.ts` — covers LEAD-01 (200 + 404)
- [ ] `tests/e2e/lead-capture/form-submit.spec.ts` — covers LEAD-02, LEAD-04
- [ ] `tests/e2e/lead-capture/tcpa-consent.spec.ts` — covers LEAD-03 (checkbox required)
- [ ] `tests/e2e/lead-capture/deduplication.spec.ts` — covers duplicate submission
- [ ] `tests/e2e/lead-capture/webhook-fire.spec.ts` — covers LEAD-05 (needs local mock server or Playwright route intercept)
- [ ] `tests/integration/lead-upsert.test.ts` — covers LEAD-03 (DB fields), LEAD-06, PIPE-01, PIPE-03, AUTO-06
- [ ] `tests/integration/callback-api.test.ts` — covers PIPE-02, PIPE-05, AUTO-04, AUTO-05

*(No new framework install needed — Playwright and Vitest already configured from Phase 1)*

---

## Sources

### Primary (HIGH confidence)
- `https://nextjs.org/docs/14/app/api-reference/file-conventions/page` — `params` and `searchParams` are synchronous (not Promises) in Next.js 14
- `https://nextjs.org/docs/14/app/building-your-application/data-fetching/server-actions-and-mutations` — Server Action pattern, `redirect()` must be outside `try/catch`, `FormData.get()`, fire-and-forget fetch
- `https://nextjs.org/docs/14/app/building-your-application/routing/route-handlers` — Route Handler `GET`/`POST`, reading `request.headers`, `await request.json()`, dynamic `params`, `Response.json()`
- `https://supabase.com/docs/reference/javascript/upsert` — `.upsert()` with `onConflict` and `ignoreDuplicates` options

### Secondary (MEDIUM confidence)
- `https://help.make.com/webhooks` — Make.com webhook supports custom `Authorization` headers; verified via community and docs
- `https://activeprospect.com/blog/tcpa-consent/` — TCPA checkbox must be unchecked by default, required before CTA, consent text must be clear and conspicuous with LCC name
- Phase 1 codebase (`middleware.ts`, `utils/supabase/admin.ts`, `app/(auth)/login/actions.ts`) — verified patterns to follow directly

### Tertiary (LOW confidence)
- `xmax = 0` PostgreSQL technique for detecting new insert vs update — confirmed in PostgreSQL docs conceptually but not tested against Supabase's upsert implementation; treat as LOW until validated

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new packages; all patterns from verified Next.js 14 official docs
- Architecture: HIGH — Route Handler and Server Action patterns verified from official Next.js 14 docs; Supabase admin client pattern verified from Phase 1 codebase
- Pitfalls: HIGH for most; MEDIUM for Make.com header format (external service, not tested)

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (stable — Next.js 14 and Supabase ^2.x are pinned versions in this project)
