import { TodayView } from '@/components/today/today-view'
import type { CardLabel, SmartCardT } from '@/lib/board-types'
import { createClient } from '@/lib/supabase/server'

// Smart-View "Heute": board-uebergreifend alle heute-faelligen Cards (User-TZ).
// Datenquelle ist die View today_cards (security_invoker -> RLS greift).
export default async function TodayPage() {
  const supabase = await createClient()

  const [profileResult, cardResult, boardResult, labelResult] = await Promise.all([
    supabase.from('profiles').select('timezone').maybeSingle(),
    supabase
      .from('today_cards')
      .select(
        'id, list_id, board_id, title, description, due_date, priority, position, focus_slot, is_focus_active',
      )
      .order('priority', { ascending: true, nullsFirst: false })
      .order('due_date', { ascending: true }),
    supabase.from('boards').select('id, title'),
    supabase.from('labels').select('id, name, color, board_id'),
  ])

  const timezone = profileResult.data?.timezone ?? 'Europe/Vienna'
  const boardTitle = new Map((boardResult.data ?? []).map((b) => [b.id, b.title]))

  // Labels je Board fuer den Label-Picker im Detail-Modal.
  const labelsByBoard: Record<string, CardLabel[]> = {}
  for (const l of labelResult.data ?? []) {
    const bucket = labelsByBoard[l.board_id] ?? (labelsByBoard[l.board_id] = [])
    bucket.push({ id: l.id, name: l.name, color: l.color })
  }
  const labelById = new Map(
    (labelResult.data ?? []).map((l) => [l.id, { id: l.id, name: l.name, color: l.color }]),
  )

  const rows = (cardResult.data ?? []).filter(
    (c): c is typeof c & { id: string; list_id: string; board_id: string; title: string; due_date: string } =>
      Boolean(c.id && c.list_id && c.board_id && c.title && c.due_date),
  )

  // Card-Label-Zuordnungen aufloesen.
  const cardIds = rows.map((c) => c.id)
  const { data: cardLabelRows } = cardIds.length
    ? await supabase.from('card_labels').select('card_id, label_id').in('card_id', cardIds)
    : { data: [] }

  const labelsByCard = new Map<string, CardLabel[]>()
  for (const cl of cardLabelRows ?? []) {
    const label = labelById.get(cl.label_id)
    if (!label) continue
    const bucket = labelsByCard.get(cl.card_id) ?? []
    bucket.push(label)
    labelsByCard.set(cl.card_id, bucket)
  }

  const cards: SmartCardT[] = rows.map((c) => ({
    id: c.id,
    list_id: c.list_id,
    title: c.title,
    description: c.description,
    due_date: c.due_date,
    priority: c.priority,
    position: c.position ?? 0,
    focus_slot: c.focus_slot,
    is_focus_active: c.is_focus_active ?? false,
    board_id: c.board_id,
    board_title: boardTitle.get(c.board_id) ?? 'Board',
    labels: labelsByCard.get(c.id) ?? [],
  }))

  return (
    <TodayView initialCards={cards} initialLabelsByBoard={labelsByBoard} timezone={timezone} />
  )
}
