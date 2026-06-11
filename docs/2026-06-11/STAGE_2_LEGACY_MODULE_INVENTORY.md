# Stage 2 Legacy Module Inventory (Phase A)
Date: 2026-06-11
Method: `find` + targeted `rg` import tracing across `app`, `lib`, `components`, `tests`.
Label policy: only `suspected canonical candidate` or `legacy overlap`.

Legend for usage class:
- `runtime_direct`: imported directly by `app/page.tsx` or runtime entry surfaces.
- `runtime_indirect`: transitively used by runtime modules.
- `test-only`: imported only by tests.
- `orphaned`: no importer found by audit patterns (candidate only; manual verification required).

## A. Target Authority and Continuation Target Promotion
| File path | Current responsibility | Direct importers | Usage class | Tests that cover it | Overlaps future Stage 2 | Label | Risk if duplicated | Risk if removed | Notes |
|---|---|---|---|---|---|---|---|---|---|
| `lib/blundr/runtime/currentInstructionFrame.ts` | Build instruction frame + authoritative target + verified move facts | `app/page.tsx`, `buildLiveVisibleTeachingSurface`, `buildEvidenceGraph`, `coachCompiler/*`, safety policies | runtime_direct | `tests/coach/currentInstructionFrame.test.ts`, `targetInvariant.test.ts`, `revealTargetSourceContract.test.ts` and many others | Yes (target authority boundary) | suspected canonical candidate | Multiple target owners produce stale/mismatched coach/visual/reveal targets | High: would break Stage 1 target contract path | Heavily imported (72 import sites found) |
| `lib/blundr/runtime/currentInstructionTarget.ts` | Target type/util helpers (`normalizeChessColor`, split UCI) | `currentInstructionFrame`, `instructionFrameLock`, `continuationRuntimeState` | runtime_indirect | Indirect via `currentInstructionFrame` tests | Yes | legacy overlap | Divergent target normalization between callers | Medium | Utility layer under target pipeline |
| `lib/blundr/runtime/continuationRuntimeState.ts` | Continuation status classification for runtime/debug | `app/page.tsx`, continuation tests | runtime_direct | `tests/coach/continuationFlow.test.ts`, `tests/coach/currentInstructionFrame.test.ts` | Yes (continuation promotion readiness) | suspected canonical candidate | Conflicting continuation state interpretation | Medium | Direct page consumer |
| `lib/blundr/engine/stockfishContinuationValidation.ts` | Stockfish continuation legality/ranking checks | `app/page.tsx`, stockfish tests | runtime_direct | `tests/coach/stockfishValidationGate.test.ts`, `moveStrengthBadge.test.ts` | Yes | legacy overlap | Conflicting continuation validation sources | Medium | Continuation-policy adjacent |
| `lib/blundr/maia/maiaOpponentProvider.ts` | Maia opponent move decision/provider health helpers | `app/page.tsx`, maia provider test | runtime_direct | `tests/coach/maiaContinuationProvider.test.ts` | Yes | legacy overlap | Conflicting opponent-reply authority vs target promotion | Medium | Runtime provider input path |

