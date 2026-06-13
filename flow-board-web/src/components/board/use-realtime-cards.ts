'use client'

import { useEffect, type Dispatch, type SetStateAction } from 'react'

import type { CardT, ListT } from '@/lib/board-types'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

type CardRow = Database['public']['Tables']['cards']['Row']

// Realtime-Payload enthaelt nur die cards-Spalten (keine Labels). Labels bleiben
// daher beim Merge erhalten (existing) bzw. leer bei Cross-Device-Inserts.
function toCard(row: CardRow, existing?: CardT): CardT {
  return {
    id: row.id,
    list_id: row.list_id,
    title: row.title,
    description: row.description,
    due_date: row.due_date,
    priority: row.priority,
    position: row.position,
    focus_slot: row.focus_slot,
    is_focus_active: row.is_focus_active,
    labels: existing?.labels ?? [],
  }
}

// Idempotent per Card-id: vorhandene Card entfernen, dann in die Ziel-Liste
// (nach position) einsortieren. Dedupe gegen optimistische Eintraege.
function upsertCard(lists: ListT[], row: CardRow): ListT[] {
  const existing = lists.flatMap((l) => l.cards).find((c) => c.id === row.id)
  const card = toCard(row, existing)
  const stripped = lists.map((l) => ({
    ...l,
    cards: l.cards.filter((c) => c.id !== row.id),
  }))
  return stripped.map((l) =>
    l.id === row.list_id
      ? { ...l, cards: [...l.cards, card].sort((a, b) => a.position - b.position) }
      : l,
  )
}

function removeCard(lists: ListT[], id: string): ListT[] {
  return lists.map((l) => ({ ...l, cards: l.cards.filter((c) => c.id !== id) }))
}

// Abonniert cards-Aenderungen des Boards (Cross-Device-Sync, Spec 13).
// EINE event:'*'-Bindung mit board_id-Filter: mehrere getrennte Bindungen
// (INSERT/UPDATE/DELETE) auf demselben Channel werden vom Server unzuverlaessig
// registriert (verifiziert: nur eine feuert). Dank `replica identity full`
// traegt auch der DELETE-old-Record board_id -> der Filter matcht ebenfalls.
// RLS auf cards verhindert Fremd-Board-Events.
export function useRealtimeCards(
  boardId: string,
  setLists: Dispatch<SetStateAction<ListT[]>>,
) {
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`cards:board:${boardId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cards', filter: `board_id=eq.${boardId}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const id = (payload.old as Partial<CardRow>)?.id
            if (id) setLists((prev) => removeCard(prev, id))
          } else {
            setLists((prev) => upsertCard(prev, payload.new as CardRow))
          }
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [boardId, setLists])
}
