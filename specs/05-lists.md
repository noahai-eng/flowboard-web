# Spec 05 — Lists-CRUD

## Ziel
Innerhalb eines Boards Listen (Spalten) anlegen, umbenennen, löschen. Listen werden
horizontal als Kanban-Spalten gerendert, Reihenfolge via `position`.

## Abhängt von
Spec 04 (Board-Canvas).

## Scope
- **Drin:** Create/Rename/Delete-List (Server Actions), horizontales Spalten-Layout,
  „Liste hinzufügen"-Affordance am Ende.
- **Draußen:** List-Reorder-DnD (Cards-DnD ist Spec 7; List-Reorder optional Backlog),
  Cards (Spec 6).

## Dateien
```
flow-board-web/src/app/(app)/board/[boardId]/page.tsx   # rendert Listen-Spalten
flow-board-web/src/components/list/list-column.tsx
flow-board-web/src/components/list/add-list.tsx
flow-board-web/src/app/(app)/board/[boardId]/list-actions.ts
```

## Server Actions
- `createList(boardId, title)`: insert (board_id, owner default, position = max+1000 in
  diesem Board).
- `renameList(id, title)`: update.
- `deleteList(id)`: delete (cascade löscht Cards). Confirm bei nicht-leerer Liste.
- Zod (Titel 1–120). Typisiertes Result.

## UI / UX
- Board-Canvas: horizontaler, scrollbarer Spalten-Container (`overflow-x-auto`),
  Spaltenbreite fix (~300px), Full-Height-Spalten mit eigenem Scroll für Cards.
- `add-list`: inline am Ende, Klick öffnet Input, Enter legt an, leert/schließt.
- List-Header: Titel (inline editierbar) + Menü (rename/delete).
- Design-System: Spalten als gelayerte Flächen (kein flat), weiche Shadows, radius.

## Akzeptanzkriterien
- [ ] Liste anlegen → erscheint als Spalte, korrekt einsortiert.
- [ ] Rename inline funktioniert.
- [ ] Delete (mit Confirm bei Cards) entfernt Spalte + Cascade.
- [ ] Horizontaler Scroll bei vielen Spalten; Spalten Full-Height.
- [ ] Nur eigene Listen (RLS).

## Verification
typecheck · lint · Browser-Check · Codex-Review.
