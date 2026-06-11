# Stage 2 Phase B.4 Legacy Isolation Report
Date: 2026-06-11
Scope: Legacy runtime isolation planning + risk registry only (no runtime behavior changes)

## Files Created
- `docs/2026-06-11/STAGE_2_LEGACY_RUNTIME_ISOLATION_PLAN.md`
- `docs/2026-06-11/STAGE_2_PHASE_B4_LEGACY_ISOLATION_REPORT.md`
- `tests/coach/stage2LegacyRuntimeRiskRegistry.test.ts`

## Production/Runtime Files Changed
- None.

## Optional Static Test
- Created: `tests/coach/stage2LegacyRuntimeRiskRegistry.test.ts`
- Type: static/non-behavioral boundary test
- Purpose:
  - verifies known runtime-direct feeder list remains explicitly documented,
  - verifies app/page still reflects known risks (does not fail on their existence),
  - verifies Stage 2 modules do not newly import listed legacy feeders.

## Classification Counts
- KEEP_ACTIVE_UNTIL_D: 3
- WRAP_BEFORE_VISIBLE_STAGE2: 2
- QUARANTINE_BEFORE_VISIBLE_STAGE2: 4
- DELETE_AFTER_IMPORT_PROOF: 0
- DEBUG_ONLY_OR_TEST_ONLY_REVIEW: 0

## KEEP_ACTIVE_UNTIL_D
- `lib/blundr/teaching/teachingOrchestrator.ts`
- `lib/blundr/visualRecipe/visualRecipeCompiler.ts`
- `lib/blundr/visualRecipe/visualRecipeAdapter.ts`

## WRAP_BEFORE_VISIBLE_STAGE2
- `lib/blundr/coach/coachDecisionEngine.ts`
- `lib/blundr/coachBrain/coachExplanationPipeline.ts`

## QUARANTINE_BEFORE_VISIBLE_STAGE2
- `lib/blundr/liveCoach/pedagogicalOpportunityEngine.ts`
- `lib/blundr/liveCoach/liveCoachCopyLibrary.ts`
- `lib/blundr/liveCoach/liveCoachIntentSelector.ts`
- `lib/blundr/liveCoach/liveCoachCommentRanker.ts`

## DELETE_AFTER_IMPORT_PROOF
- None in B.4 classification.

## DEBUG_ONLY_OR_TEST_ONLY_REVIEW
- None in B.4 classification.

## Tests Run
Baseline required:
- `npm run test:coach-quality`
- `npm run test:trainer-debug`
- `npm run test:multi-move-qa`

B.1 reruns:
- `npx tsx tests/coach/stage2FrameAuthorityLock.test.ts`
- `npx tsx tests/coach/stage2SurfaceOwnershipLock.test.ts`
- `npx tsx tests/coach/stage2PlainAssistedShowMoreLock.test.ts`
- `npx tsx tests/coach/stage2NoLegacyImportBoundary.test.ts`
- `npx tsx tests/coach/stage2BoardTruthBoundaryLock.test.ts`

B.2 reruns:
- `npx tsx tests/coach/stage2CrawlBundleValidator.test.ts`
- `npx tsx tests/coach/stage2CopyBundleValidator.test.ts`
- `npx tsx tests/coach/stage2ValidatorsNoRuntimeIntegration.test.ts`

B.3 reruns:
- `npx tsx tests/coach/stage2ReadinessGate.test.ts`
- `npx tsx tests/coach/stage2ReadinessNoRuntimeIntegration.test.ts`

B.4 optional static test:
- `npx tsx tests/coach/stage2LegacyRuntimeRiskRegistry.test.ts`

## Pass/Fail Summary
- Baseline: pass
- B.1: pass
- B.2: pass
- B.3: pass
- B.4 static risk registry: pass

## Phase Safety Status
- Phase C safe now: **NO** (final crawl + final copy/content bundles still not uploaded/approved)
- Phase D visible integration safe now: **NO** (legacy runtime feeders still active; isolation actions are planned, not executed)
