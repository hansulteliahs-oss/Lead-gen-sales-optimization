import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { createAdminClient } from '@/utils/supabase/admin'

interface Props {
  params: { lccSlug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createAdminClient()
  const { data: lcc } = await supabase
    .from('lccs')
    .select('name, photo_url')
    .eq('slug', params.lccSlug)
    .single()

  if (!lcc) return {}

  const title = `${lcc.name} | About`
  const description = `Learn about ${lcc.name}'s background, experience, and personal approach to guiding families through the au pair placement process.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(lcc.photo_url ? { images: [{ url: lcc.photo_url }] } : {}),
    },
  }
}

export default async function AboutPage({ params }: Props) {
  const supabase = createAdminClient()
  const { data: lcc } = await supabase
    .from('lccs')
    .select('name, slug, bio, photo_url')
    .eq('slug', params.lccSlug)
    .single()

  if (!lcc) notFound()

  const headersList = headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  const baseUrl = `${proto}://${host}`
  const rootUrl = `${baseUrl}/${params.lccSlug}`

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${rootUrl}#person`,
        name: lcc.name,
        jobTitle: 'Local Childcare Consultant',
        ...(lcc.bio ? { description: lcc.bio } : {}),
        ...(lcc.photo_url ? { image: lcc.photo_url } : {}),
        url: rootUrl,
        worksFor: {
          '@type': 'Organization',
          name: 'Cultural Care Au Pair',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: lcc.name, item: rootUrl },
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
          <h1 className="text-4xl font-extrabold text-brand-body">{lcc.name}</h1>
          <p className="text-brand-muted mt-2">Local Childcare Consultant · Cultural Care Au Pair</p>
        </div>
      </section>

      {/* Bio content */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-10 items-start">
          {lcc.photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={lcc.photo_url}
              alt={lcc.name}
              className="rounded-2xl w-full md:w-64 md:h-80 object-cover shadow-lg flex-shrink-0"
            />
          )}
          <div className="flex-1">
            <p
              data-testid="bio"
              className="text-brand-muted leading-relaxed whitespace-pre-wrap text-lg"
            >
              {lcc.bio ?? 'Bio coming soon.'}
            </p>
          </div>
        </div>
      </section>

      {/* CTA card */}
      <section className="bg-brand-surface py-16 px-6">
        <div className="max-w-lg mx-auto text-center bg-white rounded-2xl border border-brand-border shadow-sm p-10">
          <h2 className="text-2xl font-bold text-brand-body mb-3">Ready to get started?</h2>
          <p className="text-brand-muted mb-6">
            Reach out today and {lcc.name} will walk you through everything.
          </p>
          <a
            href={`/${lcc.slug}/#form`}
            className="inline-block bg-brand-primary text-white font-semibold px-8 py-3.5 rounded-full hover:bg-brand-primaryHover transition-colors"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </div>
  )
}
