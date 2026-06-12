-- Atomares Verschieben einer Card (Same- und Cross-List) zwischen optionalen
-- Nachbarn. Integer-Gaps (Schritt 1000) + Reindex-Fallback bei Erschoepfung.
-- SECURITY INVOKER -> RLS sichert, dass nur eigene Cards/Listen betroffen sind.
create or replace function move_card(
  p_card_id uuid,
  p_target_list_id uuid,
  p_before_card_id uuid,
  p_after_card_id uuid
) returns public.cards
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_card public.cards;
  v_board uuid;
  v_before_pos bigint;
  v_after_pos bigint;
  v_new_pos bigint;
begin
  -- Bewegte Card sperren (RLS: nur eigene sichtbar).
  select * into v_card from public.cards where id = p_card_id for update;
  if not found then
    raise exception 'card not found or not permitted';
  end if;

  -- Ziel-Liste muss dem User gehoeren; board_id daraus ableiten.
  select board_id into v_board from public.lists where id = p_target_list_id;
  if v_board is null then
    raise exception 'target list not found or not permitted';
  end if;

  -- Anchor-Positionen FRISCH aus der DB lesen (Client nicht vertrauen),
  -- nur gueltig wenn der Anchor wirklich in der Ziel-Liste liegt.
  if p_before_card_id is not null then
    select position into v_before_pos from public.cards
      where id = p_before_card_id and list_id = p_target_list_id;
  end if;
  if p_after_card_id is not null then
    select position into v_after_pos from public.cards
      where id = p_after_card_id and list_id = p_target_list_id;
  end if;

  if v_before_pos is not null and v_after_pos is not null then
    v_new_pos := (v_before_pos + v_after_pos) / 2;
    if v_new_pos <= v_before_pos then
      -- Gap erschoepft: Ziel-Liste in derselben Transaktion reindizieren.
      with ordered as (
        select id, row_number() over (order by position, id) as rn
        from public.cards where list_id = p_target_list_id
      )
      update public.cards c set position = o.rn * 1000
      from ordered o where c.id = o.id;

      select position into v_before_pos from public.cards where id = p_before_card_id;
      select position into v_after_pos from public.cards where id = p_after_card_id;
      v_new_pos := (v_before_pos + v_after_pos) / 2;
    end if;
  elsif v_after_pos is not null then
    v_new_pos := v_after_pos - 1000;   -- an den Anfang (vor erster Card)
  elsif v_before_pos is not null then
    v_new_pos := v_before_pos + 1000;  -- ans Ende (nach letzter Card)
  else
    v_new_pos := 1000;                 -- leere Ziel-Liste
  end if;

  update public.cards
    set list_id = p_target_list_id, board_id = v_board, position = v_new_pos
    where id = p_card_id
    returning * into v_card;

  return v_card;
end;
$$;
