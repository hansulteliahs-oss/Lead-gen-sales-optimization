import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/utils/supabase/admin'

const SUB_PAGES = ['about', 'au-pairs', 'faq', 'testimonials'] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient()
  const { data: lccs } = await supabase.from('lccs').select('slug, updated_at')

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yourdomain.com'

  const lccEntries: MetadataRoute.Sitemap = (lccs ?? []).flatMap((lcc) => [
    {
      url: `${baseUrl}/${lcc.slug}`,
      lastModified: lcc.updated_at ? new Date(lcc.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    ...SUB_PAGES.map((page) => ({
      url: `${baseUrl}/${lcc.slug}/${page}`,
      lastModified: lcc.updated_at ? new Date(lcc.updated_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ])

  return lccEntries
}
