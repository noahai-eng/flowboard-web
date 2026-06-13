'use client'

import { useState } from 'react'
import { Check, Loader2, Plus, Sparkles, Trash2, X } from 'lucide-react'

import {
  applySuggestion,
  suggestCategory,
  type CategorySuggestion,
} from '@/app/(app)/board/[boardId]/category-actions'
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { CardLabel, CardT } from '@/lib/board-types'
import {
  LABEL_COLORS,
  type LabelColor,
  isLabelColor,
  labelChipStyle,
  labelDotStyle,
  PRIORITIES,
  priorityConfig,
} from '@/lib/labels'
import { cn } from '@/lib/utils'

type CategoryApplied = { priority: number | null; label: CardLabel | null }

export type CardPatch = {
  title?: string
  description?: string | null
  due_date?: string | null
}

type CardDetailDialogProps = {
  card: CardT | null
  boardLabels: CardLabel[]
  onClose: () => void
  onUpdate: (id: string, patch: CardPatch) => void
  onSetPriority: (id: string, priority: number | null) => void
  onAssignLabel: (cardId: string, labelId: string) => void
  onUnassignLabel: (cardId: string, labelId: string) => void
  onCreateLabel: (name: string, color: LabelColor) => Promise<CardLabel | null>
  onDelete: (id: string) => void
  /** Optional: Focus-Slot setzen/entfernen (Spec 11). Ohne diese Props keine Focus-Sektion. */
  onSetFocus?: (cardId: string, slot: number) => void
  onClearFocus?: (cardId: string) => void
  /** Optional: Auto-Kategorisierung (Spec 15). Callback aktualisiert lokalen State. */
  onCategoryApplied?: (cardId: string, patch: CategoryApplied) => void
}

