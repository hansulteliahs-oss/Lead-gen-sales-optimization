# Phase 5: AI Personalization - Research

**Researched:** 2026-03-23
**Domain:** Anthropic TypeScript SDK + Next.js Server Actions fire-and-forget pattern
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Generation timing:** Async fire-and-forget after lead insert and Make.com webhook fires — zero added latency for the family.
- **Race condition:** If Make.com calls `GET /api/leads/[id]` before generation completes, `generated_intro_message: null` is returned — Make.com falls back to its default template.
- **New leads only:** No backfill for existing leads.
- **Cache strategy:** Permanent — once `generated_intro_message` is populated it is never regenerated. If `generated_intro_message IS NOT NULL`, skip Claude entirely.
- **No re-generation endpoint** for v1.
- **Message format:** Single `generated_intro_message` TEXT field — one string used for both SMS and email. Target under 160 characters.
- **Tone:** Warm, personal, conversational — first-person as the LCC. Example: "Hi [Family Name], I'm [LCC Name] and I'd love to connect about au pair care for your family!"
- **Inputs to prompt:** family name, LCC name, lead source (UTM source or null), and family's optional message if present.
- **Failure behaviour:** On Claude error or timeout — `console.error` server-side, leave field null, no retry, no UI surface.
- **Hard timeout:** 10 seconds — `AbortSignal.timeout(10000)` pattern, matching existing codebase convention.
- **Model:** `claude-opus-4-6` (confirmed in PROJECT.md).
- **SDK not yet installed:** `@anthropic-ai/sdk` must be added to `package.json`.
- **Env var:** `ANTHROPIC_API_KEY` — no `NEXT_PUBLIC_` prefix; server-side only.
- **Integration points:**
  - `app/[lccSlug]/actions.ts` — add async generation block after existing Make.com webhook block
  - `app/api/leads/[id]/route.ts` — add `generated_intro_message` to SELECT
  - `supabase/migrations/` — new migration to add `generated_intro_message TEXT` to leads table
  - `.env.local` / `.env.example` — add `ANTHROPIC_API_KEY`

### Claude's Discretion

- Exact prompt wording and system instructions
- How to gracefully handle null/missing family message in the prompt
- Column type for `generated_intro_message` (TEXT — confirmed)

### Deferred Ideas (OUT OF SCOPE)

- Re-generation endpoint (`POST /api/leads/[id]/generate`) for operator
- Backfill script for existing leads missing a generated message
- Operator dashboard badge showing leads with null generated message
- Monthly Claude-generated LCC performance report narrative (ANLT-01) — v2 requirement
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AI-01 | Claude API generates personalized follow-up message text per lead (based on family name, source, LCC name) | SDK usage, prompt design, and fire-and-forget async pattern documented below |
| AI-02 | Generated message text is cached per lead to prevent redundant API calls | DB column `generated_intro_message TEXT` + null-check cache guard before any Claude call |
| AI-03 | Personalized message text is passed to Make.com webhook payload for use in SMS/email templates | `GET /api/leads/[id]` SELECT extension pattern documented below |
</phase_requirements>

---

## Summary

Phase 5 adds a single capability: after a new lead is inserted and the Make.com webhook fires, a fire-and-forget async block calls the Claude API (via `@anthropic-ai/sdk`) to generate a short personalized intro message. The result is written back to the lead row. The existing `GET /api/leads/[id]` endpoint is extended to return the field so Make.com can use it as a template variable.

The work is deliberately narrow: one new npm package, one new DB column, one env var, three file changes. The Anthropic TypeScript SDK (v0.80.0 as of 2026-03-23) provides first-class support for the patterns already established in this codebase — specifically `{ timeout: 10000 }` per-request options that map directly to the existing `AbortSignal.timeout(10000)` convention. Error hierarchy is type-safe (`Anthropic.APIError`, `Anthropic.APIConnectionTimeoutError`) for clean catch blocks.

The permanent null-check cache is trivially correct: read `generated_intro_message` from the lead row inside the async block; if it is already set, skip the API call entirely. This prevents redundant calls on any re-execution path (e.g., if the server action somehow re-enters, or in future if the action is retried externally).

