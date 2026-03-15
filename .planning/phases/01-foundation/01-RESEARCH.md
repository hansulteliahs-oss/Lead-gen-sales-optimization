# Phase 1: Foundation - Research

**Researched:** 2026-03-14
**Domain:** Supabase Auth + RLS + Next.js App Router middleware + multi-tenant data isolation
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Single `/login` for both operator and LCC roles (no separate login URLs)
- Minimal/functional login page — email + password form only; no branding or polish
- Post-login redirect: all users hit `/dashboard`, middleware reads role and redirects to `/operator/dashboard` (operator) or `/lcc/dashboard` (LCC)
- Unauthorized route access (e.g., LCC hitting `/operator`): silent redirect to the user's correct dashboard — no 403 page
- Cloud Supabase project from day 1 — no local Supabase CLI, no local/cloud sync overhead
- Supabase project provisioned via MCP as part of Phase 1 execution (not manually created beforehand)
- Schema managed via SQL migration files in `/supabase/migrations` — source of truth is code, not the dashboard
- Secrets: `.env.local` is gitignored; developer copies keys from Supabase dashboard; `.env.example` committed to document required variables
- Operator account: `operator@lcc-lead-engine.com` / `password`
- Two LCC accounts: `lcc1@test.com` / `password` and `lcc2@test.com` / `password`
- Seed inserts 2-3 fake lead records per test LCC so AUTH-05 cross-tenant isolation can be verified immediately
- Seed script location: `supabase/seed.sql`

### Claude's Discretion
- Next.js route group structure (`(operator)` and `(lcc)` groups with separate layouts)
- Exact RLS policy SQL (row-level security by `lcc_id` column)
- JWT custom claims approach for role detection in middleware
- Schema column names and types beyond what requirements specify
- Middleware implementation details (matcher config, redirect logic)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | Operator can log in with email and password and access all LCC accounts | Supabase Auth email/password + `app_metadata.role = 'operator'` + RLS bypass via service role or `bypassrls` |
| AUTH-02 | LCC can log in with email and password and see only their own pipeline data | Supabase Auth email/password + `app_metadata.role = 'lcc'` + RLS policy on `lcc_id` |
| AUTH-03 | User session persists across browser refresh | `@supabase/ssr` cookie-based sessions + middleware `updateSession()` handles token refresh |
| AUTH-04 | Unauthenticated users are redirected to login (middleware-enforced) | Next.js `middleware.ts` checks `getClaims()`, redirects to `/login` when no valid session |
| AUTH-05 | Each LCC's data is isolated via Supabase RLS — an LCC cannot access another LCC's leads | RLS policy `lcc_id = (auth.jwt()->'app_metadata'->>'lcc_id')::uuid` on `leads` table |
| AUTH-06 | Operator account bypasses RLS to access all tenant data | Operator detected via JWT claim; server-side admin client uses `SUPABASE_SERVICE_ROLE_KEY` (never `NEXT_PUBLIC_`) |
</phase_requirements>

---

## Summary

Phase 1 establishes the entire auth and data isolation foundation. The stack is Next.js 14 App Router + `@supabase/ssr` for cookie-based session management + Supabase Auth with `app_metadata` for storing user roles. RLS policies enforce per-tenant data isolation at the PostgreSQL level. Roles (`operator` vs `lcc`) are stored in `raw_app_meta_data` (not `raw_user_meta_data`) because only a service role key can write to `app_metadata`, making it tamper-proof by end users.

The middleware pattern is well-defined: create a Supabase server client in `middleware.ts`, call `supabase.auth.getClaims()` (NOT `getSession()` — this is a critical security note from the official docs), and use the returned JWT claims to enforce route access. Role information injected via a Supabase Custom Access Token Hook (a SQL function on the `auth.users` table) flows into the JWT as `app_metadata.role` and optionally `app_metadata.lcc_id` for per-tenant isolation.

