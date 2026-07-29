# Blundr Agent Workflow and Deep Minigames Update

## Release identity

- Base commit: `4a14f78545e31f2147788c091a7d6b65eb12009d`
- Base branch at handoff: `feat/final-app-architecture-onboarding`
- Scope: repository governance, system-contract registry, deep minigame catalog and runtime hardening
- Intentional source update: 38 files
- Production touched: no
- Staging infrastructure touched: no
- Database migration applied remotely: no
- Regenerated handoff verification date: 2026-07-29

This package is an implementation update, not a claim that Blundr is ready for private beta. The structural checks are green, while the strict release registry deliberately remains blocked until the exact deployed SHA, staging migration, Maia provenance, browser evidence, and other partial contracts are verified.

## Outcomes

### Repository-owned agent workflow

The repository is now the durable source of truth for future agents:

- `AGENTS.md` requires impact analysis, affected feature IDs, authority tracing, contract-preserving changes, regression coverage, and exact-SHA evidence.
- `docs/product/BLUNDR_CHANGE_PROTOCOL.md` defines the mandatory change lifecycle and deprecation protocol.
- `docs/product/BLUNDR_SYSTEM_REGISTRY.md` is the human-readable product/system contract.
- `docs/product/blundr-system-registry.json` is the machine-validated registry.
- `.github/PULL_REQUEST_TEMPLATE.md` requires affected contracts, migrations, fallbacks, tests, rollout, rollback, and registry evidence.
- CI validates the registry, catalog, migrations, formatting, types, security boundaries, tests, and release manifest.
- The strict release validator rejects unverified critical systems instead of allowing documentation or a green build to imply readiness.

The registry covers 14 major systems:

1. Authentication and account recovery
2. Onboarding and returning-user hydration
3. Guided opening runtime
4. Maia continuation opponent
5. Rewards and completion
6. Daily rings
7. Review and SRS
8. Repertoire
9. Game imports
10. Procedural minigames
11. Engine-certified deep minigames
12. Opening datasets
13. Observability
14. Release and deployment

`TRAIN-MAIA-001` remains blocked. Guided book replies are not Maia, and no generic, Stockfish, random, fixture, cached, or opening-runtime response may be silently labelled as Maia.

### Engine-certified minigame catalog

The supplied 920-record engine package was normalized into a versioned, server-owned catalog:

| Family | Supplied | Active |
|---|---:|---:|
| Tactic Shots | 320 | 320 |
| Knight Gymnasium | 360 | 360 |
| King & Pawn Lab | 240 | 177 |
| Total | 920 | 857 |

Sixty-three repeated King & Pawn Lab records were quarantined across 52 repeated-position groups. Some repeated positions had competing expected lines, so exposing all of them would allow the same board to grade different moves as uniquely correct.

The catalog validator checks:

- record schema and stable IDs;
- FEN parsing and legal starting state;
- first move and complete principal-variation legality;
- family-specific rules;
- depth and engine-evidence fields;
- checksums and source accounting;
- quarantine-to-retained-record links;
- exactly 920 supplied records accounted for.

The original source generator was not included in the prepared package. The registry therefore records regeneration as non-reproducible instead of making an unsupported certification claim.

### Runtime and API hardening

- Fixed the deep-game advance route so it branches before dereferencing legacy-card-only fields.
- Added revision-based optimistic concurrency to create, advance, reveal, retry, and reset flows.
- Added database compare-and-swap updates to prevent double submissions and stale writes.
- Added client submission locking.
- Kept engine lines, scores, depths, and answer evidence out of public projections and client barrels.
- Added deterministic server-side catalog selection.
- Kept in-memory instance fallback limited to tests.
- Added the staging migration `20260727_001_blundr_minigame_instance_revision.sql`.
- Added focused catalog, route-contract, security, and concurrency regression tests.

### Build compatibility

The base snapshot’s local no-telemetry Sentry adapter did not implement wrapper exports injected by the installed Next/Sentry integration. The adapter now provides identity wrappers for those server, route, page, middleware, and generation entry points, with regression coverage. This keeps the existing no-telemetry behavior while allowing the current application to build.

## Verification evidence

Completed locally against the reconstructed base tree:

- System registry: 14 unique contracts valid
- Deep minigame catalog: 857 active legal lines valid
- Quarantine manifest: 63 linked records valid
- Migration integrity: 17 migrations valid
- Focused deep minigame and answer-safety tests: passed
- Security tests: 12 passed
- Component tests: 21 passed
- Integration tests: 6 passed
- Unit suite: 585 passed in the exhaustive run; the two public-asset checks initially failed because the uploaded archive was truncated, then both passed after deterministic restoration from the preserved source assets
- Formatting: passed
- TypeScript: passed with the repository’s documented 4 GB Node heap
- ESLint: zero errors; existing warnings remain non-blocking

The original implementation verification also completed the production build and browser-bundle scan successfully. During this regenerated handoff, the environment stopped a fresh build rerun when the existing Sentry build integration attempted an external connection; that network action was not bypassed. The regenerated package passed all eight exhaustive procedural-minigame depth shards, the source security audit, archive integrity checks, and the intentional strict release-registry negative test.

## Required staging sequence

1. Apply the overlay only to a checkout at base commit `4a14f78545e31f2147788c091a7d6b65eb12009d`.
2. Review the diff and commit it as one coherent workflow/minigames update.
3. Apply `supabase/migrations/20260727_001_blundr_minigame_instance_revision.sql` to staging only.
4. Deploy the exact resulting commit SHA to the intended staging project.
5. Confirm the deployed build, database migration state, environment-variable fingerprint, and preview URL all refer to that same SHA.
6. Browser-test create, advance, stale-revision rejection, reveal, retry, reset, refresh, and completion for all three deep minigame families.
7. Verify no network response or browser bundle contains solution lines, engine scores, depths, catalog records, or credentials.
8. Exercise authentication, onboarding hydration, Tempo, Battery, Daily Blundr, rewards, rings, Review/SRS, repertoire, imports, and responsive navigation as required by their registry entries.
9. Prove the real Maia provider path separately. Do not mark `TRAIN-MAIA-001` verified based on guided opening-runtime replies.
10. Record exact-SHA evidence in the affected registry entries and rerun the strict release validator.

## Release blockers that must remain visible

- A genuine Maia server call and model/rating identity are not yet proven.
- The new migration has not been applied to staging.
- The update has not been deployed and browser-verified on an exact staging SHA.
- Registry entries marked partial or blocked lack current exact-SHA evidence.
- The original engine-catalog generator is unavailable, so source regeneration is not reproducible.

Do not touch Production or describe the package as private-beta ready until these blockers are resolved and the strict release registry passes.

## Rollback

- Keep the current staging commit and migration state recorded before applying this update.
- If code rollback is needed before any new instance revision is relied upon, redeploy the prior known-good SHA.
- The migration is additive and should normally remain in place during a code rollback; do not drop the column while rows or newer code may depend on it.
- Disable the deep minigame entry points through their approved feature control if catalog or runtime behavior degrades.
- Preserve registry evidence explaining the rollback and the last verified SHA.
