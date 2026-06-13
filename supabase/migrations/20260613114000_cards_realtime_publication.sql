-- Spec 13: Realtime-Sync fuer cards (Solo-User, Cross-Device).
alter publication supabase_realtime add table public.cards;
-- replica identity full -> alte Werte bei UPDATE/DELETE im Payload (board_id,
-- id verfuegbar). RLS auf cards gilt weiterhin -> keine Fremd-Board-Events.
alter table public.cards replica identity full;
