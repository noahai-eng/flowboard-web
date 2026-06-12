# Flow Board — Router

Persoenliche Kanban-App (Solo-User). Web jetzt, React-Native/Expo spaeter auf
derselben Supabase-DB. Schema + APIs plattform-agnostisch halten.

## Monorepo

- `flow-board-web/` — Next.js 16 App (hier passiert die Web-Arbeit; npm-Befehle hier ausfuehren)
- `flow-board-native/` — Expo App, spaeter (aktuell Platzhalter)
- Root — uebergreifende Doku (`rules/`, `specs/`, Logs, `architektur-entscheidung.md`)

## Wo steht was

- **Architektur (final):** `architektur-entscheidung.md` — Plattform-Achsen, nicht neu verhandeln.
- **Design-System + Motion:** `rules/design-system.md`
- **Code-Conventions:** `rules/code-conventions.md` (Branches, Import-Order, Error-Pattern)
- **Tech-Stack + Pflicht-Quellen:** `rules/tech-stack.md` (Context7-Pflicht, Versionen, Out-of-Scope)
- **Self-Validation + Review:** `rules/verification.md`
- **Codex-Review-Template:** `rules/codex-review.md`
- **Allg. Guidelines:** `guidelines.md`
- **Specs:** `specs/` (16 Feature-Specs, `specs/README.md` als Index)

## Root-Logs

- `implementierungsplan.md` — Arbeitspakete + Status + Reihenfolge
- `backlog.md` — bewusst verschobene Ideen / Out-of-Scope
- `changelog.md` — was pro Spec fertig wurde
- `learning.md` — Erkenntnisse, Stolpersteine, Doc-Abweichungen

## Harte Regeln

- **Next 16** → Cookie-Refresh in `proxy.ts` (nicht `middleware.ts`). Kein `next lint`, nur `eslint .`.
- **Auth/Sicherheit:** Entscheidungen via `getClaims()` oder RLS. `getSession()` server nie als Security-Check. `auth.getUser()` nur wenn User-Record gebraucht.
- **Shared Endpunkte** (AI etc.) als Route Handler unter `app/api/.../route.ts` — Web + Expo teilen HTTP. Server Actions bleiben Web-only.
- **Mutationen** in shared Server-Funktionen / Postgres-RPCs kapseln (z.B. `move_card`).
- **Context7 MCP Pflicht** bei Auth, Realtime, AI-SDK.
- **Self-Validation:** `npm run typecheck` + `npm run lint` + Codex-nach-Spec. Kein Husky, kein Pre-Commit-Hook.
- **Secrets:** keine Keys / `.env.local`-Inhalte in Output, Code oder Logs. Service-Role-Key nie im Client.
- **Out-of-Scope:** kein PWA/Service-Worker, kein Multi-User/Team, kein OAuth. Siehe `backlog.md`.