## B. Visible Teaching Surface and Policy
| File path | Current responsibility | Direct importers | Usage class | Tests that cover it | Overlaps future Stage 2 | Label | Risk if duplicated | Risk if removed | Notes |
|---|---|---|---|---|---|---|---|---|---|
| `lib/blundr/presentation/buildVisibleTeachingSurface.ts` | Final visible teaching surface assembly (plain/assisted/show-more) | `app/page.tsx`, `buildLiveVisibleTeachingSurface`, presentation tests | runtime_direct | `tests/coach/visibleTeachingSurface.test.ts`, `plainLeak.test.ts`, `showMoreVisualReveal.test.ts` | Yes (surface ownership) | suspected canonical candidate | Parallel visible renderers cause policy drift/leaks | High | Single surface owner candidate in comments |
| `lib/blundr/presentation/buildLiveVisibleTeachingSurface.ts` | Runtime chain wrapper (frame->graph->concepts->compiled->safety->surface) | `app/page.tsx`, many coach tests | runtime_direct | `tests/coach/uiSurfaceAdapter.test.ts`, `plainViewShowMoreParity.test.ts`, `assistedViewNoLegacyButtons.test.ts` | Yes | suspected canonical candidate | Multiple orchestration chains create inconsistent behavior | High | Central chain adapter for live flow |
| `lib/blundr/presentation/modeSurfacePolicy.ts` | Plain/assisted/show-more mode resolution | `buildVisibleTeachingSurface`, `presentation/index.ts` | runtime_indirect | Covered indirectly by plain/assisted parity tests | Yes | suspected canonical candidate | Mode handling inconsistency leaks answers or hides required details | Medium | Policy submodule |
| `lib/blundr/presentation/copySurfaceBuilder.ts` | Surface copy block assembly | `buildVisibleTeachingSurface`, `presentation/index.ts` | runtime_indirect | Covered indirectly by visible surface tests | Yes | legacy overlap | Competing copy assemblers produce conflicting text | Medium | Competes with legacy copy paths |
| `lib/blundr/presentation/featureFlags.ts` | Feature gating for visible surface path | `app/page.tsx`, `presentation/index.ts` | runtime_direct | No direct test import found | Yes | legacy overlap | Split behavior by flag with divergent owners | Medium | Runtime direct gate |
| `lib/blundr/presentation/uiSurfaceAdapter.ts` | UI contract adapter for visible surface | coach tests | runtime_indirect | `tests/coach/uiSurfaceAdapter.test.ts` | Yes | legacy overlap | Duplicate adapters create mismatch between UI and surface | Medium | Adapter boundary |
| `lib/blundr/teaching/teachingOrchestrator.ts` | Legacy teaching orchestration path | `app/page.tsx` | runtime_direct | Indirect via app flows; no dedicated coach tests in `tests/coach` | Yes | legacy overlap | Parallel orchestrators can bypass surface policy chain | High | Still directly imported by page |
| `lib/blundr/teaching/trainingContextEngine.ts` | Build training context for legacy orchestration/visual tests | `teachingOrchestrator`, visual/presentation tests | runtime_indirect | `lib/blundr/teaching/__tests__/trainingContextEngine.test.ts` | Yes | legacy overlap | Divergent context calculations across chains | Medium | Mostly test-heavy usage with one runtime caller |

## C. Coach Compiler, Safety Gates, and Claim Validation
| File path | Current responsibility | Direct importers | Usage class | Tests that cover it | Overlaps future Stage 2 | Label | Risk if duplicated | Risk if removed | Notes |
|---|---|---|---|---|---|---|---|---|---|
| `lib/blundr/coachCompiler/compileCoachFrame.ts` | Compile frame + evidence/concepts into coach frame payload | `buildLiveVisibleTeachingSurface`, coach tests | runtime_indirect | `tests/coach/coachCompiler.test.ts`, `revealTargetSourceContract.test.ts` | Yes | suspected canonical candidate | Competing compilers produce divergent actions/copy/visual intents | High | Core chain stage |
| `lib/blundr/coachCompiler/visualIntentBuilder.ts` | Build compiled visual intents | `compileCoachFrame`, compiler index | runtime_indirect | Indirect via coach compiler tests | Yes | suspected canonical candidate | Conflicting visual intent generation layers | Medium | Visual-intent helper |
| `lib/blundr/coachCompiler/revealActionBuilder.ts` | Build reveal/show-more action metadata | `compileCoachFrame`, compiler index | runtime_indirect | Indirect via reveal tests | Yes | suspected canonical candidate | Divergent reveal action sources break parity | Medium | Action helper |
| `lib/blundr/coachCompiler/copyPolicy.ts` | Unsafe-claim filtering/downgrade policy in compiler | `compileCoachFrame`, `safeFallbackFrame`, `slotBuilder` | runtime_indirect | Indirect via anti-hallucination/safety tests | Yes | legacy overlap | Multiple copy-safety filters may conflict | Medium | Policy used in compiler and safety fallback |
| `lib/blundr/safety/coachSafetyGate.ts` | Runtime safety gate over compiled frames | `buildLiveVisibleTeachingSurface`, many coach tests | runtime_indirect | `tests/coach/coachSafetyGate.test.ts`, `providerFailure.test.ts` | Yes | suspected canonical candidate | Parallel safety gates make safety outcomes nondeterministic | High | Central safety stage in live chain |
| `lib/blundr/safety/plainLeakPolicy.ts` | Plain-view leak detection policy | `coachSafetyGate`, `safety/index.ts` | runtime_indirect | Indirect via plain leak tests | Yes | suspected canonical candidate | Duplicate leak detectors can miss/over-block leaks | High | Policy submodule |
| `lib/blundr/safety/targetInvariantPolicy.ts` | Validate target invariant alignment | `coachSafetyGate`, `safety/index.ts` | runtime_indirect | Indirect via target invariant tests | Yes | suspected canonical candidate | Divergent target checks undermine authority contract | High | Policy submodule |
| `lib/blundr/safety/providerAuthorityPolicy.ts` | Provider authority checks | `coachSafetyGate`, `safety/index.ts` | runtime_indirect | Indirect via provider failure tests | Yes | suspected canonical candidate | Provider authority drift allows unpromoted targets | High | Policy submodule |
| `lib/blundr/explanation/coachClaimValidator.ts` | Validate rendered claim safety/consistency | `proceduralExplanationEngine` | runtime_indirect | Indirect via explanation tests | Yes | legacy overlap | Multiple claim validators can disagree on allowed claims | Medium | Single importer in current audit |
| `lib/blundr/coachBrain/boardClaimValidator.ts` | Board-claim validation helpers for evidence | `coachEvidenceBuilder`, board-claim tests | runtime_indirect | `lib/blundr/coachBrain/__tests__/boardClaimValidator.test.ts` | Yes | legacy overlap | Competing board-claim rules create truth inconsistencies | Medium | Legacy coachBrain path |

