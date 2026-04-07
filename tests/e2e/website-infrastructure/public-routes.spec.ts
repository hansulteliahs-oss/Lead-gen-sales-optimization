import { test, expect } from '@playwright/test'

const SLUG = 'kim-johnson'
const SUB_PAGES = ['about', 'au-pairs', 'faq', 'testimonials']

test.describe('SITE-05: Public sub-routes accessible without auth', () => {
  for (const subPage of SUB_PAGES) {
    test(`/${SLUG}/${subPage} returns 200 without auth`, async ({ page }) => {
      const response = await page.goto(`/${SLUG}/${subPage}`)
      expect(response?.status()).toBe(200)
      // Should NOT be redirected to /login
      expect(page.url()).not.toContain('/login')
    })
  }

  test(`/${SLUG}/secret-admin redirects to /login (non-allowlisted path is gated)`, async ({ page }) => {
    await page.goto(`/${SLUG}/secret-admin`)
    await expect(page).toHaveURL('/login', { timeout: 5_000 })
  })
})
