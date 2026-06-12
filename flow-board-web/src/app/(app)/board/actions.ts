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

export async function createBoard(title: string): Promise<ActionResult<{ id: string }>> {
  return safeAction<{ id: string }>(async () => {
    const parsed = titleSchema.safeParse(title)
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Ungueltiger Titel.' }
    }

    const supabase = await createClient()

    // Position ans Ende: hoechste vorhandene Position + 1000.
    const { data: last, error: lastError } = await supabase
      .from('boards')
      .select('position')
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (lastError) {
      return { error: 'Board konnte nicht angelegt werden.' }
    }
    const position = (last?.position ?? 0) + 1000

    const { data, error } = await supabase
      .from('boards')
      .insert({ title: parsed.data, position })
      .select('id')
      .single()

    if (error || !data) {
      return { error: 'Board konnte nicht angelegt werden.' }
    }

    revalidatePath('/', 'layout')
    return { data: { id: data.id } }
  })
}

export async function renameBoard(id: string, title: string): Promise<ActionResult> {
  return safeAction(async () => {
    const parsed = titleSchema.safeParse(title)
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Ungueltiger Titel.' }
    }

    const supabase = await createClient()
    // RLS sichert Ownership (owner = auth.uid()).
    const { error } = await supabase
      .from('boards')
      .update({ title: parsed.data })
      .eq('id', id)

    if (error) {
      return { error: 'Board konnte nicht umbenannt werden.' }
    }

    revalidatePath('/', 'layout')
    return { data: undefined }
  })
}

export async function deleteBoard(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    const supabase = await createClient()
    // Cascade loescht Lists + Cards. RLS sichert Ownership.
    const { error } = await supabase.from('boards').delete().eq('id', id)

    if (error) {
      return { error: 'Board konnte nicht geloescht werden.' }
    }

    revalidatePath('/', 'layout')
    return { data: undefined }
  })
}
