import { test, expect } from '@playwright/test'

test('AUTH-04: unauthenticated request to /operator/dashboard redirects to /login', async ({ page }) => {
  // Use a fresh context with no session cookies
  await page.goto('/operator/dashboard')
  await expect(page).toHaveURL('/login', { timeout: 5_000 })
})

test('AUTH-04: unauthenticated request to /lcc/dashboard redirects to /login', async ({ page }) => {
  await page.goto('/lcc/dashboard')
  await expect(page).toHaveURL('/login', { timeout: 5_000 })
})
