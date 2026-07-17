-- Durable state for the v1.1 account-required onboarding journey.
-- This extends the existing private account profile instead of creating a
-- second account/bootstrap authority. Existing own-row RLS policies remain
-- authoritative and API routes validate every transition server-side.

alter table public.blundr_user_profiles
  add column if not exists onboarding_step text not null default 'welcome',
  add column if not exists onboarding_priorities text[] not null default '{}',
  add column if not exists onboarding_started_at timestamptz,
  add column if not exists onboarding_completed_at timestamptz,
  add column if not exists age_confirmed_at timestamptz;

alter table public.blundr_user_profiles
  drop constraint if exists blundr_user_profiles_onboarding_step_check;
alter table public.blundr_user_profiles
  add constraint blundr_user_profiles_onboarding_step_check
  check (onboarding_step in (
    'welcome', 'level', 'priorities', 'training-loop', 'pace',
    'starter-pack', 'training-mode', 'plan', 'ready'
  ));

create index if not exists idx_blundr_user_profiles_onboarding_incomplete
  on public.blundr_user_profiles (onboarding_completed, onboarding_step)
  where onboarding_completed = false;

-- The table already has authenticated own-row SELECT/INSERT/UPDATE policies.
-- Keep those ownership guarantees unchanged; no public onboarding profile is
-- introduced by this migration.