export function CardDetailDialog({
  card,
  boardLabels,
  onClose,
  onUpdate,
  onSetPriority,
  onAssignLabel,
  onUnassignLabel,
  onCreateLabel,
  onDelete,
  onSetFocus,
  onClearFocus,
  onCategoryApplied,
}: CardDetailDialogProps) {
  return (
    <Dialog open={card !== null} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="max-w-lg">
        <DialogClose
          aria-label="Schliessen"
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors duration-150 motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          <X className="size-4" />
        </DialogClose>
        {card ? (
          <DetailContent
            key={card.id}
            card={card}
            boardLabels={boardLabels}
            onUpdate={onUpdate}
            onSetPriority={onSetPriority}
            onAssignLabel={onAssignLabel}
            onUnassignLabel={onUnassignLabel}
            onCreateLabel={onCreateLabel}
            onDelete={onDelete}
            onSetFocus={onSetFocus}
            onClearFocus={onClearFocus}
            onCategoryApplied={onCategoryApplied}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function toDateInput(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
}

function DetailContent({
  card,
  boardLabels,
  onUpdate,
  onSetPriority,
  onAssignLabel,
  onUnassignLabel,
  onCreateLabel,
  onDelete,
  onSetFocus,
  onClearFocus,
  onCategoryApplied,
}: {
  card: CardT
  boardLabels: CardLabel[]
  onUpdate: (id: string, patch: CardPatch) => void
  onSetPriority: (id: string, priority: number | null) => void
  onAssignLabel: (cardId: string, labelId: string) => void
  onUnassignLabel: (cardId: string, labelId: string) => void
  onCreateLabel: (name: string, color: LabelColor) => Promise<CardLabel | null>
  onDelete: (id: string) => void
  onSetFocus?: (cardId: string, slot: number) => void
  onClearFocus?: (cardId: string) => void
  onCategoryApplied?: (cardId: string, patch: CategoryApplied) => void
}) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description ?? '')
  const [dueDate, setDueDate] = useState(toDateInput(card.due_date))
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState<LabelColor>(LABEL_COLORS[0])

  const assignedIds = new Set(card.labels.map((l) => l.id))

  function commitTitle() {
    const next = title.trim()
    if (next.length === 0) {
      setTitle(card.title)
      return
    }
    if (next !== card.title) onUpdate(card.id, { title: next })
  }

  function commitDescription() {
    const next = description.trim()
    const current = card.description ?? ''
    if (next !== current) onUpdate(card.id, { description: next.length > 0 ? next : null })
  }

  function commitDueDate(value: string) {
    setDueDate(value)
    onUpdate(card.id, { due_date: value.length > 0 ? value : null })
  }

  function toggleLabel(labelId: string) {
    if (assignedIds.has(labelId)) onUnassignLabel(card.id, labelId)
    else onAssignLabel(card.id, labelId)
  }

  async function createAndAssign() {
    const name = newName.trim()
    if (name.length === 0) return
    const label = await onCreateLabel(name, newColor)
    if (label) onAssignLabel(card.id, label.id)
    setNewName('')
    setCreating(false)
  }

  return (
    <div className="space-y-5">
      <div>
        <DialogTitle className="sr-only">Kartendetails</DialogTitle>
        <Input
          value={title}
          maxLength={200}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={commitTitle}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              e.currentTarget.blur()
            }
          }}
          aria-label="Kartentitel"
          className="border-transparent bg-transparent px-2 pr-10 text-lg font-semibold"
        />
      </div>

      {/* Labels */}
      <section className="space-y-2">
        <p className="px-1 text-sm font-medium text-foreground/90">Labels</p>
        <div className="flex flex-wrap gap-1.5">
          {boardLabels.map((label) => {
            const active = assignedIds.has(label.id)
            return isLabelColor(label.color) ? (
              <button
                key={label.id}
                type="button"
                onClick={() => toggleLabel(label.id)}
                style={labelChipStyle(label.color)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-opacity duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
                  active ? 'opacity-100' : 'opacity-55 hover:opacity-80',
                )}
                aria-pressed={active}
              >
                {active ? <Check className="size-3" /> : null}
                {label.name}
              </button>
            ) : null
          })}
        </div>

        {creating ? (
          <div className="space-y-2 rounded-xl border border-border/60 bg-card/40 p-2.5">
            <Input
              value={newName}
              maxLength={40}
              autoFocus
              placeholder="Label-Name"
              aria-label="Label-Name"
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void createAndAssign()
                }
                if (e.key === 'Escape') setCreating(false)
              }}
            />
            <div className="flex flex-wrap gap-1.5">
              {LABEL_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Farbe ${color}`}
                  aria-pressed={newColor === color}
                  onClick={() => setNewColor(color)}
                  style={labelDotStyle(color)}
                  className={cn(
                    'size-6 rounded-full transition-transform duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
                    newColor === color
                      ? 'ring-2 ring-foreground ring-offset-2 ring-offset-card'
                      : 'hover:scale-110',
                  )}
                />
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-150 motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={() => void createAndAssign()}
                disabled={newName.trim().length === 0}
                className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity duration-150 motion-reduce:transition-none hover:opacity-90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Anlegen
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors duration-150 motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            <Plus className="size-3.5" />
            Label anlegen
          </button>
        )}
      </section>

      {/* Priority */}
      <section className="space-y-2">
        <p className="px-1 text-sm font-medium text-foreground/90">Prioritaet</p>
        <div className="flex flex-wrap gap-1.5">
          <PriorityButton
            label="Keine"
            active={card.priority === null}
            onClick={() => onSetPriority(card.id, null)}
          />
          {PRIORITIES.map((p) => (
            <PriorityButton
              key={p.value}
              label={p.label}
              color={p.color}
              active={card.priority === p.value}
              onClick={() => onSetPriority(card.id, p.value)}
            />
          ))}
        </div>
      </section>

      {/* Focus (Spec 11) */}
      {onSetFocus && onClearFocus ? (
        <section className="space-y-2">
          <p className="px-1 text-sm font-medium text-foreground/90">Focus</p>
          <div className="flex flex-wrap items-center gap-1.5">
            {[1, 2, 3].map((slot) => {
              const active = card.is_focus_active && card.focus_slot === slot
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onSetFocus(card.id, slot)}
                  aria-pressed={active}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
                    active
                      ? 'border-ring bg-primary/15 text-foreground'
                      : 'border-border/60 text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                  )}
                >
                  Slot {slot}
                </button>
              )
            })}
            {card.is_focus_active ? (
              <button
                type="button"
                onClick={() => onClearFocus?.(card.id)}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors duration-150 motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
              >
                Entfernen
              </button>
            ) : null}
          </div>
          <p className="px-1 text-xs text-muted-foreground">
            Max. 3 Slots. Ein belegter Slot wird ersetzt.
          </p>
        </section>
      ) : null}

      {/* Auto-Kategorisierung (Spec 15) */}
      {onCategoryApplied ? (
        <AutoCategorize
          card={card}
          onApplied={(patch) => onCategoryApplied(card.id, patch)}
        />
      ) : null}

      {/* Beschreibung */}
      <div className="space-y-2">
        <label htmlFor="card-description" className="px-1 text-sm font-medium text-foreground/90">
          Beschreibung
        </label>
        <Textarea
          id="card-description"
          value={description}
          rows={4}
          maxLength={5000}
          placeholder="Beschreibung hinzufuegen …"
          onChange={(e) => setDescription(e.target.value)}
          onBlur={commitDescription}
        />
      </div>

      {/* Faelligkeit */}
      <div className="space-y-2">
        <label htmlFor="card-due" className="px-1 text-sm font-medium text-foreground/90">
          Faelligkeitsdatum
        </label>
        <Input
          id="card-due"
          type="date"
          value={dueDate}
          onChange={(e) => commitDueDate(e.target.value)}
          aria-label="Faelligkeitsdatum"
          className="[color-scheme:dark]"
        />
      </div>

      <div className="flex justify-end border-t border-border/50 pt-4">
        <button
          type="button"
          onClick={() => onDelete(card.id)}
          className="inline-flex items-center gap-2 rounded-xl bg-destructive/15 px-3.5 py-2 text-sm font-medium text-destructive transition-colors duration-150 motion-reduce:transition-none hover:bg-destructive/25 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-destructive/30"
        >
          <Trash2 className="size-4" />
          Karte loeschen
        </button>
      </div>
    </div>
  )
}

type CategoryStatus = 'idle' | 'loading' | 'ready' | 'applying' | 'stale' | 'error'

function AutoCategorize({
  card,
  onApplied,
}: {
  card: CardT
  onApplied: (patch: CategoryApplied) => void
}) {
  const [status, setStatus] = useState<CategoryStatus>('idle')
  const [suggestion, setSuggestion] = useState<CategorySuggestion | null>(null)

  async function suggest() {
    setStatus('loading')
    const result = await suggestCategory(card.id)
    if ('data' in result) {
      setSuggestion(result.data)
      setStatus('ready')
    } else {
      setStatus('error')
    }
  }

  async function apply() {
    if (!suggestion) return
    setStatus('applying')
    const result = await applySuggestion(suggestion.id)
    if ('data' in result) {
      onApplied({ priority: suggestion.priority, label: suggestion.label })
      setSuggestion(null)
      setStatus('idle')
    } else if (result.error === 'stale') {
      setStatus('stale')
    } else {
      setStatus('error')
    }
  }

  function discard() {
    setSuggestion(null)
    setStatus('idle')
  }

  const busy = status === 'loading' || status === 'applying'
  const prio = suggestion ? priorityConfig(suggestion.priority) : null
  const hasSuggestionContent = Boolean(suggestion && (suggestion.label || suggestion.priority))

  return (
    <section className="space-y-2 rounded-xl border border-border/60 bg-card/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="px-0.5 text-sm font-medium text-foreground/90">Auto-Kategorisieren</p>
        {status !== 'ready' ? (
          <button
            type="button"
            onClick={suggest}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors duration-150 motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'loading' ? (
              <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" />
            ) : (
              <Sparkles className="size-3.5" />
            )}
            {status === 'stale' || status === 'error' ? 'Neu vorschlagen' : 'Vorschlag'}
          </button>
        ) : null}
      </div>

      {status === 'stale' ? (
        <p className="text-xs text-muted-foreground">
          Die Karte wurde zwischenzeitlich geaendert. Bitte neu vorschlagen.
        </p>
      ) : null}
      {status === 'error' ? (
        <p className="text-xs text-destructive">Vorschlag fehlgeschlagen. Bitte erneut versuchen.</p>
      ) : null}

      {status === 'ready' && suggestion ? (
        <div className="space-y-2">
          {hasSuggestionContent ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {suggestion.label && isLabelColor(suggestion.label.color) ? (
                <span
                  style={labelChipStyle(suggestion.label.color)}
                  className="rounded-md border px-1.5 py-0.5 text-[11px] font-medium"
                >
                  {suggestion.label.name}
                </span>
              ) : null}
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
          ) : (
            <p className="text-xs text-muted-foreground">Kein eindeutiger Vorschlag.</p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={discard}
              className="rounded-lg px-2.5 py-1 text-xs text-muted-foreground transition-colors duration-150 motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              Verwerfen
            </button>
            <button
              type="button"
              onClick={apply}
              disabled={!hasSuggestionContent || status !== 'ready'}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground transition-opacity duration-150 motion-reduce:transition-none hover:opacity-90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Uebernehmen
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function PriorityButton({
  label,
  color,
  active,
  onClick,
}: {
  label: string
  color?: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
        active
          ? 'border-ring bg-muted text-foreground'
          : 'border-border/60 text-muted-foreground hover:bg-muted/60 hover:text-foreground',
      )}
    >
      {color ? (
        <span style={{ backgroundColor: color }} className="inline-block size-2 rounded-full" />
      ) : null}
      {label}
    </button>
  )
}
