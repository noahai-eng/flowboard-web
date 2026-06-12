# Specs — Flow Board

Nummerierte Feature-Specs in Abhaengigkeits-Reihenfolge. Pro Spec ein Branch +
Codex-Review (siehe `rules/verification.md`). Inhalte werden in **Phase 3** erzeugt.

## MVP 1 (Specs 1-9)

1. `01-schema-rls.md` — Schema + RLS (Solo-User via `auth.uid()`)
2. `02-auth.md` — Sign-Up/In/Out (Server Actions), Cookie-Refresh in `proxy.ts` mit `getClaims()`
3. `03-layout.md` — Base-Layout
4. `04-boards.md` — Boards-CRUD
5. `05-lists.md` — Lists-CRUD im Board
6. `06-cards.md` — Cards-CRUD (inline Quick-Add, Enter erzeugt Card)
7. `07-dnd.md` — Cards-DnD (Cross-List via dnd-kit, RPC `move_card`)
8. `08-card-detail.md` — Detail-Modal (shadcn Dialog + Motion `layoutId`)
9. `09-labels-priority.md` — Labels + Priority

## MVP+ (Specs 10-16)

10. `10-smart-view-heute.md` — SQL-View `today_cards` (security_invoker), User-Timezone
11. `11-focus-mode.md` — max 3 Slots (Partial Unique Index)
12. `12-fts.md` — Full-Text Search (tsvector generated column, GIN, `websearch_to_tsquery('german', ...)`)
13. `13-realtime-sync.md` — Postgres Changes, `board_id`-Filter, DELETE lokal/Tombstone
14. `14-smart-card-generation.md` — Route Handler, AI SDK 6 `streamText` + `Output.array`
15. `15-auto-categorize.md` — Server Action, Haiku via Requesty, Version-Check-RPC
16. `16-marketing-landingpage.md` — oeffentliche `/`, Proxy-Redirect fuer eingeloggte User

## Status

Skeleton steht (Phase 0). Specs noch nicht geschrieben — folgt nach Discovery + Sparring.
