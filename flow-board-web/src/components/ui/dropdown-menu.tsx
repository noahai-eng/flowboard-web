'use client'

import type { ComponentProps } from 'react'

import { Menu } from '@base-ui/react/menu'

import { cn } from '@/lib/utils'

export const DropdownMenu = Menu.Root
export const DropdownMenuTrigger = Menu.Trigger

export function DropdownMenuContent({
  className,
  align = 'end',
  sideOffset = 6,
  ...props
}: ComponentProps<typeof Menu.Popup> & {
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
}) {
  return (
    <Menu.Portal>
      <Menu.Positioner align={align} sideOffset={sideOffset} className="z-50">
        <Menu.Popup
          className={cn(
            'min-w-[10rem] rounded-2xl border border-border/60 bg-popover/95 p-1.5 shadow-2xl shadow-black/40 backdrop-blur-xl',
            'transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none',
            'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
            'data-[ending-style]:scale-95 data-[ending-style]:opacity-0',
            'focus-visible:outline-none',
            className,
          )}
          {...props}
        />
      </Menu.Positioner>
    </Menu.Portal>
  )
}

export function DropdownMenuItem({
  className,
  variant = 'default',
  ...props
}: ComponentProps<typeof Menu.Item> & { variant?: 'default' | 'destructive' }) {
  return (
    <Menu.Item
      className={cn(
        'flex cursor-default items-center gap-2 rounded-xl px-3 py-2 text-sm outline-none transition-colors duration-150 motion-reduce:transition-none',
        'data-[highlighted]:bg-muted/70',
        variant === 'destructive'
          ? 'text-destructive data-[highlighted]:bg-destructive/10'
          : 'text-foreground',
        className,
      )}
      {...props}
    />
  )
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof Menu.Separator>) {
  return (
    <Menu.Separator className={cn('my-1 h-px bg-border/60', className)} {...props} />
  )
}
