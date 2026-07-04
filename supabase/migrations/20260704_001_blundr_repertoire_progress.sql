-- Blundr repertoire progression events.
-- These tables store deterministic text IDs generated on the client so repertoire
-- point awards and unlock events can round-trip through local demo and Supabase.

create table if not exists public.blundr_repertoire_point_events (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null,
  points integer not null default 0,
  opening_id text,
  daily_session_id text,
  created_at timestamptz not null default now(),
  constraint blundr_repertoire_point_events_points_check check (points >= 0),
  constraint blundr_repertoire_point_events_source_check check (
    source in (
      'opening_run_completed',
      'continuation_completed',
      'daily_blundr_deck_completed',
      'manual_dev_adjustment'
    )
  )
);

create table if not exists public.blundr_repertoire_unlock_events (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  opening_id text not null,
  points_spent integer not null default 0,
  unlock_index integer not null,
  created_at timestamptz not null default now(),
  constraint blundr_repertoire_unlock_events_points_check check (points_spent >= 0),
  constraint blundr_repertoire_unlock_events_unlock_index_check check (unlock_index >= 1)
);

create index if not exists idx_blundr_repertoire_point_events_user_created_at
  on public.blundr_repertoire_point_events (user_id, created_at desc);

create index if not exists idx_blundr_repertoire_unlock_events_user_created_at
  on public.blundr_repertoire_unlock_events (user_id, created_at desc);

alter table public.blundr_repertoire_point_events enable row level security;
alter table public.blundr_repertoire_unlock_events enable row level security;

drop policy if exists blundr_repertoire_point_events_select_own on public.blundr_repertoire_point_events;
create policy blundr_repertoire_point_events_select_own
  on public.blundr_repertoire_point_events
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists blundr_repertoire_point_events_insert_own on public.blundr_repertoire_point_events;
create policy blundr_repertoire_point_events_insert_own
  on public.blundr_repertoire_point_events
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists blundr_repertoire_point_events_update_own on public.blundr_repertoire_point_events;
create policy blundr_repertoire_point_events_update_own
  on public.blundr_repertoire_point_events
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists blundr_repertoire_point_events_delete_own on public.blundr_repertoire_point_events;
create policy blundr_repertoire_point_events_delete_own
  on public.blundr_repertoire_point_events
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists blundr_repertoire_unlock_events_select_own on public.blundr_repertoire_unlock_events;
create policy blundr_repertoire_unlock_events_select_own
  on public.blundr_repertoire_unlock_events
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists blundr_repertoire_unlock_events_insert_own on public.blundr_repertoire_unlock_events;
create policy blundr_repertoire_unlock_events_insert_own
  on public.blundr_repertoire_unlock_events
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists blundr_repertoire_unlock_events_update_own on public.blundr_repertoire_unlock_events;
create policy blundr_repertoire_unlock_events_update_own
  on public.blundr_repertoire_unlock_events
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists blundr_repertoire_unlock_events_delete_own on public.blundr_repertoire_unlock_events;
create policy blundr_repertoire_unlock_events_delete_own
  on public.blundr_repertoire_unlock_events
  for delete
  to authenticated
  using (auth.uid() = user_id);
