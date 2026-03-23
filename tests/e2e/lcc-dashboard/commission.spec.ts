import { test, expect } from '@playwright/test'

// Wave 0 stubs for DASH-04 (commission section)
// Remove test.skip() when Wave 1 implementation is complete

async function loginAsLcc1(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'lcc1@test.com')
  await page.fill('input[name="password"]', 'password')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/lcc/dashboard', { timeout: 10_000 })
}

test.describe('Commission Section (DASH-04)', () => {
  test('DASH-04: commission section is visible with signed count and no dollar amounts', async ({ page }) => {
    await loginAsLcc1(page)

    // Commission section must be visible on the dashboard
    const commissionSection = page.getByTestId('commission-section')
    await expect(commissionSection).toBeVisible()

    // Signed count must be visible inside commission section
    const signedCount = commissionSection.getByTestId('signed-count')
    await expect(signedCount).toBeVisible()

    // Commission section must NOT show dollar amounts (operator-only view)
    const sectionText = await commissionSection.textContent()
    expect(sectionText).not.toContain('$')
  })
})
