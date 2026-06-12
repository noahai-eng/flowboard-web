'use client'

import Link from 'next/link'
import { useActionState } from 'react'

import { cn } from '@/lib/utils'

import type { AuthState } from './actions'

type AuthFormProps = {
  mode: 'login' | 'signup'
  action: (prevState: AuthState, formData: FormData) => Promise<AuthState>
}

const copy = {
  login: {
    title: 'Willkommen zurueck',
    subtitle: 'Melde dich an, um zu deinen Boards zu gelangen.',
    submit: 'Anmelden',
    pending: 'Wird angemeldet …',
    altText: 'Noch kein Konto?',
    altLink: 'Registrieren',
    altHref: '/signup',
  },
  signup: {
    title: 'Konto erstellen',
    subtitle: 'Starte mit deinem persoenlichen Flow Board.',
    submit: 'Registrieren',
    pending: 'Konto wird erstellt …',
    altText: 'Schon ein Konto?',
    altLink: 'Anmelden',
    altHref: '/login',
  },
} as const

export function AuthForm({ mode, action }: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, null)
  const t = copy[mode]

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-10">
      {/* Mehrschichtiger Gradient-Hintergrund (kein flacher Fill). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_120%_at_50%_-10%,oklch(0.3_0.05_265/0.45),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_100%_100%,oklch(0.35_0.04_300/0.35),transparent_55%)]"
      />

      <div className="w-full max-w-sm">
        <div className="rounded-3xl border border-border/60 bg-card/70 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <header className="mb-7 space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1>
            <p className="text-sm text-muted-foreground">{t.subtitle}</p>
          </header>

          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground/90"
              >
                E-Mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="du@beispiel.com"
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground/90"
              >
                Passwort
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={8}
                placeholder="Mindestens 8 Zeichen"
                className={inputClass}
              />
            </div>

            {state?.error ? (
              <p
                role="alert"
                className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {state.error}
              </p>
            ) : null}

            <button type="submit" disabled={isPending} className={submitClass}>
              {isPending ? t.pending : t.submit}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t.altText}{' '}
          <Link
            href={t.altHref}
            className="font-medium text-foreground underline-offset-4 transition-colors motion-reduce:transition-none hover:text-foreground/80 hover:underline focus-visible:underline focus-visible:outline-none"
          >
            {t.altLink}
          </Link>
        </p>
      </div>
    </main>
  )
}

const inputClass = cn(
  'w-full rounded-xl border border-input bg-background/50 px-3.5 py-2.5 text-sm',
  'placeholder:text-muted-foreground/60 transition-[color,box-shadow] duration-200 motion-reduce:transition-none',
  'focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
)

const submitClass = cn(
  'mt-2 w-full rounded-xl bg-gradient-to-b from-primary to-primary/85 px-4 py-2.5 text-sm font-semibold text-primary-foreground',
  'shadow-lg shadow-primary/20 transition-[transform,opacity,box-shadow] duration-200 motion-reduce:transition-none',
  'hover:opacity-90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
  'active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60',
)
