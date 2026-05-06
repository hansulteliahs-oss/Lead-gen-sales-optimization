'use client'

import { useFadeIn } from '@/hooks/useFadeIn'

export default function FadeInSection({ children }: { children: React.ReactNode }) {
  const ref = useFadeIn()
  return <div ref={ref}>{children}</div>
}
