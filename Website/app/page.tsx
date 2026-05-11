import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Image from 'next/image'
import FadeInSection from './FadeInSection'

const CULTURAL_CARE_URL =
  'https://www.culturalcare.com/lcc/karvdalen/?utm_source=ig&utm_medium=social&utm_content=link_in_bio#become-hf-form'

const KIM = {
  name: 'Kim Arvdalen',
  headline: "Newport Beach's Guide to Finding the Perfect Au Pair",
  subheadline:
    'I help families in Newport Beach, Costa Mesa, and across Southern California discover the au pair program — a childcare solution that combines flexibility, cultural connection, and real affordability.',
  bio_teaser:
    "As a certified Local Childcare Consultant with Cultural Care Au Pair, I've spent years guiding families through the process of welcoming an au pair into their home. From your first question to your au pair's arrival, I'm here every step of the way — making a complex process feel personal and simple.",
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
  const title = `${KIM.name} | Au Pair Consultant — Newport Beach & Costa Mesa, CA`
  const description = `${KIM.name} helps families in Newport Beach, Costa Mesa, Huntington Beach, Irvine, and across Southern California find affordable live-in childcare through the Cultural Care Au Pair program.`

  return {
    title,
    description,
    alternates: { canonical: '/' },
    openGraph: { title, description, type: 'website', images: ['/og-default.png'] },
  }
}

