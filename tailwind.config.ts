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
          navy:   '#1a1a2e',   // bg-brand-navy — header/primary background
          pageBg: '#f5f5f5',   // bg-brand-pageBg — page background
          cardBg: '#f8f4f0',   // bg-brand-cardBg — warm card background
          gold:   '#c9a96e',   // border-brand-gold, text-brand-gold — accent
          body:   '#444444',   // text-brand-body — body text
          muted:  '#999999',   // text-brand-muted — muted/secondary text
        },
      },
    },
  },
  plugins: [],
};
export default config;
