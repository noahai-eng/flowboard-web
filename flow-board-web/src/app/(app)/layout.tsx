import type { ReactNode } from 'react'

import { Sidebar } from '@/components/app-shell/sidebar'
import { ViewFade } from '@/components/app-shell/view-fade'
import { createClient } from '@/lib/supabase/server'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()

  // RLS filtert auf den eingeloggten User -> nur eigene Boards. getClaims
  // liefert zusaetzlich die Email fuer das User-Menue.
  const [boardsResult, claimsResult] = await Promise.all([
    supabase.from('boards').select('id, title').order('position', { ascending: true }),
    supabase.auth.getClaims(),
  ])

  // Fetch-Fehler nicht verschlucken: serverseitig loggen, in der UI als
  // Fehlerzustand (statt "keine Boards") unterscheidbar machen.
  if (boardsResult.error) {
    console.error('[app-layout] Boards laden fehlgeschlagen:', boardsResult.error.message)
  }

  const boards = boardsResult.data ?? []
  const boardsError = Boolean(boardsResult.error)
  const email =
    typeof claimsResult.data?.claims?.email === 'string'
      ? claimsResult.data.claims.email
      : ''

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <Sidebar boards={boards} boardsError={boardsError} email={email} />
      <main className="flex-1 overflow-y-auto">
        <ViewFade>{children}</ViewFade>
      </main>
    </div>
  )
}
