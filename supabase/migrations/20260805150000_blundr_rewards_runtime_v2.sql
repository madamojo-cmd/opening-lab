-- PR-03: the only v2 reward writer.  The v2 tables were introduced by PR-01;
-- this migration replaces its deliberately fail-closed RPC shells.
begin;

alter table public.blundr_reward_presentations_v2
  add column if not exists dismissed_at timestamptz;

-- A missing server secret is not a losing roll.  Routine rewards can still be
-- committed, but random evaluation is reported as unavailable and no random
-- grant/history mutation is fabricated.
create or replace function public.blundr_rewards_v2_hmac_random(p_payload text)
returns numeric
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  v_secret text := nullif(current_setting('app.blundr_rewards_hmac_secret', true), '');
  v_hex text;
begin
  if v_secret is null then return null; end if;
  v_hex := encode(hmac(p_payload, v_secret, 'sha256'), 'hex');
  return (('x' || substr(v_hex, 1, 8))::bit(32)::bigint)::numeric / 4294967295::numeric;
end;
$$;

create or replace function public.blundr_apply_reward_transaction_v2(
  p_user_id uuid, p_completion_id text, p_source text, p_evidence_id text,
  p_idempotency_key text, p_policy_version text,
  p_randomness_key_version text default null
) returns jsonb
language plpgsql security definer set search_path = public, extensions
as $$
declare
  v_tx public.blundr_reward_transactions_v2%rowtype;
  v_points integer;
  v_random numeric;
  v_all_rings_random numeric;
  v_rarity_random numeric;
  v_amount_random numeric;
  v_quantity integer;
  v_bonus_type text;
  v_randomness_available boolean := false;
  v_grant_id uuid;
  v_bonus_grant_id uuid;
  v_reward_trigger text;
  v_reward_rarity text;
  v_reward_amount integer := 0;
  v_reward_roll_id text;
  v_pity_count integer := 0;
  v_reward_mode text;
  v_should_reward boolean := false;
  v_reward_grants jsonb := '[]'::jsonb;
  v_envelope jsonb;
  v_profile public.blundr_user_profiles%rowtype;
  v_day public.blundr_daily_retention_progress%rowtype;
  v_streak public.blundr_streak_records%rowtype;
  v_local_date date;
  v_evidence_identity text;
  v_evidence_occurred_at timestamptz;
  v_expected_completion_id text;
  v_completion_id text;
  v_idempotency_key text;
  v_ring text;
  v_ring_before boolean;
  v_ring_after boolean;
  v_all_before boolean;
  v_all_after boolean;
  v_all_closed_this_action boolean := false;
  v_xp integer;
  v_streak_points integer := 0;
  v_streak_xp integer := 0;
  v_current_streak integer := 0;
  v_longest_streak integer := 0;
  v_total_full_days integer := 0;
  v_last_date date;
  v_event_id text;
  v_legacy_result jsonb;
