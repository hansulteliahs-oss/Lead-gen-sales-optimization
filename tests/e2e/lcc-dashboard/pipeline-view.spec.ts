import { test, expect } from '@playwright/test'

// Wave 0 stubs for DASH-01 and DASH-03
// Remove test.skip() when Wave 1 implementation is complete

async function loginAsLcc1(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'lcc1@test.com')
  await page.fill('input[name="password"]', 'password')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/lcc/dashboard', { timeout: 10_000 })
}

test.describe('Pipeline View (DASH-01, DASH-03)', () => {
  test('DASH-01: shows all four pipeline stage columns after lcc1 login', async ({ page }) => {
    await loginAsLcc1(page)

    await expect(page.getByTestId('stage-Interested')).toBeVisible()
    await expect(page.getByTestId('stage-Contacted')).toBeVisible()
    await expect(page.getByTestId('stage-Qualified')).toBeVisible()
    await expect(page.getByTestId('stage-Signed')).toBeVisible()
  })

  test('DASH-03: each stage column shows a count badge with a number', async ({ page }) => {
    await loginAsLcc1(page)

    for (const stage of ['Interested', 'Contacted', 'Qualified', 'Signed']) {
      const stageSection = page.getByTestId(`stage-${stage}`)
      await expect(stageSection).toBeVisible()
      // Count badge should contain a numeric value (could be 0)
      const badge = stageSection.getByTestId('count-badge')
      const text = await badge.textContent()
      expect(text).toMatch(/^\d+$/)
    }
  })
})
