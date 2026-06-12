-- profiles: 1:1 zu auth.users, haelt Timezone fuer Smart-Views
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  timezone text not null default 'Europe/Vienna',
  created_at timestamptz not null default now()
);

create table boards (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  position bigint not null default 1000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table lists (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards(id) on delete cascade,
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  position bigint not null default 1000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table cards (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references lists(id) on delete cascade,
  board_id uuid not null references boards(id) on delete cascade,  -- denormalisiert fuer Realtime-Filter
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  description text,
  due_date timestamptz,
  priority smallint check (priority between 1 and 4),  -- 1=urgent ... 4=low, null=keine
  position bigint not null default 1000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on boards (owner, position);
create index on lists (board_id, position);
create index on cards (list_id, position);
create index on cards (board_id);   -- Realtime-Filter
