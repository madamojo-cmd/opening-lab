-- Daily BLUNDR accounts and persistence foundation.
-- RLS intent:
-- - users may only manage their own account-owned rows
-- - developer audit rows remain service-role/admin only
-- - validation snapshots are private to the owning user

create extension if not exists pgcrypto;

create or replace function public.blundr_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.blundr_user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  onboarding_completed boolean not null default false,
  rating_band_id text not null default '1200-1600',
  rating_source text not null default 'default',
  raw_rating integer,
  rating_time_control text,
  preferred_training_mode text not null default 'assisted',
  daily_tempo_goal integer not null default 10,
  daily_battery_goal integer not null default 3,
  daily_blundr_goal integer not null default 1,
  selected_starter_pack_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blundr_user_profiles_rating_band_check check (rating_band_id in ('new_to_openings', 'u800', '800-1200', '1200-1600', '1600-2000', '2000-plus')),
  constraint blundr_user_profiles_rating_source_check check (rating_source in ('manual', 'chesscom', 'lichess', 'default')),
  constraint blundr_user_profiles_rating_time_control_check check (rating_time_control is null or rating_time_control in ('rapid', 'blitz', 'classical', 'bullet', 'unknown')),
  constraint blundr_user_profiles_preferred_training_mode_check check (preferred_training_mode in ('assisted', 'plain')),
  constraint blundr_user_profiles_daily_tempo_goal_check check (daily_tempo_goal >= 1),
  constraint blundr_user_profiles_daily_battery_goal_check check (daily_battery_goal >= 1),
  constraint blundr_user_profiles_daily_blundr_goal_check check (daily_blundr_goal >= 1)
);

create table if not exists public.blundr_user_repertoires (
  user_id uuid primary key references auth.users(id) on delete cascade,
  selected_starter_pack_id text,
  unlocked_opening_ids text[] not null default '{}',
  locked_opening_ids text[] not null default '{}',
  opening_unlock_points integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint blundr_user_repertoires_opening_unlock_points_check check (opening_unlock_points >= 0)
);

create table if not exists public.blundr_daily_retention_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_date date not null,
  daily_tempo_goal integer not null default 10,
  daily_tempo_progress integer not null default 0,
  daily_tempo_completed boolean not null default false,
  daily_tempo_completed_at timestamptz,
  daily_battery_goal integer not null default 3,
  daily_battery_progress integer not null default 0,
  daily_battery_completed boolean not null default false,
  daily_battery_completed_at timestamptz,
  daily_blundr_goal integer not null default 1,
  daily_blundr_progress integer not null default 0,
  daily_blundr_completed boolean not null default false,
  daily_blundr_completed_at timestamptz,
  all_rings_closed boolean not null default false,
  xp_earned integer not null default 0,
  opening_points_earned integer not null default 0,
  streak_eligible boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, local_date),
  constraint blundr_daily_retention_progress_tempo_goal_check check (daily_tempo_goal >= 1),
  constraint blundr_daily_retention_progress_battery_goal_check check (daily_battery_goal >= 1),
  constraint blundr_daily_retention_progress_blundr_goal_check check (daily_blundr_goal >= 1),
  constraint blundr_daily_retention_progress_tempo_progress_check check (daily_tempo_progress >= 0),
  constraint blundr_daily_retention_progress_battery_progress_check check (daily_battery_progress >= 0),
  constraint blundr_daily_retention_progress_blundr_progress_check check (daily_blundr_progress >= 0),
  constraint blundr_daily_retention_progress_xp_check check (xp_earned >= 0),
  constraint blundr_daily_retention_progress_opening_points_check check (opening_points_earned >= 0)
);

create table if not exists public.blundr_opening_unlock_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  opening_id text not null,
  points_earned integer not null default 0,
  required_points integer not null,
  status text not null default 'locked',
  updated_at timestamptz not null default now(),
  unique (user_id, opening_id),
  constraint blundr_opening_unlock_progress_points_earned_check check (points_earned >= 0),
  constraint blundr_opening_unlock_progress_required_points_check check (required_points >= 1),
  constraint blundr_opening_unlock_progress_status_check check (status in ('locked', 'in_progress', 'unlocked'))
);

create table if not exists public.blundr_opening_unlock_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  opening_id text not null,
  source text not null,
  opening_points_earned integer not null,
  created_at timestamptz not null default now(),
  constraint blundr_opening_unlock_events_source_check check (source in ('daily_tempo', 'daily_battery', 'daily_blundr', 'all_rings_closed', 'reward_roll', 'weekly_milestone', 'monthly_milestone', 'manual_admin_unlock')),
  constraint blundr_opening_unlock_events_points_check check (opening_points_earned >= 0)
);

