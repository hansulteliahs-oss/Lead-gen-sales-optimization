---
phase: 5
slug: ai-personalization
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 (integration) + Playwright 1.58.2 (E2E) |
| **Config file** | `vitest.config.ts` / `playwright.config.ts` |
| **Quick run command** | `npx vitest run tests/integration/ai-generation.test.ts` |
| **Full suite command** | `npx vitest run tests/integration/ && npx playwright test tests/e2e/ai-personalization/` |
| **Estimated runtime** | ~15 seconds (integration only) |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/integration/ai-generation.test.ts`
- **After every plan wave:** Run `npx vitest run tests/integration/`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 0 | AI-01, AI-02 | unit | `npx vitest run tests/integration/ai-generation.test.ts --reporter=verbose` | ❌ Wave 0 | ⬜ pending |
| 05-01-02 | 01 | 0 | AI-03 | unit | `npx vitest run tests/integration/leads-api.test.ts --reporter=verbose` | ❌ Wave 0 | ⬜ pending |
| 05-02-01 | 02 | 1 | AI-01 | integration | `npx vitest run tests/integration/ai-generation.test.ts --reporter=verbose` | ❌ Wave 0 | ⬜ pending |
| 05-02-02 | 02 | 1 | AI-02 | integration | `npx vitest run tests/integration/ai-generation.test.ts --reporter=verbose` | ❌ Wave 0 | ⬜ pending |
| 05-02-03 | 02 | 1 | AI-03 | integration | `npx vitest run tests/integration/leads-api.test.ts --reporter=verbose` | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/integration/ai-generation.test.ts` — stubs for AI-01 (generation writes to DB) and AI-02 (cache prevents re-generation); uses `vi.mock('@anthropic-ai/sdk')` to stub Claude responses without burning real API spend
- [ ] `utils/anthropic/client.ts` — new file needed before any test can import it; must exist before Wave 0 tests can compile
- [ ] `ANTHROPIC_API_KEY=test_key_placeholder` — add to `.env.local` for vitest to load (vitest.config.ts reads `.env.local` synchronously); mock prevents real API calls so value only needs to be non-empty

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Live Claude API generates a non-empty, coherent message | AI-01 | Real API calls incur spend and introduce external dependency into CI | Set real `ANTHROPIC_API_KEY`, submit a test lead on `/[lccSlug]`, check `leads.generated_intro_message` in Supabase dashboard within 15s |
| Anthropic Console spend limit configured | AI-03 (ops) | Not a code task — operator must set this in Anthropic Console | Log in to console.anthropic.com → Settings → Limits → confirm monthly spend cap is set |
| Make.com receives `generated_intro_message` in webhook payload | AI-03 | Requires live Make.com scenario and end-to-end flow | Trigger a new lead, inspect Make.com execution log to confirm the GET /api/leads/[id] response includes the field |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
