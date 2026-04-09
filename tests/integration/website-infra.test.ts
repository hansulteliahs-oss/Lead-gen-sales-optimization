import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createAdminClient } from '@/utils/supabase/admin'

// SITE-01: lccs table website content columns
// SITE-02: lcc_testimonials table with FK
// SITE-03: lcc_faqs table with FK
// SITE-04: lcc-photos storage bucket
// RED until migration 20260405000000 applied

describe('Website infrastructure schema', () => {
  const supabase = createAdminClient()
  let testLccId: string
  let testimonialId: string | null = null
  let faqId: string | null = null

  beforeAll(async () => {
    // Get Kim Arvdalen's LCC id from seed data
    const { data: lcc } = await supabase
      .from('lccs')
      .select('id')
      .eq('slug', 'kim-arvdalen')
      .single()

    if (!lcc) {
      // Fall back to any LCC if kim-arvdalen not found
      const { data: anyLcc } = await supabase
        .from('lccs')
        .select('id')
        .limit(1)
        .single()
      if (!anyLcc) throw new Error('No LCC found in DB — run Phase 1 seed first')
      testLccId = anyLcc.id
    } else {
      testLccId = lcc.id
    }
  })

  afterAll(async () => {
    // Clean up test testimonial
    if (testimonialId) {
      await supabase.from('lcc_testimonials').delete().eq('id', testimonialId)
    }
    // Clean up test FAQ
    if (faqId) {
      await supabase.from('lcc_faqs').delete().eq('id', faqId)
    }
  })

  it('SITE-01: lccs table has headline, subheadline, bio, bio_teaser, photo_url, custom_domain columns', async () => {
    // RED until migration 20260405000000 applied
    const { error } = await supabase
      .from('lccs')
      .select('headline, subheadline, bio, bio_teaser, photo_url, custom_domain')
      .limit(1)

    expect(error).toBeNull()
  })

  it('SITE-02: lcc_testimonials table exists with correct columns and FK constraint', async () => {
    // RED until migration 20260405000000 applied
    const { data, error } = await supabase
      .from('lcc_testimonials')
      .insert({
        lcc_id: testLccId,
        family_name: 'Test Family',
        quote: 'This is a test testimonial quote.',
        order_index: 0,
      })
      .select('id, lcc_id, family_name, quote, order_index, created_at')
      .single()

    expect(error).toBeNull()
    expect(data).not.toBeNull()
    expect(data!.family_name).toBe('Test Family')
    expect(data!.quote).toBe('This is a test testimonial quote.')
    expect(data!.order_index).toBe(0)
    expect(data!.lcc_id).toBe(testLccId)
    expect(data!.created_at).toBeTruthy()

    testimonialId = data!.id
  })

  it('SITE-03: lcc_faqs table exists with correct columns and FK constraint', async () => {
    // RED until migration 20260405000000 applied
    const { data, error } = await supabase
      .from('lcc_faqs')
      .insert({
        lcc_id: testLccId,
        question: 'What is an au pair?',
        answer: 'An au pair is a live-in childcare provider from abroad.',
        order_index: 0,
      })
      .select('id, lcc_id, question, answer, order_index, created_at')
      .single()

    expect(error).toBeNull()
    expect(data).not.toBeNull()
    expect(data!.question).toBe('What is an au pair?')
    expect(data!.answer).toBe('An au pair is a live-in childcare provider from abroad.')
    expect(data!.order_index).toBe(0)
    expect(data!.lcc_id).toBe(testLccId)
    expect(data!.created_at).toBeTruthy()

    faqId = data!.id
  })

  it('SITE-04: lcc-photos storage bucket exists and is public', async () => {
    // RED until migration 20260405000000 applied
    const { data, error } = await supabase.storage.getBucket('lcc-photos')

    expect(error).toBeNull()
    expect(data).not.toBeNull()
    expect(data!.public).toBe(true)
  })
})
