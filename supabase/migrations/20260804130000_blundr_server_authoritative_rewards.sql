-- Server-authoritative completion rewards and repertoire unlocks.
-- Browser clients may read their own rows but cannot grant points, XP, rewards,
-- daily-ring progress, streaks, or repertoire unlocks.

create table if not exists public.blundr_completion_grants (
  user_id uuid not null references auth.users(id) on delete cascade,
  completion_id text not null,
  source text not null,
  local_date date not null,
  evidence_id text not null,
  opening_id text,
  repertoire_points integer not null default 0,
  reward_points integer not null default 0,
  xp integer not null default 0,
  result_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (user_id, completion_id),
  constraint blundr_completion_grants_source_check check (
    source in (
      'opening_run_completed',
      'continuation_completed',
      'daily_blundr_deck_completed'
    )
  ),
  constraint blundr_completion_grants_points_check check (
    repertoire_points >= 0 and reward_points >= 0 and xp >= 0
  )
);

create table if not exists public.blundr_xp_events (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null,
  xp integer not null,
  local_date date not null,
  completion_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, completion_id),
  constraint blundr_xp_events_xp_check check (xp >= 0)
);

create index if not exists idx_blundr_completion_grants_user_created
  on public.blundr_completion_grants (user_id, created_at desc);
create index if not exists idx_blundr_xp_events_user_created
  on public.blundr_xp_events (user_id, created_at desc);

alter table public.blundr_completion_grants enable row level security;
alter table public.blundr_xp_events enable row level security;

revoke all on public.blundr_completion_grants, public.blundr_xp_events
  from anon, authenticated;
grant select on public.blundr_completion_grants, public.blundr_xp_events
  to authenticated;

drop policy if exists blundr_completion_grants_select_own
  on public.blundr_completion_grants;
create policy blundr_completion_grants_select_own
  on public.blundr_completion_grants for select to authenticated
  using (user_id = auth.uid());

drop policy if exists blundr_xp_events_select_own
  on public.blundr_xp_events;
create policy blundr_xp_events_select_own
  on public.blundr_xp_events for select to authenticated
  using (user_id = auth.uid());

-- Revoke the historical browser-authored reward/progress write model. All
-- writes below are performed by service-role RPCs after evidence validation.
revoke insert, update, delete on public.blundr_repertoire_point_events
  from anon, authenticated;
revoke insert, update, delete on public.blundr_repertoire_unlock_events
  from anon, authenticated;
revoke insert, update, delete on public.blundr_user_repertoires
  from anon, authenticated;
revoke insert, update, delete on public.blundr_daily_retention_progress
  from anon, authenticated;
revoke insert, update, delete on public.blundr_streak_records
  from anon, authenticated;
revoke insert, update, delete on public.blundr_reward_history
  from anon, authenticated;
revoke insert, update, delete on public.blundr_reward_rolls
  from anon, authenticated;

create or replace function public.blundr_reward_random(p_seed text)
returns numeric
language sql
immutable
strict
set search_path = public, extensions
as $$
  select (('x' || substr(encode(digest(p_seed, 'sha256'), 'hex'), 1, 8))::bit(32)::bigint)::numeric / 4294967295::numeric;
$$;

