-- Forward-only production Daily persistence. Solutions remain server-owned.
create table if not exists public.blundr_daily_decks (
  deck_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  local_date date not null,
  deck_fingerprint text not null,
  public_cards jsonb not null default '[]'::jsonb,
  server_cards jsonb not null default '[]'::jsonb,
  content_version text not null,
  reserved_at timestamptz not null default now(),
  unique (user_id, local_date)
);

create table if not exists public.blundr_daily_sessions (
  session_id text primary key,
  deck_id text not null references public.blundr_daily_decks(deck_id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  state_version integer not null default 1,
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.blundr_daily_attempts (
  attempt_id text primary key,
  session_id text not null references public.blundr_daily_sessions(session_id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  card_fingerprint text not null,
  first_attempt boolean not null default true,
  attempt_kind text not null default 'answer' check (attempt_kind in ('answer', 'reveal', 'retry')),
  outcome text not null check (outcome in ('correct', 'incorrect', 'revealed', 'skipped')),
  answer jsonb,
  created_at timestamptz not null default now(),
  unique (attempt_id)
);

create table if not exists public.blundr_daily_priorities (
  user_id uuid not null references auth.users(id) on delete cascade,
  priority_id text not null,
  opening_id text not null,
  position_key text,
  requested_for date not null,
  status text not null default 'queued' check (status in ('queued', 'added_today', 'already_present', 'unavailable')),
  reason text,
  created_at timestamptz not null default now(),
  primary key (user_id, priority_id)
);

alter table public.blundr_daily_decks enable row level security;
alter table public.blundr_daily_sessions enable row level security;
alter table public.blundr_daily_attempts enable row level security;
alter table public.blundr_daily_priorities enable row level security;
revoke all on public.blundr_daily_decks, public.blundr_daily_sessions, public.blundr_daily_attempts, public.blundr_daily_priorities from anon, authenticated;
create policy blundr_daily_decks_select_own on public.blundr_daily_decks for select using (user_id = auth.uid());
create policy blundr_daily_sessions_select_own on public.blundr_daily_sessions for select using (user_id = auth.uid());
create policy blundr_daily_attempts_select_own on public.blundr_daily_attempts for select using (user_id = auth.uid());
create policy blundr_daily_priorities_select_own on public.blundr_daily_priorities for select using (user_id = auth.uid());
