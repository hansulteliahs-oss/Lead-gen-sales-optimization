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
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          navy:   '#fdfaf9',   // bg-brand-navy — header/primary background
          pageBg: '#f7f1ef',   // bg-brand-pageBg — page background
          cardBg: '#fdfaf9',   // bg-brand-cardBg — warm card background
          gold:   '#8fac94',   // border-brand-gold, text-brand-gold — accent (sage green)
          body:   '#3d3535',   // text-brand-body — body text
          muted:  '#9e8a82',   // text-brand-muted — muted/secondary text
        },
      },
    },
  },
  plugins: [],
};
export default config;
