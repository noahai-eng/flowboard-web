import { CreateBoardDialog } from '@/components/board/create-board-dialog'

export default function BoardEntryPage() {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(90%_70%_at_50%_-10%,oklch(0.3_0.05_265/0.35),transparent_60%)]"
      />

      <div className="max-w-md text-center">
        <div
          aria-hidden
          className="mx-auto mb-6 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-primary/80 to-primary/30 text-primary-foreground shadow-xl shadow-primary/20"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-7"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <line x1="15" y1="3" x2="15" y2="21" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">Willkommen bei Flow Board</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Waehle links ein Board aus oder lege dein erstes Board an, um loszulegen.
        </p>
        <div className="mt-6 flex justify-center">
          <CreateBoardDialog variant="cta" />
        </div>
      </div>
    </div>
  )
}
