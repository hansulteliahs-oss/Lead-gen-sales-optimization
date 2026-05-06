import { test, expect } from '@playwright/test'

const SLUG = 'kim-arvdalen'

// Wave 0 — RED state.
// These tests define acceptance criteria for PAGE-03, PAGE-04, PAGE-05, PAGE-06.
// They FAIL until Plans 04–06 fill in the sub-page stubs.
// Current stubs return placeholder "coming soon" divs with no real content.

// ── PAGE-03: /about ──────────────────────────────────────────────────────────

test.describe('About page (/kim-johnson/about)', () => {
  test('returns 200', async ({ page }) => {
    const response = await page.goto(`/${SLUG}/about`)
    expect(response?.status()).toBe(200)
  })

  // RED: stub returns "About page — coming soon" div, no bio text rendered from DB
  test('contains bio text from DB (not a stub placeholder)', async ({ page }) => {
    await page.goto(`/${SLUG}/about`)
    // Must render actual bio content — a paragraph or element with data-testid="bio"
    // Will fail until Plan 04 fills the About page with LCC bio from DB
    const bio = page.locator('[data-testid="bio"], p.bio, .bio-content, article p').first()
    await expect(bio).toBeVisible()
  })

  // RED: stub has no img element at all — this verifies graceful null photo handling once implemented
  // After Plan 04, photo_url=NULL should render no broken img (either no img, or an initials fallback)
  test('handles null photo gracefully — no broken img src', async ({ page }) => {
    await page.goto(`/${SLUG}/about`)
    // If there IS an img element, its src must not be empty/null (broken image)
    const images = page.locator('img')
    const count = await images.count()
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const src = await images.nth(i).getAttribute('src')
        // src must be a non-empty string if img is rendered
        expect(src).toBeTruthy()
      }
    }
    // If count === 0, that's fine — no photo renders gracefully
  })
})

// ── PAGE-04: /au-pairs ───────────────────────────────────────────────────────

test.describe('Au Pairs page (/kim-johnson/au-pairs)', () => {
  test('returns 200', async ({ page }) => {
    const response = await page.goto(`/${SLUG}/au-pairs`)
    expect(response?.status()).toBe(200)
  })

  // RED: stub has no details elements — fails until Plan 05 adds accordion
  test('renders 4 accordion items (details elements)', async ({ page }) => {
    await page.goto(`/${SLUG}/au-pairs`)
    // Accordion items implemented as <details> elements
    await expect(page.locator('details')).toHaveCount(4)
  })

  // RED: stub has no details elements with these labels
  test('accordion items have correct headings', async ({ page }) => {
    await page.goto(`/${SLUG}/au-pairs`)
    await expect(page.getByText('How It Works')).toBeVisible()
    await expect(page.getByText('Program Costs')).toBeVisible()
    await expect(page.getByText('Au Pair vs. Nanny')).toBeVisible()
    await expect(page.getByText('Common Questions')).toBeVisible()
  })

  // RED: stub has no table element — fails until Plan 05 adds comparison table inside accordion
  test('contains a comparison table (au pair vs nanny)', async ({ page }) => {
    await page.goto(`/${SLUG}/au-pairs`)
    const table = page.locator('table')
    await expect(table).toBeVisible()
  })
})

// ── PAGE-05: /faq ────────────────────────────────────────────────────────────

test.describe('FAQ page (/kim-johnson/faq)', () => {
  test('returns 200', async ({ page }) => {
    const response = await page.goto(`/${SLUG}/faq`)
    expect(response?.status()).toBe(200)
  })

  // RED: stub has no FAQ items — fails until Plan 06 fills in the FAQ page
  test('renders FAQ items (question headings and answer paragraphs)', async ({ page }) => {
    await page.goto(`/${SLUG}/faq`)
    // After Kim's seed (Plan 02) and FAQ page implementation (Plan 06),
    // there must be at least 1 question heading visible
    const question = page.locator('[data-testid="faq-question"], dt, h2, h3').first()
    await expect(question).toBeVisible()
    // And at least 1 answer paragraph
    const answer = page.locator('[data-testid="faq-answer"], dd, p').first()
    await expect(answer).toBeVisible()
  })

  // Empty state test — only applies to an LCC with no FAQs
  // Skip for kim-johnson since she will have FAQs after Plan 02 seed
  test.skip('shows empty state message if no FAQs', async ({ page }) => {
    await page.goto(`/${SLUG}/faq`)
    const emptyState = page.locator('[data-testid="empty-state"], .empty-state')
    await expect(emptyState).toBeVisible()
  })
})

// ── PAGE-06: /testimonials ───────────────────────────────────────────────────

test.describe('Testimonials page (/kim-johnson/testimonials)', () => {
  test('returns 200', async ({ page }) => {
    const response = await page.goto(`/${SLUG}/testimonials`)
    expect(response?.status()).toBe(200)
  })

  // RED: stub has no testimonial items — fails until Plan 06 fills in the testimonials page
  test('renders testimonial items with quote elements', async ({ page }) => {
    await page.goto(`/${SLUG}/testimonials`)
    // After Kim's seed (Plan 02) and testimonials page implementation (Plan 06),
    // at least 1 blockquote or testimonial element must be visible
    const testimonial = page.locator(
      'blockquote, [data-testid="testimonial-quote"], [data-testid="testimonial"]'
    ).first()
    await expect(testimonial).toBeVisible()
  })

  // Empty state test — only applies to an LCC with no testimonials
  // Skip for kim-johnson since she will have testimonials after Plan 02 seed
  test.skip('shows empty state if no testimonials', async ({ page }) => {
    await page.goto(`/${SLUG}/testimonials`)
    const emptyState = page.locator('[data-testid="empty-state"], .empty-state')
    await expect(emptyState).toBeVisible()
  })
})
