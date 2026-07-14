-- Combined Step 2: provider game data, bounded imports, and deterministic findings.
-- Apply through the repository migration workflow; never directly in production.

create table if not exists public.blundr_provider_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  provider text not null check (provider in ('chesscom', 'lichess')),
  username text not null check (char_length(username) between 1 and 80),
  external_player_id text,
  verification_state text not null default 'pending' check (verification_state in ('pending', 'verified', 'retryable_error', 'permanent_error')),
  connected_at timestamptz not null default now(),
  last_successful_sync_at timestamptz,
  next_eligible_sync_at timestamptz,
  sanitized_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create table if not exists public.blundr_game_import_jobs (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  provider text not null check (provider in ('chesscom', 'lichess')),
  status text not null check (status in ('queued', 'leased', 'running', 'completed', 'partially_completed', 'retryable_error', 'permanent_error', 'cancelled', 'dead_letter')),
  cursor jsonb not null default '{}'::jsonb,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  lease_owner text,
  lease_expires_at timestamptz,
  correlation_id text not null,
  fetched_count integer not null default 0,
  accepted_count integer not null default 0,
  duplicate_count integer not null default 0,
  excluded_count integer not null default 0,
  matched_count integer not null default 0,
  gated_count integer not null default 0,
  analyzed_count integer not null default 0,
  finding_count integer not null default 0,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists blundr_game_import_jobs_active_provider
  on public.blundr_game_import_jobs (user_id, provider)
  where status in ('queued', 'leased', 'running');

create table if not exists public.blundr_external_games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  provider text not null check (provider in ('chesscom', 'lichess')),
  provider_game_id text,
  provider_fingerprint text,
  fallback_fingerprint text not null,
  username text not null,
  white_player text not null,
  black_player text not null,
  played_at timestamptz not null,
  result text not null check (result in ('1-0', '0-1', '1/2-1/2', '*')),
  time_control text,
  rated boolean,
  variant text not null default 'standard',
  normalized_pgn text not null,
  normalized_moves text[] not null default '{}',
  player_color text not null check (player_color in ('white', 'black')),
  classification_state text not null default 'pending' check (classification_state in ('pending', 'processed', 'excluded')),
  processing_version text not null,
  classifier_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider, provider_game_id),
  unique (user_id, provider_fingerprint),
  unique (user_id, fallback_fingerprint)
);

create table if not exists public.blundr_game_opening_segments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  segment_id text not null,
  game_fingerprint text not null,
  opening_id text not null,
  repertoire_side text not null check (repertoire_side in ('white', 'black')),
  first_matched_ply integer not null check (first_matched_ply > 0),
  last_matched_ply integer not null check (last_matched_ply >= first_matched_ply),
  divergence_ply integer,
  runtime_version text not null,
  access_state text not null default 'gated_pending' check (access_state in ('active', 'gated_pending', 'revoked', 'unknown')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, segment_id)
);

create table if not exists public.blundr_learning_findings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  finding_id text not null,
  finding_fingerprint text not null,
  segment_id text not null,
  game_fingerprint text not null,
  position_key text not null,
  opening_id text,
  repertoire_side text not null check (repertoire_side in ('white', 'black', 'unknown')),
  category text not null,
  confidence numeric not null check (confidence >= 0 and confidence <= 1),
  severity text not null check (severity in ('low', 'medium', 'high')),
  evidence jsonb not null,
  explanation text not null,
  recommended_activity_types text[] not null default '{}',
  status text not null check (status in ('active', 'gated_pending', 'resolved', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, finding_fingerprint)
);

alter table public.blundr_provider_accounts enable row level security;
alter table public.blundr_game_import_jobs enable row level security;
alter table public.blundr_external_games enable row level security;
alter table public.blundr_game_opening_segments enable row level security;
alter table public.blundr_learning_findings enable row level security;

drop policy if exists blundr_provider_accounts_select_own on public.blundr_provider_accounts;
create policy blundr_provider_accounts_select_own on public.blundr_provider_accounts for select using (user_id = auth.uid());
drop policy if exists blundr_provider_accounts_insert_own on public.blundr_provider_accounts;
create policy blundr_provider_accounts_insert_own on public.blundr_provider_accounts for insert with check (user_id = auth.uid());
drop policy if exists blundr_provider_accounts_update_own on public.blundr_provider_accounts;
create policy blundr_provider_accounts_update_own on public.blundr_provider_accounts for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists blundr_provider_accounts_delete_own on public.blundr_provider_accounts;
create policy blundr_provider_accounts_delete_own on public.blundr_provider_accounts for delete using (user_id = auth.uid());

-- Import jobs and source data are server-worker owned. Browser clients receive sanitized API read models only.
revoke all on public.blundr_game_import_jobs from anon, authenticated;
revoke insert, update, delete on public.blundr_external_games from anon, authenticated;
revoke insert, update, delete on public.blundr_game_opening_segments from anon, authenticated;
revoke insert, update, delete on public.blundr_learning_findings from anon, authenticated;

drop policy if exists blundr_external_games_select_own on public.blundr_external_games;
create policy blundr_external_games_select_own on public.blundr_external_games for select using (user_id = auth.uid());
drop policy if exists blundr_game_segments_select_own on public.blundr_game_opening_segments;
create policy blundr_game_segments_select_own on public.blundr_game_opening_segments for select using (user_id = auth.uid());
drop policy if exists blundr_learning_findings_select_own on public.blundr_learning_findings;
create policy blundr_learning_findings_select_own on public.blundr_learning_findings for select using (user_id = auth.uid());

-- Server code must use the service role for source ingestion and derived writes.
revoke insert, update, delete on public.blundr_provider_accounts from anon;

create or replace function public.blundr_game_data_force_auth_user()
returns trigger language plpgsql security invoker as $$
begin
  if auth.uid() is not null then new.user_id = auth.uid(); end if;
  return new;
end;
$$;

drop trigger if exists blundr_provider_accounts_force_auth_user on public.blundr_provider_accounts;
create trigger blundr_provider_accounts_force_auth_user
before insert on public.blundr_provider_accounts
for each row execute function public.blundr_game_data_force_auth_user();
