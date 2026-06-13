'use client'

import { useState } from 'react'

import { deleteCard, updateCard } from '@/app/(app)/board/[boardId]/card-actions'
import {
  assignLabel,
  createLabel,
  setPriority,
  unassignLabel,
} from '@/app/(app)/board/[boardId]/label-actions'
import { clearFocus, setFocus } from '@/app/(app)/focus/focus-actions'
import type { CardPatch } from '@/components/card/card-detail-dialog'
import type { CardLabel, SmartCardT } from '@/lib/board-types'
import type { LabelColor } from '@/lib/labels'

type Options = {
  initialCards: SmartCardT[]
  initialLabelsByBoard: Record<string, CardLabel[]>
  /** Heute-View: Card aus der Liste entfernen, sobald sie nicht mehr heute faellig ist. */
  dropWhenNotToday?: boolean
  /** Timezone des Users (profiles.timezone) fuer den Heute-Abgleich. */
  timezone?: string
  /** Focus-View: Card entfernen, sobald sie nicht mehr aktiv fokussiert ist. */
  dropWhenNotFocus?: boolean
}

function sameDayInTz(iso: string, tz: string) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return fmt.format(new Date(iso)) === fmt.format(new Date())
}

// Gemeinsame optimistische Handler fuer board-uebergreifende Smart-Views
// (Heute/Focus). Nutzt dieselben Server Actions wie die Board-Ansicht; die
// Mutationen sind board-agnostisch (nehmen card-/label-ids direkt).
export function useSmartCardActions({
  initialCards,
  initialLabelsByBoard,
  dropWhenNotToday = false,
  timezone,
  dropWhenNotFocus = false,
}: Options) {
  const [cards, setCards] = useState<SmartCardT[]>(initialCards)
  const [labelsByBoard, setLabelsByBoard] =
    useState<Record<string, CardLabel[]>>(initialLabelsByBoard)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedCard = cards.find((c) => c.id === selectedId) ?? null
  const boardLabels = selectedCard
    ? (labelsByBoard[selectedCard.board_id] ?? [])
    : []

  function patchCard(id: string, fn: (card: SmartCardT) => SmartCardT) {
    setCards((prev) => prev.map((c) => (c.id === id ? fn(c) : c)))
  }

  async function handleUpdateCard(id: string, patch: CardPatch) {
    const previous = cards.find((c) => c.id === id)
    if (!previous) return
    patchCard(id, (c) => ({ ...c, ...patch }))

    const result = await updateCard(id, patch)
    if ('error' in result) {
      // Nur zuruecksetzen, wenn das Feld noch den optimistischen Wert dieses
      // Requests traegt -> ein spaeterer erfolgreicher Patch wird nicht ueber-
      // schrieben (Race bei schnellen Folge-Edits).
      patchCard(id, (c) => {
        const reverted = { ...c }
        if ('title' in patch && c.title === patch.title) reverted.title = previous.title
        if ('description' in patch && c.description === patch.description) {
          reverted.description = previous.description
        }
        if ('due_date' in patch && c.due_date === patch.due_date) {
          reverted.due_date = previous.due_date
        }
        return reverted
      })
      return
    }

    // Heute-View: faellt die Card aus dem Heute-Fenster, aus der Liste nehmen.
    if (dropWhenNotToday && 'due_date' in patch && timezone) {
      const stillToday =
        typeof patch.due_date === 'string' && sameDayInTz(patch.due_date, timezone)
      if (!stillToday) {
        setCards((prev) => prev.filter((c) => c.id !== id))
        setSelectedId((cur) => (cur === id ? null : cur))
      }
    }
  }

  async function handleSetPriority(id: string, priority: number | null) {
    const previous = cards.find((c) => c.id === id)?.priority ?? null
    patchCard(id, (c) => ({ ...c, priority }))
    const result = await setPriority(id, priority)
    if ('error' in result) patchCard(id, (c) => ({ ...c, priority: previous }))
  }

  async function handleAssignLabel(cardId: string, labelId: string) {
    const card = cards.find((c) => c.id === cardId)
    const label = card ? (labelsByBoard[card.board_id] ?? []).find((l) => l.id === labelId) : undefined
    if (!label) return
    patchCard(cardId, (c) =>
      c.labels.some((x) => x.id === labelId) ? c : { ...c, labels: [...c.labels, label] },
    )
    const result = await assignLabel(cardId, labelId)
    if ('error' in result) {
      patchCard(cardId, (c) => ({ ...c, labels: c.labels.filter((x) => x.id !== labelId) }))
    }
  }

  async function handleUnassignLabel(cardId: string, labelId: string) {
    const removed = cards.find((c) => c.id === cardId)?.labels.find((x) => x.id === labelId)
    patchCard(cardId, (c) => ({ ...c, labels: c.labels.filter((x) => x.id !== labelId) }))
    const result = await unassignLabel(cardId, labelId)
    if ('error' in result && removed) {
      patchCard(cardId, (c) =>
        c.labels.some((x) => x.id === labelId) ? c : { ...c, labels: [...c.labels, removed] },
      )
    }
  }

  async function handleCreateLabel(
    name: string,
    color: LabelColor,
  ): Promise<CardLabel | null> {
    if (!selectedCard) return null
    const boardId = selectedCard.board_id
    const result = await createLabel(boardId, name, color)
    if ('error' in result) return null
    setLabelsByBoard((prev) => ({
      ...prev,
      [boardId]: [...(prev[boardId] ?? []), result.data],
    }))
    return result.data
  }

  async function handleDeleteCard(id: string) {
    const index = cards.findIndex((c) => c.id === id)
    const removed = cards[index]
    setCards((prev) => prev.filter((c) => c.id !== id))
    setSelectedId((cur) => (cur === id ? null : cur))

    const result = await deleteCard(id)
    if ('error' in result && removed) {
      setCards((prev) => {
        const next = [...prev]
        next.splice(index, 0, removed)
        return next
      })
    }
  }

  async function handleSetFocus(cardId: string, slot: number) {
    const snapshot = cards
    setCards((prev) => {
      const next = prev.map((c) => {
        if (c.id === cardId) return { ...c, focus_slot: slot, is_focus_active: true }
        // belegter Slot wird (auch optimistisch) freigegeben
        if (c.is_focus_active && c.focus_slot === slot) {
          return { ...c, focus_slot: null, is_focus_active: false }
        }
        return c
      })
      return dropWhenNotFocus ? next.filter((c) => c.is_focus_active) : next
    })
    const result = await setFocus(cardId, slot)
    if ('error' in result) setCards(snapshot)
  }

  async function handleClearFocus(cardId: string) {
    const snapshot = cards
    const selectedSnapshot = selectedId
    setCards((prev) => {
      const next = prev.map((c) =>
        c.id === cardId ? { ...c, focus_slot: null, is_focus_active: false } : c,
      )
      return dropWhenNotFocus ? next.filter((c) => c.is_focus_active) : next
    })
    setSelectedId((cur) => (dropWhenNotFocus && cur === cardId ? null : cur))
    const result = await clearFocus(cardId)
    if ('error' in result) {
      setCards(snapshot)
      setSelectedId(selectedSnapshot)
    }
  }

  // Auto-Kategorisierung (Spec 15): RPC hat bereits persistiert -> lokal angleichen.
  function handleCategoryApplied(
    cardId: string,
    patch: { priority: number | null; label: CardLabel | null },
  ) {
    patchCard(cardId, (c) => {
      const labels =
        patch.label && !c.labels.some((l) => l.id === patch.label!.id)
          ? [...c.labels, patch.label]
          : c.labels
      return { ...c, priority: patch.priority ?? c.priority, labels }
    })
  }

  return {
    cards,
    selectedCard,
    boardLabels,
    open: (id: string) => setSelectedId(id),
    close: () => setSelectedId(null),
    handleUpdateCard,
    handleSetPriority,
    handleAssignLabel,
    handleUnassignLabel,
    handleCreateLabel,
    handleDeleteCard,
    handleSetFocus,
    handleClearFocus,
    handleCategoryApplied,
  }
}
