---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (unit) + Playwright (E2E) |
| **Config file** | vitest.config.ts / playwright.config.ts — Wave 0 installs |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run && npx playwright test` |
| **Estimated runtime** | ~30 seconds (unit) + ~60 seconds (E2E) |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run `npx vitest run && npx playwright test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 0 | AUTH-01 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | AUTH-01 | E2E | `npx playwright test --grep "login"` | ❌ W0 | ⬜ pending |
| 1-02-01 | 02 | 1 | AUTH-02 | E2E | `npx playwright test --grep "session"` | ❌ W0 | ⬜ pending |
| 1-03-01 | 03 | 1 | AUTH-03 | E2E | `npx playwright test --grep "rls"` | ❌ W0 | ⬜ pending |
| 1-03-02 | 03 | 1 | AUTH-04 | E2E | `npx playwright test --grep "operator"` | ❌ W0 | ⬜ pending |
| 1-03-03 | 03 | 1 | AUTH-05 | E2E | `npx playwright test --grep "cross-tenant"` | ❌ W0 | ⬜ pending |
| 1-04-01 | 04 | 1 | AUTH-06 | unit | `npx vitest run --grep "env"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — test framework config
- [ ] `playwright.config.ts` — E2E config pointing to localhost:3000
- [ ] `tests/auth/login.test.ts` — stubs for AUTH-01 login routing
- [ ] `tests/auth/session.test.ts` — stubs for AUTH-02 session persistence
- [ ] `tests/auth/rls.spec.ts` — stubs for AUTH-03/04/05 RLS isolation
- [ ] `tests/auth/env.test.ts` — stubs for AUTH-06 service role key exposure check

*Wave 0 must install vitest + @playwright/test if not already in package.json.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Supabase Auth hook registered in dashboard | AUTH-03/04 | MCP may not support hook registration programmatically | Check Auth > Hooks in Supabase dashboard — verify Custom Access Token Hook is active |
| Service role key absent from browser network tab | AUTH-06 | Cannot automate browser devtools inspection | Open Network tab, login, confirm no response contains service role key value |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
