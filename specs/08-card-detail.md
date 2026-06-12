# Spec 08 — Card-Detail-Modal

## Ziel
Klick auf eine Card öffnet ein Detail-Modal mit Titel, Beschreibung, Due-Date. Übergang
Card-in-Liste ↔ Modal als Shared-Layout-Transition (`layoutId`).

## Abhängt von
Spec 06 (Cards). Motion (`motion/react`).

## Scope
- **Drin:** Modal (shadcn Dialog), Edit von Titel/Beschreibung/Due-Date, Shared-Layout-
  Transition, Delete aus Modal.
- **Draußen:** Labels/Priority-Edit (Spec 9 erweitert das Modal), Attachments/Kommentare
  (out-of-scope).

## Dateien
```
flow-board-web/src/components/card/card-detail-dialog.tsx
flow-board-web/src/components/card/card-item.tsx        # layoutId-Quelle
flow-board-web/src/app/(app)/board/[boardId]/card-actions.ts  # erweitert
```

## UI / UX
- shadcn **Dialog** als Container; Card-Item und Modal teilen `layoutId={`card-${id}`}` →
  Motion Shared-Layout-Transition (Card „wächst" ins Modal).
- Felder: Titel (Inline-Heading-Edit), Beschreibung (Textarea, auto-save on blur),
  Due-Date (Date-Picker, speichert als `timestamptz`).
- Save-Strategie: Debounced/auto-save je Feld via `updateCard`-Action; optimistisch.
- Reduced-Motion: Shared-Layout-Transition auf simples Fade reduzieren.
- Design-System: gelayerte Modal-Fläche, Backdrop mit Blur/Gradient, Focus-Trap (shadcn),
  Hover/Focus auf allen Controls.

## Server Action
- `updateCard(id, {title?, description?, due_date?})`: partielles Update, typisiertes Result.

## Akzeptanzkriterien
- [ ] Klick auf Card öffnet Modal mit Shared-Layout-Transition.
- [ ] Titel/Beschreibung/Due-Date editierbar, persistiert (Reload bestätigt).
- [ ] Schließen (Esc/Backdrop/Button) animiert zurück zur Card.
- [ ] Delete aus Modal entfernt Card + schließt Modal.
- [ ] Reduced-Motion → Fade statt Layout-Transition.

## Verification
typecheck · lint · Browser-Check (Open/Edit/Close/Transition) · Codex-Review.
