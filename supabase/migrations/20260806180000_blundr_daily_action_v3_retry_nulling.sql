-- PR-04 follow-up: ensure retry actions are forwarded without any learning
-- projection evidence so the inner Daily helper cannot treat them as
-- reprojections.
begin;

create or replace function public.blundr_commit_daily_action_v3(p_user_id uuid, p_session_id text, p_action jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_cards jsonb;
  v_card jsonb;
  v_step jsonb;
  v_task jsonb;
  v_event jsonb;
  v_action jsonb;
  v_expected text;
  v_answer text;
  v_kind text;
  v_outcome text;
  v_first boolean;
begin
  if p_user_id is null or nullif(btrim(p_session_id), '') is null or p_action is null then
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

  select card into v_card
    from jsonb_array_elements(v_cards) card
   where card->>'cardFingerprint' = p_action->>'card_fingerprint';
  if v_card is null then
    raise exception using errcode = '22023', message = 'daily_card_not_reserved';
  end if;

  v_action := p_action;
  v_task := v_action->'daily_evidence';
  if jsonb_typeof(v_task) = 'string' then
    begin
      v_task := (v_task #>> '{}')::jsonb;
    exception when others then
      raise exception using errcode = '22023', message = 'daily_task_evidence_required';
    end;
    v_action := jsonb_set(v_action, '{daily_evidence}', v_task, false);
  end if;
  if jsonb_typeof(v_task) is distinct from 'object'
    or v_task->>'taskType' is distinct from v_card->>'activityId' then
    raise exception using errcode = '22023', message = 'daily_task_evidence_required';
  end if;

  if jsonb_typeof(v_card->'privateSteps') = 'array' then
    select step into v_step
      from jsonb_array_elements(v_card->'privateSteps') step
     where (step->>'stepIndex')::integer = (v_action->>'step_index')::integer;
  else
    v_step := v_card;
  end if;

  v_expected := coalesce(v_step->'acceptedAnswers'->>0, v_step->'acceptedMoves'->>0);
  v_answer := nullif(v_action->>'answer', '');
  v_kind := v_action->>'attempt_kind';
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
    or v_action->>'outcome' is distinct from v_outcome then
    raise exception using errcode = '22023', message = 'daily_task_evidence_conflict';
  end if;

  v_event := v_action->'learning_event';
  if jsonb_typeof(v_event) = 'string' then
    begin
      v_event := (v_event #>> '{}')::jsonb;
    exception when others then
      raise exception using errcode = '22023', message = 'daily_learning_event_invalid';
    end;
    v_action := jsonb_set(v_action, '{learning_event}', v_event, false);
  end if;
  if v_event is not null and jsonb_typeof(v_event->'task_evidence') = 'string' then
    begin
      v_event := jsonb_set(v_event, '{task_evidence}', (v_event->'task_evidence' #>> '{}')::jsonb, false);
    exception when others then
      raise exception using errcode = '22023', message = 'daily_learning_event_invalid';
    end;
    v_action := jsonb_set(v_action, '{learning_event}', v_event, false);
  end if;
  if v_event is not null and jsonb_typeof(v_event) is distinct from 'object' then
    raise exception using errcode = '22023', message = 'daily_learning_event_invalid';
  end if;
  if v_event is not null and (
    v_event->'task_evidence' is distinct from v_task
    or v_event->>'expected_move_uci' is distinct from coalesce(v_step->'acceptedMoves'->>0, v_expected)
    or coalesce((v_event->>'correct')::boolean, false) is distinct from (v_outcome = 'correct')
    or (v_card->>'interaction' = 'choice' and v_event->>'played_move_uci' is not null)
    or (v_card->>'interaction' = 'move' and coalesce(v_event->>'played_move_uci', '') is distinct from coalesce(v_answer, ''))
  ) then
    raise exception using errcode = '22023', message = 'daily_learning_event_invalid';
  end if;

  if v_kind = 'retry' then
    v_action := jsonb_set(v_action, '{learning_event}', 'null'::jsonb, true);
  end if;

  return public.blundr_commit_daily_action_v3_inner(p_user_id, p_session_id, v_action);
end; $$;

revoke all on function public.blundr_commit_daily_action_v3(uuid, text, jsonb) from public, anon, authenticated;

grant execute on function public.blundr_commit_daily_action_v3(uuid, text, jsonb) to service_role;

commit;
