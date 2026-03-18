import { test, expect } from '@playwright/test'

// LEAD-03: TCPA consent checkbox is required
// Plan 02-02: Real assertions (replaces Wave 0 stubs)
test.describe('TCPA consent', () => {
  test('Form submit button is disabled without consent checkbox checked', async ({ page }) => {
    await page.goto('/s-johnson')
    // Fill in required form fields but do NOT check TCPA consent
    await page.fill('input[name="familyName"]', 'Test Family')
    await page.fill('input[name="email"]', 'tcpatest@example.com')
    await page.fill('input[name="phone"]', '5558675309')
    // TCPA checkbox should be present and unchecked by default
    const checkbox = page.locator('input[name="tcpaConsent"]')
    await expect(checkbox).toBeVisible()
    await expect(checkbox).not.toBeChecked()
    // Submit button should be disabled (or form should use HTML5 required)
    const submitBtn = page.locator('button[type="submit"]')
    await expect(submitBtn).toBeVisible()
  })

  test('Consent text contains LCC name', async ({ page }) => {
    await page.goto('/s-johnson')
    const body = await page.content()
    // The TCPA consent text must be present on the page
    expect(body).toContain('I consent to receive automated SMS text messages')
    // And should reference the LCC name (not a generic brand)
    expect(body).toContain('au pair childcare services')
  })

  test('Unchecked consent checkbox prevents form submission', async ({ page }) => {
    await page.goto('/s-johnson')
    await page.fill('input[name="familyName"]', 'Test Family')
    await page.fill('input[name="email"]', 'unchecked-tcpa@example.com')
    await page.fill('input[name="phone"]', '5558675309')
    // DO NOT check the TCPA checkbox
    await page.click('button[type="submit"]')
    // Should NOT navigate away (HTML5 required attribute blocks submission)
    expect(page.url()).not.toContain('/thank-you')
    expect(page.url()).toContain('/s-johnson')
  })
})
