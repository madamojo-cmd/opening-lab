# Commercial Billing Authority Wave 2A

Scope: non-production backend foundation for web billing and trusted Pro
entitlement authority. Production was not touched. This wave does not enable
live mode, a final paywall UI, lifecycle email delivery, analytics, or
application-wide Free/Pro feature gates. Wave 2B adds those gates in
`docs/operations/commercial-paywall-enforcement-wave2b-20260904.md`.

## Feature ID

- `BILLING-ENTITLEMENT-001`

## Authority Path

- UI/client: future paywall sends only `{ "plan": "monthly" }` or
  `{ "plan": "annual" }` to `/api/blundr/billing/checkout`.
- Server route: `getCurrentBlundrUser({ allowLocalFallback: false })`
  authenticates the caller and derives the Supabase user UUID.
- Billing core: `lib/blundr/billing` maps the plan enum to the locked Stripe
  test price IDs, creates or reuses one Stripe customer mapping, reserves trial
  eligibility, and creates hosted Checkout.
- Persistence: `supabase/migrations/20260904135434_blundr_billing_entitlement_authority.sql`
  adds customer mappings, provider subscription facts, trusted entitlement
  state, a provider event ledger, and trial eligibility.
- Provider callbacks: Stripe webhooks persist billing facts only. RevenueCat
  webhooks and reconciliation own trusted `pro` entitlement state.

## Locked Test Configuration

- Monthly web price: `price_1UBaUQLGvBclDkdEYam8Nz43`
- Annual web price: `price_1UBaUQLGvBclDkdEZNLeAfpq`
- Trial: 7 days, payment method required, automatic renewal.
- RevenueCat entitlement identifier: `pro`
- RevenueCat offering: `default`
- RevenueCat App User ID: authenticated Supabase user UUID.
- Stripe metadata key: `app_user_id`

## Environment Contract

Required server variables:

- `BLUNDR_BILLING_ENVIRONMENT`: `test` only in Wave 2A. `live` fails closed.
- `BLUNDR_APP_ORIGIN`: canonical HTTPS application origin. Localhost is allowed
  for local development.
- `STRIPE_SECRET_KEY`: server-only Stripe secret key.
- `STRIPE_WEBHOOK_SECRET`: server-only Stripe webhook signing secret.
- `STRIPE_PRO_MONTHLY_PRICE_ID`: must exactly equal the locked monthly test
  price ID.
- `STRIPE_PRO_ANNUAL_PRICE_ID`: must exactly equal the locked annual test price
  ID.
- `REVENUECAT_WEBHOOK_AUTHORIZATION`: exact authorization header expected from
  RevenueCat.

Optional server variable:

- `REVENUECAT_REST_API_KEY`: server-only key for deterministic subscriber
  reconciliation.

Do not expose any of these as `NEXT_PUBLIC_*`. Price IDs may be configured, but
the server still rejects any value that differs from the locked Wave 2A test
configuration.

## Trust Boundaries

Never grants protected access:

- browser redirect or success URL;
- URL query parameter;
- client-supplied price ID, customer ID, App User ID, trial state, or entitlement
  state;
- Supabase `user_metadata` or `raw_user_meta_data`;
- client RevenueCat SDK state;
- Stripe Checkout completion without RevenueCat normalization or reconciliation.

Stripe owns payment and billing objects. Stripe webhook events write billing
facts and trial consumption evidence, but do not write trusted Pro entitlement.
RevenueCat normalizes provider entitlement state across web, Apple, and Google.
The Blundr backend persists the trusted `pro` entitlement snapshot after
RevenueCat webhook or reconciliation input is authenticated, environment-bound,
idempotent, and mapped to an existing Supabase UUID.

## Webhook Policy

Stripe:

- `/api/blundr/billing/stripe/webhook` reads the raw request body with
  `request.text()` and verifies the `stripe-signature` header before processing.
- Provider event IDs are stored idempotently by provider and billing
  environment.
- Subscription events update billing facts only.
- Missing identity metadata is retryable.
- Older subscription facts do not overwrite newer facts.
- Secrets and full provider payloads are not logged or stored.

RevenueCat:

