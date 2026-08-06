-- PR-04 Review is a private reservation: no browser-provided answer, SRS
-- coordinate, or projection reaches the database.
begin;

create table if not exists public.blundr_review_attempts (
  attempt_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  review_item_id text not null,
  opening_id text not null, play_key text not null,
  review_state_version integer not null,
  expected_move_uci text not null, prior_reps integer not null default 0,
  state text not null default 'awaiting_answer' check (state in ('awaiting_answer','awaiting_rating','rated')),
  started_at timestamptz not null default now(), answered_at timestamptz,
  actual_move_uci text, reveal_occurred boolean not null default false,
  prior_failure boolean not null default false, correct boolean,
  rated_at timestamptz, rating text check (rating is null or rating in ('again','hard','good','easy')),
  rating_idempotency_id text, projection_event jsonb,
  unique (user_id, review_item_id, review_state_version),
  unique (user_id, rating_idempotency_id)
);
alter table public.blundr_review_attempts enable row level security;
revoke all on public.blundr_review_attempts from public, anon, authenticated;

create or replace function public.blundr_project_learning_evidence_v3(p_user_id uuid, p_event jsonb)
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
    if p_event->>'source' <> 'review'
      or p_event#>>'{answer_evidence,ratingRequested}' <> 'true' then
      raise exception using errcode='22023',message='review_v3_requires_reserved_rating_evidence';
    end if;
    if coalesce((p_event->>'correct')::boolean,false)
      and p_event->>'review_rating' = 'again' then
      raise exception using errcode='22023',message='review_rating_contradicts_evidence';
    end if;
    if p_event->>'review_rating' in ('hard','good','easy') and (
      not coalesce((p_event->>'correct')::boolean,false)
      or coalesce((p_event#>>'{answer_evidence,revealOccurred}')::boolean,false)
      or coalesce((p_event#>>'{answer_evidence,retry}')::boolean,false)
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

create or replace function public.blundr_reserve_review_attempt_v1(p_user_id uuid, p_reservation jsonb)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare v_attempt public.blundr_review_attempts%rowtype;
begin
  if p_user_id is null or p_reservation is null or nullif(p_reservation->>'attempt_id','') is null
    or nullif(p_reservation->>'review_item_id','') is null or nullif(p_reservation->>'expected_move_uci','') is null then
    raise exception using errcode='22023',message='invalid_review_reservation'; end if;
  insert into public.blundr_review_attempts(attempt_id,user_id,review_item_id,opening_id,play_key,review_state_version,expected_move_uci,prior_reps)
  values(p_reservation->>'attempt_id',p_user_id,p_reservation->>'review_item_id',p_reservation->>'opening_id',p_reservation->>'play_key',(p_reservation->>'review_state_version')::integer,p_reservation->>'expected_move_uci',coalesce((p_reservation->>'prior_reps')::integer,0))
  on conflict (user_id,review_item_id,review_state_version) do nothing;
  select * into v_attempt from public.blundr_review_attempts where user_id=p_user_id and review_item_id=p_reservation->>'review_item_id' and review_state_version=(p_reservation->>'review_state_version')::integer;
  if v_attempt.attempt_id <> p_reservation->>'attempt_id' or v_attempt.opening_id <> p_reservation->>'opening_id' or v_attempt.play_key <> p_reservation->>'play_key' then
    raise exception using errcode='23505',message='review_reservation_conflict'; end if;
  return jsonb_build_object('attemptId',v_attempt.attempt_id,'state',v_attempt.state,'startedAt',v_attempt.started_at,'priorReps',v_attempt.prior_reps);
end; $$;

-- `p_event` is constructed only by the server from this locked reservation.
create or replace function public.blundr_commit_review_attempt_v1(p_user_id uuid,p_item_id text,p_attempt_id text,p_played_move_uci text,p_reveal boolean,p_event jsonb)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare v public.blundr_review_attempts%rowtype; v_projected jsonb; v_correct boolean;
begin
  if p_user_id is null or nullif(p_item_id,'') is null or nullif(p_attempt_id,'') is null or (coalesce(p_reveal,false) = (nullif(p_played_move_uci,'') is null)) then raise exception using errcode='22023',message='invalid_review_attempt'; end if;
  select * into v from public.blundr_review_attempts where user_id=p_user_id and review_item_id=p_item_id and attempt_id=p_attempt_id for update;
  if not found then raise exception using errcode='42501',message='review_item_not_reserved'; end if;
  if v.state <> 'awaiting_answer' then
    if coalesce(v.actual_move_uci,'')=coalesce(p_played_move_uci,'') and v.reveal_occurred=coalesce(p_reveal,false) then return jsonb_build_object('status','duplicate','attemptId',v.attempt_id,'state',v.state,'allowedRatings',case when v.state='awaiting_rating' and v.prior_reps>=8 and extract(epoch from now()-v.started_at)*1000<=5000 then jsonb_build_array('hard','good','easy') when v.state='awaiting_rating' then jsonb_build_array('hard','good') else '[]'::jsonb end); end if;
    raise exception using errcode='23505',message='review_attempt_idempotency_conflict'; end if;
  if not exists(select 1 from public.blundr_review_states s where s.user_id=p_user_id and s.opening_id=v.opening_id and s.play_key=v.play_key and s.review_state_version=v.review_state_version and s.due_at<=now()) then raise exception using errcode='40001',message='review_reservation_stale'; end if;
  v_correct := not coalesce(p_reveal,false) and p_played_move_uci=v.expected_move_uci;
  if v_correct then
    update public.blundr_review_attempts set actual_move_uci=p_played_move_uci,correct=true,answered_at=now(),state='awaiting_rating' where attempt_id=v.attempt_id;
    return jsonb_build_object('status','inserted','attemptId',v.attempt_id,'state','awaiting_rating','allowedRatings',case when v.prior_reps>=8 and extract(epoch from now()-v.started_at)*1000<=5000 then jsonb_build_array('hard','good','easy') else jsonb_build_array('hard','good') end);
  end if;
  if p_event is null
    or p_event->>'source' <> 'review'
    or p_event#>>'{answer_evidence,ratingRequested}' <> 'true'
    or p_event->>'review_rating' <> 'again'
    or coalesce((p_event->>'correct')::boolean,true)
    or p_event->>'opening_id' <> v.opening_id
    or p_event->>'move_order_key' <> v.play_key
    or p_event->>'attempt_id' <> v.attempt_id
    or p_event->>'session_id' <> v.attempt_id
    or p_event->>'expected_move_uci' <> v.expected_move_uci
    or coalesce(p_event->>'played_move_uci','') <> coalesce(p_played_move_uci,'')
    or (p_event->>'expected_review_state_version')::integer <> v.review_state_version
    or coalesce((p_event#>>'{answer_evidence,revealOccurred}')::boolean,false) <> coalesce(p_reveal,false)
  then raise exception using errcode='22023',message='invalid_review_projection'; end if;
  v_projected:=public.blundr_project_learning_evidence_v3(p_user_id,p_event);
  update public.blundr_review_attempts set actual_move_uci=p_played_move_uci,reveal_occurred=coalesce(p_reveal,false),prior_failure=true,correct=false,answered_at=now(),state='rated',rating='again',rated_at=now(),projection_event=p_event where attempt_id=v.attempt_id;
  return jsonb_build_object('status','inserted','attemptId',v.attempt_id,'state','rated','rating','again','projection',v_projected);
end; $$;

create or replace function public.blundr_commit_review_rating_v1(p_user_id uuid,p_item_id text,p_attempt_id text,p_rating text,p_idempotency_id text,p_event jsonb)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare v public.blundr_review_attempts%rowtype; v_projected jsonb; v_elapsed integer;
begin
  if p_user_id is null or nullif(p_idempotency_id,'') is null or p_rating not in ('again','hard','good','easy') then raise exception using errcode='22023',message='invalid_review_rating'; end if;
  select * into v from public.blundr_review_attempts where user_id=p_user_id and review_item_id=p_item_id and attempt_id=p_attempt_id for update;
  if not found then raise exception using errcode='42501',message='review_attempt_not_found'; end if;
  if v.state='rated' then if v.rating_idempotency_id=p_idempotency_id and v.rating=p_rating then return jsonb_build_object('status','duplicate','attemptId',v.attempt_id,'rating',v.rating,'projection',v.projection_event); end if; raise exception using errcode='23505',message='review_rating_idempotency_conflict'; end if;
  if v.state <> 'awaiting_rating' or not v.correct or v.reveal_occurred or v.prior_failure then raise exception using errcode='22023',message='review_rating_contradicts_evidence'; end if;
  v_elapsed:=floor(extract(epoch from now()-v.started_at)*1000);
  if p_rating='easy' and (v.prior_reps<8 or v_elapsed>5000) then raise exception using errcode='22023',message='easy_rating_not_authorized'; end if;
  if p_event is null or p_event->>'source' <> 'review'
    or p_event#>>'{answer_evidence,ratingRequested}' <> 'true'
    or p_event->>'review_rating' <> p_rating
    or p_event->>'opening_id' <> v.opening_id
    or p_event->>'move_order_key' <> v.play_key
    or p_event->>'attempt_id' <> v.attempt_id
    or p_event->>'session_id' <> v.attempt_id
    or p_event->>'expected_move_uci' <> v.expected_move_uci
    or p_event->>'played_move_uci' <> v.actual_move_uci
    or not coalesce((p_event->>'correct')::boolean,false)
    or coalesce((p_event#>>'{answer_evidence,revealOccurred}')::boolean,false)
    or coalesce((p_event#>>'{answer_evidence,retry}')::boolean,false)
    or (p_event->>'expected_review_state_version')::integer <> v.review_state_version
  then raise exception using errcode='22023',message='invalid_review_projection'; end if;
  v_projected:=public.blundr_project_learning_evidence_v3(p_user_id,p_event);
  update public.blundr_review_attempts set state='rated',rating=p_rating,rating_idempotency_id=p_idempotency_id,rated_at=now(),projection_event=p_event where attempt_id=v.attempt_id;
  return jsonb_build_object('status','inserted','attemptId',v.attempt_id,'rating',p_rating,'projection',v_projected);
end; $$;

revoke all on function public.blundr_project_learning_evidence_v3(uuid,jsonb),public.blundr_reserve_review_attempt_v1(uuid,jsonb),public.blundr_commit_review_attempt_v1(uuid,text,text,text,boolean,jsonb),public.blundr_commit_review_rating_v1(uuid,text,text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.blundr_reserve_review_attempt_v1(uuid,jsonb),public.blundr_commit_review_attempt_v1(uuid,text,text,text,boolean,jsonb),public.blundr_commit_review_rating_v1(uuid,text,text,text,text,jsonb) to service_role;
commit;
