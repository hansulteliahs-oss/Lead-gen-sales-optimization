---
phase: 8
slug: seo
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-08
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright (E2E) |
| **Config file** | `playwright.config.ts` |
| **Quick run command** | `npx playwright test tests/e2e/seo/ --project=chromium` |
| **Full suite command** | `npx playwright test --project=chromium` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx playwright test tests/e2e/seo/ --project=chromium`
- **After every plan wave:** Run `npx playwright test --project=chromium`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 8-01-01 | 01 | 0 | SEO-01, SEO-02 | E2E | `npx playwright test tests/e2e/seo/metadata.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |
| 8-02-01 | 02 | 1 | SEO-01, SEO-02 | E2E | `npx playwright test tests/e2e/seo/metadata.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |
| 8-02-02 | 02 | 1 | SEO-01, SEO-02 | E2E | `npx playwright test tests/e2e/seo/metadata.spec.ts --project=chromium` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/e2e/seo/metadata.spec.ts` — E2E specs for SEO-01 and SEO-02 across all 5 pages (title, description, og:title, og:description, og:image conditional)
- [ ] Update `const SLUG = 'kim-arvdalen'` in 6 existing test files that currently hardcode `kim-johnson`

*Wave 0 must complete before implementation waves can pass.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Social sharing preview card renders correctly on a social platform | SEO-02 | Playwright cannot simulate social scraper behavior; requires an actual share on LinkedIn/Slack/etc. | Deploy to staging, share a page URL in Slack, confirm OG image and title appear in preview card |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
