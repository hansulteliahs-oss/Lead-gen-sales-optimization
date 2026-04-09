# lcc-lead-engine

Next.js 14 App Router + Supabase project. Lead capture and pipeline management for Loan Closing Coordinators (LCCs).

## Key Conventions

- Routes use `[lccSlug]` dynamic segment for all LCC-scoped public pages
- Supabase RLS enforces tenant isolation — every query must respect the authenticated user's LCC
- Operators see all LCCs; LCC users see only their own data
- Phone numbers stored and displayed in 10-digit US format (no country code)
- TCPA consent checkbox is required before form submission on all lead capture pages

## Testing

- Playwright e2e tests live in `tests/`
- Run with `npx playwright test`
- Test results (screenshots/traces) are gitignored — do not commit `test-results/`
