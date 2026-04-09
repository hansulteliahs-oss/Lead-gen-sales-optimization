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

export default function LccWebNav({ lccName, lccSlug }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  const isLandingPage =
    pathname === `/${lccSlug}` || pathname === `/${lccSlug}/`

  const ctaHref = isLandingPage ? '#form' : `/${lccSlug}/#form`

  const isActive = (path: string) =>
    pathname === `/${lccSlug}/${path}` || pathname === `/${lccSlug}/${path}/`

  return (
    <nav
      className="sticky top-0 z-50 bg-white border-b border-brand-border shadow-sm"
      role="navigation"
      aria-label="LCC website navigation"
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* LCC name — home link */}
        <Link
          href={`/${lccSlug}`}
          className="text-brand-body font-bold text-lg hover:text-brand-primary transition-colors"
        >
          {lccName}
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, path }) => (
            <Link
              key={path}
              href={`/${lccSlug}/${path}`}
              className={
                isActive(path)
                  ? 'text-brand-primary font-semibold'
                  : 'text-brand-muted hover:text-brand-body transition-colors font-medium'
              }
            >
              {label}
            </Link>
          ))}

          {/* CTA */}
          <a
            href={ctaHref}
            className="ml-2 px-5 py-2 bg-brand-primary text-white rounded-full font-semibold hover:bg-brand-primaryHover transition-colors"
          >
            Get Started
          </a>
        </div>

        {/* Hamburger button (mobile only) */}
        <button
          className="md:hidden p-2 text-brand-body hover:text-brand-primary transition-colors"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-200 ${
          menuOpen ? 'max-h-72' : 'max-h-0'
        }`}
      >
        <div className="px-6 pb-5 pt-2 flex flex-col gap-4 border-t border-brand-border">
          {NAV_LINKS.map(({ label, path }) => (
            <Link
              key={path}
              href={`/${lccSlug}/${path}`}
              onClick={() => setMenuOpen(false)}
              className={
                isActive(path)
                  ? 'text-brand-primary font-semibold'
                  : 'text-brand-muted hover:text-brand-body transition-colors font-medium'
              }
            >
              {label}
            </Link>
          ))}

          <a
            href={ctaHref}
            onClick={() => setMenuOpen(false)}
            className="mt-1 px-5 py-2.5 bg-brand-primary text-white rounded-full font-semibold text-center hover:bg-brand-primaryHover transition-colors"
          >
            Get Started
          </a>
        </div>
      </div>
    </nav>
  )
}