- `/api/blundr/billing/revenuecat/webhook` requires the exact configured
  authorization header using constant-time comparison when practical.
- `app_user_id` must be a Supabase UUID and must resolve to an existing account.
- `entitlement_id` or `entitlement_ids` must identify `pro`.
- Sandbox events are accepted only for the Wave 2A test environment; production
  events are ignored in test mode.
- Duplicate events are harmless.
- Out-of-order events cannot overwrite newer entitlement state.
- Cancellation, billing issue, and paused events preserve access until
  expiration.
- Expiration revokes access.
- Renewal, restoration, uncancellation, extension, and purchase events restore
  access when provider-confirmed expiration remains active.
- Alias or transfer events involving another Supabase UUID fail safely for
  manual reconciliation instead of allowing one Blundr account to claim another.

## Trial Eligibility

Trial eligibility is stored per Supabase user and billing environment.
Checkout reservation is concurrency-safe and retry-safe:

- a live reservation is reused for duplicate Checkout clicks;
- the reservation does not mark the trial consumed;
- abandoned Checkout ages out without permanently consuming trial eligibility;
- provider-confirmed trial evidence from Stripe or RevenueCat marks the trial
  consumed;
- consumed accounts cannot receive another introductory trial by creating
  another Stripe customer.

## Operator Setup

1. Configure the Stripe test monthly and annual products with the locked price
   IDs.
2. Configure Stripe hosted Customer Portal for the test project.
3. Register the Stripe webhook endpoint and set `STRIPE_WEBHOOK_SECRET`.
4. Configure RevenueCat entitlement `pro`, offering `default`, and map the Stripe
   web products to monthly and annual packages.
5. Register the RevenueCat webhook endpoint and set
   `REVENUECAT_WEBHOOK_AUTHORIZATION`.
6. Set all variables only in the server runtime environment.
7. Apply the migration only to a disposable database before any staging or
   production promotion. Wave 2A disposable proof passed on 2026-09-04.

## Rollback Or Disable

- Remove or withhold `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, or
  `REVENUECAT_WEBHOOK_AUTHORIZATION`; billing endpoints fail closed.
- Keep existing entitlement rows for audit. Do not manually grant Pro by editing
  metadata.
- Disable future paywall UI entry points while leaving webhooks available to
  process already-created provider events.
- If a provider identity conflict occurs, leave the event ignored/manual and run
  deterministic RevenueCat reconciliation after operator review.

## Acceptance Evidence

- Checkpoint commit preserving the implementation before disposable-network
  recovery: `d9f8b1fbf07a6a93aba8e40d919fb4e23e1db26c`.
- Dedicated disposable billing RLS gate:
  `https://github.com/madamojo-cmd/opening-lab/actions/runs/33892448684`.
- Tested SHA:
  `257f0c4317224dc456d6e234f65ada55c8c2325c`.
- The dedicated gate rebuilt the disposable Supabase project from local
  migrations, verified remote migration count `46` and head
  `20260904135434`, ran
  `npm run test:billing-rls-authority`, and completed disposable cleanup.
- The billing RLS proof covered own-row reads, cross-user read isolation,
  client insert/update/delete denial for billing customer mappings,
  subscriptions, trusted entitlements, provider events, and trial eligibility,
  service-only trial reconciliation RPCs, and sandbox/production entitlement
  row isolation.
- Production and staging were not touched.

## Known Manual Blockers

- Production deployment and live-mode activation are not authorized.
- Tax geography and automatic-tax policy are undecided; automatic tax remains
  disabled in this wave.
- Stripe dashboard product, portal, and webhook settings need operator proof.
- RevenueCat dashboard integration, offering, entitlement, webhook secret, and
  Stripe product mapping need operator proof.
- Final paywall UI and application-wide Free/Pro gates move to Wave 2B.

## Documentation References

- Stripe Checkout Session create API: https://docs.stripe.com/api/checkout/sessions/create
- Stripe webhook signature verification: https://docs.stripe.com/webhooks/signature
- Stripe Customer Portal session create API: https://docs.stripe.com/api/customer_portal/sessions/create
- RevenueCat webhooks event fields: https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields
- RevenueCat REST subscriber API: https://www.revenuecat.com/docs/api-v1/subscribers
