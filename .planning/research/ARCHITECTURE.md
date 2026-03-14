# Architecture Research

**Domain:** Multi-tenant SaaS lead generation with webhook automation
**Researched:** 2026-03-14
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
├───────────────────────┬─────────────────────┬───────────────────────┤
│   (operator) group    │    (lcc) group       │  (public) group       │
│   /admin/*            │    /dashboard/*      │  /[lcc-slug]/*        │
│   Operator layout     │    LCC layout        │  Landing pages        │
│   All-tenant view     │    Single-tenant     │  Lead capture forms   │
└──────────┬────────────┴──────────┬───────────┴──────────┬────────────┘
           │                       │                       │
┌──────────▼───────────────────────▼───────────────────────▼───────────┐
│                    NEXT.JS APP ROUTER (Vercel)                        │
│   Server Components + Server Actions + Route Handlers (app/api/*)    │
│                                                                       │
│   Middleware: auth check, role-based redirect (operator vs LCC)      │
└──────┬──────────────┬────────────────────┬────────────────┬──────────┘
       │              │                    │                │
       ▼              ▼                    ▼                ▼
┌─────────┐   ┌──────────────┐   ┌──────────────┐  ┌─────────────┐
│ Supabase│   │  Make.com    │   │  Claude API  │  │   Stripe    │
│  (DB +  │   │  Scenarios   │   │  (Anthropic) │  │  Billing    │
│   Auth) │   │  SMS/Email   │   │  Personalize │  │  Webhooks   │
└────┬────┘   └──────────────┘   └──────────────┘  └─────────────┘
     │
┌────▼────────────────────────────────────────────────────────────────┐
│                       POSTGRES (via Supabase)                        │
│  lccs  |  leads  |  pipeline_stages  |  automations  |  messages    │
│                    RLS policies enforce LCC-scoped isolation          │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| `(operator)` route group | Operator views all LCCs, provisions new clients, sees billing | Next.js App Router route group with operator-only middleware guard |
| `(lcc)` route group | LCC sees their own pipeline, leads, metrics — read-mostly | Next.js App Router route group with LCC role middleware guard |
| `(public)` route group | Family-facing landing pages with LCC-specific forms | Static-first server components, no auth required |
| Webhook ingest API (`app/api/webhooks/lead/`) | Receives Make.com POST for new lead data, writes to DB | Route Handler with HMAC secret validation, service-role Supabase client |
| Webhook outbound trigger API (`app/api/trigger/`) | Called by server actions to fire Make.com scenario URLs | Route Handler, posts to Make.com webhook URLs stored per LCC |
| Claude message API (`app/api/messages/generate/`) | Receives lead context, returns personalized follow-up draft | Route Handler calling Anthropic SDK, server-side only |
| Supabase Auth + RLS | Auth sessions, JWT with `lcc_id` claim, row-level isolation | Custom access token hook injects `lcc_id` into JWT; all tables use RLS |
| Stripe billing | Setup fee + monthly retainer per LCC; webhook updates subscription status | `app/api/webhooks/stripe/` Route Handler with service-role write |

## Recommended Project Structure

```
src/
├── app/
│   ├── (operator)/             # Operator-only: manage all LCCs
│   │   ├── layout.tsx          # Operator shell (sidebar: LCCs list, billing)
│   │   ├── dashboard/
│   │   │   └── page.tsx        # All-LCC overview: pipeline counts, MRR
│   │   ├── lccs/
│   │   │   ├── page.tsx        # LCC list with status and metrics
│   │   │   ├── new/page.tsx    # Provision new LCC form
│   │   │   └── [lccId]/page.tsx # Single LCC drill-down
│   │   └── billing/page.tsx    # Stripe subscription management
│   │
│   ├── (lcc)/                  # LCC-scoped: their pipeline only
│   │   ├── layout.tsx          # LCC shell (sidebar: pipeline, leads, metrics)
│   │   ├── dashboard/page.tsx  # Pipeline kanban + conversion metrics
│   │   ├── leads/
│   │   │   ├── page.tsx        # Lead list with filters
│   │   │   └── [leadId]/page.tsx # Lead detail + message history
│   │   └── metrics/page.tsx    # Commission progress
│   │
│   ├── (public)/               # Public: family landing/form pages
│   │   └── [lccSlug]/
│   │       └── page.tsx        # LCC-branded family interest form
│   │
│   ├── api/
│   │   ├── webhooks/
│   │   │   ├── lead/route.ts   # Make.com → new lead ingest
│   │   │   └── stripe/route.ts # Stripe billing events
│   │   ├── trigger/
│   │   │   └── automation/route.ts # App → Make.com scenario trigger
│   │   └── messages/
│   │       └── generate/route.ts   # Claude API message generation
│   │
│   ├── layout.tsx              # Root layout (minimal)
│   └── middleware.ts           # Auth + role-based redirect
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client (anon key)
│   │   ├── server.ts           # Server client (anon key, cookie-based)
│   │   └── admin.ts            # Service-role client (server-only, bypasses RLS)
│   ├── anthropic.ts            # Anthropic SDK instance
│   ├── stripe.ts               # Stripe SDK instance
│   └── make.ts                 # Make.com webhook URL helpers
│
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   ├── pipeline/               # Kanban board, stage cards
│   ├── leads/                  # Lead cards, detail panels
│   └── operator/               # LCC management forms, billing UI
│
└── types/
    └── database.ts             # Generated Supabase types
```

### Structure Rationale

- **Route groups `(operator)` and `(lcc)`:** Separate layouts without URL segments — `/dashboard` works for LCC, `/admin/dashboard` works for operator. Middleware redirects based on role in JWT.
- **`lib/supabase/admin.ts`:** Service-role client lives in a separate file — makes it impossible to accidentally use it in client-side code. Used only in Route Handlers for webhook ingestion and operator provisioning.
- **`app/api/` Route Handlers:** All external integrations (Make.com, Claude, Stripe) go through Route Handlers, not Server Actions — keeps side-effectful external calls explicit and testable.
- **`(public)/[lccSlug]/`:** Each LCC gets a URL like `/sarah-johnson` for their family form. Slug stored on the `lccs` table.

## Architectural Patterns

### Pattern 1: RLS-Based Tenant Isolation via JWT Custom Claim

**What:** Store `lcc_id` in the user's JWT app metadata. All tables carry an `lcc_id` column. RLS policies compare row `lcc_id` to `auth.jwt()->>'lcc_id'`. The operator role bypasses via a service client or a role claim.

**When to use:** Every table that holds LCC-scoped data (leads, messages, pipeline stages, automations).

**Trade-offs:** Simple — one pattern for all tables. Downside: JWT must be refreshed when `lcc_id` changes. Not a concern here since LCC assignment is permanent.

**Example:**
```sql
-- Set lcc_id in user metadata on LCC account creation (server-side admin client)
-- Then in RLS policy:
CREATE POLICY "LCC members see own leads"
ON leads FOR SELECT
TO authenticated
USING (
  lcc_id = (auth.jwt() ->> 'lcc_id')::uuid
  OR (auth.jwt() ->> 'app_role') = 'operator'
);

CREATE POLICY "LCC members insert own leads"
ON leads FOR INSERT
TO authenticated
WITH CHECK (
  lcc_id = (auth.jwt() ->> 'lcc_id')::uuid
);
```

### Pattern 2: Webhook Ingest with Service-Role Client

**What:** The Make.com inbound webhook POST hits `app/api/webhooks/lead/route.ts`. This Route Handler uses the service-role Supabase client (bypasses RLS) to write the lead to the correct LCC's partition. It must validate an HMAC secret so arbitrary actors cannot forge leads.

**When to use:** Any unauthenticated external write — Make.com form submissions, Stripe events, future Zapier integrations.

**Trade-offs:** Service role is powerful — validate the secret before any DB write. Never expose the service role key in client bundles.

**Example:**
```typescript
// app/api/webhooks/lead/route.ts
export async function POST(req: Request) {
  const secret = req.headers.get('x-webhook-secret');
  if (secret !== process.env.WEBHOOK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const supabaseAdmin = createAdminClient(); // service role
  await supabaseAdmin.from('leads').insert({
    lcc_id: body.lcc_id,
    family_name: body.family_name,
    email: body.email,
    phone: body.phone,
    source: body.source,
    stage: 'interested',
  });
  // Then fire outbound trigger to Make.com nurture sequence
  await triggerMakeScenario(body.lcc_id, 'new_lead', body);
  return Response.json({ ok: true });
}
```

### Pattern 3: Make.com as Outbound Automation Bus

**What:** The app stores per-LCC Make.com webhook URLs in the `automations` table. When a lead moves stages or is created, the app POSTs to the relevant Make.com webhook URL. Make.com handles SMS/email sequences — the app does not send messages directly.

**When to use:** All nurture sequences, referral requests, stage-change notifications.

**Trade-offs:** App stays thin — no Twilio/Resend SDK usage in v1 outside Make.com's built-in modules. Tradeoff: observability of automation runs lives in Make.com, not the app. Acceptable for v1.

## Data Flow

### Primary Flow: Family Form → LCC Dashboard

```
Family submits form at /<lcc-slug>
    ↓
Server Action in (public)/[lccSlug]/page.tsx
    ↓
POST to /api/webhooks/lead (internal) OR direct Supabase insert
    ↓
Service-role client writes lead row (lcc_id, stage=interested, source, contact info)
    ↓
Trigger Make.com webhook URL for this LCC (stored in automations table)
    ↓ (async, Make.com side)
Make.com fires SMS + email sequence to family
    ↓
LCC logs in → (lcc)/dashboard → Supabase query filtered by RLS (lcc_id in JWT)
    ↓
Lead appears in "Interested" column of pipeline kanban
```

### Secondary Flow: Claude Message Generation

```
Operator or LCC requests follow-up draft for a lead
    ↓
Server Action calls POST /api/messages/generate
    ↓
Route Handler fetches lead context from Supabase (server client, RLS enforced)
    ↓
Anthropic SDK call with lead context + LCC name + message type prompt
    ↓
Generated message returned to UI for review/copy
    ↓
(Optional) Message stored in messages table linked to lead
```

### Auth Flow: LCC Login → Scoped Data

```
LCC logs in via Supabase Auth (email/password)
    ↓
Custom Access Token Hook fires → injects lcc_id + app_role=lcc into JWT
    ↓
Middleware checks JWT role → routes to (lcc) group
    ↓
All Supabase queries in (lcc) group use server client (cookie-based JWT)
    ↓
RLS policies evaluate auth.jwt()->>'lcc_id' → only their rows returned
```

## Database Schema Outline

```sql
-- Tenants
CREATE TABLE lccs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text UNIQUE NOT NULL,       -- URL slug for public landing page
  email       text NOT NULL,
  phone       text,
  status      text DEFAULT 'active',      -- active | paused | churned
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at  timestamptz DEFAULT now()
);

-- Users linked to LCCs (one user per LCC in v1)
-- lcc_id stored in auth.users.raw_app_meta_data
-- auth.users is managed by Supabase Auth

-- Leads (core tenant-scoped table)
CREATE TABLE leads (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lcc_id       uuid NOT NULL REFERENCES lccs(id),
  family_name  text NOT NULL,
  email        text,
  phone        text,
  source       text,                      -- facebook | instagram | referral | other
  stage        text DEFAULT 'interested', -- interested | contacted | qualified | signed
  notes        text,
  last_contacted_at timestamptz,
  signed_at    timestamptz,
  created_at   timestamptz DEFAULT now()
);
CREATE INDEX idx_leads_lcc_id ON leads(lcc_id);
CREATE INDEX idx_leads_lcc_stage ON leads(lcc_id, stage);

-- Message history
CREATE TABLE messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lcc_id     uuid NOT NULL REFERENCES lccs(id),
  lead_id    uuid NOT NULL REFERENCES leads(id),
  channel    text NOT NULL,              -- sms | email
  direction  text NOT NULL,             -- outbound | inbound
  body       text NOT NULL,
  sent_at    timestamptz DEFAULT now()
);
CREATE INDEX idx_messages_lead_id ON messages(lead_id);

-- Make.com automation config per LCC
CREATE TABLE automations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lcc_id          uuid NOT NULL REFERENCES lccs(id),
  trigger_event   text NOT NULL,         -- new_lead | stage_change | referral_request
  make_webhook_url text NOT NULL,
  active          boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);
CREATE INDEX idx_automations_lcc_event ON automations(lcc_id, trigger_event);
```

**RLS enablement for all tables:**
```sql
ALTER TABLE lccs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads     ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
```

**Operator role bypasses via `app_role = 'operator'` claim checked in all policies.**
**Service-role client (used in webhook ingest + provisioning) bypasses RLS entirely — used only server-side in Route Handlers.**

## Build Order (Dependency Graph)

```
Phase 1: Foundation
  Supabase project + schema migrations
    ↓
  Auth setup (Supabase Auth, custom JWT hook for lcc_id)
    ↓
  Middleware (role-based routing)

Phase 2: Operator Core
  LCC provisioning (create lcc row + create Supabase user + set app_meta)
    ↓
  Operator dashboard (all-LCC view)

Phase 3: Lead Capture
  Public landing pages + family form ([lccSlug]/page.tsx)
    ↓
  Webhook ingest Route Handler (writes lead, triggers Make.com)
    ↓
  Make.com scenario: new lead → SMS + email sequence

Phase 4: LCC Dashboard
  (lcc) route group + layout
    ↓
  Pipeline kanban (leads by stage, RLS-enforced query)
    ↓
  Lead detail view

Phase 5: Intelligence Layer
  Claude message generation API
    ↓
  Message history storage + display

Phase 6: Billing
  Stripe subscription per LCC
    ↓
  Stripe webhook → update lcc.status on subscription events
```

**Key dependencies:**
- Lead capture (Phase 3) requires LCC table + webhook ingest handler — needs Phase 1 schema done first.
- LCC dashboard (Phase 4) requires working auth + RLS — needs Phase 1 auth done first.
- Claude generation (Phase 5) is additive — can be built independently after leads exist in DB.
- Stripe billing (Phase 6) is additive — can be built last without blocking anything.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-10 LCCs | Monolith is fine. All in one Next.js app. Single Supabase project. |
| 10-100 LCCs | No changes needed. RLS handles isolation. Monitor Postgres connection pooling via Supabase pgbouncer. |
| 100+ LCCs | Consider connection pooler tuning. Claude API calls may need queuing if many simultaneous message generations. Add Postgres indexes on `lcc_id` composite queries if slow. |

**First bottleneck:** Postgres connections under concurrent LCC dashboard loads. Supabase pgbouncer (enabled by default in pooler mode) handles this up to 100 LCCs without intervention.

**Second bottleneck:** Claude API rate limits if generating messages for many leads simultaneously. Add a simple queue (Supabase `pg_cron` job or BullMQ) only when needed.

## Anti-Patterns

### Anti-Pattern 1: Filtering Tenant Data in Application Code Instead of RLS

**What people do:** Query `leads` without tenant filter, then filter in TypeScript: `leads.filter(l => l.lcc_id === currentUser.lccId)`.

**Why it's wrong:** One missing filter = data leak between LCCs. Application code bugs become security incidents. This is exactly what RLS prevents.

**Do this instead:** Write RLS policies on every table. Trust the database to enforce isolation. Application code never needs to add `WHERE lcc_id = ?` explicitly — the policy handles it.

### Anti-Pattern 2: Using the Service-Role Client in Server Components

**What people do:** Import `createAdminClient()` in a Server Component to avoid dealing with auth sessions.

**Why it's wrong:** Server Components render per-request but are not Route Handlers — a bug or future refactor could expose admin-scoped data to the wrong user. Service role bypasses all RLS.

**Do this instead:** Use the cookie-based server client in Server Components (respects RLS via user's JWT). Reserve `createAdminClient()` strictly for Route Handlers that perform privileged writes (webhook ingest, LCC provisioning, Stripe callbacks).

### Anti-Pattern 3: Storing Make.com Webhook URLs in Environment Variables

**What people do:** `MAKE_WEBHOOK_URL=https://hook.make.com/abc123` — one URL for everything.

**Why it's wrong:** Each LCC needs separate Make.com scenarios (their own phone numbers, email accounts, sequences). A single URL can't route to LCC-specific scenarios.

**Do this instead:** Store Make.com webhook URLs per LCC in the `automations` table, keyed by `(lcc_id, trigger_event)`. Fetch the right URL at trigger time.

### Anti-Pattern 4: Calling Claude API from Client Components

**What people do:** Call Anthropic SDK directly from a React component using a client-side API key.

**Why it's wrong:** Exposes the Anthropic API key in the browser. Any user can extract it and use it at your cost.

**Do this instead:** All Claude calls go through `app/api/messages/generate/route.ts`. The API key lives only in server-side environment variables (`ANTHROPIC_API_KEY`).

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Make.com (inbound) | Make.com scenario → POST to `/api/webhooks/lead` with HMAC secret | Make.com fires when family submits external form (Facebook Lead Ads, etc.) |
| Make.com (outbound) | App POSTs to Make.com webhook URL stored in `automations` table | One webhook URL per LCC per trigger event |
| Claude API | Server-side Route Handler → Anthropic SDK → JSON response | Never stream to browser in v1; synchronous generation is fine |
| Stripe | Stripe SDK in server actions for checkout; `/api/webhooks/stripe` for events | Use Stripe webhook signing secret to validate events |
| Supabase Auth | Cookie-based SSR client in Server Components; custom JWT hook for lcc_id | Use `@supabase/ssr` package, not deprecated `auth-helpers` |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Public form → Lead DB | Server Action → direct Supabase insert (server client) OR internal fetch to webhook route | Server Action is simpler for same-origin; webhook route needed for Make.com ingestion |
| App → Make.com | HTTP POST from Route Handler or Server Action | Fire-and-forget; log errors but don't block UI |
| LCC dashboard → DB | Server Component fetches via Supabase server client (RLS enforced) | No client-side Supabase queries in v1 — simplifies auth |
| Operator → LCC provisioning | Server Action → service-role client (creates user, sets app_meta, inserts lcc row) | Operator provision is a privileged write — use admin client |

## Sources

- [Supabase RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security) — HIGH confidence
- [Supabase Custom Claims & RBAC](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac) — HIGH confidence
- [LockIn multi-tenant RLS deep dive](https://dev.to/blackie360/-enforcing-row-level-security-in-supabase-a-deep-dive-into-lockins-multi-tenant-architecture-4hd2) — MEDIUM confidence (real-world implementation pattern)
- [Next.js Route Groups docs](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups) — HIGH confidence
- [Next.js multi-tenant guide](https://nextjs.org/docs/app/guides/multi-tenant) — HIGH confidence
- [Supabase service role bypass pattern](https://egghead.io/lessons/supabase-use-the-supabase-service-key-to-bypass-row-level-security) — HIGH confidence
- [Make.com webhooks docs](https://help.make.com/webhooks) — HIGH confidence
- [Makerkit Supabase RLS best practices](https://makerkit.dev/blog/tutorials/supabase-rls-best-practices) — MEDIUM confidence

---
*Architecture research for: Multi-tenant SaaS lead generation (LCC Lead Engine)*
*Researched: 2026-03-14*
