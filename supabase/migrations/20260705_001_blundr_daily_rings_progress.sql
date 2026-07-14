-- Stage 8D/8E daily rings and streak progress fields.
-- Adds idempotency and lifetime completion tracking for the daily habit loop.

alter table public.blundr_daily_retention_progress
  add column if not exists all_rings_closed_at timestamptz,
  add column if not exists activity_event_ids text[] not null default '{}';

alter table public.blundr_streak_records
  add column if not exists total_all_rings_closed_days integer not null default 0;

update public.blundr_daily_retention_progress
set all_rings_closed_at = coalesce(all_rings_closed_at, completed_at)
where completed_at is not null and all_rings_closed_at is null;

