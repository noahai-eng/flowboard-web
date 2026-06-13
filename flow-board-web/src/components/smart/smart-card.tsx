'use client'

import { CalendarDays } from 'lucide-react'

import type { SmartCardT } from '@/lib/board-types'
import { isLabelColor, labelChipStyle, priorityConfig } from '@/lib/labels'

type SmartCardProps = {
  card: SmartCardT
  onOpen: (id: string) => void
  /** Board-Chip anzeigen (Heute-View ja, Focus optional). */
  showBoard?: boolean
}

function formatDue(iso: string | null) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('de-AT', { day: '2-digit', month: 'short' })
}

// Read-only Card fuer Smart-Views (Heute/Focus). Klick oeffnet das Detail-Modal.
export function SmartCard({ card, onOpen, showBoard = true }: SmartCardProps) {
  const due = formatDue(card.due_date)
  const prio = priorityConfig(card.priority)

  return (
    <button
      type="button"
      onClick={() => onOpen(card.id)}
      className="group/sc flex w-full flex-col gap-2 rounded-xl border border-border/60 bg-gradient-to-b from-card to-card/70 p-3 text-left shadow-sm shadow-black/10 transition-[transform,box-shadow] duration-150 ease-out motion-reduce:transition-none hover:shadow-md hover:shadow-black/20 motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
    >
      {card.labels.length > 0 ? (
        <div className="flex flex-wrap gap-1">
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

      <span className="text-sm font-medium leading-snug">{card.title}</span>

      <div className="flex flex-wrap items-center gap-1.5">
        {showBoard ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            {card.board_title}
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
        {due ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            <CalendarDays className="size-3" />
            {due}
          </span>
        ) : null}
      </div>
    </button>
  )
}
