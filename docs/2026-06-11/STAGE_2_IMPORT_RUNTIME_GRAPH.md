# Stage 2 Import and Runtime Consumer Audit (Phase A)
Date: 2026-06-11
Scope: Audit only, no runtime changes.

Method summary:
- File discovery: `find lib -type f`, `find components -type f`, `find tests -type f`
- Targeted consumer tracing: `rg` across `app`, `lib`, `components`, `tests`
- Classification buckets: runtime direct, runtime indirect, test-only, type-only, orphaned candidates

## 1. Runtime Direct Consumers (entry-facing)
Detected from direct imports in `app/page.tsx` and direct runtime chains.

- `lib/blundr/runtime/currentInstructionFrame.ts` -> direct in `app/page.tsx`
- `lib/blundr/runtime/continuationRuntimeState.ts` -> direct in `app/page.tsx`
- `lib/blundr/presentation/buildVisibleTeachingSurface.ts` -> direct in `app/page.tsx`
- `lib/blundr/presentation/buildLiveVisibleTeachingSurface.ts` -> direct in `app/page.tsx`
- `lib/blundr/presentation/featureFlags.ts` -> direct in `app/page.tsx`
- `lib/blundr/coach/coachDecisionEngine.ts` -> direct in `app/page.tsx`
- `lib/blundr/liveCoach/pedagogicalOpportunityEngine.ts` -> direct in `app/page.tsx`
- `lib/blundr/liveCoach/liveCoachCopyLibrary.ts` -> direct in `app/page.tsx`
- `lib/blundr/liveCoach/liveCoachIntentSelector.ts` -> direct in `app/page.tsx`
- `lib/blundr/liveCoach/liveCoachCommentRanker.ts` -> direct in `app/page.tsx`
- `lib/blundr/coachBrain/coachExplanationPipeline.ts` -> direct in `app/page.tsx`
- `lib/blundr/teaching/teachingOrchestrator.ts` -> direct in `app/page.tsx`
- `lib/blundr/openings/openingTree.ts` -> direct in `app/page.tsx`
- `lib/blundr/openings/expectedMoveResolver.ts` -> direct in `app/page.tsx`
- `lib/blundr/visualRecipe/visualRecipeCompiler.ts` -> direct in `app/page.tsx`
- `lib/blundr/visualRecipe/visualRecipeAdapter.ts` -> direct in `app/page.tsx`
- `lib/blundr/engine/stockfishContinuationValidation.ts` -> direct in `app/page.tsx`
- `lib/blundr/maia/maiaOpponentProvider.ts` -> direct in `app/page.tsx`

## 2. Runtime Indirect Consumers (transitive chain)
Primary chain seen in `buildLiveVisibleTeachingSurface.ts`:
- `buildEvidenceGraph` -> `activateTeachingConcepts` -> `compileCoachFrame` -> `runCoachSafetyGate` -> `buildVisibleTeachingSurface`

Key runtime-indirect modules in audited scope:
- `lib/blundr/brain/buildEvidenceGraph.ts`
- `lib/blundr/brain/providers/boardTruthProvider.ts`
- `lib/blundr/brain/providers/moveSemanticsProvider.ts`
- `lib/blundr/brain/providers/tacticalMotifProvider.ts`
- `lib/blundr/brain/providers/strategicFeatureProvider.ts`
- `lib/blundr/brain/providers/openingContextProvider.ts`
- `lib/blundr/concepts/teachingConceptRegistry.ts`
- `lib/blundr/concepts/dynamicConceptActivator.ts`
- `lib/blundr/coachCompiler/compileCoachFrame.ts`
- `lib/blundr/coachCompiler/visualIntentBuilder.ts`
- `lib/blundr/coachCompiler/revealActionBuilder.ts`
- `lib/blundr/coachCompiler/copyPolicy.ts`
- `lib/blundr/safety/coachSafetyGate.ts`
- `lib/blundr/safety/plainLeakPolicy.ts`
- `lib/blundr/safety/targetInvariantPolicy.ts`
- `lib/blundr/safety/providerAuthorityPolicy.ts`
- `lib/blundr/presentation/modeSurfacePolicy.ts`
- `lib/blundr/presentation/copySurfaceBuilder.ts`
- `lib/blundr/presentation/visualRecipeMapper.ts`
- `lib/blundr/debug/trainerDebugSnapshot.ts`

## 3. Test-Only Consumers
Modules currently imported only by tests in this audit pass:
- `lib/blundr/coach/specificityScorer.ts`

