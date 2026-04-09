import type { Metadata } from 'next'
import { headers } from 'next/headers'

const CULTURAL_CARE_URL =
  'https://www.culturalcare.com/lcc/karvdalen/?utm_source=ig&utm_medium=social&utm_content=link_in_bio#become-hf-form'

const KIM = { name: 'Kim Arvdalen', slug: 'kim-arvdalen' }

const TESTIMONIALS = [
  {
    id: 't-0',
    family_name: 'The Martinez Family',
    quote:
      'Kim was an absolute lifesaver for us. She walked us through every step of the process with patience and warmth, and thanks to her guidance we found an au pair who has become like a member of our family.',
  },
  {
    id: 't-1',
    family_name: 'Sarah T.',
    quote:
      'I was overwhelmed before I called Kim. Within an hour she had answered every question I had and made the whole thing feel totally doable. Highly recommend!',
  },
  {
    id: 't-2',
    family_name: 'The Nguyen Family',
    quote:
      "Having an au pair has opened our children's eyes to a whole new culture and language. Kim matched us with someone who fits our family perfectly, and the cultural exchange has been a gift we didn't expect.",
  },
]

export async function generateMetadata(): Promise<Metadata> {
  const title = `${KIM.name} | Testimonials`
  const description = `Read stories from families who worked with ${KIM.name} to welcome an au pair into their home and transform their childcare experience.`

  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
  }
}

export default function TestimonialsPage() {
  const headersList = headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  const baseUrl = `${proto}://${host}`
  const rootUrl = `${baseUrl}/${KIM.slug}`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: KIM.name, item: rootUrl },
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
          <p className="text-brand-muted mt-2 text-lg">Real stories from families {KIM.name} has helped.</p>
        </div>
      </section>

      {/* Testimonial card grid */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((testimonial) => (
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
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-surface py-16 px-6">
        <div className="max-w-lg mx-auto text-center bg-white rounded-2xl border border-brand-border shadow-sm p-10">
          <h2 className="text-2xl font-bold text-brand-body mb-3">Ready to get started?</h2>
          <p className="text-brand-muted mb-6">
            Join the families {KIM.name} has helped find their perfect au pair.
          </p>
          <a
            href={CULTURAL_CARE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-brand-primary text-white font-semibold px-8 py-3.5 rounded-full hover:bg-brand-primaryHover transition-colors"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </div>
  )
}
