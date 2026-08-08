-- Durable Rewards v2 expansion.
--
-- This migration is deliberately additive.  It does not modify the legacy
-- reward writer, replay historical rewards, or create presentation work for
-- existing reward history.  PR-03 owns the one v2 writer and will replace the
-- fail-closed RPC shells below after server-side completion validation and
-- HMAC randomness are available.

create table if not exists public.blundr_reward_transactions_v2 (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  idempotency_key text not null,
  transaction_kind text not null,
  completion_id text,
  source text not null,
  policy_version text not null,
  randomness_key_version text,
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key),
  constraint blundr_reward_transactions_v2_id_user_unique unique (id, user_id),
  constraint blundr_reward_transactions_v2_kind_check check (
    transaction_kind in ('reward_grant', 'inventory_unlock')
  ),
  constraint blundr_reward_transactions_v2_identity_check check (
    char_length(btrim(idempotency_key)) between 1 and 500
    and char_length(btrim(source)) between 1 and 120
    and char_length(btrim(policy_version)) between 1 and 120
    and (completion_id is null or char_length(btrim(completion_id)) between 1 and 500)
    and (randomness_key_version is null or char_length(btrim(randomness_key_version)) between 1 and 120)
  )
);

-- An immutable grant is the durable source of truth for every awarded item.
-- `randomness_key_version` identifies an approved server key without exposing
-- secret material.  It is intentionally not a random result or a fabricated
-- miss when the server secret is unavailable.
create table if not exists public.blundr_reward_grants_v2 (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  grant_key text not null,
  grant_type text not null,
  quantity integer not null,
  policy_version text not null,
  randomness_key_version text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (transaction_id, grant_key),
  constraint blundr_reward_grants_v2_transaction_owner_fk
    foreign key (transaction_id, user_id)
    references public.blundr_reward_transactions_v2(id, user_id)
    on delete cascade,
  constraint blundr_reward_grants_v2_type_check check (
    grant_type in ('routine_points', 'opening_fragment', 'choice_token', 'epic_points')
  ),
  constraint blundr_reward_grants_v2_quantity_check check (quantity >= 1),
  constraint blundr_reward_grants_v2_identity_check check (
    char_length(btrim(grant_key)) between 1 and 240
    and char_length(btrim(policy_version)) between 1 and 120
    and (randomness_key_version is null or char_length(btrim(randomness_key_version)) between 1 and 120)
  )
);

-- Inventory is normalized by item type.  Fragments and choice tokens are
-- inventory, never aliases for repertoire points or JSON-only client state.
create table if not exists public.blundr_reward_inventory_v2 (
  user_id uuid not null references auth.users(id) on delete cascade,
  inventory_kind text not null,
  quantity integer not null default 0,
  version integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, inventory_kind),
  constraint blundr_reward_inventory_v2_kind_check check (
    inventory_kind in ('opening_fragment', 'choice_token')
  ),
  constraint blundr_reward_inventory_v2_quantity_check check (quantity >= 0),
  constraint blundr_reward_inventory_v2_version_check check (version >= 0)
);

-- The immutable event ledger is the reconciliation source for mutable
-- inventory balances.  Spend and unlock rows carry the user-selected opening;
-- there is no server-selected fallback opening.
create table if not exists public.blundr_reward_inventory_events_v2 (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_key text not null,
  event_kind text not null,
  inventory_kind text not null,
  quantity_delta integer not null,
  opening_id text,
  policy_version text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (transaction_id, event_key),
  constraint blundr_reward_inventory_events_v2_transaction_owner_fk
    foreign key (transaction_id, user_id)
    references public.blundr_reward_transactions_v2(id, user_id)
    on delete cascade,
  constraint blundr_reward_inventory_events_v2_kind_check check (
    event_kind in ('grant', 'spend', 'unlock')
    and inventory_kind in ('opening_fragment', 'choice_token')
  ),
  constraint blundr_reward_inventory_events_v2_shape_check check (
    (event_kind = 'grant' and quantity_delta > 0 and opening_id is null)
    or (event_kind = 'spend' and quantity_delta < 0 and char_length(btrim(opening_id)) between 1 and 240)
    or (event_kind = 'unlock' and quantity_delta = 0 and char_length(btrim(opening_id)) between 1 and 240)
  ),
  constraint blundr_reward_inventory_events_v2_identity_check check (
    char_length(btrim(event_key)) between 1 and 240
    and char_length(btrim(policy_version)) between 1 and 120
  )
);

