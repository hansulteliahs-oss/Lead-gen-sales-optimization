import { test, expect } from '@playwright/test'

const SUB_PAGES = ['about', 'au-pairs', 'faq', 'testimonials']

test.describe('SITE-05: Public sub-routes accessible without auth', () => {
  for (const subPage of SUB_PAGES) {
    test(`/${subPage} returns 200 without auth`, async ({ page }) => {
      const response = await page.goto(`/${subPage}`)
      expect(response?.status()).toBe(200)
      expect(page.url()).not.toContain('/login')
    })
  }
})
