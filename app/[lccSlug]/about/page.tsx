import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
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
    .select('name, bio, photo_url')
    .eq('slug', params.lccSlug)
    .single()

  if (!lcc) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {lcc.photo_url ? (
        <img
          src={lcc.photo_url}
          alt={lcc.name}
          className="rounded-xl w-48 h-48 md:w-64 md:h-64 object-cover mb-8"
        />
      ) : null}
      <h1 className="text-3xl font-semibold text-brand-body mb-6">{lcc.name}</h1>
      <p data-testid="bio" className="text-brand-muted leading-relaxed whitespace-pre-wrap">
        {lcc.bio ?? 'Bio coming soon.'}
      </p>
    </div>
  )
}
