-- Stage 8V/Vercel-ready shared rewards QA.
-- Persist opening fragments and choice tokens in the shared reward history row.

alter table public.blundr_reward_history
  add column if not exists opening_fragments integer not null default 0,
  add column if not exists choice_tokens integer not null default 0,
  add column if not exists reward_inventory_applied_event_ids text[] not null default '{}';

update public.blundr_reward_history
set
  opening_fragments = coalesce(opening_fragments, 0),
  choice_tokens = coalesce(choice_tokens, 0),
  reward_inventory_applied_event_ids = coalesce(reward_inventory_applied_event_ids, '{}');
