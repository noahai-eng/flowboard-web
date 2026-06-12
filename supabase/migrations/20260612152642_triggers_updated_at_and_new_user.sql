-- updated_at automatisch bei jedem Update setzen
create or replace function set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger boards_set_updated_at before update on boards
  for each row execute function set_updated_at();
create trigger lists_set_updated_at before update on lists
  for each row execute function set_updated_at();
create trigger cards_set_updated_at before update on cards
  for each row execute function set_updated_at();

-- neuer Auth-User -> profiles-Zeile mit Default-Timezone
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();
