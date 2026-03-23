import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createAdminClient } from '@/utils/supabase/admin'

// AI-03: GET /api/leads/[id] response includes generated_intro_message field
describe('Leads API: GET /api/leads/[id] shape', () => {
  const supabase = createAdminClient()
  const testEmail = `leads-api-test-${Date.now()}@example.com`
  let testLccId: string
  let createdLeadId: string | undefined

  beforeAll(async () => {
    const { data: lcc } = await supabase.from('lccs').select('id').limit(1).single()
    if (!lcc) throw new Error('No LCC found in DB — run Phase 1 seed first')
    testLccId = lcc.id
  })

  afterAll(async () => {
    if (createdLeadId) {
      await supabase.from('leads').delete().eq('id', createdLeadId)
    }
    await supabase.from('leads').delete().eq('email', testEmail).eq('lcc_id', testLccId)
  })

  it.skip('Wave 0 stub — implement in Plan 02: AI-03 GET response includes generated_intro_message')
})
