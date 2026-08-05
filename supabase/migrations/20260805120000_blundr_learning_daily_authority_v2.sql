-- PR-01 / Migration A: additive learning and Daily authority contract.
--
-- This migration intentionally contains no FSRS algorithm or Daily composition
-- logic. Those decisions belong to the versioned application projector in PR-02.
-- SQL owns durable identity, ownership, transaction boundaries, and fail-closed
-- service-only entry points. Existing ambiguous rows remain explicitly legacy;
-- this migration never invents a runtime coordinate, a move, or a mastery state.

begin;

-- IANA locations are validated against the database timezone catalogue. The
-- slash requirement deliberately excludes ambiguous abbreviations such as EST;
-- canonical UTC is the one explicit no-slash IANA exception accepted here.
create or replace function public.blundr_is_valid_iana_time_zone(p_time_zone text)
returns boolean
language sql
stable
security invoker
set search_path = pg_catalog
as $$
  select (p_time_zone = 'UTC' or p_time_zone ~ '^[A-Za-z][A-Za-z0-9_+.-]*(/[A-Za-z0-9_+.-]+)+$')
    and exists (
      select 1
      from pg_catalog.pg_timezone_names
      where name = p_time_zone
    );
$$;

revoke all on function public.blundr_is_valid_iana_time_zone(text) from public, anon;
grant execute on function public.blundr_is_valid_iana_time_zone(text) to authenticated, service_role;

-- The profile is the existing user-owned settings authority. A NULL timezone is
-- retained for legacy rows rather than assigning an invented local date basis.
alter table public.blundr_user_profiles
  add column if not exists time_zone text;

alter table public.blundr_user_profiles
  drop constraint if exists blundr_user_profiles_time_zone_check;
alter table public.blundr_user_profiles
  add constraint blundr_user_profiles_time_zone_check
  check (time_zone is null or public.blundr_is_valid_iana_time_zone(time_zone));

-- Immutable learning evidence gains explicit exposure/provenance fields. Only
-- recalled material with a supplied exposure ID may claim first-attempt status.
alter table public.blundr_learning_events
  add column if not exists exposure_id text,
  add column if not exists evidence_kind text not null default 'legacy_unclassified',
  add column if not exists played_move_uci text,
  add column if not exists evidence_version text not null default 'legacy-unclassified',
  add column if not exists projection_version text,
  add column if not exists projected_at timestamptz;

-- Imported games are observations, never recall attempts. This is the only
-- source-derived classification that can be made without interpreting moves.
update public.blundr_learning_events
set evidence_kind = 'imported_observation',
    first_attempt = false
where source = 'imported_game';

update public.blundr_learning_events
set evidence_kind = 'system_observation'
where source = 'system'
  and evidence_kind = 'legacy_unclassified';

alter table public.blundr_learning_events
  drop constraint if exists blundr_learning_events_evidence_kind_check;
alter table public.blundr_learning_events
  add constraint blundr_learning_events_evidence_kind_check
  check (evidence_kind in (
    'legacy_unclassified', 'recall_attempt', 'imported_observation', 'system_observation'
  ));

alter table public.blundr_learning_events
  drop constraint if exists blundr_learning_events_exposure_id_check;
alter table public.blundr_learning_events
  add constraint blundr_learning_events_exposure_id_check
  check (exposure_id is null or char_length(btrim(exposure_id)) between 1 and 160);

alter table public.blundr_learning_events
  drop constraint if exists blundr_learning_events_played_move_uci_check;
alter table public.blundr_learning_events
  add constraint blundr_learning_events_played_move_uci_check
  check (played_move_uci is null or played_move_uci ~ '^[a-h][1-8][a-h][1-8][qrbn]?$');

alter table public.blundr_learning_events
  drop constraint if exists blundr_learning_events_imported_observation_check;
alter table public.blundr_learning_events
  add constraint blundr_learning_events_imported_observation_check
  check (
    source <> 'imported_game'
    or (evidence_kind = 'imported_observation' and first_attempt = false)
  );

alter table public.blundr_learning_events
  drop constraint if exists blundr_learning_events_recall_first_attempt_check;