The seed pattern for cloud Supabase (no local CLI) requires direct `INSERT INTO auth.users` SQL in `supabase/seed.sql`. Newer Supabase versions require the `provider_id` field in `auth.identities` and function prefix `extensions.` for `uuid_generate_v4()` and `gen_salt()`. The seed file sets `raw_app_meta_data` directly during insert, which is the simplest approach for a cloud-only project with no Auth Admin API calls.

**Primary recommendation:** Use `app_metadata.role` stored on Supabase users for role detection; read it in middleware via JWT claims decoded from `getClaims()`; enforce RLS with a policy comparing `lcc_id` column to `auth.jwt()->'app_metadata'->>'lcc_id'`.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | latest (^2.x) | Supabase client for database + auth operations | Official Supabase JS client |
| `@supabase/ssr` | latest | Cookie-based session management for SSR/App Router | Supabase's official SSR package — replaces deprecated auth-helpers |
| `next` | 14.x (already decided) | App Router, middleware, server components | Core framework |
| `typescript` | 5.x | Type safety across the project | Standard for Next.js projects |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `tailwindcss` | 3.x | Styling for the functional login page | Already part of standard Next.js + Supabase starter |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@supabase/ssr` | `@supabase/auth-helpers-nextjs` | auth-helpers is deprecated; `@supabase/ssr` is the current official package |
| `app_metadata.role` in JWT | Separate DB lookup in middleware | DB lookup adds latency on every request; JWT claims are free at middleware time |
| Custom Access Token Hook | User metadata | `user_metadata` is user-editable, `app_metadata` requires service role — use `app_metadata` for auth |

**Installation:**
```bash
npm install @supabase/supabase-js @supabase/ssr
```

---

## Architecture Patterns

### Recommended Project Structure
```
app/
├── (auth)/
│   └── login/
│       └── page.tsx          # Single login page for both roles
├── (operator)/
│   ├── layout.tsx            # Operator-specific layout (no URL segment)
│   └── operator/
│       └── dashboard/
│           └── page.tsx      # /operator/dashboard
├── (lcc)/
│   ├── layout.tsx            # LCC-specific layout (no URL segment)
│   └── lcc/
│       └── dashboard/
│           └── page.tsx      # /lcc/dashboard
└── dashboard/
    └── page.tsx              # Redirect hub — middleware routes by role
middleware.ts                 # Root-level, same depth as app/
utils/
└── supabase/
    ├── client.ts             # Browser client
    └── server.ts             # Server component client
