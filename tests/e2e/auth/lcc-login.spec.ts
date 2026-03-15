import { test, expect } from '@playwright/test'

test('AUTH-02: lcc1 logs in and reaches /lcc/dashboard', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'lcc1@test.com')
  await page.fill('input[name="password"]', 'password')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/lcc/dashboard', { timeout: 10_000 })
})

test('AUTH-02: lcc2 logs in and reaches /lcc/dashboard', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'lcc2@test.com')
  await page.fill('input[name="password"]', 'password')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/lcc/dashboard', { timeout: 10_000 })
})
