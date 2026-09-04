# Commercial Paywall Enforcement Wave 2B

Scope: non-production paywall UX, Settings Billing controls, paid-offer
acknowledgement, and application-wide Free/Pro enforcement. Production was not
touched. This wave does not deploy, activate live Stripe, apply production
migrations, send lifecycle email, or add launch analytics.

## Feature IDs

- `BILLING-ENTITLEMENT-001`
- `COMMERCIAL-LAUNCH-001`
- `ONBOARD-001`
- `REPERTOIRE-001`
- `TRAIN-RUNTIME-001`
- `REVIEW-SRS-001`

## Free/Pro Matrix

Blundr Free:

- $0, no card, no ads.
- Up to 3 active unlocked openings.
- Unlimited Train inside the active openings.
- Assisted and plain training, Continuation Play, rewards, rings, streaks,
  basic progress, and minigames remain available.
- Daily Blundr is capped at 5 completed cards per user-local day.
- Review Queue is capped at 5 completed positions per user-local day.
- Premium mastery, weak-area, trend, and next-action intelligence is omitted
  from backend/API responses.

Blundr Pro:

- Unlimited active repertoire and Train.
- Daily Blundr target from 1 to 99.
- All available Review Queue items.
- Complete mastery, weak-area, trend, progress, and next-action intelligence.
- Same rings, streaks, rewards, and minigames as Free. Pro receives no reward
  multiplier.

## Authority Path

- Trusted access resolution lives in `lib/blundr/commercial`.
- Protected decisions read `blundr_trusted_entitlements`, scoped by billing
  environment and `entitlement_identifier = 'pro'`.
- Missing, inactive, expired, or unreadable trusted entitlement state resolves
  to Free.
- Stripe Checkout and Customer Portal continue to use the Wave 2A server-only
  endpoints.
- RevenueCat-normalized backend entitlement state controls Pro access. Checkout
  success redirects and browser state never grant Pro.

## Paid Offer Consent

- Offer version: `paid-offer-v1`
- Legal version: `subscription-terms-20260904`
- Persistence:
  `supabase/migrations/20260904170758_blundr_paywall_enforcement_authority.sql`
  adds `blundr_paid_offer_acceptances`.
- The browser requests an offer with only `monthly` or `annual`.
- The server records the authenticated user UUID, selected plan, displayed
  price/interval, trial eligibility, disclosed conversion timestamp, and offer
  expiry.
- Checkout requires an unexpired accepted offer. Duplicate checkout clicks can
  claim an offer only once.
- Abandoned Checkout does not consume introductory trial eligibility; provider
  confirmation still owns final trial consumption.

## Downgrade Behavior

When Pro expires, the resolver returns Free:

- Daily effective target becomes 5 while the stored Pro preference is
  preserved for later restoration.
- Review completion limit becomes 5 per local day.
- Premium Progress fields are omitted.
- If more than 3 openings are unlocked, the user must choose 3 active Free
  openings. Other openings, mastery, history, queued reviews, rings, streaks,
  and rewards remain saved.
- Resubscription restores unlimited active repertoire without rebuilding data.

## Enforcement Map

- Repertoire and Train:
  `lib/blundr/gameData/gameDataService.ts` and
  `lib/blundr/openingAccess` apply Free active-opening policy before training
  access is granted.
- Active-opening selection:
  `/api/blundr/repertoire/active-openings` writes only through authenticated,
  ownership-protected server code.
- Daily Blundr:
  `productionDailyService.server.ts` caps reservations and rejects a sixth Free
  card completion in the authoritative action path.
- Review Queue:
  `dailyReviewLimit.server.ts` and `reviewQueueRepository.server.ts` enforce
  five Free completions per local day and leave Pro unlimited.
- Progress:
  `durableProgressSummary.server.ts` removes premium weak-area,
  recommendation, and next-action fields for Free users.
- Rewards, rings, and minigames:
  unchanged by this wave.

## Environment Contract

Required server-only variables remain those from Wave 2A:

- `BLUNDR_BILLING_ENVIRONMENT`
- `BLUNDR_APP_ORIGIN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_MONTHLY_PRICE_ID`
- `STRIPE_PRO_ANNUAL_PRICE_ID`
- `REVENUECAT_WEBHOOK_AUTHORIZATION`

Optional server-only variable:

- `REVENUECAT_REST_API_KEY`

No billing or service-role secret may be exposed as `NEXT_PUBLIC_*`.

## Dashboard Proof Checklist

Read-only operator proof is required before production activation:

- Confirm the Stripe key is test-mode; abort if a live key is present.
- Confirm the monthly price is active, recurring monthly, and exactly $9.99.
- Confirm the annual price is active, recurring yearly, and exactly $69.99.
- Confirm hosted Checkout and Customer Portal configuration are accessible.
- Confirm RevenueCat entitlement identifier is exactly `pro`.
- Confirm RevenueCat offering identifier is exactly `default`.
- Confirm Stripe monthly and annual products are mapped as web products.
- Confirm RevenueCat Test Store products are not used for real web Checkout.
- Confirm sandbox/test configuration is isolated from production/live.

## Tax

Automatic tax remains disabled. User-facing billing disclosure continues to say
`plus applicable taxes`. Tax geography and international sales handling remain a
production-launch blocker.

## Rollback Or Disable

- Hide or disable paywall entry points.
- Remove or withhold Stripe and RevenueCat server secrets; Checkout, Portal,
  and webhook paths fail closed.
- Keep webhook processing available for already-created subscriptions when
  possible.
- Do not grant Pro through Auth metadata or manual client state.
- Do not delete repertoire, mastery, Review, reward, or ring data on downgrade.

## Acceptance Evidence To Record

- Focused paywall, billing, entitlement, and architecture tests passed locally
  on the Wave 2B branch.
- Disposable-only billing RLS/security gate with migrations through
  `20260904170758` passed in GitHub Actions on 2026-09-04: run
  `33903045519` tested SHA
  `907a0deb50c1967a3f0413f639f411cefc157564`, rebuilt the disposable
  Supabase project from local migrations, verified remote migration count 47
  and head `20260904170758`, ran
  `tests/security/billingAuthority.integration.test.ts`, and completed
  disposable cleanup.
- Migration verifier, unit tests, component/integration tests affected,
  typecheck, lint, build, secret/browser-bundle audit, responsive QA, and
  `git diff --check`.

## Known Blockers

- Production deployment is out of scope.
- Live Stripe activation is out of scope.
- Production migration application is out of scope.
- Stripe and RevenueCat dashboard proof is pending unless safe test credentials
  are configured.
- Tax geography is undecided.
- Lifecycle email delivery and launch analytics belong to later waves.
