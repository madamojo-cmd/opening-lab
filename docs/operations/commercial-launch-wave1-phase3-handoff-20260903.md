# Commercial Launch Wave 1 Phase 3 Handoff

Date: 2026-09-03

## Source recovery

- Expected branch: `launch/market-phase3-canonical-landing`
- Expected SHA: `01b8d0bb795bc3ff67eac22361b89f9006a8c39a`
- Accepted base SHA: `5a011d5aba499be99bd62361e0031ed03269c65a`
- Result: found locally, not present as a remote branch after `git fetch --all --prune`
- Local branch: `launch/market-phase3-canonical-landing`
- Recovery evidence: local ref points to `01b8d0bb795bc3ff67eac22361b89f9006a8c39a`; merge-base with accepted base is exactly `5a011d5aba499be99bd62361e0031ed03269c65a`; reflog shows branch creation from the accepted base on 2026-08-31 and commit `Integrate launch landing and onboarding polish`
- Clean validation worktree: `/tmp/opening-lab-phase3-validation`

The supplied file `BLUNDR_FINAL_COMMERCIAL_LAUNCH_HANDOFF(1).md` was not present in the workspace. This wave used the prompt as the binding handoff, plus the recovered branch evidence and the two supplied ZIP packages.

## Integration status

- Landing assets: all seven supplied PNGs are present under `public/assets/landing` and match `blundr_landing_final_assets.zip` by SHA-256.
- Legal package: all seven supplied Markdown documents are installed under `content/legal` and mirrored under `docs/legal/commercial-launch-20260831`.
- Legal routes: `/pricing`, `/terms`, `/privacy`, `/subscription-terms`, `/cookies`, and `/legal` render the canonical Markdown sources.
- Onboarding presentation: V11 includes a final plan-selection step for Free, Pro Monthly intent, and Pro Annual intent.
- Billing authority: not implemented in this wave. Pro selection stores only `blundr_launch_plan_intent` in Supabase Auth user metadata and does not grant Pro, create checkout, create billing tables, or create an entitlement.
- Signup language: visible account confirmation uses the canonical 16+ Terms/Privacy language. The previous `age_13_confirmed` metadata key remains written/read for backward compatibility until durable versioned consent is implemented.

## Wave 1B stabilization status

- Checkpoint commit: `d1d5418e8934b14575f76290cc124f5911b78908` (`Checkpoint Phase 3 launch experience integration`). This checkpoint is not an accepted launch SHA.
- Unit failure diagnosis: the six failing files reproduced on the recovered candidate SHA `01b8d0bb795bc3ff67eac22361b89f9006a8c39a`, so they were not Wave 1 regressions. Root causes were stale Node-test/Vitest interop, a stale time-based progress fixture, a brittle CSS whitespace assertion, and a PR-03 reward-presentation expectation that no longer matched the current hydrated reward writer.
- Stabilization repairs: `scripts/run-node-tests.mjs` now imports a test-only `server-only` preload for Node test execution; affected tests were converted to `node:test`, time assertions now use a current local date, projective tactic style assertions tolerate formatting, and PR-03 asserts the current pending-presentation/idempotency contract without weakening RLS or reward authority.
- Complete unit suite: `npm run test:unit` passed with 588 tests, 0 failures.
- Complete security/RLS suite: `BLUNDR_RLS_TEST_ENVIRONMENT_ROLE=disposable BLUNDR_RLS_TEST_PROJECT_REF=<disposable> NPM_CONFIG_CACHE=/tmp/npm-cache npm run test:security` passed with 28 tests, 0 failures against the disposable non-production Supabase environment.
- Public browser QA: `.tmp/phase3-browser-qa.mjs` passed against a local production server, covering landing responsive layouts, legal routes, signup legal links, and image loading.
- Typecheck: `npm run typecheck` passed.
- Lint: `npm run lint` passed with existing warnings and 0 errors.
- Production build: `npm run build` passed locally. Browser-auth QA builds were run only with non-production Supabase public env.
- Repository diff check: `git diff --check` passed.

## Wave 1B blockers

- Authenticated browser journey is not accepted. Both configured non-production Auth projects returned `over_email_send_rate_limit` for anonymous signup, so the required `Anonymous landing -> signup -> email-confirmation handling` segment could not be completed.
- Local Supabase could not be used in this runner: the Supabase CLI was not installed globally, `npx supabase@2.111.0` was inspected and usable, but Docker access to the local daemon was denied.
- Direct non-production Postgres migration access from this runner was blocked by network restrictions. The CLI reported a database connection refusal and recommended checking Supabase network restrictions.
- The disposable RLS database is behind the repository migration head for authenticated V11 browser use: it does not expose `blundr_user_profiles.daily_blundr_card_goal`.
- The dedicated staging database is also behind the V11 onboarding migration head for browser use: its `blundr_user_profiles_onboarding_step_check` rejects the `line-changes` step.
- No production deployment, production environment change, production database change, billing implementation, or entitlement implementation occurred.

## Wave 1C source-side recovery

- Source predecessor: `e0c42c35a8b7b0d47fc0f5ee4eeb0ba6134a3ec2`.
- New repository migration: `supabase/migrations/20260903155151_blundr_onboarding_v11_step_constraint_repair.sql`.
- Repository migration count: `45`.
- Repository migration head: `20260903155151`.
- Static migration verification: `npm run verify:migrations` passed with checksum `01cb7efe2a4634d9f8ce75d7b886e343e34a42b731582f98df508cd32dbd29d3`.
- Focused V11 schema contract: `lib/blundr/onboarding/__tests__/onboardingV11MigrationContract.test.ts` verifies that the database constraint values match `ONBOARDING_V11_STEPS`, including `line-changes` and `review`, and rejects unknown step values.
- CI migration evidence strings in `.github/workflows/blundr-release-candidate.yml` and `.github/workflows/blundr-daily-v3-disposable-gate.yml` now reference the 45-migration head and the 25-to-45 upgrade path.
- Staging read-only PostgREST schema check confirmed `daily_blundr_card_goal` and `onboarding_step` are visible.
- Disposable read-only PostgREST schema check confirmed `onboarding_step` is visible but `daily_blundr_card_goal` is absent with PostgreSQL error `42703`; this disposable target is not at repository migration head.
- Local Supabase validation is blocked in this runner by Docker/root filesystem exhaustion while pulling the official local stack images. Docker cleanup was not performed.
- Direct hosted Postgres migration access is blocked from this runner by network restrictions; the CLI connection attempts fail before migration history can be inspected or applied.
- Supabase CLI linking to the configured staging project returned `Unauthorized`, so staging migration application requires operator action with a valid non-production staging Supabase CLI/API authority.
- Staging-only operator handoff: `docs/operations/phase3-wave1c-staging-operator-handoff-20260903.md`.

## Remaining blockers

- Stripe Checkout
- RevenueCat
- Backend entitlement authority
- Durable versioned consent
- Account export/deletion
- Commercial analytics
- Lifecycle messaging
- Commercial QA
- Non-production Supabase migration-head reconciliation for authenticated browser acceptance
- Staging application of `20260903155151_blundr_onboarding_v11_step_constraint_repair.sql`
- Authenticated staging journey after schema alignment

`RELEASE-001` remains blocked. This handoff does not authorize production deployment, production database mutation, production environment changes, or commercial release.
