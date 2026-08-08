-- PR-04: server-owned Restricted Trainer run completion authority.
--
-- The application service is the runtime validator: it is the only caller
-- permitted to reserve a line and it supplies the checked, canonical sequence.
-- This SQL layer owns durable identity, ownership, cursor concurrency and the
-- terminal completion fact.  It deliberately does not expose a client writer.
begin;

create table public.blundr_trainer_sessions_v2 (
  session_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  opening_id text not null,
  line_id text not null,
  line_fingerprint text not null,
  canonical_line jsonb not null,
  line_length integer not null,
  current_cursor integer not null default 0,
  state text not null default 'active',
  state_version integer not null default 1,
  terminal_completion_id text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, user_id),
  unique (user_id, terminal_completion_id),
  constraint blundr_trainer_sessions_v2_identity_check check (
    char_length(btrim(session_id)) between 1 and 240
    and char_length(btrim(opening_id)) between 1 and 160
    and char_length(btrim(line_id)) between 1 and 240
    and char_length(btrim(line_fingerprint)) = 64
    and jsonb_typeof(canonical_line) = 'array'
    and line_length = jsonb_array_length(canonical_line)
    and line_length > 0
    and current_cursor between 0 and line_length
    and state in ('active', 'completed')
    and state_version >= 1
    and (
      (state = 'active' and terminal_completion_id is null and completed_at is null)
      or (state = 'completed' and terminal_completion_id is not null and completed_at is not null and current_cursor = line_length)
    )
  )
);

create table public.blundr_trainer_actions_v2 (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null,
  request_id text not null,
  target_id text not null,
  cursor integer not null,
  request_fingerprint text not null,
  learning_event_id text not null,
  correct boolean not null,
  reveal_occurred boolean not null default false,
  projection jsonb not null,
  state_version integer not null,
  created_at timestamptz not null default now(),
  unique (user_id, session_id, request_id),
  unique (learning_event_id),
  constraint blundr_trainer_actions_v2_session_owner_fk
    foreign key (session_id, user_id)
    references public.blundr_trainer_sessions_v2(session_id, user_id)
    on delete cascade,
  constraint blundr_trainer_actions_v2_identity_check check (
    char_length(btrim(request_id)) between 1 and 240
    and char_length(btrim(target_id)) between 1 and 240
    and char_length(btrim(request_fingerprint)) = 64
    and char_length(btrim(learning_event_id)) between 1 and 240
    and cursor >= 0 and state_version >= 1
  )
);

create index blundr_trainer_sessions_v2_user_state_idx
  on public.blundr_trainer_sessions_v2(user_id, state, updated_at desc);
create index blundr_trainer_actions_v2_session_cursor_idx
  on public.blundr_trainer_actions_v2(user_id, session_id, cursor, created_at desc);

alter table public.blundr_trainer_sessions_v2 enable row level security;
alter table public.blundr_trainer_actions_v2 enable row level security;
revoke all on public.blundr_trainer_sessions_v2, public.blundr_trainer_actions_v2
  from public, anon, authenticated;

-- The service provides a runtime-validated canonical line.  SQL derives the
-- session identity and verifies every target shape/fingerprint before storing
-- it; anonymous/authenticated callers have no EXECUTE privilege.
create or replace function public.blundr_reserve_trainer_session_v2(
  p_user_id uuid, p_reservation jsonb
) returns jsonb language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare
  v_line jsonb := p_reservation->'canonical_line';
  v_line_id text := p_reservation->>'line_id';
  v_seed text := p_reservation->>'server_session_seed';
  v_line_fingerprint text;
  v_session_id text;
  v_existing public.blundr_trainer_sessions_v2%rowtype;
  v_inserted boolean := false;
