-- PR-04: task-specific Daily evidence. The existing v2 action/projector stays
-- unchanged for Trainer; this wrapper validates the private Daily card before
-- calling it in the same transaction.
begin;

create table if not exists public.blundr_daily_task_evidence_v3 (
  evidence_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null,
  action_id text not null,
  card_fingerprint text not null,
  step_id text not null,
  task_type text not null,
  expected_answer_identity text,
  submitted_answer_identity text,
  canonical_target jsonb not null,
  outcome text not null check (outcome in ('correct','incorrect','revealed','skipped')),
  first_attempt boolean not null,
  reveal_occurred boolean not null default false,
  retry boolean not null default false,
  learning_event_id text,
  created_at timestamptz not null default now(),
  unique (user_id, session_id, action_id),
  foreign key (session_id, user_id) references public.blundr_daily_sessions(session_id, user_id) on delete cascade
);

create index if not exists blundr_daily_task_evidence_v3_owner_idx
  on public.blundr_daily_task_evidence_v3(user_id, session_id, created_at desc);

alter table public.blundr_daily_task_evidence_v3 enable row level security;
revoke all on public.blundr_daily_task_evidence_v3 from public, anon, authenticated;

create or replace function public.blundr_commit_daily_action_v3(p_user_id uuid, p_session_id text, p_action jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_cards jsonb; v_card jsonb; v_step jsonb; v_expected text; v_task jsonb;
  v_result jsonb; v_attempt record; v_computed_outcome text; v_answer text;
begin
  if p_user_id is null or nullif(p_session_id,'') is null or p_action is null then
    raise exception using errcode='22023',message='invalid_daily_action_request';
  end if;
  select deck.server_cards into v_cards
  from public.blundr_daily_sessions session
  join public.blundr_daily_decks deck on deck.deck_id=session.deck_id and deck.user_id=session.user_id
  where session.session_id=p_session_id and session.user_id=p_user_id;
  if v_cards is null then raise exception using errcode='42501',message='daily_session_not_found'; end if;
  select card into v_card from jsonb_array_elements(v_cards) card where card->>'cardFingerprint'=p_action->>'card_fingerprint';
  if v_card is null then raise exception using errcode='22023',message='daily_card_not_reserved'; end if;
  v_task := p_action->'daily_evidence';
  if v_task is not null and (jsonb_typeof(v_task) is distinct from 'object'
    or v_task->>'taskType' is distinct from v_card->>'activityId') then
    raise exception using errcode='22023',message='daily_task_evidence_invalid';
  end if;
  if jsonb_typeof(v_card->'privateSteps')='array' then
    select step into v_step from jsonb_array_elements(v_card->'privateSteps') step
      where (step->>'stepIndex')::int=(p_action->>'step_index')::int;
  else v_step := v_card; end if;
  v_expected := coalesce(v_step->'acceptedAnswers'->>0, v_step->'acceptedMoves'->>0);
  if v_expected is null or (v_task is not null and v_task->>'expectedTaskAnswerIdentity' is distinct from v_expected) then
    raise exception using errcode='22023',message='daily_task_answer_not_reserved';
  end if;
  v_answer := nullif(p_action->>'answer','');
  if p_action->>'attempt_kind'='answer' then
    v_computed_outcome := case when v_answer=v_expected then 'correct' else 'incorrect' end;
  elsif p_action->>'attempt_kind'='reveal' then v_computed_outcome := 'revealed';
  elsif p_action->>'attempt_kind'='retry' then v_computed_outcome := 'skipped';
  else raise exception using errcode='22023',message='daily_task_attempt_invalid'; end if;
  if p_action->>'outcome' is distinct from v_computed_outcome
    or (v_task is not null and coalesce((v_task->>'correct')::boolean,false) is distinct from (v_computed_outcome='correct'))
    or (v_task is not null and coalesce(v_task->>'submittedAnswerIdentity','') is distinct from coalesce(v_answer,'')) then
    raise exception using errcode='22023',message='daily_task_evidence_conflict';
  end if;
  if exists(
    select 1 from public.blundr_daily_task_evidence_v3 prior
    where prior.user_id=p_user_id and prior.session_id=p_session_id and prior.action_id=p_action->>'action_id'
      and (prior.task_type is distinct from v_card->>'activityId'
        or prior.expected_answer_identity is distinct from v_expected
        or prior.submitted_answer_identity is distinct from v_answer
        or prior.outcome is distinct from v_computed_outcome)
  ) then raise exception using errcode='23505',message='daily_task_evidence_conflict'; end if;
  v_result := public.blundr_commit_daily_action_v2(p_user_id,p_session_id,p_action);
  select attempt_id,first_attempt,outcome into v_attempt from public.blundr_daily_attempts
    where user_id=p_user_id and session_id=p_session_id and action_id=p_action->>'action_id';
  insert into public.blundr_daily_task_evidence_v3(
    evidence_id,user_id,session_id,action_id,card_fingerprint,step_id,task_type,
    expected_answer_identity,submitted_answer_identity,canonical_target,outcome,
    first_attempt,reveal_occurred,retry,learning_event_id
  ) values (
    'daily-task-evidence:' || p_session_id || ':' || p_action->>'action_id',
    p_user_id,p_session_id,p_action->>'action_id',p_action->>'card_fingerprint',
    p_action->>'step_id',v_card->>'activityId',v_expected,v_answer,
    coalesce(v_task->'canonicalTarget',jsonb_build_object('positionKey',v_card->>'positionKey','openingId',v_card->>'openingId','playKey',v_card->>'playKey')),v_attempt.outcome,
    coalesce(v_attempt.first_attempt,false),v_attempt.outcome='revealed',v_attempt.outcome='skipped',
    v_result->>'eventId'
  ) on conflict (user_id,session_id,action_id) do nothing;
  return v_result;
end; $$;

revoke all on function public.blundr_commit_daily_action_v3(uuid,text,jsonb) from public, anon, authenticated;
grant execute on function public.blundr_commit_daily_action_v3(uuid,text,jsonb) to service_role;
commit;
