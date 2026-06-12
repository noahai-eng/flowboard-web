# Spec 11 — Focus-Mode

## Ziel
User markiert max. 3 Cards als „Focus" (aktuelle Prioritäten). Eigene Ansicht zeigt nur
diese Slots. Maximum **im Schema erzwungen**, nicht in App-Logik.

## Abhängt von
Spec 06 (Cards), Spec 10 (Smart-View-Pattern + Cross-Fade).

## Bereits entschieden (nicht neu verhandeln)
3 Slots fix, durchgesetzt via Partial Unique Index.

## Schema (Migration)
```sql
alter table cards
  add column focus_slot smallint check (focus_slot between 1 and 3),
  add column is_focus_active boolean not null default false;

-- max 1 Card pro (User, Slot) solange aktiv → max 3 aktive Focus-Cards pro User
create unique index cards_focus_slot_unique
  on cards (owner, focus_slot)
  where is_focus_active = true;
```
Das Schema (nicht die App) garantiert: kein Slot doppelt, also nie >3 aktive Focus-Cards.

## Server Actions / RPC
- `setFocus(cardId, slot)`: setzt `focus_slot` + `is_focus_active = true`. Bei belegtem
  Slot Konflikt → vorher freigeben oder gezielt überschreiben (Transaktion/RPC, damit der
  Unique-Index nicht hart fehlschlägt).
- `clearFocus(cardId)`: `is_focus_active = false`, `focus_slot = null`.

## UI / UX
- Route `(app)/focus`: zeigt die ≤3 aktiven Focus-Cards prominent (große Cards, Slot-Reihenfolge).
- Focus-Toggle auf Card / im Detail-Modal (Slot-Auswahl 1–3).
- Cross-Fade beim View-Wechsel (wie Spec 10). Empty-State („Keine Focus-Cards").
- Versuch, 4. Card zu fokussieren → klare UX (Slot wählen/ersetzen), kein roher DB-Fehler.

## Akzeptanzkriterien
- [ ] Max 3 aktive Focus-Cards — durch Partial Unique Index erzwungen (DB-Test).
- [ ] Set/Clear Focus funktioniert; Slot-Konflikt sauber behandelt (kein 500).
- [ ] Focus-View zeigt korrekte Slots in Reihenfolge.
- [ ] RLS respektiert.

## Verification
typecheck · lint · DB-Test (4. Slot scheitert kontrolliert) · Browser-Check · Codex-Review.
