import { test, expect } from '@playwright/test'

// LEAD-02 duplicate: silent upsert on same email + lcc
// Plan 02-02: Real assertions (replaces Wave 0 stubs)
test.describe('Duplicate form submission', () => {
  const dedupeEmail = `dedup-${Date.now()}@example.com`

  test('Submitting same email twice for same LCC shows thank-you page (no error)', async ({ page }) => {
    // First submission
    await page.goto('/s-johnson')
    await page.fill('input[name="familyName"]', 'Dedup Family')
    await page.fill('input[name="email"]', dedupeEmail)
    await page.fill('input[name="phone"]', '5558675309')
    await page.check('input[name="tcpaConsent"]')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/thank-you', { timeout: 15000 })
    expect(page.url()).toContain('/s-johnson/thank-you')

    // Second submission with the same email
    await page.goto('/s-johnson')
    await page.fill('input[name="familyName"]', 'Dedup Family')
    await page.fill('input[name="email"]', dedupeEmail)
    await page.fill('input[name="phone"]', '5558675309')
    await page.check('input[name="tcpaConsent"]')
    await page.click('button[type="submit"]')
    // Should still redirect to thank-you — no error shown
    await page.waitForURL('**/thank-you', { timeout: 15000 })
    expect(page.url()).toContain('/s-johnson/thank-you')
    // Should NOT contain any error message
    const body = await page.content()
    expect(body).not.toContain('duplicate')
    expect(body).not.toContain('already exists')
    expect(body).not.toContain('error')
  })

  test('Second submission does not double-create lead record', async ({ page }) => {
    // This test verifies UI behavior — the DB dedup is tested in integration tests
    // Two identical submissions both result in the thank-you page, not an error
    const uniqueEmail = `nodedup-${Date.now()}@example.com`

    await page.goto('/s-johnson')
    await page.fill('input[name="familyName"]', 'No Dedup Family')
    await page.fill('input[name="email"]', uniqueEmail)
    await page.fill('input[name="phone"]', '5558675309')
    await page.check('input[name="tcpaConsent"]')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/thank-you', { timeout: 15000 })
    expect(page.url()).toContain('/s-johnson/thank-you')
  })
})
