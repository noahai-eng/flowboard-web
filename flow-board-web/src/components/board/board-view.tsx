'use client'

import { useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'

import {
  createCard,
  deleteCard,
  moveCard,
  updateCard,
  type GeneratedCard,
} from '@/app/(app)/board/[boardId]/card-actions'
import {
  assignLabel,
  createLabel,
  setPriority,
  unassignLabel,
} from '@/app/(app)/board/[boardId]/label-actions'
import { clearFocus, setFocus } from '@/app/(app)/focus/focus-actions'
import { createList, deleteList, renameList } from '@/app/(app)/board/[boardId]/list-actions'
import { useRealtimeCards } from '@/components/board/use-realtime-cards'
import { CardDetailDialog, type CardPatch } from '@/components/card/card-detail-dialog'
import { AddList } from '@/components/list/add-list'
import { ListColumn } from '@/components/list/list-column'
import type { CardLabel, CardT, ListT } from '@/lib/board-types'
import type { LabelColor } from '@/lib/labels'

type BoardViewProps = {
  boardId: string
  initialLists: ListT[]
  initialLabels: CardLabel[]
}

const isTemp = (id: string) => id.startsWith('temp-')

export function BoardView({ boardId, initialLists, initialLabels }: BoardViewProps) {
  const [lists, setLists] = useState<ListT[]>(initialLists)
  const [labels, setLabels] = useState<CardLabel[]>(initialLabels)
  const [activeCard, setActiveCard] = useState<CardT | null>(null)
  // Volltextsuche (Spec 12): ?card=<id> oeffnet die Karte direkt beim Laden.
  const searchParams = useSearchParams()
  const cardParam = searchParams.get('card')
  const [selectedId, setSelectedId] = useState<string | null>(() => cardParam)
  // Klick auf ein Suchergebnis des AKTUELLEN Boards aendert nur den Query-Param
  // (kein Remount) -> der useState-Initializer feuert nicht erneut. Param-Wechsel
  // waehrend des Renders abgleichen (React-empfohlen statt Effect+setState) und die
  // Karte oeffnen. Schliessen setzt nur selectedId (nicht den Param) -> kein
  // ungewolltes Wiederoeffnen, da der Param unveraendert bleibt.
  const [seenCardParam, setSeenCardParam] = useState(cardParam)
  if (cardParam !== seenCardParam) {
    setSeenCardParam(cardParam)
    if (cardParam) setSelectedId(cardParam)
  }
  const selectedCard = lists.flatMap((l) => l.cards).find((c) => c.id === selectedId) ?? null
  // Snapshot vor dem Drag fuer Rollback bei Persistenz-Fehler.
  const snapshotRef = useRef<ListT[] | null>(null)
  // Merkt, ob waehrend dieses Drags ein Cross-List-Move passiert ist.
  // Cross-List wird in onDragOver positioniert, Same-List in onDragEnd (arrayMove)
  // -> verhindert doppeltes Verschieben (Off-by-one).
  const didCrossRef = useRef(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // Cross-Device-Sync (Spec 13): cards-Aenderungen dieses Boards live mergen.
  useRealtimeCards(boardId, setLists)

  // --- Listen-Handler --------------------------------------------------------

  async function handleAddList(title: string) {
    const tempId = `temp-${crypto.randomUUID()}`
    const position =
      lists.length > 0 ? Math.max(...lists.map((l) => l.position)) + 1000 : 1000
    setLists((prev) => [...prev, { id: tempId, title, position, cards: [] }])

    const result = await createList(boardId, title)
    if ('error' in result) {
      setLists((prev) => prev.filter((l) => l.id !== tempId))
      return
    }
    setLists((prev) =>
      prev.map((l) =>
        l.id === tempId ? { ...l, id: result.data.id, position: result.data.position } : l,
      ),
    )
  }

  async function handleRenameList(id: string, title: string) {
    const previous = lists.find((l) => l.id === id)?.title
    setLists((prev) => prev.map((l) => (l.id === id ? { ...l, title } : l)))

    const result = await renameList(id, title)
    if ('error' in result && previous !== undefined) {
      setLists((prev) => prev.map((l) => (l.id === id ? { ...l, title: previous } : l)))
    }
  }

  async function handleDeleteList(id: string) {
    const index = lists.findIndex((l) => l.id === id)
    const removed = lists[index]
    setLists((prev) => prev.filter((l) => l.id !== id))

    const result = await deleteList(id)
    if ('error' in result && removed) {
      setLists((prev) => {
        const next = [...prev]
        next.splice(index, 0, removed)
        return next
      })
    }
  }

  // --- Card-Handler ----------------------------------------------------------

  async function handleAddCard(listId: string, title: string) {
    const tempId = `temp-${crypto.randomUUID()}`
    setLists((prev) =>
      prev.map((l) => {
        if (l.id !== listId) return l
        const position =
          l.cards.length > 0 ? Math.max(...l.cards.map((c) => c.position)) + 1000 : 1000
        const card: CardT = {
          id: tempId,
          list_id: listId,
          title,
          description: null,
          due_date: null,
          priority: null,
          position,
          focus_slot: null,
          is_focus_active: false,
          labels: [],
        }
        return { ...l, cards: [...l.cards, card] }
      }),
    )

    const result = await createCard(listId, title)
    if ('error' in result) {
      setLists((prev) =>
        prev.map((l) =>
          l.id === listId ? { ...l, cards: l.cards.filter((c) => c.id !== tempId) } : l,
        ),
      )
      return
    }
    setLists((prev) =>
      prev.map((l) => {
        if (l.id !== listId) return l
        // Realtime-Echo (Spec 13) koennte die echte Card schon eingefuegt haben.
        // Dann nur die temp-Card entfernen, sonst temp -> echte id umschreiben.
        const realExists = l.cards.some((c) => c.id === result.data.id)
        const cards = realExists
          ? l.cards.filter((c) => c.id !== tempId)
          : l.cards.map((c) =>
              c.id === tempId
                ? { ...c, id: result.data.id, position: result.data.position }
                : c,
            )
        return { ...l, cards }
      }),
    )
  }

  async function handleUpdateCard(cardId: string, patch: CardPatch) {
    const previous = lists.flatMap((l) => l.cards).find((c) => c.id === cardId)
    if (!previous) return
    setLists((prev) =>
      prev.map((l) => ({
        ...l,
        cards: l.cards.map((c) => (c.id === cardId ? { ...c, ...patch } : c)),
      })),
    )

    const result = await updateCard(cardId, patch)
    if ('error' in result) {
      // Nur die gepatchten Felder zuruecksetzen, um parallele Feld-Saves
      // nicht zu ueberschreiben.
      const revert: CardPatch = {}
      if ('title' in patch) revert.title = previous.title
      if ('description' in patch) revert.description = previous.description
      if ('due_date' in patch) revert.due_date = previous.due_date
      setLists((prev) =>
        prev.map((l) => ({
          ...l,
          cards: l.cards.map((c) => (c.id === cardId ? { ...c, ...revert } : c)),
        })),
      )
    }
  }

  async function handleDeleteCard(cardId: string) {
    const sourceList = lists.find((l) => l.cards.some((c) => c.id === cardId))
    const index = sourceList?.cards.findIndex((c) => c.id === cardId) ?? -1
    const removed = sourceList?.cards[index]
    setLists((prev) =>
      prev.map((l) => ({ ...l, cards: l.cards.filter((c) => c.id !== cardId) })),
    )

    const result = await deleteCard(cardId)
    if ('error' in result && sourceList && removed) {
      setLists((prev) =>
        prev.map((l) => {
          if (l.id !== sourceList.id) return l
          const cards = [...l.cards]
          cards.splice(index, 0, removed)
          return { ...l, cards }
        }),
      )
    }
  }

  // --- Labels + Priority -----------------------------------------------------

  function patchCard(cardId: string, fn: (card: CardT) => CardT) {
    setLists((prev) =>
      prev.map((l) => ({
        ...l,
        cards: l.cards.map((c) => (c.id === cardId ? fn(c) : c)),
      })),
    )
  }

  async function handleSetPriority(cardId: string, priority: number | null) {
    const previous = lists.flatMap((l) => l.cards).find((c) => c.id === cardId)?.priority ?? null
    patchCard(cardId, (c) => ({ ...c, priority }))
    const result = await setPriority(cardId, priority)
    if ('error' in result) {
      patchCard(cardId, (c) => ({ ...c, priority: previous }))
    }
  }

  async function handleAssignLabel(cardId: string, labelId: string) {
    const label = labels.find((l) => l.id === labelId)
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
    const removed = lists
      .flatMap((l) => l.cards)
      .find((c) => c.id === cardId)
      ?.labels.find((x) => x.id === labelId)
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
    const result = await createLabel(boardId, name, color)
    if ('error' in result) return null
    setLabels((prev) => [...prev, result.data])
    return result.data
  }

  async function handleSetFocus(cardId: string, slot: number) {
    const snapshot = lists
    setLists((prev) =>
      prev.map((l) => ({
        ...l,
        cards: l.cards.map((c) => {
          if (c.id === cardId) return { ...c, focus_slot: slot, is_focus_active: true }
          // Belegter Slot (gleiches Board sichtbar) wird optimistisch freigegeben.
          if (c.is_focus_active && c.focus_slot === slot) {
            return { ...c, focus_slot: null, is_focus_active: false }
          }
          return c
        }),
      })),
    )
    const result = await setFocus(cardId, slot)
    if ('error' in result) setLists(snapshot)
  }

  async function handleClearFocus(cardId: string) {
    const snapshot = lists
    patchCard(cardId, (c) => ({ ...c, focus_slot: null, is_focus_active: false }))
    const result = await clearFocus(cardId)
    if ('error' in result) setLists(snapshot)
  }

  // Auto-Kategorisierung (Spec 15) wurde bereits per RPC persistiert -> nur
  // lokalen State angleichen (keine zusaetzlichen Server-Calls).
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

  // KI-generierte Karten (Spec 14) sind bereits persistiert (echte ids) ->
  // direkt anhaengen. Realtime-Echo dedupet per id (upsert).
  function handleAddGeneratedCards(listId: string, generated: GeneratedCard[]) {
    const cards: CardT[] = generated.map((g) => ({
      id: g.id,
      list_id: g.list_id,
      title: g.title,
      description: g.description,
      due_date: null,
      priority: g.priority,
      position: g.position,
      focus_slot: null,
      is_focus_active: false,
      labels: [],
    }))
    // Dedupe per id: ein Realtime-Echo (Spec 13) koennte dieselben Karten
    // bereits eingefuegt haben. Vorhandene ids entfernen, dann nach position.
    const ids = new Set(cards.map((c) => c.id))
    setLists((prev) =>
      prev.map((l) => {
        const stripped = l.cards.filter((c) => !ids.has(c.id))
        return l.id === listId
          ? { ...l, cards: [...stripped, ...cards].sort((a, b) => a.position - b.position) }
          : { ...l, cards: stripped }
      }),
    )
  }

  // --- DnD -------------------------------------------------------------------

  function listIdOfCard(cardId: string) {
    return lists.find((l) => l.cards.some((c) => c.id === cardId))?.id
  }

  function containerOf(id: string) {
    if (lists.some((l) => l.id === id)) return id
    return listIdOfCard(id)
  }

  function handleDragStart(event: DragStartEvent) {
    const card = lists.flatMap((l) => l.cards).find((c) => c.id === String(event.active.id))
    setActiveCard(card ?? null)
    snapshotRef.current = lists
    didCrossRef.current = false
  }

  // Cross-List live: bewegte Card richtungsbewusst in die Ziel-Liste einsortieren.
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return
    const activeId = String(active.id)
    const overId = String(over.id)
    const fromList = listIdOfCard(activeId)
    const toList = containerOf(overId)
    if (!fromList || !toList || fromList === toList) return

    didCrossRef.current = true

    setLists((prev) => {
      const moving = prev.flatMap((l) => l.cards).find((c) => c.id === activeId)
      const target = prev.find((l) => l.id === toList)
      if (!moving || !target) return prev

      // Einfuege-Index: unter-/oberhalb der Over-Card (Zeiger-Richtung).
      let insertAt: number
      if (overId === toList) {
        insertAt = target.cards.length
      } else {
        const overIndex = target.cards.findIndex((c) => c.id === overId)
        const overRect = over.rect
        const activeRect = active.rect.current.translated
        const isBelow =
          activeRect && overRect
            ? activeRect.top > overRect.top + overRect.height / 2
            : false
        insertAt = overIndex >= 0 ? overIndex + (isBelow ? 1 : 0) : target.cards.length
      }

      return prev.map((l) => {
        if (l.id === fromList) {
          return { ...l, cards: l.cards.filter((c) => c.id !== activeId) }
        }
        if (l.id === toList) {
          const next = l.cards.filter((c) => c.id !== activeId)
          next.splice(insertAt, 0, { ...moving, list_id: toList })
          return { ...l, cards: next }
        }
        return l
      })
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveCard(null)
    const snapshot = snapshotRef.current
    snapshotRef.current = null
    const crossed = didCrossRef.current
    didCrossRef.current = false

    const activeId = String(active.id)
    const containerId = over ? containerOf(String(over.id)) : undefined
    if (!over || !containerId) {
      if (snapshot) setLists(snapshot)
      return
    }

    // Cross-List ist bereits in onDragOver platziert. Nur Same-List hier per
    // arrayMove finalisieren (verhindert doppeltes Verschieben).
    let finalLists = lists
    if (!crossed) {
      const list = lists.find((l) => l.id === containerId)
      const oldIndex = list?.cards.findIndex((c) => c.id === activeId) ?? -1
      if (!list || oldIndex === -1) {
        if (snapshot) setLists(snapshot)
        return
      }
      const overId = String(over.id)
      let overIndex = list.cards.findIndex((c) => c.id === overId)
      if (overId === containerId || overIndex === -1) {
        overIndex = list.cards.length - 1
      }
      if (oldIndex !== overIndex) {
        const newCards = arrayMove(list.cards, oldIndex, overIndex)
        finalLists = lists.map((l) => (l.id === containerId ? { ...l, cards: newCards } : l))
        setLists(finalLists)
      }
    }

    // Nachbarn fuer move_card (before = darueber, after = darunter).
    const finalList = finalLists.find((l) => l.id === containerId)
    const idx = finalList?.cards.findIndex((c) => c.id === activeId) ?? -1
    if (!finalList || idx === -1) return
    const beforeCard = idx > 0 ? finalList.cards[idx - 1] : null
    const afterCard = idx < finalList.cards.length - 1 ? finalList.cards[idx + 1] : null
    const beforeId = beforeCard && !isTemp(beforeCard.id) ? beforeCard.id : null
    const afterId = afterCard && !isTemp(afterCard.id) ? afterCard.id : null

    // Unsaved (temp) Card kann nicht persistiert werden -> nur optimistisch.
    if (isTemp(activeId)) return

    void moveCard(activeId, containerId, beforeId, afterId).then((result) => {
      if ('error' in result && snapshot) {
        setLists(snapshot)
      }
    })
  }

  return (
    <DndContext
      id="board-dnd"
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-4 overflow-x-auto px-5 py-6">
        {lists.map((list) => (
          <ListColumn
            key={list.id}
            list={list}
            onRename={handleRenameList}
            onDelete={handleDeleteList}
            onAddCard={handleAddCard}
            onOpenCard={setSelectedId}
            onDeleteCard={handleDeleteCard}
            onGeneratedCards={handleAddGeneratedCards}
          />
        ))}
        <AddList onAdd={handleAddList} />
      </div>

      <DragOverlay dropAnimation={null}>
        {activeCard ? (
          <div className="rotate-2 rounded-xl border border-border/60 bg-card p-2.5 text-sm leading-snug shadow-xl shadow-black/30">
            {activeCard.title}
          </div>
        ) : null}
      </DragOverlay>

      <CardDetailDialog
        card={selectedCard}
        boardLabels={labels}
        onClose={() => setSelectedId(null)}
        onUpdate={handleUpdateCard}
        onSetPriority={handleSetPriority}
        onAssignLabel={handleAssignLabel}
        onUnassignLabel={handleUnassignLabel}
        onCreateLabel={handleCreateLabel}
        onDelete={(id) => {
          setSelectedId(null)
          void handleDeleteCard(id)
        }}
        onSetFocus={handleSetFocus}
        onClearFocus={handleClearFocus}
        onCategoryApplied={handleCategoryApplied}
      />
    </DndContext>
  )
}
