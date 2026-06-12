'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CalendarDays, Trash2 } from 'lucide-react'

import type { CardT } from '@/lib/board-types'
import { isLabelColor, labelChipStyle, priorityConfig } from '@/lib/labels'
import { cn } from '@/lib/utils'

type CardItemProps = {
  card: CardT
  onOpen: (id: string) => void
  onDelete: (id: string) => void
}

function formatDue(iso: string | null) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('de-AT', { day: '2-digit', month: 'short' })
}

export function CardItem({ card, onOpen, onDelete }: CardItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id, data: { type: 'card', listId: card.list_id } })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  const due = formatDue(card.due_date)
  const prio = priorityConfig(card.priority)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group/card relative touch-none rounded-xl border border-border/60 bg-gradient-to-b from-card to-card/70 p-2.5 shadow-sm shadow-black/10',
        'transition-[transform,box-shadow] duration-150 ease-out motion-reduce:transition-none',
        'hover:shadow-md hover:shadow-black/20 motion-safe:hover:-translate-y-0.5',
        isDragging && 'opacity-40',
      )}
    >
      {card.labels.length > 0 ? (
        <div className="mb-1.5 flex flex-wrap gap-1">
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
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => onOpen(card.id)}
        className="block w-full pr-6 text-left text-sm leading-snug focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
      >
        {card.title}
      </button>

      {due || prio ? (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
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
          {due ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              <CalendarDays className="size-3" />
              {due}
            </span>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onDelete(card.id)
        }}
        aria-label="Karte loeschen"
        className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-md text-muted-foreground opacity-0 transition-opacity duration-150 motion-reduce:transition-none hover:bg-destructive/15 hover:text-destructive focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-destructive/30 group-hover/card:opacity-100"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  )
}
