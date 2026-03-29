import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default function LccLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-pageBg">
      <header className="bg-brand-navy border-b border-brand-gold/20 flex items-center justify-between px-6 py-2">
        <span className="font-semibold text-lg text-brand-body">LCC Lead Engine</span>
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm text-brand-muted hover:text-brand-body transition-colors"
          >
            Logout
          </button>
        </form>
      </header>
      <main>{children}</main>
    </div>
  )
}