create table if not exists public.blundr_streak_records (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_completed_local_date date,
  updated_at timestamptz not null default now(),
  constraint blundr_streak_records_current_streak_check check (current_streak >= 0),
  constraint blundr_streak_records_longest_streak_check check (longest_streak >= 0)
);

create table if not exists public.blundr_reward_history (
  user_id uuid primary key references auth.users(id) on delete cascade,
  random_bonus_pity_counter integer not null default 0,
  last_random_bonus_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint blundr_reward_history_pity_check check (random_bonus_pity_counter >= 0)
);

create table if not exists public.blundr_reward_rolls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trigger text not null,
  rolled_at timestamptz not null default now(),
  did_reward boolean not null default false,
  reward_json jsonb,
  seed text not null,
  constraint blundr_reward_rolls_trigger_check check (trigger in ('daily_tempo_ring_closed', 'daily_battery_ring_closed', 'daily_blundr_ring_closed', 'all_rings_closed', 'three_day_streak', 'seven_day_streak', 'thirty_day_streak'))
);

create table if not exists public.blundr_validation_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  generated_at timestamptz not null default now(),
  valid boolean not null,
  issue_count integer not null default 0,
  error_count integer not null default 0,
  warning_count integer not null default 0,
  report_json jsonb not null,
  constraint blundr_validation_snapshots_issue_count_check check (issue_count >= 0),
  constraint blundr_validation_snapshots_error_count_check check (error_count >= 0),
  constraint blundr_validation_snapshots_warning_count_check check (warning_count >= 0)
);

create table if not exists public.blundr_developer_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  target_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_blundr_daily_retention_progress_user_date
  on public.blundr_daily_retention_progress (user_id, local_date desc);

create index if not exists idx_blundr_opening_unlock_events_user_created_at
  on public.blundr_opening_unlock_events (user_id, created_at desc);

create index if not exists idx_blundr_validation_snapshots_user_generated_at
  on public.blundr_validation_snapshots (user_id, generated_at desc);

create index if not exists idx_blundr_reward_rolls_user_rolled_at
  on public.blundr_reward_rolls (user_id, rolled_at desc);

drop trigger if exists blundr_user_profiles_touch_updated_at on public.blundr_user_profiles;
create trigger blundr_user_profiles_touch_updated_at
before update on public.blundr_user_profiles
for each row execute function public.blundr_touch_updated_at();

drop trigger if exists blundr_user_repertoires_touch_updated_at on public.blundr_user_repertoires;
create trigger blundr_user_repertoires_touch_updated_at
before update on public.blundr_user_repertoires
for each row execute function public.blundr_touch_updated_at();

drop trigger if exists blundr_daily_retention_progress_touch_updated_at on public.blundr_daily_retention_progress;
create trigger blundr_daily_retention_progress_touch_updated_at
before update on public.blundr_daily_retention_progress
for each row execute function public.blundr_touch_updated_at();

drop trigger if exists blundr_opening_unlock_progress_touch_updated_at on public.blundr_opening_unlock_progress;
create trigger blundr_opening_unlock_progress_touch_updated_at
before update on public.blundr_opening_unlock_progress
for each row execute function public.blundr_touch_updated_at();

drop trigger if exists blundr_streak_records_touch_updated_at on public.blundr_streak_records;
create trigger blundr_streak_records_touch_updated_at
before update on public.blundr_streak_records
for each row execute function public.blundr_touch_updated_at();

drop trigger if exists blundr_reward_history_touch_updated_at on public.blundr_reward_history;
create trigger blundr_reward_history_touch_updated_at
before update on public.blundr_reward_history
for each row execute function public.blundr_touch_updated_at();

alter table public.blundr_user_profiles enable row level security;
alter table public.blundr_user_repertoires enable row level security;
alter table public.blundr_daily_retention_progress enable row level security;
alter table public.blundr_opening_unlock_progress enable row level security;
alter table public.blundr_opening_unlock_events enable row level security;
alter table public.blundr_streak_records enable row level security;
alter table public.blundr_reward_history enable row level security;
alter table public.blundr_reward_rolls enable row level security;
alter table public.blundr_validation_snapshots enable row level security;
alter table public.blundr_developer_audit_log enable row level security;

drop policy if exists blundr_user_profiles_select_own on public.blundr_user_profiles;
create policy blundr_user_profiles_select_own
  on public.blundr_user_profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists blundr_user_profiles_insert_own on public.blundr_user_profiles;
create policy blundr_user_profiles_insert_own
  on public.blundr_user_profiles
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists blundr_user_profiles_update_own on public.blundr_user_profiles;
create policy blundr_user_profiles_update_own
  on public.blundr_user_profiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists blundr_user_profiles_delete_own on public.blundr_user_profiles;
