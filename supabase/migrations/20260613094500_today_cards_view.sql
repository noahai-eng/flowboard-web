-- Spec 10: Smart-View "Heute". Aggregiert alle heute-faelligen Cards des Users
-- in dessen Timezone (profiles.timezone), board-uebergreifend.
-- security_invoker = true: die View laeuft mit den Rechten des aufrufenden
-- Users -> RLS der cards greift, kein Fremd-Card-Leak.
create view public.today_cards with (security_invoker = true) as
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
  c.updated_at
from public.cards c
join public.profiles p on p.id = c.owner
where c.due_date is not null
  and (c.due_date at time zone p.timezone)::date
      = (now() at time zone p.timezone)::date;
