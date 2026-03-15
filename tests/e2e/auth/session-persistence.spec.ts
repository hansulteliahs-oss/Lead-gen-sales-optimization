import { test, expect } from '@playwright/test'

test('AUTH-03: session persists across browser refresh', async ({ page }) => {
  // Login
  await page.goto('/login')
  await page.fill('input[name="email"]', 'lcc1@test.com')
  await page.fill('input[name="password"]', 'password')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/lcc/dashboard', { timeout: 10_000 })

  // Refresh — session should persist, not redirect to /login
  await page.reload()
  await expect(page).toHaveURL('/lcc/dashboard', { timeout: 5_000 })
  await expect(page).not.toHaveURL('/login')
})