supabase/
├── migrations/
│   └── 20260314000000_foundation.sql   # Schema + RLS
└── seed.sql                  # Test users + fake leads
.env.local                    # Gitignored — real keys
.env.example                  # Committed — documents required vars
```

### Pattern 1: Cookie-Based Session with @supabase/ssr

**What:** Three Supabase client files — browser, server, and middleware — manage cookie-based sessions so JWTs persist across Server Components and browser refresh.

**When to use:** All auth-aware operations in Next.js 14 App Router.

**Example:**
```typescript
// utils/supabase/client.ts — Source: https://supabase.com/ui/docs/nextjs/client
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
```

```typescript
// utils/supabase/server.ts — Source: https://supabase.com/ui/docs/nextjs/client
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component — safe to ignore if middleware refreshes sessions
          }
        },
      },
    }
  )
}
```

### Pattern 2: Middleware Session Refresh + Role-Based Redirect

**What:** `middleware.ts` refreshes the Supabase session on every request, checks authentication, then inspects the JWT role claim to redirect users to the correct dashboard.

**When to use:** This is the single place all auth enforcement happens.

**Critical security note:** Use `getClaims()` NOT `getSession()` in server code. Official Supabase docs state: "Never trust `supabase.auth.getSession()` inside server code." `getClaims()` validates the JWT signature; `getSession()` trusts unverified cookie data.

**Example:**
```typescript
// middleware.ts — Source: https://supabase.com/ui/docs/nextjs/client
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // CRITICAL: Use getClaims(), NOT getSession()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  const { pathname } = request.nextUrl

  // Not authenticated — redirect to login
  if (!claims && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Authenticated — enforce role-based route access
  if (claims) {
    const role = claims.app_metadata?.role as string | undefined

    // LCC trying to access /operator routes → redirect to LCC dashboard
    if (pathname.startsWith('/operator') && role !== 'operator') {
      return NextResponse.redirect(new URL('/lcc/dashboard', request.url))
    }

    // Operator trying to access /lcc routes → redirect to operator dashboard
    if (pathname.startsWith('/lcc') && role !== 'lcc') {
      return NextResponse.redirect(new URL('/operator/dashboard', request.url))
    }

    // /dashboard is the post-login hub → redirect by role
    if (pathname === '/dashboard') {
      if (role === 'operator') {
        return NextResponse.redirect(new URL('/operator/dashboard', request.url))
      }
      if (role === 'lcc') {
        return NextResponse.redirect(new URL('/lcc/dashboard', request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}
```

### Pattern 3: RLS Multi-Tenant Isolation

**What:** Each table with tenant-specific data has an `lcc_id UUID` column. RLS policies restrict access to rows where `lcc_id` matches the calling user's `lcc_id` from JWT `app_metadata`. Operator bypasses RLS via the service role client.

**When to use:** Every table containing LCC-owned data (leads, pipeline stages, etc.).

**Example:**
```sql
-- Source: https://supabase.com/docs/guides/database/postgres/row-level-security

-- Enable RLS on the leads table
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- LCC can only read their own leads
CREATE POLICY "lcc_isolation_select"
ON leads FOR SELECT
TO authenticated
USING (
  lcc_id = (
    (SELECT auth.jwt()) -> 'app_metadata' ->> 'lcc_id'
  )::uuid
);

-- LCC can only insert leads for their own lcc_id
CREATE POLICY "lcc_isolation_insert"
ON leads FOR INSERT
TO authenticated
WITH CHECK (
  lcc_id = (
    (SELECT auth.jwt()) -> 'app_metadata' ->> 'lcc_id'
  )::uuid
);

-- Performance: always index lcc_id
CREATE INDEX leads_lcc_id_idx ON leads (lcc_id);
```

### Pattern 4: Role Injection via Custom Access Token Hook

**What:** A Supabase PostgreSQL function runs before token issuance to inject `role` and `lcc_id` into the JWT's `app_metadata`. This means middleware can read role from the JWT claim without a DB roundtrip.

**When to use:** Required once during project setup; enables all role-based middleware logic.

**Example:**
```sql
-- Source: https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook

-- profiles table linking auth.users to roles and lcc assignment
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('operator', 'lcc')),
  lcc_id UUID REFERENCES public.lccs(id) ON DELETE SET NULL
);

-- Custom access token hook: injects role + lcc_id into JWT app_metadata
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  claims JSONB;
  user_role TEXT;
  user_lcc_id UUID;
BEGIN
  SELECT role, lcc_id
  INTO user_role, user_lcc_id
  FROM public.profiles
  WHERE id = (event->>'user_id')::uuid;

  claims := event->'claims';

  -- Ensure app_metadata exists
  IF jsonb_typeof(claims->'app_metadata') IS NULL THEN
    claims := jsonb_set(claims, '{app_metadata}', '{}');
  END IF;

  -- Inject role
  claims := jsonb_set(claims, '{app_metadata,role}', to_jsonb(user_role));

  -- Inject lcc_id (null for operator)
  IF user_lcc_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{app_metadata,lcc_id}', to_jsonb(user_lcc_id::text));
  END IF;

  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;

-- Register the hook in Supabase dashboard: Auth > Hooks > Custom Access Token
-- Grant access so the hook can read profiles
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
GRANT SELECT ON public.profiles TO supabase_auth_admin;
```

### Pattern 5: Seeding Auth Users Directly via SQL

**What:** For a cloud-only project (no local Supabase CLI), `supabase/seed.sql` inserts users directly into `auth.users` and `auth.identities`. The `raw_app_meta_data` column is set at insert time.

**When to use:** One-time seed for test accounts. Run via the Supabase SQL editor on the cloud project.

**Important:** Newer Supabase requires `provider_id` in `auth.identities` and `extensions.` prefix for crypto functions.

**Example:**
```sql
-- Source: https://gist.github.com/khattaksd/4e8f4c89f4e928a2ecaad56d4a17ecd1 (adapted)

-- Insert operator user
INSERT INTO auth.users (
  id, instance_id, aud, role, email,
  encrypted_password, email_confirmed_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000001',  -- fixed UUID for operator
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'operator@lcc-lead-engine.com',
  crypt('password', gen_salt('bf')),
  NOW(), NOW(),
  '{"provider":"email","providers":["email"],"role":"operator"}',
  '{}',
  NOW(), NOW(), '', '', '', ''
);

-- Insert identity for operator
INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '{"sub":"00000000-0000-0000-0000-000000000001","email":"operator@lcc-lead-engine.com"}',
  'email', NOW(), NOW(), NOW()
);

-- Note: LCC users need an lcc_id in app_metadata once the lccs table exists.
-- LCC seed follows the same pattern with role:"lcc" and lcc_id set.
-- The profiles table must also be seeded to drive the Custom Access Token Hook.
```

### Pattern 6: Operator Service Role Client (RLS Bypass)

**What:** For operator-level server-side operations that need to bypass RLS, create a separate admin Supabase client using `SUPABASE_SERVICE_ROLE_KEY` (no `NEXT_PUBLIC_` prefix).

**When to use:** Server Actions or Route Handlers that the operator calls. Never in client components.

**Example:**
```typescript
// utils/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'

// Only call this from server-side code (Server Actions, Route Handlers)
// NEVER expose SUPABASE_SERVICE_ROLE_KEY to client bundle
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,  // No NEXT_PUBLIC_ prefix
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
```

### Anti-Patterns to Avoid

- **`NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`:** Adding `NEXT_PUBLIC_` prefix to the service role key exposes it in the client bundle, giving any browser full database access bypassing RLS. This is the most critical security mistake.
- **`getSession()` in middleware or server code:** Returns unverified cookie data that can be tampered with. Use `getClaims()` instead — it validates the JWT cryptographic signature.
- **RLS disabled on tables:** Any table in a public schema without RLS enabled is accessible to any authenticated user with the anon key. Always `ALTER TABLE x ENABLE ROW LEVEL SECURITY`.
- **`raw_user_meta_data` for roles:** Users can update their own `user_metadata` via the client SDK. Use `raw_app_meta_data` for roles — only the service role can modify it.
- **No index on `lcc_id`:** RLS policies run on every query. A missing index on the `lcc_id` column causes a full table scan on every authenticated request.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cookie-based session management | Custom JWT cookie logic | `@supabase/ssr` `createServerClient` | Token refresh, cookie sync across SSR/CSR handled; edge cases around cookie paths and domain are subtle |
| Password hashing | Custom bcrypt implementation | Supabase Auth handles this | bcrypt with wrong salt rounds, timing attacks, storage format — Supabase handles all of it |
| CSRF protection on login | Custom CSRF token middleware | Supabase Auth + Next.js same-site cookies | Supabase's cookie implementation uses SameSite=Lax by default |
| RLS admin bypass | App-level tenant filter for operator | Service role client | App-level filtering can be bypassed; service role bypass is at the DB level |
| JWT claim injection | Storing role in a separate DB fetch in middleware | Custom Access Token Hook | DB fetch in middleware = N+1 on every request; JWT claim is free |

**Key insight:** The `@supabase/ssr` + Custom Access Token Hook combo provides authentication, session persistence, and role injection without any custom security code. Any custom reimplementation will miss edge cases.

---

## Common Pitfalls

### Pitfall 1: `getSession()` Instead of `getClaims()` in Middleware

**What goes wrong:** `getSession()` trusts the `access_token` from the cookie without verifying the JWT signature. A malicious user can craft a cookie with a modified `role` claim and `getSession()` will return it as valid.

**Why it happens:** `getSession()` was the original API; older tutorials still use it. The official docs now warn against it explicitly.

**How to avoid:** Use `supabase.auth.getClaims()` everywhere in server-side code. It cryptographically validates the JWT.

**Warning signs:** Middleware that calls `supabase.auth.getSession()` — find/replace before shipping.

### Pitfall 2: Service Role Key in Client Bundle

**What goes wrong:** Using `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` exposes the key to the browser. Any user can open DevTools, copy the key, and query the database with full RLS bypass.

**Why it happens:** Developers copy the anon key pattern (`NEXT_PUBLIC_`) for the service role key.

**How to avoid:** Service role key env var must never have `NEXT_PUBLIC_` prefix. Verify with `grep -r "NEXT_PUBLIC_" .env.example` — the service role key must not appear.

**Warning signs:** Any `.env.example` line like `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`.

### Pitfall 3: RLS Policies Missing `WITH CHECK`

**What goes wrong:** A policy with only `USING` blocks SELECT/UPDATE/DELETE but not INSERT. An LCC user can insert a row with a foreign `lcc_id` belonging to another tenant.

**Why it happens:** `USING` handles reads; `WITH CHECK` handles writes — easy to forget the write-side policy.

**How to avoid:** All INSERT and UPDATE policies must have both `USING` (for updates, to restrict which rows can be modified) and `WITH CHECK` (to validate the new row data).

**Warning signs:** `CREATE POLICY ... FOR INSERT ... USING (...)` — INSERT needs `WITH CHECK`, not `USING`.

### Pitfall 4: Custom Access Token Hook Not Registered

**What goes wrong:** The hook SQL is written but never enabled in the Supabase dashboard. Tokens are issued without `app_metadata.role`, so all middleware role checks fail silently.

**Why it happens:** The hook SQL is a function only — it must be registered under Auth > Hooks in the Supabase dashboard to activate.

**How to avoid:** After running migration, manually enable the hook in Supabase dashboard: Auth > Hooks > Custom Access Token Hook > select `public.custom_access_token_hook`.

**Warning signs:** After login, `claims.app_metadata.role` is undefined in middleware.

### Pitfall 5: Seed SQL Fails on Newer Supabase Versions

**What goes wrong:** Direct `INSERT INTO auth.identities` fails because newer Supabase added a required `provider_id` column. Also, `uuid_generate_v4()` without `extensions.` prefix fails.

**Why it happens:** The seed format changed between Supabase versions; old examples online are stale.

**How to avoid:** Include `provider_id` in `auth.identities` inserts. Use `extensions.uuid_generate_v4()` (or `gen_random_uuid()` which is always available).

**Warning signs:** Seed SQL errors like "column provider_id of relation auth.identities does not exist" or "function uuid_generate_v4() does not exist".

### Pitfall 6: Route Group Naming vs. URL Segment Confusion

**What goes wrong:** Placing the actual `/operator` and `/lcc` URL segments inside route groups that also contain `operator/` or `lcc/` folders creates URL conflicts or unexpected routing.

**Why it happens:** Route groups `(operator)` don't add URL segments, but nested folder `operator/` does. Mixing the two creates double-segment paths like `/operator/operator/dashboard`.

**How to avoid:** The route group `(operator)` contains the `operator/` folder directly. URL becomes `/operator/dashboard`. The route group name is just for organization.

**Warning signs:** 404s on dashboard routes or unexpected double path segments.

---

## Code Examples

### Environment Variables Configuration
```bash
# .env.example — committed to git
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...

# Server-side only — no NEXT_PUBLIC_ prefix
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# .env.local — gitignored, real values
```

### Foundation Migration SQL
```sql
-- supabase/migrations/20260314000000_foundation.sql

-- LCC tenant registry
CREATE TABLE public.lccs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User profiles: links auth.users to roles and lcc assignment
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('operator', 'lcc')),
  lcc_id UUID REFERENCES public.lccs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Leads table (minimal for Phase 1 — just enough to test RLS isolation)
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lcc_id UUID NOT NULL REFERENCES public.lccs(id) ON DELETE CASCADE,
  family_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all public tables
ALTER TABLE public.lccs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own profile
CREATE POLICY "profiles_select_own"
ON public.profiles FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = id);

