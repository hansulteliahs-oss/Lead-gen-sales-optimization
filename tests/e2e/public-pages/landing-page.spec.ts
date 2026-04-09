import { test, expect } from '@playwright/test'

const SLUG = 'kim-arvdalen'

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/${SLUG}/`)
  })

  test('returns 200 for /kim-arvdalen/', async ({ page }) => {
    const response = await page.goto(`/${SLUG}/`)
    expect(response?.status()).toBe(200)
  })

  test('hero section exists on the landing page', async ({ page }) => {
    const hero = page.locator('[data-testid="hero-section"], [data-testid="hero"]')
    await expect(hero).toBeVisible()
  })

  test('about teaser section exists with "Read more" link', async ({ page }) => {
    const readMoreLink = page.locator(
      '[data-testid="about-teaser"] a, section:has(a[href*="/about"]) a[href*="/about"]'
    ).first()
    await expect(readMoreLink).toBeVisible()
  })

  test('au pairs teaser section exists with "Learn more" link', async ({ page }) => {
    const learnMoreLink = page.locator(
      '[data-testid="au-pairs-teaser"] a, section:has(a[href*="/au-pairs"]) a[href*="/au-pairs"]'
    ).first()
    await expect(learnMoreLink).toBeVisible()
  })

  test('testimonials snippet exists with a quote element', async ({ page }) => {
    const quote = page.locator('blockquote, [data-testid="testimonial-quote"]').first()
    await expect(quote).toBeVisible()
  })

  test('hero "Get Started" CTA links to Cultural Care form', async ({ page }) => {
    const cta = page.locator('[data-testid="hero-cta"]')
    await expect(cta).toBeVisible()
    const href = await cta.getAttribute('href')
    expect(href).toContain('culturalcare.com')
  })
})
