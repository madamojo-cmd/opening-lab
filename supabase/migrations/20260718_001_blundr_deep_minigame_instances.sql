-- Store the dedicated deep scenario separately from the answer-safe projection.
alter table public.blundr_minigame_instances
  add column if not exists kind text not null default 'legacy';
alter table public.blundr_minigame_instances
  add column if not exists server_scenario jsonb;
alter table public.blundr_minigame_instances
  drop constraint if exists blundr_minigame_instances_kind_check;
alter table public.blundr_minigame_instances
  add constraint blundr_minigame_instances_kind_check check (kind in ('legacy', 'deep'));
