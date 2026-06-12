'use server'

import { revalidatePath } from 'next/cache'

import { z } from 'zod'

import { safeAction, type ActionResult } from '@/lib/action-result'
import { createClient } from '@/lib/supabase/server'

const titleSchema = z
  .string()
  .trim()
  .min(1, { error: 'Bitte einen Titel eingeben.' })
  .max(200, { error: 'Der Titel darf hoechstens 200 Zeichen haben.' })

export async function createCard(
  listId: string,
  title: string,
): Promise<ActionResult<{ id: string; position: number }>> {
  return safeAction<{ id: string; position: number }>(async () => {
    const parsed = titleSchema.safeParse(title)
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Ungueltiger Titel.' }
    }

    const supabase = await createClient()

    // Liste pruefen + board_id ableiten (RLS: fremde Liste -> null).
    const { data: list } = await supabase
      .from('lists')
      .select('id, board_id')
      .eq('id', listId)
      .maybeSingle()
    if (!list) {
      return { error: 'Liste nicht gefunden.' }
    }

    const { data: last, error: lastError } = await supabase
      .from('cards')
      .select('position')
      .eq('list_id', listId)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (lastError) {
      return { error: 'Karte konnte nicht angelegt werden.' }
    }
    const position = (last?.position ?? 0) + 1000

    const { data, error } = await supabase
      .from('cards')
      .insert({
        list_id: listId,
        board_id: list.board_id,
        title: parsed.data,
        position,
      })
      .select('id, position')
      .single()

    if (error || !data) {
      return { error: 'Karte konnte nicht angelegt werden.' }
    }

    revalidatePath(`/board/${list.board_id}`)
    return { data: { id: data.id, position: data.position } }
  })
}

export async function updateCardTitle(id: string, title: string): Promise<ActionResult> {
  return safeAction(async () => {
    const parsed = titleSchema.safeParse(title)
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Ungueltiger Titel.' }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('cards')
      .update({ title: parsed.data })
      .eq('id', id)
      .select('board_id')
      .single()

    if (error || !data) {
      return { error: 'Karte konnte nicht aktualisiert werden.' }
    }

    revalidatePath(`/board/${data.board_id}`)
    return { data: undefined }
  })
}

const updateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: 'Bitte einen Titel eingeben.' })
    .max(200, { error: 'Der Titel darf hoechstens 200 Zeichen haben.' })
    .optional(),
  description: z.string().max(5000).nullable().optional(),
  due_date: z.string().nullable().optional(),
})

export async function updateCard(
  id: string,
  patch: { title?: string; description?: string | null; due_date?: string | null },
): Promise<ActionResult> {
  return safeAction(async () => {
    const parsed = updateSchema.safeParse(patch)
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Ungueltige Eingabe.' }
    }
    if (Object.keys(parsed.data).length === 0) {
      return { data: undefined }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('cards')
      .update(parsed.data)
      .eq('id', id)
      .select('board_id')
      .single()

    if (error || !data) {
      return { error: 'Karte konnte nicht aktualisiert werden.' }
    }

    revalidatePath(`/board/${data.board_id}`)
    return { data: undefined }
  })
}

export async function moveCard(
  cardId: string,
  targetListId: string,
  beforeCardId: string | null,
  afterCardId: string | null,
): Promise<ActionResult> {
  return safeAction(async () => {
    const supabase = await createClient()
    // Atomar in der RPC: Anchor-Positionen frisch lesen, Reindex bei Bedarf.
    const { data, error } = await supabase.rpc('move_card', {
      p_card_id: cardId,
      p_target_list_id: targetListId,
      p_before_card_id: beforeCardId as string,
      p_after_card_id: afterCardId as string,
    })

    if (error || !data) {
      return { error: 'Karte konnte nicht verschoben werden.' }
    }

    revalidatePath(`/board/${data.board_id}`)
    return { data: undefined }
  })
}

export async function deleteCard(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id)
      .select('board_id')
      .single()

    if (error || !data) {
      return { error: 'Karte konnte nicht geloescht werden.' }
    }

    revalidatePath(`/board/${data.board_id}`)
    return { data: undefined }
  })
}
