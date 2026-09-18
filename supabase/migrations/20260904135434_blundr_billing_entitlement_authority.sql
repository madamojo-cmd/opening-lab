-- Wave 2A: additive billing and entitlement authority foundation.
--
-- Stripe owns payment objects. RevenueCat-normalized provider evidence controls
-- the trusted Blundr Pro entitlement. Browser redirects, client metadata, Auth
-- user metadata, and Checkout completion rows are never entitlement authority.

begin;

create table if not exists public.blundr_billing_customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  billing_environment text not null,
  stripe_customer_id text,
  revenuecat_app_user_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  provider_created_at timestamptz,
  provider_updated_at timestamptz,
  unique (user_id, billing_environment),
  unique (billing_environment, stripe_customer_id),
  unique (billing_environment, revenuecat_app_user_id),
  constraint blundr_billing_customers_identity_check check (
    billing_environment in ('test', 'live', 'sandbox', 'production')
    and revenuecat_app_user_id = user_id::text
    and (stripe_customer_id is null or stripe_customer_id ~ '^cus_[A-Za-z0-9]+$')
  )
);

create table if not exists public.blundr_billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  billing_environment text not null,
  provider text not null,
  provider_customer_id text not null,
  provider_subscription_id text not null,
  provider_product_id text,
  provider_price_id text,
  plan_interval text,
  status text not null,
  trial_start_at timestamptz,
  trial_end_at timestamptz,
  current_period_end_at timestamptz,
  cancel_at_period_end boolean not null default false,
  expires_at timestamptz,
  last_provider_event_at timestamptz,
  last_reconciled_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, billing_environment, provider_subscription_id),
  constraint blundr_billing_subscriptions_identity_check check (
    provider in ('stripe', 'revenuecat')
    and billing_environment in ('test', 'live', 'sandbox', 'production')
    and (plan_interval is null or plan_interval in ('monthly', 'annual'))
    and char_length(btrim(provider_customer_id)) between 1 and 240
    and char_length(btrim(provider_subscription_id)) between 1 and 240
    and (provider_product_id is null or char_length(btrim(provider_product_id)) between 1 and 240)
    and (provider_price_id is null or char_length(btrim(provider_price_id)) between 1 and 240)
    and jsonb_typeof(metadata) = 'object'
  )
);

create table if not exists public.blundr_trusted_entitlements (
  user_id uuid not null references auth.users(id) on delete cascade,
  billing_environment text not null,
  entitlement_identifier text not null,
  active boolean not null default false,
  source_provider text not null,
  expires_at timestamptz,
  last_verified_at timestamptz not null,
  last_provider_event_at timestamptz,
  provider_subscription_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, billing_environment, entitlement_identifier),
  constraint blundr_trusted_entitlements_identity_check check (
    billing_environment in ('test', 'live', 'sandbox', 'production')
    and entitlement_identifier in ('pro')
    and source_provider in ('revenuecat')
    and jsonb_typeof(metadata) = 'object'
  )
);

create table if not exists public.blundr_billing_provider_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  billing_environment text not null,
  event_occurred_at timestamptz,
  processing_status text not null default 'received',
  retry_count integer not null default 0,
  error_code text,
  normalized_facts jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (provider, billing_environment, provider_event_id),
  constraint blundr_billing_provider_events_identity_check check (
    provider in ('stripe', 'revenuecat')
    and billing_environment in ('test', 'live', 'sandbox', 'production')
    and char_length(btrim(provider_event_id)) between 1 and 240
    and char_length(btrim(event_type)) between 1 and 240
    and processing_status in ('received', 'processed', 'ignored', 'retryable_error', 'permanent_error')
    and retry_count >= 0
    and jsonb_typeof(normalized_facts) = 'object'
  )
);

create table if not exists public.blundr_billing_trial_eligibility (
  user_id uuid not null references auth.users(id) on delete cascade,
  billing_environment text not null,
  consumed_at timestamptz,
  consumed_provider text,
  consumed_provider_subscription_id text,
  active_reservation_id uuid,
  reservation_expires_at timestamptz,
  checkout_session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, billing_environment),
  constraint blundr_billing_trial_eligibility_identity_check check (
    billing_environment in ('test', 'live', 'sandbox', 'production')
    and (consumed_provider is null or consumed_provider in ('stripe', 'revenuecat'))
    and (
      (consumed_at is null and consumed_provider is null)
      or (consumed_at is not null and consumed_provider is not null)
    )
    and (checkout_session_id is null or checkout_session_id ~ '^cs_[A-Za-z0-9_]+$')
  )
);

