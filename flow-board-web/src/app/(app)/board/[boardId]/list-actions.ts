'use server'

import { revalidatePath } from 'next/cache'

import { z } from 'zod'

import { safeAction, type ActionResult } from '@/lib/action-result'
import { createClient } from '@/lib/supabase/server'

const titleSchema = z
  .string()
  .trim()
  .min(1, { error: 'Bitte einen Titel eingeben.' })
  .max(120, { error: 'Der Titel darf hoechstens 120 Zeichen haben.' })

export async function createList(
  boardId: string,
  title: string,
): Promise<ActionResult<{ id: string; position: number }>> {
  return safeAction<{ id: string; position: number }>(async () => {
    const parsed = titleSchema.safeParse(title)
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Ungueltiger Titel.' }
    }

    const supabase = await createClient()

    // Board-Ownership pruefen (RLS liefert fremde Boards als null).
    const { data: board } = await supabase
      .from('boards')
      .select('id')
      .eq('id', boardId)
      .maybeSingle()
    if (!board) {
      return { error: 'Board nicht gefunden.' }
    }

    // Position ans Ende der Liste in diesem Board.
    const { data: last, error: lastError } = await supabase
      .from('lists')
      .select('position')
      .eq('board_id', boardId)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (lastError) {
      return { error: 'Liste konnte nicht angelegt werden.' }
    }
    const position = (last?.position ?? 0) + 1000

    const { data, error } = await supabase
      .from('lists')
      .insert({ board_id: boardId, title: parsed.data, position })
      .select('id, position')
      .single()

    if (error || !data) {
      return { error: 'Liste konnte nicht angelegt werden.' }
    }

    revalidatePath(`/board/${boardId}`)
    return { data: { id: data.id, position: data.position } }
  })
}

export async function renameList(id: string, title: string): Promise<ActionResult> {
  return safeAction(async () => {
    const parsed = titleSchema.safeParse(title)
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Ungueltiger Titel.' }
    }

    const supabase = await createClient()
    // .select().single() -> 0 betroffene Rows (RLS/unbekannt) werden zum Fehler.
    const { data, error } = await supabase
      .from('lists')
      .update({ title: parsed.data })
      .eq('id', id)
      .select('board_id')
      .single()

    if (error || !data) {
      return { error: 'Liste konnte nicht umbenannt werden.' }
    }

    revalidatePath(`/board/${data.board_id}`)
    return { data: undefined }
  })
}

export async function deleteList(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    const supabase = await createClient()
    // Cascade loescht Cards. RLS sichert Ownership. .select().single() -> 0 Rows = Fehler.
    const { data, error } = await supabase
      .from('lists')
      .delete()
      .eq('id', id)
      .select('board_id')
      .single()

    if (error || !data) {
      return { error: 'Liste konnte nicht geloescht werden.' }
    }

    revalidatePath(`/board/${data.board_id}`)
    return { data: undefined }
  })
}
