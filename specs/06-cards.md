# Spec 06 — Cards-CRUD (Quick-Add)

## Ziel
Cards in Listen anlegen (inline Quick-Add am Listen-Ende, Enter erzeugt Card und leert
das Feld für die nächste), bearbeiten (Titel inline), löschen. Basis für DnD + Detail.

## Abhängt von
Spec 05 (List-Spalten).

## Scope
- **Drin:** Quick-Add, Card-Render in Liste, Titel-Inline-Edit, Delete. Kernfelder
  Titel + (optional) Beschreibung.
- **Draußen:** DnD (Spec 7), Detail-Modal mit Due-Date/Description-Edit (Spec 8),
  Labels/Priority (Spec 9).

## Dateien
```
flow-board-web/src/components/card/card-item.tsx
flow-board-web/src/components/card/quick-add-card.tsx
flow-board-web/src/app/(app)/board/[boardId]/card-actions.ts
```

## Quick-Add-UX (Sparring-Entscheidung)
- Inline-Input am Listen-Ende. **Enter speichert sofort** (`createCard`), Input bleibt
  **fokussiert und leer** für die nächste Card.
- `Esc` oder Klick außerhalb schließt das Feld.
- Optimistisches Einfügen: Card erscheint sofort (temporäre id), wird nach Server-Antwort
  durch echten Datensatz ersetzt (id-Reconcile — Grundlage für Realtime-Idempotenz Spec 13).

## Server Actions
- `createCard(listId, title)`: insert (list_id, board_id aus list, owner default,
  position = max+1000 in der Liste). Gibt Card zurück.
- `updateCardTitle(id, title)`: update.
- `deleteCard(id)`: delete.
- Zod (Titel 1–200). Typisiertes Result.

## UI / UX
- Card: gelayerte Fläche, `--radius`, weiche Shadow, Hover hebt an (`translate`/Shadow),
  Focus-Ring. Klick auf Card öffnet später Detail (Spec 8) — hier nur Titel-Edit-Affordance.
- Reduced-Motion respektieren.

## Akzeptanzkriterien
- [ ] Enter im Quick-Add legt Card an, Feld bleibt leer + fokussiert → nächste Card ohne Maus.
- [ ] Card erscheint optimistisch, wird nach Save reconciled (kein Doppel).
- [ ] Titel inline editierbar; Delete entfernt Card.
- [ ] Position korrekt (ans Listen-Ende).
- [ ] Nur eigene Cards (RLS).

## Verification
typecheck · lint · Browser-Check (mehrere Cards schnell per Enter erfassen) · Codex-Review.
