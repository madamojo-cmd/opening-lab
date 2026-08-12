-- Checkpoint B: durable continuation evidence and one hydrated completion writer.
-- The browser supplies a short move path, but the application service derives
-- the terminal board from the immutable Trainer runtime line and validates each
-- move before this service-only RPC can persist evidence.
begin;

create table public.blundr_continuation_completions_v1 (
  completion_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  trainer_session_id text not null,
  terminal_completion_id text not null,
  opening_id text not null,
  path_uci text[] not null,
  terminal_fen text not null,
  completed_fen text not null,
  request_fingerprint text not null,
  completed_at timestamptz not null default now(),
  constraint blundr_continuation_completions_v1_session_owner_fk
    foreign key (trainer_session_id, user_id)
    references public.blundr_trainer_sessions_v2(session_id, user_id)
    on delete cascade,
  constraint blundr_continuation_completions_v1_session_unique
    unique (user_id, trainer_session_id),
  constraint blundr_continuation_completions_v1_identity_check check (
    char_length(btrim(completion_id)) between 1 and 240
    and char_length(btrim(trainer_session_id)) between 1 and 240
    and char_length(btrim(terminal_completion_id)) between 1 and 240
    and char_length(btrim(opening_id)) between 1 and 160
    and cardinality(path_uci) between 1 and 2
    and char_length(btrim(terminal_fen)) between 1 and 160
    and char_length(btrim(completed_fen)) between 1 and 160
    and char_length(request_fingerprint) = 64
  )
);

create index blundr_continuation_completions_v1_session_owner_idx
  on public.blundr_continuation_completions_v1(trainer_session_id, user_id);
create index blundr_continuation_completions_v1_user_completed_idx
  on public.blundr_continuation_completions_v1(user_id, completed_at desc);

alter table public.blundr_continuation_completions_v1 enable row level security;
revoke all on public.blundr_continuation_completions_v1
  from public, anon, authenticated;

