import type { Metadata } from 'next'
import { headers } from 'next/headers'

const APPLY_URL =
  'https://www.culturalcare.com/lcc/karvdalen/?utm_source=ig&utm_medium=social&utm_content=link_in_bio#become-hf-form'

const KIM = { name: 'Kim Arvdalen' }

const TESTIMONIALS = [
  {
    id: 't-0',
    family_name: 'The Martinez Family',
    location: 'Newport Beach',
    quote:
      'Kim was an absolute lifesaver for us. She walked us through every step of the process with patience and warmth, and thanks to her guidance we found an au pair who has become like a member of our family.',
  },
  {
    id: 't-1',
    family_name: 'Sarah T.',
    location: 'Costa Mesa',
    quote:
      'I was overwhelmed before I called Kim. Within an hour she had answered every question I had and made the whole thing feel totally doable. Highly recommend!',
  },
]

export async function generateMetadata(): Promise<Metadata> {
  const title = `Family Testimonials | ${KIM.name} — Newport Beach, CA · Nationwide service`
  const description = `Stories from families who found their au pair through ${KIM.name}, a Newport Beach–based Local Childcare Consultant serving families nationwide.`
  return {
    title,
    description,
    alternates: { canonical: '/testimonials' },
    openGraph: { title, description, type: 'website', images: ['/og-default.png'] },
  }
}

export default function TestimonialsPage() {
  const headersList = headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  const baseUrl = `${proto}://${host}`
  const rootUrl = baseUrl

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

      {/* HERO */}
      <section className="pt-20 md:pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6 md:gap-16">
            <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-brand-bark pt-3.5">§ Testimonials</div>
            <div>
              <h1 className="opsz-headline font-light text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.0] tracking-[-0.025em] text-brand-ink text-balance">
                Real stories from families {KIM.name.split(' ')[0]} has helped.
              </h1>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6">
        <div className="border-t border-brand-ink-rule" />
      </div>

      {/* PULL-QUOTE SERIES */}
      <section className="py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-6 flex flex-col gap-16 md:gap-24">
          {TESTIMONIALS.map((t, i) => (
            <figure
              key={t.id}
              className={i % 2 === 1 ? 'md:ml-[18%] md:max-w-[70%]' : 'md:max-w-[80%]'}
            >
              <blockquote className="opsz-headline font-normal italic text-[clamp(1.625rem,3.4vw,2.5rem)] leading-[1.18] tracking-[-0.012em] text-brand-ink text-balance">
                <span className="not-italic font-light text-brand-spot mr-1">“</span>
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 font-mono text-xs uppercase tracking-[0.08em] text-brand-bark">
                — {t.family_name} &middot; {t.location}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-brand-ink-rule py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-end">
          <h2 className="opsz-headline font-light text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.0] tracking-[-0.025em] text-brand-ink text-balance">
            Ready to start your story?
          </h2>
          <div>
            <a
              href={APPLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-brand-ink text-brand-paper px-8 py-4 rounded font-medium text-base hover:bg-brand-spot-deep transition-colors duration-200 ease-out-quart"
            >
              Get in touch
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
