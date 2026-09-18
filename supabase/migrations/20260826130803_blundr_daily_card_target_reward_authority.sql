-- Pin the Daily Blundr ring target to the verified reserved deck completion.
-- The user-facing Daily card goal controls deck reservation. Once the reserved
-- deck completes, the existing reward writer receives one server-owned
-- `daily_blundr_deck_completed` evidence row, so the ring target for that local
-- day must be one deck-completion event, not the obsolete profile
-- `daily_blundr_goal` field.

create or replace function public.blundr_prepare_daily_blundr_reward_target_v1(
  p_user_id uuid,
  p_session_id text
) returns void
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_profile public.blundr_user_profiles%rowtype;
  v_local_date date;
begin
  if p_user_id is null or nullif(btrim(coalesce(p_session_id, '')), '') is null then
    raise exception 'invalid_daily_blundr_reward_target';
  end if;

  select d.local_date into v_local_date
  from public.blundr_daily_sessions s
  join public.blundr_daily_decks d
    on d.deck_id = s.deck_id
   and d.user_id = s.user_id
  where s.user_id = p_user_id
    and s.session_id = p_session_id
    and s.completed_at is not null
    and coalesce(s.state->>'status', '') = 'completed';

  if not found then
    raise exception 'completion_evidence_unverified';
  end if;

  select * into v_profile
  from public.blundr_user_profiles
  where user_id = p_user_id;

  if not found then
    raise exception 'account_not_ready';
  end if;

  insert into public.blundr_daily_retention_progress(
    user_id,
    local_date,
    daily_tempo_goal,
    daily_battery_goal,
    daily_blundr_goal,
    updated_at
  )
  values (
    p_user_id,
    v_local_date,
    greatest(1, v_profile.daily_tempo_goal),
    greatest(1, v_profile.daily_battery_goal),
    1,
    now()
  )
  on conflict(user_id, local_date) do update
    set daily_blundr_goal = 1,
        updated_at = public.blundr_daily_retention_progress.updated_at;
end;
$$;

revoke all on function public.blundr_prepare_daily_blundr_reward_target_v1(
  uuid,
  text
) from public, anon, authenticated;

grant execute on function public.blundr_prepare_daily_blundr_reward_target_v1(
  uuid,
  text
) to service_role;
