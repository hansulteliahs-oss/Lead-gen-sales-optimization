import Link from 'next/link'

const NAV_LINKS = [
  { label: 'About', path: '/about' },
  { label: 'Au Pairs', path: '/au-pairs' },
  { label: 'FAQ', path: '/faq' },
  { label: 'Testimonials', path: '/testimonials' },
  { label: 'Contact', path: '/contact' },
]

const PHONE_DISPLAY = '(714) 510-0002'
const PHONE_TEL = '+17145100002'
const EMAIL = 'kim@aupaircc.com'
const INSTAGRAM_URL = 'https://www.instagram.com/theaupairchildcareconsultant/'
const INSTAGRAM_HANDLE = 'theaupairchildcareconsultant'

export default function LccWebFooter({ lccName }: { lccName: string }) {
  const year = new Date().getFullYear()

  return (
    <footer
      className="bg-brand-paper border-t border-brand-ink-rule mt-24"
      role="contentinfo"
    >
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-brand-bark leading-relaxed">
            Local Childcare Consultant
          </div>
          <div className="mt-2 text-brand-ink font-medium text-lg tracking-tight">
            The Au Pair Childcare Consultant
          </div>
          <div className="mt-5 font-mono text-[11px] uppercase tracking-[0.08em] text-brand-bark leading-relaxed">
            Contact
          </div>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>
              <a
                href={`mailto:${EMAIL}`}
                className="text-brand-ink-soft hover:text-brand-ink transition-colors duration-200 ease-out-quart"
              >
                {EMAIL}
              </a>
            </li>
            <li>
              <a
                href={`tel:${PHONE_TEL}`}
                className="text-brand-ink-soft hover:text-brand-ink transition-colors duration-200 ease-out-quart"
              >
                {PHONE_DISPLAY}
              </a>
            </li>
            <li>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-ink-soft hover:text-brand-ink transition-colors duration-200 ease-out-quart"
              >
                {INSTAGRAM_HANDLE}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-brand-bark leading-relaxed">
            Pages
          </div>
          <ul className="mt-3 space-y-2">
            {NAV_LINKS.map(({ label, path }) => (
              <li key={path}>
                <Link
                  href={path}
                  className="text-sm text-brand-ink-soft hover:text-brand-ink transition-colors duration-200 ease-out-quart"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-brand-bark leading-relaxed">
            Service Area
          </div>
          <p className="mt-3 text-sm text-brand-ink-soft leading-relaxed">
            Based in Newport Beach, CA &middot; Serving families nationwide
          </p>
        </div>
      </div>

      <div className="border-t border-brand-ink-rule">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-xs text-brand-bark">
          <div>
            &copy; {year} {lccName}. All rights reserved.
          </div>
          <div className="font-mono uppercase tracking-[0.08em]">
            Local Childcare Consultant
          </div>
        </div>
      </div>
    </footer>
  )
}
