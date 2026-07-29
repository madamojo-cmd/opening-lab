begin;

alter table public.blundr_minigame_instances
  add column if not exists revision bigint not null default 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'blundr_minigame_instances_revision_nonnegative'
      and conrelid = 'public.blundr_minigame_instances'::regclass
  ) then
    alter table public.blundr_minigame_instances
      add constraint blundr_minigame_instances_revision_nonnegative
      check (revision >= 0);
  end if;
end
$$;

comment on column public.blundr_minigame_instances.revision is
  'Optimistic-concurrency revision required by every standalone minigame mutation.';

commit;
