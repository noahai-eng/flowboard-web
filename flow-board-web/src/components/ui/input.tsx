import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      data-slot="input"
      className={cn(
        'w-full rounded-xl border border-input bg-background/50 px-3.5 py-2.5 text-sm',
        'placeholder:text-muted-foreground/60 transition-[color,box-shadow,border-color] duration-200 motion-reduce:transition-none',
        'hover:border-ring/50 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    />
  )
}
