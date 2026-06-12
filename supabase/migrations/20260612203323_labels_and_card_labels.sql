create table labels (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards(id) on delete cascade,
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  color text not null check (color in
    ('red','orange','amber','green','teal','blue','violet','pink')),
  created_at timestamptz not null default now()
);

create table card_labels (
  card_id uuid not null references cards(id) on delete cascade,
  label_id uuid not null references labels(id) on delete cascade,
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,  -- denormalisiert fuer RLS
  primary key (card_id, label_id)
);

create index on labels (board_id);
create index on card_labels (label_id);

alter table labels      enable row level security;
alter table card_labels enable row level security;

create policy "labels_own" on labels for all to authenticated
  using ( (select auth.uid()) = owner ) with check ( (select auth.uid()) = owner );

create policy "card_labels_own" on card_labels for all to authenticated
  using ( (select auth.uid()) = owner ) with check ( (select auth.uid()) = owner );
