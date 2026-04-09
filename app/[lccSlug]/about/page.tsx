import type { Metadata } from 'next'
import { headers } from 'next/headers'

const CULTURAL_CARE_URL =
  'https://www.culturalcare.com/lcc/karvdalen/?utm_source=ig&utm_medium=social&utm_content=link_in_bio#become-hf-form'

const KIM = {
  name: 'Kim Arvdalen',
  slug: 'kim-arvdalen',
  bio: `I grew up in a family that believed deeply in the power of community, and that belief has shaped everything I do as a Local Childcare Consultant. After years of working in early childhood education and family services, I joined Cultural Care Au Pair because I saw firsthand how transformative the right childcare arrangement could be — not just for the children, but for the entire family.

Over the past several years I've helped dozens of families in our community navigate the au pair program from start to finish. I love the moments when a family realizes how much more affordable and flexible an au pair can be compared to traditional daycare, and I especially love hearing about the friendships and cultural exchanges that blossom long after the initial placement.

When I'm not working with families, you'll find me volunteering at our local school, hiking with my own kids, and hosting neighbourhood get-togethers that more often than not turn into lively conversations about raising confident, curious children. I'd love to sit down with your family and explore whether the au pair program might be the right fit.`,
  photo_url: null as string | null,
}

export async function generateMetadata(): Promise<Metadata> {
  const title = `${KIM.name} | About`
  const description = `Learn about ${KIM.name}'s background, experience, and personal approach to guiding families through the au pair placement process.`

  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
  }
}

export default function AboutPage() {
  const headersList = headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  const baseUrl = `${proto}://${host}`
  const rootUrl = `${baseUrl}/${KIM.slug}`

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
        worksFor: {
          '@type': 'Organization',
          name: 'Cultural Care Au Pair',
        },
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

      {/* Hero banner */}
      <section className="bg-brand-surface py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold text-brand-primary uppercase tracking-widest mb-3">About</p>
          <h1 className="text-4xl font-extrabold text-brand-body">{KIM.name}</h1>
          <p className="text-brand-muted mt-2">Local Childcare Consultant · Cultural Care Au Pair</p>
        </div>
      </section>

      {/* Bio content */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-10 items-start">
          <div className="flex-1">
            <p
              data-testid="bio"
              className="text-brand-muted leading-relaxed whitespace-pre-wrap text-lg"
            >
              {KIM.bio}
            </p>
          </div>
        </div>
      </section>

      {/* CTA card */}
      <section className="bg-brand-surface py-16 px-6">
        <div className="max-w-lg mx-auto text-center bg-white rounded-2xl border border-brand-border shadow-sm p-10">
          <h2 className="text-2xl font-bold text-brand-body mb-3">Ready to get started?</h2>
          <p className="text-brand-muted mb-6">
            Reach out today and {KIM.name} will walk you through everything.
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
