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

  const title = `${lcc.name} | FAQ`
  const description = `Common questions families ask about the au pair program, answered by ${lcc.name} — your Local Childcare Consultant.`

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

export default async function FAQPage({ params }: Props) {
  const supabase = createAdminClient()
  const { data: lcc } = await supabase
    .from('lccs')
    .select('id, name')
    .eq('slug', params.lccSlug)
    .single()

  if (!lcc) notFound()

  const { data: faqs } = await supabase
    .from('lcc_faqs')
    .select('id, question, answer')
    .eq('lcc_id', lcc.id)
    .order('order_index', { ascending: true })

  const items = faqs ?? []

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold text-brand-body mb-8">
        Frequently Asked Questions
      </h1>
      {items.length === 0 ? (
        <p className="text-brand-muted">No FAQs yet — check back soon.</p>
      ) : (
        <ul className="space-y-8">
          {items.map((faq) => (
            <li key={faq.id}>
              <h2 className="text-lg font-semibold text-brand-body mb-2">{faq.question}</h2>
              <p className="text-brand-muted leading-relaxed">{faq.answer}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
