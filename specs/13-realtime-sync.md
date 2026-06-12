# Spec 13 — Realtime-Sync

## Ziel
Änderungen an Cards eines Boards (Insert/Update/Delete) live über Geräte synchronisieren
(Solo-User, Cross-Device). Basis: Supabase Postgres Changes.

## Abhängt von
Spec 06/07 (Cards + Mutationen). Discovery §A6 (DELETE-Eigenheiten).

## Pflicht
**Context7 MCP** für aktuelle Realtime-Patterns.

## DB (Migration)
```sql
alter publication supabase_realtime add table cards;
alter table cards replica identity full;  -- alte Werte bei UPDATE
```

## Client-Pattern (aus Discovery — exakt)
```ts
const channel = supabase
  .channel(`cards:board:${boardId}`)
  .on('postgres_changes',
      { event: '*', schema: 'public', table: 'cards', filter: `board_id=eq.${boardId}` },
      (payload) => applyChange(payload))
  .subscribe()
// Cleanup bei Unmount/Board-Wechsel:
return () => { supabase.removeChannel(channel) }
```
- Callbacks **vor** `subscribe()` registrieren.
- **Idempotenz:** INSERT-Echo des eigenen Inserts → State **per Card-`id` upserten**
  (dedupe gegen optimistischen Eintrag aus Spec 6).
- **DELETE (kritisch):** Spaltenfilter `board_id=eq.` matcht DELETE **nicht** zuverlässig
  (bei RLS nur PK im Payload). Deshalb:
  - DELETE **lokal-optimistisch** (Card sofort aus State beim eigenen Delete), UND
  - Cross-Device-Deletes: separater Channel-Listener auf `event:'DELETE'` **ohne**
    Spaltenfilter, Abgleich per `payload.old.id` gegen lokalen State.
  - Alternative (falls nötig): **Tombstone** via `deleted_at` (Delete = Update, filterbar) —
    erst einbauen, wenn der PK-Abgleich praktisch nicht reicht. Vor Bau kurz verifizieren.

## Akzeptanzkriterien
- [ ] Insert/Update einer Card auf Gerät A erscheint auf Gerät B (gleiches Board).
- [ ] Eigener Insert erzeugt kein Doppel (id-Upsert greift).
- [ ] Delete auf A verschwindet auf B (PK-Abgleich).
- [ ] Channel wird bei Board-Wechsel/Unmount sauber entfernt (kein Leak/Doppel-Sub).
- [ ] Keine Fremd-Board-Events (Filter + RLS).

## Verification
typecheck · lint · Zwei-Tab-Test (Insert/Update/Delete-Sync) · Codex-Review.
