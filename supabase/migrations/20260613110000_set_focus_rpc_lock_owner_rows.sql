-- Spec 11 (Review-Fix): konkurrierende set_focus-Aufrufe desselben Users
-- serialisieren. Vor dem Freigeben/Setzen alle aktiven Focus-Rows des Users
-- sperren -> ein paralleler Aufruf wartet, statt in den Unique-Index zu laufen.
create or replace function public.set_focus(p_card_id uuid, p_slot smallint)
returns public.cards
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_card public.cards;
begin
  if p_slot is null or p_slot < 1 or p_slot > 3 then
    raise exception 'invalid focus slot';
  end if;

  -- Bewegte Card sperren (RLS: nur eigene sichtbar).
  select * into v_card from public.cards where id = p_card_id for update;
  if not found then
    raise exception 'card not found or not permitted';
  end if;

  -- Aktive Focus-Rows des Users sperren -> serialisiert konkurrierende
  -- set_focus-Aufrufe, der Slot-Tausch kann den Unique-Index nicht hart treffen.
  perform 1 from public.cards
    where owner = v_card.owner and is_focus_active = true
    for update;

  -- Belegten Slot desselben Users freigeben (andere Card).
  update public.cards
    set is_focus_active = false, focus_slot = null
    where owner = v_card.owner
      and focus_slot = p_slot
      and is_focus_active = true
      and id <> p_card_id;

  -- Ziel-Card in den Slot setzen.
  update public.cards
    set focus_slot = p_slot, is_focus_active = true
    where id = p_card_id
    returning * into v_card;

  return v_card;
end;
$$;
