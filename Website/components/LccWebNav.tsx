'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  lccName: string
  lccSlug: string
}

const NAV_LINKS = [
  { label: 'About', path: 'about' },
  { label: 'Au Pairs', path: 'au-pairs' },
  { label: 'FAQ', path: 'faq' },
  { label: 'Testimonials', path: 'testimonials' },
]

const CTA_HREF =
  'https://www.culturalcare.com/lcc/karvdalen/?utm_source=ig&utm_medium=social&utm_content=link_in_bio#become-hf-form'

export default function LccWebNav({ lccName, lccSlug }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) =>
    pathname === `/${lccSlug}/${path}` || pathname === `/${lccSlug}/${path}/`

  return (
    <nav
      className="sticky top-0 z-50 bg-brand-paper border-b border-brand-ink-rule"
      role="navigation"
      aria-label="LCC website navigation"
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-baseline justify-between gap-8">
        <Link
          href={`/${lccSlug}`}
          className="text-brand-ink font-medium text-lg tracking-tight self-center opsz-small hover:text-brand-spot-deep transition-colors duration-200 ease-out-quart"
        >
          {lccName}
        </Link>

        <div className="hidden md:flex items-baseline gap-7 self-center">
          {NAV_LINKS.map(({ label, path }) => (
            <Link
              key={path}
              href={`/${lccSlug}/${path}`}
              className={
                isActive(path)
                  ? 'text-brand-ink font-medium text-sm'
                  : 'text-brand-ink-soft hover:text-brand-ink text-sm transition-colors duration-200 ease-out-quart'
              }
            >
              {label}
            </Link>
          ))}

          <a
            href={CTA_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 px-4 py-2.5 bg-brand-ink text-brand-paper rounded font-medium text-sm hover:bg-brand-spot-deep transition-colors duration-200 ease-out-quart"
          >
            Get started
          </a>
        </div>

        <button
          type="button"
          className="md:hidden p-3 -mr-3 text-brand-ink hover:text-brand-spot-deep transition-colors duration-200 ease-out-quart self-center"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-menu"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      <div
        id="mobile-nav-menu"
        className={`md:hidden overflow-hidden transition-all duration-200 ease-out-quart ${
          menuOpen ? 'max-h-72' : 'max-h-0'
        }`}
      >
        <div className="px-6 pb-6 pt-3 flex flex-col gap-5 border-t border-brand-ink-rule">
          {NAV_LINKS.map(({ label, path }) => (
            <Link
              key={path}
              href={`/${lccSlug}/${path}`}
              onClick={() => setMenuOpen(false)}
              className={
                isActive(path)
                  ? 'text-brand-ink font-medium'
                  : 'text-brand-ink-soft hover:text-brand-ink transition-colors duration-200 ease-out-quart'
              }
            >
              {label}
            </Link>
          ))}

          <a
            href={CTA_HREF}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="mt-1 px-5 py-3 bg-brand-ink text-brand-paper rounded font-medium text-center hover:bg-brand-spot-deep transition-colors duration-200 ease-out-quart"
          >
            Get started
          </a>
        </div>
      </div>
    </nav>
  )
}
