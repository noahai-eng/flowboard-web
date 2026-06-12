alter table profiles enable row level security;
alter table boards   enable row level security;
alter table lists    enable row level security;
alter table cards    enable row level security;

-- profiles: nur eigener Datensatz
create policy "profiles_self" on profiles for all to authenticated
  using ( (select auth.uid()) = id ) with check ( (select auth.uid()) = id );

-- boards/lists/cards: identisches owner-Muster pro Tabelle
create policy "boards_own" on boards for all to authenticated
  using ( (select auth.uid()) = owner ) with check ( (select auth.uid()) = owner );

create policy "lists_own" on lists for all to authenticated
  using ( (select auth.uid()) = owner ) with check ( (select auth.uid()) = owner );

create policy "cards_own" on cards for all to authenticated
  using ( (select auth.uid()) = owner ) with check ( (select auth.uid()) = owner );
