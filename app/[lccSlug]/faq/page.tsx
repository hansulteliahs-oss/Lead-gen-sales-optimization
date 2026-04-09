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
      'Most families complete their matching process in four to eight weeks, though timelines vary depending on how many profiles you review and how quickly you connect with au pair candidates. Cultural Care provides a dedicated matching platform where you can browse profiles, watch videos, and schedule video calls. As your Local Childcare Consultant, I\'m here to help you narrow down candidates and feel confident in your choice.',
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
    question: "What's the difference between an au pair and a nanny?",
    answer:
      'The main differences are cost, structure, and cultural exchange. A nanny is typically a local hired employee with market-rate wages ($40,000–$60,000 or more per year) and no cultural immersion component. An au pair is a young adult from abroad who lives with your family, earns a government-set stipend (currently $244.85/week), and participates in a structured cultural exchange program. Au pairs are ideal for families seeking affordable full-time childcare, flexibility across the week, and the enriching experience of welcoming someone from another culture into their home.',
  },
]

export async function generateMetadata(): Promise<Metadata> {
  const title = `${KIM.name} | FAQ`
  const description = `Common questions families ask about the au pair program, answered by ${KIM.name} — your Local Childcare Consultant.`

  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
  }
}

export default function FAQPage() {
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
        mainEntity: FAQS.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
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

      {/* Hero banner */}
      <section className="bg-brand-surface py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold text-brand-primary uppercase tracking-widest mb-3">FAQ</p>
          <h1 className="text-4xl font-extrabold text-brand-body">Frequently Asked Questions</h1>
          <p className="text-brand-muted mt-2 text-lg">Answers from {KIM.name}, your Local Childcare Consultant.</p>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible>
            {FAQS.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left text-base">{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-surface py-16 px-6">
        <div className="max-w-lg mx-auto text-center bg-white rounded-2xl border border-brand-border shadow-sm p-10">
          <h2 className="text-2xl font-bold text-brand-body mb-3">Still have questions?</h2>
          <p className="text-brand-muted mb-6">
            Reach out and {KIM.name} will be happy to help.
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
