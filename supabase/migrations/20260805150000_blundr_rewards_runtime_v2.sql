-- PR-03: the only v2 reward writer.  The v2 tables were introduced by PR-01;
-- this migration replaces its deliberately fail-closed RPC shells.
begin;

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
  v_quantity integer;
  v_bonus_type text;
  v_randomness_available boolean := false;
  v_grant_id uuid;
  v_envelope jsonb;
begin
  if p_user_id is null or nullif(btrim(p_completion_id), '') is null
    or p_source not in ('opening_run_completed','continuation_completed','daily_blundr_deck_completed')
    or nullif(btrim(p_evidence_id), '') is null or nullif(btrim(p_idempotency_key), '') is null
    or nullif(btrim(p_policy_version), '') is null then
    raise exception 'invalid_reward_transaction_request';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 403));
  select * into v_tx from public.blundr_reward_transactions_v2
    where user_id = p_user_id and idempotency_key = p_idempotency_key;
  if found then
    return jsonb_build_object('duplicate', true, 'transactionId', v_tx.id,
      'randomEvaluation', case when v_tx.randomness_key_version is null then 'unavailable' else 'evaluated' end);
  end if;
  -- Owned completion evidence is checked before any durable grant is created.
  if p_source = 'daily_blundr_deck_completed' then
    if not exists (select 1 from public.blundr_daily_sessions s where s.user_id=p_user_id
      and s.session_id=p_evidence_id and s.completed_at is not null
      and coalesce(s.state->>'status','')='completed') then
      raise exception 'completion_evidence_unverified';
    end if;
  elsif not exists (select 1 from public.blundr_learning_events e where e.user_id=p_user_id
    and e.session_id=p_evidence_id and e.deleted_at is null and e.taxonomy='move_correct'
    and e.source in ('train','review') and e.occurred_at >= now() - interval '36 hours') then
    raise exception 'completion_evidence_unverified';
  end if;
  if not exists (select 1 from public.blundr_user_profiles where user_id=p_user_id) then
    raise exception 'account_not_ready';
  end if;
  v_points := case p_source when 'opening_run_completed' then 1 when 'continuation_completed' then 2 else 5 end;
  v_quantity := v_points;
  v_random := public.blundr_rewards_v2_hmac_random(p_user_id::text || ':' || p_completion_id || ':' || p_policy_version);
  v_randomness_available := v_random is not null and nullif(btrim(coalesce(p_randomness_key_version,'')), '') is not null;
  if v_randomness_available and v_random < 0.02 then
    v_bonus_type := 'choice_token';
  elsif v_randomness_available and v_random < 0.12 then
    v_bonus_type := 'opening_fragment';
  end if;
  insert into public.blundr_reward_transactions_v2 (user_id,idempotency_key,transaction_kind,completion_id,source,policy_version,randomness_key_version)
  values (p_user_id,p_idempotency_key,'reward_grant',p_completion_id,p_source,p_policy_version,
    case when v_randomness_available then p_randomness_key_version else null end)
  returning * into v_tx;
  insert into public.blundr_reward_grants_v2 (transaction_id,user_id,grant_key,grant_type,quantity,policy_version,metadata)
  values (v_tx.id,p_user_id,'completion:' || p_completion_id,'routine_points',v_quantity,p_policy_version,
    jsonb_build_object('evidenceId',p_evidence_id,'randomEvaluation',case when v_randomness_available then 'evaluated' else 'unavailable' end))
  returning id into v_grant_id;
  insert into public.blundr_repertoire_point_events (id,user_id,source,points,daily_session_id)
  values ('reward-v2:' || v_tx.id::text,p_user_id,p_source,v_points,p_evidence_id);
  update public.blundr_user_repertoires set opening_unlock_points=opening_unlock_points+v_points,updated_at=now()
    where user_id=p_user_id;
  if v_bonus_type is not null then
    insert into public.blundr_reward_grants_v2 (transaction_id,user_id,grant_key,grant_type,quantity,policy_version,randomness_key_version,metadata)
    values (v_tx.id,p_user_id,'random:' || p_completion_id,v_bonus_type,1,p_policy_version,p_randomness_key_version,
      jsonb_build_object('hmac',true,'completionId',p_completion_id));
    insert into public.blundr_reward_inventory_v2(user_id,inventory_kind,quantity,version)
    values(p_user_id,v_bonus_type,1,1)
    on conflict(user_id,inventory_kind) do update set quantity=public.blundr_reward_inventory_v2.quantity+excluded.quantity, version=public.blundr_reward_inventory_v2.version+1;
    insert into public.blundr_reward_inventory_events_v2(transaction_id,user_id,event_key,event_kind,inventory_kind,quantity_delta,policy_version,metadata)
    values(v_tx.id,p_user_id,'grant:' || v_grant_id,'grant',v_bonus_type,1,p_policy_version,jsonb_build_object('grantId',v_grant_id));
  end if;
  v_envelope := jsonb_build_object('transactionId',v_tx.id,'grantId',v_grant_id,'grantType','routine_points','quantity',v_quantity,'randomBonusType',v_bonus_type,
    'randomEvaluation',case when v_randomness_available then 'evaluated' else 'unavailable' end);
  insert into public.blundr_reward_presentations_v2(transaction_id,user_id,presentation_key,presentation_kind,priority,envelope,policy_version)
  values(v_tx.id,p_user_id,'completion:' || p_completion_id,'toast',50,v_envelope,p_policy_version);
  return jsonb_build_object('duplicate',false,'transactionId',v_tx.id,'grantId',v_grant_id,'grantType','routine_points','quantity',v_quantity,'randomBonusType',v_bonus_type,
    'randomEvaluation',case when v_randomness_available then 'evaluated' else 'unavailable' end);
