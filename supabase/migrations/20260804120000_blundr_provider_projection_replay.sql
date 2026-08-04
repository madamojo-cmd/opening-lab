-- Provider deletion is one transaction: remove the selected source evidence,
-- then rebuild affected projections from every surviving learning source.

create or replace function public.blundr_delete_provider_game_data(
  p_user_id uuid,
  p_provider text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_fingerprints text[] := '{}';
  v_finding_ids text[] := '{}';
  v_positions text[] := '{}';
  v_position text;
  v_attempts integer;
  v_first_at timestamptz;
  v_first_result text;
  v_updated_at timestamptz;
  v_opening_id text;
  v_play_key text;
  v_weak_event_ids text[];
  v_weak_explanation text;
  v_deleted_events integer := 0;
begin
  if p_provider is not null and p_provider not in ('chesscom', 'lichess') then
    raise exception 'invalid_provider';
  end if;

  select coalesce(array_agg(distinct coalesce(provider_fingerprint, fallback_fingerprint)), '{}')
  into v_fingerprints
  from public.blundr_external_games
  where user_id = p_user_id
    and (p_provider is null or provider = p_provider);

  select
    coalesce(array_agg(distinct finding_id), '{}'),
    coalesce(array_agg(distinct position_key), '{}')
  into v_finding_ids, v_positions
  from public.blundr_learning_findings
  where user_id = p_user_id
    and game_fingerprint = any(v_fingerprints);

  delete from public.blundr_learning_events
  where user_id = p_user_id
    and source = 'imported_game'
    and attempt_id = any(v_finding_ids);
  get diagnostics v_deleted_events = row_count;

  delete from public.blundr_learning_findings
  where user_id = p_user_id
    and game_fingerprint = any(v_fingerprints);
  delete from public.blundr_game_opening_segments
  where user_id = p_user_id
    and game_fingerprint = any(v_fingerprints);
  delete from public.blundr_external_games
  where user_id = p_user_id
    and (p_provider is null or provider = p_provider);
  delete from public.blundr_game_import_jobs
  where user_id = p_user_id
    and (p_provider is null or provider = p_provider);
  delete from public.blundr_provider_accounts
  where user_id = p_user_id
    and (p_provider is null or provider = p_provider);

  foreach v_position in array v_positions loop
    select
      count(*)::integer,
      min(occurred_at),
      max(occurred_at),
      min(opening_id),
      min(move_order_key)
    into v_attempts, v_first_at, v_updated_at, v_opening_id, v_play_key
    from public.blundr_learning_events
    where user_id = p_user_id
      and position_key = v_position
      and deleted_at is null
      and taxonomy in ('move_correct', 'move_incorrect', 'daily_answered');

    if v_attempts = 0 then
      delete from public.blundr_node_mastery
      where user_id = p_user_id and position_key = v_position;
    else
      select case
        when taxonomy = 'move_correct' or (taxonomy = 'daily_answered' and finding is null)
          then 'correct'
        else 'incorrect'
      end
      into v_first_result
      from public.blundr_learning_events
      where user_id = p_user_id
        and position_key = v_position
        and deleted_at is null
        and taxonomy in ('move_correct', 'move_incorrect', 'daily_answered')
      order by occurred_at, event_id
      limit 1;

      insert into public.blundr_node_mastery (
        user_id, position_key, opening_id, play_key, attempts,
        first_attempt_at, first_attempt_result, confidence,
        access_decision, updated_at
      ) values (
        p_user_id, v_position, v_opening_id, v_play_key, v_attempts,
        v_first_at, v_first_result,
        least(0.95, 0.2 + v_attempts * 0.15), 'active', v_updated_at
      )
      on conflict (user_id, position_key) do update set
        opening_id = excluded.opening_id,
        play_key = excluded.play_key,
        attempts = excluded.attempts,
        first_attempt_at = excluded.first_attempt_at,
        first_attempt_result = excluded.first_attempt_result,
        confidence = excluded.confidence,
        access_decision = excluded.access_decision,
        updated_at = excluded.updated_at;
    end if;

    select
      coalesce(array_agg(event_id order by occurred_at, event_id), '{}'),
      (array_agg(coalesce(finding->>'explanation', 'The approved move was missed.') order by occurred_at desc, event_id desc))[1]
    into v_weak_event_ids, v_weak_explanation
    from public.blundr_learning_events
    where user_id = p_user_id
      and position_key = v_position
      and deleted_at is null
      and (
        taxonomy in ('move_incorrect', 'cue_revealed', 'daily_revealed', 'finding_recorded')
        or (taxonomy = 'daily_answered' and finding is not null)
      );

    if cardinality(v_weak_event_ids) = 0 then
      delete from public.blundr_weakness_projection
      where user_id = p_user_id and position_key = v_position;
    else
      insert into public.blundr_weakness_projection (
        user_id, position_key, opening_id, play_key, category, score,
        confidence, explanation, recommended_daily_intervention,
        access_decision, source_event_ids, updated_at
      ) values (
        p_user_id, v_position, v_opening_id, v_play_key, 'opening_move', 0.7,
        0.65, coalesce(v_weak_explanation, 'The approved move was missed.'),
        'recall_move', 'active', v_weak_event_ids, coalesce(v_updated_at, now())
      )
      on conflict (user_id, position_key, category) do update set
        opening_id = excluded.opening_id,
        play_key = excluded.play_key,
        score = excluded.score,
        confidence = excluded.confidence,
        explanation = excluded.explanation,
        recommended_daily_intervention = excluded.recommended_daily_intervention,
        access_decision = excluded.access_decision,
        source_event_ids = excluded.source_event_ids,
        updated_at = excluded.updated_at;
    end if;
  end loop;

  return jsonb_build_object(
    'deletedLearningEvents', v_deleted_events,
    'affectedPositions', cardinality(v_positions)
  );
end;
$$;

revoke all on function public.blundr_delete_provider_game_data(uuid, text) from public, anon, authenticated;
grant execute on function public.blundr_delete_provider_game_data(uuid, text) to service_role;
