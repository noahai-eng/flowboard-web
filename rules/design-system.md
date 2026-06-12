# Design-System — Flow Board

Ziel-Niveau: Linear, Cal.com, Raycast, Arc, Bento.me. **Nicht** Default-shadcn-Demo
oder generischer Kanban-Clone. UI muss hochwertig wirken.

## Tokens

- Quelle: `src/app/globals.css` (`:root` = Light, `.dark` = Dark). Basis ist shadcn "neutral" (oklch).
- Sobald der User einen eigenen `globals.css`-Snippet liefert, ersetzt er die Token-Bloecke 1:1.
- `--radius: 1rem` als Default — keine rechteckigen Cards.
- Dark Mode ist **Default** (`.dark` am `<html>` in `layout.tsx`).

## Visuelle Regeln (Pflicht)

- Keine flachen Farben — immer Gradients + Layering.
- Keine harten `#000` / `#fff` — abgestufte Neutrals (oklch).
- Hover- **und** Focus-State auf jedem interaktiven Element.
- Smooth Transitions, min. 150ms ease-out.
- Weiche, mehrschichtige Shadows.
- `100dvh` statt `100vh` fuer Full-Height (Tailwind: `min-h-dvh`).

## Motion (`motion/react`, frueher Framer Motion)

- Card-DnD: Layout-Animation, Cards weichen smooth aus.
- Card ↔ Detail-Modal: Shared-Layout-Transition via `layoutId`.
- Smart-View-Wechsel: Cross-Fade.
- AI-Stream: Stagger pro eingetroffener Card, `transition={{ delay: index * 0.05 }}` (50ms).
- DnD: dnd-kit fuer Cross-List, Motion-`Reorder` nur fuer Same-List.
- `@media (prefers-reduced-motion: reduce)` immer respektieren.

## Native-Spiegelung (spaeter)

Design-Tokens sind Single Source of Truth: CSS-Variablen spiegeln 1:1 auf NativeWind.
Shadows + Animationen plattform-spezifisch.
