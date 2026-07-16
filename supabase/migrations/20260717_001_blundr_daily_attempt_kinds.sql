-- Allow multiple unscored retries while retaining one immutable first answer.
alter table public.blundr_daily_attempts
  add column if not exists attempt_kind text not null default 'answer';
alter table public.blundr_daily_attempts
  drop constraint if exists blundr_daily_attempts_attempt_kind_check;
alter table public.blundr_daily_attempts
  add constraint blundr_daily_attempts_attempt_kind_check
  check (attempt_kind in ('answer', 'reveal', 'retry'));
create unique index if not exists blundr_daily_first_attempt_once
  on public.blundr_daily_attempts (user_id, session_id, card_fingerprint)
  where first_attempt = true;
