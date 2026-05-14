import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Image from 'next/image'

const APPLY_URL =
  'https://www.culturalcare.com/lcc/karvdalen/?utm_source=ig&utm_medium=social&utm_content=link_in_bio#become-hf-form'

const KIM = { name: 'Kim Arvdalen' }

type Profile = {
  name: string
  age: number
  country: string
  photo: string
  highlights: [string, string]
}

const PROFILES: Profile[] = [
  {
    name: 'Sofy',
    age: 21,
    country: 'Italy',
    photo: '/au-pairs/sofy.png',
    highlights: [
      '2,000+ hours childcare experience',
      'Competitive alpine skier',
    ],
  },
  {
    name: 'Amber',
    age: 22,
    country: 'South Africa',
    photo: '/au-pairs/amber.png',
    highlights: [
      'Special-needs experience',
      'Cares for younger brothers and cousins',
    ],
  },
  {
    name: 'Villemo',
    age: 19,
    country: 'South Africa',
    photo: '/au-pairs/villemo.png',
    highlights: [
      '2,000+ hours childcare experience',
      'Advanced English level',
    ],
  },
  {
    name: 'Franziska',
    age: 24,
    country: 'Germany',
    photo: '/au-pairs/franziska.png',
    highlights: [
      'Volunteer at a daycare for toddlers',
      'Licensed to drive since 2019',
    ],
  },
  {
    name: 'Braian',
    age: 22,
    country: 'Argentina',
    photo: '/au-pairs/braian.png',
    highlights: [
      'Advanced English level',
      'Loves singing, dancing & theater',
    ],
  },
  {
    name: 'Karla',
    age: 21,
    country: 'Mexico',
    photo: '/au-pairs/karla.png',
    highlights: [
      'Worked as a summer nanny',
      'Studies architecture',
    ],
  },
]

export async function generateMetadata(): Promise<Metadata> {
  const title = `Meet Au Pairs Open to Match | ${KIM.name} — Newport Beach, CA · Nationwide service`
  const description = `Browse au pair profiles from the Cultural Care program — childcare experience, languages, and interests at a glance. ${KIM.name} helps families nationwide find the right match.`
  return {
    title,
    description,
    alternates: { canonical: '/au-pairs' },
    openGraph: { title, description, type: 'website', images: ['/og-default.png'] },
  }
}

export default function AuPairsPage() {
  const headersList = headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  const baseUrl = `${proto}://${host}`
  const rootUrl = baseUrl

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: KIM.name, item: rootUrl },
          { '@type': 'ListItem', position: 2, name: 'Au Pairs', item: `${rootUrl}/au-pairs` },
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

      {/* HERO */}
      <section className="pt-20 md:pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6 md:gap-16">
            <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-brand-bark pt-3.5">§ Find an au pair</div>
            <div>
              <h1 className="opsz-headline font-light text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.0] tracking-[-0.025em] text-brand-ink text-balance">
                Meet au pairs ready to join your family.
              </h1>
              <p className="opsz-body mt-7 text-[1.2rem] leading-[1.65] text-brand-ink-soft max-w-[64ch]">
                Real candidates from the Cultural Care program — screened, trained, and looking for a host family in the U.S. Take a look at who&apos;s open to match.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6">
        <div className="border-t border-brand-ink-rule" />
      </div>

      {/* AU PAIR GRID */}
      <section className="py-14 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6 md:gap-16">
            <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-brand-bark pt-3.5">§ Open to match</div>
            <div>
              <h2 className="opsz-title font-normal text-[clamp(2rem,4.5vw,3rem)] leading-[1.05] tracking-[-0.02em] text-brand-ink mb-4 text-balance">
                Browse profiles.
              </h2>
              <p className="opsz-body text-[1.2rem] leading-[1.7] text-brand-ink-soft max-w-[64ch] mb-10">
                These au pairs are looking for a host family right now. Each one has been screened, trained, and is ready to start. Click through to begin your match.
              </p>

              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12">
                {PROFILES.map((p) => (
                  <li key={p.name} className="flex flex-col">
                    <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-brand-ink-rule">
                      <Image
                        src={p.photo}
                        alt={`${p.name}, age ${p.age}, from ${p.country}`}
                        fill
                        sizes="(min-width: 768px) 240px, (min-width: 640px) 45vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="mt-5">
                      <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-brand-bark">
                        {p.country}
                      </div>
                      <div className="opsz-title font-normal text-2xl text-brand-ink mt-1.5 tracking-tight">
                        {p.name}, {p.age}
                      </div>
                      <ul className="mt-4 space-y-1.5">
                        {p.highlights.map((h) => (
                          <li
                            key={h}
                            className="opsz-body text-[0.95rem] leading-[1.55] text-brand-ink-soft pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-brand-bark"
                          >
                            {h}
                          </li>
                        ))}
                      </ul>
                      <a
                        href={APPLY_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-6 font-mono text-[11px] uppercase tracking-[0.1em] text-brand-ink border-b border-brand-ink pb-1 hover:text-brand-spot-deep hover:border-brand-spot-deep transition-colors duration-200 ease-out-quart"
                      >
                        Click to view profile
                        <span aria-hidden="true">→</span>
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-brand-ink-rule py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-end">
          <h2 className="opsz-headline font-light text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.0] tracking-[-0.025em] text-brand-ink text-balance">
            Ready to start your match?
          </h2>
          <div>
            <p className="opsz-body text-lg text-brand-ink-soft max-w-[50ch] mb-7">
              {KIM.name} will walk you through the next steps — no pressure, just a real conversation about your family.
            </p>
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
