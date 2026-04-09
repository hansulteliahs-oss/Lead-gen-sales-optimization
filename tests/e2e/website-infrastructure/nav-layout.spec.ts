import { test, expect } from '@playwright/test'

const SLUG = 'kim-arvdalen'
const LCC_NAME = 'Kim Arvdalen'

const ALL_PAGES = [
  { name: 'landing', path: `/${SLUG}` },
  { name: 'about', path: `/${SLUG}/about` },
  { name: 'au-pairs', path: `/${SLUG}/au-pairs` },
  { name: 'faq', path: `/${SLUG}/faq` },
  { name: 'testimonials', path: `/${SLUG}/testimonials` },
]

// ── SITE-06: Sticky nav renders on every LCC page ────────────────────────────

test.describe('SITE-06: Sticky nav renders on all LCC website pages', () => {
  for (const { name, path } of ALL_PAGES) {
    test(`Nav is visible on ${name} page`, async ({ page }) => {
      await page.goto(path)

      // Nav element present
      const nav = page.getByRole('navigation', { name: 'LCC website navigation' })
      await expect(nav).toBeVisible()

      // LCC name visible in nav
      await expect(nav.getByText(LCC_NAME)).toBeVisible()

      // "Get Started" CTA visible in nav (desktop)
      await expect(nav.getByRole('link', { name: 'Get Started' }).first()).toBeVisible()

      // 4 nav links present
      await expect(nav.getByRole('link', { name: 'About' })).toBeVisible()
      await expect(nav.getByRole('link', { name: 'Au Pairs' })).toBeVisible()
      await expect(nav.getByRole('link', { name: 'FAQ' })).toBeVisible()
      await expect(nav.getByRole('link', { name: 'Testimonials' })).toBeVisible()
    })
  }

  test('LCC name link navigates to landing page', async ({ page }) => {
    await page.goto(`/${SLUG}/about`)
    const nav = page.getByRole('navigation', { name: 'LCC website navigation' })
    await nav.getByText(LCC_NAME).click()
    await expect(page).toHaveURL(`/${SLUG}`)
  })

  test('Active state: About link is highlighted on the about page', async ({ page }) => {
    await page.goto(`/${SLUG}/about`)
    const nav = page.getByRole('navigation', { name: 'LCC website navigation' })
    const aboutLink = nav.getByRole('link', { name: 'About' })
    // The active link has text-brand-gold class
    await expect(aboutLink).toHaveClass(/text-brand-gold/)
  })
})

// ── SITE-07: Hamburger menu on mobile ────────────────────────────────────────

test.describe('SITE-07: Hamburger menu on mobile viewport', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(`/${SLUG}`)
  })

  test('Desktop nav links are NOT visible on mobile', async ({ page }) => {
    // Desktop links are in a hidden md:flex container — check they're not visible
    const nav = page.getByRole('navigation', { name: 'LCC website navigation' })
    const desktopLinks = nav.locator('.hidden.md\\:flex')
    await expect(desktopLinks).not.toBeVisible()
  })

  test('Hamburger button is visible on mobile', async ({ page }) => {
    const hamburger = page.getByRole('button', { name: 'Open menu' })
    await expect(hamburger).toBeVisible()
  })

  test('Hamburger opens dropdown with nav links and CTA', async ({ page }) => {
    await page.getByRole('button', { name: 'Open menu' }).click()

    // Mobile dropdown links should now be visible
    const dropdown = page.locator('.md\\:hidden.overflow-hidden')
    await expect(dropdown.getByRole('link', { name: 'About' })).toBeVisible()
    await expect(dropdown.getByRole('link', { name: 'Au Pairs' })).toBeVisible()
    await expect(dropdown.getByRole('link', { name: 'FAQ' })).toBeVisible()
    await expect(dropdown.getByRole('link', { name: 'Testimonials' })).toBeVisible()
    await expect(dropdown.getByRole('link', { name: 'Get Started' })).toBeVisible()
  })

  test('Hamburger icon changes to X (aria-label changes) when menu is open', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Open menu' })
    await button.click()

    // After open, aria-label should be "Close menu"
    await expect(page.getByRole('button', { name: 'Close menu' })).toBeVisible()

    // Click again to close
    await page.getByRole('button', { name: 'Close menu' }).click()
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible()
  })

  test('Tapping a nav link in dropdown closes the menu', async ({ page }) => {
    await page.getByRole('button', { name: 'Open menu' }).click()

    const dropdown = page.locator('.md\\:hidden.overflow-hidden')
    await expect(dropdown.getByRole('link', { name: 'About' })).toBeVisible()

    // Click a nav link — menu should close
    await dropdown.getByRole('link', { name: 'About' }).click()

    // After navigation, dropdown should be collapsed (max-h-0)
    const dropdownAfter = page.locator('.md\\:hidden.overflow-hidden')
    await expect(dropdownAfter).toHaveClass(/max-h-0/)
  })
})