end;
$$;

create or replace function public.blundr_spend_inventory_and_unlock_v2(
  p_user_id uuid, p_opening_id text, p_inventory_kind text,
  p_idempotency_key text, p_policy_version text
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare v_tx public.blundr_reward_transactions_v2%rowtype; v_inventory public.blundr_reward_inventory_v2%rowtype;
begin
  if p_user_id is null or nullif(btrim(p_opening_id),'') is null or p_inventory_kind not in ('opening_fragment','choice_token')
    or nullif(btrim(p_idempotency_key),'') is null or nullif(btrim(p_policy_version),'') is null then raise exception 'invalid_inventory_unlock_request'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 403));
  select * into v_tx from public.blundr_reward_transactions_v2 where user_id=p_user_id and idempotency_key=p_idempotency_key;
  if found then return jsonb_build_object('duplicate',true,'transactionId',v_tx.id,'openingId',p_opening_id); end if;
  if not exists (select 1 from public.blundr_user_repertoires r where r.user_id=p_user_id and p_opening_id=any(r.locked_opening_ids)) then raise exception 'opening_not_locked'; end if;
  select * into v_inventory from public.blundr_reward_inventory_v2 where user_id=p_user_id and inventory_kind=p_inventory_kind for update;
  if not found or v_inventory.quantity < 1 then raise exception 'insufficient_inventory'; end if;
  insert into public.blundr_reward_transactions_v2(user_id,idempotency_key,transaction_kind,source,policy_version)
  values(p_user_id,p_idempotency_key,'inventory_unlock','inventory_unlock',p_policy_version) returning * into v_tx;
  update public.blundr_reward_inventory_v2 set quantity=quantity-1,version=version+1 where user_id=p_user_id and inventory_kind=p_inventory_kind;
  insert into public.blundr_reward_inventory_events_v2(transaction_id,user_id,event_key,event_kind,inventory_kind,quantity_delta,opening_id,policy_version)
  values(v_tx.id,p_user_id,'spend:' || p_opening_id,'spend',p_inventory_kind,-1,p_opening_id,p_policy_version),
        (v_tx.id,p_user_id,'unlock:' || p_opening_id,'unlock',p_inventory_kind,0,p_opening_id,p_policy_version);
  update public.blundr_user_repertoires set unlocked_opening_ids=array_append(unlocked_opening_ids,p_opening_id),locked_opening_ids=array_remove(locked_opening_ids,p_opening_id),updated_at=now()
    where user_id=p_user_id;
  insert into public.blundr_reward_presentations_v2(transaction_id,user_id,presentation_key,presentation_kind,priority,envelope,policy_version)
  values(v_tx.id,p_user_id,'unlock:' || p_opening_id || ':' || p_idempotency_key,'modal',80,jsonb_build_object('openingId',p_opening_id,'inventoryKind',p_inventory_kind),p_policy_version);
  return jsonb_build_object('duplicate',false,'transactionId',v_tx.id,'openingId',p_opening_id);
