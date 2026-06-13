-- Spec 10 (Review-Fix): robust gegen fehlenden Profil-Datensatz.
-- left join + coalesce(timezone) statt inner join, damit Cards nicht still
-- verschwinden, falls (theoretisch) kein profiles-Eintrag existiert.
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
  c.updated_at
from public.cards c
left join public.profiles p on p.id = c.owner
where c.due_date is not null
  and (c.due_date at time zone coalesce(p.timezone, 'Europe/Vienna'))::date
      = (now() at time zone coalesce(p.timezone, 'Europe/Vienna'))::date;