alter table public.blundr_learning_events
  add constraint blundr_learning_events_recall_first_attempt_check
  check (
    first_attempt = false
    or (evidence_kind = 'recall_attempt' and exposure_id is not null)
    or evidence_kind = 'legacy_unclassified'
  );

-- Preserve compatibility with the existing server import writer while making
-- the source boundary authoritative. A caller cannot turn an imported game
-- into a first-attempt recall merely by omitting the new provenance fields.
create or replace function public.blundr_learning_events_normalize_observation_kind()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if new.source = 'imported_game' then
    new.evidence_kind := 'imported_observation';
    new.first_attempt := false;
    new.exposure_id := null;
  elsif new.source = 'system' and new.evidence_kind = 'legacy_unclassified' then
    new.evidence_kind := 'system_observation';
  end if;
  return new;
end;
$$;

drop trigger if exists blundr_learning_events_normalize_observation_kind
  on public.blundr_learning_events;
create trigger blundr_learning_events_normalize_observation_kind
before insert or update on public.blundr_learning_events
for each row execute function public.blundr_learning_events_normalize_observation_kind();

create unique index if not exists blundr_learning_events_first_recall_exposure_once
  on public.blundr_learning_events (user_id, exposure_id)
  where first_attempt = true
    and evidence_kind = 'recall_attempt'
    and exposure_id is not null;

create index if not exists blundr_learning_events_user_exposure_idx
  on public.blundr_learning_events (user_id, exposure_id, occurred_at desc)
  where exposure_id is not null;
create index if not exists blundr_learning_events_user_canonical_join_idx
  on public.blundr_learning_events (user_id, opening_id, move_order_key, occurred_at desc)
  where opening_id is not null and move_order_key is not null;

-- Keep the pre-existing legacy writer available during the compatibility
-- window, but it cannot claim first-attempt evidence or a v2 recall/observation
-- classification. PR-02 switches its one writer to the service-only projector
-- before this policy is removed in a later contract migration.
drop policy if exists blundr_learning_events_insert_own on public.blundr_learning_events;
create policy blundr_learning_events_insert_legacy_own
  on public.blundr_learning_events
  for insert
  with check (
    user_id = auth.uid()
    and evidence_kind = 'legacy_unclassified'
    and first_attempt = false
    and source not in ('imported_game', 'system')
  );

-- FSRS persistence is deliberately versioned but algorithm-agnostic. Existing
-- srs_state values remain legacy-unclassified until PR-02 can project them.
alter table public.blundr_review_states
  add column if not exists fsrs_algorithm_version text not null default 'legacy-unclassified',
  add column if not exists fsrs_state_version integer not null default 0,
  add column if not exists fsrs_desired_retention numeric,
  add column if not exists review_state_version integer not null default 1,
  add column if not exists last_recall_event_id text;

alter table public.blundr_review_states
  drop constraint if exists blundr_review_states_fsrs_state_version_check;
alter table public.blundr_review_states
  add constraint blundr_review_states_fsrs_state_version_check
  check (fsrs_state_version >= 0 and review_state_version >= 1);

alter table public.blundr_review_states
  drop constraint if exists blundr_review_states_fsrs_desired_retention_check;
alter table public.blundr_review_states
  add constraint blundr_review_states_fsrs_desired_retention_check
  check (fsrs_desired_retention is null or (fsrs_desired_retention > 0 and fsrs_desired_retention < 1));

create index if not exists blundr_review_states_due_v2_idx
  on public.blundr_review_states (user_id, due_at, review_state_version);

-- Mastery counters begin at an explicit legacy-unclassified state. No historic
-- attempt count is converted to recall evidence because that would conflate
-- imports and pre-exposure records with unaided recall.
alter table public.blundr_node_mastery
  add column if not exists mastery_state text not null default 'legacy_unclassified',
  add column if not exists mastery_state_version integer not null default 0,
  add column if not exists recall_attempt_count integer not null default 0,
  add column if not exists correct_recall_count integer not null default 0,
  add column if not exists lapse_count integer not null default 0,
  add column if not exists first_recall_attempt_at timestamptz,
  add column if not exists last_recall_event_id text,
  add column if not exists next_due_at timestamptz;

