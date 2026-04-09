import type { Metadata } from 'next'
import { headers } from 'next/headers'
import FadeInSection from './FadeInSection'

const CULTURAL_CARE_URL =
  'https://www.culturalcare.com/lcc/karvdalen/?utm_source=ig&utm_medium=social&utm_content=link_in_bio#become-hf-form'

const KIM = {
  name: 'Kim Arvdalen',
  slug: 'kim-arvdalen',
  headline: 'Your Local Guide to Finding the Perfect Au Pair',
  subheadline:
    'I help families across the area discover the au pair program — a childcare solution that combines flexibility, cultural connection, and real affordability.',
  bio_teaser:
    "As a certified Local Childcare Consultant with Cultural Care Au Pair, I've spent years guiding families through the process of welcoming an au pair into their home. From your first question to your au pair's arrival, I'm here every step of the way — making a complex process feel personal and simple.",
  photo_url: null as string | null,
}

const TESTIMONIALS = [
  {
    family_name: 'The Martinez Family',
    quote:
      'Kim was an absolute lifesaver for us. She walked us through every step of the process with patience and warmth, and thanks to her guidance we found an au pair who has become like a member of our family.',
  },
  {
    family_name: 'Sarah T.',
    quote:
      'I was overwhelmed before I called Kim. Within an hour she had answered every question I had and made the whole thing feel totally doable. Highly recommend!',
  },
]

export async function generateMetadata(): Promise<Metadata> {
  const title = `${KIM.name} | Local Childcare Consultant`
  const description = `${KIM.name} is a certified Local Childcare Consultant with Cultural Care Au Pair, helping families in your area find flexible, affordable live-in childcare through the au pair program.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  }
}

export default function LandingPage() {
  const headersList = headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  const baseUrl = `${proto}://${host}`
  const pageUrl = `${baseUrl}/${KIM.slug}`

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${pageUrl}#person`,
        name: KIM.name,
        jobTitle: 'Local Childcare Consultant',
        description: KIM.bio_teaser,
        url: pageUrl,
        worksFor: {
          '@type': 'Organization',
          name: 'Cultural Care Au Pair',
        },
      },
      {
        '@type': 'LocalBusiness',
        '@id': `${pageUrl}#business`,
        name: `${KIM.name} | Local Childcare Consultant`,
        description:
          'Au pair placement consultant helping families find live-in childcare through the Cultural Care Au Pair program.',
        url: pageUrl,
        priceRange: '$$',
        employee: { '@id': `${pageUrl}#person` },
      },
    ],
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* 1. HERO */}
      <section
        data-testid="hero-section"
        className="bg-brand-surface min-h-screen flex items-center"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto px-6 py-16 w-full">
          {/* Photo column */}
          <div>
            <div className="w-full aspect-[3/4] rounded-2xl bg-white border border-brand-border flex items-center justify-center shadow-lg">
              <span className="text-6xl font-bold text-brand-primary">
                {KIM.name.charAt(0)}
              </span>
            </div>
          </div>

          {/* Text column */}
          <div className="flex flex-col justify-center gap-6">
            <p className="text-xs font-semibold text-brand-primary uppercase tracking-widest">
              Local Childcare Consultant
            </p>
            <h1 className="text-5xl font-extrabold text-brand-body leading-tight">
              {KIM.headline}
            </h1>
            <p className="text-lg text-brand-muted leading-relaxed">{KIM.subheadline}</p>
            <div>
              <a
                data-testid="hero-cta"
                href={CULTURAL_CARE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-brand-primary text-white font-semibold px-8 py-4 rounded-full text-lg hover:bg-brand-primaryHover transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT TEASER */}
      <FadeInSection>
        <section data-testid="about-teaser" className="bg-white py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-semibold text-brand-primary uppercase tracking-widest mb-3">About</p>
            <h2 className="text-3xl font-bold text-brand-body mb-5">
              Meet {KIM.name}
            </h2>
            <div className="border border-brand-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-brand-muted text-lg leading-relaxed mb-6">
                {KIM.bio_teaser}
              </p>
              <a
                href={`/${KIM.slug}/about`}
                className="inline-flex items-center gap-1 text-brand-primary font-semibold hover:text-brand-primaryHover transition-colors"
              >
                Read more <span aria-hidden>→</span>
              </a>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* 3. AU PAIRS TEASER */}
      <FadeInSection>
        <section data-testid="au-pairs-teaser" className="bg-brand-surface py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-semibold text-brand-primary uppercase tracking-widest mb-3">Au Pairs</p>
            <h2 className="text-3xl font-bold text-brand-body mb-5">
              How the Au Pair Program Works
            </h2>
            <div className="border border-brand-border rounded-2xl p-8 bg-white shadow-sm hover:shadow-md transition-shadow">
              <p className="text-brand-muted text-lg leading-relaxed mb-6">
                The au pair program offers families a live-in childcare partner who becomes part of the
                family — at a weekly cost that&apos;s often less than traditional daycare. It&apos;s
                flexible, cultural, and fully supported by Cultural Care Au Pair.
              </p>
              <a
                href={`/${KIM.slug}/au-pairs`}
                className="inline-flex items-center gap-1 text-brand-primary font-semibold hover:text-brand-primaryHover transition-colors"
              >
                Learn more <span aria-hidden>→</span>
              </a>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* 4. TESTIMONIALS SNIPPET */}
      <FadeInSection>
        <section className="bg-white py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs font-semibold text-brand-primary uppercase tracking-widest mb-3">Testimonials</p>
            <h2 className="text-3xl font-bold text-brand-body mb-8">
              What Families Are Saying
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={i}
                  data-testid={i === 0 ? 'testimonial-quote' : undefined}
                  className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
                >
                  <p className="text-4xl text-brand-primary opacity-30 font-serif leading-none mb-2">&ldquo;</p>
                  <blockquote className="text-brand-body italic leading-relaxed mb-4">
                    {t.quote}
                  </blockquote>
                  <p className="text-brand-primary font-semibold text-sm">— {t.family_name}</p>
                </div>
              ))}
            </div>
            <a
              href={`/${KIM.slug}/testimonials`}
              className="inline-flex items-center gap-1 text-brand-primary font-semibold hover:text-brand-primaryHover transition-colors"
            >
              See all <span aria-hidden>→</span>
            </a>
          </div>
        </section>
      </FadeInSection>

      {/* 5. GET STARTED CTA */}
      <FadeInSection>
        <section className="bg-brand-surface py-20 px-6">
          <div className="max-w-lg mx-auto text-center">
            <p className="text-xs font-semibold text-brand-primary uppercase tracking-widest mb-3">Get Started</p>
            <h2 className="text-3xl font-bold text-brand-body mb-4">
              Ready to Find Your Au Pair?
            </h2>
            <p className="text-brand-muted mb-8">
              Connect with {KIM.name} through the Cultural Care Au Pair program and take the first step toward flexible, affordable live-in childcare.
            </p>
            <a
              href={CULTURAL_CARE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-brand-primary text-white font-semibold px-10 py-4 rounded-full text-lg hover:bg-brand-primaryHover transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Get Started with Kim
            </a>
          </div>
        </section>
      </FadeInSection>
    </div>
  )
}
