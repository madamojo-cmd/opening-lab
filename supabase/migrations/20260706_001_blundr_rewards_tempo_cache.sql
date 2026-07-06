-- Stage 8F rare rewards / Tempo Cache.
-- Adds deterministic reward history fields and updates reward roll trigger coverage.

alter table public.blundr_reward_history
  add column if not exists all_rings_days_since_random_reward integer not null default 0,
  add column if not exists last_random_reward_local_date text,
  add column if not exists last_pity_guarantee_local_date text,
  add column if not exists applied_reward_ids text[] not null default '{}';

update public.blundr_reward_history
set
  all_rings_days_since_random_reward = coalesce(all_rings_days_since_random_reward, random_bonus_pity_counter, 0),
  last_random_reward_local_date = coalesce(last_random_reward_local_date, last_random_bonus_at::date::text),
  applied_reward_ids = coalesce(applied_reward_ids, '{}');

alter table public.blundr_reward_rolls
  drop constraint if exists blundr_reward_rolls_trigger_check;

alter table public.blundr_reward_rolls
  drop constraint if exists blundr_reward_rolls_pkey;

alter table public.blundr_reward_rolls
  alter column id drop default;

alter table public.blundr_reward_rolls
  alter column id type text using id::text;

alter table public.blundr_reward_rolls
  add primary key (id);

alter table public.blundr_reward_rolls
  add constraint blundr_reward_rolls_trigger_check check (
    trigger in (
      'daily_tempo_ring_closed',
      'daily_battery_ring_closed',
      'daily_blundr_ring_closed',
      'all_rings_closed',
      'three_all_rings_completions',
      'weekly_cache',
      'monthly_cache',
      'three_day_streak',
      'seven_day_streak',
      'thirty_day_streak'
    )
  );