alter table public.blundr_node_mastery
  drop constraint if exists blundr_node_mastery_state_check;
alter table public.blundr_node_mastery
  add constraint blundr_node_mastery_state_check
  check (mastery_state in ('legacy_unclassified', 'unseen', 'learning', 'due', 'weak', 'mastered', 'unavailable'));

alter table public.blundr_node_mastery
  drop constraint if exists blundr_node_mastery_recall_counts_check;
alter table public.blundr_node_mastery
  add constraint blundr_node_mastery_recall_counts_check
  check (
    mastery_state_version >= 0
    and recall_attempt_count >= 0
    and correct_recall_count >= 0
    and lapse_count >= 0
    and correct_recall_count <= recall_attempt_count
    and lapse_count <= recall_attempt_count
  );

create index if not exists blundr_node_mastery_user_due_v2_idx
  on public.blundr_node_mastery (user_id, next_due_at, mastery_state)
  where next_due_at is not null;
create index if not exists blundr_node_mastery_user_canonical_join_v2_idx
  on public.blundr_node_mastery (user_id, opening_id, play_key, mastery_state_version)
  where opening_id is not null and play_key is not null;

-- Weaknesses get an explicit lifecycle without inferring historical resolution.
alter table public.blundr_weakness_projection
  add column if not exists lifecycle_state text not null default 'legacy_unclassified',
  add column if not exists lifecycle_version integer not null default 0,
  add column if not exists first_evidence_at timestamptz,
  add column if not exists last_evidence_at timestamptz,
  add column if not exists evidence_count integer not null default 0,
  add column if not exists lapse_count integer not null default 0,
  add column if not exists resolved_at timestamptz,
  add column if not exists last_recall_event_id text;

alter table public.blundr_weakness_projection
  drop constraint if exists blundr_weakness_projection_lifecycle_check;
alter table public.blundr_weakness_projection
  add constraint blundr_weakness_projection_lifecycle_check
  check (lifecycle_state in ('legacy_unclassified', 'active', 'remediating', 'resolved'));

alter table public.blundr_weakness_projection
  drop constraint if exists blundr_weakness_projection_lifecycle_counts_check;
alter table public.blundr_weakness_projection
  add constraint blundr_weakness_projection_lifecycle_counts_check
  check (lifecycle_version >= 0 and evidence_count >= 0 and lapse_count >= 0);

create index if not exists blundr_weakness_projection_active_v2_idx
  on public.blundr_weakness_projection (user_id, lifecycle_state, score desc, updated_at desc)
  where lifecycle_state in ('active', 'remediating');

-- Reservation identity is expanded in place. Legacy reservation timezone and
-- policy are intentionally NULL/legacy rather than guessed from local dates.
alter table public.blundr_daily_decks
  add column if not exists access_policy_id text not null default 'legacy-unclassified',
  add column if not exists access_policy_version text not null default 'legacy-unclassified',
  add column if not exists time_zone text,
  add column if not exists reservation_generation integer not null default 1,
  add column if not exists reservation_version integer not null default 1,
  add column if not exists reservation_state text not null default 'legacy_unclassified';

alter table public.blundr_daily_decks
  drop constraint if exists blundr_daily_decks_time_zone_check;
alter table public.blundr_daily_decks
  add constraint blundr_daily_decks_time_zone_check
  check (time_zone is null or public.blundr_is_valid_iana_time_zone(time_zone));

alter table public.blundr_daily_decks
  drop constraint if exists blundr_daily_decks_reservation_version_check;
alter table public.blundr_daily_decks
  add constraint blundr_daily_decks_reservation_version_check
  check (reservation_generation >= 1 and reservation_version >= 1);

alter table public.blundr_daily_decks
  drop constraint if exists blundr_daily_decks_reservation_state_check;
alter table public.blundr_daily_decks
  add constraint blundr_daily_decks_reservation_state_check
  check (reservation_state in ('legacy_unclassified', 'active', 'completed', 'superseded'));

create index if not exists blundr_daily_decks_reservation_lookup_v2_idx
  on public.blundr_daily_decks (
    user_id, local_date desc, access_policy_id, reservation_generation desc, reservation_version desc
  );

