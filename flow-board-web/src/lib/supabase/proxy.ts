import { NextResponse, type NextRequest } from 'next/server'

import { createServerClient } from '@supabase/ssr'

import type { Database } from './database.types'

// Cookie-Refresh + Auth-Gate. Wird von der Root-proxy.ts pro Request aufgerufen.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // WICHTIG: kein Code zwischen createServerClient und getClaims().
  // getClaims() treibt den Cookie-Refresh an; dazwischenliegender Code
  // verursacht zufaellige Logouts.
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims
  const { pathname } = request.nextUrl

  // Hilfsfunktion: Redirect mit uebernommenen (refreshten) Cookies.
  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone()
    url.pathname = path
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) =>
      redirectResponse.cookies.set(cookie),
    )
    return redirectResponse
  }

  // Spec 16: '/' ist die oeffentliche Landingpage (ausgeloggt erreichbar).
  // Eingeloggte werden NUR von '/' auf '/board' geleitet (kein Loop, da
  // /login + /signup + Assets bereits ueber config.matcher ausgenommen sind).
  if (pathname === '/') {
    return claims ? redirectTo('/board') : supabaseResponse
  }

  // Auth-Gate: Nicht eingeloggte auf /login leiten. /login + /signup sind
  // bereits ueber config.matcher ausgenommen, daher hier nur der Schutzfall.
  if (!claims) {
    // Shared HTTP-Endpunkte (auch Expo): 401 statt HTML-Redirect.
    if (pathname === '/api' || pathname.startsWith('/api/')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    return redirectTo('/login')
  }

  // supabaseResponse unveraendert zurueckgeben (Cookies nicht anfassen),
  // sonst geraten Browser- und Server-Session out of sync.
  return supabaseResponse
}
