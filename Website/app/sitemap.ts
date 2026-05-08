import type { MetadataRoute } from 'next'

const PAGES: Record<string, string> = {
  '': '2026-05-07',
  about: '2026-05-07',
  'au-pairs': '2026-05-07',
  faq: '2026-05-07',
  testimonials: '2026-05-07',
  contact: '2026-05-07',
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://theaupairchildcareconsultant.com'

  return Object.entries(PAGES).map(([path, lastModified]) => ({
    url: path ? `${baseUrl}/${path}` : baseUrl,
    lastModified: new Date(lastModified),
  }))
}