**Primary recommendation:** Install `@anthropic-ai/sdk@^0.80.0`, add `ANTHROPIC_API_KEY` (server-only), add one migration for the TEXT column, and wire the fire-and-forget block directly after the existing Make.com webhook block in `submitLeadForm`. Keep the prompt minimal — one short `system` message plus a single `user` message with the four data inputs.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@anthropic-ai/sdk` | `^0.80.0` | Official Anthropic TypeScript SDK — `client.messages.create()` | Official SDK; handles auth headers, retries (disabled for this use-case), typed errors, per-request timeout option |

**No alternatives.** The project already uses the Anthropic API directly (confirmed in PROJECT.md). The SDK is the only correct choice — raw `fetch` against the REST API would require manual header management and offer no benefit.

**Installation:**
```bash
npm install @anthropic-ai/sdk
```

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Node.js built-in `AbortSignal` | N/A (Node 18+) | Timeout signal for fetch calls | Already used in codebase — do NOT use for SDK calls; use SDK's `{ timeout }` option instead (see Pitfall 1) |

---

## Architecture Patterns

### Recommended Project Structure

No new directories are needed. All changes are in-place edits to existing files plus one new migration file:

```
app/[lccSlug]/
└── actions.ts           # Add fire-and-forget block after Make.com webhook block

app/api/leads/[id]/
└── route.ts             # Add generated_intro_message to SELECT

supabase/migrations/
└── 20260323000000_phase5_ai_personalization.sql   # New: add column

utils/anthropic/
└── client.ts            # New: singleton Anthropic client (server-only)

.env.local               # Add ANTHROPIC_API_KEY
.env.example             # Add ANTHROPIC_API_KEY placeholder
```

Creating `utils/anthropic/client.ts` mirrors the existing pattern of `utils/supabase/admin.ts` — a single-export factory that constructs the SDK client from env vars, keeping the secret key import controlled and testable.

### Pattern 1: Anthropic Client Singleton (mirroring admin.ts)

**What:** Export a `createAnthropicClient()` function that reads `ANTHROPIC_API_KEY` from env and returns a configured `Anthropic` instance.
**When to use:** Every server-side call to Claude — import from here, never instantiate inline.

```typescript
// utils/anthropic/client.ts
// Source: https://platform.claude.com/docs/en/api/sdks/typescript
// IMPORTANT: Only call this from server-side code (Server Actions, Route Handlers).
// NEVER import in Client Components — ANTHROPIC_API_KEY must not reach the browser.
import Anthropic from '@anthropic-ai/sdk'

