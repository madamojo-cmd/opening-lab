-- Security: lock function search_path for known public functions.
-- This hardens Supabase security advisor "Function Search Path Mutable" warnings
-- without changing function signatures, ownership, or runtime behavior.

alter function public.blundr_touch_updated_at()
  set search_path = pg_catalog;

alter function public.blundr_normalize_username(text)
  set search_path = pg_catalog;

alter function public.blundr_validate_username_pair()
  set search_path = pg_catalog;

alter function public.blundr_learning_events_force_auth_user()
  set search_path = pg_catalog;

alter function public.blundr_game_data_force_auth_user()
  set search_path = pg_catalog;