-- One persisted envelope per transaction supports server-side coalescing.  A
-- claim is recoverable after its lease expires; first rendering and explicit
-- acknowledgement remain separate durable facts.
create table if not exists public.blundr_reward_presentations_v2 (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  presentation_key text not null,
  presentation_kind text not null,
  priority smallint not null default 0,
  envelope jsonb not null,
  policy_version text not null,
  claimed_by text,
  claimed_at timestamptz,
  lease_expires_at timestamptz,
  first_rendered_at timestamptz,
  acknowledged_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (transaction_id),
  unique (user_id, presentation_key),
  constraint blundr_reward_presentations_v2_transaction_owner_fk
    foreign key (transaction_id, user_id)
    references public.blundr_reward_transactions_v2(id, user_id)
    on delete cascade,
  constraint blundr_reward_presentations_v2_kind_check check (
    presentation_kind in ('toast', 'modal', 'sheet')
  ),
  constraint blundr_reward_presentations_v2_priority_check check (priority between 0 and 100),
  constraint blundr_reward_presentations_v2_identity_check check (
    char_length(btrim(presentation_key)) between 1 and 240
    and char_length(btrim(policy_version)) between 1 and 120
  ),
  constraint blundr_reward_presentations_v2_lease_check check (
    (claimed_by is null and claimed_at is null and lease_expires_at is null)
    or (
      char_length(btrim(claimed_by)) between 1 and 240
      and claimed_at is not null
      and lease_expires_at is not null
      and lease_expires_at > claimed_at
    )
  )
);

create index if not exists idx_blundr_reward_transactions_v2_user_created
  on public.blundr_reward_transactions_v2 (user_id, created_at desc);
create index if not exists idx_blundr_reward_grants_v2_user_created
  on public.blundr_reward_grants_v2 (user_id, created_at desc);
create index if not exists idx_blundr_reward_inventory_events_v2_user_created
  on public.blundr_reward_inventory_events_v2 (user_id, created_at desc);
create index if not exists idx_blundr_reward_presentations_v2_pending
  on public.blundr_reward_presentations_v2 (user_id, priority desc, created_at)
  where acknowledged_at is null;
create index if not exists idx_blundr_reward_presentations_v2_lease_recovery
  on public.blundr_reward_presentations_v2 (lease_expires_at)
  where acknowledged_at is null and lease_expires_at is not null;

alter table public.blundr_reward_transactions_v2 enable row level security;
alter table public.blundr_reward_grants_v2 enable row level security;
alter table public.blundr_reward_inventory_v2 enable row level security;
alter table public.blundr_reward_inventory_events_v2 enable row level security;
alter table public.blundr_reward_presentations_v2 enable row level security;

revoke all on public.blundr_reward_transactions_v2,
  public.blundr_reward_grants_v2,
  public.blundr_reward_inventory_v2,
  public.blundr_reward_inventory_events_v2,
  public.blundr_reward_presentations_v2
  from public, anon, authenticated;
grant select on public.blundr_reward_transactions_v2,
  public.blundr_reward_grants_v2,
  public.blundr_reward_inventory_v2,
  public.blundr_reward_inventory_events_v2,
  public.blundr_reward_presentations_v2
  to authenticated;

create policy blundr_reward_transactions_v2_select_own
  on public.blundr_reward_transactions_v2 for select to authenticated
  using (user_id = auth.uid());
create policy blundr_reward_grants_v2_select_own
  on public.blundr_reward_grants_v2 for select to authenticated
  using (user_id = auth.uid());
create policy blundr_reward_inventory_v2_select_own
  on public.blundr_reward_inventory_v2 for select to authenticated
  using (user_id = auth.uid());
create policy blundr_reward_inventory_events_v2_select_own
  on public.blundr_reward_inventory_events_v2 for select to authenticated
  using (user_id = auth.uid());
create policy blundr_reward_presentations_v2_select_own
  on public.blundr_reward_presentations_v2 for select to authenticated
  using (user_id = auth.uid());