create index if not exists idx_blundr_billing_subscriptions_user
  on public.blundr_billing_subscriptions (user_id, billing_environment, provider, updated_at desc);
create index if not exists idx_blundr_trusted_entitlements_user
  on public.blundr_trusted_entitlements (user_id, billing_environment, active, expires_at);
create index if not exists idx_blundr_billing_events_status
  on public.blundr_billing_provider_events (provider, billing_environment, processing_status, received_at);

alter table public.blundr_billing_customers enable row level security;
alter table public.blundr_billing_subscriptions enable row level security;
alter table public.blundr_trusted_entitlements enable row level security;
alter table public.blundr_billing_provider_events enable row level security;
alter table public.blundr_billing_trial_eligibility enable row level security;

revoke all on public.blundr_billing_customers,
  public.blundr_billing_subscriptions,
  public.blundr_trusted_entitlements,
  public.blundr_billing_provider_events,
  public.blundr_billing_trial_eligibility
  from public, anon, authenticated;

grant select on public.blundr_billing_customers,
  public.blundr_billing_subscriptions,
  public.blundr_trusted_entitlements,
  public.blundr_billing_trial_eligibility
  to authenticated;

create policy blundr_billing_customers_select_own
  on public.blundr_billing_customers for select to authenticated
  using (user_id = auth.uid());
create policy blundr_billing_subscriptions_select_own
  on public.blundr_billing_subscriptions for select to authenticated
  using (user_id = auth.uid());
create policy blundr_trusted_entitlements_select_own
  on public.blundr_trusted_entitlements for select to authenticated
  using (user_id = auth.uid());
create policy blundr_billing_trial_eligibility_select_own
  on public.blundr_billing_trial_eligibility for select to authenticated
  using (user_id = auth.uid());

create trigger blundr_billing_customers_touch_updated_at
before update on public.blundr_billing_customers
for each row execute function public.blundr_touch_updated_at();
create trigger blundr_billing_subscriptions_touch_updated_at
before update on public.blundr_billing_subscriptions
for each row execute function public.blundr_touch_updated_at();
create trigger blundr_trusted_entitlements_touch_updated_at
before update on public.blundr_trusted_entitlements
for each row execute function public.blundr_touch_updated_at();
create trigger blundr_billing_trial_eligibility_touch_updated_at
before update on public.blundr_billing_trial_eligibility
for each row execute function public.blundr_touch_updated_at();

create or replace function public.blundr_preserve_newer_billing_fact_v1()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'UPDATE'
    and old.last_provider_event_at is not null
    and new.last_provider_event_at is not null
    and old.last_provider_event_at > new.last_provider_event_at then
    return old;
  end if;
  return new;
end;
$$;

create trigger blundr_billing_subscriptions_preserve_newer_event
before update on public.blundr_billing_subscriptions
for each row execute function public.blundr_preserve_newer_billing_fact_v1();

create trigger blundr_trusted_entitlements_preserve_newer_event
before update on public.blundr_trusted_entitlements
for each row execute function public.blundr_preserve_newer_billing_fact_v1();

create or replace function public.blundr_reserve_pro_trial_v1(
  p_user_id uuid,
  p_billing_environment text,
  p_reservation_minutes integer default 1440
) returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_row public.blundr_billing_trial_eligibility%rowtype;
  v_now timestamptz := now();
