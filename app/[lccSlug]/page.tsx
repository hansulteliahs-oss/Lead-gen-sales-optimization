import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { createAdminClient } from '@/utils/supabase/admin'
import LeadCaptureForm from './LeadCaptureForm'
import FadeInSection from './FadeInSection'

interface Props {
  params: { lccSlug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createAdminClient()
  const { data: lcc } = await supabase
    .from('lccs')
    .select('name, photo_url')
    .eq('slug', params.lccSlug)
    .single()

  if (!lcc) return {}

  const title = `${lcc.name} | Local Childcare Consultant`
  const description = `${lcc.name} is a certified Local Childcare Consultant with Cultural Care Au Pair, helping families in your area find flexible, affordable live-in childcare through the au pair program.`

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

export default async function LandingPage({ params, searchParams }: Props) {
  const supabase = createAdminClient()
  const { data: lcc } = await supabase
    .from('lccs')
    .select('id, name, slug, headline, subheadline, bio_teaser, photo_url, webhook_url')
    .eq('slug', params.lccSlug)
    .single()

  if (!lcc) notFound()

  const { data: testimonials } = await supabase
    .from('lcc_testimonials')
    .select('family_name, quote')
    .eq('lcc_id', lcc.id)
    .order('order_index', { ascending: true })
    .limit(2)

  const featuredTestimonials = testimonials ?? []

  const headersList = headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  const baseUrl = `${proto}://${host}`
  const pageUrl = `${baseUrl}/${params.lccSlug}`

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${pageUrl}#person`,
        name: lcc.name,
        jobTitle: 'Local Childcare Consultant',
        ...(lcc.bio_teaser ? { description: lcc.bio_teaser } : {}),
        ...(lcc.photo_url ? { image: lcc.photo_url } : {}),
        url: pageUrl,
        worksFor: {
          '@type': 'Organization',
          name: 'Cultural Care Au Pair',
        },
      },
      {
        '@type': 'LocalBusiness',
        '@id': `${pageUrl}#business`,
        name: `${lcc.name} | Local Childcare Consultant`,
        description:
          'Au pair placement consultant helping families find live-in childcare through the Cultural Care Au Pair program.',
        url: pageUrl,
        ...(lcc.photo_url ? { image: lcc.photo_url } : {}),
        priceRange: '$$',
        employee: { '@id': `${pageUrl}#person` },
      },
    ],
  }

  const utmSource = typeof searchParams.utm_source === 'string' ? searchParams.utm_source : null
  const utmMedium = typeof searchParams.utm_medium === 'string' ? searchParams.utm_medium : null
  const utmCampaign = typeof searchParams.utm_campaign === 'string' ? searchParams.utm_campaign : null
  const utmContent = typeof searchParams.utm_content === 'string' ? searchParams.utm_content : null

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* 1. HERO */}
      <section
        data-testid="hero-section"
        className="bg-brand-surface min-h-screen flex items-center"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto px-6 py-16 w-full">
          {/* Photo column */}
          <div>
            {lcc.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={lcc.photo_url}
                alt={lcc.name}
                className="w-full rounded-2xl object-cover aspect-[3/4] shadow-lg"
              />
            ) : (
              <div className="w-full aspect-[3/4] rounded-2xl bg-white border border-brand-border flex items-center justify-center shadow-lg">
                <span className="text-6xl font-bold text-brand-primary">
                  {lcc.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Text column */}
          <div className="flex flex-col justify-center gap-6">
            <p className="text-xs font-semibold text-brand-primary uppercase tracking-widest">
              Local Childcare Consultant
            </p>
            <h1 className="text-5xl font-extrabold text-brand-body leading-tight">
              {lcc.headline ?? `Hi, I&apos;m ${lcc.name}`}
            </h1>
            {lcc.subheadline && (
              <p className="text-lg text-brand-muted leading-relaxed">{lcc.subheadline}</p>
            )}
            <div>
              <a
                data-testid="hero-cta"
                href="#form"
                className="inline-block bg-brand-primary text-white font-semibold px-8 py-4 rounded-full text-lg hover:bg-brand-primaryHover transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT TEASER */}
      <FadeInSection>
        <section data-testid="about-teaser" className="bg-white py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-semibold text-brand-primary uppercase tracking-widest mb-3">About</p>
            <h2 className="text-3xl font-bold text-brand-body mb-5">
              Meet {lcc.name}
            </h2>
            <div className="border border-brand-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-brand-muted text-lg leading-relaxed mb-6">
                {lcc.bio_teaser ?? 'Learn more about your Local Childcare Consultant.'}
              </p>
              <a
                href={`/${lcc.slug}/about`}
                className="inline-flex items-center gap-1 text-brand-primary font-semibold hover:text-brand-primaryHover transition-colors"
              >
                Read more <span aria-hidden>→</span>
              </a>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* 3. AU PAIRS TEASER */}
      <FadeInSection>
        <section data-testid="au-pairs-teaser" className="bg-brand-surface py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-semibold text-brand-primary uppercase tracking-widest mb-3">Au Pairs</p>
            <h2 className="text-3xl font-bold text-brand-body mb-5">
              How the Au Pair Program Works
            </h2>
            <div className="border border-brand-border rounded-2xl p-8 bg-white shadow-sm hover:shadow-md transition-shadow">
              <p className="text-brand-muted text-lg leading-relaxed mb-6">
                The au pair program offers families a live-in childcare partner who becomes part of the
                family — at a weekly cost that&apos;s often less than traditional daycare. It&apos;s
                flexible, cultural, and fully supported by Cultural Care Au Pair.
              </p>
              <a
                href={`/${lcc.slug}/au-pairs`}
                className="inline-flex items-center gap-1 text-brand-primary font-semibold hover:text-brand-primaryHover transition-colors"
              >
                Learn more <span aria-hidden>→</span>
              </a>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* 4. TESTIMONIALS SNIPPET */}
      <FadeInSection>
        <section className="bg-white py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs font-semibold text-brand-primary uppercase tracking-widest mb-3">Testimonials</p>
            <h2 className="text-3xl font-bold text-brand-body mb-8">
              What Families Are Saying
            </h2>
            {featuredTestimonials.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {featuredTestimonials.map((t, i) => (
                    <div
                      key={i}
                      data-testid={i === 0 ? 'testimonial-quote' : undefined}
                      className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
                    >
                      <p className="text-4xl text-brand-primary opacity-30 font-serif leading-none mb-2">&ldquo;</p>
                      <blockquote className="text-brand-body italic leading-relaxed mb-4">
                        {t.quote}
                      </blockquote>
                      <p className="text-brand-primary font-semibold text-sm">— {t.family_name}</p>
                    </div>
                  ))}
                </div>
                <a
                  href={`/${lcc.slug}/testimonials`}
                  className="inline-flex items-center gap-1 text-brand-primary font-semibold hover:text-brand-primaryHover transition-colors"
                >
                  See all <span aria-hidden>→</span>
                </a>
              </>
            ) : (
              <p className="text-brand-muted text-lg">Testimonials coming soon.</p>
            )}
          </div>
        </section>
      </FadeInSection>

      {/* 5. FORM SECTION */}
      <FadeInSection>
        <section id="form" className="bg-brand-surface py-20 px-6">
          <div className="max-w-lg mx-auto">
            <p className="text-xs font-semibold text-brand-primary uppercase tracking-widest mb-3 text-center">Get in Touch</p>
            <h2 className="text-3xl font-bold text-brand-body mb-2 text-center">
              Ready to Find Your Au Pair?
            </h2>
            <p className="text-brand-muted mb-8 text-center">
              Fill out the form and {lcc.name} will be in touch within 24 hours.
            </p>
            <div className="bg-white rounded-2xl shadow-lg border border-brand-border p-8">
              <LeadCaptureForm
                lccId={lcc.id}
                lccSlug={lcc.slug}
                lccName={lcc.name}
                utmSource={utmSource}
                utmMedium={utmMedium}
                utmCampaign={utmCampaign}
                utmContent={utmContent}
              />
            </div>
          </div>
        </section>
      </FadeInSection>
    </div>
  )
}
