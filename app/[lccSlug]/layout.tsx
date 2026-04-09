import { notFound } from 'next/navigation'
import LccWebNav from '@/components/LccWebNav'

const KIM = { name: 'Kim Arvdalen', slug: 'kim-arvdalen' }

interface Props {
  params: { lccSlug: string }
  children: React.ReactNode
}

export default function LccLayout({ params, children }: Props) {
  if (params.lccSlug !== KIM.slug) notFound()

  return (
    <>
      <LccWebNav lccName={KIM.name} lccSlug={KIM.slug} />
      <main className="bg-brand-pageBg min-h-screen">{children}</main>
    </>
  )
}
