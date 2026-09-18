-- Free Tempo is limited by the authoritative Trainer completion transition,
-- not by downstream reward or XP projections.
begin;

create or replace function public.blundr_enforce_free_tempo_completion_limit_v1()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_billing_environment text := coalesce(
    nullif(current_setting('app.blundr_billing_environment', true), ''),
    'test'
  );
  v_is_pro boolean;
  v_completed_count integer;
  v_time_zone text;
begin
  if old.state <> 'active' or new.state <> 'completed' then
    return new;
  end if;

  if v_billing_environment not in ('test', 'live') then
    raise exception 'invalid_billing_environment';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text, 403));

  select exists (
    select 1
    from public.blundr_trusted_entitlements
    where user_id = new.user_id
      and billing_environment = v_billing_environment
      and entitlement_identifier = 'pro'
      and active
      and (expires_at is null or expires_at > now())
  ) into v_is_pro;

  if v_is_pro then
    return new;
  end if;

  select time_zone into v_time_zone
  from public.blundr_user_profiles
  where user_id = new.user_id;
  if not found or v_time_zone is null
    or not public.blundr_is_valid_iana_time_zone(v_time_zone) then
    raise exception 'completion_time_zone_unavailable';
  end if;

  select count(*) into v_completed_count
  from public.blundr_trainer_sessions_v2 s
  join public.blundr_user_profiles p on p.user_id = s.user_id
  where s.user_id = new.user_id
    and s.state = 'completed'
    and s.terminal_completion_id is not null
    and s.completed_at is not null
    and (s.completed_at at time zone v_time_zone)::date =
      (new.completed_at at time zone v_time_zone)::date;

  if v_completed_count >= 20 then
    raise exception 'free_tempo_daily_limit_reached';
  end if;

  return new;
end;
$$;

drop trigger if exists blundr_free_tempo_completion_limit_v1
  on public.blundr_trainer_sessions_v2;
create trigger blundr_free_tempo_completion_limit_v1
before update on public.blundr_trainer_sessions_v2
for each row execute function public.blundr_enforce_free_tempo_completion_limit_v1();

drop trigger if exists blundr_free_tempo_daily_limit_v1
  on public.blundr_xp_events;
drop function if exists public.blundr_enforce_free_tempo_daily_limit_v1();

alter function public.blundr_apply_completion_reward_v3(
  uuid, text, text, text, text, text, text
) rename to blundr_apply_completion_reward_v3_core;

create or replace function public.blundr_ensure_all_rings_presentation_v1(
  p_user_id uuid,
  p_result jsonb,
  p_policy_version text
) returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_transaction_id uuid := nullif(p_result->>'transactionId', '')::uuid;
  v_local_date text := nullif(p_result->>'localDate', '');
begin
  if p_user_id is null or p_result is null or p_policy_version is null
    or v_transaction_id is null
    or coalesce((p_result->>'allRingsClosedThisAction')::boolean, false) = false then
    return p_result;
  end if;

  if not exists (
    select 1
    from public.blundr_reward_presentations_v2
    where transaction_id = v_transaction_id
      and user_id = p_user_id
  ) then
    insert into public.blundr_reward_presentations_v2(
      transaction_id, user_id, presentation_key, presentation_kind,
      priority, envelope, policy_version
    ) values (
      v_transaction_id,
      p_user_id,
      'completion:all-rings:' || coalesce(v_local_date, v_transaction_id::text),
      'toast',
      70,
      jsonb_build_object(
        'transactionId', v_transaction_id,
        'allRingsClosed', true,
        'localDate', v_local_date,
        'quantity', coalesce((p_result->>'repertoirePointsAwarded')::integer, 0),
        'randomEvaluation', coalesce(p_result->>'randomEvaluation', 'unavailable')
      ),
      p_policy_version
    ) on conflict do nothing;
  end if;

  return p_result;
end;
$$;

create or replace function public.blundr_apply_completion_reward_v3(
  p_user_id uuid, p_completion_id text, p_source text, p_evidence_id text,
  p_idempotency_key text, p_policy_version text,
  p_randomness_key_version text default null
) returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_result jsonb;
begin
  v_result := public.blundr_apply_completion_reward_v3_core(
    p_user_id, p_completion_id, p_source, p_evidence_id,
    p_idempotency_key, p_policy_version, p_randomness_key_version
  );
  return public.blundr_ensure_all_rings_presentation_v1(
    p_user_id, v_result, p_policy_version
  );
end;
$$;

create or replace function public.blundr_apply_reward_transaction_v2(
  p_user_id uuid, p_completion_id text, p_source text, p_evidence_id text,
  p_idempotency_key text, p_policy_version text,
  p_randomness_key_version text default null
) returns jsonb
language sql
security definer
set search_path = public, extensions, pg_temp
as $$
  select public.blundr_apply_completion_reward_v3(
    p_user_id, p_completion_id, p_source, p_evidence_id,
    p_idempotency_key, p_policy_version, p_randomness_key_version
  );
$$;

create or replace function public.blundr_commit_trainer_action_v2(
  p_user_id uuid, p_session_id text, p_action jsonb,
  p_billing_environment text
) returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
begin
  if p_billing_environment not in ('test', 'live') then
    raise exception 'invalid_billing_environment';
  end if;
  perform set_config('app.blundr_billing_environment', p_billing_environment, true);
  return public.blundr_commit_trainer_action_v2(
    p_user_id, p_session_id, p_action
  );
end;
$$;

create or replace function public.blundr_apply_completion_reward_v3(
  p_user_id uuid, p_completion_id text, p_source text, p_evidence_id text,
  p_idempotency_key text, p_policy_version text,
  p_randomness_key_version text,
  p_billing_environment text
) returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
begin
  if p_billing_environment not in ('test', 'live') then
    raise exception 'invalid_billing_environment';
  end if;
  perform set_config('app.blundr_billing_environment', p_billing_environment, true);
  return public.blundr_apply_completion_reward_v3(
    p_user_id, p_completion_id, p_source, p_evidence_id,
    p_idempotency_key, p_policy_version, p_randomness_key_version
  );
end;
$$;

revoke all on function public.blundr_enforce_free_tempo_completion_limit_v1()
  from public, anon, authenticated, service_role;
revoke all on function public.blundr_ensure_all_rings_presentation_v1(
  uuid, jsonb, text
) from public, anon, authenticated, service_role;
revoke all on function public.blundr_apply_completion_reward_v3(
  uuid, text, text, text, text, text, text
) from public, anon, authenticated, service_role;
grant execute on function public.blundr_apply_completion_reward_v3(
  uuid, text, text, text, text, text, text
) to service_role;
revoke all on function public.blundr_commit_trainer_action_v2(
  uuid, text, jsonb, text
) from public, anon, authenticated, service_role;
revoke all on function public.blundr_apply_completion_reward_v3(
  uuid, text, text, text, text, text, text, text
) from public, anon, authenticated, service_role;
grant execute on function public.blundr_apply_completion_reward_v3(
  uuid, text, text, text, text, text, text, text
) to service_role;
grant execute on function public.blundr_commit_trainer_action_v2(
  uuid, text, jsonb, text
) to service_role;

commit;
