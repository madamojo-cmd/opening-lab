-- PR20: Battery progress is granted only from server-verified learner checkmate
-- evidence. Historical generic continuation completion rows remain immutable
-- history but are no longer accepted as Battery reward evidence.
begin;

create table public.blundr_continuation_checkmates_v1 (
  completion_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  trainer_session_id text not null,
  terminal_completion_id text not null,
  opening_id text not null,
  path_uci text[] not null,
  terminal_fen text not null,
  checkmate_fen text not null,
  mating_move_uci text not null,
  request_fingerprint text not null,
  verification_version text not null,
  completed_at timestamptz not null default now(),
  constraint blundr_continuation_checkmates_v1_session_owner_fk
    foreign key (trainer_session_id, user_id)
    references public.blundr_trainer_sessions_v2(session_id, user_id)
    on delete cascade,
  constraint blundr_continuation_checkmates_v1_session_unique
    unique (user_id, trainer_session_id),
  constraint blundr_continuation_checkmates_v1_identity_check check (
    char_length(btrim(completion_id)) between 1 and 240
    and char_length(btrim(trainer_session_id)) between 1 and 240
    and char_length(btrim(terminal_completion_id)) between 1 and 240
    and char_length(btrim(opening_id)) between 1 and 160
    and cardinality(path_uci) between 1 and 128
    and char_length(btrim(terminal_fen)) between 1 and 160
    and char_length(btrim(checkmate_fen)) between 1 and 160
    and mating_move_uci ~ '^[a-h][1-8][a-h][1-8][qrbn]?$'
    and char_length(request_fingerprint) = 64
    and verification_version = 'chess.js-server-v1'
  )
);

create index blundr_continuation_checkmates_v1_session_owner_idx
  on public.blundr_continuation_checkmates_v1(trainer_session_id, user_id);
create index blundr_continuation_checkmates_v1_user_completed_idx
  on public.blundr_continuation_checkmates_v1(user_id, completed_at desc);

alter table public.blundr_continuation_checkmates_v1 enable row level security;
revoke all on public.blundr_continuation_checkmates_v1
  from public, anon, authenticated;

