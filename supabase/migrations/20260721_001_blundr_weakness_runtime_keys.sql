alter table public.blundr_weakness_projection
  add column if not exists opening_id text,
  add column if not exists play_key text;

create index if not exists idx_blundr_weakness_projection_user_runtime
  on public.blundr_weakness_projection (user_id, opening_id, play_key, score desc, confidence desc, updated_at desc)
  where access_decision = 'active' and opening_id is not null and play_key is not null;
