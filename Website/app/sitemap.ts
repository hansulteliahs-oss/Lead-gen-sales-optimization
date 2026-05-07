import type { MetadataRoute } from 'next'

const SUB_PAGES = ['about', 'au-pairs', 'faq', 'testimonials'] as const
const LAST_MODIFIED = new Date('2026-05-07')

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://theaupairchildcareconsultant.com'

  return [
    {
      url: baseUrl,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    ...SUB_PAGES.map((page) => ({
      url: `${baseUrl}/${page}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
