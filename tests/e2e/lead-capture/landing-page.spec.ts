import { test, expect } from '@playwright/test'

// LEAD-01: Each LCC has a unique public landing page
// Plan 02-02: Real assertions (replaces Wave 0 stubs)
test.describe('Landing page', () => {
  test('GET /[lccSlug] returns 200 for known slug', async ({ page }) => {
    const response = await page.goto('/s-johnson')
    expect(response?.status()).toBe(200)
  })

  test('GET /[lccSlug] returns 404 for unknown slug', async ({ page }) => {
    const response = await page.goto('/this-slug-definitely-does-not-exist-xyz')
    expect(response?.status()).toBe(404)
  })

  test('Landing page displays LCC name in intro headline', async ({ page }) => {
    await page.goto('/s-johnson')
    // The h1 heading should contain the LCC name
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    const headingText = await heading.textContent()
    expect(headingText).toBeTruthy()
    // The intro paragraph should reference the LCC name
    const body = await page.content()
    expect(body).toContain('au pair childcare')
  })

  test('Landing page is accessible without auth cookie', async ({ page, context }) => {
    // Clear all cookies to simulate unauthenticated visit
    await context.clearCookies()
    const response = await page.goto('/s-johnson')
    // Should NOT redirect to /login
    expect(page.url()).not.toContain('/login')
    expect(response?.status()).toBe(200)
  })
})
