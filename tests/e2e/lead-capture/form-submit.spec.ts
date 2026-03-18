import { test, expect } from '@playwright/test'

// LEAD-02: Required fields; LEAD-04: Lead created in Interested stage
// Wave 0 stubs — skip until Plan 02-02 implements lead capture form
test.describe('Lead capture form submission', () => {
  test('Submitting valid form redirects to /[lccSlug]/thank-you', async () => { test.skip(true, 'Wave 0 stub — not yet implemented') })
  test('Thank-you page displays LCC name', async () => { test.skip(true, 'Wave 0 stub — not yet implemented') })
  test('Thank-you page shows learn-more link when configured', async () => { test.skip(true, 'Wave 0 stub — not yet implemented') })
  test('Form submission without required fields shows validation error', async () => { test.skip(true, 'Wave 0 stub — not yet implemented') })
  test('Phone field requires 10-digit US format', async () => { test.skip(true, 'Wave 0 stub — not yet implemented') })
})
