import { notFound } from 'next/navigation'

import { BoardMenu } from '@/components/board/board-menu'
import { BoardView } from '@/components/board/board-view'
import type { CardLabel, CardT, ListT } from '@/lib/board-types'
import { createClient } from '@/lib/supabase/server'

type BoardPageProps = {
  params: Promise<{ boardId: string }>
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { boardId } = await params
  const supabase = await createClient()

  // RLS filtert auf den Owner -> fremde/unbekannte Boards liefern null.
  const { data: board } = await supabase
    .from('boards')
    .select('id, title')
    .eq('id', boardId)
    .maybeSingle()

  if (!board) {
    notFound()
  }

  const [{ data: listRows }, { data: cardRows }, { data: labelRows }] = await Promise.all([
    supabase
      .from('lists')
      .select('id, title, position')
      .eq('board_id', boardId)
      .order('position', { ascending: true }),
    supabase
      .from('cards')
      .select('id, list_id, title, description, due_date, priority, position')
      .eq('board_id', boardId)
      .order('position', { ascending: true }),
    supabase
      .from('labels')
      .select('id, name, color')
      .eq('board_id', boardId)
      .order('created_at', { ascending: true }),
  ])

  const boardLabels: CardLabel[] = labelRows ?? []
  const cardIds = (cardRows ?? []).map((c) => c.id)

  // Card-Label-Zuordnungen laden und je Card aufloesen.
  const { data: cardLabelRows } = cardIds.length
    ? await supabase.from('card_labels').select('card_id, label_id').in('card_id', cardIds)
    : { data: [] }

  const labelById = new Map(boardLabels.map((l) => [l.id, l]))
  const labelsByCard = new Map<string, CardLabel[]>()
  for (const cl of cardLabelRows ?? []) {
    const label = labelById.get(cl.label_id)
    if (!label) continue
    const bucket = labelsByCard.get(cl.card_id) ?? []
    bucket.push(label)
    labelsByCard.set(cl.card_id, bucket)
  }

  // Cards nach Liste gruppieren (inkl. aufgeloester Labels).
  const cardsByList = new Map<string, CardT[]>()
  for (const card of cardRows ?? []) {
    const bucket = cardsByList.get(card.list_id) ?? []
    bucket.push({ ...card, labels: labelsByCard.get(card.id) ?? [] })
    cardsByList.set(card.list_id, bucket)
  }

  const lists: ListT[] = (listRows ?? []).map((l) => ({
    ...l,
    cards: cardsByList.get(l.id) ?? [],
  }))

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-border/60 bg-card/30 px-5 py-3.5 backdrop-blur-sm">
        <BoardMenu board={board} />
      </header>

      <div className="min-h-0 flex-1">
        <BoardView boardId={board.id} initialLists={lists} initialLabels={boardLabels} />
      </div>
    </div>
  )
}
