import { createClient } from '@supabase/supabase-js'

// IMPORTANT: Only call this from server-side code (Server Actions, Route Handlers, middleware).
// NEVER import this file in Client Components — SUPABASE_SERVICE_ROLE_KEY must not reach the browser.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
