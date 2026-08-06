-- PR-04 follow-up: harden the v3 Daily wrapper without changing the
-- already-applied v2 projector or the original v3 migration.
begin;

alter function public.blundr_commit_daily_action_v3(uuid, text, jsonb)
  rename to blundr_commit_daily_action_v3_inner;

create function public.blundr_commit_daily_action_v3(p_user_id uuid, p_session_id text, p_action jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_cards jsonb; v_card jsonb; v_step jsonb; v_task jsonb; v_event jsonb;
  v_expected text; v_answer text; v_kind text; v_outcome text; v_first boolean;
begin
  if p_user_id is null or nullif(p_session_id, '') is null or p_action is null then
    raise exception using errcode = '22023', message = 'invalid_daily_action_request';
  end if;

  select deck.server_cards into v_cards
    from public.blundr_daily_sessions session
    join public.blundr_daily_decks deck
      on deck.deck_id = session.deck_id and deck.user_id = session.user_id
   where session.session_id = p_session_id and session.user_id = p_user_id;
  if v_cards is null then
    raise exception using errcode = '42501', message = 'daily_session_not_found';
  end if;
  select card into v_card from jsonb_array_elements(v_cards) card
   where card->>'cardFingerprint' = p_action->>'card_fingerprint';
  if v_card is null then
    raise exception using errcode = '22023', message = 'daily_card_not_reserved';
  end if;

  v_task := p_action->'daily_evidence';
  if jsonb_typeof(v_task) is distinct from 'object'
    or v_task->>'taskType' is distinct from v_card->>'activityId' then
    raise exception using errcode = '22023', message = 'daily_task_evidence_required';
  end if;
  if jsonb_typeof(v_card->'privateSteps') = 'array' then
    select step into v_step from jsonb_array_elements(v_card->'privateSteps') step
     where (step->>'stepIndex')::integer = (p_action->>'step_index')::integer;
  else
    v_step := v_card;
  end if;
  v_expected := coalesce(v_step->'acceptedAnswers'->>0, v_step->'acceptedMoves'->>0);
  v_answer := nullif(p_action->>'answer', '');
  v_kind := p_action->>'attempt_kind';
  v_outcome := case
    when v_kind = 'answer' and v_answer = v_expected then 'correct'
    when v_kind = 'answer' then 'incorrect'
    when v_kind = 'reveal' then 'revealed'
    when v_kind = 'retry' then 'skipped'
    else null
  end;
  if v_outcome is null
    or v_task->>'expectedTaskAnswerIdentity' is distinct from v_expected
    or coalesce(v_task->>'submittedAnswerIdentity', '') is distinct from coalesce(v_answer, '')
    or coalesce((v_task->>'correct')::boolean, false) is distinct from (v_outcome = 'correct')
    or p_action->>'outcome' is distinct from v_outcome then
    raise exception using errcode = '22023', message = 'daily_task_evidence_conflict';
  end if;

  -- A Fix-the-Mistake card is allowed only when its private reservation names
  -- a durable, user-owned incorrect learning record for this exact target.
  if v_card->>'activityId' = 'daily_punish_the_mistake' then
    if nullif(v_card->>'mistakeEvidenceId', '') is null or not exists (
      select 1 from public.blundr_learning_events event
       where event.event_id = v_card->>'mistakeEvidenceId'
         and event.user_id = p_user_id
         and coalesce(event.correct, false) = false
         and event.played_move_uci is not null
         and event.position_key = v_card->>'positionKey'
         and event.expected_move_uci = v_expected
    ) then
      raise exception using errcode = '22023', message = 'daily_documented_mistake_required';
    end if;
  end if;

  select not exists(
    select 1 from public.blundr_daily_attempts attempt
     where attempt.user_id = p_user_id and attempt.session_id = p_session_id
       and attempt.step_id = p_action->>'step_id' and attempt.first_attempt
  ) into v_first;
  v_event := p_action->'learning_event';
  if v_first and v_kind in ('answer', 'reveal') then
    if jsonb_typeof(v_event) is distinct from 'object'
      or v_event->>'expected_move_uci' is distinct from coalesce(v_step->'acceptedMoves'->>0, v_expected)
      or coalesce((v_event->>'correct')::boolean, false) is distinct from (v_outcome = 'correct')
      or v_event->'task_evidence' is distinct from v_task
      or (v_card->>'interaction' = 'choice' and v_event->>'played_move_uci' is not null)
      or (v_card->>'interaction' = 'move' and coalesce(v_event->>'played_move_uci', '') is distinct from coalesce(v_answer, '')) then
      raise exception using errcode = '22023', message = 'daily_learning_event_invalid';
    end if;
  elsif jsonb_typeof(v_event) = 'object' then
    raise exception using errcode = '22023', message = 'daily_retry_cannot_reproject';
  end if;

  return public.blundr_commit_daily_action_v3_inner(p_user_id, p_session_id, p_action);
end; $$;

revoke all on function public.blundr_commit_daily_action_v3(uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.blundr_commit_daily_action_v3(uuid, text, jsonb) to service_role;
revoke all on function public.blundr_commit_daily_action_v3_inner(uuid, text, jsonb) from public, anon, authenticated;

commit;
