-- Backfill only canonical mastery coordinates proven by one immutable learning-event identity.
-- Existing unresolved rows remain unresolved and are reported; no coordinates are invented.
with proven_coordinates as (
  select
    user_id,
    position_key,
    min(opening_id) as opening_id,
    min(move_order_key) as play_key
  from public.blundr_learning_events
  where position_key is not null
    and opening_id is not null
    and move_order_key is not null
    and deleted_at is null
  group by user_id, position_key
  having count(distinct opening_id || E'\x1f' || move_order_key) = 1
)
update public.blundr_node_mastery as mastery
set
  opening_id = coalesce(mastery.opening_id, proven.opening_id),
  play_key = coalesce(mastery.play_key, proven.play_key)
from proven_coordinates as proven
where mastery.user_id = proven.user_id
  and mastery.position_key = proven.position_key
  and (mastery.opening_id is null or mastery.play_key is null)
  and (mastery.opening_id is null or mastery.opening_id = proven.opening_id)
  and (mastery.play_key is null or mastery.play_key = proven.play_key);

do $$
declare
  unresolved_count bigint;
begin
  select count(*)
  into unresolved_count
  from public.blundr_node_mastery
  where opening_id is null or play_key is null;

  raise notice 'blundr_node_mastery unresolved runtime identities: %', unresolved_count;

  if exists (
    select 1
    from public.blundr_node_mastery
    where opening_id is not null and play_key is not null
    group by user_id, opening_id, play_key
    having count(*) > 1
  ) then
    raise exception 'blundr_node_mastery contains duplicate canonical runtime identities';
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'blundr_node_mastery_user_opening_play_key_key'
      and conrelid = 'public.blundr_node_mastery'::regclass
  ) then
    alter table public.blundr_node_mastery
      add constraint blundr_node_mastery_user_opening_play_key_key
      unique (user_id, opening_id, play_key);
  end if;
end;
$$;

create index if not exists blundr_learning_events_user_runtime_coordinate_idx
  on public.blundr_learning_events (user_id, opening_id, move_order_key)
  where opening_id is not null and move_order_key is not null and deleted_at is null;
