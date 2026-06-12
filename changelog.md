# Changelog — Flow Board

Was pro Spec / Phase fertig wurde. Neueste Eintraege oben.

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
