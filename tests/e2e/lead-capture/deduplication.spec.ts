import { test, expect } from '@playwright/test'

// LEAD-02 duplicate: silent upsert on same email + lcc
// Wave 0 stubs — skip until Plan 02-02 implements deduplication
test.describe('Duplicate form submission', () => {
  test('Submitting same email twice for same LCC shows thank-you page (no error)', async () => { test.skip(true, 'Wave 0 stub — not yet implemented') })
  test('Second submission does not double-create lead record', async () => { test.skip(true, 'Wave 0 stub — not yet implemented') })
})
