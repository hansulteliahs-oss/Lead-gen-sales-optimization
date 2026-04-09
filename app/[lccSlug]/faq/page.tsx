import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { createAdminClient } from '@/utils/supabase/admin'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

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
    .select('id, name, slug')
    .eq('slug', params.lccSlug)
    .single()

  if (!lcc) notFound()

  const { data: faqs } = await supabase
    .from('lcc_faqs')
    .select('id, question, answer')
    .eq('lcc_id', lcc.id)
    .order('order_index', { ascending: true })

  const items = faqs ?? []

  const headersList = headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  const baseUrl = `${proto}://${host}`
  const rootUrl = `${baseUrl}/${params.lccSlug}`

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      ...(items.length > 0
        ? [
            {
              '@type': 'FAQPage',
              mainEntity: items.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: { '@type': 'Answer', text: faq.answer },
              })),
            },
          ]
        : []),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: lcc.name, item: rootUrl },
          { '@type': 'ListItem', position: 2, name: 'FAQ', item: `${rootUrl}/faq` },
        ],
      },
    ],
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Hero banner */}
      <section className="bg-brand-surface py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold text-brand-primary uppercase tracking-widest mb-3">FAQ</p>
          <h1 className="text-4xl font-extrabold text-brand-body">Frequently Asked Questions</h1>
          <p className="text-brand-muted mt-2 text-lg">Answers from {lcc.name}, your Local Childcare Consultant.</p>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          {items.length === 0 ? (
            <p className="text-brand-muted">No FAQs yet — check back soon.</p>
          ) : (
            <Accordion type="single" collapsible>
              {items.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger className="text-left text-base">{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-surface py-16 px-6">
        <div className="max-w-lg mx-auto text-center bg-white rounded-2xl border border-brand-border shadow-sm p-10">
          <h2 className="text-2xl font-bold text-brand-body mb-3">Still have questions?</h2>
          <p className="text-brand-muted mb-6">
            Reach out and {lcc.name} will be happy to help.
          </p>
          <a
            href={`/${lcc.slug}/#form`}
            className="inline-block bg-brand-primary text-white font-semibold px-8 py-3.5 rounded-full hover:bg-brand-primaryHover transition-colors"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </div>
  )
}
