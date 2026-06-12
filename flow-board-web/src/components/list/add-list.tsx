'use client'

import { useRef, useState } from 'react'
import { Plus } from 'lucide-react'

type AddListProps = {
  onAdd: (title: string) => void
}

export function AddList({ onAdd }: AddListProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function start() {
    setOpen(true)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  function commit() {
    const next = title.trim()
    if (next.length > 0) {
      onAdd(next)
    }
    setTitle('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={start}
        className="flex h-fit w-[300px] shrink-0 items-center gap-2 rounded-2xl border border-dashed border-border/70 px-3 py-3 text-sm text-muted-foreground transition-colors duration-150 motion-reduce:transition-none hover:border-border hover:bg-muted/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
      >
        <Plus className="size-4 shrink-0" />
        Liste hinzufuegen
      </button>
    )
  }

  return (
    <div className="h-fit w-[300px] shrink-0 rounded-2xl border border-border/60 bg-card/60 p-2">
      <input
        ref={inputRef}
        value={title}
        maxLength={120}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            commit()
          }
          if (e.key === 'Escape') {
            setTitle('')
            setOpen(false)
          }
        }}
        placeholder="Listentitel"
        aria-label="Listentitel"
        className="w-full rounded-lg border border-input bg-background/60 px-2.5 py-1.5 text-sm placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
      />
    </div>
  )
}
