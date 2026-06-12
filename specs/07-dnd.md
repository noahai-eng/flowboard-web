# Spec 07 — Cards-DnD

## Ziel
Cards per Drag-and-Drop innerhalb einer Liste umsortieren und zwischen Listen verschieben.
Persistenz atomar via Postgres-RPC `move_card`. Position-Modell: Integer-Gaps + Reindex.

## Abhängt von
Spec 06 (Cards). Discovery §B (DnD-Patterns).

## Entscheidungen (festgehalten)
- **Nur dnd-kit** für Cross- UND Same-List. **Kein Motion `Reorder`** — Abweichung vom
  Kickoff (dort `Reorder` für Same-List): Discovery §B2 zeigt, dass zwei DnD-Systeme auf
  denselben Cards kollidieren (Doppel-Transforms, springende Items). Animation stattdessen
  über `<motion.* layout>` auf den Cards.
- **Position-Modell: Integer-Gaps** (`bigint`, Schritt 1000) + Reindex bei Erschöpfung
  (Sparring). Gekapselt in `move_card`.
- dnd-kit-Variante: vor Bau `npm view @dnd-kit/react version` prüfen; im Zweifel klassische
  `@dnd-kit/core` + `/sortable`-API (breiter dokumentiert). Entscheidung in Branch festhalten.

## RPC `move_card` (atomar, via apply_migration)
```sql
-- Signatur: card ans Ziel zwischen optionalen Nachbarn einsortieren
move_card(p_card_id uuid, p_target_list_id uuid,
          p_before_card_id uuid, p_after_card_id uuid) returns cards
```
Transaktional:
1. `for update` auf bewegter Card.
2. Anchor-Positionen (`before`/`after`) **frisch** aus DB lesen (Client nicht vertrauen).
3. Neue Position = Mittelwert der Anchor-`position` (bzw. max+1000 ans Ende, min-1000 an
   Anfang). Same- und Cross-List in EINEM Update (`list_id` + `position` + `board_id`-Sync).
4. **Reindex-Fallback:** wenn Gap < 2 (kein Integer mehr dazwischen) → Ziel-Liste in
   derselben Transaktion neu indizieren (`position = row_number()*1000`), dann einsortieren.
5. Card zurückgeben.

## Client
- Ein `DndContext`/Provider ums Board, ein `SortableContext` pro Liste, Spalte als
  Droppable (leere Listen). Collision `closestCorners`. DragOverlay via Portal.
- `onDragOver`: Card optimistisch in Zielspalte umhängen (Cross-List live).
- `onDragEnd`: finalen Container + Nachbarn (before/after-Card-IDs) ermitteln →
  `move_card` aufrufen. Bei Fehler optimistischen State zurückrollen.
- Sensors: PointerSensor (`distance: 8`), KeyboardSensor (Accessibility).

## Akzeptanzkriterien
- [ ] Same-List-Reorder persistiert korrekt (Reload behält Reihenfolge).
- [ ] Cross-List-Move persistiert (list_id + position + board_id korrekt).
- [ ] Reindex greift, wenn Gap erschöpft (Test: viele Inserts an gleicher Stelle).
- [ ] Fehlerfall rollt optimistischen State zurück.
- [ ] Tastatur-DnD funktioniert; reduced-motion respektiert.
- [ ] Kein Flackern/Doppel-Transform (nur ein DnD-System).

## Verification
typecheck · lint · Browser-Check (Same/Cross/Reindex/Tastatur) · RPC-Test via SQL ·
Codex-Review.
