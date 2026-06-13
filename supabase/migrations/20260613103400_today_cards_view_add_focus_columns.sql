-- Spec 11: Focus-Spalten in die Heute-View aufnehmen, damit SmartCardT
-- ueberall konsistent ist (Detail-Modal kann Focus-Status korrekt zeigen).
-- Neue Spalten am Ende -> create or replace zulaessig.
create or replace view public.today_cards with (security_invoker = true) as
select
  c.id,
  c.list_id,
  c.board_id,
  c.owner,
  c.title,
  c.description,
  c.due_date,
  c.priority,
  c.position,
  c.created_at,
  c.updated_at,
  c.focus_slot,
  c.is_focus_active
from public.cards c
left join public.profiles p on p.id = c.owner
where c.due_date is not null
  and (c.due_date at time zone coalesce(p.timezone, 'Europe/Vienna'))::date
      = (now() at time zone coalesce(p.timezone, 'Europe/Vienna'))::date;
