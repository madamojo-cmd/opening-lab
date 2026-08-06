-- PR-02 runtime authority. FSRS grades are calculated by the pinned
-- TypeScript projector; this transaction only validates and persists its
-- versioned result with the immutable evidence that produced it.
begin;

alter table public.blundr_learning_events add column if not exists authority_fingerprint text;
alter table public.blundr_learning_events
  add column if not exists answer_evidence jsonb,
  add column if not exists review_rating text,
  add column if not exists review_projection jsonb;
alter table public.blundr_learning_events
  drop constraint if exists blundr_learning_events_review_rating_check;
alter table public.blundr_learning_events
  add constraint blundr_learning_events_review_rating_check
  check (review_rating is null or review_rating in ('again','hard','good','easy'));

create or replace function public.blundr_project_learning_evidence_v2(p_user_id uuid, p_event jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_event_id text := p_event->>'event_id'; v_inserted boolean := false; v_review_version integer; v_mastery_version integer; v_existing jsonb; v_first_recall boolean;
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
  if p_event->>'evidence_kind' = 'recall_attempt' then
    if coalesce(p_event->>'review_rating','') not in ('again','hard','good','easy')
      or p_event#>>'{fsrs,rating}' is distinct from p_event->>'review_rating'
      or jsonb_typeof(p_event->'answer_evidence') is distinct from 'object'
      or coalesce((p_event#>>'{answer_evidence,correct}')::boolean,false) is distinct from coalesce((p_event->>'correct')::boolean,false)
      or p_event#>>'{answer_evidence,expectedAnswerIdentity}' is distinct from p_event->>'expected_move_uci' then
      raise exception using errcode='22023',message='invalid_review_rating';
    end if;
    if not coalesce((p_event->>'correct')::boolean,false)
      and p_event->>'review_rating' <> 'again' then
      raise exception using errcode='22023',message='review_rating_contradicts_evidence';
    end if;
    if p_event->>'review_rating' is distinct from (
      case
        when not coalesce((p_event->>'correct')::boolean,false) then 'again'
        when coalesce((p_event#>>'{answer_evidence,hinted}')::boolean,false)
          or coalesce((p_event#>>'{answer_evidence,elapsedMs}')::integer,0) > 20000 then 'hard'
        when coalesce((p_event#>>'{answer_evidence,priorReps}')::integer,0) >= 8
          and (p_event#>>'{answer_evidence,elapsedMs}') is not null
          and (p_event#>>'{answer_evidence,elapsedMs}')::integer <= 5000 then 'easy'
        else 'good'
      end
    ) then raise exception using errcode='22023',message='review_rating_contradicts_evidence'; end if;
    if p_event#>>'{fsrs,algorithmVersion}' <> 'blundr-fsrs-v1'
      or coalesce((p_event#>>'{fsrs,desiredRetention}')::numeric,0) <> 0.90
      or p_event#>>'{fsrs,dueAt}' is null
      or p_event#>>'{fsrs,card,due}' is distinct from p_event#>>'{fsrs,dueAt}'
      or coalesce((p_event#>>'{fsrs,card,reps}')::integer,0) < 1
      or coalesce((p_event#>>'{fsrs,card,stability}')::numeric,-1) < 0
      or coalesce((p_event#>>'{fsrs,card,difficulty}')::numeric,-1) < 0 then
      raise exception using errcode='22023',message='invalid_fsrs_projection';
    end if;
    if coalesce((p_event#>>'{answer_evidence,revealOccurred}')::boolean,false)
      and (p_event->>'review_rating' <> 'again' or p_event#>>'{answer_evidence,submittedAnswer}' is not null) then
      raise exception using errcode='22023',message='review_rating_contradicts_reveal';
    end if;
    if p_event->>'review_rating' in ('hard','good','easy') and (
      not coalesce((p_event->>'correct')::boolean,false)
      or p_event#>>'{answer_evidence,evidenceType}' <> 'answer'
      or p_event#>>'{answer_evidence,submittedAnswer}' is null
    ) then raise exception using errcode='22023',message='review_rating_requires_answer'; end if;
    if p_event->>'review_rating' = 'easy' and (
      coalesce((p_event#>>'{answer_evidence,hinted}')::boolean,false)
      or coalesce((p_event#>>'{answer_evidence,priorReps}')::integer,0) < 8
      or coalesce((p_event#>>'{answer_evidence,elapsedMs}')::integer,2147483647) > 5000
    ) then raise exception using errcode='22023',message='easy_rating_not_authorized'; end if;
  end if;
  select jsonb_build_object('authority_fingerprint',authority_fingerprint,'review_rating',review_rating,'review_projection',review_projection) into v_existing from public.blundr_learning_events where event_id=v_event_id or (user_id=p_user_id and idempotency_key=p_event->>'idempotency_key') limit 1;
  if v_existing is not null then
    if v_existing->>'authority_fingerprint' = p_event->>'authority_fingerprint' then return jsonb_build_object('status','duplicate','eventId',v_event_id,'reviewRating',v_existing->>'review_rating','reviewProjection',v_existing->'review_projection'); end if;
    raise exception using errcode='23505',message='learning_event_idempotency_conflict';
  end if;
  if p_event->>'evidence_kind' = 'recall_attempt' then
    perform pg_advisory_xact_lock(hashtext(p_user_id::text || ':' || coalesce(p_event->>'exposure_id','')));
    select not exists(select 1 from public.blundr_learning_events where user_id=p_user_id and exposure_id=p_event->>'exposure_id' and evidence_kind='recall_attempt' and first_attempt) into v_first_recall;
    p_event := jsonb_set(p_event,'{first_attempt}',to_jsonb(v_first_recall));
    p_event := jsonb_set(p_event,'{answer_evidence,firstAttempt}',to_jsonb(v_first_recall),true);
    if not v_first_recall then
      p_event := jsonb_set(p_event,'{review_rating}','null'::jsonb);
      p_event := p_event - 'fsrs' - 'mastery';
    else
      select review_state_version into v_review_version
      from public.blundr_review_states
      where user_id=p_user_id and opening_id=p_event->>'opening_id' and play_key=p_event->>'move_order_key'
      for update;
      if coalesce(v_review_version, 0) <> coalesce((p_event->>'expected_review_state_version')::integer, 0) then
        raise exception using errcode='40001',message='learning_review_state_conflict';
      end if;
      select mastery_state_version into v_mastery_version from public.blundr_node_mastery where user_id=p_user_id and position_key=p_event->>'position_key' for update;
      if coalesce(v_mastery_version, 0) <> coalesce((p_event->>'expected_mastery_state_version')::integer, 0) then
        raise exception using errcode='40001',message='learning_mastery_state_conflict';
      end if;
    end if;
  end if;
  select jsonb_build_object('authority_fingerprint',authority_fingerprint,'user_id',user_id,'position_key',position_key,'expected_move_uci',expected_move_uci,'source',source,'exposure_id',exposure_id,'first_attempt',first_attempt) into v_existing from public.blundr_learning_events where event_id=v_event_id or (user_id=p_user_id and idempotency_key=p_event->>'idempotency_key') limit 1;
  if v_existing is not null then
    if v_existing->>'authority_fingerprint' = p_event->>'authority_fingerprint' then return jsonb_build_object('status','duplicate','eventId',v_event_id,'reviewRating',v_existing->>'review_rating','reviewProjection',v_existing->'review_projection'); end if;
    raise exception using errcode='23505',message='learning_event_idempotency_conflict';
  end if;
  insert into public.blundr_learning_events (
    event_id,user_id,idempotency_key,schema_version,session_id,attempt_id,occurred_at,taxonomy,position_key,canonical_fen,opening_id,expected_move_uci,repertoire_side,move_order_key,source,first_attempt,finding,content_version,classifier_version,evidence_kind,exposure_id,played_move_uci,evidence_version,projection_version,projected_at,authority_fingerprint,answer_evidence,review_rating,review_projection
  ) values (
    v_event_id,p_user_id,p_event->>'idempotency_key',p_event->>'schema_version',p_event->>'session_id',p_event->>'attempt_id',(p_event->>'occurred_at')::timestamptz,p_event->>'taxonomy',p_event->>'position_key',p_event->>'canonical_fen',p_event->>'opening_id',p_event->>'expected_move_uci',p_event->>'repertoire_side',p_event->>'move_order_key',p_event->>'source',coalesce((p_event->>'first_attempt')::boolean,false),p_event->'finding',p_event->>'content_version',p_event->>'classifier_version',p_event->>'evidence_kind',nullif(p_event->>'exposure_id',''),p_event->>'played_move_uci',p_event->>'evidence_version','blundr-fsrs-v1',now(),p_event->>'authority_fingerprint',p_event->'answer_evidence',p_event->>'review_rating',p_event->'fsrs'
  ) on conflict do nothing returning true into v_inserted;
  if not coalesce(v_inserted,false) then
    select jsonb_build_object('authority_fingerprint',authority_fingerprint,'review_rating',review_rating,'review_projection',review_projection) into v_existing from public.blundr_learning_events where event_id=v_event_id or (user_id=p_user_id and idempotency_key=p_event->>'idempotency_key') limit 1;
    if v_existing->>'authority_fingerprint' = p_event->>'authority_fingerprint' then return jsonb_build_object('status','duplicate','eventId',v_event_id,'reviewRating',v_existing->>'review_rating','reviewProjection',v_existing->'review_projection'); end if;
    raise exception using errcode='23505',message='learning_event_idempotency_conflict';
  end if;
  if p_event->>'evidence_kind' <> 'recall_attempt' or not v_first_recall then return jsonb_build_object('status','inserted','eventId',v_event_id,'projected',false); end if;
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
  return jsonb_build_object('status','inserted','eventId',v_event_id,'reviewRating',p_event->>'review_rating','reviewProjection',p_event->'fsrs','dueAt',p_event#>>'{fsrs,dueAt}','reviewStateVersion',coalesce(v_review_version,0)+1,'masteryStateVersion',coalesce(v_mastery_version,0)+1);
end; $$;

-- A one-winner date reservation: the unique deck identity is the concurrency
-- control; no client-provided answer is accepted here.
create or replace function public.blundr_reserve_daily_v2(p_user_id uuid, p_local_date date, p_reservation jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_deck text := p_reservation->>'deck_id'; v_session text := p_reservation->>'session_id'; v_existing text; v_existing_fingerprint text;
begin
  if p_user_id is null or p_local_date is null or p_reservation is null or v_deck is null or v_session is null then raise exception using errcode='22023',message='invalid_daily_reservation_request'; end if;
  insert into public.blundr_daily_decks (deck_id,user_id,local_date,deck_fingerprint,public_cards,server_cards,content_version,composer_version,runtime_package_id,profile_version,access_policy_id,access_policy_version,time_zone,reservation_state,reserved_at)
  values (v_deck,p_user_id,p_local_date,p_reservation->>'deck_fingerprint',p_reservation->'public_cards',p_reservation->'server_cards',p_reservation->>'content_version',p_reservation->>'composer_version',p_reservation->>'runtime_package_id',p_reservation->>'profile_version',p_reservation->>'access_policy_id',p_reservation->>'access_policy_version',p_reservation->>'time_zone','active',now()) on conflict (user_id,local_date) do nothing;
  select deck_id,deck_fingerprint into v_existing,v_existing_fingerprint from public.blundr_daily_decks where user_id=p_user_id and local_date=p_local_date;
  if v_existing <> v_deck then raise exception using errcode='23505',message='daily_reservation_conflict'; end if;
  if v_existing_fingerprint <> p_reservation->>'deck_fingerprint' then raise exception using errcode='23505',message='daily_reservation_payload_conflict'; end if;
  if exists(select 1 from public.blundr_daily_sessions where session_id=v_session and (deck_id<>v_deck or user_id<>p_user_id)) then raise exception using errcode='23505',message='daily_session_reservation_conflict'; end if;
  insert into public.blundr_daily_sessions (session_id,deck_id,user_id,state,state_version,reservation_generation) values (v_session,v_deck,p_user_id,p_reservation->'state',1,1) on conflict (session_id) do nothing;
  return jsonb_build_object('status','inserted','deckId',v_deck,'sessionId',v_session);
end; $$;

-- Actions are first-writer-wins by (user,session,action_id); answers are
-- persisted only after the server has evaluated the private reservation.
create or replace function public.blundr_commit_daily_action_v2(p_user_id uuid, p_session_id text, p_action jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_version int; v_current_state jsonb; v_next jsonb; v_projection jsonb; v_completion_id text; v_cards jsonb; v_card jsonb; v_prior record; v_first boolean; v_total integer; v_completed integer; v_completed_at timestamptz; v_step_index integer; v_expected_step integer; v_step_count integer;
begin
  if p_user_id is null or p_session_id is null or p_action is null or nullif(p_action->>'action_id','') is null then raise exception using errcode='22023',message='invalid_daily_action_request'; end if;
  select state_version,state into v_version,v_current_state from public.blundr_daily_sessions where session_id=p_session_id and user_id=p_user_id for update;
  if v_version is null then raise exception using errcode='42501',message='daily_session_not_found'; end if;
  select deck.server_cards into v_cards from public.blundr_daily_sessions session join public.blundr_daily_decks deck on deck.deck_id=session.deck_id and deck.user_id=session.user_id where session.session_id=p_session_id and session.user_id=p_user_id;
  select card into v_card from jsonb_array_elements(v_cards) card where card->>'cardFingerprint'=p_action->>'card_fingerprint';
  if v_card is null then raise exception using errcode='22023',message='daily_card_not_reserved'; end if;
  select attempt_id,card_fingerprint,step_id,attempt_kind,outcome,answer,learning_exposure_id into v_prior from public.blundr_daily_attempts where user_id=p_user_id and session_id=p_session_id and action_id=p_action->>'action_id';
  if found then
    select completed_at into v_completed_at from public.blundr_daily_sessions where session_id=p_session_id and user_id=p_user_id;
    if v_prior.card_fingerprint=p_action->>'card_fingerprint' and v_prior.step_id=p_action->>'step_id' and v_prior.attempt_kind=p_action->>'attempt_kind' and v_prior.outcome=p_action->>'outcome' and coalesce(v_prior.answer,'null'::jsonb)=coalesce(p_action->'answer','null'::jsonb) and coalesce(v_prior.learning_exposure_id,'')=coalesce(p_action->>'learning_exposure_id','') then return jsonb_build_object('status','duplicate','version',v_version,'completionId',case when v_completed_at is null then null else 'daily-completion:' || p_session_id end); end if;
    raise exception using errcode='23505',message='daily_action_idempotency_conflict';
  end if;
  begin v_step_index := (p_action->>'step_index')::integer; exception when others then raise exception using errcode='22023',message='daily_step_not_reserved'; end;
  v_expected_step := coalesce((v_current_state #>> array['activityProgress',p_action->>'card_fingerprint','stepIndex'])::integer,0);
  v_step_count := case when jsonb_typeof(v_card->'privateSteps')='array' then jsonb_array_length(v_card->'privateSteps') else 1 end;
  if v_step_index <> v_expected_step or v_step_index < 0 or v_step_index >= v_step_count or p_action->>'step_id' <> (p_action->>'card_fingerprint' || ':' || v_step_index::text) then raise exception using errcode='22023',message='daily_step_not_reserved'; end if;
  if v_version <> (p_action->>'expected_version')::int then raise exception using errcode='40001',message='daily_session_conflict'; end if;
  select not exists(select 1 from public.blundr_daily_attempts where user_id=p_user_id and session_id=p_session_id and step_id=p_action->>'step_id' and first_attempt) into v_first;
  insert into public.blundr_daily_attempts (attempt_id,session_id,user_id,card_fingerprint,first_attempt,attempt_kind,outcome,answer,action_id,step_id,session_state_version,learning_exposure_id) values (p_action->>'attempt_id',p_session_id,p_user_id,p_action->>'card_fingerprint',v_first,p_action->>'attempt_kind',p_action->>'outcome',p_action->'answer',p_action->>'action_id',p_action->>'step_id',v_version,case when v_first then p_action->>'learning_exposure_id' else null end);
  v_next := p_action->'next_state';
  update public.blundr_daily_sessions set state=jsonb_set(v_next,'{status}','"in_progress"'::jsonb,true),state_version=v_version+1,updated_at=now() where session_id=p_session_id and user_id=p_user_id;
  -- The caller supplies only an evidence payload built from the private,
  -- owned reservation. This nested function call shares this transaction: an
  -- invalid projection rolls back the attempt and session-version update.
  if p_action ? 'learning_event' and p_action->'learning_event' is not null then
    v_projection := public.blundr_project_learning_evidence_v2(p_user_id, p_action->'learning_event');
  end if;
  select jsonb_array_length(v_cards) into v_total;
  select count(*) into v_completed from jsonb_array_elements(v_cards) card where exists(select 1 from public.blundr_daily_attempts attempt where attempt.user_id=p_user_id and attempt.session_id=p_session_id and attempt.card_fingerprint=card->>'cardFingerprint' and attempt.outcome='correct' and attempt.step_id=(card->>'cardFingerprint' || ':' || (case when jsonb_typeof(card->'privateSteps')='array' then jsonb_array_length(card->'privateSteps')-1 else 0 end)::text));
  if v_completed >= v_total then
    update public.blundr_daily_sessions set completed_at=coalesce(completed_at,now()),state=jsonb_set(state,'{status}','"completed"'::jsonb,true) where session_id=p_session_id and user_id=p_user_id;
    v_completion_id := 'daily-completion:' || p_session_id;
  end if;
  return jsonb_build_object('status','inserted','version',v_version+1,'completionId',v_completion_id,'projection',v_projection);
end; $$;

revoke all on function public.blundr_project_learning_evidence_v2(uuid,jsonb), public.blundr_reserve_daily_v2(uuid,date,jsonb), public.blundr_commit_daily_action_v2(uuid,text,jsonb) from public, anon, authenticated;
grant execute on function public.blundr_project_learning_evidence_v2(uuid,jsonb), public.blundr_reserve_daily_v2(uuid,date,jsonb), public.blundr_commit_daily_action_v2(uuid,text,jsonb) to service_role;
commit;