create or replace function public.blundr_commit_continuation_checkmate_v1(
  p_user_id uuid,
  p_completion jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_completion_id text := nullif(btrim(p_completion->>'completion_id'), '');
  v_trainer_session_id text := nullif(btrim(p_completion->>'trainer_session_id'), '');
  v_terminal_completion_id text := nullif(btrim(p_completion->>'terminal_completion_id'), '');
  v_opening_id text := nullif(btrim(p_completion->>'opening_id'), '');
  v_terminal_fen text := nullif(btrim(p_completion->>'terminal_fen'), '');
  v_checkmate_fen text := nullif(btrim(p_completion->>'checkmate_fen'), '');
  v_mating_move_uci text := nullif(btrim(p_completion->>'mating_move_uci'), '');
  v_request_fingerprint text := nullif(btrim(p_completion->>'request_fingerprint'), '');
  v_verification_version text := nullif(btrim(p_completion->>'verification_version'), '');
  v_path_uci text[];
  v_identity_material text;
  v_expected_completion_id text;
  v_expected_fingerprint text;
  v_session public.blundr_trainer_sessions_v2%rowtype;
  v_existing public.blundr_continuation_checkmates_v1%rowtype;
  v_inserted boolean := false;
begin
  if p_user_id is null
    or jsonb_typeof(p_completion) is distinct from 'object'
    or jsonb_typeof(p_completion->'path_uci') is distinct from 'array'
    or v_completion_id is null
    or v_trainer_session_id is null
    or v_terminal_completion_id is null
    or v_opening_id is null
    or v_terminal_fen is null
    or v_checkmate_fen is null
    or v_mating_move_uci is null
    or v_request_fingerprint is null
    or v_verification_version is distinct from 'chess.js-server-v1' then
    raise exception using errcode='22023', message='continuation_checkmate_invalid';
  end if;

  select coalesce(array_agg(value order by ordinal), '{}')
    into v_path_uci
  from jsonb_array_elements_text(p_completion->'path_uci')
    with ordinality as path(value, ordinal);

  if cardinality(v_path_uci) not between 1 and 128
    or exists (
      select 1 from unnest(v_path_uci) as move(uci)
      where uci !~ '^[a-h][1-8][a-h][1-8][qrbn]?$'
    )
    or v_mating_move_uci is distinct from v_path_uci[cardinality(v_path_uci)] then
    raise exception using errcode='22023', message='continuation_checkmate_path_invalid';
  end if;

  select * into v_session
  from public.blundr_trainer_sessions_v2
  where session_id=v_trainer_session_id and user_id=p_user_id
  for update;

  if not found
    or v_session.state <> 'completed'
    or v_session.current_cursor <> v_session.line_length
    or v_session.terminal_completion_id is distinct from v_terminal_completion_id
    or v_session.opening_id is distinct from v_opening_id
    or v_session.completed_at is null then
    raise exception using errcode='42501', message='continuation_trainer_terminal_unverified';
  end if;

  v_identity_material := p_user_id::text || ':' || v_trainer_session_id || ':'
    || v_terminal_completion_id || ':' || array_to_string(v_path_uci, ',');
  v_expected_completion_id := 'continuation-checkmate:'
    || encode(digest(v_identity_material, 'sha256'), 'hex');
  v_expected_fingerprint := encode(digest(
    v_identity_material || ':' || v_opening_id || ':' || v_terminal_fen || ':'
      || v_checkmate_fen || ':' || v_mating_move_uci || ':' || v_verification_version,
    'sha256'
  ), 'hex');

  if v_completion_id is distinct from v_expected_completion_id
    or v_request_fingerprint is distinct from v_expected_fingerprint then
    raise exception using errcode='22023', message='continuation_checkmate_identity_mismatch';
  end if;

  insert into public.blundr_continuation_checkmates_v1(
    completion_id,user_id,trainer_session_id,terminal_completion_id,opening_id,
    path_uci,terminal_fen,checkmate_fen,mating_move_uci,request_fingerprint,
    verification_version
  ) values (
    v_completion_id,p_user_id,v_trainer_session_id,v_terminal_completion_id,v_opening_id,
    v_path_uci,v_terminal_fen,v_checkmate_fen,v_mating_move_uci,v_request_fingerprint,
    v_verification_version
  )
  on conflict do nothing
  returning true into v_inserted;

  select * into v_existing
  from public.blundr_continuation_checkmates_v1
  where user_id=p_user_id and trainer_session_id=v_trainer_session_id;

  if not found then
    raise exception using errcode='23505', message='continuation_checkmate_conflict';
  end if;

  if v_existing.completion_id is distinct from v_completion_id
    or v_existing.terminal_completion_id is distinct from v_terminal_completion_id
    or v_existing.opening_id is distinct from v_opening_id
    or v_existing.path_uci is distinct from v_path_uci
    or v_existing.terminal_fen is distinct from v_terminal_fen
    or v_existing.checkmate_fen is distinct from v_checkmate_fen
    or v_existing.mating_move_uci is distinct from v_mating_move_uci
    or v_existing.request_fingerprint is distinct from v_request_fingerprint
    or v_existing.verification_version is distinct from v_verification_version then
    raise exception using errcode='23505', message='continuation_checkmate_idempotency_conflict';
  end if;

  return jsonb_build_object(
    'status', case when v_inserted then 'inserted' else 'duplicate' end,
    'evidenceId', v_existing.completion_id,
    'trainerSessionId', v_existing.trainer_session_id
  );
end;
$$;

revoke all on function public.blundr_commit_continuation_checkmate_v1(uuid,jsonb)
  from public, anon, authenticated;
grant execute on function public.blundr_commit_continuation_checkmate_v1(uuid,jsonb)
  to service_role;

-- The reward source name remains continuation_completed for compatibility with
-- the existing rings/points/XP projection. Its evidence authority is changed
-- from generic continuation rows to the mate-specific server-verified table.
-- Generic continuation evidence is deliberately not accepted for Battery.
do $battery_checkmate_reward_authority$
declare
  v_definition text;
  v_before text := $old$
  elsif p_source = 'continuation_completed' then
    select c.completion_id,c.completed_at into v_evidence_identity,v_evidence_occurred_at
    from public.blundr_continuation_completions_v1 c
    where c.user_id=p_user_id and c.completion_id=p_evidence_id;
    if not found then
      raise exception 'completion_evidence_unverified';
    end if;
$old$;
  v_after text := $new$
  elsif p_source = 'continuation_completed' then
    select c.completion_id,c.completed_at into v_evidence_identity,v_evidence_occurred_at
    from public.blundr_continuation_checkmates_v1 c
    where c.user_id=p_user_id and c.completion_id=p_evidence_id;
    if not found then
      raise exception 'completion_evidence_unverified';
    end if;
$new$;
begin
  select pg_get_functiondef(
    'public.blundr_apply_reward_transaction_v2_core(uuid,text,text,text,text,text,text)'::regprocedure
  ) into v_definition;

  if v_definition is null
    or length(v_definition)-length(replace(v_definition,v_before,'')) <> length(v_before) then
    raise exception using
      errcode='55000',
      message='battery_checkmate_reward_definition_mismatch';
  end if;

  v_definition := replace(v_definition,v_before,v_after);
  execute v_definition;

  select pg_get_functiondef(
    'public.blundr_apply_reward_transaction_v2_core(uuid,text,text,text,text,text,text)'::regprocedure
  ) into v_definition;

  if position('from public.blundr_continuation_checkmates_v1 c' in v_definition)=0
    or position('from public.blundr_continuation_completions_v1 c' in v_definition)>0 then
    raise exception using
      errcode='55000',
      message='battery_checkmate_reward_verification_failed';
  end if;
end;
$battery_checkmate_reward_authority$;

commit;