export default function LandingPage() {
  const headersList = headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  const baseUrl = `${proto}://${host}`
  const pageUrl = baseUrl

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
        worksFor: { '@type': 'Organization', name: 'Cultural Care Au Pair' },
        sameAs: [
          'https://www.linkedin.com/in/kim-arvdalen-b894ab13/',
          'https://www.facebook.com/kim.arvdalen/',
        ],
      },
      {
        '@type': 'LocalBusiness',
        '@id': `${pageUrl}#business`,
        name: 'The Au Pair Childcare Consultant',
        alternateName: `${KIM.name}, Local Childcare Consultant`,
        description:
          `${KIM.name} is a certified Local Childcare Consultant with Cultural Care Au Pair, helping families in Newport Beach, Orange County, and throughout Southern California find flexible, affordable live-in childcare. Kim guides families from their first inquiry through their au pair's arrival.`,
        url: pageUrl,
        telephone: '+17145100002',
        priceRange: '$$',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Newport Beach',
          addressRegion: 'CA',
          postalCode: '92627',
          addressCountry: 'US',
        },
        geo: { '@type': 'GeoCoordinates', latitude: 33.6189, longitude: -117.9289 },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: [
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday',
            ],
            opens: '09:00',
            closes: '17:00',
          },
        ],
        areaServed: [
          'Newport Beach, CA', 'Costa Mesa, CA', 'Huntington Beach, CA', 'Irvine, CA',
          'Tustin, CA', 'Laguna Beach, CA', 'Dana Point, CA', 'Laguna Niguel, CA',
          'Mission Viejo, CA', 'Los Angeles, CA', 'Santa Monica, CA', 'West Hollywood, CA',
          'San Diego, CA', 'La Jolla, CA',
        ],
        serviceArea: {
          '@type': 'GeoCircle',
          geoMidpoint: { '@type': 'GeoCoordinates', latitude: 33.6189, longitude: -117.9289 },
          geoRadius: '160000',
        },
        sameAs: [
          'https://www.linkedin.com/in/kim-arvdalen-b894ab13/',
          'https://www.facebook.com/kim.arvdalen/',
          'https://www.instagram.com/theaupairchildcareconsultant/',
        ],
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

      {/* HERO */}
      <section data-testid="hero-section" className="pt-20 md:pt-28 pb-20 md:pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[7fr_3fr] gap-10 md:gap-16 items-end">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-brand-bark leading-relaxed">
                <div>Local Childcare Consultant</div>
                <div>Newport Beach &middot; Cultural Care Au Pair</div>
              </div>
              <h1 className="opsz-display font-light mt-4 text-[clamp(2.75rem,7vw,6rem)] leading-[0.96] tracking-[-0.025em] text-brand-ink text-balance">
                {KIM.headline}
              </h1>
              <p className="opsz-body mt-9 max-w-[56ch] text-xl leading-relaxed text-brand-ink-soft">
                {KIM.subheadline}
              </p>
              <p className="opsz-small mt-4 text-sm text-brand-bark">
                Serving Newport Beach &middot; Costa Mesa &middot; Huntington Beach &middot; Irvine &middot; Laguna Beach &middot; greater SoCal
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-6">
                <a
                  data-testid="hero-cta"
                  href={CULTURAL_CARE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-brand-ink text-brand-paper px-7 py-3.5 rounded font-medium text-base hover:bg-brand-spot-deep transition-colors duration-200 ease-out-quart"
                >
                  Start with Cultural Care
                </a>
                <span className="text-sm text-brand-ink-soft">
                  <span className="text-brand-spot-deep">→ </span>
                  Or read on for what an au pair actually costs.
                </span>
              </div>
            </div>
            <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-brand-bark leading-relaxed text-right hidden md:block">
              <div>Issue 01</div>
              <div>Newport Beach, CA</div>
              <div>Available now</div>
            </div>
          </div>
        </div>
      </section>

      {/* PLATE I — arrival day */}
      <FadeInSection>
        <section className="pb-14 md:pb-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6 md:gap-16">
              <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-brand-bark pt-3.5">§ Plate I</div>
              <figure className="max-w-md">
                <Image
                  src="/photos/welcome-home.jpg"
                  alt="A host family welcomes their new au pair home with a hand-drawn 'Welcome to our family and the USA' sign."
                  width={640}
                  height={428}
                  sizes="(min-width: 768px) 448px, 100vw"
                  className="w-full h-auto rounded-sm"
                  priority
                />
                <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.08em] text-brand-bark">
                  Arrival day &middot; A host family meets their new au pair
                </figcaption>
              </figure>
            </div>
          </div>
        </section>
      </FadeInSection>

      <div className="max-w-6xl mx-auto px-6">
        <div className="border-t border-brand-ink-rule" />
      </div>

      {/* ABOUT TEASER */}
      <FadeInSection>
        <section data-testid="about-teaser" className="py-14 md:py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6 md:gap-16">
              <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-brand-bark pt-3.5">§ About</div>
              <div>
                <h2 className="opsz-title font-normal text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.05] tracking-[-0.02em] text-brand-ink mb-7 text-balance">
                  Meet {KIM.name}.
                </h2>
                <p className="opsz-body text-[1.2rem] leading-[1.65] text-brand-ink-soft max-w-[64ch]">
                  {KIM.bio_teaser}
                </p>
                <a
                  href="/about"
                  className="inline-block mt-4 font-medium text-brand-spot-deep border-b border-brand-spot-deep pb-0.5 hover:text-brand-ink hover:border-brand-ink transition-colors duration-200 ease-out-quart"
                >
                  Read more →
                </a>
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      <div className="max-w-6xl mx-auto px-6">
        <div className="border-t border-brand-ink-rule" />
      </div>

      {/* AU PAIRS — cost-forward editorial block */}
      <FadeInSection>
        <section data-testid="au-pairs-teaser" className="py-14 md:py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6 md:gap-16">
              <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-brand-bark pt-3.5">§ Au Pairs</div>
              <div>
                <h2 className="opsz-title font-normal text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.05] tracking-[-0.02em] text-brand-ink mb-7 text-balance">
                  What it actually costs.
                </h2>
                <p className="opsz-body text-[1.2rem] leading-[1.65] text-brand-ink-soft max-w-[64ch]">
                  The weekly stipend paid to your au pair is set by federal law and isn&apos;t negotiable. The program fee is paid once, to Cultural Care. Together, for a family with two or more kids, the math typically beats full-time daycare in this area.
                </p>

                <div className="mt-7 grid grid-cols-1 md:grid-cols-2 border-t border-b border-brand-ink-rule">
                  <div className="py-5 pr-6 md:pr-7 md:border-r border-b md:border-b-0 border-brand-ink-rule">
                    <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-brand-bark">
                      Weekly stipend
                    </div>
                    <div className="font-mono font-semibold text-2xl md:text-[1.75rem] text-brand-ink mt-2 tracking-tight">
                      $195.75
                    </div>
                    <div className="opsz-small text-sm text-brand-ink-soft mt-1.5">
                      Federally set. Paid directly to your au pair.
                    </div>
                  </div>
                  <div className="py-5 md:pl-7">
                    <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-brand-bark">
                      Annual program total
                    </div>
                    <div className="font-mono font-semibold text-2xl md:text-[1.75rem] text-brand-ink mt-2 tracking-tight">
                      $20–30k
                    </div>
                    <div className="opsz-small text-sm text-brand-ink-soft mt-1.5">
                      All-in. Often less than OC daycare for two kids.
                    </div>
                  </div>
                </div>

                <a
                  href="/au-pairs"
                  className="inline-block mt-7 font-medium text-brand-spot-deep border-b border-brand-spot-deep pb-0.5 hover:text-brand-ink hover:border-brand-ink transition-colors duration-200 ease-out-quart"
                >
                  See full breakdown →
                </a>
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* PULL-QUOTE TESTIMONIAL */}
      <FadeInSection>
        <section className="py-20 md:py-24">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
            {TESTIMONIALS.map((t, i) => (
              <figure
                key={i}
                data-testid={i === 0 ? 'testimonial-quote' : undefined}
              >
                <blockquote className="opsz-headline font-normal italic text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.18] tracking-[-0.012em] text-brand-ink text-balance">
                  <span className="not-italic font-light text-brand-spot mr-1">“</span>
                  {t.quote}
                </blockquote>
                <figcaption className="mt-6 font-mono text-xs uppercase tracking-[0.08em] text-brand-bark">
                  — {t.family_name}
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="max-w-6xl mx-auto px-6 mt-10">
            <a
              href="/testimonials"
              className="inline-block font-medium text-brand-spot-deep border-b border-brand-spot-deep pb-0.5 hover:text-brand-ink hover:border-brand-ink transition-colors duration-200 ease-out-quart"
            >
              See all →
            </a>
          </div>
        </section>
      </FadeInSection>

      {/* CTA */}
      <FadeInSection>
        <section className="border-t border-brand-ink-rule py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-end">
            <h2 className="opsz-headline font-light text-[clamp(2.5rem,5.5vw,4.25rem)] leading-[1.0] tracking-[-0.025em] text-brand-ink text-balance">
              Talk to a real person, not a form.
            </h2>
            <div>
              <p className="opsz-body text-lg text-brand-ink-soft max-w-[50ch] mb-7">
                Sign up through Cultural Care and you&apos;ll be connected with {KIM.name} directly. We&apos;ll figure out together if this is right for your family.
              </p>
              <a
                href={CULTURAL_CARE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-brand-ink text-brand-paper px-8 py-4 rounded font-medium text-base hover:bg-brand-spot-deep transition-colors duration-200 ease-out-quart"
              >
                Sign up with Kim
              </a>
            </div>
          </div>
        </section>
      </FadeInSection>
    </div>
  )
}