## D. Evidence Graph, Features, Move Facts, Tactical/Strategic
| File path | Current responsibility | Direct importers | Usage class | Tests that cover it | Overlaps future Stage 2 | Label | Risk if duplicated | Risk if removed | Notes |
|---|---|---|---|---|---|---|---|---|---|
| `lib/blundr/brain/buildEvidenceGraph.ts` | Deterministic evidence graph assembly | `buildLiveVisibleTeachingSurface`, many coach tests | runtime_indirect | `tests/coach/evidenceGraph.test.ts`, `liveChainSmoke.test.ts` | Yes | suspected canonical candidate | Competing evidence builders create non-repeatable concept/copy decisions | High | Chain stage candidate |
| `lib/blundr/brain/providers/boardTruthProvider.ts` | Board-truth claims from frame/chess state | `buildEvidenceGraph` | runtime_indirect | Indirect via evidence graph tests | Yes | suspected canonical candidate | Conflicting board-truth sources break deterministic validation | High | Single importer in graph builder |
| `lib/blundr/brain/providers/moveSemanticsProvider.ts` | Move-semantics claims for evidence graph | `buildEvidenceGraph` | runtime_indirect | Indirect via evidence graph tests | Yes | legacy overlap | Semantics providers can over-derive beyond approved fact set | High | Must be bounded to allowed facts in later phases |
| `lib/blundr/coachBrain/moveFactExtractor.ts` | Legacy move fact extraction from frame/fen | `coachEvidenceBuilder`, move-fact tests | runtime_indirect | `lib/blundr/coachBrain/__tests__/moveFactExtractor.test.ts` | Yes | legacy overlap | Dual move-fact pipelines lead to conflicting facts | High | Overlaps board-truth path |
| `lib/blundr/coachBrain/boardFactExtractor.ts` | Legacy board fact extraction | `coachEvidenceBuilder` | runtime_indirect | Indirect only | Yes | legacy overlap | Conflicting board fact vocabularies | Medium | Legacy coachBrain stack |
| `lib/blundr/features/advancedFeatureExtractor.ts` | Aggregate strategic/tactical feature extraction | `planRecognitionEngine`, `intentFirstCoachEngine`, caches/tests | runtime_indirect | `lib/blundr/features/__tests__/advancedFeatureExtractor.test.ts` plus golden tests | Yes | legacy overlap | Duplicate feature engines diverge on derived claims | High | Heavy test usage |
| `lib/blundr/features/tacticalMotifExtractor.ts` | Tactical motif extraction submodule | `advancedFeatureExtractor`, tactical tests | runtime_indirect | `lib/blundr/features/__tests__/tacticalMotifExtractor.test.ts` | Yes | legacy overlap | Competing tactic detectors produce contradictory motifs | Medium | Submodule under advanced features |
| `lib/blundr/brain/providers/tacticalMotifProvider.ts` | Tactical motif claims for evidence graph | `buildEvidenceGraph` | runtime_indirect | Indirect via evidence graph tests | Yes | legacy overlap | Tactical duplication between brain providers and feature extractors | High | Evidence graph provider path |
| `lib/blundr/brain/providers/strategicFeatureProvider.ts` | Strategic feature claims for evidence graph | `buildEvidenceGraph` | runtime_indirect | Indirect via evidence graph tests | Yes | legacy overlap | Strategic duplication between provider and legacy extractors | High | Evidence graph provider path |
| `lib/blundr/coachBrain/coachEvidenceBuilder.ts` | Legacy evidence packet builder for old coach stack | `coachDecisionEngine`, many coachBrain/golden tests | runtime_indirect | coachBrain tests + golden tests | Yes | legacy overlap | Duplicate evidence packets vs evidence graph path | High | Legacy evidence pipeline still active through coachDecisionEngine |
| `lib/blundr/liveCoach/positionFeatureExtractor.ts` | Legacy live-coach position features | `positionEvidenceBuilder`, benchmark runner | runtime_indirect | `lib/blundr/liveCoach/__tests__/positionFeatureExtractor.test.ts` | Yes | legacy overlap | Additional feature source increases inconsistency risk | Medium | Legacy liveCoach branch |

