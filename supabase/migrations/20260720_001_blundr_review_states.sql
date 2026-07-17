-- Forward-only server-owned SRS state. Review rows never contain answers.
create table if not exists public.blundr_review_states (
  user_id uuid not null references auth.users(id) on delete cascade,
  opening_id text not null,
  play_key text not null,
  due_at timestamptz not null,
  srs_state jsonb not null default '{}'::jsonb,
  last_attempt_id text,
  last_outcome text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, opening_id, play_key)
);

create index if not exists idx_blundr_review_states_user_due
  on public.blundr_review_states (user_id, due_at);
create index if not exists idx_blundr_review_states_user_position
  on public.blundr_review_states (user_id, opening_id, play_key);

alter table public.blundr_review_states enable row level security;
revoke all on public.blundr_review_states from anon, authenticated;
create policy blundr_review_states_select_own
  on public.blundr_review_states for select using (user_id = auth.uid());