create or replace function public.blundr_apply_activity_completion(
  p_user_id uuid,
  p_completion_id text,
  p_source text,
  p_evidence_id text,
  p_local_date date,
  p_opening_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_now timestamptz := now();
  v_existing jsonb;
  v_profile public.blundr_user_profiles%rowtype;
  v_day public.blundr_daily_retention_progress%rowtype;
  v_streak public.blundr_streak_records%rowtype;
  v_ring text;
  v_ring_closed_before boolean;
  v_ring_closed_after boolean;
  v_all_closed_before boolean;
  v_all_closed_after boolean;
  v_all_closed_this_action boolean := false;
  v_event_id text;
  v_base_points integer;
  v_base_xp integer;
  v_bonus_points integer := 0;
  v_bonus_xp integer := 0;
  v_reward_points integer := 0;
  v_reward_trigger text;
  v_reward_mode text;
  v_reward_rarity text;
  v_reward_amount integer := 0;
  v_reward_id text;
  v_reward_roll_id text;
  v_reward_json jsonb;
  v_reward_grants jsonb := '[]'::jsonb;
  v_random numeric;
  v_random_bonus boolean := false;
  v_pity_count integer := 0;
  v_current_streak integer := 0;
  v_longest_streak integer := 0;
  v_total_full_days integer := 0;
  v_last_date date;
  v_available_points integer := 0;
  v_lifetime_points integer := 0;
  v_spent_points integer := 0;
  v_result jsonb;
begin
  if p_user_id is null
    or nullif(btrim(p_completion_id), '') is null
    or nullif(btrim(p_evidence_id), '') is null
    or p_source not in (
      'opening_run_completed',
      'continuation_completed',
      'daily_blundr_deck_completed'
    ) then
    raise exception 'invalid_completion_request';
  end if;

  if char_length(p_completion_id) > 500 or char_length(p_evidence_id) > 240 then
    raise exception 'completion_identity_too_long';
  end if;

  if p_local_date < current_date - 1 or p_local_date > current_date + 1 then
    raise exception 'completion_date_out_of_range';
  end if;

  -- Serialize a user's completion writes so ring closure, streaks, and bonuses
  -- cannot be granted twice by concurrent requests.
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 399));

  select result_json into v_existing
  from public.blundr_completion_grants
  where user_id = p_user_id and completion_id = p_completion_id;
  if found then
    return jsonb_set(v_existing, '{duplicate}', 'true'::jsonb, true);
  end if;

  -- Evidence is server-owned. A Daily deck must be durably complete; trainer
  -- completions must point at a durable correct learning event in that session.
  if p_source = 'daily_blundr_deck_completed' then
    if not exists (
      select 1 from public.blundr_daily_sessions s
      where s.user_id = p_user_id
        and s.session_id = p_evidence_id
        and s.completed_at is not null
        and coalesce(s.state->>'status', '') = 'completed'
    ) then
      raise exception 'completion_evidence_unverified';
    end if;
  elsif not exists (
    select 1 from public.blundr_learning_events e
    where e.user_id = p_user_id
      and e.session_id = p_evidence_id
      and e.deleted_at is null
      and e.taxonomy = 'move_correct'
      and e.source in ('train', 'review')
      and e.occurred_at >= v_now - interval '36 hours'
      and (p_opening_id is null or e.opening_id = p_opening_id)
  ) then
    raise exception 'completion_evidence_unverified';
  end if;

  select * into v_profile from public.blundr_user_profiles
  where user_id = p_user_id;
  if not found then
    raise exception 'account_not_ready';
  end if;

  insert into public.blundr_user_repertoires (
    user_id, selected_starter_pack_id, unlocked_opening_ids,
    locked_opening_ids, opening_unlock_points, updated_at
  ) values (
    p_user_id, v_profile.selected_starter_pack_id, '{}', '{}', 0, v_now
  ) on conflict (user_id) do nothing;

  insert into public.blundr_daily_retention_progress (
    user_id, local_date,
    daily_tempo_goal, daily_battery_goal, daily_blundr_goal,
    updated_at
  ) values (
    p_user_id, p_local_date,
    greatest(1, v_profile.daily_tempo_goal),
    greatest(1, v_profile.daily_battery_goal),
    greatest(1, v_profile.daily_blundr_goal),
    v_now
  ) on conflict (user_id, local_date) do nothing;

  insert into public.blundr_streak_records (
    user_id, current_streak, longest_streak,
    total_all_rings_closed_days, last_completed_local_date, updated_at
  ) values (p_user_id, 0, 0, 0, null, v_now)
  on conflict (user_id) do nothing;

  select * into v_day from public.blundr_daily_retention_progress
  where user_id = p_user_id and local_date = p_local_date
  for update;

  v_event_id := encode(digest(
    p_user_id::text || ':' || p_completion_id || ':' || p_source,
    'sha256'
  ), 'hex');
  if v_event_id = any(coalesce(v_day.activity_event_ids, '{}')) then
    raise exception 'completion_identity_conflict';
  end if;

  v_all_closed_before := v_day.all_rings_closed;
  if p_source = 'opening_run_completed' then
    v_ring := 'daily_tempo';
    v_ring_closed_before := v_day.daily_tempo_completed;
    v_base_points := 1;
    v_base_xp := 10;
    v_day.daily_tempo_progress := v_day.daily_tempo_progress + 1;
    v_ring_closed_after := v_day.daily_tempo_progress >= v_day.daily_tempo_goal;
    v_day.daily_tempo_completed := v_ring_closed_after;
    if v_ring_closed_after then
      v_day.daily_tempo_completed_at := coalesce(v_day.daily_tempo_completed_at, v_now);
    end if;
  elsif p_source = 'continuation_completed' then
    v_ring := 'daily_battery';
    v_ring_closed_before := v_day.daily_battery_completed;
    v_base_points := 2;
    v_base_xp := 20;
    v_day.daily_battery_progress := v_day.daily_battery_progress + 1;
    v_ring_closed_after := v_day.daily_battery_progress >= v_day.daily_battery_goal;
    v_day.daily_battery_completed := v_ring_closed_after;
    if v_ring_closed_after then
      v_day.daily_battery_completed_at := coalesce(v_day.daily_battery_completed_at, v_now);
    end if;
  else
    v_ring := 'daily_blundr';
    v_ring_closed_before := v_day.daily_blundr_completed;
    v_base_points := 5;
    v_base_xp := 50;
    v_day.daily_blundr_progress := v_day.daily_blundr_progress + 1;
    v_ring_closed_after := v_day.daily_blundr_progress >= v_day.daily_blundr_goal;
    v_day.daily_blundr_completed := v_ring_closed_after;
    if v_ring_closed_after then
      v_day.daily_blundr_completed_at := coalesce(v_day.daily_blundr_completed_at, v_now);
    end if;
  end if;

  v_all_closed_after := v_day.daily_tempo_completed
    and v_day.daily_battery_completed
    and v_day.daily_blundr_completed;
  v_all_closed_this_action := v_all_closed_after and not v_all_closed_before;
  if v_all_closed_this_action then
    v_bonus_points := v_bonus_points + 10;
    v_bonus_xp := v_bonus_xp + 100;
    v_day.all_rings_closed := true;
    v_day.all_rings_closed_at := coalesce(v_day.all_rings_closed_at, v_now);
    v_day.completed_at := coalesce(v_day.completed_at, v_now);

    select * into v_streak from public.blundr_streak_records
    where user_id = p_user_id for update;
    v_last_date := v_streak.last_completed_local_date;
    if v_last_date is null or v_last_date < p_local_date - 1 then
      v_current_streak := 1;
    elsif v_last_date = p_local_date - 1 then
      v_current_streak := v_streak.current_streak + 1;
    else
      v_current_streak := greatest(1, v_streak.current_streak);
    end if;
    v_longest_streak := greatest(v_streak.longest_streak, v_current_streak);
    v_total_full_days := v_streak.total_all_rings_closed_days
      + case when v_last_date is distinct from p_local_date then 1 else 0 end;
    if v_last_date is distinct from p_local_date then
      if v_current_streak = 7 then
        v_bonus_points := v_bonus_points + 35;
        v_bonus_xp := v_bonus_xp + 250;
      elsif v_current_streak = 30 then
        v_bonus_points := v_bonus_points + 150;
        v_bonus_xp := v_bonus_xp + 1000;
      end if;
    end if;
    update public.blundr_streak_records set
      current_streak = v_current_streak,
      longest_streak = v_longest_streak,
      total_all_rings_closed_days = v_total_full_days,
      last_completed_local_date = greatest(last_completed_local_date, p_local_date),
      updated_at = v_now
    where user_id = p_user_id;
    v_last_date := p_local_date;
  else
    select coalesce(current_streak, 0), coalesce(longest_streak, 0),
      coalesce(total_all_rings_closed_days, 0), last_completed_local_date
    into v_current_streak, v_longest_streak, v_total_full_days, v_last_date
    from public.blundr_streak_records where user_id = p_user_id;
  end if;

  insert into public.blundr_reward_history (user_id, updated_at)
  values (p_user_id, v_now) on conflict (user_id) do nothing;
  select all_rings_days_since_random_reward into v_pity_count
  from public.blundr_reward_history where user_id = p_user_id for update;

  -- One deterministic cache at most per completion. Guaranteed streak caches
  -- outrank pity, all-ring, and ring-close chance rolls.
  if v_all_closed_this_action and v_current_streak > 0 and v_current_streak % 30 = 0 then
    v_reward_trigger := 'monthly_cache'; v_reward_mode := 'guaranteed_cache';
  elsif v_all_closed_this_action and v_current_streak > 0 and v_current_streak % 7 = 0 then
    v_reward_trigger := 'weekly_cache'; v_reward_mode := 'guaranteed_cache';
  elsif v_all_closed_this_action and v_pity_count >= 14 then
    v_reward_trigger := 'all_rings_closed'; v_reward_mode := 'pity_bonus';
  elsif v_all_closed_this_action and v_total_full_days > 0 and v_total_full_days % 3 = 0
    and public.blundr_reward_random(p_user_id::text || ':' || p_local_date::text || ':three-full') < 0.12 then
    v_reward_trigger := 'three_all_rings_completions'; v_reward_mode := 'random_bonus';
  elsif v_all_closed_this_action
    and public.blundr_reward_random(p_user_id::text || ':' || p_local_date::text || ':all-rings') < 0.08 then
    v_reward_trigger := 'all_rings_closed'; v_reward_mode := 'random_bonus';
  elsif v_ring_closed_after and not v_ring_closed_before
    and public.blundr_reward_random(p_user_id::text || ':' || p_local_date::text || ':' || v_ring) <
      case when v_ring = 'daily_blundr' then 0.02 else 0.01 end then
    v_reward_trigger := case v_ring
      when 'daily_tempo' then 'daily_tempo_ring_closed'
      when 'daily_battery' then 'daily_battery_ring_closed'
      else 'daily_blundr_ring_closed' end;
    v_reward_mode := 'random_bonus';
  end if;

  if v_reward_trigger is not null then
    v_random := public.blundr_reward_random(
      p_user_id::text || ':' || p_local_date::text || ':' || v_reward_trigger || ':rarity'
    );
    if v_reward_mode = 'pity_bonus' or v_random < 0.72 then
      v_reward_rarity := 'common';
      v_reward_amount := case when public.blundr_reward_random(p_completion_id || ':amount') < 0.5 then 5 else 10 end;
    elsif v_random < 0.92 then
      v_reward_rarity := 'uncommon';
      v_reward_amount := case when public.blundr_reward_random(p_completion_id || ':amount') < 0.5 then 15 else 25 end;
    elsif v_random < 0.99 then
      v_reward_rarity := 'rare'; v_reward_amount := 50;
    else
      v_reward_rarity := 'epic'; v_reward_amount := 100;
    end if;
    v_reward_points := v_reward_amount;
    v_random_bonus := v_reward_mode in ('random_bonus', 'pity_bonus');
    v_reward_roll_id := 'reward-roll:' || encode(digest(
      p_user_id::text || ':' || p_local_date::text || ':' || v_reward_trigger,
      'sha256'
    ), 'hex');
    v_reward_id := v_reward_roll_id || ':' || v_reward_rarity || ':' || v_reward_amount;
    v_reward_json := jsonb_build_object(
      'id', v_reward_id,
      'rarity', v_reward_rarity,
      'rewardType', case v_reward_rarity when 'uncommon' then 'opening_fragment' when 'rare' then 'choice_token' else 'unlock_points' end,
      'amount', v_reward_amount,
      'displayName', initcap(v_reward_rarity) || ' Tempo cache',
      'description', 'Tempo applied +' || v_reward_amount || ' repertoire points.'
    );
    insert into public.blundr_reward_rolls (
      id, user_id, trigger, rolled_at, did_reward, reward_json, seed
    ) values (
      v_reward_roll_id, p_user_id, v_reward_trigger, v_now, true,
      v_reward_json, p_user_id::text || ':' || v_reward_roll_id || ':' || v_reward_trigger
    ) on conflict (id) do nothing;
    v_reward_grants := jsonb_build_array(jsonb_build_object(
      'id', v_reward_id || ':grant',
      'rewardId', v_reward_id,
      'rewardRollId', v_reward_roll_id,
      'trigger', v_reward_trigger,
      'triggerEventId', v_reward_roll_id,
      'rarity', v_reward_rarity,
      'rewardType', v_reward_json->>'rewardType',
      'amount', v_reward_amount,
      'displayName', v_reward_json->>'displayName',
      'description', v_reward_json->>'description',
      'pointsApplied', v_reward_amount,
      'applied', true,
      'pendingChoice', false,
      'grantMode', v_reward_mode,
      'createdAt', v_now
    ));
  end if;

  insert into public.blundr_repertoire_point_events (
    id, user_id, source, points, opening_id, daily_session_id, created_at
  ) values (
    'completion:' || v_event_id, p_user_id, p_source,
    v_base_points, p_opening_id, p_evidence_id, v_now
  );
  if v_bonus_points > 0 then
    insert into public.blundr_repertoire_point_events (
      id, user_id, source, points, opening_id, daily_session_id, created_at
    ) values (
      'completion:' || v_event_id || ':milestone', p_user_id,
      'manual_dev_adjustment', v_bonus_points, p_opening_id, p_evidence_id, v_now
    );
  end if;
  if v_reward_points > 0 then
    insert into public.blundr_repertoire_point_events (
      id, user_id, source, points, opening_id, daily_session_id, created_at
    ) values (
      'completion:' || v_event_id || ':reward', p_user_id,
      'reward_bonus', v_reward_points, p_opening_id, p_evidence_id, v_now
    );
  end if;

  insert into public.blundr_xp_events (
    id, user_id, source, xp, local_date, completion_id, created_at
  ) values (
    'xp:' || v_event_id, p_user_id, p_source,
    v_base_xp + v_bonus_xp, p_local_date, p_completion_id, v_now
  );

  v_day.activity_event_ids := array_append(v_day.activity_event_ids, v_event_id);
  v_day.xp_earned := v_day.xp_earned + v_base_xp + v_bonus_xp;
  v_day.opening_points_earned := v_day.opening_points_earned
    + v_base_points + v_bonus_points + v_reward_points;
  v_day.streak_eligible := v_day.all_rings_closed;
  v_day.updated_at := v_now;
  update public.blundr_daily_retention_progress set
    daily_tempo_progress = v_day.daily_tempo_progress,
    daily_tempo_completed = v_day.daily_tempo_completed,
    daily_tempo_completed_at = v_day.daily_tempo_completed_at,
    daily_battery_progress = v_day.daily_battery_progress,
    daily_battery_completed = v_day.daily_battery_completed,
    daily_battery_completed_at = v_day.daily_battery_completed_at,
    daily_blundr_progress = v_day.daily_blundr_progress,
    daily_blundr_completed = v_day.daily_blundr_completed,
    daily_blundr_completed_at = v_day.daily_blundr_completed_at,
    all_rings_closed = v_day.all_rings_closed,
    all_rings_closed_at = v_day.all_rings_closed_at,
    activity_event_ids = v_day.activity_event_ids,
    xp_earned = v_day.xp_earned,
    opening_points_earned = v_day.opening_points_earned,
    streak_eligible = v_day.streak_eligible,
    completed_at = v_day.completed_at,
    updated_at = v_now
  where id = v_day.id;

  select coalesce(sum(points), 0) into v_lifetime_points
  from public.blundr_repertoire_point_events where user_id = p_user_id;
  select coalesce(sum(points_spent), 0) into v_spent_points
  from public.blundr_repertoire_unlock_events where user_id = p_user_id;
  v_available_points := greatest(0, v_lifetime_points - v_spent_points);
  update public.blundr_user_repertoires set
    opening_unlock_points = v_available_points,
    updated_at = v_now
  where user_id = p_user_id;

  update public.blundr_reward_history set
    random_bonus_pity_counter = case
      when v_random_bonus then 0
      when v_all_closed_this_action then v_pity_count + 1
      else v_pity_count end,
    all_rings_days_since_random_reward = case
      when v_random_bonus then 0
      when v_all_closed_this_action then v_pity_count + 1
      else v_pity_count end,
    last_random_bonus_at = case when v_random_bonus then v_now else last_random_bonus_at end,
    last_random_reward_local_date = case when v_random_bonus then p_local_date::text else last_random_reward_local_date end,
    last_pity_guarantee_local_date = case when v_reward_mode = 'pity_bonus' then p_local_date::text else last_pity_guarantee_local_date end,
    applied_reward_ids = case when v_reward_id is null then applied_reward_ids else array_append(applied_reward_ids, v_reward_id) end,
    updated_at = v_now
  where user_id = p_user_id;

  v_result := jsonb_build_object(
    'duplicate', false,
    'completionId', p_completion_id,
    'source', p_source,
    'localDate', p_local_date,
    'ringClosedThisAction', v_ring_closed_after and not v_ring_closed_before,
    'allRingsClosedThisAction', v_all_closed_this_action,
    'repertoirePointsAwarded', v_base_points + v_bonus_points + v_reward_points,
    'rewardPointsAwarded', v_reward_points,
    'xpAwarded', v_base_xp + v_bonus_xp,
    'rewardGrants', v_reward_grants,
    'rewardHistory', (
      select jsonb_build_object(
        'userId', h.user_id,
        'allRingsDaysSinceRandomReward', h.all_rings_days_since_random_reward,
        'randomBonusPityCounter', h.random_bonus_pity_counter,
        'lastRandomRewardLocalDate', h.last_random_reward_local_date,
        'lastRandomBonusAt', h.last_random_bonus_at,
        'lastPityGuaranteeLocalDate', h.last_pity_guarantee_local_date,
        'appliedRewardIds', to_jsonb(h.applied_reward_ids),
        'updatedAt', h.updated_at
      ) from public.blundr_reward_history h where h.user_id = p_user_id
    ),
    'tempoCacheState', case when v_reward_points > 0 then 'applied' else 'closed' end,
    'availablePoints', v_available_points,
    'lifetimePoints', v_lifetime_points,
    'spentPoints', v_spent_points,
    'dayRecord', jsonb_build_object(
      'userId', p_user_id,
      'localDate', p_local_date,
      'dailyTempo', jsonb_build_object('ringId', 'daily_tempo', 'progress', v_day.daily_tempo_progress, 'goal', v_day.daily_tempo_goal, 'closed', v_day.daily_tempo_completed, 'closedAt', v_day.daily_tempo_completed_at),
      'dailyBattery', jsonb_build_object('ringId', 'daily_battery', 'progress', v_day.daily_battery_progress, 'goal', v_day.daily_battery_goal, 'closed', v_day.daily_battery_completed, 'closedAt', v_day.daily_battery_completed_at),
      'dailyBlundr', jsonb_build_object('ringId', 'daily_blundr', 'progress', v_day.daily_blundr_progress, 'goal', v_day.daily_blundr_goal, 'closed', v_day.daily_blundr_completed, 'closedAt', v_day.daily_blundr_completed_at),
      'allRingsClosed', v_day.all_rings_closed,
      'allRingsClosedAt', v_day.all_rings_closed_at,
      'xpEarnedToday', v_day.xp_earned,
      'repertoirePointsEarnedToday', v_day.opening_points_earned,
      'activityEventIds', to_jsonb(v_day.activity_event_ids),
      'createdAt', v_now,
      'updatedAt', v_now
    ),
    'streakRecord', jsonb_build_object(
      'userId', p_user_id,
      'currentStreakDays', v_current_streak,
      'longestStreakDays', v_longest_streak,
      'totalAllRingsClosedDays', v_total_full_days,
      'lastCompletedLocalDate', v_last_date,
      'updatedAt', v_now
    )
  );

  insert into public.blundr_completion_grants (
    user_id, completion_id, source, local_date, evidence_id, opening_id,
    repertoire_points, reward_points, xp, result_json, created_at
  ) values (
    p_user_id, p_completion_id, p_source, p_local_date, p_evidence_id,
    p_opening_id, v_base_points + v_bonus_points + v_reward_points,
    v_reward_points, v_base_xp + v_bonus_xp, v_result, v_now
  );
  return v_result;
