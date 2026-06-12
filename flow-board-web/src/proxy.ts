import { type NextRequest } from 'next/server'

import { updateSession } from '@/lib/supabase/proxy'

// Next 16: heisst `proxy` (nicht mehr `middleware`), Runtime ist nodejs.
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Alle Requests ausser static assets, Bilder und den Auth-Routen.
    '/((?!_next/static|_next/image|favicon.ico|login|signup|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