end;
$$;

create or replace function public.blundr_claim_reward_presentation_v2(p_user_id uuid,p_claimed_by text,p_lease_seconds integer default 60)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_row public.blundr_reward_presentations_v2%rowtype;
begin
  if p_user_id is null or nullif(btrim(p_claimed_by),'') is null or p_lease_seconds not between 10 and 300 then raise exception 'invalid_reward_presentation_claim'; end if;
  select * into v_row from public.blundr_reward_presentations_v2 where user_id=p_user_id and acknowledged_at is null and (lease_expires_at is null or lease_expires_at < now()) order by priority desc,created_at for update skip locked limit 1;
  if not found then return null; end if;
  update public.blundr_reward_presentations_v2 set claimed_by=p_claimed_by,claimed_at=now(),lease_expires_at=now()+make_interval(secs=>p_lease_seconds) where id=v_row.id returning * into v_row;
  return jsonb_build_object('id',v_row.id,'envelope',v_row.envelope,'leaseExpiresAt',v_row.lease_expires_at);
end;
$$;

create or replace function public.blundr_mark_reward_presentation_v2(p_user_id uuid,p_presentation_id uuid,p_claimed_by text,p_action text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_row public.blundr_reward_presentations_v2%rowtype;
begin
  if p_user_id is null or p_presentation_id is null or nullif(btrim(p_claimed_by),'') is null or p_action not in ('rendered','acknowledged') then raise exception 'invalid_reward_presentation_action'; end if;
  update public.blundr_reward_presentations_v2 set first_rendered_at=case when p_action='rendered' then coalesce(first_rendered_at,now()) else first_rendered_at end, acknowledged_at=case when p_action='acknowledged' then coalesce(acknowledged_at,now()) else acknowledged_at end,
    claimed_by=case when p_action='acknowledged' then null else claimed_by end,claimed_at=case when p_action='acknowledged' then null else claimed_at end,lease_expires_at=case when p_action='acknowledged' then null else lease_expires_at end
  where id=p_presentation_id and user_id=p_user_id and claimed_by=p_claimed_by and lease_expires_at >= now() returning * into v_row;
  if not found then raise exception 'reward_presentation_lease_not_owned'; end if;
  return jsonb_build_object('id',v_row.id,'action',p_action);
end;
$$;

revoke all on function public.blundr_rewards_v2_hmac_random(text), public.blundr_apply_reward_transaction_v2(uuid,text,text,text,text,text,text), public.blundr_spend_inventory_and_unlock_v2(uuid,text,text,text,text), public.blundr_claim_reward_presentation_v2(uuid,text,integer), public.blundr_mark_reward_presentation_v2(uuid,uuid,text,text) from public, anon, authenticated;
grant execute on function public.blundr_apply_reward_transaction_v2(uuid,text,text,text,text,text,text), public.blundr_spend_inventory_and_unlock_v2(uuid,text,text,text,text), public.blundr_claim_reward_presentation_v2(uuid,text,integer), public.blundr_mark_reward_presentation_v2(uuid,uuid,text,text) to service_role;
commit;
