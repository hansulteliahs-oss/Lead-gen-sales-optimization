import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { createAdminClient } from '@/utils/supabase/admin'

// Mock the entire @anthropic-ai/sdk — no real API calls in integration tests
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{ type: 'text', text: 'Hi Smith family, I am Test LCC and I would love to connect!' }],
          stop_reason: 'end_turn',
        }),
      },
    })),
  }
})

// AI-01: Claude generates personalized message written to leads.generated_intro_message
// AI-02: Duplicate lead submission does not call Claude again — cached field preserved
describe('AI personalization: generation and caching', () => {
  const supabase = createAdminClient()
  const testEmail = `ai-gen-test-${Date.now()}@example.com`
  let testLccId: string
  let createdLeadId: string

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

  it.skip(true, 'Wave 0 stub — implement in Plan 02: AI-01 generated_intro_message populated on new lead')
  it.skip(true, 'Wave 0 stub — implement in Plan 02: AI-02 duplicate lead does not overwrite cached message')
})
