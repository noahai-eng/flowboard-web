-- Spec 12: Volltextsuche (Titel + Beschreibung), deutsch.
-- 'german'::regconfig -> der Ausdruck ist IMMUTABLE (Voraussetzung fuer
-- generated column); to_tsvector('german', ...) mit text-Config waere nur STABLE.
alter table public.cards
  add column search tsvector
  generated always as (
    to_tsvector('german'::regconfig, coalesce(title, '') || ' ' || coalesce(description, ''))
  ) stored;

create index cards_search_gin on public.cards using gin (search);
