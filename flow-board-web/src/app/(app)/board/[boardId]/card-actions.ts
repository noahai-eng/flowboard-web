'use server'

import { revalidatePath } from 'next/cache'

import { z } from 'zod'

import { safeAction, type ActionResult } from '@/lib/action-result'
import { cardSuggestionSchema } from '@/lib/ai/card-suggestion'
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

export type GeneratedCard = {
  id: string
  list_id: string
  title: string
  description: string | null
  priority: number | null
  position: number
}

const suggestionsSchema = z.array(cardSuggestionSchema).min(1).max(12)

// Spec 14: mehrere KI-Vorschlaege gebuendelt in eine Liste uebernehmen.
// Ein Insert -> korrekte Positionen, owner via Default (auth.uid), RLS-geschuetzt.
export async function createGeneratedCards(
  listId: string,
  suggestions: unknown,
): Promise<ActionResult<GeneratedCard[]>> {
  return safeAction<GeneratedCard[]>(async () => {
    const parsed = suggestionsSchema.safeParse(suggestions)
    if (!parsed.success) {
      return { error: 'Ungueltige Vorschlaege.' }
    }

    const supabase = await createClient()

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
      return { error: 'Karten konnten nicht angelegt werden.' }
    }
    const start = (last?.position ?? 0) + 1000

    const rows = parsed.data.map((s, i) => ({
      list_id: listId,
      board_id: list.board_id,
      title: s.title,
      description: s.description ?? null,
      priority: s.priority ?? null,
      position: start + i * 1000,
    }))

    const { data, error } = await supabase
      .from('cards')
      .insert(rows)
      .select('id, list_id, title, description, priority, position')

    if (error || !data) {
      return { error: 'Karten konnten nicht angelegt werden.' }
    }

    revalidatePath(`/board/${list.board_id}`)
    return { data }
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
