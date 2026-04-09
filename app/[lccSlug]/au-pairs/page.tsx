import type { Metadata } from 'next'
import { headers } from 'next/headers'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const CULTURAL_CARE_URL =
  'https://www.culturalcare.com/lcc/karvdalen/?utm_source=ig&utm_medium=social&utm_content=link_in_bio#become-hf-form'

const KIM = { name: 'Kim Arvdalen', slug: 'kim-arvdalen' }

export async function generateMetadata(): Promise<Metadata> {
  const title = `${KIM.name} | Au Pairs`
  const description = `Explore how the au pair program works — costs, the matching process, visa requirements, and how an au pair compares to a nanny. Guidance from ${KIM.name}.`

  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
  }
}

export default function AuPairsPage() {
  const headersList = headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  const baseUrl = `${proto}://${host}`
  const rootUrl = `${baseUrl}/${KIM.slug}`

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Is the au pair program only for wealthy families?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. The au pair program is often more affordable than full-time daycare or a private nanny, especially for families with two or more children. The federally regulated stipend keeps costs predictable at approximately $195.75 per week.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is it hard to find a good au pair match?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Cultural Care Au Pair uses a thorough screening and matching process. Families review profiles and interview candidates before committing — you are always in control of who joins your family.',
            },
          },
          {
            '@type': 'Question',
            name: 'Does having a live-in caregiver mean no privacy?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Most host families find the arrangement works smoothly with clear expectations set upfront. Your Local Childcare Consultant helps you navigate boundaries and house rules from day one.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can au pairs care for infants?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Au pairs can care for children of all ages, including infants, as long as the au pair meets the infant care requirements set by Cultural Care (including specific experience hours with children under two).',
            },
          },
        ],
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

      {/* Hero banner */}
      <section className="bg-brand-surface py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold text-brand-primary uppercase tracking-widest mb-3">Au Pairs</p>
          <h1 className="text-4xl font-extrabold text-brand-body mb-4">
            Understanding the Au Pair Program
          </h1>
          <p className="text-brand-muted text-lg leading-relaxed max-w-2xl">
            The au pair program is an excellent option for families seeking flexible, affordable
            live-in childcare with a cultural exchange dimension. Whether you have one child or
            four, an au pair can provide the consistent, personalized care your family needs.
          </p>
        </div>
      </section>

      {/* Accordion sections */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible defaultValue="au-pair-vs-nanny">
            <AccordionItem value="how-it-works">
              <AccordionTrigger className="text-lg">How It Works</AccordionTrigger>
              <AccordionContent>
                <p>
                  Au pairs are young adults (ages 18–26) from abroad who live with a host family,
                  providing up to 45 hours per week of childcare as part of a federally regulated
                  cultural exchange program. They become a true part of your family while sharing
                  their language and culture with your children.
                </p>
                <p className="mt-3">
                  Cultural Care Au Pair is the agency that matches families with au pair candidates,
                  manages the visa process, and provides year-round support. As your Local Childcare
                  Coordinator (LCC), I am your local point of contact throughout the entire program —
                  from matching through the end of your year together.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="program-costs">
              <AccordionTrigger className="text-lg">Program Costs</AccordionTrigger>
              <AccordionContent>
                <p>
                  The weekly stipend paid directly to your au pair is set by federal law —
                  approximately $195.75 per week as of 2024. This is not negotiable and ensures
                  fair compensation for all au pairs in the program.
                </p>
                <p className="mt-3">
                  The program fee paid to Cultural Care covers candidate matching, J-1 visa support,
                  insurance, and 12 months of full program coverage. Total annual cost typically
                  falls between $20,000 and $30,000 depending on the plan you choose — often
                  significantly less than full-time daycare or a private nanny in major cities.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="au-pair-vs-nanny">
              <AccordionTrigger className="text-lg">Au Pair vs. Nanny</AccordionTrigger>
              <AccordionContent>
                <p className="mb-5">
                  Not sure if an au pair is right for your family? Here is a side-by-side comparison
                  to help you decide.
                </p>
                <div className="border border-brand-border rounded-2xl overflow-hidden">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-brand-primary text-white">
                        <th className="text-left py-3 px-4 font-semibold">Feature</th>
                        <th className="text-left py-3 px-4 font-semibold">Au Pair</th>
                        <th className="text-left py-3 px-4 font-semibold">Nanny</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Cost per week', '~$195.75 (federally set)', '$600–$1,500+ (market rate)'],
                        ['Lives with family', 'Yes — live-in arrangement', 'Usually no'],
                        ['Hours per week', 'Up to 45 hrs (regulated)', 'Varies by contract'],
                        ['Cultural exchange', 'Yes — core program element', 'Not typically'],
                        ['Agency support', 'Full matching, visa, LCC', 'Agency optional, extra cost'],
                        ['Program duration', '12 months (extendable)', 'Open-ended'],
                      ].map(([feature, aupair, nanny], i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-brand-surface'}>
                          <td className="py-3 px-4 font-medium text-brand-body border-t border-brand-border">{feature}</td>
                          <td className="py-3 px-4 text-brand-muted border-t border-brand-border">{aupair}</td>
                          <td className="py-3 px-4 text-brand-muted border-t border-brand-border">{nanny}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="myths">
              <AccordionTrigger className="text-lg">Common Questions &amp; Myths</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-5">
                  {[
                    {
                      myth: 'Myth: Au pairs are only for wealthy families.',
                      reality: 'Reality: The au pair program is often more affordable than full-time daycare or a private nanny, especially for families with two or more children. The federally regulated stipend keeps costs predictable.',
                    },
                    {
                      myth: 'Myth: It is hard to find a good match.',
                      reality: 'Reality: Cultural Care Au Pair uses a thorough screening and matching process. You review profiles and interview candidates before committing — you are always in control of who joins your family.',
                    },
                    {
                      myth: 'Myth: Having a live-in caregiver means no privacy.',
                      reality: 'Reality: Most host families find the arrangement works smoothly with clear expectations set upfront. Your LCC helps you navigate boundaries and house rules from day one.',
                    },
                    {
                      myth: 'Myth: Au pairs can only care for older children.',
                      reality: 'Reality: Au pairs can care for children of all ages, including infants, as long as the au pair meets the infant care requirements set by Cultural Care (including specific experience hours with children under two).',
                    },
                  ].map(({ myth, reality }, i) => (
                    <li key={i}>
                      <p className="font-semibold text-brand-body">{myth}</p>
                      <p className="mt-1 text-brand-muted">{reality}</p>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-surface py-16 px-6">
        <div className="max-w-lg mx-auto text-center bg-white rounded-2xl border border-brand-border shadow-sm p-10">
          <h2 className="text-2xl font-bold text-brand-body mb-3">Still have questions?</h2>
          <p className="text-brand-muted mb-6">
            {KIM.name} is happy to walk you through everything — no pressure.
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