-- Leads: LCC can only see their own leads
CREATE POLICY "leads_select_lcc"
ON public.leads FOR SELECT
TO authenticated
USING (
  lcc_id = ((SELECT auth.jwt()) -> 'app_metadata' ->> 'lcc_id')::uuid
);

-- Leads: LCC can only insert leads for their own lcc_id
CREATE POLICY "leads_insert_lcc"
ON public.leads FOR INSERT
TO authenticated
WITH CHECK (
  lcc_id = ((SELECT auth.jwt()) -> 'app_metadata' ->> 'lcc_id')::uuid
);

-- Performance indexes
CREATE INDEX leads_lcc_id_idx ON public.leads (lcc_id);
CREATE INDEX profiles_lcc_id_idx ON public.profiles (lcc_id);

-- Custom Access Token Hook
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  claims JSONB;
  user_role TEXT;
  user_lcc_id UUID;
BEGIN
  SELECT role, lcc_id
  INTO user_role, user_lcc_id
  FROM public.profiles
  WHERE id = (event->>'user_id')::uuid;

  claims := event->'claims';

  IF jsonb_typeof(claims->'app_metadata') IS NULL THEN
    claims := jsonb_set(claims, '{app_metadata}', '{}');
  END IF;

  claims := jsonb_set(claims, '{app_metadata,role}', to_jsonb(COALESCE(user_role, 'unknown')));

  IF user_lcc_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{app_metadata,lcc_id}', to_jsonb(user_lcc_id::text));
  END IF;

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
GRANT SELECT ON public.profiles TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM PUBLIC;
```

### Login Form Server Action
```typescript
// app/(auth)/login/actions.ts
'use server'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) redirect('/login?error=invalid_credentials')
  // Redirect to /dashboard — middleware will route to role-specific dashboard
  redirect('/dashboard')
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | ~2023-2024 | Auth helpers deprecated; `@supabase/ssr` is the official package |
| `supabase.auth.getSession()` in middleware | `supabase.auth.getClaims()` | 2024 | `getSession()` does not verify JWT signature server-side; `getClaims()` is cryptographically safe |
| `user_metadata` for roles | `app_metadata` via Custom Access Token Hook | Always best practice, formalized ~2024 | `user_metadata` is writable by authenticated users; `app_metadata` is service-role-only |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ~2025 | Supabase renaming anon key to publishable key (both formats still accepted) |

