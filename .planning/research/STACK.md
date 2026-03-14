# Stack Research

**Domain:** Multi-tenant SaaS lead generation system (au pair LCC pipeline)
**Researched:** 2026-03-14
**Confidence:** HIGH (core stack verified via official docs and npm); MEDIUM (Make.com integration patterns — no official Next.js guide, community patterns only)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 15.x (latest stable) | Full-stack framework, routing, API layer | App Router is the current standard; Server Components reduce client bundle; Route Handlers replace API Routes for webhooks. Note: project spec says "14" but 15 is current stable and migration is well-supported. If pinning to 14, use 14.2.x. |
| React | 19.x (with Next.js 15) | UI rendering | Bundled with Next.js 15; async components, improved Suspense |
| TypeScript | 5.x | Type safety | Required for Supabase generated types and Stripe webhook payloads |
| Tailwind CSS | 4.x | Utility-first styling | Bundled with Next.js CLI scaffold; works natively with shadcn/ui |
| shadcn/ui | latest (component-copy model, no version pinning) | Accessible component library | Copies components into your repo so you own them; works with App Router Server Components; used by most 2025 SaaS starters |
| Supabase | postgres managed + supabase-js 2.98.x | Database, auth, RLS | Built-in RLS enforces tenant isolation at DB level; auth included; MCP tooling available for provisioning |
| @supabase/ssr | 0.9.x | Cookie-based SSR auth for Next.js | Replaces deprecated `@supabase/auth-helpers-nextjs`; required for App Router Server Components to read auth state without client flicker |
| Stripe | stripe 20.4.x | Subscription billing | Market standard for SaaS billing; MCP provisioning available; Checkout handles PCI compliance |
| @anthropic-ai/sdk | 0.78.x | Claude API client | Official SDK; supports streaming; use `claude-sonnet-4-6` per project spec |
| Resend | resend 4.8.x | Transactional email | React Email integration means templates are React components — zero context switch in Next.js codebase; simple API |
| Twilio | twilio 5.13.x | SMS delivery | Only major provider with production-grade SMS API; no viable alternative for SMS |
| Vercel | Platform (no version) | Hosting, CDN, edge middleware | Native Next.js platform; wildcard domains for potential subdomain routing; zero-config deploys |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-email | latest | Email template authoring in React | Use when building follow-up email templates; pair with Resend SDK |
| zod | 3.x | Schema validation | Validate Make.com webhook payloads, Stripe webhook bodies, and form inputs before DB writes |
| @tanstack/react-query | 5.x | Client-side data fetching and caching | Use in LCC dashboard for real-time pipeline view; pairs with Supabase realtime subscriptions |
| react-hook-form | 7.x | Form state management | Lead capture forms and LCC onboarding forms; pair with zod resolver |
| @hookform/resolvers | 3.x | Zod + react-hook-form bridge | Required companion to react-hook-form when using zod schemas |
| lucide-react | latest | Icon library | Default icon set used by shadcn/ui; consistent with component styles |
| clsx | 2.x | Conditional className utility | Used internally by shadcn/ui; import directly for custom components |
| date-fns | 4.x | Date manipulation | Pipeline date calculations and "last contacted" relative times; v4 required for React 19 compat |
| svix | latest | Webhook signature verification | Use for verifying Make.com or any external webhook signatures on Route Handlers |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Supabase CLI | Local dev DB, type generation, migrations | Run `supabase gen types typescript` after schema changes; commit generated types to repo |
| Stripe CLI | Local webhook forwarding for dev | Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` during local dev |
| ngrok (or Vercel preview URLs) | Make.com webhook testing | Make.com scenarios need a live URL; use Vercel preview deploys for integration testing |
| eslint + @typescript-eslint | Linting | Next.js ships with eslint config; extend for strict TypeScript |
| prettier | Code formatting | Add prettier-plugin-tailwindcss for class sorting |

---

## Installation

```bash
# Scaffold Next.js 15 with App Router, TypeScript, Tailwind
npx create-next-app@latest lcc-lead-engine --typescript --tailwind --app --src-dir --import-alias "@/*"

# Core backend
npm install @supabase/supabase-js @supabase/ssr stripe @anthropic-ai/sdk resend twilio

# Core frontend
npm install @tanstack/react-query react-hook-form @hookform/resolvers zod

# UI
npm install lucide-react clsx date-fns

# Install shadcn/ui (CLI — copies components into repo)
npx shadcn@latest init

