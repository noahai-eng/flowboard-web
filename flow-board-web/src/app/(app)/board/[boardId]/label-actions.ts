'use server'

import { revalidatePath } from 'next/cache'

import { z } from 'zod'

import { safeAction, type ActionResult } from '@/lib/action-result'
import { LABEL_COLORS } from '@/lib/labels'
import { createClient } from '@/lib/supabase/server'

const labelSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'Bitte einen Namen eingeben.' })
    .max(40, { error: 'Der Name darf hoechstens 40 Zeichen haben.' }),
  color: z.enum(LABEL_COLORS),
})

export async function createLabel(
  boardId: string,
  name: string,
  color: string,
): Promise<ActionResult<{ id: string; name: string; color: string }>> {
  return safeAction<{ id: string; name: string; color: string }>(async () => {
    const parsed = labelSchema.safeParse({ name, color })
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Ungueltige Eingabe.' }
    }

    const supabase = await createClient()

    // Board-Ownership pruefen (RLS).
    const { data: board } = await supabase
      .from('boards')
      .select('id')
      .eq('id', boardId)
      .maybeSingle()
    if (!board) {
      return { error: 'Board nicht gefunden.' }
    }

    const { data, error } = await supabase
      .from('labels')
      .insert({ board_id: boardId, name: parsed.data.name, color: parsed.data.color })
      .select('id, name, color')
      .single()

    if (error || !data) {
      return { error: 'Label konnte nicht angelegt werden.' }
    }

    revalidatePath(`/board/${boardId}`)
    return { data }
  })
}

export async function assignLabel(cardId: string, labelId: string): Promise<ActionResult> {
  return safeAction(async () => {
    const supabase = await createClient()

    // Card pruefen (RLS) + board_id fuer Revalidation.
    const { data: card } = await supabase
      .from('cards')
      .select('id, board_id')
      .eq('id', cardId)
      .maybeSingle()
    if (!card) {
      return { error: 'Karte nicht gefunden.' }
    }

    // Label muss zum selben Board gehoeren (RLS erzwingt es zusaetzlich).
    const { data: label } = await supabase
      .from('labels')
      .select('id')
      .eq('id', labelId)
      .eq('board_id', card.board_id)
      .maybeSingle()
    if (!label) {
      return { error: 'Label gehoert nicht zu diesem Board.' }
    }

    const { error } = await supabase
      .from('card_labels')
      .insert({ card_id: cardId, label_id: labelId })

    if (error) {
      return { error: 'Label konnte nicht zugewiesen werden.' }
    }

    revalidatePath(`/board/${card.board_id}`)
    return { data: undefined }
  })
}

export async function unassignLabel(cardId: string, labelId: string): Promise<ActionResult> {
  return safeAction(async () => {
    const supabase = await createClient()

    const { data: card } = await supabase
      .from('cards')
      .select('board_id')
      .eq('id', cardId)
      .maybeSingle()

    const { error } = await supabase
      .from('card_labels')
      .delete()
      .eq('card_id', cardId)
      .eq('label_id', labelId)

    if (error) {
      return { error: 'Label konnte nicht entfernt werden.' }
    }

    if (card) revalidatePath(`/board/${card.board_id}`)
    return { data: undefined }
  })
}

export async function setPriority(
  cardId: string,
  priority: number | null,
): Promise<ActionResult> {
  return safeAction(async () => {
    if (priority !== null && ![1, 2, 3, 4].includes(priority)) {
      return { error: 'Ungueltige Prioritaet.' }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('cards')
      .update({ priority })
      .eq('id', cardId)
      .select('board_id')
      .single()

    if (error || !data) {
      return { error: 'Prioritaet konnte nicht gesetzt werden.' }
    }

    revalidatePath(`/board/${data.board_id}`)
    return { data: undefined }
  })
}
