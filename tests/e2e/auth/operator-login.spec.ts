import { test, expect } from '@playwright/test'

test('AUTH-01: operator logs in and reaches /operator/dashboard', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'operator@lcc-lead-engine.com')
  await page.fill('input[name="password"]', 'password')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/operator/dashboard', { timeout: 10_000 })
})