begin
  if p_user_id is null or nullif(btrim(p_completion_id), '') is null
    or p_source not in ('opening_run_completed','continuation_completed','daily_blundr_deck_completed')
    or nullif(btrim(p_evidence_id), '') is null or nullif(btrim(p_idempotency_key), '') is null
    or nullif(btrim(p_policy_version), '') is null then
    raise exception 'invalid_reward_transaction_request';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 403));
  -- Preserve any immutable legacy completion as history; it already includes
  -- reward effects and must never be re-granted by the v2 writer.
  select result_json into v_legacy_result from public.blundr_completion_grants
    where user_id=p_user_id and source=p_source and evidence_id=p_evidence_id
    order by created_at desc limit 1;
  if found then return jsonb_set(v_legacy_result,'{duplicate}','true'::jsonb,true); end if;
  -- Daily owns a completed session. Train/review completion authority belongs
  -- to PR-04; a correct move is deliberately not completion evidence.
  if p_source = 'daily_blundr_deck_completed' then
    select s.session_id,d.local_date into v_evidence_identity,v_local_date
    from public.blundr_daily_sessions s join public.blundr_daily_decks d on d.deck_id=s.deck_id and d.user_id=s.user_id
    where s.user_id=p_user_id and s.session_id=p_evidence_id and s.completed_at is not null and coalesce(s.state->>'status','')='completed';
    if not found then
      raise exception 'completion_evidence_unverified';
    end if;
  else
    raise exception 'completion_evidence_unverified';
  end if;
  select * into v_profile from public.blundr_user_profiles where user_id=p_user_id;
  if not found then raise exception 'account_not_ready'; end if;
  if p_source <> 'daily_blundr_deck_completed' then
    if v_profile.time_zone is null or not public.blundr_is_valid_iana_time_zone(v_profile.time_zone) then raise exception 'completion_time_zone_unavailable'; end if;
    v_local_date := (v_evidence_occurred_at at time zone v_profile.time_zone)::date;
  end if;
  if v_local_date is null or v_evidence_identity is null then raise exception 'completion_identity_unavailable'; end if;
  v_expected_completion_id := 'reward-completion:' || encode(digest(p_user_id::text || ':' || p_source || ':' || v_evidence_identity || ':' || v_local_date::text,'sha256'),'hex');
  v_completion_id := v_expected_completion_id;
  v_idempotency_key := 'reward-transaction:' || v_completion_id;
  select * into v_tx from public.blundr_reward_transactions_v2 where user_id=p_user_id and idempotency_key=v_idempotency_key;
  if found then
    if v_tx.completion_id is distinct from v_completion_id or v_tx.source is distinct from p_source or v_tx.policy_version is distinct from p_policy_version or not exists(select 1 from public.blundr_reward_grants_v2 g where g.transaction_id=v_tx.id and g.user_id=p_user_id and g.metadata->>'evidenceId'=p_evidence_id) then raise exception 'reward_idempotency_conflict'; end if;
    return jsonb_build_object('duplicate', true, 'transactionId', v_tx.id,'randomEvaluation',case when v_tx.randomness_key_version is null then 'unavailable' else 'evaluated' end);
  end if;
  if exists(select 1 from public.blundr_reward_transactions_v2 where user_id=p_user_id and completion_id=v_completion_id) then raise exception 'completion_already_rewarded'; end if;
  -- Compatibility projection for the active rings/streak/points readers. This
  -- is in the v2 transaction; it never calls the legacy reward writer.
  insert into public.blundr_user_repertoires(user_id,selected_starter_pack_id,unlocked_opening_ids,locked_opening_ids,opening_unlock_points,updated_at)
  values(p_user_id,v_profile.selected_starter_pack_id,'{}','{}',0,now()) on conflict(user_id) do nothing;
  insert into public.blundr_daily_retention_progress(user_id,local_date,daily_tempo_goal,daily_battery_goal,daily_blundr_goal,updated_at)
  values(p_user_id,v_local_date,greatest(1,v_profile.daily_tempo_goal),greatest(1,v_profile.daily_battery_goal),greatest(1,v_profile.daily_blundr_goal),now()) on conflict(user_id,local_date) do nothing;
  insert into public.blundr_streak_records(user_id,current_streak,longest_streak,total_all_rings_closed_days,last_completed_local_date,updated_at)
  values(p_user_id,0,0,0,null,now()) on conflict(user_id) do nothing;
  select * into v_day from public.blundr_daily_retention_progress where user_id=p_user_id and local_date=v_local_date for update;
  v_event_id := encode(digest(p_user_id::text || ':' || v_completion_id || ':' || p_source,'sha256'),'hex');
  if v_event_id = any(coalesce(v_day.activity_event_ids,'{}')) then raise exception 'completion_identity_conflict'; end if;
  v_all_before := v_day.all_rings_closed;
  if p_source='opening_run_completed' then v_ring:='daily_tempo'; v_points:=1; v_xp:=10; v_ring_before:=v_day.daily_tempo_completed; v_day.daily_tempo_progress:=v_day.daily_tempo_progress+1; v_ring_after:=v_day.daily_tempo_progress>=v_day.daily_tempo_goal; v_day.daily_tempo_completed:=v_ring_after; if v_ring_after then v_day.daily_tempo_completed_at:=coalesce(v_day.daily_tempo_completed_at,now()); end if;
  elsif p_source='continuation_completed' then v_ring:='daily_battery'; v_points:=2; v_xp:=20; v_ring_before:=v_day.daily_battery_completed; v_day.daily_battery_progress:=v_day.daily_battery_progress+1; v_ring_after:=v_day.daily_battery_progress>=v_day.daily_battery_goal; v_day.daily_battery_completed:=v_ring_after; if v_ring_after then v_day.daily_battery_completed_at:=coalesce(v_day.daily_battery_completed_at,now()); end if;
  else v_ring:='daily_blundr'; v_points:=5; v_xp:=50; v_ring_before:=v_day.daily_blundr_completed; v_day.daily_blundr_progress:=v_day.daily_blundr_progress+1; v_ring_after:=v_day.daily_blundr_progress>=v_day.daily_blundr_goal; v_day.daily_blundr_completed:=v_ring_after; if v_ring_after then v_day.daily_blundr_completed_at:=coalesce(v_day.daily_blundr_completed_at,now()); end if; end if;
  v_all_after:=v_day.daily_tempo_completed and v_day.daily_battery_completed and v_day.daily_blundr_completed;
  v_all_closed_this_action:=v_all_after and not v_all_before;
  if v_all_closed_this_action then
    v_day.all_rings_closed:=true; v_day.all_rings_closed_at:=coalesce(v_day.all_rings_closed_at,now()); v_day.completed_at:=coalesce(v_day.completed_at,now());
    select * into v_streak from public.blundr_streak_records where user_id=p_user_id for update;
    v_last_date:=v_streak.last_completed_local_date;
    v_current_streak:=case when v_last_date is null or v_last_date<v_local_date-1 then 1 when v_last_date=v_local_date-1 then v_streak.current_streak+1 else greatest(1,v_streak.current_streak) end;
    v_longest_streak:=greatest(v_streak.longest_streak,v_current_streak); v_total_full_days:=v_streak.total_all_rings_closed_days+case when v_last_date is distinct from v_local_date then 1 else 0 end;
    if v_last_date is distinct from v_local_date and v_current_streak=7 then v_streak_points:=35; v_streak_xp:=250; elsif v_last_date is distinct from v_local_date and v_current_streak=30 then v_streak_points:=150; v_streak_xp:=1000; end if;
    update public.blundr_streak_records set current_streak=v_current_streak,longest_streak=v_longest_streak,total_all_rings_closed_days=v_total_full_days,last_completed_local_date=case when last_completed_local_date is null then v_local_date else greatest(last_completed_local_date,v_local_date) end,updated_at=now() where user_id=p_user_id;
    v_last_date := v_local_date;
  else select current_streak,longest_streak,total_all_rings_closed_days,last_completed_local_date into v_current_streak,v_longest_streak,v_total_full_days,v_last_date from public.blundr_streak_records where user_id=p_user_id; end if;
  v_points:=v_points+v_streak_points; v_xp:=v_xp+v_streak_xp;
  v_day.activity_event_ids:=array_append(v_day.activity_event_ids,v_event_id); v_day.xp_earned:=v_day.xp_earned+v_xp; v_day.opening_points_earned:=v_day.opening_points_earned+v_points; v_day.streak_eligible:=v_day.all_rings_closed; v_day.updated_at:=now();
  update public.blundr_daily_retention_progress set daily_tempo_progress=v_day.daily_tempo_progress,daily_tempo_completed=v_day.daily_tempo_completed,daily_tempo_completed_at=v_day.daily_tempo_completed_at,daily_battery_progress=v_day.daily_battery_progress,daily_battery_completed=v_day.daily_battery_completed,daily_battery_completed_at=v_day.daily_battery_completed_at,daily_blundr_progress=v_day.daily_blundr_progress,daily_blundr_completed=v_day.daily_blundr_completed,daily_blundr_completed_at=v_day.daily_blundr_completed_at,all_rings_closed=v_day.all_rings_closed,all_rings_closed_at=v_day.all_rings_closed_at,activity_event_ids=v_day.activity_event_ids,xp_earned=v_day.xp_earned,opening_points_earned=v_day.opening_points_earned,streak_eligible=v_day.streak_eligible,completed_at=v_day.completed_at,updated_at=v_day.updated_at where id=v_day.id;
  v_quantity := v_points;
  v_random := public.blundr_rewards_v2_hmac_random(p_user_id::text || ':' || v_completion_id || ':trigger:' || p_policy_version);
  v_all_rings_random := public.blundr_rewards_v2_hmac_random(p_user_id::text || ':' || v_completion_id || ':all-rings-trigger:' || p_policy_version);
  v_rarity_random := public.blundr_rewards_v2_hmac_random(p_user_id::text || ':' || v_completion_id || ':rarity:' || p_policy_version);
  v_amount_random := public.blundr_rewards_v2_hmac_random(p_user_id::text || ':' || v_completion_id || ':common-amount:' || p_policy_version);
  v_randomness_available := v_random is not null and v_all_rings_random is not null and v_rarity_random is not null and v_amount_random is not null and nullif(btrim(coalesce(p_randomness_key_version,'')), '') is not null;
  if v_randomness_available then
    insert into public.blundr_reward_history(user_id,updated_at) values(p_user_id,now()) on conflict(user_id) do nothing;
    select all_rings_days_since_random_reward into v_pity_count from public.blundr_reward_history where user_id=p_user_id for update;
    if v_all_closed_this_action and v_current_streak>0 and v_current_streak%30=0 then v_reward_trigger:='monthly_cache'; v_reward_mode:='guaranteed_cache'; v_should_reward:=true;
    elsif v_all_closed_this_action and v_current_streak>0 and v_current_streak%7=0 then v_reward_trigger:='weekly_cache'; v_reward_mode:='guaranteed_cache'; v_should_reward:=true;
    elsif v_all_closed_this_action and v_pity_count>=14 then v_reward_trigger:='all_rings_closed'; v_reward_mode:='pity_bonus'; v_should_reward:=true;
    elsif v_all_closed_this_action and v_total_full_days>0 and v_total_full_days%3=0 and v_random < .12 then v_reward_trigger:='three_all_rings_completions'; v_reward_mode:='random_bonus'; v_should_reward:=true;
    elsif v_all_closed_this_action then v_reward_trigger:='all_rings_closed'; v_reward_mode:='random_bonus'; v_should_reward:=(v_all_rings_random < .08);
    else v_reward_trigger:=case v_ring when 'daily_tempo' then 'daily_tempo_ring_closed' when 'daily_battery' then 'daily_battery_ring_closed' else 'daily_blundr_ring_closed' end; v_reward_mode:='random_bonus'; v_should_reward:=(v_ring_after and not v_ring_before and v_random < case when v_ring='daily_blundr' then .02 else .01 end); end if;
    v_reward_roll_id := 'reward-roll-v2:' || encode(digest(p_user_id::text || ':' || v_completion_id || ':' || v_reward_trigger,'sha256'),'hex');
    if v_should_reward then
      if v_reward_mode='pity_bonus' or v_rarity_random < 0.72 then v_reward_rarity:='common'; v_reward_amount:=case when v_amount_random < .5 then 5 else 10 end;
      elsif v_rarity_random < 0.92 then v_reward_rarity:='uncommon'; v_reward_amount:=1; v_bonus_type:='opening_fragment';
      elsif v_rarity_random < 0.99 then v_reward_rarity:='rare'; v_reward_amount:=1; v_bonus_type:='choice_token';
      else v_reward_rarity:='epic'; v_reward_amount:=100; end if;
    end if;
    insert into public.blundr_reward_rolls(id,user_id,trigger,rolled_at,did_reward,reward_json,seed) values(v_reward_roll_id,p_user_id,v_reward_trigger,now(),v_should_reward,case when v_should_reward then jsonb_build_object('id',v_reward_roll_id || ':' || v_reward_rarity,'rarity',v_reward_rarity,'rewardType',coalesce(v_bonus_type,'unlock_points'),'amount',v_reward_amount) else null end,v_reward_roll_id) on conflict(id) do nothing;
    update public.blundr_reward_history set random_bonus_pity_counter=case when v_reward_mode in ('random_bonus','pity_bonus') and v_should_reward then 0 when v_all_closed_this_action then v_pity_count+1 else v_pity_count end,all_rings_days_since_random_reward=case when v_reward_mode in ('random_bonus','pity_bonus') and v_should_reward then 0 when v_all_closed_this_action then v_pity_count+1 else v_pity_count end,last_random_bonus_at=case when v_reward_mode in ('random_bonus','pity_bonus') and v_should_reward then now() else last_random_bonus_at end,last_random_reward_local_date=case when v_reward_mode in ('random_bonus','pity_bonus') and v_should_reward then v_local_date::text else last_random_reward_local_date end,last_pity_guarantee_local_date=case when v_reward_mode='pity_bonus' then v_local_date::text else last_pity_guarantee_local_date end,applied_reward_ids=case when v_should_reward then array_append(applied_reward_ids,v_reward_roll_id || ':' || v_reward_rarity) else applied_reward_ids end,updated_at=now() where user_id=p_user_id;
  end if;
  insert into public.blundr_reward_transactions_v2 (user_id,idempotency_key,transaction_kind,completion_id,source,policy_version,randomness_key_version)
  values (p_user_id,v_idempotency_key,'reward_grant',v_completion_id,p_source,p_policy_version,
    case when v_randomness_available then p_randomness_key_version else null end)
  returning * into v_tx;
  insert into public.blundr_reward_grants_v2 (transaction_id,user_id,grant_key,grant_type,quantity,policy_version,metadata)
  values (v_tx.id,p_user_id,'completion:' || v_completion_id,'routine_points',v_quantity,p_policy_version,
    jsonb_build_object('evidenceId',p_evidence_id,'randomEvaluation',case when v_randomness_available then 'evaluated' else 'unavailable' end))
  returning id into v_grant_id;
  insert into public.blundr_repertoire_point_events (id,user_id,source,points,daily_session_id)
  values ('reward-v2:' || v_tx.id::text,p_user_id,p_source,v_points,p_evidence_id);
  insert into public.blundr_xp_events(id,user_id,source,xp,local_date,completion_id,created_at)
  values('reward-v2-xp:' || v_tx.id::text,p_user_id,p_source,v_xp,v_local_date,v_completion_id,now());
  update public.blundr_user_repertoires set opening_unlock_points=opening_unlock_points+v_points,updated_at=now()
    where user_id=p_user_id;
  if v_should_reward and v_bonus_type is not null then
    insert into public.blundr_reward_grants_v2 (transaction_id,user_id,grant_key,grant_type,quantity,policy_version,randomness_key_version,metadata)
    values (v_tx.id,p_user_id,'random:' || v_completion_id,v_bonus_type,1,p_policy_version,p_randomness_key_version,
      jsonb_build_object('hmac',true,'completionId',v_completion_id)) returning id into v_bonus_grant_id;
    insert into public.blundr_reward_inventory_v2(user_id,inventory_kind,quantity,version)
    values(p_user_id,v_bonus_type,1,1)
    on conflict(user_id,inventory_kind) do update set quantity=public.blundr_reward_inventory_v2.quantity+excluded.quantity, version=public.blundr_reward_inventory_v2.version+1;
    insert into public.blundr_reward_inventory_events_v2(transaction_id,user_id,event_key,event_kind,inventory_kind,quantity_delta,policy_version,metadata)
    values(v_tx.id,p_user_id,'grant:' || v_bonus_grant_id,'grant',v_bonus_type,1,p_policy_version,jsonb_build_object('grantId',v_bonus_grant_id));
    v_reward_grants := jsonb_build_array(jsonb_build_object('id',v_bonus_grant_id,'rewardId',v_reward_roll_id || ':' || v_reward_rarity,'rewardRollId',v_reward_roll_id,'rarity',v_reward_rarity,'rewardType',v_bonus_type,'amount',1,'grantMode',v_reward_mode,'createdAt',now()));
  elsif v_should_reward then
    insert into public.blundr_reward_grants_v2(transaction_id,user_id,grant_key,grant_type,quantity,policy_version,randomness_key_version,metadata)
    values(v_tx.id,p_user_id,'random-points:' || v_completion_id,case when v_reward_rarity='epic' then 'epic_points' else 'routine_points' end,v_reward_amount,p_policy_version,p_randomness_key_version,jsonb_build_object('rewardRollId',v_reward_roll_id)) returning id into v_bonus_grant_id;
    insert into public.blundr_repertoire_point_events(id,user_id,source,points,daily_session_id) values('reward-v2-bonus:' || v_bonus_grant_id::text,p_user_id,'reward_bonus',v_reward_amount,p_evidence_id);
    update public.blundr_user_repertoires set opening_unlock_points=opening_unlock_points+v_reward_amount,updated_at=now() where user_id=p_user_id;
    update public.blundr_daily_retention_progress set opening_points_earned=opening_points_earned+v_reward_amount,updated_at=now() where id=v_day.id;
    v_reward_grants := jsonb_build_array(jsonb_build_object('id',v_bonus_grant_id,'rewardId',v_reward_roll_id || ':' || v_reward_rarity,'rewardRollId',v_reward_roll_id,'rarity',v_reward_rarity,'rewardType','unlock_points','amount',v_reward_amount,'grantMode',v_reward_mode,'createdAt',now()));
  end if;
  v_envelope := jsonb_build_object('transactionId',v_tx.id,'grantId',v_grant_id,'grantType','routine_points','quantity',v_quantity,'randomBonusType',v_bonus_type,'rewardGrants',v_reward_grants,'rarity',v_reward_rarity,'amount',v_reward_amount,
    'randomEvaluation',case when v_randomness_available then 'evaluated' else 'unavailable' end);
  insert into public.blundr_reward_presentations_v2(transaction_id,user_id,presentation_key,presentation_kind,priority,envelope,policy_version)
  values(v_tx.id,p_user_id,'completion:' || v_completion_id,'toast',50,v_envelope,p_policy_version);
  return jsonb_build_object('duplicate',false,'transactionId',v_tx.id,'rewardGrants',v_reward_grants,'tempoCacheState',case when v_should_reward then 'applied' else 'closed' end,'randomEvaluation',case when v_randomness_available then 'evaluated' else 'unavailable' end);