begin
  if p_user_id is null or jsonb_typeof(v_line) is distinct from 'array'
    or jsonb_array_length(v_line) < 1
    or nullif(btrim(v_line_id),'') is null or nullif(btrim(v_seed),'') is null then
    raise exception using errcode='22023', message='invalid_trainer_session_reservation';
  end if;
  select encode(digest(string_agg(value->>'target_fingerprint', ':' order by ordinal), 'sha256'), 'hex')
    into v_line_fingerprint
  from jsonb_array_elements(v_line) with ordinality as target(value, ordinal);
  if p_reservation->>'line_fingerprint' is distinct from v_line_fingerprint then
    raise exception using errcode='22023', message='trainer_line_fingerprint_mismatch';
  end if;
  if exists (
    select 1 from jsonb_array_elements(v_line) with ordinality as target(value, ordinal)
    where jsonb_typeof(value) <> 'object'
      or nullif(value->>'target_id','') is null
      or nullif(value->>'target_fingerprint','') is null
      or char_length(value->>'target_fingerprint') <> 64
      or nullif(value->>'opening_id','') is null
      or nullif(value->>'position_key','') is null
      or nullif(value->>'expected_move_uci','') is null
      or nullif(value->>'move_order_key','') is null
      or (value->>'target_fingerprint') <> encode(digest(
        ordinal::text || ':' || (value->>'opening_id') || ':' || (value->>'position_key') || ':'
        || (value->>'expected_move_uci') || ':' || (value->>'move_order_key'), 'sha256'), 'hex')
      or (value->>'target_id') <> ('trainer-target:' || ordinal::text || ':' || substr(value->>'target_fingerprint',1,24))
  ) then
    raise exception using errcode='22023', message='invalid_trainer_canonical_line';
  end if;
  if (select count(*) from (select element->>'target_id' as target_id from jsonb_array_elements(v_line) as item(element)) targets)
       <> (select count(distinct element->>'target_id') from jsonb_array_elements(v_line) as item(element)) then
    raise exception using errcode='22023', message='duplicate_trainer_target_identity';
  end if;
  if (select count(distinct element->>'opening_id') from jsonb_array_elements(v_line) as item(element)) <> 1 then
    raise exception using errcode='22023', message='trainer_line_opening_mismatch';
  end if;
  v_session_id := 'trainer-session:' || encode(digest(p_user_id::text || ':' || v_line_id || ':' || v_line_fingerprint || ':' || v_seed,'sha256'),'hex');
  if p_reservation->>'session_id' is distinct from v_session_id then
    raise exception using errcode='22023', message='trainer_session_identity_mismatch';
  end if;
  insert into public.blundr_trainer_sessions_v2(session_id,user_id,opening_id,line_id,line_fingerprint,canonical_line,line_length)
  values(v_session_id,p_user_id,(v_line->0)->>'opening_id',v_line_id,v_line_fingerprint,v_line,jsonb_array_length(v_line))
  on conflict (session_id) do nothing returning true into v_inserted;
  select * into v_existing from public.blundr_trainer_sessions_v2 where session_id=v_session_id and user_id=p_user_id;
  if not found then raise exception using errcode='23505', message='trainer_session_reservation_conflict'; end if;
  if v_existing.line_fingerprint is distinct from v_line_fingerprint or v_existing.line_id is distinct from v_line_id then
    raise exception using errcode='23505', message='trainer_session_payload_conflict';
  end if;
  return jsonb_build_object('status',case when v_inserted then 'inserted' else 'duplicate' end,
    'sessionId',v_existing.session_id,'openingId',v_existing.opening_id,'lineId',v_existing.line_id,'lineLength',v_existing.line_length,
    'cursor',v_existing.current_cursor,'state',v_existing.state,'version',v_existing.state_version,
    'terminalCompletionId',v_existing.terminal_completion_id);
end;
$$;

-- One action request is one immutable attempt receipt.  The target is selected
-- only from the locked canonical line at the current cursor; the SQL function
-- derives the next cursor and terminal completion instead of accepting either
-- from a browser or service payload.
create or replace function public.blundr_commit_trainer_action_v2(
  p_user_id uuid, p_session_id text, p_action jsonb
) returns jsonb language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare
  v_session public.blundr_trainer_sessions_v2%rowtype;
  v_target jsonb;
  v_event jsonb := p_action->'learning_event';
  v_projection jsonb;
  v_request_id text := p_action->>'request_id';
  v_request_fingerprint text := p_action->>'request_fingerprint';
  v_target_id text := p_action->>'target_id';
  v_existing public.blundr_trainer_actions_v2%rowtype;
  v_correct boolean;
  v_reveal boolean;
  v_next_cursor integer;
  v_terminal_completion_id text;
