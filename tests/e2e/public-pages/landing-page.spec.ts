import { test, expect } from '@playwright/test'

const SLUG = 'kim-arvdalen'

// Wave 0 — RED state.
// These tests define acceptance criteria for PAGE-01 and PAGE-02.
// They FAIL until Plan 03 rewrites app/[lccSlug]/page.tsx with the new landing page design.
// The current page.tsx is a minimal form-only page — no hero, no about teaser, no au pairs teaser,
// no testimonials snippet section, and no hero-level CTA distinct from the sticky nav.

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/${SLUG}/`)
  })

  // PAGE-01 / CONT-01: Landing page loads
  test('returns 200 for /kim-johnson/', async ({ page }) => {
    const response = await page.goto(`/${SLUG}/`)
    expect(response?.status()).toBe(200)
  })

  // PAGE-01: Hero section — expects a data-testid or role-based hero section
  // RED: current page has no hero section, only a centered form
  test('hero section exists on the landing page', async ({ page }) => {
    const hero = page.locator('[data-testid="hero-section"], [data-testid="hero"]')
    await expect(hero).toBeVisible()
  })

  // PAGE-01: About teaser — a dedicated section (not just nav link) with bio teaser text
  // RED: current page has no about teaser section
  test('about teaser section exists with "Read more" or link text', async ({ page }) => {
    // Must have a section-level element containing "Read more" or explicit about teaser copy
    const readMoreLink = page.locator(
      '[data-testid="about-teaser"] a, section:has(a[href*="/about"]) a[href*="/about"]'
    ).first()
    await expect(readMoreLink).toBeVisible()
  })

  // PAGE-01: Au pairs teaser — a dedicated section (not just nav link) with "Learn more" link
  // RED: current page has no au pairs teaser section
  test('au pairs teaser section exists with "Learn more" link', async ({ page }) => {
    const learnMoreLink = page.locator(
      '[data-testid="au-pairs-teaser"] a, section:has(a[href*="/au-pairs"]) a[href*="/au-pairs"]'
    ).first()
    await expect(learnMoreLink).toBeVisible()
  })

  // PAGE-01: Testimonials snippet — a featured quote in a dedicated section
  // RED: current page has no testimonials snippet section
  test('testimonials snippet exists with a quote element', async ({ page }) => {
    const quote = page.locator('blockquote, [data-testid="testimonial-quote"]').first()
    await expect(quote).toBeVisible()
  })

  // PAGE-01: Form section — element with id="form" is present (this one will PASS on current page)
  test('form section has id="form" anchor', async ({ page }) => {
    const formSection = page.locator('#form')
    await expect(formSection).toBeVisible()
  })

  // PAGE-02: Hero-level "Get Started" CTA that scrolls to #form
  // RED: current page has no hero CTA outside the nav — only the nav "Get Started"
  test('hero "Get Started" CTA with href="#form" exists outside the nav', async ({ page }) => {
    // Specifically look for a CTA OUTSIDE the nav element
    const ctaOutsideNav = page.locator(
      ':not(nav) a[href="#form"], [data-testid="hero-cta"]'
    ).first()
    await expect(ctaOutsideNav).toBeVisible()
  })
})