export function createAnthropicClient() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
    maxRetries: 0, // Disable SDK retries — we use fire-and-forget; failure leaves field null
  })
}
```

`maxRetries: 0` is critical: the SDK defaults to 2 retries with exponential backoff. For a fire-and-forget with a 10 s hard timeout, retries could extend execution to 30+ seconds and hold the server action open past redirect. Disable retries explicitly.

### Pattern 2: Fire-and-Forget Async Block in submitLeadForm

**What:** After the existing Make.com webhook block, launch a non-awaited async IIFE that checks the cache, calls Claude, and writes the result back. The `redirect()` call is not blocked.
**When to use:** Exactly once — in `submitLeadForm` in `app/[lccSlug]/actions.ts`.

```typescript
// Source: extends existing pattern from app/[lccSlug]/actions.ts
// Insert AFTER the existing Make.com webhook block, BEFORE redirect()
if (isNewLead && lead?.id) {
  // Fire-and-forget: Claude generation — does not block family redirect
  ;(async () => {
    try {
      // Cache guard: skip if already generated (idempotency)
      const { data: existing } = await supabase
        .from('leads')
        .select('generated_intro_message')
        .eq('id', lead.id)
        .single()

      if (existing?.generated_intro_message) return // already cached

      const anthropic = createAnthropicClient()
      const userContent = buildPromptContent({
        familyName,
        lccName,
        utmSource,
        message,
      })

      const response = await anthropic.messages.create(
        {
          model: 'claude-opus-4-6',
          max_tokens: 100, // 1-2 sentence target; 100 tokens is ample
          system: 'You write warm, brief, first-person outreach messages for au pair coordinators. Output only the message text — no quotes, no preamble.',
          messages: [{ role: 'user', content: userContent }],
        },
        { timeout: 10000 } // 10s — matches AbortSignal.timeout(10000) convention in codebase
      )

      const generatedText =
        response.content[0]?.type === 'text' ? response.content[0].text.trim() : null

      if (generatedText) {
        await supabase
          .from('leads')
          .update({ generated_intro_message: generatedText })
          .eq('id', lead.id)
      }
    } catch (err) {
      console.error('[submitLeadForm] Claude generation error:', err)
      // Field remains null — Make.com uses default template
    }
  })()
}
```

**Key details:**
- The IIFE is intentionally not awaited — `redirect()` fires immediately after.
- The cache guard `select('generated_intro_message')` before calling Claude prevents double-spend on any re-entry.
- `max_tokens: 100` is appropriate for a 1–2 sentence message under 160 chars. Claude Opus typically uses 30–60 tokens for this output.
- `{ timeout: 10000 }` is the SDK's per-request timeout option — triggers `APIConnectionTimeoutError` after 10 s.

### Pattern 3: Prompt Content Builder (Claude's Discretion area)

**What:** A pure function that assembles the user message string from the four inputs, handling null gracefully.
**When to use:** Called inside the async generation block.

```typescript
// Pure function — easy to unit test independently
function buildPromptContent(params: {
  familyName: string
  lccName: string
  utmSource: string | null
  message: string | null
}): string {
  const { familyName, lccName, utmSource, message } = params
  const sourceClause = utmSource ? ` I saw you found us through ${utmSource}.` : ''
  const messageClause = message
    ? ` I noticed you mentioned: "${message}".`
    : ''
  return (
    `Write a 1–2 sentence warm intro message from ${lccName} to the ${familyName} family.` +
    sourceClause +
    messageClause +
    ' Keep it under 160 characters, first-person, conversational.'
  )
}
```

Null handling: `utmSource` and `message` are both optional — omitting the clause when null keeps the prompt clean without special-casing in Claude.

### Pattern 4: Extending the Leads GET Route for AI-03

**What:** Add `generated_intro_message` to the existing SELECT in `GET /api/leads/[id]`.
**When to use:** One-line change in `app/api/leads/[id]/route.ts`.

```typescript
// Source: extends existing route.ts SELECT
.select(`
  id,
  family_name,
  email,
  phone,
  message,
  stage,
  utm_source,
  utm_medium,
  utm_campaign,
  utm_content,
  consent_timestamp,
  last_contacted_at,
  signed_at,
  created_at,
  generated_intro_message,   // ADD THIS
  lcc:lccs (
    id,
    name,
    slug
  )
`)
```

Make.com receives `generated_intro_message: null` or a string. It uses it as a template variable — null means it falls back to its own default template (already confirmed in CONTEXT.md).

### Anti-Patterns to Avoid

- **Awaiting the Claude call before redirect:** Blocks the server action and adds latency for the family. Never await the async IIFE.
- **Using `NEXT_PUBLIC_ANTHROPIC_API_KEY`:** Exposes the API key in the client bundle. The SDK must only be instantiated in server-side code.
- **Passing `AbortSignal.timeout(10000)` to the SDK:** The Anthropic SDK does not accept a `signal` option in the same way native `fetch` does (see Pitfall 1). Use `{ timeout: 10000 }` in the request options object.
- **Not disabling retries:** SDK default is 2 retries. In fire-and-forget mode this silently extends execution time. Always set `maxRetries: 0`.
- **Generating from client components:** The SDK would require `dangerouslyAllowBrowser: true` which Anthropic explicitly flags as a security risk. All generation is server-only.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTTP requests to Anthropic API | Custom `fetch` with manual headers | `@anthropic-ai/sdk` `client.messages.create()` | SDK handles `x-api-key`, `anthropic-version`, content-type, retry logic (even if disabled), typed errors, and timeout semantics correctly |
| Timeout handling | `AbortController` + `setTimeout` | SDK `{ timeout: 10000 }` option | SDK timeout throws typed `APIConnectionTimeoutError` cleanly; avoids the AbortController lifecycle bug (see Pitfall 1) |
| Error type checking | `(err as any).status` | `err instanceof Anthropic.APIError` / `Anthropic.APIConnectionTimeoutError` | Type-safe error handling with status codes |
| Response text extraction | Manual content array iteration | `response.content[0]?.type === 'text' ? response.content[0].text : null` | SDK types make the content block type-check explicit and safe |

**Key insight:** The Anthropic SDK is unusually thin and well-typed — it does not hide complexity, it just provides correct types and timeout/retry semantics. Using raw `fetch` adds maintenance burden with zero benefit.

---

## Common Pitfalls

### Pitfall 1: AbortSignal vs SDK Timeout Option

**What goes wrong:** Developer copies the existing `AbortSignal.timeout(10000)` pattern from the Make.com webhook code and passes `signal: AbortSignal.timeout(10000)` to `anthropic.messages.create()`. The SDK accepts a `signal` option but it behaves differently from the `{ timeout }` option — `AbortSignal.timeout` creates a signal that fires after the timeout even if the response started streaming, which can abort mid-response. More critically, the `signal` is passed at the request options level as `{ signal }`, whereas `{ timeout }` is the idiomatic SDK option.

**Why it happens:** The codebase already uses `AbortSignal.timeout(10000)` for native `fetch` calls. Developers pattern-match to the nearest existing code.

**How to avoid:** Use `{ timeout: 10000 }` in the SDK request options object (second argument to `messages.create()`). This maps to the SDK's internal timeout mechanism and throws `APIConnectionTimeoutError` cleanly.

**Warning signs:** If you see `signal: AbortSignal.timeout(...)` passed to SDK methods, flag it for review.

### Pitfall 2: Fire-and-Forget Blocks the redirect() in Next.js Server Actions

**What goes wrong:** In Next.js Server Actions, `redirect()` throws a special `NEXT_REDIRECT` error internally. If the fire-and-forget async IIFE is not wrapped in its own try/catch that is independent of the outer function's flow, the `redirect()` call may not fire before the async work completes in some execution environments.

**Why it happens:** The async IIFE is launched but JavaScript's event loop still needs to reach the `redirect()` call in the parent function. If the outer function throws (e.g., the async IIFE throws synchronously before becoming async), `redirect()` never executes.

**How to avoid:** Structure the code so the async IIFE is launched first, then `redirect()` is called. The IIFE must be fully async from line 1 — no synchronous work before the first `await` that could throw. The `try/catch` inside the IIFE must catch all errors.

**Warning signs:** Test by submitting a lead and verifying the thank-you redirect happens in < 1 second even when Claude is slow.

### Pitfall 3: Server Action Env Var Not Available at Runtime

**What goes wrong:** `ANTHROPIC_API_KEY` is missing from `.env.local` (or `.env.example` was updated but `.env.local` was not), causing the SDK constructor to receive `undefined` as the API key. The SDK will throw `AuthenticationError` on first call, not at import time.

**Why it happens:** This is a local developer setup error — the env var is new to Phase 5.

**How to avoid:** Add a runtime guard in `createAnthropicClient()`:
```typescript
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('[createAnthropicClient] ANTHROPIC_API_KEY env var is not set')
}
```
This surfaces the misconfiguration in Vercel logs immediately rather than an opaque `AuthenticationError`.

**Warning signs:** `AuthenticationError` or `401` in server logs on first lead submission after Phase 5 deploy.

### Pitfall 4: max_tokens Too Low Truncates the Message

**What goes wrong:** Setting `max_tokens` too low (e.g., 30) causes Claude to truncate mid-sentence. The stored message is grammatically broken.

**Why it happens:** Developer targets 160 chars and guesses tokens ≈ chars.

**How to avoid:** Use `max_tokens: 100`. A 160-char message is roughly 35–45 tokens for English prose. 100 provides a 2x safety margin and costs negligibly more. Claude Opus will naturally stop at `end_turn` before hitting 100 tokens for a 1–2 sentence message.

**Warning signs:** `stop_reason: 'max_tokens'` in the SDK response. Log `response.stop_reason` alongside the generated text.

### Pitfall 5: Upsert Path Triggers Generation on Duplicate Submissions

**What goes wrong:** The outer `isNewLead` guard correctly prevents the Make.com webhook from firing on duplicates, but if a developer adds the Claude generation block outside the `if (isNewLead && lead?.id)` block, a duplicate form submission would call Claude again (wasting spend and potentially overwriting the cached message).

**Why it happens:** Misreading the code structure of `submitLeadForm`.

**How to avoid:** Place the Claude generation block entirely inside the `if (isNewLead && lead?.id)` block. The cache guard is a secondary safety net, not the primary mechanism.

---

## Code Examples

Verified patterns from official sources:

### Basic SDK Usage with Per-Request Timeout

```typescript
// Source: https://platform.claude.com/docs/en/api/sdks/typescript
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 0,
})

