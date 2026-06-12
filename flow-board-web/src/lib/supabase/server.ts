import { cookies } from 'next/headers'

import { createServerClient } from '@supabase/ssr'

import type { Database } from './database.types'

// Server-Client fuer Server Components / Actions / Route Handlers.
// cookies() ist in Next 16 async -> Factory ist async, immer `await createClient()`.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // In Server Components ist set nicht erlaubt -> ignorieren.
            // Der Cookie-Refresh laeuft ueber proxy.ts.
          }
        },
      },
    },
  )
}
