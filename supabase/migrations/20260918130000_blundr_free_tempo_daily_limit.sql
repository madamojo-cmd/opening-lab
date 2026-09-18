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

create or replace function public.blundr_commit_trainer_action_v2(
  p_user_id uuid, p_session_id text, p_action jsonb,
  p_billing_environment text default 'test'
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
  p_randomness_key_version text default null,
  p_billing_environment text default 'test'
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