const message = await client.messages.create(
  {
    model: 'claude-opus-4-6',
    max_tokens: 100,
    system: 'You write warm, brief outreach messages.',
    messages: [{ role: 'user', content: 'Write a greeting for the Smith family.' }],
  },
  { timeout: 10000 } // 10 seconds — throws APIConnectionTimeoutError on expiry
)

const text = message.content[0]?.type === 'text' ? message.content[0].text : null
```

### Error Handling Pattern

```typescript
// Source: https://platform.claude.com/docs/en/api/sdks/typescript (Handling errors section)
try {
  const response = await client.messages.create(/* ... */, { timeout: 10000 })
  // use response
} catch (err) {
  if (err instanceof Anthropic.APIConnectionTimeoutError) {
    console.error('[Claude] Request timed out after 10s')
  } else if (err instanceof Anthropic.APIError) {
    console.error(`[Claude] API error ${err.status}: ${err.message}`)
  } else {
    console.error('[Claude] Unexpected error:', err)
  }
  // In all cases: leave generated_intro_message null — Make.com uses default template
}
```

### Supabase Migration Pattern (matching existing migration style)

```sql
-- Source: matches supabase/migrations/20260315000000_phase2_lead_capture.sql pattern
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS generated_intro_message TEXT;
```

No index needed — this column is only ever read via `id` (primary key) lookups.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Raw `fetch` to `api.anthropic.com` | `@anthropic-ai/sdk` | v0.1.0+ | Type-safe requests, built-in retry/timeout semantics |
| `AbortController` for timeouts | SDK `{ timeout: N }` option | SDK v0.20+ | Cleaner error type (`APIConnectionTimeoutError`), no manual controller lifecycle |
| `process.env.ANTHROPIC_API_KEY` in constructor | Auto-read from env by default | SDK v0.10+ | Can omit `apiKey` if env var is set; still explicit for clarity |

**Deprecated/outdated:**
- Passing `signal: AbortSignal.timeout(N)` to the SDK: Use `{ timeout: N }` option instead — cleaner semantics.
- `maxRetries` defaulting to 2: For fire-and-forget patterns, explicitly set `maxRetries: 0`.

---

## Open Questions

1. **SMS 160-char enforcement**
   - What we know: CONTEXT.md says "target under 160 chars" — the prompt instructs Claude to stay under 160 chars.
   - What's unclear: Claude may occasionally produce outputs slightly over 160 chars even with the instruction. The planner should decide: (a) truncate in code at 160 chars, or (b) trust the prompt instruction.
   - Recommendation: Add a `generatedText.slice(0, 160)` trim as a safety net in the write-back step. Cost: zero. Risk of not doing it: Make.com SMS may split into two messages.

2. **Anthropic Console spend limit**
   - What we know: AI-03 success criteria states "a spend limit is configured in the Anthropic console" — this is an operator setup task, not a code task.
   - What's unclear: Is this tracked as a plan task or as a pre-flight checklist item?
   - Recommendation: Include as a verification checklist item (non-code), not a Wave task.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 (integration) + Playwright 1.58.2 (E2E) |
| Config file | `vitest.config.ts` / `playwright.config.ts` |
| Quick run command | `npx vitest run tests/integration/ai-generation.test.ts` |
| Full suite command | `npx vitest run tests/integration/ && npx playwright test tests/e2e/ai-personalization/` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AI-01 | `generated_intro_message` populated on new lead (non-null string) | integration | `npx vitest run tests/integration/ai-generation.test.ts --reporter=verbose` | ❌ Wave 0 |
| AI-02 | Duplicate lead submission does not call Claude again (cached field preserved) | integration | `npx vitest run tests/integration/ai-generation.test.ts --reporter=verbose` | ❌ Wave 0 |
| AI-03 | `GET /api/leads/[id]` response includes `generated_intro_message` field | integration | `npx vitest run tests/integration/leads-api.test.ts --reporter=verbose` | ❌ Wave 0 |

**Note on AI-01:** The integration test cannot call the live Claude API in CI without burning spend and introducing flakiness. The recommended approach (see Wave 0 Gaps) is to mock `createAnthropicClient()` with `vi.mock()` so the test verifies the DB write path, not the real Claude API. A separate manual smoke test with the real API key validates the actual model call.

**Note on AI-02 (cache):** Test inserts a lead with a pre-set `generated_intro_message` value, then runs the generation logic — verifies the value is unchanged (no overwrite).

**Note on AI-03:** Extends the existing `GET /api/leads/[id]` — the existing `tests/integration/` pattern covers this by calling the admin client directly and checking the response shape.

### Sampling Rate

- **Per task commit:** `npx vitest run tests/integration/ai-generation.test.ts`
- **Per wave merge:** `npx vitest run tests/integration/`
- **Phase gate:** Full Vitest integration suite green before `/gsd:verify-work`

E2E Playwright tests for AI-01/02 are **manual-only** — they require a live `ANTHROPIC_API_KEY` in the test environment and would incur real API spend. The integration tests with mocking cover the code paths.

### Wave 0 Gaps

- [ ] `tests/integration/ai-generation.test.ts` — covers AI-01 (generation writes to DB) and AI-02 (cache prevents re-generation). Needs `vi.mock('@anthropic-ai/sdk')` to stub Claude responses.
- [ ] `utils/anthropic/client.ts` — new file needed before any test can import it.
- [ ] `ANTHROPIC_API_KEY=test_key_placeholder` — add to `.env.local` for vitest to load (vitest.config.ts reads `.env.local` synchronously); the mock prevents real API calls so the value only needs to be non-empty.

---

## Sources

### Primary (HIGH confidence)

- [Anthropic TypeScript SDK official docs](https://platform.claude.com/docs/en/api/sdks/typescript) — timeout option, error handling, maxRetries, installation, SDK version 0.80.0 (verified 2026-03-23)
- [Anthropic API overview](https://platform.claude.com/docs/en/api/getting-started) — model names, Messages API, authentication pattern
- Codebase read: `app/[lccSlug]/actions.ts` — existing fire-and-forget webhook pattern, `isNewLead` guard, `AbortSignal.timeout(10000)` usage
- Codebase read: `app/api/leads/[id]/route.ts` — existing SELECT shape for Make.com endpoint
- Codebase read: `utils/supabase/admin.ts` — singleton client factory pattern to mirror
- Codebase read: `tests/integration/lead-upsert.test.ts` — integration test pattern for DB assertions

### Secondary (MEDIUM confidence)

- WebSearch: `@anthropic-ai/sdk` v0.80.0 confirmed as latest release (Mar 18, 2026) via npm registry search results
- WebSearch: `APIConnectionTimeoutError` and `APIUserAbortError` error hierarchy confirmed via Tessl registry docs mirror

### Tertiary (LOW confidence)

- None — all claims verified via primary sources above.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — official Anthropic SDK docs confirmed current version and TypeScript patterns
- Architecture: HIGH — patterns derived directly from reading existing codebase (actions.ts, admin.ts, route.ts)
- Pitfalls: HIGH for Pitfall 1 (verified via SDK docs timeout section), HIGH for Pitfall 2-5 (derived from codebase patterns and SDK docs)
- Validation: HIGH — matches existing Vitest/Playwright infrastructure patterns

**Research date:** 2026-03-23
**Valid until:** 2026-04-23 (30 days — SDK is stable; model name `claude-opus-4-6` confirmed in PROJECT.md)
