import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createAdminClient } from '@/utils/supabase/admin'

// LEAD-03 DB fields, LEAD-06 UTM, PIPE-01 stage, PIPE-03 fields, AUTO-06 webhook URLs
// Plan 02-02: Real assertions (replaces .todo stubs)
describe('Lead upsert DB behavior', () => {
  const supabase = createAdminClient()
  const testEmail = `lead-upsert-test-${Date.now()}@example.com`
  let testLccId: string
  let createdLeadId: string

  beforeAll(async () => {
    // Get a real LCC from the DB (seeded in Phase 1)
    const { data: lcc } = await supabase
      .from('lccs')
      .select('id')
      .limit(1)
      .single()
    if (!lcc) throw new Error('No LCC found in DB — run Phase 1 seed first')
    testLccId = lcc.id
  })

  afterAll(async () => {
    // Clean up test lead
    if (createdLeadId) {
      await supabase.from('leads').delete().eq('id', createdLeadId)
    }
    // Also clean up by email in case id wasn't captured
    await supabase.from('leads').delete().eq('email', testEmail).eq('lcc_id', testLccId)
  })

  it('New lead is created with stage = Interested', async () => {
    const { data, error } = await supabase
      .from('leads')
      .upsert(
        {
          lcc_id: testLccId,
          family_name: 'Test Family',
          email: testEmail,
          phone: '5558675309',
          stage: 'Interested',
          consent_text: 'I consent to receive automated SMS text messages and emails from Test LCC regarding au pair childcare services.',
          consent_timestamp: new Date().toISOString(),
          consent_ip: '127.0.0.1',
        },
        { onConflict: 'email,lcc_id', ignoreDuplicates: false }
      )
      .select('id, stage, created_at')
      .single()

    expect(error).toBeNull()
    expect(data).not.toBeNull()
    expect(data!.stage).toBe('Interested')
    createdLeadId = data!.id
  })

  it('Lead stores consent_text, consent_timestamp, consent_ip', async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('consent_text, consent_timestamp, consent_ip')
      .eq('email', testEmail)
      .eq('lcc_id', testLccId)
      .single()

    expect(error).toBeNull()
    expect(data!.consent_text).toContain('I consent to receive automated SMS text messages')
    expect(data!.consent_timestamp).toBeTruthy()
    expect(data!.consent_ip).toBe('127.0.0.1')
  })

  it('Lead stores utm_source, utm_medium, utm_campaign, utm_content (nullable)', async () => {
    // Update the lead with UTM fields
    const { error } = await supabase
      .from('leads')
      .update({
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'aupair-spring',
        utm_content: null,
      })
      .eq('email', testEmail)
      .eq('lcc_id', testLccId)

    expect(error).toBeNull()

    const { data } = await supabase
      .from('leads')
      .select('utm_source, utm_medium, utm_campaign, utm_content')
      .eq('email', testEmail)
      .eq('lcc_id', testLccId)
      .single()

    expect(data!.utm_source).toBe('google')
    expect(data!.utm_medium).toBe('cpc')
    expect(data!.utm_campaign).toBe('aupair-spring')
    expect(data!.utm_content).toBeNull()
  })

  it('Lead stores phone and message fields', async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('phone, message')
      .eq('email', testEmail)
      .eq('lcc_id', testLccId)
      .single()

    expect(error).toBeNull()
    expect(data!.phone).toBe('5558675309')
    // message can be null (optional field)
    expect(data!.message === null || typeof data!.message === 'string').toBe(true)
  })

  it('Duplicate submission (same email + lcc_id) upserts existing record', async () => {
    // Count rows before
    const { count: countBefore } = await supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('email', testEmail)
      .eq('lcc_id', testLccId)

    expect(countBefore).toBe(1)

    // Upsert again with same email + lcc_id
    const { error } = await supabase
      .from('leads')
      .upsert(
        {
          lcc_id: testLccId,
          family_name: 'Test Family Updated',
          email: testEmail,
          phone: '5559999999',
          stage: 'Interested',
          consent_text: 'Updated consent text.',
          consent_timestamp: new Date().toISOString(),
          consent_ip: '192.168.1.1',
        },
        { onConflict: 'email,lcc_id', ignoreDuplicates: false }
      )

    expect(error).toBeNull()

    // Count rows after — should still be 1
    const { count: countAfter } = await supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('email', testEmail)
      .eq('lcc_id', testLccId)

    expect(countAfter).toBe(1)
  })

  it('LCC row has webhook_url and referral_webhook_url columns', async () => {
    const { data, error } = await supabase
      .from('lccs')
      .select('webhook_url, referral_webhook_url, learn_more_url')
      .eq('id', testLccId)
      .single()

    expect(error).toBeNull()
    // Columns must exist (values can be null)
    expect('webhook_url' in data!).toBe(true)
    expect('referral_webhook_url' in data!).toBe(true)
    expect('learn_more_url' in data!).toBe(true)
  })
})
