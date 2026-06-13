'use client'

import { useState } from 'react'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import { Check, Loader2, Sparkles, X } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { z } from 'zod'

import {
  createGeneratedCards,
  type GeneratedCard,
} from '@/app/(app)/board/[boardId]/card-actions'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { cardSuggestionSchema } from '@/lib/ai/card-suggestion'
import { priorityConfig } from '@/lib/labels'
import { cn } from '@/lib/utils'

const arraySchema = z.array(cardSuggestionSchema)

type GenerateCardsDialogProps = {
  listId: string
  onCreated: (cards: GeneratedCard[]) => void
}

export function GenerateCardsDialog({ listId, onCreated }: GenerateCardsDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition-colors duration-150 motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40">
        <Sparkles className="size-3.5" />
        KI-Karten
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogClose
          aria-label="Schliessen"
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors duration-150 motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          <X className="size-4" />
        </DialogClose>
        {/* Popup unmountet beim Schliessen -> useObject-State wird zurueckgesetzt. */}
        <GenerateBody
          listId={listId}
          onCreated={(cards) => {
            onCreated(cards)
            setOpen(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

function GenerateBody({ listId, onCreated }: GenerateCardsDialogProps) {
  const reduce = useReducedMotion()
  const [prompt, setPrompt] = useState('')
  const [excluded, setExcluded] = useState<Set<number>>(new Set())
  const [saving, setSaving] = useState(false)
  const { object, submit, isLoading, stop, error } = useObject({
    api: '/api/cards/generate',
    schema: arraySchema,
  })

  const suggestions = (object ?? []).filter(
    (s): s is { title?: string; description?: string; priority?: number } => Boolean(s),
  )
  // Nur Vorschlaege mit (fertig gestreamtem) Titel sind uebernehmbar.
  const chosen = suggestions
    .map((s, i) => ({ s, i }))
    .filter(
      ({ s, i }) => !excluded.has(i) && typeof s.title === 'string' && s.title.trim().length > 0,
    )
  const acceptedCount = chosen.length
  const canSubmit = prompt.trim().length > 0 && !isLoading && !saving

  function toggle(i: number) {
    setExcluded((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  function start() {
    if (!canSubmit) return
    setExcluded(new Set())
    submit({ prompt: prompt.trim() })
  }

  async function accept() {
    const payload = chosen.map(({ s }) => ({
      title: s.title!.trim(),
      description: s.description,
      priority: s.priority,
    }))
    if (payload.length === 0) return
    setSaving(true)
    const result = await createGeneratedCards(listId, payload)
    setSaving(false)
    if ('data' in result) onCreated(result.data)
  }

  return (
    <div className="space-y-4">
      <div>
        <DialogTitle>Karten mit KI erzeugen</DialogTitle>
        <DialogDescription>
          Beschreibe ein Vorhaben — die KI schlaegt passende Karten vor.
        </DialogDescription>
      </div>

      <div className="space-y-2">
        <Textarea
          value={prompt}
          rows={3}
          maxLength={1000}
          autoFocus
          placeholder="z. B. Plane meinen Produkt-Launch …"
          aria-label="Prompt"
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault()
              start()
            }
          }}
        />
        <div className="flex justify-end gap-2">
          {isLoading ? (
            <button
              type="button"
              onClick={() => stop()}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-150 motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              Stopp
            </button>
          ) : null}
          <button
            type="button"
            onClick={start}
            disabled={!canSubmit}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity duration-150 motion-reduce:transition-none hover:opacity-90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Vorschlaege
          </button>
        </div>
      </div>

      {error ? (
        <p className="rounded-lg bg-destructive/15 px-3 py-2 text-sm text-destructive">
          Vorschlaege konnten nicht erzeugt werden. Bitte erneut versuchen.
        </p>
      ) : null}

      {suggestions.length > 0 ? (
        <div className="space-y-1.5">
          <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
            {suggestions.map((s, i) => {
              if (!s.title) return null
              const active = !excluded.has(i)
              const prio = priorityConfig(s.priority ?? null)
              return (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => toggle(i)}
                  aria-pressed={active}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduce ? 0 : i * 0.05, duration: 0.18 }}
                  className={cn(
                    'flex w-full items-start gap-2.5 rounded-xl border p-2.5 text-left transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
                    active
                      ? 'border-border/60 bg-card/60'
                      : 'border-dashed border-border/50 opacity-55',
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 grid size-4 shrink-0 place-items-center rounded border',
                      active
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border',
                    )}
                  >
                    {active ? <Check className="size-3" /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium leading-snug">{s.title}</span>
                    {s.description ? (
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {s.description}
                      </span>
                    ) : null}
                    {prio ? (
                      <span
                        style={{ color: prio.color }}
                        className="mt-1 inline-flex items-center gap-1 rounded-md bg-muted/50 px-1.5 py-0.5 text-[11px] font-medium"
                      >
                        <span
                          style={{ backgroundColor: prio.color }}
                          className="inline-block size-1.5 rounded-full"
                        />
                        {prio.label}
                      </span>
                    ) : null}
                  </span>
                </motion.button>
              )
            })}
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={accept}
              disabled={acceptedCount === 0 || isLoading || saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-opacity duration-150 motion-reduce:transition-none hover:opacity-90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" /> : null}
              {acceptedCount > 0 ? `${acceptedCount} uebernehmen` : 'Uebernehmen'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
