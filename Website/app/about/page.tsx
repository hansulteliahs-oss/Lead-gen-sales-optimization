import type { Metadata } from 'next'
import { headers } from 'next/headers'

const CULTURAL_CARE_URL =
  'https://www.culturalcare.com/lcc/karvdalen/?utm_source=ig&utm_medium=social&utm_content=link_in_bio#become-hf-form'

const KIM = {
  name: 'Kim Arvdalen',
  bio: `I grew up in southern Sweden and first came to the US in my late teens on a cultural exchange program. Now, I live in Newport Beach with my two sons, ages 12 and 14.

I've successfully supported families with their childcare needs throughout Orange County since 2017. I relate to the au pair's experience of coming to the US as a young adult for the first time and adjusting to a new culture, language, and living situation. As a working mom, I also understand my families' needs for dependable childcare.

In my nine years as an au pair childcare coordinator, I've seen firsthand how transformative the au pair program can be for host families and au pairs. Most of my host families have grown with the program over the years. As a trusted resource in the au pair community, I know what it takes to create successful relationships and guide you through the process. As a passionate advocate for the program, I'll ensure you have the tools you need for a rewarding hosting experience.`,
}

export async function generateMetadata(): Promise<Metadata> {
  const title = `About ${KIM.name} | Newport Beach & Costa Mesa Au Pair Consultant`
  const description = `Learn about ${KIM.name}, a Local Childcare Consultant serving Newport Beach, Costa Mesa, and greater SoCal — and how she guides families through the au pair placement process.`
  return {
    title,
    description,
    alternates: { canonical: '/about' },
    openGraph: { title, description, type: 'website', images: ['/og-default.png'] },
  }
}

export default function AboutPage() {
  const headersList = headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  const baseUrl = `${proto}://${host}`
  const rootUrl = baseUrl

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${rootUrl}#person`,
        name: KIM.name,
        jobTitle: 'Local Childcare Consultant',
        description: KIM.bio,
        url: rootUrl,
        worksFor: { '@type': 'Organization', name: 'Cultural Care Au Pair' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: KIM.name, item: rootUrl },
          { '@type': 'ListItem', position: 2, name: 'About', item: `${rootUrl}/about` },
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
            <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-brand-bark pt-3.5">§ About</div>
            <div>
              <h1 className="opsz-headline font-light text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.0] tracking-[-0.025em] text-brand-ink text-balance">
                Hi, I&apos;m {KIM.name.split(' ')[0]}.
              </h1>
              <p className="opsz-small mt-4 text-sm text-brand-bark uppercase tracking-[0.08em] font-mono">
                Local Childcare Consultant &middot; Cultural Care Au Pair
              </p>
              <p className="opsz-small mt-1 text-sm text-brand-bark">
                Serving Newport Beach &middot; Costa Mesa &middot; Huntington Beach &middot; Irvine &middot; Laguna Beach &middot; greater SoCal
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6">
        <div className="border-t border-brand-ink-rule" />
      </div>

      {/* BIO */}
      <section className="py-14 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6 md:gap-16">
            <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-brand-bark pt-3.5">§ Bio</div>
            <div>
              <p
                data-testid="bio"
                className="opsz-body text-[1.2rem] leading-[1.7] text-brand-ink-soft max-w-[64ch] whitespace-pre-wrap"
              >
                {KIM.bio}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-brand-ink-rule py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-end">
          <h2 className="opsz-headline font-light text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.0] tracking-[-0.025em] text-brand-ink text-balance">
            Ready to talk it through?
          </h2>
          <div>
            <p className="opsz-body text-lg text-brand-ink-soft max-w-[50ch] mb-7">
              Reach out today and {KIM.name} will walk you through everything — no pressure, no script.
            </p>
            <a
              href={CULTURAL_CARE_URL}
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
