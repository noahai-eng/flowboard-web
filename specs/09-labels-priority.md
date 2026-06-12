# Spec 09 — Labels + Priority

## Ziel
Cards mit Labels (Preset-Farbpalette) und Priority versehen. Anzeige auf Card + Edit im
Detail-Modal. Filter-Grundlage für Smart-Views.

## Abhängt von
Spec 08 (Detail-Modal), Spec 01 (cards.priority existiert bereits).

## Sparring-Entscheidung
**Label-Farben = Preset-Palette** (feste Token-Liste), kein freier Color-Picker.

## Schema (Migration)
```sql
-- Preset-Farben als Enum-artige Constraint (Tokens im Design-System gespiegelt)
create table labels (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards(id) on delete cascade,
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  color text not null check (color in
    ('red','orange','amber','green','teal','blue','violet','pink')),
  created_at timestamptz not null default now()
);

create table card_labels (
  card_id uuid not null references cards(id) on delete cascade,
  label_id uuid not null references labels(id) on delete cascade,
  primary key (card_id, label_id)
);

alter table labels enable row level security;
alter table card_labels enable row level security;
-- labels: owner = auth.uid(); card_labels: über card.owner (direkte owner-Spalte
-- auf card_labels denormalisieren ODER EXISTS über cards) — owner-Spalte bevorzugt.
```
Priority nutzt bestehende `cards.priority` (smallint 1–4, null = keine).

## Design-Tokens
Die 8 Label-Farben als CSS-Variablen in `globals.css` (Light/Dark-abgestuft, keine grellen
Hex). Zentrale Map `LABEL_COLORS` in `flow-board-web/src/lib/labels.ts`.

## UI / UX
- Card-Item: Label-Chips (farbige Pills) + Priority-Indikator (Farbe/Icon je Stufe).
- Detail-Modal: Label-Picker (Preset-Palette, Mehrfachauswahl, Label anlegen mit Name +
  Preset-Farbe), Priority-Select (Urgent/High/Medium/Low/None).
- Konsistenz Light/Dark über Tokens.

## Server Actions
- `createLabel(boardId, name, color)`, `assignLabel(cardId, labelId)`,
  `unassignLabel(cardId, labelId)`, `setPriority(cardId, priority|null)`.

## Akzeptanzkriterien
- [ ] Label anlegen (Preset-Farbe) + Card zuweisen/entfernen.
- [ ] Priority setzen/entfernen; Indikator auf Card.
- [ ] Farben konsistent Light/Dark, nur Preset-Werte (DB-Constraint).
- [ ] Labels board-scoped + RLS.

## Verification
typecheck · lint · `get_advisors` · Browser-Check · Codex-Review.
