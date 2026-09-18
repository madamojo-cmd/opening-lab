-- Keep the database constraint aligned with the V11 onboarding presentation.
-- The forward app contract added the line-changes and review education steps;
-- historical migrations remain immutable, so this migration replaces only the
-- narrow check constraint without changing ownership, RLS, or persistence shape.

alter table public.blundr_user_profiles
  drop constraint if exists blundr_user_profiles_onboarding_step_check;

alter table public.blundr_user_profiles
  add constraint blundr_user_profiles_onboarding_step_check
  check (onboarding_step in (
    'welcome', 'level', 'priorities', 'starter-pack', 'training-mode', 'pace',
    'line-changes', 'review', 'plan', 'ready'
  ));
