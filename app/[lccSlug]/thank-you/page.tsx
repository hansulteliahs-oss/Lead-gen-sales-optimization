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
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-semibold text-gray-800 mb-4">
          Thanks! {lcc.name} will reach out to you shortly.
        </h1>

        <p className="text-gray-600 mb-8">
          We have received your information and will be in touch soon about au pair childcare.
        </p>

        {lcc.learn_more_url && (
          <a
            href={lcc.learn_more_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors duration-150"
          >
            Learn more about au pairs
          </a>
        )}
      </div>
    </main>
  )
}