begin
  if p_user_id is null
    or p_billing_environment not in ('test', 'live', 'sandbox', 'production')
    or p_reservation_minutes is null
    or p_reservation_minutes < 1
    or p_reservation_minutes > 1440 then
    raise exception using errcode='22023', message='invalid_trial_reservation_request';
  end if;

  insert into public.blundr_billing_trial_eligibility(user_id, billing_environment)
  values (p_user_id, p_billing_environment)
  on conflict (user_id, billing_environment) do nothing;

  select * into v_row from public.blundr_billing_trial_eligibility
  where user_id = p_user_id and billing_environment = p_billing_environment
  for update;

  if v_row.consumed_at is not null then
    return jsonb_build_object('eligible', false, 'reason', 'trial_consumed');
  end if;

  if v_row.active_reservation_id is null
    or v_row.reservation_expires_at is null
    or v_row.reservation_expires_at <= v_now then
    update public.blundr_billing_trial_eligibility
    set active_reservation_id = gen_random_uuid(),
        reservation_expires_at = v_now + make_interval(mins => p_reservation_minutes),
        checkout_session_id = null
    where user_id = p_user_id and billing_environment = p_billing_environment
    returning * into v_row;
  end if;

  return jsonb_build_object(
    'eligible', true,
    'reservationId', v_row.active_reservation_id,
    'reservationExpiresAt', v_row.reservation_expires_at
  );
end;
$$;

create or replace function public.blundr_record_checkout_trial_session_v1(
  p_user_id uuid,
  p_billing_environment text,
  p_reservation_id uuid,
  p_checkout_session_id text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_row public.blundr_billing_trial_eligibility%rowtype;
begin
  if p_user_id is null
    or p_billing_environment not in ('test', 'live', 'sandbox', 'production')
    or p_reservation_id is null
    or nullif(btrim(p_checkout_session_id), '') is null then
    raise exception using errcode='22023', message='invalid_trial_checkout_record';
  end if;

  select * into v_row from public.blundr_billing_trial_eligibility
  where user_id = p_user_id and billing_environment = p_billing_environment
  for update;

  if not found
    or v_row.consumed_at is not null
    or v_row.active_reservation_id is distinct from p_reservation_id
    or v_row.reservation_expires_at <= now() then
    raise exception using errcode='40901', message='trial_reservation_not_active';
  end if;

  update public.blundr_billing_trial_eligibility
  set checkout_session_id = p_checkout_session_id
  where user_id = p_user_id and billing_environment = p_billing_environment;

  return jsonb_build_object('recorded', true);
end;
$$;

create or replace function public.blundr_mark_pro_trial_consumed_v1(
  p_user_id uuid,
  p_billing_environment text,
  p_provider text,
  p_provider_subscription_id text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_row public.blundr_billing_trial_eligibility%rowtype;
begin
  if p_user_id is null
    or p_billing_environment not in ('test', 'live', 'sandbox', 'production')
    or p_provider not in ('stripe', 'revenuecat')
    or nullif(btrim(p_provider_subscription_id), '') is null then
    raise exception using errcode='22023', message='invalid_trial_consumption_request';
  end if;

  insert into public.blundr_billing_trial_eligibility(user_id, billing_environment)
  values (p_user_id, p_billing_environment)
  on conflict (user_id, billing_environment) do nothing;

  update public.blundr_billing_trial_eligibility
  set consumed_at = coalesce(consumed_at, now()),
      consumed_provider = coalesce(consumed_provider, p_provider),
      consumed_provider_subscription_id = coalesce(consumed_provider_subscription_id, p_provider_subscription_id),
      active_reservation_id = null,
      reservation_expires_at = null
  where user_id = p_user_id and billing_environment = p_billing_environment
  returning * into v_row;

  return jsonb_build_object(
    'consumed', true,
    'consumedAt', v_row.consumed_at,
    'providerSubscriptionId', v_row.consumed_provider_subscription_id
  );
end;
$$;

revoke all on function public.blundr_reserve_pro_trial_v1(uuid, text, integer)
  from public, anon, authenticated;
revoke all on function public.blundr_record_checkout_trial_session_v1(uuid, text, uuid, text)
  from public, anon, authenticated;
revoke all on function public.blundr_mark_pro_trial_consumed_v1(uuid, text, text, text)
  from public, anon, authenticated;
revoke all on function public.blundr_preserve_newer_billing_fact_v1()
  from public, anon, authenticated;
grant execute on function public.blundr_reserve_pro_trial_v1(uuid, text, integer)
  to service_role;
grant execute on function public.blundr_record_checkout_trial_session_v1(uuid, text, uuid, text)
  to service_role;
grant execute on function public.blundr_mark_pro_trial_consumed_v1(uuid, text, text, text)
  to service_role;

commit;