# Dev dependencies
npm install -D @types/node supabase prettier prettier-plugin-tailwindcss
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Supabase | PlanetScale + Auth.js | If you need MySQL dialect or want to decouple auth from DB; not warranted here since Supabase does both |
| Supabase RLS for multi-tenancy | Separate DB schemas per tenant | Use schema-per-tenant only at enterprise scale (100+ tenants) — adds migration complexity; overkill for this use case |
| @supabase/ssr | @supabase/auth-helpers-nextjs | **Do not use** — officially deprecated; migration guide exists |
| Resend (email) + Twilio (SMS) | A single platform like SendGrid + Twilio | SendGrid email DX is inferior for React-based template workflow; Resend + Twilio split is the modern pattern |
| Twilio (SMS) | Vonage / Sinch | Use if Twilio pricing becomes a concern at scale; Twilio has best DX and reliability |
| Next.js Route Handlers | Express / Fastify API server | Separate API server only if you need shared API across multiple frontends; not warranted here |
| Vercel | Railway / Fly.io | Use Railway/Fly if you need persistent server processes (e.g., long-running queue workers); not needed with Make.com handling async work |
| @anthropic-ai/sdk (direct) | @ai-sdk/anthropic (Vercel AI SDK) | Use Vercel AI SDK if you need streaming UI components (useChat, useCompletion); for backend-only message generation (this project), direct SDK is simpler |
| shadcn/ui | Radix UI (headless) | Use raw Radix if you need full design system control with no default styles |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| @supabase/auth-helpers-nextjs | Officially deprecated as of 2024; will not receive updates | @supabase/ssr |
| next-auth (Auth.js) | Adds a third auth layer when Supabase Auth already handles auth + RLS context; creates JWT mismatch problems | Supabase Auth with @supabase/ssr |
| Prisma ORM | Adds a schema sync step on top of Supabase's already managed Postgres; RLS policies must be duplicated in Prisma middleware; friction without benefit | Supabase client (supabase-js) with generated TypeScript types |
| Pages Router API routes | Legacy pattern; no Server Components; worse DX for Supabase cookie auth | App Router Route Handlers |
| localStorage for auth tokens | Does not work in Server Components; leaks tokens to JS; breaks SSR | @supabase/ssr cookie-based sessions |
| Service role key in client code | Bypasses all RLS policies — instant multi-tenant data leak | Keep service role key server-side only (Route Handlers, Server Actions) |
| react-email v1 / old @react-email/components | Older versions have breaking JSX transform issues with React 19 | Use latest react-email package |

---

## Stack Patterns by Variant

**For the LCC dashboard (read-only pipeline view):**
- Use Server Components for initial render (pipeline table, stats)
- Use @tanstack/react-query for client-side refresh without full page reload
- RLS policy: `SELECT WHERE tenant_id = auth.jwt() ->> 'tenant_id'`

**For the operator dashboard (all tenants):**
- Operator role bypasses tenant RLS via a separate `is_operator` claim in the JWT
- Use service role key only in Server Actions/Route Handlers — never in client
- Operator sees all rows; LCC sees only their tenant_id rows

**For Make.com webhook endpoints:**
- Create `/app/api/webhooks/make/route.ts` as a Route Handler
- Use `request.text()` for raw body, then verify HMAC signature before parsing JSON
- Return `200 OK` immediately (Make.com retries on non-200); queue heavy work via Supabase DB triggers or Edge Functions

**For Stripe webhook endpoint:**
- Use `stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)` — verify before trusting
- Store subscription state in Supabase `subscriptions` table; sync on every relevant webhook event
- Critical events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

**For Claude API (personalized messages):**
- Call from Server Actions or Route Handlers only — never from client
- Use `claude-sonnet-4-6` model per project spec
- Build system prompt with LCC context (name, agency, family info) from Supabase
- Return generated text to Make.com via webhook response or store in DB for Make.com to read

---

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 15.x | React 19.x | Required together; React 19 is the peer dep for Next.js 15 |
| Next.js 14.x | React 18.x | If staying on 14, pin React to 18 |
| date-fns 4.x | React 19 | Required upgrade from date-fns 3.x if using React 19 (affects react-day-picker) |
| @supabase/ssr 0.9.x | @supabase/supabase-js 2.x | Must use both; ssr package wraps supabase-js |
| shadcn/ui (latest CLI) | Tailwind CSS 4.x | shadcn now supports Tailwind v4; check shadcn docs if using Tailwind 3 |
| stripe 20.x | Node.js 18+ | Node.js 16 support deprecated in stripe-node |
| @anthropic-ai/sdk 0.78.x | Node.js 18+ | Minimum Node.js 18 LTS required |

---

## Sources

- [Next.js multi-tenant official guide](https://nextjs.org/docs/app/guides/multi-tenant) — multi-tenant routing patterns (HIGH confidence)
- [Next.js 15 release](https://nextjs.org/blog/next-15) — breaking changes and caching behavior (HIGH confidence)
- [Next.js 16.1 release](https://nextjs.org/blog/next-16-1) — current stable version confirmation (HIGH confidence)
- [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security) — RLS policy patterns (HIGH confidence)
- [Supabase SSR auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) — @supabase/ssr recommended approach (HIGH confidence)
- [Migrating from auth-helpers to SSR](https://supabase.com/docs/guides/auth/server-side/migrating-to-ssr-from-auth-helpers) — deprecation of auth-helpers (HIGH confidence)
- [@supabase/supabase-js npm](https://www.npmjs.com/package/@supabase/supabase-js) — version 2.98.x current (HIGH confidence)
- [@supabase/ssr npm](https://www.npmjs.com/package/@supabase/ssr) — version 0.9.x current (HIGH confidence)
- [Stripe subscriptions webhook docs](https://docs.stripe.com/billing/subscriptions/webhooks) — webhook event patterns (HIGH confidence)
- [stripe npm](https://www.npmjs.com/package/stripe) — version 20.4.x current (HIGH confidence)
- [@anthropic-ai/sdk npm](https://www.npmjs.com/package/@anthropic-ai/sdk) — version 0.78.x current (HIGH confidence)
- [resend npm](https://www.npmjs.com/package/resend) — version 4.8.x current (HIGH confidence)
- [twilio npm](https://www.npmjs.com/package/twilio) — version 5.13.x current (HIGH confidence)
- [Vercel Next.js multi-tenant deployment guide](https://vercel.com/guides/nextjs-multi-tenant-application) — deployment patterns (HIGH confidence)
- WebSearch: Resend vs Twilio comparison — split pattern (email Resend, SMS Twilio) confirmed (MEDIUM confidence — multiple community sources agree)
- WebSearch: Make.com webhook patterns — Route Handler pattern confirmed; specific Make.com docs not found (MEDIUM confidence)

---

*Stack research for: LCC Lead Engine — multi-tenant SaaS lead generation*
*Researched: 2026-03-14*