end;
$$;

create or replace function public.blundr_spend_inventory_and_unlock_v2(
  p_user_id uuid, p_opening_id text, p_inventory_kind text,
  p_idempotency_key text, p_policy_version text
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare v_tx public.blundr_reward_transactions_v2%rowtype; v_inventory public.blundr_reward_inventory_v2%rowtype; v_cost integer;
begin
  if p_user_id is null or nullif(btrim(p_opening_id),'') is null or p_inventory_kind not in ('opening_fragment','choice_token')
    or nullif(btrim(p_idempotency_key),'') is null or nullif(btrim(p_policy_version),'') is null then raise exception 'invalid_inventory_unlock_request'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 403));
  v_cost := case p_inventory_kind when 'opening_fragment' then 3 else 1 end;
  select * into v_tx from public.blundr_reward_transactions_v2 where user_id=p_user_id and idempotency_key=p_idempotency_key;
  if found then
    if v_tx.policy_version is distinct from p_policy_version or not exists(select 1 from public.blundr_reward_inventory_events_v2 e where e.transaction_id=v_tx.id and e.user_id=p_user_id and e.event_kind='spend' and e.opening_id=p_opening_id and e.inventory_kind=p_inventory_kind and e.quantity_delta=-v_cost) then raise exception 'inventory_idempotency_conflict'; end if;
    return jsonb_build_object('duplicate',true,'transactionId',v_tx.id,'openingId',p_opening_id,'cost',v_cost);
  end if;
  if not exists (select 1 from public.blundr_user_repertoires r where r.user_id=p_user_id and p_opening_id=any(r.locked_opening_ids)) then raise exception 'opening_not_locked'; end if;
  select * into v_inventory from public.blundr_reward_inventory_v2 where user_id=p_user_id and inventory_kind=p_inventory_kind for update;
  if not found or v_inventory.quantity < v_cost then raise exception 'insufficient_inventory'; end if;
  insert into public.blundr_reward_transactions_v2(user_id,idempotency_key,transaction_kind,source,policy_version)
  values(p_user_id,p_idempotency_key,'inventory_unlock','inventory_unlock',p_policy_version) returning * into v_tx;
  update public.blundr_reward_inventory_v2 set quantity=quantity-v_cost,version=version+1 where user_id=p_user_id and inventory_kind=p_inventory_kind and quantity>=v_cost;
  if not found then raise exception 'insufficient_inventory'; end if;
  insert into public.blundr_reward_inventory_events_v2(transaction_id,user_id,event_key,event_kind,inventory_kind,quantity_delta,opening_id,policy_version)
  values(v_tx.id,p_user_id,'spend:' || p_opening_id,'spend',p_inventory_kind,-v_cost,p_opening_id,p_policy_version),
        (v_tx.id,p_user_id,'unlock:' || p_opening_id,'unlock',p_inventory_kind,0,p_opening_id,p_policy_version);
  update public.blundr_user_repertoires set unlocked_opening_ids=array_append(unlocked_opening_ids,p_opening_id),locked_opening_ids=array_remove(locked_opening_ids,p_opening_id),updated_at=now()
    where user_id=p_user_id;
  insert into public.blundr_reward_presentations_v2(transaction_id,user_id,presentation_key,presentation_kind,priority,envelope,policy_version)
  values(v_tx.id,p_user_id,'unlock:' || p_opening_id || ':' || p_idempotency_key,'modal',80,jsonb_build_object('openingId',p_opening_id,'inventoryKind',p_inventory_kind),p_policy_version);
  return jsonb_build_object('duplicate',false,'transactionId',v_tx.id,'openingId',p_opening_id,'cost',v_cost);
