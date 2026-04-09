import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary:      '#C9637A',  // dusty rose — CTAs, accents, links
          primaryHover: '#B5566C',  // darker rose on hover
          surface:      '#FFF5F7',  // light pink tint — alternate section backgrounds
          border:       '#F3E6E9',  // soft pink border
          body:         '#111827',  // dark charcoal — primary text
          muted:        '#6B7280',  // medium gray — secondary text
          card:         '#FFFFFF',  // white — card backgrounds
        },
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
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
export default config;
