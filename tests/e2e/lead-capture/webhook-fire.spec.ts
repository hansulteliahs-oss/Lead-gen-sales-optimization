import { test, expect } from '@playwright/test'

// LEAD-05: Make.com webhook fires on new lead
// Wave 0 stubs — skip until Plan 02-02 implements webhook trigger
test.describe('Make.com webhook trigger', () => {
  test('First submission fires webhook to LCC webhook_url', async () => { test.skip(true, 'Wave 0 stub — not yet implemented') })
  test('Duplicate (upsert) submission does NOT fire webhook', async () => { test.skip(true, 'Wave 0 stub — not yet implemented') })
})
