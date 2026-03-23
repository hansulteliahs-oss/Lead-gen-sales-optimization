# Phase 5: AI Personalization - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Every new lead receives a Claude-generated personalized intro message stored on the lead record. The message is passed to Make.com via the existing `GET /api/leads/[id]` endpoint for use in SMS and email nurture sequences. Per-lead caching prevents redundant API calls. No UI changes — this is purely a backend capability addition.

</domain>

<decisions>
## Implementation Decisions

### Generation timing
- Async fire-and-forget: Claude is called after the lead is inserted and the Make.com webhook fires, without blocking the family's redirect to the thank-you page
- Zero added latency for the family submitting the form
- Race condition handling: if Make.com calls `GET /api/leads/[id]` before generation completes, the response returns `generated_intro_message: null` — Make.com handles null by falling back to its default template
- New leads only — no backfill for existing leads that predate Phase 5

### Caching strategy
- Cache is permanent: once `generated_intro_message` is populated, it is never regenerated
- Cache check: if `generated_intro_message IS NOT NULL`, skip the Claude API call entirely
- No re-generation endpoint — not needed for v1

### Message content & tone
- Single `generated_intro_message` field — one string used for both SMS and email by Make.com
- Length: 1–2 sentences, short enough for SMS (target under 160 chars)
- Tone: warm, personal, conversational — written in first-person as the LCC
- Example shape: "Hi [Family Name], I'm [LCC Name] and I'd love to connect about au pair care for your family!"
- Inputs to Claude prompt: family name, LCC name, lead source (UTM source or null), and family's optional message if present

### API failure fallback
- On Claude API error or timeout: log `console.error` server-side, leave `generated_intro_message` as null — no retry
- Hard timeout: 10 seconds (matching the existing `AbortSignal.timeout(10000)` pattern in the codebase)
- Error visibility: server console only (Vercel logs) — no UI surface needed for v1
- Lead creation and Make.com webhook are never blocked or affected by generation failure

### Model
- `claude-opus-4-6` (confirmed in PROJECT.md)

### Claude's Discretion
- Exact prompt wording and system instructions
- How to gracefully handle null/missing family message in the prompt
- Column type for `generated_intro_message` (text)

</decisions>

<specifics>
## Specific Ideas

- The fire-and-forget pattern should mirror the existing Make.com webhook failure pattern: commit first, side-effect after, failure logged but never surfaces to the user
- The `GET /api/leads/[id]` response should include `generated_intro_message` alongside existing fields — Make.com uses it as a template variable

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `createAdminClient()` (`utils/supabase/admin.ts`): used for all server-side DB writes that bypass RLS — use this to write `generated_intro_message` back to the lead record
- `AbortSignal.timeout(10000)`: already used in `submitLeadForm` for the Make.com webhook call — use same pattern for Claude API timeout
- `app/[lccSlug]/actions.ts` (`submitLeadForm`): fire-and-forget async block after webhook dispatch is where Claude generation should be added

### Established Patterns
- Fire-and-forget: `try { await fetch(...) } catch (err) { console.error(...) }` — same pattern applies to async Claude generation
- Server-side only: Claude API key must use no `NEXT_PUBLIC_` prefix (established in Phase 1)
- Admin client for any non-user-scoped DB write

### Integration Points
- `app/[lccSlug]/actions.ts` — add async generation block after the existing Make.com webhook block
- `app/api/leads/[id]/route.ts` — add `generated_intro_message` to the SELECT query so it's returned to Make.com
- `supabase/migrations/` — new migration to add `generated_intro_message TEXT` column to `leads` table
- `package.json` — `@anthropic-ai/sdk` not yet installed; Phase 5 adds it
- `.env.local` / `.env.example` — `ANTHROPIC_API_KEY` env var needs adding

</code_context>

<deferred>
## Deferred Ideas

- Re-generation endpoint (`POST /api/leads/[id]/generate`) for operator — Phase 4 or backlog
- Backfill script for existing leads missing a generated message — backlog
- Operator dashboard badge showing leads with null generated message — Phase 4 (operator dashboard)
- Monthly Claude-generated LCC performance report narrative (ANLT-01) — v2 requirement

</deferred>

---

*Phase: 05-ai-personalization*
*Context gathered: 2026-03-23*
