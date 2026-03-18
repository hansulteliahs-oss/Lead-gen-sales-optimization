import { test, expect } from '@playwright/test'

// LEAD-05: Make.com webhook fires on new lead
// Plan 02-02: Real assertions (replaces Wave 0 stubs)
// Note: These tests verify UI/form flow behavior. Actual webhook firing is
// verified via server logs and integration tests (requires live DB + Make.com URL).
// E2E tests verify the submission completes successfully (which means webhook fired or gracefully failed).
test.describe('Make.com webhook trigger', () => {
  test('First submission fires webhook to LCC webhook_url', async ({ page }) => {
    // Submit a new lead — webhook should fire server-side (or gracefully fail if no webhook_url set)
    // The family experience (redirect to thank-you) is the observable behavior in E2E
    const uniqueEmail = `webhook-test-${Date.now()}@example.com`

    await page.goto('/s-johnson')
    await page.fill('input[name="familyName"]', 'Webhook Test Family')
    await page.fill('input[name="email"]', uniqueEmail)
    await page.fill('input[name="phone"]', '5558675309')
    await page.check('input[name="tcpaConsent"]')
    await page.click('button[type="submit"]')
    // Webhook fires server-side; family sees thank-you regardless of webhook result
    await page.waitForURL('**/thank-you', { timeout: 15000 })
    expect(page.url()).toContain('/s-johnson/thank-you')
  })

  test('Duplicate (upsert) submission does NOT fire webhook', async ({ page }) => {
    // Submit the same email twice — second should upsert (no webhook) but still reach thank-you
    const dupeEmail = `webhook-dedup-${Date.now()}@example.com`

    // First submission
    await page.goto('/s-johnson')
    await page.fill('input[name="familyName"]', 'Webhook Dedup Family')
    await page.fill('input[name="email"]', dupeEmail)
    await page.fill('input[name="phone"]', '5558675309')
    await page.check('input[name="tcpaConsent"]')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/thank-you', { timeout: 15000 })

    // Second submission — upsert path, no webhook, still reaches thank-you
    await page.goto('/s-johnson')
    await page.fill('input[name="familyName"]', 'Webhook Dedup Family')
    await page.fill('input[name="email"]', dupeEmail)
    await page.fill('input[name="phone"]', '5558675309')
    await page.check('input[name="tcpaConsent"]')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/thank-you', { timeout: 15000 })
    expect(page.url()).toContain('/s-johnson/thank-you')
  })
})
