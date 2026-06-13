-- Spec 15: KI-Kategorisierungs-Vorschlaege mit Versions-Snapshot.
create table public.category_suggestions (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade,
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  suggested_label_id uuid references public.labels(id) on delete set null,
  suggested_priority smallint check (suggested_priority between 1 and 4),
  card_updated_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index on public.category_suggestions (card_id);

alter table public.category_suggestions enable row level security;

create policy "category_suggestions_own" on public.category_suggestions for all to authenticated
  using ( (select auth.uid()) = owner )
  with check ( (select auth.uid()) = owner );
