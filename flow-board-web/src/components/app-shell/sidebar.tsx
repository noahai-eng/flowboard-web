'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, type ReactNode } from 'react'

import { CreateBoardDialog } from '@/components/board/create-board-dialog'
import { cn } from '@/lib/utils'

import { SearchBox } from './search-box'
import { UserMenu } from './user-menu'

type BoardNavItem = { id: string; title: string }

type SidebarProps = {
  boards: BoardNavItem[]
  boardsError?: boolean
  email: string
}

export function Sidebar({ boards, boardsError = false, email }: SidebarProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const close = () => setOpen(false)

  return (
    <>
      {/* Mobile-Topbar */}
      <div className="flex items-center gap-3 border-b border-border/60 bg-card/40 px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Menue oeffnen"
          aria-expanded={open}
          aria-controls="app-sidebar"
          className="grid size-9 place-items-center rounded-xl text-muted-foreground transition-colors duration-150 motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          <MenuIcon />
        </button>
        <Brand />
      </div>

      {/* Backdrop (mobil) */}
      {open ? (
        <div
          aria-hidden
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
        />
      ) : null}

      {/* Sidebar */}
      <aside
        id="app-sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col gap-6 border-r border-border/60 p-4',
          'bg-[linear-gradient(180deg,oklch(0.22_0.01_265)_0%,oklch(0.17_0.005_265)_100%)] shadow-2xl shadow-black/30',
          'transition-transform duration-200 ease-out motion-reduce:transition-none',
          'md:static md:z-auto md:translate-x-0 md:shadow-none',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        <div className="px-1.5 pt-1">
          <Brand onNavigate={close} />
        </div>

        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
          <SearchBox onNavigate={close} />

          <Section label="Smart-Views">
            <NavLink
              href="/today"
              active={pathname === '/today'}
              icon={<TodayIcon />}
              label="Heute"
              onNavigate={close}
            />
            <NavLink
              href="/focus"
              active={pathname === '/focus'}
              icon={<FocusIcon />}
              label="Focus"
              onNavigate={close}
            />
          </Section>

          <Section label="Boards">
            {boardsError ? (
              <p className="px-3 py-2 text-xs leading-relaxed text-destructive">
                Boards konnten nicht geladen werden. Bitte lade die Seite neu.
              </p>
            ) : boards.length === 0 ? (
              <p className="px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                Noch keine Boards. Erstelle dein erstes Board.
              </p>
            ) : (
              boards.map((board) => {
                const href = `/board/${board.id}`
                return (
                  <NavLink
                    key={board.id}
                    href={href}
                    active={pathname === href}
                    icon={<BoardIcon />}
                    label={board.title}
                    onNavigate={close}
                  />
                )
              })
            )}
            <div className="pt-1">
              <CreateBoardDialog variant="sidebar" />
            </div>
          </Section>
        </nav>

        <UserMenu email={email} />
      </aside>
    </>
  )
}

function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/board"
      onClick={onNavigate}
      className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
    >
      <span
        aria-hidden
        className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/50 text-primary-foreground shadow-lg shadow-primary/20"
      >
        <FlowMark />
      </span>
      <span className="text-base font-semibold tracking-tight">Flow Board</span>
    </Link>
  )
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
        {label}
      </p>
      {children}
    </div>
  )
}

function NavLink({
  href,
  active,
  icon,
  label,
  onNavigate,
}: {
  href: string
  active: boolean
  icon: ReactNode
  label: string
  onNavigate?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors duration-150 motion-reduce:transition-none',
        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
        active
          ? 'bg-gradient-to-r from-primary/20 to-primary/5 font-medium text-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
      )}
    >
      <span className="shrink-0 text-current opacity-80">{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  )
}

/* --- Inline Icons (kein Icon-Paket noetig) --- */

const iconProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className: 'size-4',
}

function MenuIcon() {
  return (
    <svg {...iconProps}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function TodayIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function FocusIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.5" fill="currentColor" />
    </svg>
  )
}

function BoardIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  )
}

function FlowMark() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
    >
      <path d="M4 7h16" />
      <path d="M4 12h10" />
      <path d="M4 17h6" />
    </svg>
  )
}