-- Immutable reward records cannot be silently rewritten by a future service
-- implementation.  These triggers intentionally guard UPDATE only: account
-- deletion must be able to cascade through user-owned reward rows.  Direct
-- client deletes remain unavailable through table privileges and RLS.
-- Presentation state is excluded because its lease/render/acknowledgement
-- lifecycle is mutable and service-owned.
create or replace function public.blundr_rewards_v2_reject_immutable_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception '% rows are immutable', tg_table_name using errcode = '55000';
end;
$$;

create trigger blundr_reward_transactions_v2_immutable
before update on public.blundr_reward_transactions_v2
for each row execute function public.blundr_rewards_v2_reject_immutable_mutation();
create trigger blundr_reward_grants_v2_immutable
before update on public.blundr_reward_grants_v2
for each row execute function public.blundr_rewards_v2_reject_immutable_mutation();
create trigger blundr_reward_inventory_events_v2_immutable
before update on public.blundr_reward_inventory_events_v2
for each row execute function public.blundr_rewards_v2_reject_immutable_mutation();

create trigger blundr_reward_inventory_v2_touch_updated_at
before update on public.blundr_reward_inventory_v2
for each row execute function public.blundr_touch_updated_at();
create trigger blundr_reward_presentations_v2_touch_updated_at
before update on public.blundr_reward_presentations_v2
for each row execute function public.blundr_touch_updated_at();

-- PR-03 must replace this shell with the only reward transaction writer.  It
-- intentionally performs no write: without server HMAC randomness, recording
-- a random-reward miss would fabricate an audit result.
create or replace function public.blundr_apply_reward_transaction_v2(
  p_user_id uuid,
  p_completion_id text,
  p_source text,
  p_evidence_id text,
  p_idempotency_key text,
  p_policy_version text,
  p_randomness_key_version text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user_id is null
    or nullif(btrim(p_completion_id), '') is null
    or nullif(btrim(p_source), '') is null
    or nullif(btrim(p_evidence_id), '') is null
    or nullif(btrim(p_idempotency_key), '') is null
    or nullif(btrim(p_policy_version), '') is null then
    raise exception 'invalid_reward_transaction_request';
  end if;

  raise exception using
    errcode = 'P0001',
    message = 'blundr_rewards_v2_transaction_unavailable',
    detail = 'No grant, inventory event, presentation, or random-reward result was recorded.',
    hint = 'PR-03 must validate owned completion evidence and evaluate server HMAC randomness.';
end;
$$;

-- This is one atomic RPC boundary for the eventual debit-plus-unlock flow.
-- The caller must name the requested opening and spend kind; the server never
-- selects an opening.  Until PR-03 validates eligibility and inventory it
-- fails closed before mutating either balance or ledger.
create or replace function public.blundr_spend_inventory_and_unlock_v2(
  p_user_id uuid,
  p_opening_id text,
  p_inventory_kind text,
  p_idempotency_key text,
  p_policy_version text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user_id is null
    or nullif(btrim(p_opening_id), '') is null
    or p_inventory_kind not in ('opening_fragment', 'choice_token')
    or nullif(btrim(p_idempotency_key), '') is null
    or nullif(btrim(p_policy_version), '') is null then
    raise exception 'invalid_inventory_unlock_request';
  end if;

  raise exception using
    errcode = 'P0001',
    message = 'blundr_rewards_v2_inventory_unlock_unavailable',
    detail = 'No inventory debit, unlock, event, or presentation was recorded.',
    hint = 'PR-03 must validate the user-selected eligible opening and commit spend plus unlock atomically.';
end;
$$;

revoke all on function public.blundr_rewards_v2_reject_immutable_mutation()
  from public, anon, authenticated;
revoke all on function public.blundr_apply_reward_transaction_v2(uuid, text, text, text, text, text, text)
  from public, anon, authenticated;
revoke all on function public.blundr_spend_inventory_and_unlock_v2(uuid, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.blundr_apply_reward_transaction_v2(uuid, text, text, text, text, text, text)
  to service_role;
grant execute on function public.blundr_spend_inventory_and_unlock_v2(uuid, text, text, text, text)
  to service_role;