end;
$$;

create or replace function public.blundr_claim_reward_presentation_v2(p_user_id uuid,p_claimed_by text,p_lease_seconds integer default 60)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_row public.blundr_reward_presentations_v2%rowtype;
begin
  if p_user_id is null or nullif(btrim(p_claimed_by),'') is null or p_lease_seconds not between 10 and 300 then raise exception 'invalid_reward_presentation_claim'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 404));
  if exists(select 1 from public.blundr_reward_presentations_v2 where user_id=p_user_id and acknowledged_at is null and dismissed_at is null and lease_expires_at >= now()) then return null; end if;
  select * into v_row from public.blundr_reward_presentations_v2 where user_id=p_user_id and acknowledged_at is null and dismissed_at is null and (lease_expires_at is null or lease_expires_at < now()) order by priority desc,created_at for update skip locked limit 1;
  if not found then return null; end if;
  update public.blundr_reward_presentations_v2 set claimed_by=p_claimed_by,claimed_at=now(),lease_expires_at=now()+make_interval(secs=>p_lease_seconds) where id=v_row.id returning * into v_row;
  return jsonb_build_object('id',v_row.id,'envelope',v_row.envelope,'leaseExpiresAt',v_row.lease_expires_at);
end;
$$;

create or replace function public.blundr_mark_reward_presentation_v2(p_user_id uuid,p_presentation_id uuid,p_claimed_by text,p_action text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_row public.blundr_reward_presentations_v2%rowtype;
begin
  if p_user_id is null or p_presentation_id is null or nullif(btrim(p_claimed_by),'') is null or p_action not in ('rendered','acknowledged','dismissed') then raise exception 'invalid_reward_presentation_action'; end if;
  update public.blundr_reward_presentations_v2 set first_rendered_at=case when p_action='rendered' then coalesce(first_rendered_at,now()) else first_rendered_at end, acknowledged_at=case when p_action='acknowledged' then coalesce(acknowledged_at,now()) else acknowledged_at end, dismissed_at=case when p_action='dismissed' then coalesce(dismissed_at,now()) else dismissed_at end,
    claimed_by=case when p_action in ('acknowledged','dismissed') then null else claimed_by end,claimed_at=case when p_action in ('acknowledged','dismissed') then null else claimed_at end,lease_expires_at=case when p_action in ('acknowledged','dismissed') then null else lease_expires_at end
  where id=p_presentation_id and user_id=p_user_id and claimed_by=p_claimed_by and lease_expires_at >= now() returning * into v_row;
  if not found then raise exception 'reward_presentation_lease_not_owned'; end if;
  return jsonb_build_object('id',v_row.id,'action',p_action);
end;
$$;

create or replace function public.blundr_reconcile_reward_inventory_v2(p_user_id uuid)
returns jsonb language sql security definer set search_path=public as $$
  select coalesce(jsonb_agg(jsonb_build_object('inventoryKind',kind,'ledgerQuantity',ledger_quantity,'balanceQuantity',balance_quantity,'matches',ledger_quantity=balance_quantity) order by kind),'[]'::jsonb)
  from (select coalesce(i.inventory_kind,e.inventory_kind) kind,coalesce(sum(e.quantity_delta),0) ledger_quantity,coalesce(max(i.quantity),0) balance_quantity from public.blundr_reward_inventory_v2 i full join public.blundr_reward_inventory_events_v2 e on e.user_id=i.user_id and e.inventory_kind=i.inventory_kind where coalesce(i.user_id,e.user_id)=p_user_id group by coalesce(i.inventory_kind,e.inventory_kind)) rows;
$$;

revoke all on function public.blundr_rewards_v2_hmac_random(text), public.blundr_apply_reward_transaction_v2(uuid,text,text,text,text,text,text), public.blundr_spend_inventory_and_unlock_v2(uuid,text,text,text,text), public.blundr_claim_reward_presentation_v2(uuid,text,integer), public.blundr_mark_reward_presentation_v2(uuid,uuid,text,text), public.blundr_reconcile_reward_inventory_v2(uuid) from public, anon, authenticated;
grant execute on function public.blundr_apply_reward_transaction_v2(uuid,text,text,text,text,text,text), public.blundr_spend_inventory_and_unlock_v2(uuid,text,text,text,text), public.blundr_claim_reward_presentation_v2(uuid,text,integer), public.blundr_mark_reward_presentation_v2(uuid,uuid,text,text), public.blundr_reconcile_reward_inventory_v2(uuid) to service_role;
commit;