Also heavily test-weighted (but not strictly test-only):
- `lib/blundr/debug/trainerDebugSnapshot.ts` (10 importers, 9 test)
- `lib/blundr/coachCompiler/compileCoachFrame.ts` (14 importers, 12 test)
- `lib/blundr/brain/buildEvidenceGraph.ts` (18 importers, 16 test)
- `lib/blundr/coachBrain/coachEvidenceBuilder.ts` (16 importers, 15 test)

## 4. Type-Only Consumers
No audited module was classified as pure type-only (all had at least one runtime/value import).

## 5. Orphaned File Candidates
No deletion action proposed in Phase A. Candidate list requiring manual review:
- `lib/blundr/brain/index.ts`
- `lib/blundr/coachBrain/coachBrainDebug.ts`
- `lib/blundr/coachCompiler/index.ts`
- `lib/blundr/concepts/index.ts`
- `lib/blundr/index.ts`
- `lib/blundr/opportunity/educationalOpportunityLayer.ts`
- `lib/blundr/opportunity/engineCandidateOpportunityLayer.ts`
- `lib/blundr/opportunity/expectedMoveOpportunityLayer.ts`
- `lib/blundr/opportunity/repertoireOpportunityLayer.ts`
- `lib/blundr/opportunity/strategicOpportunityLayer.ts`
- `lib/blundr/opportunity/tacticalOpportunityLayer.ts`
- `lib/blundr/opportunity/visualRecipeOpportunityLayer.ts`
- `lib/blundr/presentation/index.ts`
- `lib/blundr/safety/index.ts`
- `lib/blundr/teaching/storyRanker.ts`

## 6. Legacy Modules Still Feeding Visible UI
Directly visible-path legacy overlap detected in `app/page.tsx` imports:
- `lib/blundr/coach/coachDecisionEngine.ts`
- `lib/blundr/liveCoach/pedagogicalOpportunityEngine.ts`
- `lib/blundr/liveCoach/liveCoachCopyLibrary.ts`
- `lib/blundr/liveCoach/liveCoachIntentSelector.ts`
- `lib/blundr/liveCoach/liveCoachCommentRanker.ts`
- `lib/blundr/coachBrain/coachExplanationPipeline.ts`
- `lib/blundr/teaching/teachingOrchestrator.ts`
- `lib/blundr/visualRecipe/visualRecipeCompiler.ts`
- `lib/blundr/visualRecipe/visualRecipeAdapter.ts`

## 7. Legacy Modules Mostly/Only in Tests
Mostly test-weighted legacy modules:
- `lib/blundr/coachBrain/coachEvidenceBuilder.ts`
- `lib/blundr/coachBrain/moveFactExtractor.ts`
- `lib/blundr/coachBrain/boardClaimValidator.ts`
- `lib/blundr/explanation/*` template/matcher/resolver stack
- `lib/blundr/opportunity/multiLayerOpportunityRanker.ts`

Strict test-only in this audit scope:
- `lib/blundr/coach/specificityScorer.ts`

## 8. Apparent Responsibility Duplications
Detected overlaps (documentation finding only):
- Target/teaching control chain overlap:
  - `currentInstructionFrame` + legacy expected-move/opening/coach engines in `app/page.tsx`
- Visible surface overlap:
  - `buildVisibleTeachingSurface` + `teachingOrchestrator` + legacy page composition
- Copy source overlap:
  - `copySurfaceBuilder`, `liveCoachCopyLibrary`, `evidenceConditionedCopyBuilder`, `coachExplanationPipeline`, `proceduralExplanationEngine`
- Ranking/opportunity overlap:
  - `dynamicConceptActivator`, `multiLayerOpportunityRanker`, `pedagogicalOpportunityEngine`, `coachDecisionEngine`, `intentFirstCoachEngine`, `liveCoachCommentRanker`
- Move-facts/feature overlap:
  - `boardTruthProvider`/`moveSemanticsProvider` vs `coachBrain/moveFactExtractor` vs `features/advancedFeatureExtractor`
- Visual overlap:
  - `coachCompiler/visualIntentBuilder` + `presentation/visualRecipeMapper` + `visualRecipeCompiler`/`visualRecipeAdapter` + `salience/visualRecipes`

## 9. Evidence Snippets (runtime direct)
From `app/page.tsx` direct imports:
- `buildVisibleTeachingSurface`
- `buildLiveVisibleTeachingSurface`
- `buildCurrentInstructionFrame`
- `decideCoachOutput`
- `rankPedagogicalOpportunities`
- `pickLiveCoachCopy`
- `orchestrateTeaching`
- `buildCoachExplanationPipeline`
- `compileVisualRecipe`
- `adaptVisualRecipe`
