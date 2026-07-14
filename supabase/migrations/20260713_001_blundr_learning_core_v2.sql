-- Learning Core v2: append-only evidence, deterministic mastery, and weakness projections.
-- Apply locally first. No production migration is performed by this repository change.

create table if not exists public.blundr_learning_events (
  event_id text primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  idempotency_key text not null,
  schema_version text not null,
  session_id text not null,
  attempt_id text,
  occurred_at timestamptz not null,
  taxonomy text not null,
  position_key text,
  canonical_fen text,
  opening_id text,
  expected_move_uci text,
  repertoire_side text not null default 'unknown',
  move_order_key text,
  source text not null,
  first_attempt boolean not null default false,
  finding jsonb,
  content_version text not null,
  classifier_version text not null,
  migration_marker text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key),
  constraint blundr_learning_events_side_check check (repertoire_side in ('white', 'black', 'unknown')),
  constraint blundr_learning_events_source_check check (source in ('train', 'daily', 'review', 'imported_game', 'system')),
  constraint blundr_learning_events_migration_marker_check check (migration_marker is null or char_length(migration_marker) <= 80)
);

create table if not exists public.blundr_node_mastery (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  position_key text not null,
  attempts integer not null default 0,
  first_attempt_at timestamptz,
  first_attempt_result text,
  confidence numeric not null default 0,
  access_decision text not null default 'unknown',
  updated_at timestamptz not null default now(),
  primary key (user_id, position_key),
  constraint blundr_node_mastery_attempts_check check (attempts >= 0),
  constraint blundr_node_mastery_confidence_check check (confidence >= 0 and confidence <= 1),
  constraint blundr_node_mastery_access_check check (access_decision in ('active', 'gated_pending', 'revoked', 'unknown'))
);

create table if not exists public.blundr_weakness_projection (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  position_key text not null,
  category text not null,
  score numeric not null default 0,
  confidence numeric not null default 0,
  explanation text not null,
  recommended_daily_intervention text not null,
  access_decision text not null default 'unknown',
  source_event_ids text[] not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (user_id, position_key, category),
  constraint blundr_weakness_score_check check (score >= 0 and score <= 1),
  constraint blundr_weakness_confidence_check check (confidence >= 0 and confidence <= 1),
  constraint blundr_weakness_access_check check (access_decision in ('active', 'gated_pending', 'revoked', 'unknown'))
);

create index if not exists idx_blundr_learning_events_user_occurred on public.blundr_learning_events (user_id, occurred_at desc);
create index if not exists idx_blundr_learning_events_user_position on public.blundr_learning_events (user_id, position_key);
create index if not exists idx_blundr_weakness_projection_user_score on public.blundr_weakness_projection (user_id, score desc);

alter table public.blundr_learning_events enable row level security;
alter table public.blundr_node_mastery enable row level security;
alter table public.blundr_weakness_projection enable row level security;

drop policy if exists blundr_learning_events_select_own on public.blundr_learning_events;
create policy blundr_learning_events_select_own on public.blundr_learning_events for select using (user_id = auth.uid());
drop policy if exists blundr_learning_events_insert_own on public.blundr_learning_events;
create policy blundr_learning_events_insert_own on public.blundr_learning_events for insert with check (user_id = auth.uid());
drop policy if exists blundr_learning_events_no_update on public.blundr_learning_events;
create policy blundr_learning_events_no_update on public.blundr_learning_events for update using (false) with check (false);
drop policy if exists blundr_learning_events_no_delete on public.blundr_learning_events;
create policy blundr_learning_events_no_delete on public.blundr_learning_events for delete using (false);

drop policy if exists blundr_node_mastery_select_own on public.blundr_node_mastery;
create policy blundr_node_mastery_select_own on public.blundr_node_mastery for select using (user_id = auth.uid());
drop policy if exists blundr_weakness_projection_select_own on public.blundr_weakness_projection;
create policy blundr_weakness_projection_select_own on public.blundr_weakness_projection for select using (user_id = auth.uid());

-- Mastery and projections are written by trusted server code only.
revoke insert, update, delete on public.blundr_node_mastery from anon, authenticated;
revoke insert, update, delete on public.blundr_weakness_projection from anon, authenticated;

create or replace function public.blundr_learning_events_force_auth_user()
returns trigger language plpgsql security invoker as $$
begin
  if auth.uid() is not null then new.user_id = auth.uid(); end if;
  return new;
end;
$$;

drop trigger if exists blundr_learning_events_force_auth_user on public.blundr_learning_events;
create trigger blundr_learning_events_force_auth_user
before insert on public.blundr_learning_events
for each row execute function public.blundr_learning_events_force_auth_user();
