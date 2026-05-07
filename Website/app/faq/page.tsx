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

const KIM = { name: 'Kim Arvdalen' }

const FAQS = [
  {
    id: 'faq-0',
    question: 'How much does the au pair program cost?',
    answer:
      "The total annual cost of hosting an au pair with Cultural Care is typically between $20,000 and $25,000 — which includes the agency fee, the au pair's weekly stipend, and room and board. When you compare this to full-time daycare or a nanny, it is often significantly more affordable, especially for families with two or more children. I'm happy to walk you through a detailed cost comparison based on your specific situation.",
  },
  {
    id: 'faq-1',
    question: 'How long does the matching process take?',
    answer:
      "Most families complete their matching process in four to eight weeks, though timelines vary depending on how many profiles you review and how quickly you connect with au pair candidates. Cultural Care provides a dedicated matching platform where you can browse profiles, watch videos, and schedule video calls. As your Local Childcare Consultant, I'm here to help you narrow down candidates and feel confident in your choice.",
  },
  {
    id: 'faq-2',
    question: 'What does a typical living arrangement look like?',
    answer:
      'Au pairs live with your family as part of your household. They have their own private bedroom and access to shared living spaces. They receive a weekly stipend (set by the U.S. Department of State), meals, and use of a vehicle for childcare duties. In return, they provide up to 45 hours of childcare per week. Many families find this arrangement creates a warm, collaborative dynamic that benefits everyone — including the children.',
  },
  {
    id: 'faq-3',
    question: "What happens if the au pair isn't the right fit?",
    answer:
      "Cultural Care has a formal rematch process for situations where the placement isn't working out. You are never locked into an arrangement that isn't right for your family. The agency supports both the host family and the au pair through the transition, and I will personally help you navigate the process and begin a new search as quickly as possible. Rematches are more common than people expect, and most families find a great fit on their second match.",
  },
  {
    id: 'faq-4',
    question: 'Does the au pair need a visa, and who handles it?',
    answer:
      'Yes — au pairs enter the United States on a J-1 Exchange Visitor visa, which is sponsored by Cultural Care Au Pair as a U.S. Department of State designated program. Cultural Care handles all visa paperwork, SEVIS registration, and compliance requirements on behalf of both the au pair and the host family. As a host family, you do not need to navigate the visa process yourself — it is fully managed by the agency.',
  },
  {
    id: 'faq-5',
    question: 'What areas does Kim serve?',
    answer:
      'Kim serves families throughout Southern California, with a primary focus on Newport Beach, Costa Mesa, Huntington Beach, Irvine, Laguna Beach, and greater Orange County. She also works with families in the Los Angeles area (including Santa Monica and West LA) and San Diego. Wherever you are in SoCal, Kim can guide you through the au pair program at no extra cost.',
  },
  {
    id: 'faq-6',
    question: "What's the difference between an au pair and a nanny?",
    answer:
      'The main differences are cost, structure, and cultural exchange. A nanny is typically a local hired employee with market-rate wages ($40,000–$60,000 or more per year) and no cultural immersion component. An au pair is a young adult from abroad who lives with your family, earns a government-set stipend (currently $244.85/week), and participates in a structured cultural exchange program. Au pairs are ideal for families seeking affordable full-time childcare, flexibility across the week, and the enriching experience of welcoming someone from another culture into their home.',
  },
]

export async function generateMetadata(): Promise<Metadata> {
  const title = `Au Pair FAQ | ${KIM.name} — Newport Beach, Costa Mesa & SoCal`
  const description = `Answers to common questions from families in Newport Beach, Costa Mesa, and greater Southern California about the au pair program.`
  return { title, description, openGraph: { title, description, type: 'website' } }
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
              <p className="opsz-body mt-6 text-lg text-brand-ink-soft max-w-[60ch]">
                Answers from {KIM.name}, your Local Childcare Consultant.
              </p>
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
              <Accordion type="single" collapsible>
                {FAQS.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-base md:text-lg">{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
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
              Reach out and {KIM.name} will be happy to help.
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
