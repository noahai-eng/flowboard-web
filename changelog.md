# Changelog — Flow Board

Was pro Spec / Phase fertig wurde. Neueste Eintraege oben.

## Phase 1-3 — Discovery, Sparring, Specs (2026-06-12)

- Phase 1 Discovery: 2 parallele Sub-Agents (Supabase SSR/RLS/Realtime, DnD-Position),
  konsolidiert in `references/discovery.md` (Quelle: Context7 MCP).
- Phase 2 Sparring (3 Fragen): Position-Modell Integer-Gaps, Label-Preset-Palette,
  Quick-Add sofort speichern.
- Phase 3 Output: voller `implementierungsplan.md` (Arbeitspakete + Reihenfolge-Begruendung)
  + 16 Feature-Specs `specs/01..16`.
- Preflight-Befund: Supabase-MCP-Token defekt (muss gefixt werden), browser-use + Context7 ok.

## Phase 0 — Monorepo-Umbau (2026-06-12)

- Auf Monorepo umgestellt: Web-Scaffold nach `flow-board-web/` verschoben,
  `flow-board-native/` als Platzhalter angelegt (Expo kommt spaeter).
- Uebergreifende Doku (`rules/`, `specs/`, Logs, `architektur-entscheidung.md`) bleibt im Root.
- `.gitignore` gesplittet: app-spezifisch in `flow-board-web/.gitignore`, Root schlank.
- `architektur-entscheidung.md` um Abschnitt "Repo-Struktur (Monorepo)" ergaenzt
  (ersetzt frueheren "separates Repo"-Stand). CLAUDE.md, README, Rules-Pfade angepasst.

## Phase 0 — Skeleton (2026-06-12)

- Next.js 16.2.9 Scaffold (TS strict, Tailwind v4, App Router, src-dir, npm).
- shadcn/ui init (Style `base-nova`, Base-Color neutral): `components.json`,
  `src/lib/utils.ts`, `button.tsx`, Token-Set in `globals.css`.
- Design-Anpassung: `--radius: 1rem`, Dark Mode default (`.dark` am `<html>`),
  `min-h-dvh`, Theme-Platzhalter-Kommentar in `globals.css`.
- Dokumentations-Skeleton: `CLAUDE.md` (Router), `AGENTS.md` (Next-16-Warnung),
  `rules/` (design-system, code-conventions, verification, tech-stack, codex-review),
  `guidelines.md`, `specs/README.md`.
- Root-Logs angelegt: `implementierungsplan.md`, `backlog.md`, `changelog.md`, `learning.md`.
- Self-Validation-Scripts: `typecheck` (`tsc --noEmit`), `lint` (`eslint .`).
- Dev-Server-Smoke-Test: HTTP 200 auf localhost:3000.
