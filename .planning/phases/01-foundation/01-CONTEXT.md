# Phase 1: Foundation - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Supabase project provisioning, schema + RLS policies, Supabase Auth setup, and Next.js middleware routing. The output is a secure, multi-tenant data layer that correctly isolates each LCC's data — verified before any real lead data is written. No UI beyond a functional login page.

</domain>

<decisions>
## Implementation Decisions

### Login page design
- Single `/login` for both operator and LCC roles (no separate login URLs)
- Minimal/functional design — no branding, just a working email + password form; polish comes later
- Post-login redirect: all users hit `/dashboard`, middleware reads role and redirects to `/operator/dashboard` (operator) or `/lcc/dashboard` (LCC)
- Unauthorized route access (e.g., LCC hitting `/operator`): silent redirect to the user's correct dashboard — no 403 page

### Supabase environment
- Cloud Supabase project from day 1 — no local Supabase CLI, no local/cloud sync overhead
- Supabase project is provisioned via MCP as part of Phase 1 execution (not manually created beforehand)
- Schema managed via SQL migration files in `/supabase/migrations` — source of truth is code, not the dashboard
- Secrets: `.env.local` is gitignored; developer copies keys from Supabase dashboard; `.env.example` committed to document required variables

### Seed & test credentials
- Operator account: `operator@lcc-lead-engine.com` / `password`
- Two LCC accounts: `lcc1@test.com` / `password` and `lcc2@test.com` / `password`
- Seed inserts 2-3 fake lead records per test LCC so AUTH-05 cross-tenant isolation can be verified immediately without manual SQL
- Seed script location: `supabase/seed.sql` (standard Supabase convention, runs alongside migrations)

### Claude's Discretion
- Next.js route group structure (`(operator)` and `(lcc)` groups with separate layouts)
- Exact RLS policy SQL (row-level security by `lcc_id` column)
- JWT custom claims approach for role detection in middleware
- Schema column names and types beyond what requirements specify
- Middleware implementation details (matcher config, redirect logic)

</decisions>

<specifics>
## Specific Ideas

- No specific references — keep it functional, ship fast

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing components or utilities

### Established Patterns
- None yet — Phase 1 establishes the patterns all subsequent phases follow

### Integration Points
- `/supabase/migrations` — schema files created here, applied to cloud project
- `.env.local` / `.env.example` — service role key must never appear in `NEXT_PUBLIC_` variables (verified in Phase 1 success criteria)
- Next.js middleware (`middleware.ts`) — all route protection and role-based redirects live here; Phase 2+ public routes (e.g., `/[lccSlug]`) will need to be added to the middleware matcher exclusion list

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-14*
