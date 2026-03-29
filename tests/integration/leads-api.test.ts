import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createAdminClient } from '@/utils/supabase/admin'

describe('Leads API: GET /api/leads/[id] shape', () => {
  const supabase = createAdminClient()
  const testEmail = `leads-api-test-${Date.now()}@example.com`
  let testLccId: string
  let createdLeadId: string

  beforeAll(async () => {
    const { data: lcc } = await supabase.from('lccs').select('id').limit(1).single()
    if (!lcc) throw new Error('No LCC found in DB — run Phase 1 seed first')
    testLccId = lcc.id
  })

  afterAll(async () => {
    if (createdLeadId) await supabase.from('leads').delete().eq('id', createdLeadId)
    await supabase.from('leads').delete().eq('email', testEmail).eq('lcc_id', testLccId)
  })

  it('leads table SELECT returns expected columns', async () => {
    const { data: lead, error } = await supabase
      .from('leads')
      .upsert(
        {
          lcc_id: testLccId,
          family_name: 'API Test Family',
          email: testEmail,
          phone: '5551234567',
          stage: 'Interested',
          consent_text: 'Test consent',
          consent_timestamp: new Date().toISOString(),
          consent_ip: '127.0.0.1',
        },
        { onConflict: 'email,lcc_id', ignoreDuplicates: false }
      )
      .select('id')
      .single()

    expect(error).toBeNull()
    createdLeadId = lead!.id

    const { data: fetched, error: fetchError } = await supabase
      .from('leads')
      .select(`
        id,
        family_name,
        email,
        phone,
        message,
        stage,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        consent_timestamp,
        last_contacted_at,
        signed_at,
        created_at,
        lcc:lccs ( id, name, slug )
      `)
      .eq('id', lead!.id)
      .single()

    expect(fetchError).toBeNull()
    expect(fetched).not.toBeNull()
    expect(fetched!.id).toBe(createdLeadId)
  })
})
