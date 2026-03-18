---
phase: 2
slug: lead-capture-and-automation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright 1.58.2 (E2E) + Vitest 4.1.0 (integration) — both already installed |
| **Config file** | `playwright.config.ts` (E2E: `tests/e2e/`), `vitest.config.ts` (integration: `tests/integration/`) |
| **Quick run command** | `npx playwright test lead-capture/ --reporter=line` |
| **Full suite command** | `npx playwright test && npx vitest run` |
| **Estimated runtime** | ~30 seconds (quick), ~90 seconds (full) |

---

## Sampling Rate

- **After every task commit:** Run `npx playwright test lead-capture/ --reporter=line`
- **After every plan wave:** Run `npx playwright test && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 1 | LEAD-01 | E2E | `npx playwright test lead-capture/landing-page.spec.ts` | ❌ W0 | ⬜ pending |
| 2-01-02 | 01 | 1 | LEAD-01 | E2E | `npx playwright test lead-capture/landing-page.spec.ts` | ❌ W0 | ⬜ pending |
| 2-01-03 | 01 | 1 | LEAD-02 | E2E | `npx playwright test lead-capture/form-submit.spec.ts` | ❌ W0 | ⬜ pending |
| 2-01-04 | 01 | 1 | LEAD-03 | E2E | `npx playwright test lead-capture/tcpa-consent.spec.ts` | ❌ W0 | ⬜ pending |
| 2-01-05 | 01 | 1 | LEAD-04 | E2E | `npx playwright test lead-capture/form-submit.spec.ts` | ❌ W0 | ⬜ pending |
| 2-01-06 | 01 | 1 | LEAD-06 | Integration | `npx vitest run tests/integration/lead-upsert.test.ts` | ❌ W0 | ⬜ pending |
| 2-01-07 | 01 | 1 | LEAD-03 | Integration | `npx vitest run tests/integration/lead-upsert.test.ts` | ❌ W0 | ⬜ pending |
| 2-01-08 | 01 | 1 | PIPE-01 | Integration | `npx vitest run tests/integration/lead-upsert.test.ts` | ❌ W0 | ⬜ pending |
| 2-01-09 | 01 | 1 | PIPE-03 | Integration | `npx vitest run tests/integration/lead-upsert.test.ts` | ❌ W0 | ⬜ pending |
| 2-01-10 | 01 | 1 | AUTO-06 | Integration | `npx vitest run tests/integration/lead-upsert.test.ts` | ❌ W0 | ⬜ pending |
| 2-02-01 | 02 | 1 | LEAD-02 | E2E | `npx playwright test lead-capture/deduplication.spec.ts` | ❌ W0 | ⬜ pending |
| 2-02-02 | 02 | 1 | LEAD-05 | E2E | `npx playwright test lead-capture/webhook-fire.spec.ts` | ❌ W0 | ⬜ pending |
| 2-03-01 | 03 | 2 | PIPE-02 | Integration | `npx vitest run tests/integration/callback-api.test.ts` | ❌ W0 | ⬜ pending |
| 2-03-02 | 03 | 2 | AUTO-04 | Integration | `npx vitest run tests/integration/callback-api.test.ts` | ❌ W0 | ⬜ pending |
| 2-03-03 | 03 | 2 | PIPE-05 | Integration | `npx vitest run tests/integration/callback-api.test.ts` | ❌ W0 | ⬜ pending |
| 2-03-04 | 03 | 2 | AUTO-05 | Integration | `npx vitest run tests/integration/callback-api.test.ts` | ❌ W0 | ⬜ pending |
| 2-04-01 | 04 | 2 | AUTO-01 | Manual | See manual verifications table | N/A | ⬜ pending |
| 2-04-02 | 04 | 2 | AUTO-02 | Manual | See manual verifications table | N/A | ⬜ pending |
| 2-04-03 | 04 | 2 | AUTO-03 | Manual | See manual verifications table | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/e2e/lead-capture/landing-page.spec.ts` — stubs for LEAD-01 (200 + 404)
- [ ] `tests/e2e/lead-capture/form-submit.spec.ts` — stubs for LEAD-02, LEAD-04
- [ ] `tests/e2e/lead-capture/tcpa-consent.spec.ts` — stubs for LEAD-03 (checkbox required)
- [ ] `tests/e2e/lead-capture/deduplication.spec.ts` — stubs for duplicate submission LEAD-02
- [ ] `tests/e2e/lead-capture/webhook-fire.spec.ts` — stubs for LEAD-05 (Playwright route intercept)
- [ ] `tests/integration/lead-upsert.test.ts` — stubs for LEAD-03 (DB fields), LEAD-06, PIPE-01, PIPE-03, AUTO-06
- [ ] `tests/integration/callback-api.test.ts` — stubs for PIPE-02, PIPE-05, AUTO-04, AUTO-05

*No new framework install needed — Playwright and Vitest already configured from Phase 1.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Make.com triggers SMS to family within 60s of form submission | AUTO-01 | Requires live Make.com scenario + Twilio A2P credentials; no local mock possible | Submit form on staging → check family phone receives SMS within 60s |
| Make.com triggers email to family within 60s of form submission | AUTO-02 | Requires live Make.com scenario + email delivery; no local mock possible | Submit form on staging → check family email inbox within 60s |
| Make.com nurture sequence fires 3+ touchpoints over following days | AUTO-03 | Timing-based Make.com scenario; cannot automate days-long sequence in test | Verify Make.com scenario design shows 3+ scheduled steps; spot-check first touchpoint on staging |
| PIPE-04: Operator manual stage update | PIPE-04 | UI interaction in dashboard (Phase 3 scope); API allows it but UI is not yet built | Via Supabase dashboard: manually update stage column, verify no constraint violation |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
