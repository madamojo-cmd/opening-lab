# Wave 2C/2D launch operations runbooks

These runbooks are operational mechanics only. They do not define final legal,
tax, or refund policy.

## Production Billing Cutover

SYMPTOM: Launch owner approves live billing.

CONFIRMATION: Exact release-candidate SHA is deployed, `/api/health` reports
that SHA, migrations are current, Wave 2B sandbox proof passed, and disposable
RLS gates passed.

SAFE ACTION: Configure live Stripe and RevenueCat values in the approved
production environment, enable live billing only through the documented
environment switch, and run a smoke test with a launch-owner account.

DO NOT DO: Do not reuse sandbox customer IDs, copy test secrets into production,
or enable live mode from an unverified SHA.

ROLLBACK: Restore the previous environment values and redeploy the previous
known-good SHA.

VERIFICATION: `/api/health`, Checkout creation, Customer Portal creation,
Stripe webhook delivery, RevenueCat webhook delivery, and Settings billing state
all match the expected live environment.

## Billing Rollback

SYMPTOM: Checkout, portal, webhook, or entitlement behavior is launch-blocking.

CONFIRMATION: Correlate the failing request with sanitized operational telemetry
and provider dashboard event IDs.

SAFE ACTION: Disable new live checkout creation, keep portal access available
where possible, and preserve webhook processing for existing customers.

DO NOT DO: Do not manually grant Pro from Stripe status or browser redirects.

ROLLBACK: Redeploy the prior SHA and restore the prior environment values.

VERIFICATION: Free users remain Free, existing trusted RevenueCat Pro users keep
valid access, and new Checkout creation is blocked or restored as intended.

## Entitlement Incident

SYMPTOM: A customer paid or started a trial but Blundr does not show Pro, or a
Free account appears to have Pro.

CONFIRMATION: Compare Stripe subscription metadata `app_user_id`, RevenueCat app
user ID, RevenueCat `pro` entitlement, `blundr_trusted_entitlements`, and
provider-event ledger rows.

SAFE ACTION: Replay or re-deliver the provider webhook after confirming the
provider event belongs to the authenticated Blundr user.

DO NOT DO: Do not edit Auth metadata, client storage, or browser state to grant
Pro.

ROLLBACK: Disable new checkout while preserving webhook intake if the defect is
systemic.

VERIFICATION: RevenueCat recognizes the customer, `pro` is active only for the
right user, and Blundr reports `entitlementSource = revenuecat`.

## Stripe Webhook Incident

SYMPTOM: Stripe events fail or duplicate events produce inconsistent state.

CONFIRMATION: Check Stripe delivery status, signature verification errors, and
`blundr_billing_provider_events` processing status.

SAFE ACTION: Fix configuration or replay Stripe events from the dashboard.

DO NOT DO: Do not bypass signature verification or accept browser-supplied
customer IDs.

ROLLBACK: Revert the webhook code SHA or disable new checkout if processing is
unsafe.

VERIFICATION: Unsigned webhooks fail, valid webhooks process once, duplicates
are idempotent, and subscriptions record provider facts without granting Pro.

## RevenueCat Webhook Incident

SYMPTOM: Stripe completes but Pro entitlement does not appear in Blundr.

CONFIRMATION: Confirm RevenueCat Stripe integration, app `appe3b4140fc1`,
offering `default`, entitlement `pro`, and webhook authorization header.

SAFE ACTION: Re-deliver the RevenueCat event or run the trusted reconciliation
path after confirming user identity.

DO NOT DO: Do not replace RevenueCat authority with Stripe status.

ROLLBACK: Pause checkout while preserving existing entitlements until provider
truth is confirmed.

VERIFICATION: `blundr_trusted_entitlements.source_provider = revenuecat` and
Settings reports Pro only for active RevenueCat entitlement.

## Refund Handling

SYMPTOM: A user requests a refund, reports a duplicate subscription, or disputes
a charge.

CONFIRMATION: Locate the user by authenticated account email, confirm Stripe
customer/subscription, and compare RevenueCat customer state.

SAFE ACTION: Process the refund in Stripe according to the owner-approved
policy, then verify RevenueCat and Blundr entitlement reconciliation.

DO NOT DO: Do not ask users for card numbers, passwords, or provider secrets.

ROLLBACK: If the refund was accidental, escalate to the owner and provider
support; do not silently recreate charges.

VERIFICATION: Stripe refund status, RevenueCat entitlement state, Blundr trusted
entitlement state, and support notes agree.

## Account Deletion Failure

SYMPTOM: Account deletion reports failure or a deleted account may still have an
active subscription.

CONFIRMATION: Check sanitized `account_deletion_failed` telemetry, Stripe
subscription status, and `blundr_account_deletion_audit`.

SAFE ACTION: Resolve provider cleanup first, then retry account deletion from an
authenticated session or an owner-approved admin procedure.

DO NOT DO: Do not delete the Supabase Auth user before active subscription
cleanup is confirmed.

ROLLBACK: If cleanup failed after a partial provider action, leave the account
intact and document the provider state before retrying.

VERIFICATION: No active paid subscription remains orphaned, auth identity is
deleted, sessions are invalid, and user-owned Blundr rows are removed by
cascade.

## Deployment Rollback

SYMPTOM: Release-candidate deployment causes product, billing, security, or
compliance regressions.

CONFIRMATION: Exact SHA, health identity, GitHub Actions result, and runtime
logs identify the bad candidate.

SAFE ACTION: Repoint the environment to the last verified SHA and keep database
migrations backward-compatible.

DO NOT DO: Do not reset production data, clean worktrees, or force-push release
branches.

ROLLBACK: Use the platform rollback to the last known-good deployment and
disable only the affected feature flag or environment value if needed.

VERIFICATION: Health identity matches the rollback SHA, smoke tests pass, and
affected telemetry quiets.
