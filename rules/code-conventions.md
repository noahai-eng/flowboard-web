# Code-Conventions — Flow Board

## Branches

- `feat/*` — neue Features
- `fix/*` — Bugfixes
- `refactor/*` — Umbau ohne Verhaltensaenderung
- `test/*` — Tests

Ein Branch pro Spec. Skeleton-Commit von Phase 0 bleibt auf dem Default-Branch.

## TypeScript

- `strict` an. Keine `any` ohne begruendeten Kommentar.
- Server-only-Code nie in Client-Komponenten importieren (Service-Role-Key niemals client-seitig).

## Import-Order

1. React / Next
2. Externe Libs (Drittpakete)
3. Interne Aliase (`@/...`)
4. Relative Imports (`./`, `../`)
5. Styles / Assets zuletzt

## Error-Pattern

- Server Actions + Route Handler: Fehler abfangen, typisiertes Result zurueckgeben
  (`{ data }` / `{ error }`), nicht unkontrolliert werfen.
- Keine Secrets / DB-Internals in Client-sichtbaren Fehlermeldungen.
- User-facing Meldungen freundlich, technische Details nur in Server-Logs.

## Struktur

- Shared Endpunkte (AI etc.) → `flow-board-web/src/app/api/.../route.ts` (Web + Expo teilen HTTP).
- Server Actions → Web-only, fuer Mutationen + CRUD.
- Mutationslogik in shared Server-Funktionen oder Postgres-RPCs kapseln.