end;
$$;

create or replace function public.blundr_unlock_repertoire_opening(
  p_user_id uuid,
  p_opening_id text,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_repertoire public.blundr_user_repertoires%rowtype;
  v_unlock_index integer;
  v_cost integer;
  v_event_id text;
  v_lifetime integer;
  v_spent integer;
  v_available integer;
begin
  if p_user_id is null or nullif(btrim(p_opening_id), '') is null
    or nullif(btrim(p_idempotency_key), '') is null then
    raise exception 'invalid_unlock_request';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 399));
  select * into v_repertoire from public.blundr_user_repertoires
  where user_id = p_user_id for update;
  if not found then raise exception 'account_not_ready'; end if;
  if p_opening_id = any(v_repertoire.unlocked_opening_ids) then
    return jsonb_build_object(
      'duplicate', true, 'openingId', p_opening_id,
      'availablePoints', v_repertoire.opening_unlock_points,
      'unlockedOpeningIds', to_jsonb(v_repertoire.unlocked_opening_ids)
    );
  end if;
  if not p_opening_id = any(v_repertoire.locked_opening_ids) then
    raise exception 'opening_not_locked';
  end if;
  select count(*) + 1 into v_unlock_index
  from public.blundr_repertoire_unlock_events where user_id = p_user_id;
  v_cost := case
    when v_unlock_index = 1 then 150
    when v_unlock_index = 2 then 300
    else 500 end;
  if v_repertoire.opening_unlock_points < v_cost then
    raise exception 'insufficient_points';
  end if;
  v_event_id := 'unlock:' || encode(digest(
    p_user_id::text || ':' || p_idempotency_key || ':' || p_opening_id,
    'sha256'
  ), 'hex');
  insert into public.blundr_repertoire_unlock_events (
    id, user_id, opening_id, points_spent, unlock_index, created_at
  ) values (v_event_id, p_user_id, p_opening_id, v_cost, v_unlock_index, now())
  on conflict (id) do nothing;
  select coalesce(sum(points), 0) into v_lifetime
  from public.blundr_repertoire_point_events where user_id = p_user_id;
  select coalesce(sum(points_spent), 0) into v_spent
  from public.blundr_repertoire_unlock_events where user_id = p_user_id;
  v_available := greatest(0, v_lifetime - v_spent);
  update public.blundr_user_repertoires set
    unlocked_opening_ids = array_append(unlocked_opening_ids, p_opening_id),
    locked_opening_ids = array_remove(locked_opening_ids, p_opening_id),
    opening_unlock_points = v_available,
    updated_at = now()
  where user_id = p_user_id
  returning * into v_repertoire;
  return jsonb_build_object(
    'duplicate', false, 'openingId', p_opening_id, 'pointsSpent', v_cost,
    'unlockIndex', v_unlock_index, 'availablePoints', v_available,
    'lifetimePoints', v_lifetime, 'spentPoints', v_spent,
    'unlockedOpeningIds', to_jsonb(v_repertoire.unlocked_opening_ids),
    'lockedOpeningIds', to_jsonb(v_repertoire.locked_opening_ids),
    'eventId', v_event_id, 'updatedAt', v_repertoire.updated_at
  );
end;
$$;

revoke all on function public.blundr_reward_random(text) from public, anon, authenticated;
revoke all on function public.blundr_apply_activity_completion(uuid, text, text, text, date, text)
  from public, anon, authenticated;
revoke all on function public.blundr_unlock_repertoire_opening(uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.blundr_apply_activity_completion(uuid, text, text, text, date, text)
  to service_role;
grant execute on function public.blundr_unlock_repertoire_opening(uuid, text, text)
  to service_role;
