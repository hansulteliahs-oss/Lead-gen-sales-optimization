import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          ink:          'oklch(36% 0.105 358)',
          'ink-soft':   'oklch(36% 0.105 358 / 0.74)',
          'ink-rule':   'oklch(36% 0.105 358 / 0.20)',
          'ink-faint':  'oklch(36% 0.105 358 / 0.08)',
          paper:        'oklch(96.2% 0.022 78)',
          'paper-deep': 'oklch(93% 0.028 74)',
          bark:         'oklch(46% 0.030 45)',
          'bark-soft':  'oklch(46% 0.030 45 / 0.72)',
          spot:         'oklch(60% 0.190 358)',
          'spot-deep':  'oklch(52% 0.200 358)',
        },
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Cormorant Garamond', 'Georgia', 'serif'],
        mono:  ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      transitionTimingFunction: {
        'out-quart': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'out-expo':  'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 200ms cubic-bezier(0.22, 1, 0.36, 1)',
        'accordion-up':   'accordion-up 200ms cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
export default config
