'use client'

import type { ComponentProps, ReactNode } from 'react'

import { Dialog as BaseDialog } from '@base-ui/react/dialog'

import { cn } from '@/lib/utils'

export const Dialog = BaseDialog.Root
export const DialogTrigger = BaseDialog.Trigger
export const DialogClose = BaseDialog.Close

export function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof BaseDialog.Popup> & { children: ReactNode }) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop
        className={cn(
          'fixed inset-0 z-50 bg-gradient-to-b from-black/50 to-black/70 backdrop-blur-sm',
          'transition-opacity duration-200 ease-out motion-reduce:transition-none',
          'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0',
        )}
      />
      <BaseDialog.Popup
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2',
          'rounded-3xl border border-border/60 bg-card/95 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl',
          'transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none',
          'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
          'data-[ending-style]:scale-95 data-[ending-style]:opacity-0',
          'focus-visible:outline-none',
          className,
        )}
        {...props}
      >
        {children}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  )
}

export function DialogTitle({
  className,
  ...props
}: ComponentProps<typeof BaseDialog.Title>) {
  return (
    <BaseDialog.Title
      className={cn('text-lg font-semibold tracking-tight', className)}
      {...props}
    />
  )
}

export function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof BaseDialog.Description>) {
  return (
    <BaseDialog.Description
      className={cn('mt-1 text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}
