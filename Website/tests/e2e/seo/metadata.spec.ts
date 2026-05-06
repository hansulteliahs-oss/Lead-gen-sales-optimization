import { test, expect } from '@playwright/test'

// Wave 0 — RED state.
// These tests define the SEO acceptance contract for Phase 8.
// They FAIL until Plan 02 adds generateMetadata to all 5 LCC pages.
// Do not "fix" these by modifying existing pages — let Plan 02 drive the GREEN.

const SLUG = 'kim-arvdalen'

// ── Landing page: /kim-arvdalen ───────────────────────────────────────────────

test.describe('SEO metadata: Landing page (/kim-arvdalen)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/${SLUG}`)
  })

  // SEO-01: Title tag
  test('title is "Kim Arvdalen | Local Childcare Consultant"', async ({ page }) => {
    const title = await page.locator('head title').textContent()
    expect(title).toBe('Kim Arvdalen | Local Childcare Consultant')
  })

  // SEO-01: Meta description
  test('meta description contains "Kim Arvdalen"', async ({ page }) => {
    const desc = await page.locator('meta[name="description"]').getAttribute('content')
    expect(desc).toContain('Kim Arvdalen')
  })

  // SEO-02: og:title
  test('og:title matches page title', async ({ page }) => {
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
    expect(ogTitle).toBe('Kim Arvdalen | Local Childcare Consultant')
  })

  // SEO-02: og:description
  test('og:description contains "Kim Arvdalen"', async ({ page }) => {
    const ogDesc = await page.locator('meta[property="og:description"]').getAttribute('content')
    expect(ogDesc).toContain('Kim Arvdalen')
  })

  // SEO-02: og:image absent (photo_url is NULL for kim-arvdalen)
  test('og:image tag is absent (photo_url is NULL)', async ({ page }) => {
    const ogImage = page.locator('meta[property="og:image"]')
    await expect(ogImage).toHaveCount(0)
  })
})

// ── About page: /kim-arvdalen/about ──────────────────────────────────────────

test.describe('SEO metadata: About page (/kim-arvdalen/about)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/${SLUG}/about`)
  })

  // SEO-01: Title tag
  test('title is "Kim Arvdalen | About"', async ({ page }) => {
    const title = await page.locator('head title').textContent()
    expect(title).toBe('Kim Arvdalen | About')
  })

  // SEO-01: Meta description
  test('meta description contains "Kim Arvdalen"', async ({ page }) => {
    const desc = await page.locator('meta[name="description"]').getAttribute('content')
    expect(desc).toContain('Kim Arvdalen')
  })

  // SEO-02: og:title
  test('og:title matches page title', async ({ page }) => {
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
    expect(ogTitle).toBe('Kim Arvdalen | About')
  })

  // SEO-02: og:description
  test('og:description contains "Kim Arvdalen"', async ({ page }) => {
    const ogDesc = await page.locator('meta[property="og:description"]').getAttribute('content')
    expect(ogDesc).toContain('Kim Arvdalen')
  })

  // SEO-02: og:image absent (photo_url is NULL for kim-arvdalen)
  test('og:image tag is absent (photo_url is NULL)', async ({ page }) => {
    const ogImage = page.locator('meta[property="og:image"]')
    await expect(ogImage).toHaveCount(0)
  })
})

// ── Au Pairs page: /kim-arvdalen/au-pairs ────────────────────────────────────

test.describe('SEO metadata: Au Pairs page (/kim-arvdalen/au-pairs)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/${SLUG}/au-pairs`)
  })

  // SEO-01: Title tag
  test('title is "Kim Arvdalen | Au Pairs"', async ({ page }) => {
    const title = await page.locator('head title').textContent()
    expect(title).toBe('Kim Arvdalen | Au Pairs')
  })

  // SEO-01: Meta description
  test('meta description contains "Kim Arvdalen"', async ({ page }) => {
    const desc = await page.locator('meta[name="description"]').getAttribute('content')
    expect(desc).toContain('Kim Arvdalen')
  })

  // SEO-02: og:title
  test('og:title matches page title', async ({ page }) => {
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
    expect(ogTitle).toBe('Kim Arvdalen | Au Pairs')
  })

  // SEO-02: og:description
  test('og:description contains "Kim Arvdalen"', async ({ page }) => {
    const ogDesc = await page.locator('meta[property="og:description"]').getAttribute('content')
    expect(ogDesc).toContain('Kim Arvdalen')
  })

  // SEO-02: og:image absent (photo_url is NULL for kim-arvdalen)
  test('og:image tag is absent (photo_url is NULL)', async ({ page }) => {
    const ogImage = page.locator('meta[property="og:image"]')
    await expect(ogImage).toHaveCount(0)
  })
})

// ── FAQ page: /kim-arvdalen/faq ───────────────────────────────────────────────

test.describe('SEO metadata: FAQ page (/kim-arvdalen/faq)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/${SLUG}/faq`)
  })

  // SEO-01: Title tag
  test('title is "Kim Arvdalen | FAQ"', async ({ page }) => {
    const title = await page.locator('head title').textContent()
    expect(title).toBe('Kim Arvdalen | FAQ')
  })

  // SEO-01: Meta description
  test('meta description contains "Kim Arvdalen"', async ({ page }) => {
    const desc = await page.locator('meta[name="description"]').getAttribute('content')
    expect(desc).toContain('Kim Arvdalen')
  })

  // SEO-02: og:title
  test('og:title matches page title', async ({ page }) => {
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
    expect(ogTitle).toBe('Kim Arvdalen | FAQ')
  })

  // SEO-02: og:description
  test('og:description contains "Kim Arvdalen"', async ({ page }) => {
    const ogDesc = await page.locator('meta[property="og:description"]').getAttribute('content')
    expect(ogDesc).toContain('Kim Arvdalen')
  })

  // SEO-02: og:image absent (photo_url is NULL for kim-arvdalen)
  test('og:image tag is absent (photo_url is NULL)', async ({ page }) => {
    const ogImage = page.locator('meta[property="og:image"]')
    await expect(ogImage).toHaveCount(0)
  })
})

// ── Testimonials page: /kim-arvdalen/testimonials ────────────────────────────

test.describe('SEO metadata: Testimonials page (/kim-arvdalen/testimonials)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/${SLUG}/testimonials`)
  })

  // SEO-01: Title tag
  test('title is "Kim Arvdalen | Testimonials"', async ({ page }) => {
    const title = await page.locator('head title').textContent()
    expect(title).toBe('Kim Arvdalen | Testimonials')
  })

  // SEO-01: Meta description
  test('meta description contains "Kim Arvdalen"', async ({ page }) => {
    const desc = await page.locator('meta[name="description"]').getAttribute('content')
    expect(desc).toContain('Kim Arvdalen')
  })

  // SEO-02: og:title
  test('og:title matches page title', async ({ page }) => {
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
    expect(ogTitle).toBe('Kim Arvdalen | Testimonials')
  })

  // SEO-02: og:description
  test('og:description contains "Kim Arvdalen"', async ({ page }) => {
    const ogDesc = await page.locator('meta[property="og:description"]').getAttribute('content')
    expect(ogDesc).toContain('Kim Arvdalen')
  })

  // SEO-02: og:image absent (photo_url is NULL for kim-arvdalen)
  test('og:image tag is absent (photo_url is NULL)', async ({ page }) => {
    const ogImage = page.locator('meta[property="og:image"]')
    await expect(ogImage).toHaveCount(0)
  })
})
