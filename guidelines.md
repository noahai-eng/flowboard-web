# Guidelines — Flow Board

Allgemeine Arbeitsweise. Detailregeln siehe `rules/`, Router siehe `CLAUDE.md`.

## Arbeitsweise

- Eine Spec = ein Branch = ein Codex-Review = ein Changelog-Eintrag.
- Vor Auth-/Realtime-/AI-Code: Context7 MCP fuer aktuelle Docs (Pflicht).
- Vor Schema-Aenderungen: `list_tables` (Supabase MCP), bestehende Struktur verstehen.
- Mutationen atomar via Postgres-RPC kapseln, nicht in mehreren Client-Roundtrips.

## Plattform-Awareness (Native kommt spaeter)

- Schema + APIs plattform-agnostisch. Shared Endpunkte als Route Handler.
- Server Actions sind Web-spezifisch und bleiben es.
- Keine Web-only-Annahmen in geteilte Logik einbauen.

## Sicherheit

- Keine Tokens / API-Keys / Service-Role-Keys / `.env.local`-Inhalte in Output, Code oder Logs.
- Nur Variablennamen oder maskierte Praefixe zeigen.
- RLS ist die primaere Autorisierungsgrenze (Solo-User via `auth.uid()`).

## Definition of Done (pro Spec)

1. Akzeptanzkriterien der Spec erfuellt.
2. `npm run typecheck` + `npm run lint` gruen.
3. Codex-Review ohne offene Blocker.
4. Funktional geprueft (Browser / Endpoint).
5. `changelog.md` aktualisiert, ggf. `learning.md`.
