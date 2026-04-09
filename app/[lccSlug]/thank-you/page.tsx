import { notFound } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin'

interface Props {
  params: { lccSlug: string }
}

export default async function ThankYouPage({ params }: Props) {
  const supabase = createAdminClient()
  const { data: lcc } = await supabase
    .from('lccs')
    .select('id, name, learn_more_url')
    .eq('slug', params.lccSlug)
    .single()

  if (!lcc) notFound()

  return (
    <main className="min-h-screen bg-brand-surface flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-brand-border p-12 text-center">
        {/* Pink checkmark icon */}
        <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-brand-surface flex items-center justify-center">
          <svg
            className="h-8 w-8 text-brand-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-brand-body mb-3">
          You&apos;re all set!
        </h1>

        <p className="text-brand-muted text-lg mb-2">
          {lcc.name} will reach out to you shortly.
        </p>
        <p className="text-brand-muted mb-8">
          We&apos;ve received your information and will be in touch soon about au pair childcare.
        </p>

        {lcc.learn_more_url && (
          <a
            href={lcc.learn_more_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3.5 bg-brand-primary hover:bg-brand-primaryHover text-white font-semibold rounded-full transition-colors"
          >
            Learn more about au pairs
          </a>
        )}
      </div>
    </main>
  )
}
