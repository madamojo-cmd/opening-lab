# Stage 2 Consolidation Readiness Report (Phase A)
Date: 2026-06-11
Status: Phase A audit output only

## 1. Executive Readiness
Current recommendation: **Phase B is not yet safe to begin without approval review**, because:
- Stage 1 baseline is not fully green (`npm run test:trainer-debug` fails assertion in `trainerDebugSnapshot.test.ts:271`).
- Multiple legacy modules still feed visible UI directly from `app/page.tsx`.
- Ownership is still multi-path for ranking, copy, and visual composition.

## 2. Duplication Risks
High-risk duplication clusters found:

1. Target/teaching authority cluster
- `runtime/currentInstructionFrame.ts`
- `openings/expectedMoveResolver.ts`
- `coach/coachDecisionEngine.ts`
Risk: conflicting target selection/control logic.

2. Visible surface cluster
- `presentation/buildVisibleTeachingSurface.ts`
- `presentation/buildLiveVisibleTeachingSurface.ts`
- `teaching/teachingOrchestrator.ts`
- page-level composition in `app/page.tsx`
Risk: inconsistent plain/assisted/show-more behavior.

3. Copy/explanation cluster
- `presentation/copySurfaceBuilder.ts`
- `liveCoach/liveCoachCopyLibrary.ts`
- `coachBrain/evidenceConditionedCopyBuilder.ts`
- `coachBrain/coachExplanationPipeline.ts`
- `explanation/proceduralExplanationEngine.ts`
Risk: inconsistent copy source and safety filtering.

4. Ranking/opportunity cluster
- `concepts/dynamicConceptActivator.ts`
- `opportunity/multiLayerOpportunityRanker.ts`
- `liveCoach/pedagogicalOpportunityEngine.ts`
- `liveCoach/liveCoachCommentRanker.ts`
- `coach/intentFirstCoachEngine.ts`
- `coach/coachDecisionEngine.ts`
Risk: parallel ranking priorities and mode-dependent behavior drift.

5. Move-facts/features cluster
- `brain/providers/boardTruthProvider.ts`
- `brain/providers/moveSemanticsProvider.ts`
- `coachBrain/moveFactExtractor.ts`
- `features/advancedFeatureExtractor.ts`
Risk: raw facts mixed with derived heuristics before definitions approved.

6. Visual cluster
- `coachCompiler/visualIntentBuilder.ts`
- `presentation/visualRecipeMapper.ts`
- `visualRecipe/visualRecipeCompiler.ts`
- `visualRecipe/visualRecipeAdapter.ts`
- `salience/visualRecipes.ts`
Risk: conflicting visual ownership and stale overlay behavior.

## 3. Active Runtime Risks
Runtime-direct legacy overlap in `app/page.tsx`:
- `coach/coachDecisionEngine.ts`
- `liveCoach/pedagogicalOpportunityEngine.ts`
- `liveCoach/liveCoachCopyLibrary.ts`
- `liveCoach/liveCoachIntentSelector.ts`
- `liveCoach/liveCoachCommentRanker.ts`
- `coachBrain/coachExplanationPipeline.ts`
- `teaching/teachingOrchestrator.ts`
- `visualRecipe/visualRecipeCompiler.ts`
- `visualRecipe/visualRecipeAdapter.ts`

Risk statement:
- As long as these remain direct runtime imports, single-owner enforcement is unproven.

## 4. Orphaned Module Candidates (No Action in Phase A)
Candidate list for later verification:
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

## 5. Areas With No Clear Owner Yet
- Crawl bundle validator ownership (no implemented module selected)
- Copy bundle validator ownership (no implemented module selected)
- Board-truth vs derived-semantics boundary enforcement module
- Final ranking ownership across activator/opportunity/liveCoach stacks
- Final visual ownership boundary between compiler/mapper/legacy visualRecipe modules

## 6. Areas That Must Be Deferred
Per revised roadmap constraints, defer to later phases:
- Tactical/strategic derived detector expansion
- Plan/concept derived inference expansion
- Concept ranking redesign
- Italian White mapping
- Final copy generation/builders
- Visual recipe generation redesign
- Crawl semantic interpretation beyond raw/canonical fields

## 7. Proposed Phase B Allowlist (Exact)
Only minimal post-audit code categories allowed after approval:

1. Tests and docs only for ownership enforcement
- `tests/coach/**` guardrail tests for import boundaries/ownership assertions
- `docs/2026-06-11/**` updates

2. Minimal deterministic validation scaffolding (no runtime behavior change)
- `lib/blundr/**` files only for:
  - crawl schema/reference/token validators
  - copy schema/reference/token validators
- Validators must not perform chess-truth judgment unless explicit evidence IDs exist.

3. Minimal readiness reporting (disabled by default)
- debug-only fields in readiness packet modules
- no surface/UI behavior changes

4. Non-functional import-boundary wrappers only if explicitly approved
- wrappers/adapters that do not change visible behavior

## 8. Proposed Phase B Denylist (Exact)
Do not permit in Phase B:
- Any edits to `app/page.tsx` behavior logic
- New tactical or strategic detectors
- New concept rankers/opportunity engines
- New copy builders/generators/templates for final coaching output
- Any Italian White mapping files/content
- Any visual recipe generation redesign
- Any crawl data ingestion/consumption in runtime
- Any deletion/quarantine of legacy modules (decision-only in this stage)
- Any change that modifies Stage 1 visible behavior contracts

## 9. Gate Recommendation
Before starting Phase B:
- Review and approve Ownership Decision Matrix Draft.
- Resolve whether to treat failing `test:trainer-debug` as pre-existing baseline blocker or required precondition fix.
- Approve explicit allowlist/denylist above.
