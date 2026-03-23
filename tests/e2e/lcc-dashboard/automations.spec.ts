import { test, expect } from '@playwright/test'

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

    // Navigate to a lead detail page — automations-section lives on /lcc/dashboard/leads/[id]
    await expect(page.getByTestId('lead-card').first()).toBeVisible()
    await page.getByTestId('lead-card').first().click()
    await expect(page).toHaveURL(/\/lcc\/dashboard\/leads\//, { timeout: 10_000 })

    const automationsSection = page.getByTestId('automations-section')
    await expect(automationsSection).toBeVisible()

    // Webhook status rows show text — no data-testid on child elements
    await expect(automationsSection).toContainText(/Webhook configured|Not configured/)
  })
})
