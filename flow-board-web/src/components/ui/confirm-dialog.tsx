'use client'

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from './dialog'

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  pending?: boolean
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Loeschen',
  pending = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>

        <div className="mt-6 flex justify-end gap-2">
          <DialogClose className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40">
            Abbrechen
          </DialogClose>
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className="rounded-xl bg-destructive/15 px-4 py-2 text-sm font-semibold text-destructive transition-colors duration-150 motion-reduce:transition-none hover:bg-destructive/25 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-destructive/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Wird geloescht …' : confirmLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
