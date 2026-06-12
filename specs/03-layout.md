# Spec 03 — Base-Layout

## Ziel
App-Shell für den eingeloggten Bereich: Sidebar/Topbar mit Board-Navigation,
User-Menü (Sign-Out), Smart-View-Einstiege (Platzhalter), konsistenter Dark-Theme-Rahmen.

## Abhängt von
Spec 02 (Auth-Gate, Sign-Out-Action).

## Scope
- **Drin:** `(app)`-Route-Group mit Layout, App-Shell-Komponenten, aktiver-Zustand der
  Navigation, leerer `/board`-Einstieg.
- **Draußen:** Board-Inhalte (Spec 4+), Smart-View-Inhalte (Spec 10/11) — nur Nav-Slots.

## Dateien
```
flow-board-web/src/app/(app)/layout.tsx       # Shell, lädt Boards-Liste für Nav
flow-board-web/src/app/(app)/board/page.tsx    # Einstieg (Board-Auswahl / leer)
flow-board-web/src/components/app-shell/sidebar.tsx
flow-board-web/src/components/app-shell/user-menu.tsx
```

## UI / UX
- Full-Height via `min-h-dvh` (kein `100vh`).
- Sidebar: Logo, Board-Liste (aus DB, RLS-gefiltert), Smart-View-Links (Heute/Focus als
  Platzhalter, später aktiv), unten User-Menü mit Sign-Out.
- Design-System strikt: Gradient-Layer statt flacher Flächen, weiche Shadows, Hover- +
  Focus-State auf allen Nav-Items, Transitions ≥150ms, `--radius`.
- Responsive: Sidebar auf schmalen Viewports kollabierbar (Platzhalter für spätere
  Native-Bottom-Nav-Parität — nur Web hier).
- `prefers-reduced-motion` respektieren.

## Daten
- Layout (Server Component) holt via Server-Client die Boards des Users (`getClaims()`
  für User-ID nicht nötig — RLS filtert; nur Boards selektieren).

## Akzeptanzkriterien
- [ ] Eingeloggt → Shell mit eigener Board-Liste; ausgeloggt → Redirect `/login`.
- [ ] Sign-Out aus User-Menü funktioniert.
- [ ] Aktiver Nav-Zustand korrekt; Hover/Focus sichtbar.
- [ ] Layout bricht auf Mobile-Breite nicht (Shell nutzbar).

## Verification
typecheck · lint · Browser-Check (Nav, Sign-Out, Responsive) · Codex-Review.