**Deprecated/outdated:**
- `createMiddlewareClient` from `@supabase/auth-helpers-nextjs`: Replaced by `createServerClient` from `@supabase/ssr`
- `createClientComponentClient`: Replaced by `createBrowserClient` from `@supabase/ssr`
- `createServerComponentClient`: Replaced by `createServerClient` from `@supabase/ssr`

---

## Open Questions

1. **Custom Access Token Hook — Dashboard Registration**
   - What we know: The SQL function must be created in the migration AND then registered in the Supabase dashboard under Auth > Hooks
   - What's unclear: Whether MCP-based Supabase provisioning can register the hook programmatically, or if this must be a manual dashboard step
   - Recommendation: Treat hook registration as a manual step in the execution plan; document it explicitly as a verification checkpoint after migration runs

2. **Seed SQL on Cloud vs. Local**
   - What we know: `supabase/seed.sql` runs automatically with local `supabase db reset`; for cloud, it must be run manually via the SQL editor
   - What's unclear: Whether the MCP Supabase tool supports executing arbitrary SQL on the cloud project
   - Recommendation: Plan for seed SQL to be run via the Supabase dashboard SQL editor as a manual step; or use the MCP tool if it supports SQL execution

3. **`getClaims()` API availability**
   - What we know: Official Supabase docs (2025) reference `supabase.auth.getClaims()` as the secure server-side alternative to `getSession()`
   - What's unclear: The exact `@supabase/ssr` and `@supabase/supabase-js` version that introduced this API
   - Recommendation: Verify `getClaims()` is available after `npm install @supabase/supabase-js @supabase/ssr`; if not found, fall back to `getUser()` which makes a server-side validation call

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — greenfield project; Wave 0 must install |
| Config file | `none — see Wave 0` |
| Quick run command | `npm test -- --testPathPattern=auth` (once Jest configured) |
| Full suite command | `npm test` |

