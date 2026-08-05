# Blundr Production 3.99 Execution Status

Last updated: 2026-08-05 UTC

## Release identity

- Accepted baseline SHA: `3944da6472d0439b2087ce1e4648ffa6ea69f85e`
- Current accepted cumulative release SHA: `c7d4e9e091daecfb19e9933af174bcc6e73a5a7e`
- Active PR-01 integration head before this record update: `045e1b88f7d709474e420ae0133a0b7887167534`
- Release branch: `release/blundr-production-3.99`
- Accepted PRs: PR #2, PR-00 Restricted Trainer authority; PR #3, deterministic release verification sharding
- Active implementation PR: PR-01 contracts, flags, additive migrations, RPC shells, and verification hardening
- Rollback tag: `blundr-production-3.99-rollback-pr00`
- Rollback target: `da959d21aad06c1958c096b8dfef45217bbe26de`

## Branch and worktree ownership

- Lead release worktree: `/workspaces/opening-lab/.worktrees/blundr-production-3.99`
- Shared checkout `/workspaces/opening-lab` is dirty on an unrelated branch and is not authorized for release mutations.
- PR-01 worktrees: `/tmp/blundr-pr01-registry`, `/tmp/blundr-pr01-learning-daily`, `/tmp/blundr-pr01-rewards`, `/tmp/blundr-pr01-tests`, `/tmp/blundr-pr01-review`, `/tmp/blundr-pr01-preservation-matrix`, and `/tmp/blundr-pr01-journey-workflow`.

## Database and feature controls

- Migration head: `20260805130000_blundr_rewards_inventory_presentations_v2.sql`
- Migration count: 23
- New migrations applied: none; clean apply and prior-head upgrade remain Level 2 gates
- Feature-profile state: staging and production schema-v2 profiles committed; both failure-closed and all three new controls disabled
- `BLUNDR_FEATURE_DAILY_ADAPTIVE_V2`: contract implemented; disabled
- `BLUNDR_REWARDS_V2_ENABLED`: contract implemented; disabled
- `NEXT_PUBLIC_BLUNDR_REWARD_PRESENTATIONS_V2_ENABLED`: contract implemented; disabled

## Protected release state

- Runtime package: `blundr-opening-runtime-3.99.v2`
- Manifest SHA-256: `abf8f0eef724ef30b94910932d94a04733668f211b43bbd094590c3fad4b35b8` — verified
- Nodes SHA-256: `733eed769cb99da43dec31e0b9ec01151d89501ef8adf46a063d0212ed7bf959` — verified
- Moves SHA-256: `203e2ce1b9875598005614a62a8bc71b0621d54275a821527e9c2b7928c7a434` — verified
- `opening-nodes.v1.jsonl`: 7,430 records; expected SHA-256 verified
- `candidate-moves.v1.jsonl`: 170,860 records; expected SHA-256 verified
- `opening-nodes.latest.csv`: original file unavailable; 100-row/hash verification pending
- `candidate-moves.latest.csv`: original file unavailable; 2,379-row/hash verification pending
- Protected-data changes: none

The missing CSV references must not be regenerated, substituted, or committed into the runtime. Their absence blocks the complete Gate 1 evidence package but did not invalidate the focused PR-00 acceptance.

## Accepted verification

- PR #3 exact-head workflow: `31034501639`
- Accepted sharding infrastructure SHA: `c7d4e9e091daecfb19e9933af174bcc6e73a5a7e`
- Required jobs: source identity, static/registry, unit shards 1-4, component/integration, chess content, disposable RLS, production build/browser, and release summary all passed
- Staging golden: skipped by design; not staging acceptance

- GitHub workflow: `31028424138`
- Exact workflow head: `3944da6472d0439b2087ce1e4648ffa6ea69f85e`
- Static checks: passed
- Test suites: passed
- Production build and browser checks: passed
- Strict registry release step: skipped by branch condition; pending later exact-SHA gate
- Staging golden: skipped; pending exact-SHA staging acceptance
- Focused Restricted Trainer/runtime tests: passed
- TypeScript typecheck: passed
- Patch review: accepted after initial Black handoff stale-authority repair
- PR-01 focused static gates: migration ancestry/authority verification, registry, profiles, flags, manifest, typecheck, format, lint, and diff checks passed before the remote-database gate changes.
- PR-01 remote CI now runs distinct fresh and upgrade jobs in `blundr-disposable-rls`, validates the exact sanitized dry-run migration sets, prepares the authorized seven-migration upgrade project to the real prior-21 head without repair, verifies 23 migrations afterward, and runs a non-skippable symmetric authority matrix.

## Known preexisting gaps

- Strengthened migration verification remains static and does not prove clean apply or prior-head upgrade; the new live PR-01 matrix has not run against a database with both new migrations applied.
- Current bundle audit does not enforce numeric route or JavaScript budgets.
- Numeric route and JavaScript bundle budgets remain pending release-infrastructure hardening.
- Exact-SHA staging J01-J24 evidence does not exist.
- Current automatic Vercel contexts are Preview evidence only.

