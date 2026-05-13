import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Disclosure } from '@/components/ui/disclosure'

const CULTURAL_CARE_URL =
  'https://www.culturalcare.com/lcc/karvdalen/?utm_source=ig&utm_medium=social&utm_content=link_in_bio#become-hf-form'

const KIM = { name: 'Kim Arvdalen' }

const FAQS = [
  {
    id: 'faq-0',
    question: 'What is an au pair?',
    answer:
      'An au pair is a young adult, ages 18–26, who lives with an American family and provides up to 45 hours of childcare per week as part of a cultural exchange. Regulated by the U.S. Department of State, au pairs come from 30+ countries on a legal visa, and share their language and culture while experiencing life in the U.S.',
  },
  {
    id: 'faq-1',
    question: 'How does the au pair program work?',
    answer:
      "Au pairs are between the ages of 18–26 and come to the US as part of a State Department Cultural Exchange program. They live with you as a member of the family, and provide childcare up to 45 hours per week / 10 hours per day. The au pair program offers families a wealth of cultural exchange benefits. It provides the opportunity to experience new languages and global traditions — from holidays and recipes to everyday routines — broadening children's perspective and sparking curiosity about the world around them.",
  },
  {
    id: 'faq-2',
    question: 'How long does it take to get an au pair?',
    answer:
      "The time it takes to get an au pair varies from family to family. As soon as an au pair matches with their future host family, our staff initiates the visa application process. Most au pairs looking for a host family are still living in their home countries and will need at least six to eight weeks to get their visa, complete the program's training, and prepare to leave. If you have an immediate need for childcare, there is a smaller number of au pairs already in the U.S., and they can arrive to your home much faster.",
  },
  {
    id: 'faq-3',
    question: 'What are the benefits of hosting an au pair?',
    answer:
      'Hosting an au pair offers flexible childcare on a schedule you decide; up to 45 hours per week (max 10 hours per day) of coverage; help with household chores related to the kids; an extra driver and homework helper; exposure to a new culture and a new language; and a lifelong global connection.',
    bullets: [
      'Flexible childcare on a schedule you decide',
      'Up to 45 hrs/week (max 10 hrs/day) of coverage',
      'Help with household chores related to the kids',
      'An extra driver and homework helper',
      'Exposure to a new culture and a new language',
      'A lifelong global connection',
    ],
  },
  {
    id: 'faq-4',
    question: "What's the difference between an au pair and a nanny?",
    answer:
      'Hosting an au pair offers greater flexibility and convenience than daycare, and is often more affordable than hiring a nanny. It also means welcoming a young adult from another country into your home as part of a meaningful, mutually enriching cultural exchange experience.',
    table: {
      headers: ['', 'Au Pair', 'Nanny', 'Daycare'],
      rows: [
        ['Monthly cost', '$1,785 (per family, not per child)', '$3,544 (increases per child)', '$788–$3,693 (increases per child)'],
        ['Hours & scheduling', 'Highly flexible', 'Somewhat flexible; typically 9–5', '9–5 only; inflexible after-hours'],
        ['Training', 'Certified, 200+ hours experience required; must complete Au Pair Training School', 'No formal training required', 'Licensed staff with relevant certifications'],
        ['Availability', 'High across the country', 'Limited; agencies have waitlists', 'Often long waitlists; varies by location'],
        ['Screening', 'Comprehensive multi-tiered process', 'Little to no screening', 'Varies'],
        ['Selection & search', 'Hundreds of options available', 'Typically few choices', 'Location-based availability'],
        ['Cultural exchange', 'Designed for cultural exchange', 'Not designed for exchange', 'Not designed for exchange'],
        ['Waitlist', 'None', 'None', 'Common'],
        ['Care style', 'Personalized', 'Personalized', 'Group care'],
        ['Childcare duties', 'Wide range including meal prep and laundry', 'Childcare only', 'Limited'],
      ],
    },
  },
]

export async function generateMetadata(): Promise<Metadata> {
  const title = `Au Pair FAQ | ${KIM.name} — Newport Beach, CA · Nationwide service`
  const description = `Answers to common questions from families nationwide about the au pair program, from ${KIM.name}, your Newport Beach–based Local Childcare Consultant.`
  return {
    title,
    description,
    alternates: { canonical: '/faq' },
    openGraph: { title, description, type: 'website', images: ['/og-default.png'] },
  }
}

export default function FAQPage() {
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
        mainEntity: FAQS.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
        areaServed: 'Newport Beach, Costa Mesa, Huntington Beach, Irvine, and Southern California',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: KIM.name, item: rootUrl },
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

      {/* HERO */}
      <section className="pt-20 md:pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6 md:gap-16">
            <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-brand-bark pt-3.5">§ FAQ</div>
            <div>
              <h1 className="opsz-headline font-light text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.0] tracking-[-0.025em] text-brand-ink text-balance">
                Frequently asked questions.
              </h1>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6">
        <div className="border-t border-brand-ink-rule" />
      </div>

      {/* FAQ ACCORDION */}
      <section className="py-14 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6 md:gap-16">
            <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-brand-bark pt-3.5">§ Questions</div>
            <div>
              <div>
                {FAQS.map((faq) => (
                  <Disclosure key={faq.id} question={faq.question}>
                    {'bullets' in faq && faq.bullets ? (
                      <ul className="list-disc pl-5 space-y-1.5">
                        {faq.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    ) : 'table' in faq && faq.table ? (
                      <>
                        <p className="mb-5">{faq.answer}</p>
                        <div className="overflow-x-auto -mx-2">
                          <table className="w-full text-sm border-collapse min-w-[600px]">
                            <thead>
                              <tr className="border-b border-brand-ink-rule">
                                {faq.table.headers.map((h, i) => (
                                  <th
                                    key={i}
                                    className="text-left font-medium text-brand-ink py-3 px-3 align-bottom"
                                  >
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {faq.table.rows.map((row, ri) => (
                                <tr key={ri} className="border-b border-brand-ink-rule/60">
                                  {row.map((cell, ci) => (
                                    <td
                                      key={ci}
                                      className={`py-3 px-3 align-top ${ci === 0 ? 'font-medium text-brand-ink' : 'text-brand-ink-soft'}`}
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <p className="mt-3 text-xs text-brand-bark">
                          Source: au pair program data, 2025.
                        </p>
                      </>
                    ) : (
                      faq.answer
                    )}
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
