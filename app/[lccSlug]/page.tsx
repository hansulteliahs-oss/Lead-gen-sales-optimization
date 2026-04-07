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
    .select('id, name, slug, webhook_url')
    .eq('slug', params.lccSlug)
    .single()

  if (!lcc) notFound()

  // Extract UTM params — string only, ignore arrays
  const utmSource = typeof searchParams.utm_source === 'string' ? searchParams.utm_source : null
  const utmMedium = typeof searchParams.utm_medium === 'string' ? searchParams.utm_medium : null
  const utmCampaign = typeof searchParams.utm_campaign === 'string' ? searchParams.utm_campaign : null
  const utmContent = typeof searchParams.utm_content === 'string' ? searchParams.utm_content : null

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-semibold text-gray-800 mb-2">{lcc.name}</h1>
        <p className="text-lg text-gray-600 mb-8">
          Interested in au pair childcare? Fill out the form below and {lcc.name} will be in touch.
        </p>
        <section id="form">
          <LeadCaptureForm
            lccId={lcc.id}
            lccSlug={lcc.slug}
            lccName={lcc.name}
            utmSource={utmSource}
            utmMedium={utmMedium}
            utmCampaign={utmCampaign}
            utmContent={utmContent}
          />
        </section>
      </div>
    </div>
  )
}
