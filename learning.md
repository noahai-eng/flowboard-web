# Learning — Flow Board

Erkenntnisse, Stolpersteine, Abweichungen von erwarteten Docs. Hilft, Fehler
nicht zu wiederholen.

## Phase 0

- **create-next-app + Großbuchstaben im Ordnernamen:** `trello_clonEA` wird als
  Package-Name abgelehnt (npm erlaubt keine Capitals). Loesung: in gueltig
  benannten Unterordner (`flow-board`) scaffolden, Inhalt ins Root ziehen.
  Package-Name ist jetzt sauber `flow-board`.
- **shadcn-CLI-Flags geaendert:** Kein `--base-color`/`-b neutral` mehr. `-b` ist
  jetzt `--base radix|base` (Component-Library). Init via `-d` (Defaults,
  Preset `base-nova`). Base-Color steckt im Preset.
- **Next 16 bestaetigt** (16.2.9): Cookie-Refresh gehoert in `proxy.ts`, nicht
  `middleware.ts`. `next lint` ist raus → `eslint .`.
- **Monorepo statt separates Repo:** Web → `flow-board-web/`, Native → `flow-board-native/`
  (spaeter). Uebergreifende Doku im Root. npm-Befehle laufen im Workspace, nicht im Root.
  Root-`package.json` mit npm-Workspaces folgt, sobald Native startet.

## Phase 1-3 (Discovery, Sparring, Specs)

- **Supabase-MCP-Token war defekt:** Wert in `.mcp.json` war ein JWT (`eyJh…`) in `${}`
  gewickelt — die MCP braucht aber einen Personal Access Token (`sbp_…`). Muss vom User
  gefixt werden, bevor Spec 1 (Schema) baubar ist.
- **Discovery-Befund (Realtime):** DELETE bei Postgres Changes ist NICHT spaltenfilterbar
  (bei RLS nur PK im Payload) → DELETE lokal-optimistisch + PK-Abgleich oder Tombstone.
- **Discovery-Befund (DnD):** Motion `Reorder` + dnd-kit auf denselben Cards kollidieren.
  Entscheidung: **nur dnd-kit**, Animation via `motion layout`. Bewusste Abweichung vom
  Kickoff, dokumentiert in Spec 7.
- **Sparring-Entscheidung Position-Modell:** Integer-Gaps + Reindex (NICHT Fractional, das
  war die Discovery-Empfehlung). User-Entscheidung; Reindex in `move_card` gekapselt.
- **getClaims statt getUser** im Proxy (aktueller Supabase-Stand) — kein DB-Roundtrip bei
  asymmetrischen Keys.
- **dnd-kit hat zwei API-Generationen** (`@dnd-kit/core` klassisch vs `@dnd-kit/react` neu).
  Vor Spec 7 Versions-Reife prüfen.
