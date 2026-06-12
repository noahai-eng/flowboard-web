'use client'

import { useRef, useState } from 'react'
import { Plus } from 'lucide-react'

type QuickAddCardProps = {
  onAdd: (title: string) => void
}

export function QuickAddCard({ onAdd }: QuickAddCardProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function start() {
    setOpen(true)
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  function submit() {
    const next = title.trim()
    if (next.length === 0) return
    onAdd(next)
    // Feld bleibt offen + fokussiert + leer fuer die naechste Karte.
    setTitle('')
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={start}
        className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm text-muted-foreground transition-colors duration-150 motion-reduce:transition-none hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
      >
        <Plus className="size-4 shrink-0" />
        Karte hinzufuegen
      </button>
    )
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card p-2 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/40">
      <textarea
        ref={textareaRef}
        value={title}
        maxLength={200}
        rows={2}
        placeholder="Kartentitel — Enter speichert"
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => {
          // Klick ausserhalb schliesst (ohne zu speichern).
          setTitle('')
          setOpen(false)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            submit()
          }
          if (e.key === 'Escape') {
            setTitle('')
            setOpen(false)
          }
        }}
        aria-label="Neue Karte"
        className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
      />
    </div>
  )
}
