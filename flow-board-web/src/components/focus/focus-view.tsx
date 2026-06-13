'use client'

import { Target, X } from 'lucide-react'

import { CardDetailDialog } from '@/components/card/card-detail-dialog'
import { useSmartCardActions } from '@/components/smart/use-smart-card-actions'
import type { CardLabel, SmartCardT } from '@/lib/board-types'
import { isLabelColor, labelChipStyle, priorityConfig } from '@/lib/labels'

type FocusViewProps = {
  initialCards: SmartCardT[]
  initialLabelsByBoard: Record<string, CardLabel[]>
}

const SLOTS = [1, 2, 3] as const

export function FocusView({ initialCards, initialLabelsByBoard }: FocusViewProps) {
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
    dropWhenNotFocus: true,
  })

  const bySlot = new Map(cards.map((c) => [c.focus_slot, c]))

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-border/60 bg-card/30 px-5 py-3.5 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <h1 className="text-base font-semibold tracking-tight">Focus</h1>
          <span className="rounded-md bg-muted/60 px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
            {cards.length}/3
          </span>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
        {cards.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-muted/50 text-muted-foreground">
              <Target className="size-6" />
            </span>
            <p className="text-sm font-medium text-foreground/90">Keine Focus-Cards</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Markiere im Karten-Detail bis zu 3 Karten als Focus — sie erscheinen hier.
            </p>
          </div>
        ) : (
          <div className="mx-auto grid max-w-2xl gap-3">
            {SLOTS.map((slot) => {
              const card = bySlot.get(slot)
              return card ? (
                <FocusSlot
                  key={slot}
                  slot={slot}
                  card={card}
                  onOpen={open}
                  onClear={handleClearFocus}
                />
              ) : (
                <div
                  key={slot}
                  className="flex items-center gap-3 rounded-2xl border border-dashed border-border/60 px-5 py-6 text-sm text-muted-foreground/70"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted/40 text-xs font-semibold">
                    {slot}
                  </span>
                  Slot {slot} frei
                </div>
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

function FocusSlot({
  slot,
  card,
  onOpen,
  onClear,
}: {
  slot: number
  card: SmartCardT
  onOpen: (id: string) => void
  onClear: (id: string) => void
}) {
  const prio = priorityConfig(card.priority)
  return (
    <div className="group/fs relative flex flex-col gap-3 rounded-2xl border border-border/60 bg-gradient-to-b from-card to-card/60 p-5 shadow-lg shadow-black/20">
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/50 text-sm font-semibold text-primary-foreground shadow-sm">
          {slot}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          {card.board_title}
        </span>
        <button
          type="button"
          onClick={() => onClear(card.id)}
          aria-label="Aus Focus entfernen"
          className="ml-auto grid size-7 place-items-center rounded-lg text-muted-foreground opacity-0 transition-opacity duration-150 motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 group-hover/fs:opacity-100"
        >
          <X className="size-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => onOpen(card.id)}
        className="rounded-lg text-left text-base font-semibold leading-snug transition-colors duration-150 motion-reduce:transition-none hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
      >
        {card.title}
      </button>

      <div className="flex flex-wrap items-center gap-1.5">
        {card.labels.map((label) =>
          isLabelColor(label.color) ? (
            <span
              key={label.id}
              style={labelChipStyle(label.color)}
              className="rounded-md border px-1.5 py-0.5 text-[11px] font-medium"
            >
              {label.name}
            </span>
          ) : null,
        )}
        {prio ? (
          <span
            style={{ color: prio.color }}
            className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-1.5 py-0.5 text-[11px] font-medium"
          >
            <span
              style={{ backgroundColor: prio.color }}
              className="inline-block size-1.5 rounded-full"
            />
            {prio.label}
          </span>
        ) : null}
      </div>
    </div>
  )
}
