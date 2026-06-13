'use server'

import { safeAction, type ActionResult } from '@/lib/action-result'
import type { SearchResultT } from '@/lib/board-types'
import { createClient } from '@/lib/supabase/server'

// Volltextsuche ueber Cards (Titel + Beschreibung), deutsch. RLS filtert auf
// eigene Cards. websearch_to_tsquery erlaubt natuerliche Eingaben
// ("foo -bar \"exakt\""). Nutzt den GIN-Index cards_search_gin.
export async function searchCards(
  query: string,
): Promise<ActionResult<SearchResultT[]>> {
  return safeAction<SearchResultT[]>(async () => {
    const q = query.trim()
    if (q.length === 0) return { data: [] }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('cards')
      .select('id, title, board_id, boards(title)')
      .textSearch('search', q, { type: 'websearch', config: 'german' })
      .limit(20)

    if (error) {
      return { error: 'Suche fehlgeschlagen.' }
    }

    const results: SearchResultT[] = (data ?? []).map((row) => {
      const board = row.boards as { title: string } | { title: string }[] | null
      const board_title = Array.isArray(board)
        ? (board[0]?.title ?? 'Board')
        : (board?.title ?? 'Board')
      return { id: row.id, title: row.title, board_id: row.board_id, board_title }
    })
    return { data: results }
  })
}
