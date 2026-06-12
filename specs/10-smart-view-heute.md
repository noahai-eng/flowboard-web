# Spec 10 — Smart-View „Heute"

## Ziel
Aggregierte Sicht aller Cards mit Due-Date heute (in User-Timezone), board-übergreifend.
Read-only Liste mit Sprung zur Card.

## Abhängt von
Spec 08/09 (Due-Date, Card-Render), Spec 01 (profiles.timezone).

## DB — SQL-View (Migration)
```sql
-- security_invoker = true: View respektiert RLS des aufrufenden Users
create view today_cards with (security_invoker = true) as
select c.*
from cards c
join profiles p on p.id = c.owner
where c.due_date is not null
  and (c.due_date at time zone p.timezone)::date
      = (now() at time zone p.timezone)::date;
```
**Wichtig:** Filter in **User-Timezone** über `at time zone p.timezone`, NICHT `current_date`
direkt (sonst Server-TZ). `security_invoker = true` zwingend, sonst umgeht die View RLS.

## UI / UX
- Route `(app)/today`. Cards gruppiert/sortiert (z.B. nach Priority, dann Board).
- Klick öffnet das Card-Detail-Modal (wiederverwendet Spec 8) im Kontext.
- **Smart-View-Wechsel mit Cross-Fade** (Motion) zwischen Board ↔ Heute ↔ Focus.
- Empty-State („Nichts für heute fällig").

## Akzeptanzkriterien
- [ ] Zeigt genau die heute-fälligen Cards des Users in dessen Timezone.
- [ ] Tageswechsel/Timezone korrekt (Test mit verschobener profiles.timezone).
- [ ] View respektiert RLS (kein Fremd-Card-Leak) — `get_advisors` ok.
- [ ] Cross-Fade beim View-Wechsel; reduced-motion respektiert.

## Verification
typecheck · lint · SQL-Test (TZ-Grenzfälle) · `get_advisors` · Browser-Check · Codex-Review.
