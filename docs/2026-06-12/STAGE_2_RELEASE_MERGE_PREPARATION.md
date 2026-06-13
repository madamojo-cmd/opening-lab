# Stage 2 Release Merge Preparation

## Executive Summary

Stage 2 is accepted for current scope and prepared for release merge from `work/stage2-runtime-loader` at reproducible commit `728e0f7`.

## Branch and Commit Verification

- Current branch: `work/stage2-runtime-loader`
- Latest accepted reproducible commit: `728e0f7` (`Confirm Stage 2 clean-tree reproducibility`)
- Existing checkpoint branch:
  - `checkpoint/stage2-final-runtime-coaching-integration-v1` -> `7655e4a` (older accepted checkpoint)
- New checkpoint branch created for reproducible release pointer:
  - `checkpoint/stage2-final-runtime-coaching-integration-v2` -> `728e0f7`

## Final Stage 2 Status

```txt
PHASE_C_STATUS: FINAL_21_RUNTIME_ACCEPTED
PHASE_D_STATUS: D8_STAGE_2_FINAL_QA_AND_ACCEPTANCE_ACCEPTED
STAGE_2_STATUS: ACCEPTED_FOR_CURRENT_SCOPE
STAGE_2_RELEASE_READINESS: ACCEPTED
```

## Accepted Stage 2 Scope

- 21-opening runtime package accepted.
- Runtime loader accepted.
- Runtime book queried before continuation/Stockfish authority.
- Continuation/Stockfish fallback preserved after runtime-book exhaustion.
- Runtime-book debug visibility accepted.
- Optional Stage 2 coaching enrichment seam accepted.
- Existing coaching architecture and fallback behavior preserved.
- Final QA accepted for current Stage 2 scope.

## Tests Already Passed

- `npm run test:coach-quality`
- `npm run test:trainer-debug`
- `npm run test:multi-move-qa`
- `npx tsx tests/runtimeBook/stage2Final21RuntimePackageAcceptance.test.ts`
- `npx tsx tests/runtimeBook/runtimeBookLoader.test.ts`
- `npx tsx tests/runtimeBook/runtimeBookLookup.test.ts`
- `npx tsx tests/runtimeBook/runtimeBookNoRuntimeWiring.test.ts`
- `npx tsx tests/coach/runtimeBookBeforeContinuation.test.ts`
- `npx tsx tests/coach/runtimeBookExhaustionContinuation.test.ts`
- `npx tsx tests/coach/effectiveContinuationCandidateAuthority.test.ts`
- `npx tsx tests/coach/stage2FrameAuthorityLock.test.ts`
- `npx tsx tests/coach/plainViewNoLeakBeforeShowMore.test.ts`
- `npx tsx tests/coach/plainViewShowMoreParity.test.ts`
- `npx tsx tests/coach/revealTargetSourceContract.test.ts`
- `npx tsx tests/coach/stage2CoachingResolverShell.test.ts`
- `npx tsx tests/coach/stage2CoachingResolverSeamEnrichment.test.ts`
- `npx tsx tests/coach/stage2FinalAcceptance.test.ts`

## Known Limitations (Carried Forward)

- Coaching content remains limited/main-line only where available.
- Most runtime branches rely on existing coach/fallback behavior.
- Stage 2 enrichment applies only for approved + safe + matched packets.
- No generated coaching content is included.
- No visual recipe rendering from Stage 2 enrichment.

## Untracked Files Intentionally Left Alone

- `create_blundr_review_bundle.sh`
- `create_blundr_review_bundle_zip.sh`
- `docs/roadmaps/`
- `docs30/`
- `imports/stage2-sample/canonical-21opening-depth-audit.csv`
- `imports/stage2-sample/canonical-all23-moves-by-opening.csv`
- `imports/stage2-sample/canonical-all23-nodes-by-opening.csv`
- `imports/stage2-sample/canonical-all23-summary.csv`
- `imports/stage2-sample/content-base/`
- `stage2-canonical-all23-12ply/`

## Recommended Merge Target

- Preferred target: stable release branch (for example `main` or a designated release branch).

## Release Merge Instructions

```bash
# from merge target branch, for example main or release branch
git checkout <merge-target>
git pull
git merge --no-ff work/stage2-runtime-loader
npm run test:coach-quality
npm run test:trainer-debug
npm run test:multi-move-qa
npx tsx tests/coach/stage2FinalAcceptance.test.ts
```

## Rollback Checkpoint

- `checkpoint/stage2-final-runtime-coaching-integration-v2` at `728e0f7`

## Post-Merge Smoke Test Commands

```bash
npm run test:coach-quality
npm run test:trainer-debug
npm run test:multi-move-qa
npx tsx tests/coach/stage2FinalAcceptance.test.ts
```

## Next Step

- `NEXT_STEP: MERGE_STAGE_2_TO_RELEASE_BRANCH_OR_BEGIN_STAGE_3_PLANNING`
