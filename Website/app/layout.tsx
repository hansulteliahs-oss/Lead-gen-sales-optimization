import type { Metadata } from 'next'
import { Fraunces, JetBrains_Mono } from 'next/font/google'
import LccWebNav from '@/components/LccWebNav'
import LccWebFooter from '@/components/LccWebFooter'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['SOFT', 'opsz'],
  variable: '--font-fraunces',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Au Pair Consultant — Newport Beach & Southern California | Kim Arvdalen',
  description:
    'Connect with your Local Childcare Consultant and discover the au pair program.',
  other: {
    'geo.region': 'US-CA',
    'geo.placename': 'Newport Beach, California',
    'geo.position': '33.6189;-117.9289',
    ICBM: '33.6189, -117.9289',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${jetbrains.variable} scroll-smooth`}>
      <body className="font-serif antialiased">
        <LccWebNav lccName="Kim Arvdalen" />
        <main className="bg-brand-paper min-h-screen">{children}</main>
        <LccWebFooter lccName="Kim Arvdalen" />
      </body>
    </html>
  )
}
