---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: milestone
status: planning
stopped_at: Completed 07-05-PLAN.md — Sub-page cream background gap closure
last_updated: "2026-04-09T03:05:07.586Z"
last_activity: 2026-04-04 — v2.0 roadmap created; 18 requirements mapped across phases 6-8
progress:
  total_phases: 8
  completed_phases: 6
  total_plans: 23
  completed_plans: 23
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-04)

**Core value:** More families signed for each LCC — a fully automated lead generation and nurture system that turns family interest into au pair sign-ups, without the LCC lifting a finger.
**Current focus:** v2.0 — Phase 6: Website Infrastructure (ready to plan)

## Current Position

Phase: 6 of 8 for v2.0 (Website Infrastructure)
Plan: Not started
Status: Ready to plan Phase 6
Last activity: 2026-04-04 — v2.0 roadmap created; 18 requirements mapped across phases 6-8

Progress: [░░░░░░░░░░] 0% (v2.0 milestone)

## Performance Metrics

**Velocity:**
- Total plans completed: 0 (v2.0)
- Average duration: —
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

*Updated after each plan completion*
| Phase 06-website-infrastructure P01 | 2 | 2 tasks | 2 files |
| Phase 06-website-infrastructure P02 | 15 | 2 tasks | 6 files |
| Phase 06-website-infrastructure P01 | 3 | 2 tasks | 2 files |
| Phase 06-website-infrastructure P02 | 15 | 2 tasks | 6 files |
| Phase 06-website-infrastructure P03 | 2 | 2 tasks | 5 files |
| Phase 06-website-infrastructure P03 | 20 | 2 tasks | 5 files |
| Phase 07-public-pages-and-content P02 | 2 | 1 tasks | 2 files |
| Phase 07-public-pages-and-content P01 | 4 | 3 tasks | 2 files |
| Phase 07-public-pages-and-content P03 | 1 | 1 tasks | 1 files |
| Phase 07-public-pages-and-content P04 | 12 | 2 tasks | 4 files |
| Phase 07-public-pages-and-content P05 | 1 | 1 tasks | 1 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v2.0 Init]: Expand /[lccSlug]/ route (not a separate site) — keeps form, auth, and DB in one codebase
- [v2.0 Init]: DB-driven content from day one — schema must exist now to support v2.1 LCC self-editing
- [v2.0 Init]: Custom domain routing deferred to v2.1 — custom_domain column exists but routing logic is future scope
- [v2.0 Init]: File upload UI deferred — operator uploads to Supabase Storage directly for v2.0
- [Phase 02-lead-capture-and-automation]: Middleware public route check: regex /^\/[a-z0-9][a-z0-9-]*(?:\/thank-you)?$/ — Phase 6 must extend this to cover /about, /au-pairs, /faq, /testimonials sub-routes
- [Phase 03-lcc-dashboard]: Brand color palette in tailwind.config.ts as single source of truth — website pages should reuse same tokens
- [Phase 06-01]: All 6 new lccs columns are nullable — LCCs without website content must not break
- [Phase 06-01]: Storage bucket and RLS policies use ON CONFLICT / IF NOT EXISTS wrappers for idempotency
- [Phase 06-01]: TDD approach: tests written first (RED), migration applied second (GREEN)
- [Phase 06-website-infrastructure]: Middleware variable renamed from isPublicLandingPage to isPublicLccPage to reflect broader scope covering 4 sub-routes beyond the landing page
- [Phase 06-website-infrastructure]: All 6 new lccs columns are nullable — LCCs without website content must not break
- [Phase 06-website-infrastructure]: lcc-photos Storage bucket is public=true for unauthenticated image reads on website pages
- [Phase 06-website-infrastructure]: TDD approach: integration tests written RED first, migration applied second for GREEN
- [Phase 06-website-infrastructure]: Renamed isPublicLandingPage to isPublicLccPage to reflect broader coverage of new sub-routes
- [Phase 06-website-infrastructure]: Middleware regex uses explicit allowlist (not wildcard) so only named sub-paths are public; unrecognized paths remain gated
- [Phase 06-website-infrastructure]: Nav uses <a> tag for CTA Get Started (not Next.js Link) to allow #fragment anchor scroll — fragment-only hrefs require <a> for reliable scroll behavior
- [Phase 06-website-infrastructure]: Server layout passes lccName/lccSlug as props to Client nav component — keeps SUPABASE_SERVICE_ROLE_KEY server-side only
- [Phase 06-website-infrastructure]: Nav uses <a> (not Link) for CTA to allow #fragment anchor scroll; CTA href switches between #form and /[slug]/#form based on usePathname()
- [Phase 06-website-infrastructure]: kim-johnson LCC row inserted into remote Supabase DB — seed.sql only had lcc1/lcc2 but all Phase 6 E2E tests use kim-johnson slug
- [Phase 07-public-pages-and-content]: DELETE-before-INSERT chosen for testimonials/FAQs seed so re-running migration replaces content cleanly rather than silently skipping updates
- [Phase 07-public-pages-and-content]: photo_url explicitly set to NULL in kim-johnson seed to document intentional absence and exercise page null-fallback logic
- [Phase 07-public-pages-and-content]: landing-page.spec.ts uses data-testid selectors for hero and CTA to distinguish page sections from nav elements
- [Phase 07-public-pages-and-content]: details element chosen as accordion selector for au-pairs page (4 items required by test)
- [Phase 07-public-pages-and-content]: Empty state tests for FAQ and testimonials skipped — kim-johnson already has seeded content from Plan 02 applied out of order
- [Phase 07-public-pages-and-content]: Plain img tag used instead of next/image — no remotePatterns configured for Supabase Storage CDN URLs
- [Phase 07-public-pages-and-content]: data-testid attributes on hero-section, hero-cta, about-teaser, au-pairs-teaser match test selectors from 07-01 landing-page.spec.ts
- [Phase 07-public-pages-and-content]: data-testid='bio' added to about page bio paragraph to match E2E locator
- [Phase 07-public-pages-and-content]: Au Pair vs. Nanny accordion rendered open by default so table is visible for E2E toBeVisible() assertion
- [Phase 07-public-pages-and-content]: Single layout.tsx change chosen over per-page fix — DRY approach covers all current and future sub-pages under [lccSlug] without per-file changes

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 6]: Middleware regex currently only allows /[slug] and /[slug]/thank-you — extending to 4 new sub-paths is a must-have in Phase 6 plan 1
- [Phase 7]: Kim's photo URL will be a placeholder at seed time — real photo swap is an operator task, not a code task
- [Phase 4]: Operator admin and billing (Phase 4) is not blocking v2.0 website phases — Phase 6 depends only on Phase 1 schema patterns and Phase 2 middleware patterns

## Session Continuity

Last session: 2026-04-09T03:05:07.582Z
Stopped at: Completed 07-05-PLAN.md — Sub-page cream background gap closure
Resume file: None
