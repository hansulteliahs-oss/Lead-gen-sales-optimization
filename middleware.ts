import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // CRITICAL: getClaims() validates JWT cryptographic signature server-side.
  // Do NOT use getSession() — it trusts unverified cookie data and is insecure.
  // If getClaims() is ever removed from @supabase/supabase-js, fall back to
  // getUser() which also makes a server-side network call to validate the token.
  // Never fall back to getSession().
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  const { pathname } = request.nextUrl

  // Public routes — allow through without auth check
  if (pathname === '/login') {
    return supabaseResponse
  }

  // Not authenticated — redirect to login
  if (!claims) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Authenticated — enforce role-based route access
  const role = claims.app_metadata?.role as string | undefined

  // LCC attempting to access /operator routes → redirect to their dashboard
  if (pathname.startsWith('/operator') && role !== 'operator') {
    return NextResponse.redirect(new URL('/lcc/dashboard', request.url))
  }

  // Operator attempting to access /lcc routes → redirect to their dashboard
  if (pathname.startsWith('/lcc') && role !== 'lcc') {
    return NextResponse.redirect(new URL('/operator/dashboard', request.url))
  }

  // /dashboard is the post-login hub — route by role
  if (pathname === '/dashboard') {
    if (role === 'operator') {
      return NextResponse.redirect(new URL('/operator/dashboard', request.url))
    }
    if (role === 'lcc') {
      return NextResponse.redirect(new URL('/lcc/dashboard', request.url))
    }
    // Unknown role — send back to login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Match all routes except Next.js internals, static files, and API routes
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}
