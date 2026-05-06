import type { MetadataRoute } from 'next'

const SUB_PAGES = ['about', 'au-pairs', 'faq', 'testimonials'] as const
const KIM_SLUG = 'kim-arvdalen'
const LAST_MODIFIED = new Date('2026-04-09')

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yourdomain.com'

  return [
    {
      url: `${baseUrl}/${KIM_SLUG}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    ...SUB_PAGES.map((page) => ({
      url: `${baseUrl}/${KIM_SLUG}/${page}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
