# Flow Board

Persoenliche Kanban-App fuer fokussiertes Projekt-Management. Solo-User: Boards →
Lists → Cards, Drag-and-Drop, Smart-Views (Heute, Focus), AI-Card-Generation.
Web jetzt, React-Native/Expo spaeter auf derselben Supabase-DB.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind v4 · shadcn/ui ·
Motion · dnd-kit · Supabase (Postgres + RLS, Email/Passwort) · Vercel.

## Entwicklung

```bash
npm run dev        # Dev-Server (http://localhost:3000)
npm run build      # Production-Build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint .
```

## Orientierung

- `CLAUDE.md` — Router auf alle Regeln + Logs
- `architektur-entscheidung.md` — finale Plattform-Entscheidungen
- `rules/` — Design-System, Conventions, Verification, Tech-Stack, Codex-Review
- `specs/` — 16 Feature-Specs (ab Phase 3)
- `implementierungsplan.md` · `backlog.md` · `changelog.md` · `learning.md`

## Self-Validation

Kein Husky / Pre-Commit-Hook. Pro Spec: `typecheck` + `lint` + Codex-Review
(`rules/verification.md`).