create policy blundr_user_profiles_delete_own
  on public.blundr_user_profiles
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists blundr_user_repertoires_select_own on public.blundr_user_repertoires;
create policy blundr_user_repertoires_select_own
  on public.blundr_user_repertoires
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists blundr_user_repertoires_insert_own on public.blundr_user_repertoires;
create policy blundr_user_repertoires_insert_own
  on public.blundr_user_repertoires
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists blundr_user_repertoires_update_own on public.blundr_user_repertoires;
create policy blundr_user_repertoires_update_own
  on public.blundr_user_repertoires
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists blundr_user_repertoires_delete_own on public.blundr_user_repertoires;
create policy blundr_user_repertoires_delete_own
  on public.blundr_user_repertoires
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists blundr_daily_retention_progress_select_own on public.blundr_daily_retention_progress;
create policy blundr_daily_retention_progress_select_own
  on public.blundr_daily_retention_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists blundr_daily_retention_progress_insert_own on public.blundr_daily_retention_progress;
create policy blundr_daily_retention_progress_insert_own
  on public.blundr_daily_retention_progress
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists blundr_daily_retention_progress_update_own on public.blundr_daily_retention_progress;
create policy blundr_daily_retention_progress_update_own
  on public.blundr_daily_retention_progress
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists blundr_daily_retention_progress_delete_own on public.blundr_daily_retention_progress;
create policy blundr_daily_retention_progress_delete_own
  on public.blundr_daily_retention_progress
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists blundr_opening_unlock_progress_select_own on public.blundr_opening_unlock_progress;
create policy blundr_opening_unlock_progress_select_own
  on public.blundr_opening_unlock_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists blundr_opening_unlock_progress_insert_own on public.blundr_opening_unlock_progress;
create policy blundr_opening_unlock_progress_insert_own
  on public.blundr_opening_unlock_progress
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists blundr_opening_unlock_progress_update_own on public.blundr_opening_unlock_progress;
create policy blundr_opening_unlock_progress_update_own
  on public.blundr_opening_unlock_progress
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists blundr_opening_unlock_progress_delete_own on public.blundr_opening_unlock_progress;
create policy blundr_opening_unlock_progress_delete_own
  on public.blundr_opening_unlock_progress
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists blundr_opening_unlock_events_select_own on public.blundr_opening_unlock_events;
create policy blundr_opening_unlock_events_select_own
  on public.blundr_opening_unlock_events
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists blundr_opening_unlock_events_insert_own on public.blundr_opening_unlock_events;
create policy blundr_opening_unlock_events_insert_own
  on public.blundr_opening_unlock_events
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists blundr_streak_records_select_own on public.blundr_streak_records;
create policy blundr_streak_records_select_own
  on public.blundr_streak_records
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists blundr_streak_records_insert_own on public.blundr_streak_records;
create policy blundr_streak_records_insert_own
  on public.blundr_streak_records
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists blundr_streak_records_update_own on public.blundr_streak_records;
create policy blundr_streak_records_update_own
  on public.blundr_streak_records
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists blundr_streak_records_delete_own on public.blundr_streak_records;
create policy blundr_streak_records_delete_own
  on public.blundr_streak_records
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists blundr_reward_history_select_own on public.blundr_reward_history;
create policy blundr_reward_history_select_own
  on public.blundr_reward_history
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists blundr_reward_history_insert_own on public.blundr_reward_history;
create policy blundr_reward_history_insert_own
  on public.blundr_reward_history
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists blundr_reward_history_update_own on public.blundr_reward_history;
create policy blundr_reward_history_update_own
  on public.blundr_reward_history
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists blundr_reward_history_delete_own on public.blundr_reward_history;
create policy blundr_reward_history_delete_own
  on public.blundr_reward_history
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists blundr_reward_rolls_select_own on public.blundr_reward_rolls;
create policy blundr_reward_rolls_select_own
  on public.blundr_reward_rolls
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists blundr_reward_rolls_insert_own on public.blundr_reward_rolls;
create policy blundr_reward_rolls_insert_own
  on public.blundr_reward_rolls
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists blundr_validation_snapshots_select_own on public.blundr_validation_snapshots;
create policy blundr_validation_snapshots_select_own
  on public.blundr_validation_snapshots
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists blundr_validation_snapshots_insert_own on public.blundr_validation_snapshots;
create policy blundr_validation_snapshots_insert_own
  on public.blundr_validation_snapshots
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists blundr_validation_snapshots_update_own on public.blundr_validation_snapshots;
create policy blundr_validation_snapshots_update_own
  on public.blundr_validation_snapshots
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists blundr_validation_snapshots_delete_own on public.blundr_validation_snapshots;
create policy blundr_validation_snapshots_delete_own
  on public.blundr_validation_snapshots
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- No RLS policies are created for developer audit logs. The service role bypasses RLS,
-- and authenticated users should not be able to read or write this table directly.
