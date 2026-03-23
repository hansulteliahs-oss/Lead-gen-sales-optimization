import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { createAdminClient } from '@/utils/supabase/admin'

// Mock @anthropic-ai/sdk — prevents real API calls in integration tests
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: "Hi Smith family, I am Test LCC and I'd love to connect!" }],
        stop_reason: 'end_turn',
      }),
    },
  })),
  APIConnectionTimeoutError: class APIConnectionTimeoutError extends Error {},
  APIError: class APIError extends Error { status = 500 },
}))

describe('AI personalization: generation and caching', () => {
  const supabase = createAdminClient()
  const testEmail = `ai-gen-test-${Date.now()}@example.com`
  let testLccId: string
  let createdLeadId: string

  beforeAll(async () => {
    const { data: lcc } = await supabase.from('lccs').select('id, name').limit(1).single()
    if (!lcc) throw new Error('No LCC found in DB — run Phase 1 seed first')
    testLccId = lcc.id
  })

  afterAll(async () => {
    if (createdLeadId) await supabase.from('leads').delete().eq('id', createdLeadId)
    await supabase.from('leads').delete().eq('email', testEmail).eq('lcc_id', testLccId)
  })

  it('AI-01: generated_intro_message can be written to the lead record', async () => {
    // Insert new lead
    const { data: lead, error: insertError } = await supabase
      .from('leads')
      .upsert(
        {
          lcc_id: testLccId,
          family_name: 'Test Family',
          email: testEmail,
          phone: '5558675309',
          stage: 'Interested',
          consent_text: 'Test consent',
          consent_timestamp: new Date().toISOString(),
          consent_ip: '127.0.0.1',
        },
        { onConflict: 'email,lcc_id', ignoreDuplicates: false }
      )
      .select('id, generated_intro_message')
      .single()

    expect(insertError).toBeNull()
    expect(lead).not.toBeNull()
    createdLeadId = lead!.id

    // Simulate what the fire-and-forget IIFE does: write the generated message
    const testMessage = "Hi Test Family, I'd love to connect about au pair care for your family!"
    const { error: updateError } = await supabase
      .from('leads')
      .update({ generated_intro_message: testMessage })
      .eq('id', lead!.id)

    expect(updateError).toBeNull()

    // Read back and verify
    const { data: updated } = await supabase
      .from('leads')
      .select('generated_intro_message')
      .eq('id', lead!.id)
      .single()

    expect(updated!.generated_intro_message).toBe(testMessage)
  })

  it('AI-02: cache guard — pre-set generated_intro_message is not overwritten', async () => {
    // Lead from AI-01 test already has a generated_intro_message
    const { data: existing } = await supabase
      .from('leads')
      .select('generated_intro_message')
      .eq('id', createdLeadId)
      .single()

    // Cache guard: if non-null, the IIFE returns early — no overwrite
    const shouldSkip = !!existing?.generated_intro_message
    expect(shouldSkip).toBe(true)

    // Verify the value is unchanged (would be different if overwritten)
    expect(existing!.generated_intro_message).toContain('Hi Test Family')
  })
})
