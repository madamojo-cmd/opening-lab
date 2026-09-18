begin;

do $battery_checkmate_authority_repair$
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

  if v_definition is null then
    raise exception using
      errcode='55000',
      message='battery_checkmate_authority_repair_function_missing';
  end if;

  if position('from public.blundr_continuation_checkmates_v1 c' in v_definition)>0
    and position('from public.blundr_continuation_completions_v1 c' in v_definition)=0 then
    return;
  end if;

  if length(v_definition)-length(replace(v_definition,v_before,'')) <> length(v_before) then
    raise exception using
      errcode='55000',
      message='battery_checkmate_authority_repair_definition_mismatch';
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
      message='battery_checkmate_authority_repair_verification_failed';
  end if;
end;
$battery_checkmate_authority_repair$;

commit;
