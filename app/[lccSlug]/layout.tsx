import { notFound } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin'
import LccWebNav from '@/components/LccWebNav'

interface Props {
  params: { lccSlug: string }
  children: React.ReactNode
}

export default async function LccLayout({ params, children }: Props) {
  const supabase = createAdminClient()
  const { data: lcc } = await supabase
    .from('lccs')
    .select('name, slug')
    .eq('slug', params.lccSlug)
    .single()

  if (!lcc) notFound()

  return (
    <>
      <LccWebNav lccName={lcc.name} lccSlug={lcc.slug} />
      <main className="bg-brand-pageBg min-h-screen">{children}</main>
    </>
  )
}
