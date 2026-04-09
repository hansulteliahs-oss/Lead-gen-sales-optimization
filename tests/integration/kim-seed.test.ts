import { describe, it, expect } from 'vitest'
import { createAdminClient } from '@/utils/supabase/admin'

// CONT-01: kim-arvdalen lccs row has non-null headline, subheadline, bio, bio_teaser
// CONT-02: At least 3 testimonials exist in lcc_testimonials for kim-arvdalen
// CONT-03: At least 5 FAQ entries exist in lcc_faqs for kim-arvdalen
// RED until migration 20260407000000_phase7_kim_seed.sql is applied

describe('Kim Arvdalen seed content', () => {
  it('CONT-01: kim-arvdalen has headline, subheadline, bio, bio_teaser', async () => {
    const supabase = createAdminClient()
    const { data: lcc, error } = await supabase
      .from('lccs')
      .select('headline, subheadline, bio, bio_teaser')
      .eq('slug', 'kim-arvdalen')
      .single()

    expect(error).toBeNull()
    expect(lcc).not.toBeNull()
    expect(lcc?.headline).not.toBeNull()
    expect(lcc?.subheadline).not.toBeNull()
    expect(lcc?.bio).not.toBeNull()
    expect(lcc?.bio_teaser).not.toBeNull()
  })

  it('CONT-02: kim-arvdalen has at least 3 testimonials', async () => {
    const supabase = createAdminClient()
    const { data: lcc } = await supabase
      .from('lccs')
      .select('id')
      .eq('slug', 'kim-arvdalen')
      .single()

    expect(lcc).not.toBeNull()

    const { data: testimonials, error } = await supabase
      .from('lcc_testimonials')
      .select('id')
      .eq('lcc_id', lcc!.id)

    expect(error).toBeNull()
    expect(testimonials).not.toBeNull()
    expect(testimonials!.length).toBeGreaterThanOrEqual(3)
  })

  it('CONT-03: kim-arvdalen has at least 5 FAQs', async () => {
    const supabase = createAdminClient()
    const { data: lcc } = await supabase
      .from('lccs')
      .select('id')
      .eq('slug', 'kim-arvdalen')
      .single()

    expect(lcc).not.toBeNull()

    const { data: faqs, error } = await supabase
      .from('lcc_faqs')
      .select('id')
      .eq('lcc_id', lcc!.id)

    expect(error).toBeNull()
    expect(faqs).not.toBeNull()
    expect(faqs!.length).toBeGreaterThanOrEqual(5)
  })
})
