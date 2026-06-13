-- Spec 11: Focus-Mode. Max 3 aktive Focus-Cards pro User, im Schema erzwungen.
alter table public.cards
  add column focus_slot smallint check (focus_slot between 1 and 3),
  add column is_focus_active boolean not null default false;

-- Aktiv => Slot muss gesetzt sein (sonst wuerde der Partial-Index NULLs als
-- distinct behandeln und mehr als 3 aktive Cards zulassen).
alter table public.cards
  add constraint cards_focus_slot_required
  check (is_focus_active = false or focus_slot is not null);

-- max 1 Card pro (User, Slot) solange aktiv -> nie mehr als 3 aktive Focus-Cards.
create unique index cards_focus_slot_unique
  on public.cards (owner, focus_slot)
  where is_focus_active = true;
