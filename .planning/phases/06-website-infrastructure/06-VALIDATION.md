---
phase: 06
slug: website-infrastructure
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-04
---

# Phase 06 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright 1.58.2 (e2e) + Vitest 4.1.0 (integration) |
| **Config file** | `playwright.config.ts` (e2e), `vitest.config.ts` (integration) |
| **Quick run command** | `npx playwright test tests/e2e/website-infrastructure/ --project=chromium` |
| **Full suite command** | `npx playwright test --project=chromium` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx playwright test tests/e2e/website-infrastructure/ --project=chromium`
- **After every plan wave:** Run `npx playwright test --project=chromium`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | SITE-01 | integration | `npx vitest run tests/integration/website-infra.test.ts` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 1 | SITE-02 | integration | `npx vitest run tests/integration/website-infra.test.ts` | ❌ W0 | ⬜ pending |
| 06-01-03 | 01 | 1 | SITE-03 | integration | `npx vitest run tests/integration/website-infra.test.ts` | ❌ W0 | ⬜ pending |
| 06-01-04 | 01 | 1 | SITE-04 | integration | `npx vitest run tests/integration/website-infra.test.ts` | ❌ W0 | ⬜ pending |
| 06-02-01 | 02 | 1 | SITE-05 | e2e | `npx playwright test tests/e2e/website-infrastructure/public-routes.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |
| 06-03-01 | 03 | 2 | SITE-06 | e2e | `npx playwright test tests/e2e/website-infrastructure/nav-layout.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |
| 06-03-02 | 03 | 2 | SITE-07 | e2e | `npx playwright test tests/e2e/website-infrastructure/nav-layout.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/integration/website-infra.test.ts` — stubs for SITE-01, SITE-02, SITE-03, SITE-04 (schema and storage assertions via admin client)
- [ ] `tests/e2e/website-infrastructure/public-routes.spec.ts` — stubs for SITE-05 (unauthenticated 200 checks for 4 sub-routes)
- [ ] `tests/e2e/website-infrastructure/nav-layout.spec.ts` — stubs for SITE-06, SITE-07 (nav presence, hamburger toggle at mobile viewport)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Smooth scroll to form on CTA click | SITE-06 | Scroll behavior hard to assert reliably in headless | Click "Get Started" CTA, verify page scrolls to form section |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
