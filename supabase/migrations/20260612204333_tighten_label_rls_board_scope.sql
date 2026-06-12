-- Board-Scoping in RLS verankern (nicht nur in den Server Actions):
-- labels nur fuer eigene Boards; card_labels nur fuer eigene Card + eigenes Label
-- im selben Board.
drop policy "labels_own" on labels;
create policy "labels_own" on labels for all to authenticated
  using ( (select auth.uid()) = owner )
  with check (
    (select auth.uid()) = owner
    and exists (
      select 1 from public.boards b
      where b.id = board_id and b.owner = (select auth.uid())
    )
  );

drop policy "card_labels_own" on card_labels;
create policy "card_labels_own" on card_labels for all to authenticated
  using ( (select auth.uid()) = owner )
  with check (
    (select auth.uid()) = owner
    and exists (
      select 1
      from public.cards c
      join public.labels l on l.board_id = c.board_id
      where c.id = card_id and l.id = label_id
        and c.owner = (select auth.uid())
        and l.owner = (select auth.uid())
    )
  );
