import { notFound } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin'
import LeadCaptureForm from './LeadCaptureForm'

interface Props {
  params: { lccSlug: string }
  searchParams: { [key: string]: string | string[] | undefined }
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
    .limit(1)

  const featuredTestimonial = (testimonials ?? [])[0] ?? null

  // Extract UTM params — string only, ignore arrays
  const utmSource = typeof searchParams.utm_source === 'string' ? searchParams.utm_source : null
  const utmMedium = typeof searchParams.utm_medium === 'string' ? searchParams.utm_medium : null
  const utmCampaign = typeof searchParams.utm_campaign === 'string' ? searchParams.utm_campaign : null
  const utmContent = typeof searchParams.utm_content === 'string' ? searchParams.utm_content : null

  return (
    <div>
      {/* 1. HERO */}
      <section
        data-testid="hero-section"
        className="bg-brand-pageBg min-h-screen flex items-center"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto px-4 py-12 w-full">
          {/* Photo column */}
          <div>
            {lcc.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={lcc.photo_url}
                alt={lcc.name}
                className="w-full rounded-xl object-cover aspect-[3/4]"
              />
            ) : (
              <div className="w-full aspect-[3/4] rounded-xl bg-brand-cardBg flex items-center justify-center">
                <span className="text-6xl font-semibold text-brand-muted">
                  {lcc.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Text column */}
          <div className="flex flex-col justify-center gap-4">
            <p className="text-sm font-medium text-brand-muted uppercase tracking-wide">
              {lcc.name}
            </p>
            <h1 className="text-4xl font-bold text-brand-body leading-tight">
              {lcc.headline ?? `Welcome — I'm ${lcc.name}`}
            </h1>
            {lcc.subheadline && (
              <p className="text-lg text-brand-muted">{lcc.subheadline}</p>
            )}
            <div>
              <a
                data-testid="hero-cta"
                href="#form"
                className="inline-block bg-brand-gold text-white font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT TEASER */}
      <section
        data-testid="about-teaser"
        className="bg-white py-16 px-4"
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-brand-body mb-4">
            About {lcc.name}
          </h2>
          <p className="text-brand-muted text-lg mb-6">
            {lcc.bio_teaser ?? 'Learn more about your Local Childcare Consultant.'}
          </p>
          <a
            href={`/${lcc.slug}/about`}
            className="text-brand-gold font-medium hover:underline"
          >
            Read more →
          </a>
        </div>
      </section>

      {/* 3. AU PAIRS TEASER */}
      <section
        data-testid="au-pairs-teaser"
        className="bg-brand-pageBg py-16 px-4"
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-brand-body mb-4">
            How the Au Pair Program Works
          </h2>
          <p className="text-brand-muted text-lg mb-6">
            The au pair program offers families a live-in childcare partner who becomes part of the
            family — at a weekly cost that&apos;s often less than traditional daycare. It&apos;s
            flexible, cultural, and fully supported by Cultural Care Au Pair.
          </p>
          <a
            href={`/${lcc.slug}/au-pairs`}
            className="text-brand-gold font-medium hover:underline"
          >
            Learn more →
          </a>
        </div>
      </section>

      {/* 4. TESTIMONIALS SNIPPET */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-brand-body mb-8">
            What Families Are Saying
          </h2>
          {featuredTestimonial ? (
            <>
              <blockquote
                data-testid="testimonial-quote"
                className="text-xl italic text-brand-body mb-4 border-l-4 border-brand-gold pl-6"
              >
                &ldquo;{featuredTestimonial.quote}&rdquo;
              </blockquote>
              <p className="text-sm text-brand-muted mb-6">
                — {featuredTestimonial.family_name}
              </p>
            </>
          ) : (
            <p className="text-brand-muted text-lg mb-6">Testimonials coming soon.</p>
          )}
          <a
            href={`/${lcc.slug}/testimonials`}
            className="text-brand-gold font-medium hover:underline"
          >
            See all →
          </a>
        </div>
      </section>

      {/* 5. FORM SECTION — id="form" is the anchor target */}
      <section id="form" className="bg-brand-pageBg py-16 px-4">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl font-semibold text-brand-body mb-2">
            Ready to Find Your Au Pair?
          </h2>
          <p className="text-brand-muted mb-8">
            Fill out the form below and {lcc.name} will be in touch within 24 hours.
          </p>
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
      </section>
    </div>
  )
}