Given this is a greenfield Next.js project, the standard choice is **Jest + React Testing Library** for unit/integration tests and **Playwright** for E2E tests that verify the full auth flow in a real browser (required for AUTH-03 session persistence and AUTH-05 RLS isolation).

For Phase 1 specifically, AUTH-05 cross-tenant isolation must be verified from the client SDK (not the SQL editor) per the success criteria. This requires an E2E test that:
1. Signs in as `lcc1@test.com`
2. Queries the `leads` table via the Supabase browser client
3. Asserts that no rows belonging to `lcc2` are returned

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Operator logs in and reaches `/operator/dashboard` | E2E | `npx playwright test auth/operator-login.spec.ts` | Wave 0 |
| AUTH-02 | LCC logs in and reaches `/lcc/dashboard` | E2E | `npx playwright test auth/lcc-login.spec.ts` | Wave 0 |
| AUTH-03 | Session persists after browser refresh | E2E | `npx playwright test auth/session-persistence.spec.ts` | Wave 0 |
| AUTH-04 | Unauthenticated request to `/operator/dashboard` redirects to `/login` | E2E | `npx playwright test auth/unauthenticated-redirect.spec.ts` | Wave 0 |
| AUTH-05 | LCC1 client SDK query returns no LCC2 leads | E2E | `npx playwright test auth/rls-isolation.spec.ts` | Wave 0 |
| AUTH-06 | Operator admin client can read all tenant leads | Integration | `npm test -- --testPathPattern=operator-bypass` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx playwright test auth/ --reporter=line` (auth suite only, ~30s)
- **Per wave merge:** `npx playwright test` (full E2E suite)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/e2e/auth/operator-login.spec.ts` — covers AUTH-01
- [ ] `tests/e2e/auth/lcc-login.spec.ts` — covers AUTH-02
- [ ] `tests/e2e/auth/session-persistence.spec.ts` — covers AUTH-03
- [ ] `tests/e2e/auth/unauthenticated-redirect.spec.ts` — covers AUTH-04
- [ ] `tests/e2e/auth/rls-isolation.spec.ts` — covers AUTH-05 (client SDK, not SQL editor)
- [ ] `tests/integration/operator-bypass.test.ts` — covers AUTH-06
- [ ] `playwright.config.ts` — Playwright configuration
- [ ] Framework install: `npm install -D playwright @playwright/test && npx playwright install chromium`

