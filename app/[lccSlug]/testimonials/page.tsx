import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
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
    .select('id, name, slug')
    .eq('slug', params.lccSlug)
    .single()

  if (!lcc) notFound()

  const { data: testimonials } = await supabase
    .from('lcc_testimonials')
    .select('id, family_name, quote')
    .eq('lcc_id', lcc.id)
    .order('order_index', { ascending: true })

  const items = testimonials ?? []

  const headersList = headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  const baseUrl = `${proto}://${host}`
  const rootUrl = `${baseUrl}/${params.lccSlug}`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: lcc.name, item: rootUrl },
      { '@type': 'ListItem', position: 2, name: 'Testimonials', item: `${rootUrl}/testimonials` },
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
          <p className="text-xs font-semibold text-brand-primary uppercase tracking-widest mb-3">Testimonials</p>
          <h1 className="text-4xl font-extrabold text-brand-body">What Families Are Saying</h1>
          <p className="text-brand-muted mt-2 text-lg">Real stories from families {lcc.name} has helped.</p>
        </div>
      </section>

      {/* Testimonial card grid */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          {items.length === 0 ? (
            <p className="text-brand-muted">Testimonials coming soon.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
                >
                  <p className="text-5xl text-brand-primary opacity-20 font-serif leading-none mb-2 select-none">
                    &ldquo;
                  </p>
                  <blockquote className="text-brand-body italic leading-relaxed mb-4">
                    {testimonial.quote}
                  </blockquote>
                  <p className="text-brand-primary font-semibold text-sm">
                    — {testimonial.family_name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-surface py-16 px-6">
        <div className="max-w-lg mx-auto text-center bg-white rounded-2xl border border-brand-border shadow-sm p-10">
          <h2 className="text-2xl font-bold text-brand-body mb-3">Ready to get started?</h2>
          <p className="text-brand-muted mb-6">
            Join the families {lcc.name} has helped find their perfect au pair.
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
