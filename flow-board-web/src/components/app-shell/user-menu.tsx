'use client'

import { signout } from '@/app/(auth)/actions'

type UserMenuProps = {
  email: string
}

export function UserMenu({ email }: UserMenuProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/40 p-2.5">
      <div
        aria-hidden
        className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/80 to-primary/40 text-sm font-semibold text-primary-foreground"
      >
        {email.slice(0, 1).toUpperCase() || '?'}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground" title={email}>
          {email || 'Angemeldet'}
        </p>
        <p className="text-xs text-muted-foreground">Persoenlicher Workspace</p>
      </div>

      <form action={signout}>
        <button
          type="submit"
          aria-label="Abmelden"
          title="Abmelden"
          className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors duration-150 motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </form>
    </div>
  )
}
