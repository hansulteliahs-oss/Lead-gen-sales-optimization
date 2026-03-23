import { test, expect } from '@playwright/test'

// Wave 0 stubs for DASH-02 (navigation + RLS 404 guard)
// Remove test.skip() when Wave 1 implementation is complete

async function loginAsLcc1(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'lcc1@test.com')
  await page.fill('input[name="password"]', 'password')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/lcc/dashboard', { timeout: 10_000 })
}

test.describe('Lead Detail Navigation (DASH-02)', () => {
  test.skip(true, 'Wave 0 stub — implementation pending')

  test('DASH-02: clicking a lead card navigates to /lcc/dashboard/leads/[uuid] and shows lead fields', async ({ page }) => {
    await loginAsLcc1(page)

    // Click first lead card in the pipeline view
    const firstLeadCard = page.getByTestId('lead-card').first()
    await expect(firstLeadCard).toBeVisible()
    await firstLeadCard.click()

    // URL should match the lead detail pattern
    await expect(page).toHaveURL(/\/lcc\/dashboard\/leads\/[0-9a-f-]+/, { timeout: 5_000 })

    // Lead detail fields should be visible
    await expect(page.getByTestId('lead-family-name')).toBeVisible()
    await expect(page.getByTestId('lead-email')).toBeVisible()
    await expect(page.getByTestId('lead-phone')).toBeVisible()
    await expect(page.getByTestId('lead-created-at')).toBeVisible()
  })

  test('DASH-02 RLS: lcc1 accessing a lcc2 lead gets a 404 page', async ({ page }) => {
    await loginAsLcc1(page)

    // TODO: replace with a known lcc2 lead UUID from seed data before running
    const lcc2LeadId = 'TODO: replace with seeded lcc2 lead ID'
    await page.goto(`/lcc/dashboard/leads/${lcc2LeadId}`)

    // Expect the Next.js 404 page (not-found)
    await expect(page).toHaveTitle(/404|Not Found/i, { timeout: 5_000 })
  })
})
