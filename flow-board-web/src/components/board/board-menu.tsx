'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

import { deleteBoard, renameBoard } from '@/app/(app)/board/actions'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type BoardMenuProps = {
  board: { id: string; title: string }
}

export function BoardMenu({ board }: BoardMenuProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(board.title)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    setTitle(board.title)
    setEditing(true)
    requestAnimationFrame(() => inputRef.current?.select())
  }

  function commitRename() {
    const next = title.trim()
    setEditing(false)
    if (next.length === 0 || next === board.title) {
      setTitle(board.title)
      return
    }
    startTransition(async () => {
      const result = await renameBoard(board.id, next)
      if ('error' in result) {
        setTitle(board.title)
        return
      }
      router.refresh()
    })
  }

  function confirmDelete() {
    startTransition(async () => {
      const result = await deleteBoard(board.id)
      if ('error' in result) return
      setConfirmOpen(false)
      router.push('/board')
      router.refresh()
    })
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      {editing ? (
        <input
          ref={inputRef}
          value={title}
          maxLength={120}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitRename()
            if (e.key === 'Escape') {
              setTitle(board.title)
              setEditing(false)
            }
          }}
          aria-label="Board umbenennen"
          className="min-w-0 rounded-lg border border-input bg-background/60 px-2 py-1 text-xl font-semibold tracking-tight focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
        />
      ) : (
        <h1 className="truncate text-xl font-semibold tracking-tight" title={board.title}>
          {board.title}
        </h1>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Board-Optionen"
          className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors duration-150 motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 data-[popup-open]:bg-muted"
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={startEdit}>
            <Pencil className="size-4" />
            Umbenennen
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
            <Trash2 className="size-4" />
            Loeschen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Board loeschen?"
        description="Das Board und alle Listen und Karten darin werden dauerhaft entfernt."
        pending={pending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
