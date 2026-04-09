---
status: resolved
phase: 07-public-pages-and-content
source: [07-01-SUMMARY.md, 07-02-SUMMARY.md, 07-03-SUMMARY.md, 07-04-SUMMARY.md]
started: 2026-04-08T01:00:00Z
updated: 2026-04-08T02:00:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running dev server. Start fresh with `npm run dev`. Server boots without errors and the landing page at /kim-johnson loads with live DB content (headline and at least one section visible).
result: pass

### 2. Landing Page Hero Section
expected: Visit /kim-johnson. You should see a hero section with a two-column layout: left side shows either a photo or an initials fallback circle (since photo_url is NULL, expect a styled div with Kim's initials), right side shows Kim's headline and a "Get Started" button/link.
result: pass

### 3. Landing Page About Teaser
expected: Below the hero, there's an "About" teaser section showing a short bio excerpt (bio_teaser from DB) with a "Read more →" link that points to /kim-johnson/about.
result: pass

### 4. Landing Page Au Pairs Teaser
expected: Below the about teaser, there's an au pairs teaser section with intro copy and a "Learn more →" link pointing to /kim-johnson/au-pairs.
result: pass

### 5. Landing Page Testimonials Snippet
expected: A testimonials section shows a blockquote with one of Kim's seeded testimonials (a family quote from the DB). Should be visually styled as a quote.
result: pass

### 6. Landing Page CTA Anchor Scroll
expected: Clicking the "Get Started" button in the hero scrolls the page down to the lead capture form (or jumps to it). The form section should have the same LeadCaptureForm fields as before (name, email, phone, etc.).
result: pass

### 7. About Sub-page
expected: Visit /kim-johnson/about. You should see Kim's full bio text rendered (multiple paragraphs of DB content), her name, and no broken image since photo_url is NULL.
result: pass
note: "All sub-pages have black background with lighter text — user wants cream background matching landing page"

### 8. Au Pairs Sub-page — Accordion Sections
expected: Visit /kim-johnson/au-pairs. You should see 4 expandable accordion sections: "How It Works", "Program Costs", "Au Pair vs. Nanny" (expanded by default, showing a comparison table), and "Common Questions". Clicking a collapsed section expands it.
result: pass

### 9. FAQ Sub-page
expected: Visit /kim-johnson/faq. You should see a list of Kim's seeded FAQs rendered as question headings with answer text beneath each. Expect around 6 questions covering topics like cost, timeline, living arrangements, etc.
result: pass

### 10. Testimonials Sub-page
expected: Visit /kim-johnson/testimonials. You should see all 3 seeded testimonials displayed as styled blockquotes (with a gold left border or similar treatment), each attributed to the family name.
result: pass

## Summary

total: 10
passed: 10
issues: 1
pending: 0
skipped: 0

## Gaps

- truth: "Sub-pages (/about, /au-pairs, /faq, /testimonials) should have a cream/light background matching the landing page"
  status: resolved
  reason: "User reported: all the pages have a black background with lighter text, I would like for the background to be the same cream color as on the landing page"
  severity: cosmetic
  test: 7
  root_cause: "globals.css sets --background: #0a0a0a in dark mode via prefers-color-scheme media query; body consumes this CSS variable. Sub-pages have no background class on their root div, exposing the dark body. Landing page is immune because every section has explicit bg-brand-pageBg or bg-white classes covering the full viewport."
  artifacts:
    - path: "app/[lccSlug]/about/page.tsx"
      issue: "Root div has no background class"
    - path: "app/[lccSlug]/au-pairs/page.tsx"
      issue: "Root div has no background class"
    - path: "app/[lccSlug]/faq/page.tsx"
      issue: "Root div has no background class"
    - path: "app/[lccSlug]/testimonials/page.tsx"
      issue: "Root div has no background class"
  missing:
    - "Create app/[lccSlug]/layout.tsx with min-h-screen bg-brand-pageBg wrapper to fix all sub-pages in one place"
  debug_session: ""