## E. Openings and Plans
| File path | Current responsibility | Direct importers | Usage class | Tests that cover it | Overlaps future Stage 2 | Label | Risk if duplicated | Risk if removed | Notes |
|---|---|---|---|---|---|---|---|---|---|
| `lib/blundr/openings/openingTree.ts` | Opening tree build/lookup utilities | `app/page.tsx`, transposition matcher, opening tests | runtime_direct | `lib/blundr/openings/__tests__/openingTree.test.ts` | Yes | legacy overlap | Multiple registries/trees can desync opening state | High | Runtime direct |
| `lib/blundr/openings/expectedMoveResolver.ts` | Expected move selection from opening context | `app/page.tsx`, opening tests | runtime_direct | `lib/blundr/openings/__tests__/expectedMoveResolver.test.ts` | Yes | legacy overlap | Competing expected-move selectors can conflict with target authority | High | Runtime direct |
| `lib/blundr/brain/providers/openingContextProvider.ts` | Opening context claims in evidence graph | `buildEvidenceGraph` | runtime_indirect | Indirect via evidence graph tests | Yes | suspected canonical candidate | Duplicate opening context derivation leads to concept mismatch | Medium | Graph provider path |
| `lib/blundr/plans/openingPlanRegistry.ts` | Opening-plan registry data/query | `planRecognitionEngine`, plan tests | runtime_indirect | `lib/blundr/plans/__tests__/openingPlanRegistry.test.ts` | Yes | legacy overlap | Multiple plan registries create inconsistent plan detection | High | Registry candidate only |
| `lib/blundr/plans/planRecognitionEngine.ts` | Recognize strategic plans from features+registry | `intentFirstCoachEngine`, analysis path, caches/tests | runtime_indirect | `lib/blundr/plans/__tests__/planRecognitionEngine.test.ts` | Yes | legacy overlap | Competing plan recognizers produce diverging concept rationale | High | Feeds ranking/copy stack |

