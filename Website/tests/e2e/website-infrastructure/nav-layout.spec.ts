import { test, expect } from '@playwright/test'

const LCC_NAME = 'Kim Arvdalen'

const ALL_PAGES = [
  { name: 'landing', path: '/' },
  { name: 'about', path: '/about' },
  { name: 'au-pairs', path: '/au-pairs' },
  { name: 'faq', path: '/faq' },
  { name: 'testimonials', path: '/testimonials' },
]

// ── SITE-06: Sticky nav renders on every page ────────────────────────────────

test.describe('SITE-06: Sticky nav renders on all website pages', () => {
  for (const { name, path } of ALL_PAGES) {
    test(`Nav is visible on ${name} page`, async ({ page }) => {
      await page.goto(path)

      const nav = page.getByRole('navigation', { name: 'LCC website navigation' })
      await expect(nav).toBeVisible()

      await expect(nav.getByText(LCC_NAME)).toBeVisible()

      await expect(nav.getByRole('link', { name: 'Get Started' }).first()).toBeVisible()

      await expect(nav.getByRole('link', { name: 'About' })).toBeVisible()
      await expect(nav.getByRole('link', { name: 'Au Pairs' })).toBeVisible()
      await expect(nav.getByRole('link', { name: 'FAQ' })).toBeVisible()
      await expect(nav.getByRole('link', { name: 'Testimonials' })).toBeVisible()
    })
  }

  test('LCC name link navigates to landing page', async ({ page }) => {
    await page.goto('/about')
    const nav = page.getByRole('navigation', { name: 'LCC website navigation' })
    await nav.getByText(LCC_NAME).click()
    await expect(page).toHaveURL('/')
  })

  test('Active state: About link is highlighted on the about page', async ({ page }) => {
    await page.goto('/about')
    const nav = page.getByRole('navigation', { name: 'LCC website navigation' })
    const aboutLink = nav.getByRole('link', { name: 'About' })
    await expect(aboutLink).toHaveClass(/text-brand-gold/)
  })
})

// ── SITE-07: Hamburger menu on mobile ────────────────────────────────────────

test.describe('SITE-07: Hamburger menu on mobile viewport', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
  })

  test('Desktop nav links are NOT visible on mobile', async ({ page }) => {
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

    await expect(page.getByRole('button', { name: 'Close menu' })).toBeVisible()

    await page.getByRole('button', { name: 'Close menu' }).click()
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible()
  })

  test('Tapping a nav link in dropdown closes the menu', async ({ page }) => {
    await page.getByRole('button', { name: 'Open menu' }).click()

    const dropdown = page.locator('.md\\:hidden.overflow-hidden')
    await expect(dropdown.getByRole('link', { name: 'About' })).toBeVisible()

    await dropdown.getByRole('link', { name: 'About' }).click()

    const dropdownAfter = page.locator('.md\\:hidden.overflow-hidden')
    await expect(dropdownAfter).toHaveClass(/max-h-0/)
  })
})