## Regressions

- New regressions: none known at the accepted PR-00 head.
- PR-01 review defects corrected before acceptance: reward child cross-user ownership, account-deletion cascade safety, legacy first-attempt spoofing, and mutable migration backfill reports.

## Remote database acceptance

- GitHub Environment `blundr-disposable-rls` exposes all required secret names for the fresh reference, upgrade reference, authority-test reference, disposable role, Supabase access, database connection, and User A/User B tests; values are never logged. The workflow fails closed unless the role value is exactly `disposable`.
- Management-API preflight rejects staging/production metadata, requires distinct fresh/upgrade references, and requires the authority-test reference to equal the upgrade reference before mutation.
- Journey A result: pending exact-head CI; required start is empty and required result is 23 migrations at `20260805130000`.
- Journey B result: pending exact-head CI; required preparation is the real migrations 8-21 from the existing seven-migration disposable state, followed only by migrations 22-23 to reach 23 at `20260805130000`.
- Authority-matrix result: pending exact-head CI; no skipped remote test is accepted.
- No migration repair, staging action, or production action is authorized by this gate.
- Release impact: PR-01 remains active until both journeys, the complete authority matrix, exact-head Level 2 CI, and independent review pass.

## Human-only blockers

- Final production domain and Vercel project decision
- Production Supabase project, capacity, backups, and PITR authority
- Modal model rights, billing, production token, scaling, and cost ceiling
- Production secrets, SMTP, telemetry destination, alert recipients, and on-call owners
- Published legal/privacy/support URLs and named launch/rollback operators
- Original protected CSV reference files for complete Gate 1 evidence

## Staging and evidence identity

- Accepted staging deployment: none
- Stable staging hostname acceptance: pending
- Evidence artifact: none; immutable exact-SHA package pending
- Production deployment: none

## Next release gate

1. Finish PR-01 Level 2 clean-apply, upgrade-path, RLS/privilege, flags-off compatibility, and focused verification.
2. Keep Gate 1 evidence partial until the original protected CSV files are verified.
3. Accept PR-01 only after independent review and exact cumulative test evidence, then open PR-02/PR-03 domain implementations.

## Verification cadence

- Level 1 commit gate: `git diff --check`, typecheck, changed-file tests, and scoped lint/schema checks.
- Level 2 internal PR gate: format/lint/typecheck plus affected unit, component, integration, migration, RLS, build, and browser gates.
- Level 3 complete clean release gate: every command in the authoritative execution plan; CI may replace serial unit execution only when all four deterministic shards are required and pass.
- Complete runs are scheduled at Checkpoint B after PR-04, Checkpoint C after PR-06, Checkpoint D after PR-07, and once for any source-changing exact-SHA staging repair.
- An earlier Level 3 run is required for changes to broad authorities, including test discovery and CI sharding.

### Checkpoint A baseline

- Verification level: Level 3
- Exact SHA: `0155dc9f2464ba793058f803977030d6fe9dd2c8`
- Unit execution: serial full; 554/554 passed in 713 seconds
- Component tests: 28/28 passed
- Integration tests: 6/6 passed
- Chess-content suites: passed
- Security/RLS: passed; sandbox DNS failure rerun successfully with approved network access
- Production build: passed; webpack compile 4.3 minutes plus TypeScript/page finalization
- Bundle audit: passed; 139 assets scanned
- Browser stage: 4/4 passed in 19.9 seconds after installing exact browser binaries in temporary storage
- Full clean wall time: approximately 25 minutes including environmental remediation
- Result: source-suite accepted; complete Gate 1 evidence remains partial because both protected CSV originals are unavailable
- Next scheduled complete run: Checkpoint B after cumulative PR-04

### Unit sharding policy

- Four one-based deterministic shards use the sorted discovered unit-test path list and stable index modulo four.
- Every shard prints its complete assigned file list and fails on empty discovery.
- CI requires all four matrix results through `release-summary`; one shard cannot satisfy unit acceptance.
- `npm run test:unit` remains the canonical serial diagnostic and release command.
- First validation: 1/4 passed 139 tests in 301.2s; 2/4 passed 139 tests in 324.4s; 3/4 passed 138 tests in 208.6s; 4/4 passed 138 tests in 395.2s.
- All four shards passed against one working SHA; their 554-file union exactly matched the successful 554-test serial baseline with empty intersections.
- Parallel aggregate wall time was approximately 6m35s, compared with 11m53s for the serial unit baseline. The slowest shard was less than twice the fastest; no weighted manifest is warranted after one run.
- PR #3 exact-head CI repeated all four shards and the required aggregate release summary successfully. Sharding optimization is closed for this release; no weighting or speed experiments are scheduled.
