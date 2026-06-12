'use client'

import { useRef, useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

import { CardItem } from '@/components/card/card-item'
import { QuickAddCard } from '@/components/card/quick-add-card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ListT } from '@/lib/board-types'

type ListColumnProps = {
  list: ListT
  onRename: (id: string, title: string) => void
  onDelete: (id: string) => void
  onAddCard: (listId: string, title: string) => void
  onOpenCard: (cardId: string) => void
  onDeleteCard: (cardId: string) => void
}

export function ListColumn({
  list,
  onRename,
  onDelete,
  onAddCard,
  onOpenCard,
  onDeleteCard,
}: ListColumnProps) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(list.title)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Droppable-Container, damit auch in leere Listen gezogen werden kann.
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: list.id,
    data: { type: 'list' },
  })

  function startEdit() {
    setTitle(list.title)
    setEditing(true)
    requestAnimationFrame(() => inputRef.current?.select())
  }

  function commitRename() {
    const next = title.trim()
    setEditing(false)
    if (next.length === 0 || next === list.title) {
      setTitle(list.title)
      return
    }
    onRename(list.id, next)
  }

  function requestDelete() {
    if (list.cards.length > 0) {
      setConfirmOpen(true)
    } else {
      onDelete(list.id)
    }
  }

  return (
    <section className="flex h-full w-[300px] shrink-0 flex-col rounded-2xl border border-border/60 bg-gradient-to-b from-card/70 to-card/40 shadow-lg shadow-black/20">
      <header className="flex items-center gap-2 px-3 py-2.5">
        {editing ? (
          <input
            ref={inputRef}
            value={title}
            maxLength={120}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename()
              if (e.key === 'Escape') {
                setTitle(list.title)
                setEditing(false)
              }
            }}
            aria-label="Liste umbenennen"
            className="min-w-0 flex-1 rounded-lg border border-input bg-background/60 px-2 py-1 text-sm font-semibold focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
          />
        ) : (
          <h3
            className="min-w-0 flex-1 truncate px-2 py-1 text-sm font-semibold"
            title={list.title}
          >
            {list.title}
          </h3>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Listen-Optionen"
            className="grid size-7 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors duration-150 motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 data-[popup-open]:bg-muted"
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={startEdit}>
              <Pencil className="size-4" />
              Umbenennen
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={requestDelete}>
              <Trash2 className="size-4" />
              Loeschen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div
        ref={setDroppableRef}
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2"
      >
        <SortableContext
          items={list.cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {list.cards.map((card) => (
            <CardItem key={card.id} card={card} onOpen={onOpenCard} onDelete={onDeleteCard} />
          ))}
        </SortableContext>
        <QuickAddCard onAdd={(title) => onAddCard(list.id, title)} />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Liste loeschen?"
        description="Die Liste und alle Karten darin werden dauerhaft entfernt."
        onConfirm={() => {
          setConfirmOpen(false)
          onDelete(list.id)
        }}
      />
    </section>
  )
}
