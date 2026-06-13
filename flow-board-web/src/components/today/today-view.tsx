'use client'

import { CalendarCheck } from 'lucide-react'

import { CardDetailDialog } from '@/components/card/card-detail-dialog'
import { SmartCard } from '@/components/smart/smart-card'
import { useSmartCardActions } from '@/components/smart/use-smart-card-actions'
import type { CardLabel, SmartCardT } from '@/lib/board-types'
import { PRIORITIES } from '@/lib/labels'

type TodayViewProps = {
  initialCards: SmartCardT[]
  initialLabelsByBoard: Record<string, CardLabel[]>
  timezone: string
}

// Priority-Gruppen: 1..4, dann "ohne Priority".
const GROUPS: { key: number | null; label: string }[] = [
  ...PRIORITIES.map((p) => ({ key: p.value as number | null, label: p.label })),
  { key: null, label: 'Ohne Prioritaet' },
]

export function TodayView({ initialCards, initialLabelsByBoard, timezone }: TodayViewProps) {
  const {
    cards,
    selectedCard,
    boardLabels,
    open,
    close,
    handleUpdateCard,
    handleSetPriority,
    handleAssignLabel,
    handleUnassignLabel,
    handleCreateLabel,
    handleDeleteCard,
    handleSetFocus,
    handleClearFocus,
    handleCategoryApplied,
  } = useSmartCardActions({
    initialCards,
    initialLabelsByBoard,
    dropWhenNotToday: true,
    timezone,
  })

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-border/60 bg-card/30 px-5 py-3.5 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <h1 className="text-base font-semibold tracking-tight">Heute</h1>
          <span className="rounded-md bg-muted/60 px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
            {cards.length}
          </span>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
        {cards.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-muted/50 text-muted-foreground">
              <CalendarCheck className="size-6" />
            </span>
            <p className="text-sm font-medium text-foreground/90">Nichts fuer heute faellig</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Karten mit Faelligkeitsdatum heute erscheinen hier automatisch.
            </p>
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-7">
            {GROUPS.map((group) => {
              const groupCards = cards.filter((c) => (c.priority ?? null) === group.key)
              if (groupCards.length === 0) return null
              return (
                <section key={group.label} className="space-y-2.5">
                  <h2 className="px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                    {group.label}
                  </h2>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {groupCards.map((card) => (
                      <SmartCard key={card.id} card={card} onOpen={open} />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>

      <CardDetailDialog
        card={selectedCard}
        boardLabels={boardLabels}
        onClose={close}
        onUpdate={handleUpdateCard}
        onSetPriority={handleSetPriority}
        onAssignLabel={handleAssignLabel}
        onUnassignLabel={handleUnassignLabel}
        onCreateLabel={handleCreateLabel}
        onDelete={handleDeleteCard}
        onSetFocus={handleSetFocus}
        onClearFocus={handleClearFocus}
        onCategoryApplied={handleCategoryApplied}
      />
    </div>
  )
}