## F. Concepts and Ranking/Opportunity
| File path | Current responsibility | Direct importers | Usage class | Tests that cover it | Overlaps future Stage 2 | Label | Risk if duplicated | Risk if removed | Notes |
|---|---|---|---|---|---|---|---|---|---|
| `lib/blundr/concepts/teachingConceptRegistry.ts` | Concept definitions/registry | `dynamicConceptActivator`, concept tests | runtime_indirect | `tests/coach/teachingConceptRegistry.test.ts` | Yes | suspected canonical candidate | Multiple registries create concept ID drift | High | Registry candidate |
| `lib/blundr/concepts/dynamicConceptActivator.ts` | Activate concepts from evidence | `buildLiveVisibleTeachingSurface`, many coach tests | runtime_indirect | `tests/coach/dynamicConceptActivator.test.ts` | Yes | suspected canonical candidate | Competing activators produce inconsistent concept sets | High | Chain stage candidate |
| `lib/blundr/opportunity/multiLayerOpportunityRanker.ts` | Legacy multi-layer opportunity ranking | analysis path + tests | runtime_indirect | `lib/blundr/opportunity/__tests__/multiLayerOpportunityRanker.test.ts` | Yes | legacy overlap | Parallel rankers yield inconsistent coaching priorities | High | One of multiple rankers |
| `lib/blundr/liveCoach/pedagogicalOpportunityEngine.ts` | Legacy pedagogical opportunity ranking | `app/page.tsx`, benchmark, liveCoach test | runtime_direct | `lib/blundr/liveCoach/__tests__/pedagogicalOpportunityEngine.test.ts` | Yes | legacy overlap | Competes with other rankers and concept activator decisions | High | Runtime direct legacy engine |
| `lib/blundr/coach/coachDecisionEngine.ts` | Legacy high-level coach decision output | `app/page.tsx`, benchmark, tests | runtime_direct | `lib/blundr/coach/__tests__/coachDecisionEngine.test.ts` | Yes | legacy overlap | Parallel decision engine can bypass single-authority chain | High | Runtime direct legacy path |
| `lib/blundr/coach/intentFirstCoachEngine.ts` | Legacy intent-first decision/ranking logic | `coachDecisionEngine`, golden tests | runtime_indirect | `lib/blundr/coach/__tests__/intentFirstCoachEngine.test.ts` | Yes | legacy overlap | Alternative ranking/selection logic conflicts with concept activation path | High | Legacy decision core |
| `lib/blundr/liveCoach/liveCoachIntentSelector.ts` | Legacy intent selector for live opportunities | `app/page.tsx`, benchmark runner | runtime_direct | indirect via benchmark coverage | Yes | legacy overlap | Multiple intent selectors can split rationale chain | Medium | Runtime direct |
| `lib/blundr/liveCoach/liveCoachCommentRanker.ts` | Legacy live comment ranking | `app/page.tsx`, benchmark, liveCoach test | runtime_direct | `lib/blundr/liveCoach/__tests__/liveCoachCommentRanker.test.ts` | Yes | legacy overlap | Competes with compiler/surface copy priority | Medium | Runtime direct |
| `lib/blundr/coach/teachingIntent.ts` | Map evidence/opportunity to teaching intent | `intentFirstCoachEngine`, teachingIntent test | runtime_indirect | `lib/blundr/coach/__tests__/teachingIntent.test.ts` | Yes | legacy overlap | Intent mapping divergence across ranking stacks | Medium | Legacy support module |
| `lib/blundr/coach/specificityScorer.ts` | Score specificity bands (legacy) | specificity scorer test only | test-only | `lib/blundr/coach/__tests__/specificityScorer.test.ts` | Yes | legacy overlap | Reintroduction in runtime could silently fork ranking logic | Low currently | Test-only in current audit |