---

## Sources

### Primary (HIGH confidence)
- `https://supabase.com/ui/docs/nextjs/client` — `createBrowserClient`, `createServerClient`, middleware `updateSession` patterns with `getClaims()`
- `https://supabase.com/docs/guides/database/postgres/row-level-security` — `auth.uid()`, `auth.jwt()`, `USING`/`WITH CHECK`, service role bypass
- `https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook` — SQL hook pattern for injecting role claims
- `https://nextjs.org/docs/14/app/building-your-application/routing/middleware` — matcher config, `NextResponse.redirect`, edge runtime

### Secondary (MEDIUM confidence)
- `https://gist.github.com/khattaksd/4e8f4c89f4e928a2ecaad56d4a17ecd1` — Supabase seed SQL for `auth.users` + `auth.identities` with `provider_id` for current Supabase versions
- `https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac` — RBAC pattern with `user_roles` table and auth hook
- `https://supabase.com/docs/guides/auth/server-side/nextjs` — SSR setup guide confirming `getClaims()` over `getSession()`

### Tertiary (LOW confidence)
- WebSearch results confirming `app_metadata` as service-role-only — consistent with multiple sources, elevated to MEDIUM

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — `@supabase/ssr` confirmed as current official package from Supabase docs
- Architecture: HIGH — patterns confirmed from official Next.js and Supabase docs
- Pitfalls: HIGH — `getSession()` warning is from official Supabase docs; service role key exposure is documented security guidance

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (Supabase moves fast; re-verify `getClaims()` API name if package versions change)
