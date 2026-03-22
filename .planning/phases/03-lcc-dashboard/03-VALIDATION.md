---
phase: 3
slug: lcc-dashboard
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-22
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright 1.58.2 (E2E) + Vitest 4.1.0 (unit) |
| **Config file** | `playwright.config.ts` (root) · `vitest.config.ts` (root) |
| **Quick run command** | `npx playwright test tests/e2e/lcc-dashboard/ && npx vitest run tests/integration/stage-update.test.ts` |
| **Full suite command** | `npx playwright test && npx vitest run` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx playwright test tests/e2e/lcc-dashboard/ && npx vitest run tests/integration/stage-update.test.ts`
- **After every plan wave:** Run `npx playwright test && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 0 | DASH-01, DASH-03 | Playwright E2E | `npx playwright test tests/e2e/lcc-dashboard/pipeline-view.spec.ts` | ❌ W0 | ⬜ pending |
| 3-01-02 | 01 | 0 | DASH-02 | Playwright E2E | `npx playwright test tests/e2e/lcc-dashboard/lead-detail.spec.ts` | ❌ W0 | ⬜ pending |
| 3-01-03 | 01 | 0 | DASH-04 | Playwright E2E | `npx playwright test tests/e2e/lcc-dashboard/commission.spec.ts` | ❌ W0 | ⬜ pending |
| 3-01-04 | 01 | 0 | DASH-05 | Playwright E2E | `npx playwright test tests/e2e/lcc-dashboard/automations.spec.ts` | ❌ W0 | ⬜ pending |
| 3-01-05 | 01 | 0 | PIPE-04 | Vitest unit | `npx vitest run tests/integration/stage-update.test.ts` | ❌ W0 | ⬜ pending |
| 3-02-01 | 02 | 1 | DASH-01, DASH-03 | Playwright E2E | `npx playwright test tests/e2e/lcc-dashboard/pipeline-view.spec.ts` | ✅ W0 | ⬜ pending |
| 3-02-02 | 02 | 1 | DASH-04 | Playwright E2E | `npx playwright test tests/e2e/lcc-dashboard/commission.spec.ts` | ✅ W0 | ⬜ pending |
| 3-03-01 | 03 | 2 | DASH-02 | Playwright E2E | `npx playwright test tests/e2e/lcc-dashboard/lead-detail.spec.ts` | ✅ W0 | ⬜ pending |
| 3-03-02 | 03 | 2 | DASH-05 | Playwright E2E | `npx playwright test tests/e2e/lcc-dashboard/automations.spec.ts` | ✅ W0 | ⬜ pending |
| 3-04-01 | 04 | 2 | PIPE-04 | Vitest unit | `npx vitest run tests/integration/stage-update.test.ts` | ✅ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/e2e/lcc-dashboard/pipeline-view.spec.ts` — stubs for DASH-01, DASH-03 (stage columns visible, count badges)
- [ ] `tests/e2e/lcc-dashboard/lead-detail.spec.ts` — stubs for DASH-02 (click-through + RLS 404 guard)
- [ ] `tests/e2e/lcc-dashboard/commission.spec.ts` — stubs for DASH-04 (signed count visible, no `$`)
- [ ] `tests/e2e/lcc-dashboard/automations.spec.ts` — stubs for DASH-05 (webhook configured/not-configured indicator)
- [ ] `tests/integration/stage-update.test.ts` — stubs for PIPE-04 (403 non-operator, 422 invalid stage, 200 valid update, signed_at side-effect)

Note: `tests/e2e/` and `tests/integration/` directories already exist. Playwright config (`playwright.config.ts`) and Vitest config (`vitest.config.ts`) are already set up. Wave 0 only needs new spec files — no framework install required.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| None | — | All phase behaviors have automated verification | — |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