begin
  if p_user_id is null or nullif(btrim(p_session_id),'') is null
    or jsonb_typeof(p_action) is distinct from 'object'
    or nullif(btrim(v_request_id),'') is null
    or nullif(btrim(v_request_fingerprint),'') is null
    or char_length(v_request_fingerprint) <> 64
    or nullif(btrim(v_target_id),'') is null
    or jsonb_typeof(v_event) is distinct from 'object' then
    raise exception using errcode='22023', message='invalid_trainer_action_request';
  end if;
  select * into v_session from public.blundr_trainer_sessions_v2
    where session_id=p_session_id and user_id=p_user_id for update;
  if not found then raise exception using errcode='42501', message='trainer_session_not_found'; end if;
  select * into v_existing from public.blundr_trainer_actions_v2
    where user_id=p_user_id and session_id=p_session_id and request_id=v_request_id;
  if found then
    if v_existing.request_fingerprint is distinct from v_request_fingerprint
      or v_existing.target_id is distinct from v_target_id then
      raise exception using errcode='23505', message='trainer_action_idempotency_conflict';
    end if;
    return jsonb_build_object('status','duplicate','eventId',v_existing.learning_event_id,
      'projection',v_existing.projection,'cursor',v_session.current_cursor,'version',v_session.state_version,
      'state',v_session.state,'terminalCompletionId',v_session.terminal_completion_id);
  end if;
  if v_session.state <> 'active' then raise exception using errcode='40901', message='trainer_session_not_active'; end if;
  if (p_action->>'expected_version')::integer is distinct from v_session.state_version then
    raise exception using errcode='40001', message='trainer_session_stale_version';
  end if;
  if coalesce((p_action->>'cursor')::integer,-1) <> v_session.current_cursor then
    raise exception using errcode='22023', message='trainer_cursor_not_current';
  end if;
  v_target := v_session.canonical_line -> v_session.current_cursor;
  if v_target is null or v_target->>'target_id' is distinct from v_target_id
    or p_action->>'target_fingerprint' is distinct from v_target->>'target_fingerprint' then
    raise exception using errcode='22023', message='trainer_target_not_current';
  end if;
  -- Coordinates, expected move and identity come exclusively from the private
  -- session line.  The service supplies only evaluated answer evidence and its
  -- reviewed FSRS projection to the existing v2 projector.
  if v_event->>'opening_id' is distinct from v_target->>'opening_id'
    or v_event->>'position_key' is distinct from v_target->>'position_key'
    or v_event->>'expected_move_uci' is distinct from v_target->>'expected_move_uci'
    or v_event->>'move_order_key' is distinct from v_target->>'move_order_key' then
    raise exception using errcode='22023', message='trainer_learning_target_mismatch';
  end if;
  if v_event->>'user_id' is distinct from p_user_id::text
    or v_event->>'session_id' is distinct from p_session_id
    or v_event->>'source' is distinct from 'train'
    or nullif(v_event->>'event_id','') is null
    or nullif(v_event->>'attempt_id','') is null
    or nullif(v_event->>'authority_fingerprint','') is null then
    raise exception using errcode='22023', message='trainer_learning_authority_mismatch';
  end if;
  v_reveal := coalesce((v_event#>>'{answer_evidence,revealOccurred}')::boolean,false);
  if v_reveal and (
    coalesce((v_event->>'correct')::boolean,false)
    or v_event->>'review_rating' is distinct from 'again'
  ) then
    raise exception using errcode='22023', message='trainer_reveal_evidence_invalid';
  end if;
  v_correct := coalesce((v_event->>'correct')::boolean,false) and not v_reveal;
  v_projection := public.blundr_project_learning_evidence_v2(p_user_id,v_event);
  v_next_cursor := case when v_correct then v_session.current_cursor + 1 else v_session.current_cursor end;
  if v_next_cursor = v_session.line_length then
    v_terminal_completion_id := 'trainer-terminal:' || encode(digest(p_user_id::text || ':' || p_session_id || ':' || v_session.line_fingerprint,'sha256'),'hex');
  end if;
  insert into public.blundr_trainer_actions_v2(user_id,session_id,request_id,target_id,cursor,request_fingerprint,learning_event_id,correct,reveal_occurred,projection,state_version)
  values(p_user_id,p_session_id,v_request_id,v_target_id,v_session.current_cursor,v_request_fingerprint,
    v_event->>'event_id',v_correct,v_reveal,v_projection,v_session.state_version + 1);
  update public.blundr_trainer_sessions_v2 set current_cursor=v_next_cursor,
    state=case when v_next_cursor=line_length then 'completed' else 'active' end,
    terminal_completion_id=case when v_next_cursor=line_length then v_terminal_completion_id else null end,
    completed_at=case when v_next_cursor=line_length then now() else null end,
    state_version=state_version+1,updated_at=now()
  where session_id=p_session_id and user_id=p_user_id;
  return jsonb_build_object('status','inserted','eventId',v_event->>'event_id','projection',v_projection,
    'cursor',v_next_cursor,'version',v_session.state_version+1,
    'state',case when v_next_cursor=v_session.line_length then 'completed' else 'active' end,
    'terminalCompletionId',v_terminal_completion_id);
end;
$$;

-- Extend the existing Rewards v2 writer without introducing another reward
-- implementation. This replacement is intentionally ancestry-locked: if the
-- accepted PR-03 evidence branch differs at all, the migration stops instead
-- of rewriting an unknown function body.
do $trainer_reward_extension$
declare
  v_definition text;
  v_before text := $old$
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
$old$;
  v_after text := $new$
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
$new$;
begin
  select pg_get_functiondef(
    'public.blundr_apply_reward_transaction_v2(uuid,text,text,text,text,text,text)'::regprocedure
  ) into v_definition;
  if v_definition is null
    or length(v_definition)-length(replace(v_definition,v_before,'')) <> length(v_before) then
    raise exception using errcode='55000', message='reward_v2_accepted_definition_mismatch';
  end if;
  v_definition := replace(v_definition,v_before,v_after);
  execute v_definition;
  select pg_get_functiondef(
    'public.blundr_apply_reward_transaction_v2(uuid,text,text,text,text,text,text)'::regprocedure
  ) into v_definition;
  if position('public.blundr_trainer_sessions_v2' in v_definition)=0
    or position('continuation_completed' in v_definition)=0 then
    raise exception using errcode='55000', message='trainer_reward_extension_verification_failed';
  end if;
end;
$trainer_reward_extension$;

revoke all on function public.blundr_reserve_trainer_session_v2(uuid,jsonb),
  public.blundr_commit_trainer_action_v2(uuid,text,jsonb) from public, anon, authenticated;
grant execute on function public.blundr_reserve_trainer_session_v2(uuid,jsonb),
  public.blundr_commit_trainer_action_v2(uuid,text,jsonb) to service_role;

commit;
