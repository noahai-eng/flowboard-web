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
