-- Canonical runtime coordinates for authenticated Trainer seen-line progress.
-- These keys identify approved runtime nodes; they never contain answers.
alter table public.blundr_node_mastery
  add column if not exists opening_id text,
  add column if not exists play_key text;

create index if not exists blundr_node_mastery_user_opening_play_key_idx
  on public.blundr_node_mastery (user_id, opening_id, play_key)
  where opening_id is not null and play_key is not null;
