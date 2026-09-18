-- Add account-owned Daily Blundr card-goal preference.

alter table public.blundr_user_profiles
  add column if not exists daily_blundr_card_goal integer not null default 10;

alter table public.blundr_user_profiles
  drop constraint if exists blundr_user_profiles_daily_blundr_card_goal_check;

alter table public.blundr_user_profiles
  add constraint blundr_user_profiles_daily_blundr_card_goal_check
  check (daily_blundr_card_goal >= 1 and daily_blundr_card_goal <= 99);