alter table public.blundr_daily_sessions
  add column if not exists reservation_generation integer not null default 1,
  add column if not exists session_contract_version text not null default 'legacy-unclassified',
  add column if not exists current_step_id text;

alter table public.blundr_daily_sessions
  drop constraint if exists blundr_daily_sessions_reservation_generation_check;
alter table public.blundr_daily_sessions
  add constraint blundr_daily_sessions_reservation_generation_check
  check (reservation_generation >= 1);

alter table public.blundr_daily_sessions
  drop constraint if exists blundr_daily_sessions_current_step_id_check;
alter table public.blundr_daily_sessions
  add constraint blundr_daily_sessions_current_step_id_check
  check (current_step_id is null or char_length(btrim(current_step_id)) between 1 and 160);

create index if not exists blundr_daily_sessions_user_reservation_v2_idx
  on public.blundr_daily_sessions (user_id, session_id, reservation_generation, state_version desc);

alter table public.blundr_daily_attempts
  add column if not exists action_id text,
  add column if not exists step_id text,
  add column if not exists reservation_generation integer not null default 1,
  add column if not exists session_state_version integer not null default 1,
  add column if not exists learning_exposure_id text;

alter table public.blundr_daily_attempts
  drop constraint if exists blundr_daily_attempts_action_id_check;
alter table public.blundr_daily_attempts
  add constraint blundr_daily_attempts_action_id_check
  check (action_id is null or char_length(btrim(action_id)) between 1 and 160);

alter table public.blundr_daily_attempts
  drop constraint if exists blundr_daily_attempts_step_id_check;
alter table public.blundr_daily_attempts
  add constraint blundr_daily_attempts_step_id_check
  check (step_id is null or char_length(btrim(step_id)) between 1 and 160);

alter table public.blundr_daily_attempts
  drop constraint if exists blundr_daily_attempts_action_version_check;
alter table public.blundr_daily_attempts
  add constraint blundr_daily_attempts_action_version_check
  check (reservation_generation >= 1 and session_state_version >= 1);

create unique index if not exists blundr_daily_attempts_action_once_v2
  on public.blundr_daily_attempts (user_id, session_id, action_id)
  where action_id is not null;
create unique index if not exists blundr_daily_attempts_step_first_attempt_once_v2
  on public.blundr_daily_attempts (user_id, session_id, step_id)
  where first_attempt = true and step_id is not null;
create index if not exists blundr_daily_attempts_session_step_v2_idx
  on public.blundr_daily_attempts (user_id, session_id, step_id, created_at desc)
  where step_id is not null;

-- The report is an immutable migration-time accounting record, not a repair
-- queue. It proves exactly what was classified and leaves uncertain mappings
-- available for a later, authenticated reconciliation process. Reapplying this
-- migration never mutates an existing report row; any later reconciliation
-- report must use a new migration/report version.
create table if not exists public.blundr_learning_daily_backfill_reports (
  migration_id text not null,
  domain text not null,
  resolved_count bigint not null,
  unresolved_count bigint not null,
  details jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now(),
  primary key (migration_id, domain),
  constraint blundr_learning_daily_backfill_reports_counts_check
    check (resolved_count >= 0 and unresolved_count >= 0)
);

alter table public.blundr_learning_daily_backfill_reports enable row level security;
revoke all on public.blundr_learning_daily_backfill_reports from public, anon, authenticated;

create or replace function public.blundr_learning_daily_backfill_reports_reject_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'blundr_learning_daily_backfill_reports rows are immutable'
    using errcode = '55000';
end;
$$;

create trigger blundr_learning_daily_backfill_reports_immutable
before update or delete on public.blundr_learning_daily_backfill_reports
for each row execute function public.blundr_learning_daily_backfill_reports_reject_mutation();

revoke all on function public.blundr_learning_daily_backfill_reports_reject_mutation()
  from public, anon, authenticated;

insert into public.blundr_learning_daily_backfill_reports (
  migration_id, domain, resolved_count, unresolved_count, details
)
select
  '20260805120000_blundr_learning_daily_authority_v2',
  'learning_imported_observations',
  count(*) filter (where source = 'imported_game'),
  0,
  jsonb_build_object('rule', 'source=imported_game -> imported_observation; first_attempt=false')
