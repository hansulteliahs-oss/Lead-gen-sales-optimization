import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin'

interface Props {
  params: { lccSlug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createAdminClient()
  const { data: lcc } = await supabase
    .from('lccs')
    .select('name, photo_url')
    .eq('slug', params.lccSlug)
    .single()

  if (!lcc) return {}

  const title = `${lcc.name} | Testimonials`
  const description = `Read stories from families who worked with ${lcc.name} to welcome an au pair into their home and transform their childcare experience.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(lcc.photo_url ? { images: [{ url: lcc.photo_url }] } : {}),
    },
  }
}

export default async function TestimonialsPage({ params }: Props) {
  const supabase = createAdminClient()
  const { data: lcc } = await supabase
    .from('lccs')
    .select('id, name')
    .eq('slug', params.lccSlug)
    .single()

  if (!lcc) notFound()

  const { data: testimonials } = await supabase
    .from('lcc_testimonials')
    .select('id, family_name, quote')
    .eq('lcc_id', lcc.id)
    .order('order_index', { ascending: true })

  const items = testimonials ?? []

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold text-brand-body mb-8">
        What Families Are Saying
      </h1>
      {items.length === 0 ? (
        <p className="text-brand-muted">Testimonials coming soon.</p>
      ) : (
        <ul className="space-y-12">
          {items.map((testimonial) => (
            <li key={testimonial.id} className="border-l-4 border-brand-gold pl-6">
              <blockquote className="text-xl italic text-brand-body mb-3">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <p className="text-brand-muted text-sm">— {testimonial.family_name}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
