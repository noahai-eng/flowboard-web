# Spec 01 — Schema + RLS

## Ziel
Datenbasis für Flow Board: Tabellen boards/lists/cards (+ profiles) mit Row Level
Security, sodass jeder User nur seine eigenen Daten sieht. Solo-User via `auth.uid()`.

## Abhängt von
Nichts (erstes Spec). Supabase-MCP muss funktionieren (Access-Token gefixt).

## Scope
- **Drin:** profiles, boards, lists, cards, label-Enum/Tabelle-Basis, RLS-Policies,
  Indizes, `updated_at`-Trigger.
- **Draußen:** Labels-UI (Spec 9), Position-RPC (Spec 7), Smart-Views (Spec 10+),
  FTS-Spalte (Spec 12), Focus-Spalten (Spec 11). Hier nur die Kernspalten.

## Schema (Migration via Supabase MCP `apply_migration`)
```sql
-- profiles: 1:1 zu auth.users, hält Timezone für Smart-Views
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
  board_id uuid not null references boards(id) on delete cascade,  -- denormalisiert für Realtime-Filter
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
```

## RLS (direkte owner-Spalte, Pattern aus discovery.md §A5)
```sql
alter table profiles enable row level security;
alter table boards   enable row level security;
alter table lists    enable row level security;
alter table cards    enable row level security;

-- profiles: nur eigener Datensatz
create policy "profiles_self" on profiles for all to authenticated
  using ( (select auth.uid()) = id ) with check ( (select auth.uid()) = id );

-- boards/lists/cards: identisches Muster pro Tabelle (hier boards)
create policy "boards_own" on boards for all to authenticated
  using ( (select auth.uid()) = owner ) with check ( (select auth.uid()) = owner );
-- analog lists_own, cards_own (jeweils owner = (select auth.uid()))
```

## Zusätzlich
- `updated_at`-Trigger-Funktion `set_updated_at()` + Trigger auf boards/lists/cards.
- Trigger `on auth.users insert` → Profile-Zeile anlegen (`handle_new_user()`),
  damit jeder neue User automatisch ein profiles-Row mit Default-Timezone bekommt.
- `with check` für insert stellt sicher, dass `owner` = eingeloggter User ist
  (Default `auth.uid()` deckt das, check verhindert Fremd-owner).

## TypeScript-Typen
Nach Migration `mcp__supabase__generate_typescript_types` laufen lassen, Output nach
`flow-board-web/src/lib/supabase/database.types.ts`.

## Akzeptanzkriterien
- [ ] Migration läuft fehlerfrei (Supabase MCP), Tabellen + Indizes existieren.
- [ ] RLS auf allen 4 Tabellen aktiv; `get_advisors` zeigt keine RLS-Lücken.
- [ ] Neuer Auth-User bekommt automatisch profiles-Row.
- [ ] Insert mit fremdem owner wird durch `with check` blockiert.
- [ ] `updated_at` ändert sich bei Update automatisch.
- [ ] Generierte TS-Typen im Repo.

## Verification
`get_advisors` (security) ohne Findings · typecheck · Codex-Review gegen diese Spec.
