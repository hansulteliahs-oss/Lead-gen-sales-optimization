import { test, expect } from '@playwright/test'

// LEAD-03: TCPA consent checkbox is required
// Wave 0 stubs — skip until Plan 02-02 implements TCPA consent
test.describe('TCPA consent', () => {
  test('Form submit button is disabled without consent checkbox checked', async () => { test.skip(true, 'Wave 0 stub — not yet implemented') })
  test('Consent text contains LCC name', async () => { test.skip(true, 'Wave 0 stub — not yet implemented') })
  test('Unchecked consent checkbox prevents form submission', async () => { test.skip(true, 'Wave 0 stub — not yet implemented') })
})