create or replace function public.blundr_commit_continuation_completion_v1(
  p_user_id uuid,
  p_completion jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_completion_id text := nullif(btrim(p_completion->>'completion_id'), '');
  v_trainer_session_id text := nullif(btrim(p_completion->>'trainer_session_id'), '');
  v_terminal_completion_id text := nullif(btrim(p_completion->>'terminal_completion_id'), '');
  v_opening_id text := nullif(btrim(p_completion->>'opening_id'), '');
  v_terminal_fen text := nullif(btrim(p_completion->>'terminal_fen'), '');
  v_completed_fen text := nullif(btrim(p_completion->>'completed_fen'), '');
  v_request_fingerprint text := nullif(btrim(p_completion->>'request_fingerprint'), '');
  v_path_uci text[];
  v_identity_material text;
  v_expected_completion_id text;
  v_expected_fingerprint text;
  v_session public.blundr_trainer_sessions_v2%rowtype;
  v_existing public.blundr_continuation_completions_v1%rowtype;
  v_inserted boolean := false;
begin
  if p_user_id is null
    or jsonb_typeof(p_completion) is distinct from 'object'
    or jsonb_typeof(p_completion->'path_uci') is distinct from 'array'
    or v_completion_id is null
    or v_trainer_session_id is null
    or v_terminal_completion_id is null
    or v_opening_id is null
    or v_terminal_fen is null
    or v_completed_fen is null
    or v_request_fingerprint is null then
    raise exception using errcode='22023', message='continuation_completion_invalid';
  end if;
  select coalesce(array_agg(value order by ordinal), '{}')
    into v_path_uci
  from jsonb_array_elements_text(p_completion->'path_uci')
    with ordinality as path(value, ordinal);
  if cardinality(v_path_uci) not between 1 and 2
    or exists (
      select 1 from unnest(v_path_uci) as move(uci)
      where uci !~ '^[a-h][1-8][a-h][1-8][qrbn]?$'
    ) then
    raise exception using errcode='22023', message='continuation_path_invalid';
  end if;

  select * into v_session
  from public.blundr_trainer_sessions_v2
  where session_id=v_trainer_session_id and user_id=p_user_id
  for update;
  if not found
    or v_session.state <> 'completed'
    or v_session.current_cursor <> v_session.line_length
    or v_session.terminal_completion_id is distinct from v_terminal_completion_id
    or v_session.opening_id is distinct from v_opening_id
    or v_session.completed_at is null then
    raise exception using errcode='42501', message='continuation_trainer_terminal_unverified';
  end if;

  v_identity_material := p_user_id::text || ':' || v_trainer_session_id || ':'
    || v_terminal_completion_id || ':' || array_to_string(v_path_uci, ',');
  v_expected_completion_id := 'continuation-completion:'
    || encode(digest(v_identity_material, 'sha256'), 'hex');
  v_expected_fingerprint := encode(digest(
    v_identity_material || ':' || v_opening_id || ':' || v_terminal_fen || ':' || v_completed_fen,
    'sha256'
  ), 'hex');
  if v_completion_id is distinct from v_expected_completion_id
    or v_request_fingerprint is distinct from v_expected_fingerprint then
    raise exception using errcode='22023', message='continuation_completion_identity_mismatch';
  end if;

  insert into public.blundr_continuation_completions_v1(
    completion_id,user_id,trainer_session_id,terminal_completion_id,opening_id,
    path_uci,terminal_fen,completed_fen,request_fingerprint
  ) values (
    v_completion_id,p_user_id,v_trainer_session_id,v_terminal_completion_id,v_opening_id,
    v_path_uci,v_terminal_fen,v_completed_fen,v_request_fingerprint
  ) on conflict do nothing returning true into v_inserted;

  select * into v_existing
  from public.blundr_continuation_completions_v1
  where user_id=p_user_id and trainer_session_id=v_trainer_session_id;
  if not found then
    raise exception using errcode='23505', message='continuation_completion_conflict';
  end if;
  if v_existing.completion_id is distinct from v_completion_id
    or v_existing.terminal_completion_id is distinct from v_terminal_completion_id
    or v_existing.opening_id is distinct from v_opening_id
    or v_existing.path_uci is distinct from v_path_uci
    or v_existing.terminal_fen is distinct from v_terminal_fen
    or v_existing.completed_fen is distinct from v_completed_fen
    or v_existing.request_fingerprint is distinct from v_request_fingerprint then
    raise exception using errcode='23505', message='continuation_completion_idempotency_conflict';
  end if;
  return jsonb_build_object(
    'status', case when v_inserted then 'inserted' else 'duplicate' end,
    'evidenceId', v_existing.completion_id,
    'trainerSessionId', v_existing.trainer_session_id
  );
end;
$$;

-- Extend the accepted Rewards v2 evidence branch in place. The ancestry lock
-- stops the migration if an unexpected function body is present.
do $continuation_reward_extension$
declare
  v_definition text;
  v_before text := $old$
  -- Daily and Restricted Trainer are the only currently verifiable sources.
  if p_source = 'daily_blundr_deck_completed' then
    select s.session_id,d.local_date into v_evidence_identity,v_local_date
    from public.blundr_daily_sessions s join public.blundr_daily_decks d on d.deck_id=s.deck_id and d.user_id=s.user_id
    where s.user_id=p_user_id and s.session_id=p_evidence_id and s.completed_at is not null and coalesce(s.state->>'status','')='completed';
    if not found then
      raise exception 'completion_evidence_unverified';
    end if;
  elsif p_source = 'opening_run_completed' then
    select s.terminal_completion_id,s.completed_at into v_evidence_identity,v_evidence_occurred_at
    from public.blundr_trainer_sessions_v2 s
    where s.user_id=p_user_id and s.state='completed'
      and s.terminal_completion_id=p_evidence_id and s.completed_at is not null
      and s.current_cursor=s.line_length;
    if not found then
      raise exception 'completion_evidence_unverified';
    end if;
  else
    raise exception 'completion_evidence_unverified';
  end if;
$old$;
  v_after text := $new$
  -- Daily, Restricted Trainer, and validated continuation completions are the
  -- only accepted ring evidence sources.
  if p_source = 'daily_blundr_deck_completed' then
    select s.session_id,d.local_date into v_evidence_identity,v_local_date
    from public.blundr_daily_sessions s join public.blundr_daily_decks d on d.deck_id=s.deck_id and d.user_id=s.user_id
    where s.user_id=p_user_id and s.session_id=p_evidence_id and s.completed_at is not null and coalesce(s.state->>'status','')='completed';
    if not found then
      raise exception 'completion_evidence_unverified';
    end if;
  elsif p_source = 'opening_run_completed' then
    select s.terminal_completion_id,s.completed_at into v_evidence_identity,v_evidence_occurred_at
    from public.blundr_trainer_sessions_v2 s
    where s.user_id=p_user_id and s.state='completed'
      and s.terminal_completion_id=p_evidence_id and s.completed_at is not null
      and s.current_cursor=s.line_length;
    if not found then
      raise exception 'completion_evidence_unverified';
    end if;
  elsif p_source = 'continuation_completed' then
    select c.completion_id,c.completed_at into v_evidence_identity,v_evidence_occurred_at
    from public.blundr_continuation_completions_v1 c
    where c.user_id=p_user_id and c.completion_id=p_evidence_id;
    if not found then
      raise exception 'completion_evidence_unverified';
    end if;
  else
    raise exception 'completion_evidence_unverified';
  end if;
$new$;
begin
  select pg_get_functiondef(
    'public.blundr_apply_reward_transaction_v2(uuid,text,text,text,text,text,text)'::regprocedure
  ) into v_definition;
  if v_definition is null
    or length(v_definition)-length(replace(v_definition,v_before,'')) <> length(v_before) then
    raise exception using errcode='55000', message='reward_v2_checkpoint_b_definition_mismatch';
  end if;
  v_definition := replace(v_definition,v_before,v_after);
  execute v_definition;
  select pg_get_functiondef(
    'public.blundr_apply_reward_transaction_v2(uuid,text,text,text,text,text,text)'::regprocedure
  ) into v_definition;
  if position('public.blundr_continuation_completions_v1' in v_definition)=0 then
    raise exception using errcode='55000', message='continuation_reward_extension_verification_failed';
  end if;
end;
$continuation_reward_extension$;

-- Preserve the shipped v2 RPC as a compatibility entry point without leaving
-- a second mutation path. The original implementation becomes an internal
-- core; both public service-role entry points hydrate the same v3 projection.
alter function public.blundr_apply_reward_transaction_v2(
  uuid,text,text,text,text,text,text
) rename to blundr_apply_reward_transaction_v2_core;

-- Public application code calls only this hydrated writer. It invokes the
-- internal reward transaction in the same database transaction, then records the
-- compatibility completion projection and returns the authoritative snapshot
-- consumed by Home, Progress, and completion presentation.
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
  v_raw jsonb;
  v_tx public.blundr_reward_transactions_v2%rowtype;
  v_day public.blundr_daily_retention_progress%rowtype;
  v_streak public.blundr_streak_records%rowtype;
  v_xp_event public.blundr_xp_events%rowtype;
  v_existing public.blundr_completion_grants%rowtype;
  v_base_points integer := 0;
  v_reward_points integer := 0;
  v_lifetime_points integer := 0;
  v_spent_points integer := 0;
  v_available_points integer := 0;
  v_opening_id text;
  v_duplicate boolean := false;
  v_ring_closed_this_action boolean := false;
  v_all_closed_this_action boolean := false;
  v_reward_grants jsonb := '[]'::jsonb;
  v_result jsonb;
  v_inserted boolean := false;
begin
  v_raw := public.blundr_apply_reward_transaction_v2_core(
    p_user_id,p_completion_id,p_source,p_evidence_id,p_idempotency_key,
    p_policy_version,p_randomness_key_version
  );
  if jsonb_typeof(v_raw->'dayRecord') = 'object' then
    return jsonb_set(v_raw,'{duplicate}','true'::jsonb,true);
  end if;
  if nullif(v_raw->>'transactionId','') is null then
    raise exception using errcode='55000', message='reward_transaction_projection_unavailable';
  end if;
  select * into v_tx
  from public.blundr_reward_transactions_v2
  where id=(v_raw->>'transactionId')::uuid and user_id=p_user_id;
  if not found or v_tx.source is distinct from p_source then
    raise exception using errcode='55000', message='reward_transaction_projection_unavailable';
  end if;
  v_duplicate := coalesce((v_raw->>'duplicate')::boolean,false);
  select * into v_xp_event
  from public.blundr_xp_events
  where user_id=p_user_id and completion_id=v_tx.completion_id;
  if not found then
    raise exception using errcode='55000', message='reward_xp_projection_unavailable';
  end if;
  select * into v_day
  from public.blundr_daily_retention_progress
  where user_id=p_user_id and local_date=v_xp_event.local_date;
  if not found then
    raise exception using errcode='55000', message='reward_daily_projection_unavailable';
  end if;
  select * into v_streak from public.blundr_streak_records where user_id=p_user_id;
  if not found then
    raise exception using errcode='55000', message='reward_streak_projection_unavailable';
  end if;

  select coalesce(sum(points),0) into v_base_points
  from public.blundr_repertoire_point_events
  where user_id=p_user_id and id='reward-v2:' || v_tx.id::text;
  select coalesce(sum(points),0) into v_reward_points
  from public.blundr_repertoire_point_events
  where user_id=p_user_id and source='reward_bonus'
    and daily_session_id=p_evidence_id and id like 'reward-v2-bonus:%';
  select coalesce(sum(points),0) into v_lifetime_points
  from public.blundr_repertoire_point_events where user_id=p_user_id;
  select coalesce(sum(points_spent),0) into v_spent_points
  from public.blundr_repertoire_unlock_events where user_id=p_user_id;
  select opening_unlock_points into v_available_points
  from public.blundr_user_repertoires where user_id=p_user_id;

  if p_source='opening_run_completed' then
    select opening_id into v_opening_id
    from public.blundr_trainer_sessions_v2
    where user_id=p_user_id and terminal_completion_id=p_evidence_id;
  elsif p_source='continuation_completed' then
    select opening_id into v_opening_id
    from public.blundr_continuation_completions_v1
    where user_id=p_user_id and completion_id=p_evidence_id;
  end if;

  v_ring_closed_this_action := not v_duplicate and case p_source
    when 'opening_run_completed' then v_day.daily_tempo_progress=v_day.daily_tempo_goal
    when 'continuation_completed' then v_day.daily_battery_progress=v_day.daily_battery_goal
    else v_day.daily_blundr_progress=v_day.daily_blundr_goal
  end;
  v_all_closed_this_action := not v_duplicate
    and v_day.all_rings_closed and v_ring_closed_this_action;
  select coalesce(jsonb_agg(
    reward.value || jsonb_build_object(
      'trigger',coalesce(roll.trigger,case p_source
        when 'opening_run_completed' then 'daily_tempo_ring_closed'
        when 'continuation_completed' then 'daily_battery_ring_closed'
        else 'daily_blundr_ring_closed' end),
      'triggerEventId',reward.value->>'rewardRollId',
      'displayName',initcap(replace(reward.value->>'rarity','_',' ')) || ' '
        || initcap(replace(reward.value->>'rewardType','_',' ')),
      'description',case reward.value->>'rewardType'
        when 'unlock_points' then 'Repertoire unlock points were applied.'
        when 'opening_fragment' then 'An opening fragment was added to your reward inventory.'
        when 'choice_token' then 'A choice token was added to your reward inventory.'
        else 'A Tempo Cache reward was applied.' end,
      'pointsApplied',case when reward.value->>'rewardType'='unlock_points'
        then coalesce((reward.value->>'amount')::integer,0) else 0 end,
      'applied',true,
      'pendingChoice',false
    ) order by reward.ordinal
  ),'[]'::jsonb) into v_reward_grants
  from jsonb_array_elements(coalesce(v_raw->'rewardGrants','[]'::jsonb))
    with ordinality as reward(value,ordinal)
  left join public.blundr_reward_rolls roll
    on roll.id=reward.value->>'rewardRollId' and roll.user_id=p_user_id;

  v_result := jsonb_build_object(
    'duplicate',v_duplicate,
    'transactionId',v_tx.id,
    'completionId',v_tx.completion_id,
    'source',p_source,
    'localDate',v_xp_event.local_date,
    'ringClosedThisAction',v_ring_closed_this_action,
    'allRingsClosedThisAction',v_all_closed_this_action,
    'repertoirePointsAwarded',v_base_points+v_reward_points,
    'rewardPointsAwarded',v_reward_points,
    'xpAwarded',v_xp_event.xp,
    'rewardGrants',v_reward_grants,
    'rewardHistory',(
      select jsonb_build_object(
        'userId',h.user_id,
        'allRingsDaysSinceRandomReward',h.all_rings_days_since_random_reward,
        'randomBonusPityCounter',h.random_bonus_pity_counter,
        'lastRandomRewardLocalDate',h.last_random_reward_local_date,
        'lastRandomBonusAt',h.last_random_bonus_at,
        'lastPityGuaranteeLocalDate',h.last_pity_guarantee_local_date,
        'appliedRewardIds',to_jsonb(h.applied_reward_ids),
        'updatedAt',h.updated_at
      ) from public.blundr_reward_history h where h.user_id=p_user_id
    ),
    'tempoCacheState',coalesce(v_raw->>'tempoCacheState','closed'),
    'randomEvaluation',coalesce(v_raw->>'randomEvaluation','unavailable'),
    'availablePoints',coalesce(v_available_points,0),
    'lifetimePoints',v_lifetime_points,
    'spentPoints',v_spent_points,
    'dayRecord',jsonb_build_object(
      'userId',p_user_id,
      'localDate',v_day.local_date,
      'dailyTempo',jsonb_build_object('ringId','daily_tempo','progress',v_day.daily_tempo_progress,'goal',v_day.daily_tempo_goal,'closed',v_day.daily_tempo_completed,'closedAt',v_day.daily_tempo_completed_at),
      'dailyBattery',jsonb_build_object('ringId','daily_battery','progress',v_day.daily_battery_progress,'goal',v_day.daily_battery_goal,'closed',v_day.daily_battery_completed,'closedAt',v_day.daily_battery_completed_at),
      'dailyBlundr',jsonb_build_object('ringId','daily_blundr','progress',v_day.daily_blundr_progress,'goal',v_day.daily_blundr_goal,'closed',v_day.daily_blundr_completed,'closedAt',v_day.daily_blundr_completed_at),
      'allRingsClosed',v_day.all_rings_closed,
      'allRingsClosedAt',v_day.all_rings_closed_at,
      'xpEarnedToday',v_day.xp_earned,
      'repertoirePointsEarnedToday',v_day.opening_points_earned,
      'activityEventIds',to_jsonb(v_day.activity_event_ids),
      'createdAt',v_xp_event.created_at,
      'updatedAt',v_day.updated_at
    ),
    'streakRecord',jsonb_build_object(
      'userId',p_user_id,
      'currentStreakDays',v_streak.current_streak,
      'longestStreakDays',v_streak.longest_streak,
      'totalAllRingsClosedDays',v_streak.total_all_rings_closed_days,
      'lastCompletedLocalDate',v_streak.last_completed_local_date,
      'updatedAt',v_streak.updated_at
    )
  );

  insert into public.blundr_completion_grants(
    user_id,completion_id,source,local_date,evidence_id,opening_id,
    repertoire_points,reward_points,xp,result_json,created_at
  ) values (
    p_user_id,v_tx.completion_id,p_source,v_xp_event.local_date,p_evidence_id,v_opening_id,
    v_base_points+v_reward_points,v_reward_points,v_xp_event.xp,v_result,v_xp_event.created_at
  ) on conflict do nothing returning true into v_inserted;
  if not coalesce(v_inserted,false) then
    select * into v_existing from public.blundr_completion_grants
    where user_id=p_user_id and completion_id=v_tx.completion_id;
    if not found or v_existing.source is distinct from p_source
      or v_existing.evidence_id is distinct from p_evidence_id then
      raise exception using errcode='23505', message='completion_projection_idempotency_conflict';
    end if;
    return jsonb_set(v_existing.result_json,'{duplicate}','true'::jsonb,true);
  end if;
  return v_result;
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
    p_user_id,p_completion_id,p_source,p_evidence_id,p_idempotency_key,
    p_policy_version,p_randomness_key_version
  );
$$;

revoke all on function public.blundr_commit_continuation_completion_v1(uuid,jsonb),
  public.blundr_apply_completion_reward_v3(uuid,text,text,text,text,text,text),
  public.blundr_apply_reward_transaction_v2(uuid,text,text,text,text,text,text),
  public.blundr_apply_reward_transaction_v2_core(uuid,text,text,text,text,text,text)
  from public, anon, authenticated, service_role;
grant execute on function public.blundr_commit_continuation_completion_v1(uuid,jsonb),
  public.blundr_apply_completion_reward_v3(uuid,text,text,text,text,text,text),
  public.blundr_apply_reward_transaction_v2(uuid,text,text,text,text,text,text)
  to service_role;

commit;
