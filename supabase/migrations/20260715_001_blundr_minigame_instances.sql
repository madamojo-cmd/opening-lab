-- Server-owned standalone minigame instances.
-- Solutions and validator state are service-role-only JSON; browser clients
-- receive a projection from the server instance routes.
create table if not exists public.blundr_minigame_instances (
  instance_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  mini_game_id text not null,
  source text not null check (source = 'standalone_review'),
  server_card jsonb not null,
  server_state jsonb not null,
  first_attempt text check (first_attempt is null or first_attempt in ('correct', 'incorrect', 'reveal')),
  retry_count integer not null default 0 check (retry_count >= 0),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_blundr_minigame_instances_user_updated
  on public.blundr_minigame_instances (user_id, updated_at desc);

alter table public.blundr_minigame_instances enable row level security;
revoke all on public.blundr_minigame_instances from anon, authenticated;
drop policy if exists blundr_minigame_instances_browser_denied on public.blundr_minigame_instances;
