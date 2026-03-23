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
      <header className="bg-brand-navy text-white flex items-center justify-between px-6 py-4">
        <span className="font-semibold text-lg">LCC Lead Engine</span>
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm text-white/80 hover:text-white transition-colors"
          >
            Logout
          </button>
        </form>
      </header>
      <main>{children}</main>
    </div>
  )
}
