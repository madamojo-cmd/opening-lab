-- Version each persisted Daily deck by the composer, runtime package, and
-- feature profile that selected its server-owned cards.
alter table public.blundr_daily_decks
  add column if not exists composer_version text not null default 'legacy-composer',
  add column if not exists runtime_package_id text not null default 'legacy-runtime',
  add column if not exists profile_version text not null default 'legacy-profile';

create index if not exists idx_blundr_daily_decks_reservation_identity
  on public.blundr_daily_decks (user_id, local_date, composer_version, runtime_package_id, profile_version);