## G. Coach Copy and Explanation Template Stack
| File path | Current responsibility | Direct importers | Usage class | Tests that cover it | Overlaps future Stage 2 | Label | Risk if duplicated | Risk if removed | Notes |
|---|---|---|---|---|---|---|---|---|---|
| `lib/blundr/liveCoach/liveCoachCopyLibrary.ts` | Legacy live coach copy library/catalog | `app/page.tsx`, benchmark, copy lint | runtime_direct | indirect via coach quality tests | Yes | legacy overlap | Multiple copy sources create inconsistent tone/facts | High | Runtime direct legacy copy source |
| `lib/blundr/coachBrain/evidenceConditionedCopyBuilder.ts` | Legacy evidence-conditioned copy builder | `coachDecisionEngine`, coachBrain tests | runtime_indirect | `lib/blundr/coachBrain/__tests__/evidenceConditionedCopyBuilder.test.ts` | Yes | legacy overlap | Parallel copy builders create conflicting output contracts | High | Legacy copy generator |
| `lib/blundr/coachBrain/coachExplanationPipeline.ts` | Legacy explanation pipeline + fallback rendering | `app/page.tsx`, coach tests | runtime_direct | `tests/coach/coachTitlesAndStockfishWarnings.test.ts` and pipeline tests | Yes | legacy overlap | Competes with compiler/surface copy path | High | Runtime direct legacy path |
| `lib/blundr/explanation/coachTemplateLibrary.ts` | Template catalog for procedural explanation | `proceduralExplanationEngine`, stats/tests | runtime_indirect | `lib/blundr/explanation/__tests__/coachTemplateLibrary.test.ts` | Yes | legacy overlap | Duplicate template libraries fragment copy behavior | Medium | Template store |
| `lib/blundr/explanation/opportunityTemplateMatcher.ts` | Template matching logic | `proceduralExplanationEngine` | runtime_indirect | `lib/blundr/opportunity/__tests__/mappingPipeline.test.ts` (indirect) | Yes | legacy overlap | Multiple matchers produce unstable copy selection | Medium | Matcher submodule |
| `lib/blundr/explanation/templateVariableResolver.ts` | Resolve template variables/rendering | `proceduralExplanationEngine` | runtime_indirect | `lib/blundr/explanation/__tests__/templateVariableResolver.test.ts` | Yes | legacy overlap | Variable resolution drift leads to unstable output | Medium | Resolver submodule |
| `lib/blundr/explanation/proceduralExplanationEngine.ts` | Procedural explanation rendering path | `intentFirstCoachEngine`, explanation tests | runtime_indirect | `lib/blundr/explanation/__tests__/proceduralExplanationEngine.test.ts` | Yes | legacy overlap | Parallel explanation engines can diverge from surface copy | High | Legacy generation path |

## H. Visual Intent / Visual Recipe
| File path | Current responsibility | Direct importers | Usage class | Tests that cover it | Overlaps future Stage 2 | Label | Risk if duplicated | Risk if removed | Notes |
|---|---|---|---|---|---|---|---|---|---|
| `lib/blundr/presentation/visualRecipeMapper.ts` | Map compiled visual intents to surface recipes | `buildVisibleTeachingSurface`, presentation index | runtime_indirect | indirect via visible surface tests | Yes | suspected canonical candidate | Duplicate mappers produce mismatched overlays | High | Surface mapping stage |
| `lib/blundr/visualRecipe/visualRecipeCompiler.ts` | Legacy/standalone visual recipe compilation | `app/page.tsx`, debug/golden/tests | runtime_direct | `lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts` | Yes | legacy overlap | Parallel visual recipe compilers conflict with surface mapper | High | Runtime direct legacy path |
| `lib/blundr/visualRecipe/visualRecipeAdapter.ts` | Adapt visual recipes for board layer | `app/page.tsx`, visual recipe tests | runtime_direct | `lib/blundr/visualRecipe/__tests__/visualRecipeAdapter.test.ts` | Yes | legacy overlap | Multiple adapters can alter UI semantics | Medium | Runtime direct |
| `lib/blundr/salience/visualRecipes.ts` | Legacy salience visual recipe rendering | `salienceVisualSelector`, `lib/blundr/index.ts` | runtime_indirect | no direct test import found | Yes | legacy overlap | Separate visual recipe family can conflict with presentation/visualRecipe modules | Medium | Alternative visual path |

## I. Debug Snapshot and Readiness-Relevant Debug
| File path | Current responsibility | Direct importers | Usage class | Tests that cover it | Overlaps future Stage 2 | Label | Risk if duplicated | Risk if removed | Notes |
|---|---|---|---|---|---|---|---|---|---|
| `lib/blundr/debug/trainerDebugSnapshot.ts` | Build trainer debug snapshot/health packet | `trainerDebugCollector`, many coach tests | runtime_indirect | `lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts`, `tests/coach/debugHealthFrameRelevance.test.ts` | Yes (future readiness reporting) | suspected canonical candidate | Multiple debug packet builders cause QA ambiguity | Medium | Current baseline failing assertion points here |

## J. Additional Duplication/Orphan Signals (Audit Candidates)
Potential orphaned candidates from related-module scan (manual verification still required):
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

No production action taken on these candidates in Phase A.
