'use server'

import { revalidatePath } from 'next/cache'

import { safeAction, type ActionResult } from '@/lib/action-result'
import { createClient } from '@/lib/supabase/server'

function revalidateCardViews(boardId: string) {
  revalidatePath('/focus')
  revalidatePath('/today')
  revalidatePath(`/board/${boardId}`)
}

// Setzt einen Focus-Slot (1–3). Slot-Konflikt wird atomar in der RPC geloest
// (belegter Slot wird vorher freigegeben) -> kein harter Unique-Index-Fehler.
export async function setFocus(cardId: string, slot: number): Promise<ActionResult> {
  return safeAction(async () => {
    if (!Number.isInteger(slot) || slot < 1 || slot > 3) {
      return { error: 'Ungueltiger Focus-Slot.' }
    }
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('set_focus', {
      p_card_id: cardId,
      p_slot: slot,
    })
    if (error || !data) {
      return { error: 'Focus konnte nicht gesetzt werden.' }
    }
    revalidateCardViews(data.board_id)
    return { data: undefined }
  })
}

export async function clearFocus(cardId: string): Promise<ActionResult> {
  return safeAction(async () => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('cards')
      .update({ is_focus_active: false, focus_slot: null })
      .eq('id', cardId)
      .select('board_id')
      .single()
    if (error || !data) {
      return { error: 'Focus konnte nicht entfernt werden.' }
    }
    revalidateCardViews(data.board_id)
    return { data: undefined }
  })
}