from public.blundr_learning_events
on conflict (migration_id, domain) do nothing;

insert into public.blundr_learning_daily_backfill_reports (
  migration_id, domain, resolved_count, unresolved_count, details
)
select
  '20260805120000_blundr_learning_daily_authority_v2',
  'learning_canonical_coordinates',
  count(*) filter (where opening_id is not null and move_order_key is not null),
  count(*) filter (where opening_id is null or move_order_key is null),
  jsonb_build_object('rule', 'only pre-existing canonical coordinates counted; no coordinate inferred')
from public.blundr_learning_events
on conflict (migration_id, domain) do nothing;

insert into public.blundr_learning_daily_backfill_reports (
  migration_id, domain, resolved_count, unresolved_count, details
)
select
  '20260805120000_blundr_learning_daily_authority_v2',
  'user_iana_time_zones',
  count(*) filter (where time_zone is not null),
  count(*) filter (where time_zone is null),
  jsonb_build_object('rule', 'legacy profiles remain unresolved until a validated IANA timezone is supplied')
from public.blundr_user_profiles
on conflict (migration_id, domain) do nothing;

insert into public.blundr_learning_daily_backfill_reports (
  migration_id, domain, resolved_count, unresolved_count, details
)
select
  '20260805120000_blundr_learning_daily_authority_v2',
  'daily_reservation_identity',
  count(*) filter (
    where composer_version <> 'legacy-composer'
      and runtime_package_id <> 'legacy-runtime'
      and profile_version <> 'legacy-profile'
  ),
  count(*) filter (
    where composer_version = 'legacy-composer'
      or runtime_package_id = 'legacy-runtime'
      or profile_version = 'legacy-profile'
  ),
  jsonb_build_object('rule', 'legacy reservations retain their stored identity; policy/timezone are not inferred')
from public.blundr_daily_decks
on conflict (migration_id, domain) do nothing;

-- These are deliberately non-mutating authority shells. PR-02 replaces their
-- bodies with the single atomic projector/reservation/action transactions after
-- the TypeScript FSRS and Daily contracts are approved. They fail closed now so
-- no caller can mistake a scaffold for a successful persistence operation.
create or replace function public.blundr_project_learning_evidence_v2(
  p_user_id uuid,
  p_event jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_user_id is null or p_event is null then
    raise exception using
      errcode = '22023',
      message = 'invalid_learning_projection_request';
  end if;

  raise exception using
    errcode = '0A000',
    message = 'learning_projection_authority_not_implemented',
    detail = 'PR-02 must install the versioned TypeScript-owned FSRS projection contract.';
end;
$$;

create or replace function public.blundr_reserve_daily_v2(
  p_user_id uuid,
  p_local_date date,
  p_reservation jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_user_id is null or p_local_date is null or p_reservation is null then
    raise exception using
      errcode = '22023',
      message = 'invalid_daily_reservation_request';
  end if;

  raise exception using
    errcode = '0A000',
    message = 'daily_reservation_authority_not_implemented',
    detail = 'PR-02 must install the one-winner reservation transaction.';
end;
$$;

create or replace function public.blundr_commit_daily_action_v2(
  p_user_id uuid,
  p_session_id text,
  p_action jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_user_id is null or p_session_id is null or p_action is null then
    raise exception using
      errcode = '22023',
      message = 'invalid_daily_action_request';
  end if;

  raise exception using
    errcode = '0A000',
    message = 'daily_action_authority_not_implemented',
    detail = 'PR-02 must install the idempotent action and projection transaction.';
end;
$$;

revoke all on function public.blundr_project_learning_evidence_v2(uuid, jsonb)
  from public, anon, authenticated;
revoke all on function public.blundr_reserve_daily_v2(uuid, date, jsonb)
  from public, anon, authenticated;
revoke all on function public.blundr_commit_daily_action_v2(uuid, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.blundr_project_learning_evidence_v2(uuid, jsonb)
  to service_role;
grant execute on function public.blundr_reserve_daily_v2(uuid, date, jsonb)
  to service_role;
grant execute on function public.blundr_commit_daily_action_v2(uuid, text, jsonb)
  to service_role;

commit;
