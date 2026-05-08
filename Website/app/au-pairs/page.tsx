import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Disclosure } from '@/components/ui/disclosure'

const CULTURAL_CARE_URL =
  'https://www.culturalcare.com/lcc/karvdalen/?utm_source=ig&utm_medium=social&utm_content=link_in_bio#become-hf-form'

const KIM = { name: 'Kim Arvdalen' }

const COMPARISON_ROWS: Array<[string, string, string]> = [
  ['Cost per week', '~$195.75 (federally set)', '$600–$1,500+ (market rate)'],
  ['Lives with family', 'Yes — live-in arrangement', 'Usually no'],
  ['Hours per week', 'Up to 45 hrs (regulated)', 'Varies by contract'],
  ['Cultural exchange', 'Yes — core program element', 'Not typically'],
  ['Agency support', 'Full matching, visa, LCC', 'Agency optional, extra cost'],
  ['Program duration', '12 months (extendable)', 'Open-ended'],
]

const MYTHS = [
  {
    myth: 'Au pairs are only for wealthy families.',
    reality:
      'The au pair program is often more affordable than full-time daycare or a private nanny, especially for families with two or more children. The federally regulated stipend keeps costs predictable.',
  },
  {
    myth: 'It is hard to find a good match.',
    reality:
      'Cultural Care Au Pair uses a thorough screening and matching process. You review profiles and interview candidates before committing — you are always in control of who joins your family.',
  },
  {
    myth: 'Having a live-in caregiver means no privacy.',
    reality:
      'Most host families find the arrangement works smoothly with clear expectations set upfront. Your LCC helps you navigate boundaries and house rules from day one.',
  },
  {
    myth: 'Au pairs can only care for older children.',
    reality:
      'Au pairs can care for children of all ages, including infants, as long as the au pair meets the infant care requirements set by Cultural Care (including specific experience hours with children under two).',
  },
]

export async function generateMetadata(): Promise<Metadata> {
  const title = `Au Pair Program Guide | ${KIM.name} — Newport Beach & Costa Mesa, CA`
  const description = `Everything Newport Beach, Costa Mesa, and Southern California families need to know about the au pair program — costs, matching, visa, and how it compares to a nanny.`
  return {
    title,
    description,
    alternates: { canonical: '/au-pairs' },
    openGraph: { title, description, type: 'website' },
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
        '@type': 'FAQPage',
        mainEntity: MYTHS.map((m) => ({
          '@type': 'Question',
          name: m.myth,
          acceptedAnswer: { '@type': 'Answer', text: m.reality },
        })),
      },
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
            <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-brand-bark pt-3.5">§ Au Pairs</div>
            <div>
              <h1 className="opsz-headline font-light text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.0] tracking-[-0.025em] text-brand-ink text-balance">
                Understanding the au pair program.
              </h1>
              <p className="opsz-body mt-7 text-[1.2rem] leading-[1.65] text-brand-ink-soft max-w-[64ch]">
                Flexible, affordable live-in childcare with a cultural-exchange dimension. Whether you have one child or four, an au pair can provide the consistent, personalized care your family needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6">
        <div className="border-t border-brand-ink-rule" />
      </div>

      {/* HOW IT WORKS */}
      <section className="py-14 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6 md:gap-16">
            <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-brand-bark pt-3.5">§ How it works</div>
            <div>
              <h2 className="opsz-title font-normal text-[clamp(2rem,4.5vw,3rem)] leading-[1.05] tracking-[-0.02em] text-brand-ink mb-7 text-balance">
                What an au pair actually is.
              </h2>
              <p className="opsz-body text-[1.2rem] leading-[1.7] text-brand-ink-soft max-w-[64ch]">
                Au pairs are young adults (ages 18–26) from abroad who live with a host family, providing up to 45 hours per week of childcare as part of a federally regulated cultural-exchange program. They become a true part of your family while sharing their language and culture with your children.
              </p>
              <p className="opsz-body text-[1.2rem] leading-[1.7] text-brand-ink-soft max-w-[64ch] mt-5">
                Cultural Care Au Pair matches families with candidates, manages the J-1 visa process, and provides year-round support. As your Local Childcare Consultant, I&apos;m your local point of contact through matching and the full year together.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6">
        <div className="border-t border-brand-ink-rule" />
      </div>

      {/* COSTS */}
      <section className="py-14 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6 md:gap-16">
            <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-brand-bark pt-3.5">§ Costs</div>
            <div>
              <h2 className="opsz-title font-normal text-[clamp(2rem,4.5vw,3rem)] leading-[1.05] tracking-[-0.02em] text-brand-ink mb-7 text-balance">
                The numbers, plainly.
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 border-t border-b border-brand-ink-rule">
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
                    All-in. Often less than full-time daycare in major cities.
                  </div>
                </div>
              </div>

              <p className="opsz-body text-[1.2rem] leading-[1.7] text-brand-ink-soft max-w-[64ch] mt-7">
                The program fee covers candidate matching, J-1 visa support, insurance, and twelve months of full coverage. The stipend is set by federal law and ensures fair compensation for every au pair in the program.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6">
        <div className="border-t border-brand-ink-rule" />
      </div>

      {/* AU PAIR vs NANNY */}
      <section className="py-14 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6 md:gap-16">
            <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-brand-bark pt-3.5">§ Au pair vs. nanny</div>
            <div>
              <h2 className="opsz-title font-normal text-[clamp(2rem,4.5vw,3rem)] leading-[1.05] tracking-[-0.02em] text-brand-ink mb-7 text-balance">
                Side by side.
              </h2>

              <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
                <table className="w-full text-sm border-collapse min-w-[34rem]">
                  <thead>
                    <tr className="border-y border-brand-ink-rule">
                      <th className="text-left py-3 pr-4 font-mono text-[11px] uppercase tracking-[0.08em] text-brand-bark font-medium">Feature</th>
                      <th className="text-left py-3 pr-4 font-mono text-[11px] uppercase tracking-[0.08em] text-brand-bark font-medium">Au pair</th>
                      <th className="text-left py-3 font-mono text-[11px] uppercase tracking-[0.08em] text-brand-bark font-medium">Nanny</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON_ROWS.map(([feature, aupair, nanny]) => (
                      <tr key={feature} className="border-b border-brand-ink-rule">
                        <td className="py-4 pr-4 font-medium text-brand-ink align-top">{feature}</td>
                        <td className="py-4 pr-4 text-brand-ink-soft align-top">{aupair}</td>
                        <td className="py-4 text-brand-ink-soft align-top">{nanny}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6">
        <div className="border-t border-brand-ink-rule" />
      </div>

      {/* MYTHS */}
      <section className="py-14 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6 md:gap-16">
            <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-brand-bark pt-3.5">§ Common questions</div>
            <div>
              <h2 className="opsz-title font-normal text-[clamp(2rem,4.5vw,3rem)] leading-[1.05] tracking-[-0.02em] text-brand-ink mb-2 text-balance">
                Things people get wrong.
              </h2>
              <div className="mt-6">
                {MYTHS.map((m) => (
                  <Disclosure
                    key={m.myth}
                    question={m.myth}
                    triggerClassName="text-lg"
                  >
                    {m.reality}
                  </Disclosure>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-brand-ink-rule py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-end">
          <h2 className="opsz-headline font-light text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.0] tracking-[-0.025em] text-brand-ink text-balance">
            Still have questions?
          </h2>
          <div>
            <p className="opsz-body text-lg text-brand-ink-soft max-w-[50ch] mb-7">
              {KIM.name} is happy to walk you through everything — no pressure.
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
