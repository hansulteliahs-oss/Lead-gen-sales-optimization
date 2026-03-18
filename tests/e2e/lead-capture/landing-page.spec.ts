import { test, expect } from '@playwright/test'

// LEAD-01: Each LCC has a unique public landing page
// Wave 0 stubs — skip until Plan 02-02 implements landing page
test.describe('Landing page', () => {
  test('GET /[lccSlug] returns 200 for known slug', async () => { test.skip(true, 'Wave 0 stub — not yet implemented') })
  test('GET /[lccSlug] returns 404 for unknown slug', async () => { test.skip(true, 'Wave 0 stub — not yet implemented') })
  test('Landing page displays LCC name in intro headline', async () => { test.skip(true, 'Wave 0 stub — not yet implemented') })
  test('Landing page is accessible without auth cookie', async () => { test.skip(true, 'Wave 0 stub — not yet implemented') })
})
