'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Plus } from 'lucide-react'

import { createBoard } from '@/app/(app)/board/actions'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type CreateBoardDialogProps = {
  variant?: 'sidebar' | 'cta'
}

export function CreateBoardDialog({ variant = 'sidebar' }: CreateBoardDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function submit() {
    setError(null)
    startTransition(async () => {
      const result = await createBoard(title)
      if ('error' in result) {
        setError(result.error)
        return
      }
      setOpen(false)
      setTitle('')
      router.push(`/board/${result.data.id}`)
      router.refresh()
    })
  }

  return (
    <>
      {variant === 'sidebar' ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors duration-150 motion-reduce:transition-none hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          <Plus className="size-4 shrink-0" />
          Neues Board
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-primary to-primary/85 px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-[transform,opacity] duration-200 motion-reduce:transition-none hover:opacity-90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.99]"
        >
          <Plus className="size-4" />
          Erstes Board erstellen
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogTitle>Neues Board</DialogTitle>
          <form
            className="mt-4 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Board-Titel"
              maxLength={120}
              aria-label="Board-Titel"
            />
            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={pending || title.trim().length === 0}
                className={cn(
                  'rounded-xl bg-gradient-to-b from-primary to-primary/85 px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20',
                  'transition-[transform,opacity] duration-200 motion-reduce:transition-none hover:opacity-90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.99]',
                  'disabled:cursor-not-allowed disabled:opacity-60',
                )}
              >
                {pending ? 'Wird angelegt …' : 'Anlegen'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
