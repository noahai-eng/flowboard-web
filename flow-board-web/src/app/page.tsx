import Link from 'next/link'
import { ArrowRight, CalendarCheck, LayoutGrid, Sparkles } from 'lucide-react'

// Spec 16: oeffentliche Landingpage. Eingeloggte User leitet der Proxy von '/'
// auf '/board' (kein Auth-Gate auf '/'). Diese Seite ist ausgeloggt erreichbar.
export default function LandingPage() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden">
      {/* Layered Gradient-Hintergrund */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,oklch(0.28_0.06_265)_0%,oklch(0.16_0.01_265)_55%,oklch(0.13_0.005_265)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-96 w-[42rem] max-w-full -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
      />

      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <span className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/50 text-primary-foreground shadow-lg shadow-primary/20"
          >
            <LayoutGrid className="size-4" />
          </span>
          <span className="text-base font-semibold tracking-tight">Flow Board</span>
        </span>
        <Link
          href="/login"
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors duration-150 motion-reduce:transition-none hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          Anmelden
        </Link>
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-7 px-6 py-16 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
          <Sparkles className="size-3.5 text-primary" />
          Persoenliches Kanban mit KI
        </span>
        <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
          Bring deine Projekte
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {' '}in Fluss
          </span>
        </h1>
        <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          Boards, Listen und Karten per Drag-and-drop. Smart-Views fuer Heute und Focus.
          KI, die aus einem Satz konkrete Karten macht. Alles in einer fokussierten App.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none hover:opacity-90 motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            Kostenlos starten
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/40 px-5 py-2.5 text-sm font-medium backdrop-blur-sm transition-colors duration-150 motion-reduce:transition-none hover:bg-card/70 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            Anmelden
          </Link>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-4 px-6 pb-20 sm:grid-cols-3">
        <Feature
          icon={<LayoutGrid className="size-5" />}
          title="Boards & Drag-and-drop"
          text="Listen und Karten frei anordnen — fluessig, mit atomarem Verschieben."
        />
        <Feature
          icon={<CalendarCheck className="size-5" />}
          title="Smart-Views"
          text="Heute zeigt Faelliges in deiner Zeitzone, Focus haelt max. 3 Prioritaeten."
        />
        <Feature
          icon={<Sparkles className="size-5" />}
          title="KI-Karten"
          text="Aus einem Prompt generierte Karten und automatische Kategorisierung."
        />
      </section>
    </main>
  )
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode
  title: string
  text: string
}) {
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-border/60 bg-gradient-to-b from-card/70 to-card/40 p-5 shadow-lg shadow-black/20 transition-[transform,box-shadow] duration-150 ease-out motion-reduce:transition-none motion-safe:hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30">
      <span className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary">
        {icon}
      </span>
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  )
}
