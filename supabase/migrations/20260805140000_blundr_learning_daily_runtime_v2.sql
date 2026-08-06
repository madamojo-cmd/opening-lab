-- PR-02 runtime authority. FSRS grades are calculated by the pinned
-- TypeScript projector; this transaction only validates and persists its
-- versioned result with the immutable evidence that produced it.
begin;

create or replace function public.blundr_project_learning_evidence_v2(p_user_id uuid, p_event jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_event_id text := p_event->>'event_id'; v_inserted boolean := false;
begin
  if p_user_id is null or p_event is null or v_event_id is null
    or p_event->>'user_id' <> p_user_id::text then
    raise exception using errcode = '22023', message = 'invalid_learning_projection_request';
  end if;
  if p_event->>'evidence_kind' not in ('recall_attempt','imported_observation','system_observation') then
    raise exception using errcode = '22023', message = 'invalid_learning_evidence_kind';
  end if;
  if p_event->>'source' = 'imported_game' and (p_event->>'evidence_kind' <> 'imported_observation' or coalesce((p_event->>'first_attempt')::boolean, true)) then
    raise exception using errcode = '22023', message = 'imported_observation_cannot_be_recall';
  end if;
  if p_event->>'evidence_kind' = 'recall_attempt' and coalesce((p_event->>'first_attempt')::boolean, false) and nullif(p_event->>'exposure_id','') is null then
    raise exception using errcode = '22023', message = 'first_recall_requires_exposure';
  end if;
  insert into public.blundr_learning_events (
    event_id,user_id,idempotency_key,schema_version,session_id,attempt_id,occurred_at,taxonomy,position_key,canonical_fen,opening_id,expected_move_uci,repertoire_side,move_order_key,source,first_attempt,finding,content_version,classifier_version,evidence_kind,exposure_id,played_move_uci,evidence_version,projection_version,projected_at
  ) values (
    v_event_id,p_user_id,p_event->>'idempotency_key',p_event->>'schema_version',p_event->>'session_id',p_event->>'attempt_id',(p_event->>'occurred_at')::timestamptz,p_event->>'taxonomy',p_event->>'position_key',p_event->>'canonical_fen',p_event->>'opening_id',p_event->>'expected_move_uci',p_event->>'repertoire_side',p_event->>'move_order_key',p_event->>'source',coalesce((p_event->>'first_attempt')::boolean,false),p_event->'finding',p_event->>'content_version',p_event->>'classifier_version',p_event->>'evidence_kind',nullif(p_event->>'exposure_id',''),p_event->>'played_move_uci',p_event->>'evidence_version','blundr-fsrs-v1',now()
  ) on conflict do nothing returning true into v_inserted;
  if not coalesce(v_inserted,false) then return jsonb_build_object('status','duplicate','eventId',v_event_id); end if;
  if p_event->>'evidence_kind' <> 'recall_attempt' then return jsonb_build_object('status','inserted','eventId',v_event_id); end if;
  insert into public.blundr_review_states (user_id,opening_id,play_key,due_at,srs_state,last_attempt_id,last_outcome,fsrs_algorithm_version,fsrs_state_version,fsrs_desired_retention,review_state_version,last_recall_event_id,updated_at)
  values (p_user_id,p_event->>'opening_id',p_event->>'move_order_key',(p_event#>>'{fsrs,dueAt}')::timestamptz,p_event#>'{fsrs,card}',p_event->>'attempt_id',p_event#>>'{fsrs,rating}','blundr-fsrs-v1',1,0.90,1,v_event_id,now())
  on conflict (user_id,opening_id,play_key) do update set due_at=excluded.due_at,srs_state=excluded.srs_state,last_attempt_id=excluded.last_attempt_id,last_outcome=excluded.last_outcome,fsrs_algorithm_version=excluded.fsrs_algorithm_version,fsrs_state_version=blundr_review_states.fsrs_state_version+1,fsrs_desired_retention=excluded.fsrs_desired_retention,review_state_version=blundr_review_states.review_state_version+1,last_recall_event_id=excluded.last_recall_event_id,updated_at=excluded.updated_at;
  insert into public.blundr_node_mastery (user_id,position_key,opening_id,play_key,attempts,first_attempt_at,first_attempt_result,confidence,access_decision,updated_at,mastery_state,mastery_state_version,recall_attempt_count,correct_recall_count,lapse_count,last_recall_event_id,next_due_at)
  values (p_user_id,p_event->>'position_key',p_event->>'opening_id',p_event->>'move_order_key',(p_event#>>'{mastery,recallAttemptCount}')::int,(p_event->>'occurred_at')::timestamptz,case when (p_event->>'correct')::boolean then 'correct' else 'incorrect' end,case when (p_event->>'correct')::boolean then .6 else .2 end,p_event->>'access_decision',now(),p_event#>>'{mastery,state}',1,(p_event#>>'{mastery,recallAttemptCount}')::int,(p_event#>>'{mastery,correctRecallCount}')::int,(p_event#>>'{mastery,lapseCount}')::int,v_event_id,(p_event#>>'{fsrs,dueAt}')::timestamptz)
  on conflict (user_id,position_key) do update set attempts=excluded.attempts,confidence=excluded.confidence,updated_at=excluded.updated_at,mastery_state=excluded.mastery_state,mastery_state_version=blundr_node_mastery.mastery_state_version+1,recall_attempt_count=excluded.recall_attempt_count,correct_recall_count=excluded.correct_recall_count,lapse_count=excluded.lapse_count,last_recall_event_id=excluded.last_recall_event_id,next_due_at=excluded.next_due_at;
  if not (p_event->>'correct')::boolean then
    insert into public.blundr_weakness_projection (user_id,position_key,opening_id,play_key,category,score,confidence,explanation,recommended_daily_intervention,access_decision,source_event_ids,updated_at,lifecycle_state,lifecycle_version,first_evidence_at,last_evidence_at,evidence_count,lapse_count,last_recall_event_id)
    values (p_user_id,p_event->>'position_key',p_event->>'opening_id',p_event->>'move_order_key','opening_move',.7,.65,coalesce(p_event#>>'{finding,explanation}','The approved move was missed.'),'recall_move',p_event->>'access_decision',array[v_event_id],now(),'active',1,now(),now(),1,1,v_event_id)
    on conflict (user_id,position_key,category) do update set score=greatest(blundr_weakness_projection.score,excluded.score),source_event_ids=array_append(blundr_weakness_projection.source_event_ids,v_event_id),updated_at=excluded.updated_at,lifecycle_state='active',lifecycle_version=blundr_weakness_projection.lifecycle_version+1,last_evidence_at=excluded.last_evidence_at,evidence_count=blundr_weakness_projection.evidence_count+1,lapse_count=blundr_weakness_projection.lapse_count+1,last_recall_event_id=v_event_id;
  end if;
  return jsonb_build_object('status','inserted','eventId',v_event_id);
end; $$;

-- A one-winner date reservation: the unique deck identity is the concurrency
-- control; no client-provided answer is accepted here.
create or replace function public.blundr_reserve_daily_v2(p_user_id uuid, p_local_date date, p_reservation jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_deck text := p_reservation->>'deck_id'; v_session text := p_reservation->>'session_id'; v_existing text;
begin
  if p_user_id is null or p_local_date is null or p_reservation is null or v_deck is null or v_session is null then raise exception using errcode='22023',message='invalid_daily_reservation_request'; end if;
  insert into public.blundr_daily_decks (deck_id,user_id,local_date,deck_fingerprint,public_cards,server_cards,content_version,composer_version,runtime_package_id,profile_version,access_policy_id,access_policy_version,time_zone,reservation_state,reserved_at)
  values (v_deck,p_user_id,p_local_date,p_reservation->>'deck_fingerprint',p_reservation->'public_cards',p_reservation->'server_cards',p_reservation->>'content_version',p_reservation->>'composer_version',p_reservation->>'runtime_package_id',p_reservation->>'profile_version',p_reservation->>'access_policy_id',p_reservation->>'access_policy_version',p_reservation->>'time_zone','reserved',now()) on conflict (user_id,local_date) do nothing;
  select deck_id into v_existing from public.blundr_daily_decks where user_id=p_user_id and local_date=p_local_date;
  if v_existing <> v_deck then return jsonb_build_object('status','duplicate','deckId',v_existing); end if;
  insert into public.blundr_daily_sessions (session_id,deck_id,user_id,state,state_version,reservation_generation) values (v_session,v_deck,p_user_id,p_reservation->'state',1,1) on conflict (session_id) do nothing;
  return jsonb_build_object('status','inserted','deckId',v_deck,'sessionId',v_session);
end; $$;

-- Actions are first-writer-wins by (user,session,action_id); answers are
-- persisted only after the server has evaluated the private reservation.
create or replace function public.blundr_commit_daily_action_v2(p_user_id uuid, p_session_id text, p_action jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_version int; v_next jsonb; v_projection jsonb; v_completion_id text;
begin
  if p_user_id is null or p_session_id is null or p_action is null or nullif(p_action->>'action_id','') is null then raise exception using errcode='22023',message='invalid_daily_action_request'; end if;
  select state_version into v_version from public.blundr_daily_sessions where session_id=p_session_id and user_id=p_user_id for update;
  if v_version is null then raise exception using errcode='42501',message='daily_session_not_found'; end if;
  if exists(select 1 from public.blundr_daily_attempts where user_id=p_user_id and session_id=p_session_id and action_id=p_action->>'action_id') then return jsonb_build_object('status','duplicate','version',v_version); end if;
  if v_version <> (p_action->>'expected_version')::int then raise exception using errcode='40001',message='daily_session_conflict'; end if;
  insert into public.blundr_daily_attempts (attempt_id,session_id,user_id,card_fingerprint,first_attempt,attempt_kind,outcome,answer,action_id,step_id,action_version,learning_exposure_id) values (p_action->>'attempt_id',p_session_id,p_user_id,p_action->>'card_fingerprint',coalesce((p_action->>'first_attempt')::boolean,false),p_action->>'attempt_kind',p_action->>'outcome',p_action->'answer',p_action->>'action_id',p_action->>'step_id',1,p_action->>'learning_exposure_id');
  v_next := p_action->'next_state';
  update public.blundr_daily_sessions set state=v_next,state_version=v_version+1,updated_at=now(),completed_at=case when p_action->>'completed_at' is null then completed_at else (p_action->>'completed_at')::timestamptz end where session_id=p_session_id and user_id=p_user_id;
  -- The caller supplies only an evidence payload built from the private,
  -- owned reservation. This nested function call shares this transaction: an
  -- invalid projection rolls back the attempt and session-version update.
  if p_action ? 'learning_event' and p_action->'learning_event' is not null then
    v_projection := public.blundr_project_learning_evidence_v2(p_user_id, p_action->'learning_event');
  end if;
  v_completion_id := 'daily-completion:' || p_session_id || ':' || (p_action->>'card_fingerprint');
  return jsonb_build_object('status','inserted','version',v_version+1,'completionId',v_completion_id,'projection',v_projection);
end; $$;

revoke all on function public.blundr_project_learning_evidence_v2(uuid,jsonb), public.blundr_reserve_daily_v2(uuid,date,jsonb), public.blundr_commit_daily_action_v2(uuid,text,jsonb) from public, anon, authenticated;
grant execute on function public.blundr_project_learning_evidence_v2(uuid,jsonb), public.blundr_reserve_daily_v2(uuid,date,jsonb), public.blundr_commit_daily_action_v2(uuid,text,jsonb) to service_role;
commit;
