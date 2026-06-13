-- Spec 15: Vorschlag anwenden mit Optimistic-Concurrency-Check.
-- Nur wenn die Card seit dem Snapshot (card_updated_at) unveraendert ist.
-- SECURITY INVOKER: RLS auf category_suggestions/cards/card_labels gilt.
create or replace function public.apply_suggestion(p_suggestion_id uuid)
returns public.cards
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_sug public.category_suggestions;
  v_card public.cards;
begin
  select * into v_sug from public.category_suggestions where id = p_suggestion_id;
  if not found then
    raise exception 'suggestion not found or not permitted';
  end if;

  select * into v_card from public.cards where id = v_sug.card_id for update;
  if not found then
    raise exception 'card not found or not permitted';
  end if;

  -- Versions-Check: Card seit dem Snapshot veraendert -> stale.
  if v_card.updated_at <> v_sug.card_updated_at then
    raise exception 'stale';
  end if;

  if v_sug.suggested_priority is not null then
    update public.cards set priority = v_sug.suggested_priority where id = v_card.id;
  end if;

  -- Label zuordnen (card_labels-RLS prueft Board-Scope, Spec 9). Idempotent.
  if v_sug.suggested_label_id is not null then
    insert into public.card_labels (card_id, label_id)
      values (v_card.id, v_sug.suggested_label_id)
      on conflict do nothing;
  end if;

  select * into v_card from public.cards where id = v_card.id;
  return v_card;
end;
$$;
