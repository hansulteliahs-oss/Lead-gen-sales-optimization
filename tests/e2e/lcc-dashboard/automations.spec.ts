import { test, expect } from '@playwright/test'

// Wave 0 stubs for DASH-05 (automations section)
// Remove test.skip() when Wave 1 implementation is complete

async function loginAsLcc1(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'lcc1@test.com')
  await page.fill('input[name="password"]', 'password')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/lcc/dashboard', { timeout: 10_000 })
}

test.describe('Automations Section (DASH-05)', () => {
  test('DASH-05: automations section is visible with at least one webhook status indicator', async ({ page }) => {
    await loginAsLcc1(page)

    // Automations section must be visible on the dashboard
    const automationsSection = page.getByTestId('automations-section')
    await expect(automationsSection).toBeVisible()

    // At least one child element must indicate webhook status (configured or not configured)
    const children = automationsSection.locator('[data-testid]')
    const count = await children.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })
})
