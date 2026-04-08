---
phase: 7
slug: public-pages-and-content
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-07
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright 1.58.2 (E2E) + Vitest 4.1.0 (integration) |
| **Config file** | `playwright.config.ts` / `vitest.config.ts` |
| **Quick run command** | `npx playwright test tests/e2e/public-pages/ --project=chromium` |
| **Full suite command** | `npx playwright test --project=chromium && npx vitest run tests/integration/` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx playwright test tests/e2e/public-pages/ --project=chromium`
- **After every plan wave:** Run `npx playwright test --project=chromium && npx vitest run tests/integration/`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 7-01-01 | 01 | 0 | PAGE-01, PAGE-02 | E2E stub | `npx playwright test tests/e2e/public-pages/landing-page.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |
| 7-01-02 | 01 | 0 | PAGE-03, PAGE-04, PAGE-05, PAGE-06 | E2E stub | `npx playwright test tests/e2e/public-pages/sub-pages.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |
| 7-01-03 | 01 | 0 | CONT-01, CONT-02, CONT-03 | Integration stub | `npx vitest run tests/integration/kim-seed.test.ts` | ❌ W0 | ⬜ pending |
| 7-02-01 | 02 | 1 | CONT-01, CONT-02, CONT-03 | Integration | `npx vitest run tests/integration/kim-seed.test.ts` | ❌ W0 | ⬜ pending |
| 7-03-01 | 03 | 2 | PAGE-01, PAGE-02 | E2E | `npx playwright test tests/e2e/public-pages/landing-page.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |
| 7-04-01 | 04 | 3 | PAGE-03 | E2E | `npx playwright test tests/e2e/public-pages/sub-pages.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |
| 7-04-02 | 04 | 3 | PAGE-04 | E2E | `npx playwright test tests/e2e/public-pages/sub-pages.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |
| 7-04-03 | 04 | 3 | PAGE-05 | E2E | `npx playwright test tests/e2e/public-pages/sub-pages.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |
| 7-04-04 | 04 | 3 | PAGE-06 | E2E | `npx playwright test tests/e2e/public-pages/sub-pages.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/e2e/public-pages/landing-page.spec.ts` — stubs for PAGE-01, PAGE-02
- [ ] `tests/e2e/public-pages/sub-pages.spec.ts` — stubs for PAGE-03, PAGE-04, PAGE-05, PAGE-06
- [ ] `tests/integration/kim-seed.test.ts` — stubs for CONT-01, CONT-02, CONT-03

*(All use `kim-johnson` slug, matching existing Phase 6 test convention)*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| "Get Started" button smooth-scrolls (no reload) | PAGE-02 | Visual scroll behavior hard to assert with Playwright | Click "Get Started" in nav; verify page scrolls to form section without full page reload |
| Alternating section backgrounds render correctly | PAGE-01 | Visual design — color correctness subjective | Open landing page; verify hero=cream, about=white, au-pairs=cream, testimonials=white, form=cream |
| Accordion open/close animation | PAGE-04 | CSS transition timing — not a functional concern | Click each accordion header; verify content expands/collapses with transition |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
