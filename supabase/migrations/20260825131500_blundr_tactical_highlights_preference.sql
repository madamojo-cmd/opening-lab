-- Add account-owned tactical-highlights teaching-aid preference.

alter table public.blundr_user_profiles
  add column if not exists tactical_highlights_enabled boolean not null default true;

