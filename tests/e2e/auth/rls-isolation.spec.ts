import { test, expect } from '@playwright/test'

// AUTH-05: Client SDK query verifies RLS cross-tenant isolation
// This test runs from the browser context (Playwright page.evaluate) to simulate real client behavior
test('AUTH-05: lcc1 client SDK query returns only lcc1 leads, not lcc2 leads', async ({ page }) => {
  // Login as lcc1
  await page.goto('/login')
  await page.fill('input[name="email"]', 'lcc1@test.com')
  await page.fill('input[name="password"]', 'password')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/lcc/dashboard', { timeout: 10_000 })

  // Query leads table from within the page context (browser client with lcc1 session)
  const leads = await page.evaluate(async () => {
    const { createBrowserClient } = await import('@supabase/ssr')
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )
    const { data, error } = await supabase.from('leads').select('*')
    return { data, error: error?.message }
  })

  // lcc1 should see exactly 3 leads (Smith, Johnson, Williams)
  expect(leads.error).toBeNull()
  expect(leads.data).toHaveLength(3)

  // lcc2 leads must NOT appear (Brown, Davis, Miller family names)
  const familyNames = leads.data!.map((l: { family_name: string }) => l.family_name)
  expect(familyNames).not.toContain('Brown Family')
  expect(familyNames).not.toContain('Davis Family')
  expect(familyNames).not.toContain('Miller Family')
})
