# Blundr Production 3.99 Execution Status

Last updated: 2026-08-05 UTC

## Release identity

- Accepted baseline SHA: `3944da6472d0439b2087ce1e4648ffa6ea69f85e`
- Current cumulative release SHA: `3944da6472d0439b2087ce1e4648ffa6ea69f85e`
- Release branch: `release/blundr-production-3.99`
- Accepted PR: PR #2, PR-00 Restricted Trainer authority
- Active implementation PRs: none
- Rollback tag: `blundr-production-3.99-rollback-pr00`
- Rollback target: `da959d21aad06c1958c096b8dfef45217bbe26de`

## Branch and worktree ownership

- Lead release worktree: `/workspaces/opening-lab/.worktrees/blundr-production-3.99`
- Shared checkout `/workspaces/opening-lab` is dirty on an unrelated branch and is not authorized for release mutations.
- No implementation subagent worktrees are active.

## Database and feature controls

- Migration head: `20260804130000_blundr_server_authoritative_rewards.sql`
- Migration count: 21
- New migrations applied: none
- Feature-profile state: existing staging profile only; PR-01 production/failure-closed profiles pending
- `BLUNDR_FEATURE_DAILY_ADAPTIVE_V2`: not implemented; disabled
- `BLUNDR_REWARDS_V2_ENABLED`: not implemented; disabled
- `NEXT_PUBLIC_BLUNDR_REWARD_PRESENTATIONS_V2_ENABLED`: not implemented; disabled

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

## Known preexisting gaps

- Current migration verification is static and does not prove clean apply, prior-head upgrade, deterministic backfill, or the full authority/RLS matrix.
- Current bundle audit does not enforce numeric route or JavaScript budgets.
- No committed production feature profile exists.
- Exact-SHA staging J01-J24 evidence does not exist.
- Current automatic Vercel contexts are Preview evidence only.

## Regressions

- New regressions: none known at the accepted PR-00 head.

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

1. Validate and integrate deterministic unit sharding and the required aggregate CI job.
2. Keep Gate 1 evidence partial until the original protected CSV files are verified.
3. Open isolated PR-01 workstreams for registry/profiles, learning/Daily migration expansion, and Rewards migration expansion.

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
- Next scheduled complete run: immediate sharding-infrastructure validation, then Checkpoint B after cumulative PR-04

### Unit sharding policy

- Four one-based deterministic shards use the sorted discovered unit-test path list and stable index modulo four.
- Every shard prints its complete assigned file list and fails on empty discovery.
- CI requires all four matrix results through `release-summary`; one shard cannot satisfy unit acceptance.
- `npm run test:unit` remains the canonical serial diagnostic and release command.
- First validation: 1/4 passed 139 tests in 301.2s; 2/4 passed 139 tests in 324.4s; 3/4 passed 138 tests in 208.6s; 4/4 passed 138 tests in 395.2s.
- All four shards passed against one working SHA; their 554-file union exactly matched the successful 554-test serial baseline with empty intersections.
- Parallel aggregate wall time was approximately 6m35s, compared with 11m53s for the serial unit baseline. The slowest shard was less than twice the fastest; no weighted manifest is warranted after one run.
