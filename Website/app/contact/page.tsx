import type { Metadata } from 'next'
import { headers } from 'next/headers'

const CULTURAL_CARE_URL =
  'https://www.culturalcare.com/lcc/karvdalen/?utm_source=ig&utm_medium=social&utm_content=link_in_bio#become-hf-form'

const KIM = { name: 'Kim Arvdalen' }

const PHONE_DISPLAY = '(714) 510-0002'
const PHONE_TEL = '+17145100002'

const SERVICE_AREA = [
  'Newport Beach',
  'Costa Mesa',
  'Huntington Beach',
  'Irvine',
  'Tustin',
  'Laguna Beach',
  'Dana Point',
  'Laguna Niguel',
  'Mission Viejo',
  'Greater Los Angeles',
  'San Diego County',
]

export async function generateMetadata(): Promise<Metadata> {
  const title = `Contact ${KIM.name} — Au Pair Consultant in Newport Beach, CA`
  const description = `Reach ${KIM.name}, your Local Childcare Consultant for the Cultural Care Au Pair program. Serving families across Southern California — call ${PHONE_DISPLAY}.`
  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
  }
}

export default function ContactPage() {
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
      { '@type': 'ListItem', position: 2, name: 'Contact', item: `${rootUrl}/contact` },
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
            <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-brand-bark pt-3.5">
              § Contact
            </div>
            <div>
              <h1 className="opsz-headline font-light text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.0] tracking-[-0.025em] text-brand-ink text-balance">
                Get in touch with {KIM.name.split(' ')[0]}.
              </h1>
              <p className="opsz-body mt-9 max-w-[56ch] text-xl leading-relaxed text-brand-ink-soft">
                Questions about the Cultural Care Au Pair program, what hosting an au pair really looks like, or whether it&rsquo;s the right fit for your family? You can call directly or sign up through Cultural Care and {KIM.name.split(' ')[0]} will reach out personally.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6">
        <div className="border-t border-brand-ink-rule" />
      </div>

      {/* DETAILS */}
      <section className="py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-brand-bark leading-relaxed">
              Phone
            </div>
            <a
              href={`tel:${PHONE_TEL}`}
              className="mt-3 block opsz-headline font-light text-[clamp(1.75rem,3vw,2.25rem)] leading-tight tracking-[-0.015em] text-brand-ink hover:text-brand-spot-deep transition-colors duration-200 ease-out-quart"
            >
              {PHONE_DISPLAY}
            </a>
            <p className="mt-3 text-sm text-brand-ink-soft leading-relaxed">
              Best for quick questions and same-week conversations.
            </p>
          </div>

          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-brand-bark leading-relaxed">
              Based in
            </div>
            <div className="mt-3 opsz-headline font-light text-[clamp(1.75rem,3vw,2.25rem)] leading-tight tracking-[-0.015em] text-brand-ink">
              Newport Beach, CA
            </div>
            <p className="mt-3 text-sm text-brand-ink-soft leading-relaxed">
              By appointment, in your home or by phone &middot; Open daily 9 AM&ndash;5 PM
            </p>
          </div>

          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-brand-bark leading-relaxed">
              Service Area
            </div>
            <ul className="mt-3 space-y-1.5 text-base text-brand-ink-soft">
              {SERVICE_AREA.map((city) => (
                <li key={city}>{city}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-brand-ink-rule py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-end">
          <h2 className="opsz-headline font-light text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.0] tracking-[-0.025em] text-brand-ink text-balance">
            Ready to start the conversation?
          </h2>
          <div>
            <p className="opsz-body text-lg text-brand-ink-soft max-w-[50ch] mb-7">
              Sign up through Cultural Care to start your host family application. {KIM.name} will be in touch personally to walk you through every step.
            </p>
            <a
              href={CULTURAL_CARE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-brand-ink text-brand-paper px-8 py-4 rounded font-medium text-base hover:bg-brand-spot-deep transition-colors duration-200 ease-out-quart"
            >
              Start with Cultural Care
            </a>
            <div className="mt-5 text-sm text-brand-ink-soft">
              Or call <a href={`tel:${PHONE_TEL}`} className="text-brand-ink hover:text-brand-spot-deep transition-colors">{PHONE_DISPLAY}</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
