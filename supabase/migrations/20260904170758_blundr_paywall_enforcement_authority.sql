-- Wave 2B: additive paywall, offer consent, and Free active-opening authority.
--
-- Paid access decisions still come only from blundr_trusted_entitlements.
-- Browser plan intent, redirects, Auth metadata, and client-supplied billing
-- data cannot grant Pro or mutate authoritative billing fields.

begin;

create table if not exists public.blundr_paid_offer_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  billing_environment text not null,
  offer_version text not null,
  legal_version text not null,
  selected_plan text not null,
  displayed_price_cents integer not null,
  displayed_currency text not null default 'usd',
  displayed_interval text not null,
  trial_eligible boolean not null,
  trial_reservation_id uuid,
  disclosed_conversion_at timestamptz not null,
  cancel_before_at timestamptz,
  displayed_at timestamptz not null default now(),
  accepted_at timestamptz,
  expires_at timestamptz not null,
  checkout_session_id text,
  checkout_started_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blundr_paid_offer_acceptances_identity_check check (
    billing_environment in ('test', 'live')
    and offer_version in ('paid-offer-v1')
    and legal_version in ('subscription-terms-20260904')
    and selected_plan in ('monthly', 'annual')
    and displayed_price_cents in (999, 6999)
    and displayed_currency = 'usd'
    and displayed_interval in ('month', 'year')
    and expires_at > displayed_at
    and (checkout_session_id is null or checkout_session_id ~ '^cs_[A-Za-z0-9_]+$')
    and (
      (trial_eligible and trial_reservation_id is not null and cancel_before_at is not null)
      or (not trial_eligible and trial_reservation_id is null)
    )
    and (
      checkout_started_at is null
      or accepted_at is not null
    )
  )
);

create table if not exists public.blundr_free_active_opening_selections (
  user_id uuid not null references auth.users(id) on delete cascade,
  billing_environment text not null,
  active_opening_ids text[] not null default '{}'::text[],
  selection_required boolean not null default false,
  previous_pro_daily_blundr_card_goal integer,
  selected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, billing_environment),
  constraint blundr_free_active_opening_selections_identity_check check (
    billing_environment in ('test', 'live')
    and cardinality(active_opening_ids) <= 3
    and coalesce(array_position(active_opening_ids, null), 0) = 0
    and (
      previous_pro_daily_blundr_card_goal is null
      or previous_pro_daily_blundr_card_goal between 1 and 99
    )
  )
);

create index if not exists idx_blundr_paid_offer_acceptances_user
  on public.blundr_paid_offer_acceptances (
    user_id,
    billing_environment,
    selected_plan,
    displayed_at desc
  );

alter table public.blundr_paid_offer_acceptances enable row level security;
alter table public.blundr_free_active_opening_selections enable row level security;

revoke all on public.blundr_paid_offer_acceptances,
  public.blundr_free_active_opening_selections
  from public, anon, authenticated;

grant select on public.blundr_paid_offer_acceptances,
  public.blundr_free_active_opening_selections
  to authenticated;

grant select, insert, update, delete on public.blundr_paid_offer_acceptances,
  public.blundr_free_active_opening_selections
  to service_role;

create policy blundr_paid_offer_acceptances_select_own
  on public.blundr_paid_offer_acceptances for select to authenticated
  using (user_id = auth.uid());

create policy blundr_free_active_opening_selections_select_own
  on public.blundr_free_active_opening_selections for select to authenticated
  using (user_id = auth.uid());

create trigger blundr_paid_offer_acceptances_touch_updated_at
before update on public.blundr_paid_offer_acceptances
for each row execute function public.blundr_touch_updated_at();

create trigger blundr_free_active_opening_selections_touch_updated_at
before update on public.blundr_free_active_opening_selections
for each row execute function public.blundr_touch_updated_at();

commit;
