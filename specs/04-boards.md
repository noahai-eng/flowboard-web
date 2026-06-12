# Spec 04 — Boards-CRUD

## Ziel
Boards anlegen, umbenennen, löschen, öffnen. Board-Liste in der Sidebar wird live
korrekt. Reihenfolge der Boards via `position`.

## Abhängt von
Spec 01 (boards-Tabelle), 03 (Shell/Sidebar).

## Scope
- **Drin:** Create/Rename/Delete-Board (Server Actions), Board-Detail-Route
  (leeres Board-Canvas, Listen folgen in Spec 5), Empty-State.
- **Draußen:** Board-Reorder-DnD (optional später), Sharing (out-of-scope).

## Dateien
```
flow-board-web/src/app/(app)/board/[boardId]/page.tsx   # Board-Canvas
flow-board-web/src/app/(app)/board/actions.ts            # createBoard/renameBoard/deleteBoard
flow-board-web/src/components/board/create-board-dialog.tsx
flow-board-web/src/components/board/board-menu.tsx        # rename/delete
```

## Server Actions
- `createBoard(title)`: insert (owner default `auth.uid()`, position = max+1000),
  `revalidatePath`, gibt neue Board-ID zurück (für Redirect).
- `renameBoard(id, title)`: update (RLS sichert Ownership).
- `deleteBoard(id)`: delete (cascade löscht Lists/Cards). Bestätigungs-Dialog.
- Zod-Validierung (Titel 1–120 Zeichen). Typisiertes `{data}|{error}`-Result.

## UI / UX
- Create-Board: shadcn Dialog, Titel-Input, Enter speichert. Nach Anlegen → Board öffnen.
- Board-Detail: Header mit Titel + `board-menu` (Rename inline / Delete mit Confirm).
- Empty-State wenn keine Boards: einladende Card mit „Erstes Board erstellen".
- Design-System einhalten (Gradients, Hover/Focus, radius).

## Akzeptanzkriterien
- [ ] Board anlegen → erscheint in Sidebar + öffnet sich.
- [ ] Rename spiegelt sofort in Sidebar + Header.
- [ ] Delete entfernt Board (+ Cascade), Confirm vorher.
- [ ] Nur eigene Boards sichtbar/änderbar (RLS).
- [ ] Empty-State bei null Boards.

## Verification
typecheck · lint · Browser-Check (CRUD-Zyklus) · Codex-Review.
