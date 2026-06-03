# Package 6 Command Log

## Step A Inspection

$ git branch --show-current
v2.8.0-intelligent-coach-live

$ git status --short
 M tests/coach/antiHallucination.test.ts
 M tests/coach/evidenceGraph.test.ts
 M tests/coach/plainLeak.test.ts
?? .agent_runs/v2.8.0-intelligent-coach/20260603_135016/
?? BLUNDR_v2.8.0_INTELLIGENT_COACH_LIVE_VERSION_ROADMAP.md
?? BLUNDR_v2.8.0_PACKAGE_0_CODEX_PROMPT.md
?? lib/blundr/concepts/
?? tests/coach/dynamicConceptActivator.test.ts
?? tests/coach/teachingConceptRegistry.test.ts

$ find lib/blundr -maxdepth 4 -type f | sort
lib/blundr/animation/__tests__/animationConductor.test.ts
lib/blundr/animation/__tests__/animationEndStatePersistence.test.ts
lib/blundr/animation/__tests__/visualRecipePlaybackHookKey.test.ts
lib/blundr/animation/__tests__/visualRecipePlaybackSnapshot.test.ts
lib/blundr/animation/animationConductor.ts
lib/blundr/animation/animationStateMachine.ts
lib/blundr/animation/animationTimeline.ts
lib/blundr/animation/animationTypes.ts
lib/blundr/animation/playbackKey.ts
lib/blundr/animation/playbackSnapshot.ts
lib/blundr/brain/analyzeBlundrPosition.ts
lib/blundr/brain/boardTruth/buildBoardTruth.ts
lib/blundr/brain/buildEvidenceGraph.ts
lib/blundr/brain/candidates/generateCandidateMoves.ts
lib/blundr/brain/engineValidation/validateCandidateWithStockfish.ts
lib/blundr/brain/hints/buildHintLadder.ts
lib/blundr/brain/index.ts
lib/blundr/brain/pedagogy/rankTeachingCandidates.ts
lib/blundr/brain/providers/boardTruthProvider.ts
lib/blundr/brain/providers/moveSemanticsProvider.ts
lib/blundr/brain/providers/openingContextProvider.ts
lib/blundr/brain/providers/providerHealth.ts
lib/blundr/brain/providers/strategicFeatureProvider.ts
lib/blundr/brain/providers/tacticalMotifProvider.ts
lib/blundr/brain/providers/visualEvidenceProvider.ts
lib/blundr/brain/types.ts
lib/blundr/cache/__tests__/cacheInvalidation.test.ts
lib/blundr/cache/__tests__/explanationCache.test.ts
lib/blundr/cache/__tests__/featureCache.test.ts
lib/blundr/cache/__tests__/opportunityCache.test.ts
lib/blundr/cache/__tests__/planCache.test.ts
lib/blundr/cache/cacheDebug.ts
lib/blundr/cache/coachCacheTypes.ts
lib/blundr/cache/explanationCache.ts
lib/blundr/cache/featureCache.ts
lib/blundr/cache/normalizedFenCache.ts
lib/blundr/cache/opportunityCache.ts
lib/blundr/cache/planCache.ts
lib/blundr/cache/testCoachCaching.ts
lib/blundr/coach/__tests__/coachCardPresenter.test.ts
lib/blundr/coach/__tests__/coachContextBuilder.test.ts
lib/blundr/coach/__tests__/coachDecisionEngine.test.ts
lib/blundr/coach/__tests__/coachHintEngine.test.ts
lib/blundr/coach/__tests__/coachSafety.test.ts
lib/blundr/coach/__tests__/coachUtteranceMemory.test.ts
lib/blundr/coach/__tests__/coachVariationPolicy.test.ts
lib/blundr/coach/__tests__/genericCoachRepetitionGuard.test.ts
lib/blundr/coach/__tests__/genericDominancePolicy.test.ts
lib/blundr/coach/__tests__/intentFirstCoachEngine.test.ts
lib/blundr/coach/__tests__/sessionCoachMemory.test.ts
lib/blundr/coach/__tests__/specificityScorer.test.ts
lib/blundr/coach/__tests__/teachingIntent.test.ts
lib/blundr/coach/coachCardPresenter.ts
lib/blundr/coach/coachContextBuilder.ts
lib/blundr/coach/coachCopyLibrary.ts
lib/blundr/coach/coachDebug.ts
lib/blundr/coach/coachDecisionEngine.ts
lib/blundr/coach/coachHintEngine.ts
lib/blundr/coach/coachIntelligenceDebug.ts
lib/blundr/coach/coachSafety.ts
lib/blundr/coach/coachTypes.ts
lib/blundr/coach/coachUtteranceMemory.ts
lib/blundr/coach/coachVariationPolicy.ts
lib/blundr/coach/genericCoachRepetitionGuard.ts
lib/blundr/coach/intentFirstCoachEngine.ts
lib/blundr/coach/sessionCoachMemory.ts
lib/blundr/coach/specificityScorer.ts
lib/blundr/coach/teachingIntent.ts
lib/blundr/coach/testAdaptiveCoach.ts
lib/blundr/coach/testIntentFirstCoach.ts
lib/blundr/coachBrain/__tests__/attackMapRaycast.test.ts
lib/blundr/coachBrain/__tests__/boardClaimValidator.test.ts
lib/blundr/coachBrain/__tests__/coachActionResolver.test.ts
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts
lib/blundr/coachBrain/__tests__/evidenceConditionedCopyBuilder.test.ts
lib/blundr/coachBrain/__tests__/maiaStatus.test.ts
lib/blundr/coachBrain/__tests__/moveFactExtractor.test.ts
lib/blundr/coachBrain/__tests__/portionAndThemePolicy.test.ts
lib/blundr/coachBrain/attackMap.ts
lib/blundr/coachBrain/boardClaimValidator.ts
lib/blundr/coachBrain/boardFactExtractor.ts
lib/blundr/coachBrain/coachActionResolver.ts
lib/blundr/coachBrain/coachBrainDebug.ts
lib/blundr/coachBrain/coachEvidenceBuilder.ts
lib/blundr/coachBrain/coachEvidenceTypes.ts
lib/blundr/coachBrain/coachExplanationPipeline.ts
lib/blundr/coachBrain/evidenceConditionedCopyBuilder.ts
lib/blundr/coachBrain/moveFactExtractor.ts
lib/blundr/coachBrain/testCoachBrain.ts
lib/blundr/coachCompiler/types.ts
lib/blundr/coachQuality/__tests__/coachBenchmarkRunner.test.ts
lib/blundr/coachQuality/__tests__/coachCopyLint.test.ts
lib/blundr/coachQuality/__tests__/coachQualityScorer.test.ts
lib/blundr/coachQuality/coachBenchmarkFixtures.ts
lib/blundr/coachQuality/coachBenchmarkRunner.ts
lib/blundr/coachQuality/coachBenchmarkTypes.ts
lib/blundr/coachQuality/coachCopyLint.ts
lib/blundr/coachQuality/coachQualityScorer.ts
lib/blundr/coachQuality/coachRegressionReport.ts
lib/blundr/coachQuality/testCoachBenchmark.ts
lib/blundr/coachQuality/testCoachQuality.ts
lib/blundr/coachSurface/__tests__/coachHideSurface.test.ts
lib/blundr/coachSurface/__tests__/coachSurfacePolicy.test.ts
lib/blundr/coachSurface/__tests__/legacyCueSuppression.test.ts
lib/blundr/coachSurface/__tests__/moveImpactPresenter.test.ts
lib/blundr/coachSurface/coachSurfacePolicy.ts
lib/blundr/coachSurface/moveImpactPresenter.ts
lib/blundr/coachSurface/testCoachSurface.ts
lib/blundr/coaching/adaptiveContext.ts
lib/blundr/coaching/coachingMemory.ts
lib/blundr/coaching/contextVariants.ts
lib/blundr/concepts/TeachingConcept.ts
lib/blundr/concepts/conceptFamilies.ts
lib/blundr/concepts/conceptSafety.ts
lib/blundr/concepts/dynamicConceptActivator.ts
lib/blundr/concepts/index.ts
lib/blundr/concepts/teachingConceptRegistry.ts
lib/blundr/continuedPlay/__tests__/continuedPlayMovePolicy.test.ts
lib/blundr/continuedPlay/__tests__/continuedPlayMovePolicyDebug.test.ts
lib/blundr/continuedPlay/continuedPlayMovePolicy.ts
lib/blundr/continuedPlay/testContinuedPlay.ts
lib/blundr/debug/__tests__/fallbackCopyGuard.test.ts
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts
lib/blundr/debug/__tests__/trainerDebugEventLog.test.ts
lib/blundr/debug/__tests__/trainerDebugSanitizer.test.ts
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts
lib/blundr/debug/testMultiMoveTrainingQa.ts
lib/blundr/debug/testTrainerDebug.ts
lib/blundr/debug/trainerDebugCollector.ts
lib/blundr/debug/trainerDebugEventLog.ts
lib/blundr/debug/trainerDebugGuards.ts
lib/blundr/debug/trainerDebugSanitizer.ts
lib/blundr/debug/trainerDebugSnapshot.ts
lib/blundr/debug/trainerDebugTypes.ts
lib/blundr/engine/engineTypes.ts
lib/blundr/engine/mockEngineProvider.ts
lib/blundr/engine/stockfishValidation.ts
lib/blundr/explanation/__tests__/chessLanguageLibrary.test.ts
lib/blundr/explanation/__tests__/coachTemplateLibrary.test.ts
lib/blundr/explanation/__tests__/explanationSafetyLinter.test.ts
lib/blundr/explanation/__tests__/proceduralExplanationEngine.test.ts
lib/blundr/explanation/__tests__/ratingDepthPolicy.test.ts
lib/blundr/explanation/__tests__/templateRegistryStats.test.ts
lib/blundr/explanation/__tests__/templateVariableResolver.test.ts
lib/blundr/explanation/chessLanguageLibrary.ts
lib/blundr/explanation/coachClaimValidator.ts
lib/blundr/explanation/coachTemplateLibrary.ts
lib/blundr/explanation/coachVoicePolicy.ts
lib/blundr/explanation/explanationSafetyLinter.ts
lib/blundr/explanation/explanationTypes.ts
lib/blundr/explanation/opportunityTemplateMatcher.ts
lib/blundr/explanation/proceduralExplanationEngine.ts
lib/blundr/explanation/ratingDepthPolicy.ts
lib/blundr/explanation/templateRegistryStats.ts
lib/blundr/explanation/templateVariableResolver.ts
lib/blundr/explanation/testProceduralExplanation.ts
lib/blundr/featurePacketBuilder.ts
lib/blundr/features/__tests__/advancedFeatureExtractor.test.ts
lib/blundr/features/__tests__/imbalanceExtractor.test.ts
lib/blundr/features/__tests__/kingSafetyExtractor.test.ts
lib/blundr/features/__tests__/pawnStructureExtractor.test.ts
lib/blundr/features/__tests__/pieceQualityExtractor.test.ts
lib/blundr/features/__tests__/tacticalMotifExtractor.test.ts
lib/blundr/features/advancedFeatureExtractor.ts
lib/blundr/features/advancedFeatureTypes.ts
lib/blundr/features/featureConfidence.ts
lib/blundr/features/featureDebug.ts
lib/blundr/features/imbalanceExtractor.ts
lib/blundr/features/kingSafetyExtractor.ts
lib/blundr/features/pawnStructureExtractor.ts
lib/blundr/features/pieceQualityExtractor.ts
lib/blundr/features/tacticalMotifExtractor.ts
lib/blundr/features/testAdvancedFeatures.ts
lib/blundr/geometry/__tests__/attackMap.test.ts
lib/blundr/geometry/__tests__/colorComplex.test.ts
lib/blundr/geometry/__tests__/directionUtils.test.ts
lib/blundr/geometry/__tests__/fenBoardParser.test.ts
lib/blundr/geometry/__tests__/influenceMap.test.ts
lib/blundr/geometry/__tests__/kingZone.test.ts
lib/blundr/geometry/__tests__/legalMoveUtils.test.ts
lib/blundr/geometry/__tests__/lineGeometry.test.ts
lib/blundr/geometry/__tests__/materialUtils.test.ts
lib/blundr/geometry/__tests__/mobilityDelta.test.ts
lib/blundr/geometry/__tests__/mobilityMap.test.ts
lib/blundr/geometry/__tests__/moveDelta.test.ts
lib/blundr/geometry/__tests__/pawnGeometry.test.ts
lib/blundr/geometry/__tests__/rayGeometry.test.ts
lib/blundr/geometry/__tests__/squareUtils.test.ts
lib/blundr/geometry/attackMap.ts
lib/blundr/geometry/boardTypes.ts
lib/blundr/geometry/colorComplex.ts
lib/blundr/geometry/directionUtils.ts
lib/blundr/geometry/fenBoardParser.ts
lib/blundr/geometry/geometryDebug.ts
lib/blundr/geometry/influenceMap.ts
lib/blundr/geometry/kingZone.ts
lib/blundr/geometry/legalMoveUtils.ts
lib/blundr/geometry/lineGeometry.ts
lib/blundr/geometry/materialUtils.ts
lib/blundr/geometry/mobilityDelta.ts
lib/blundr/geometry/mobilityMap.ts
lib/blundr/geometry/moveDelta.ts
lib/blundr/geometry/pawnGeometry.ts
lib/blundr/geometry/rayGeometry.ts
lib/blundr/geometry/salienceTypes.ts
lib/blundr/geometry/squareUtils.ts
lib/blundr/geometry/testGeometry.ts
lib/blundr/golden/__tests__/continuationGolden.test.ts
lib/blundr/golden/__tests__/featureMappingGolden.test.ts
lib/blundr/golden/__tests__/imbalanceGolden.test.ts
lib/blundr/golden/__tests__/italianBc4Golden.test.ts
lib/blundr/golden/__tests__/italianC3Golden.test.ts
lib/blundr/golden/__tests__/italianCastlingGolden.test.ts
lib/blundr/golden/__tests__/italianRe1Golden.test.ts
lib/blundr/golden/__tests__/kingSafetyGolden.test.ts
lib/blundr/golden/__tests__/pawnStructureGolden.test.ts
lib/blundr/golden/__tests__/pieceQualityGolden.test.ts
lib/blundr/golden/__tests__/plainViewGolden.test.ts
lib/blundr/golden/goldenAssertions.ts
lib/blundr/golden/goldenPositions.ts
lib/blundr/golden/testGoldenCoach.ts
lib/blundr/index.ts
lib/blundr/knowledge/openingKnowledgeTypes.ts
lib/blundr/learning/learningEvents.ts
lib/blundr/liveCoach/__tests__/candidateMoveProfiler.test.ts
lib/blundr/liveCoach/__tests__/engineSafetyAdapter.test.ts
lib/blundr/liveCoach/__tests__/humanEngineDivergence.test.ts
lib/blundr/liveCoach/__tests__/liveCoachCommentRanker.test.ts
lib/blundr/liveCoach/__tests__/liveCoachSafety.test.ts
lib/blundr/liveCoach/__tests__/liveCoachSilencePolicy.test.ts
lib/blundr/liveCoach/__tests__/maiaSignalAdapter.test.ts
lib/blundr/liveCoach/__tests__/patternTransferMatcher.test.ts
lib/blundr/liveCoach/__tests__/pedagogicalOpportunityEngine.test.ts
lib/blundr/liveCoach/__tests__/positionEvidenceBuilder.test.ts
lib/blundr/liveCoach/__tests__/positionFeatureExtractor.test.ts
lib/blundr/liveCoach/__tests__/skillGradientAnalyzer.test.ts
lib/blundr/liveCoach/candidateMoveProfiler.ts
lib/blundr/liveCoach/engineSafetyAdapter.ts
lib/blundr/liveCoach/humanEngineDivergence.ts
lib/blundr/liveCoach/liveCoachCommentRanker.ts
lib/blundr/liveCoach/liveCoachCopyLibrary.ts
lib/blundr/liveCoach/liveCoachDebug.ts
lib/blundr/liveCoach/liveCoachIntentSelector.ts
lib/blundr/liveCoach/liveCoachSafety.ts
lib/blundr/liveCoach/liveCoachSilencePolicy.ts
lib/blundr/liveCoach/liveCoachTypes.ts
lib/blundr/liveCoach/maiaSignalAdapter.ts
lib/blundr/liveCoach/patternTransferMatcher.ts
lib/blundr/liveCoach/pedagogicalOpportunityEngine.ts
lib/blundr/liveCoach/positionEvidenceBuilder.ts
lib/blundr/liveCoach/positionFeatureExtractor.ts
lib/blundr/liveCoach/skillGradientAnalyzer.ts
lib/blundr/liveCoach/testLiveCoach.ts
lib/blundr/maia/maiaTypes.ts
lib/blundr/maia/mockMaiaProvider.ts
lib/blundr/openings/__tests__/branchResolver.test.ts
lib/blundr/openings/__tests__/expectedMoveResolver.test.ts
lib/blundr/openings/__tests__/guidedCoveragePolicy.test.ts
lib/blundr/openings/__tests__/openingFamilyPlanFallback.test.ts
lib/blundr/openings/__tests__/openingTree.test.ts
lib/blundr/openings/__tests__/transpositionMatcher.test.ts
lib/blundr/openings/branchResolver.ts
lib/blundr/openings/expectedMoveResolver.ts
lib/blundr/openings/guidedCoveragePolicy.ts
lib/blundr/openings/openingFamilyPlanFallback.ts
lib/blundr/openings/openingResolverDebug.ts
lib/blundr/openings/openingTree.ts
lib/blundr/openings/openingTypes.ts
lib/blundr/openings/testOpeningResolver.ts
lib/blundr/openings/transpositionMatcher.ts
lib/blundr/opponent/__tests__/opponentVariationPolicy.test.ts
lib/blundr/opponent/opponentVariationMemory.ts
lib/blundr/opponent/opponentVariationPolicy.ts
lib/blundr/opportunity/__tests__/featureOpportunityMapper.test.ts
lib/blundr/opportunity/__tests__/mappingPipeline.test.ts
lib/blundr/opportunity/__tests__/multiLayerOpportunityRanker.test.ts
lib/blundr/opportunity/educationalOpportunityLayer.ts
lib/blundr/opportunity/engineCandidateOpportunityLayer.ts
lib/blundr/opportunity/expectedMoveOpportunityLayer.ts
lib/blundr/opportunity/featureOpportunityMapper.ts
lib/blundr/opportunity/mappingDebug.ts
lib/blundr/opportunity/multiLayerOpportunityRanker.ts
lib/blundr/opportunity/opportunityDebug.ts
lib/blundr/opportunity/opportunityTypes.ts
lib/blundr/opportunity/repertoireOpportunityLayer.ts
lib/blundr/opportunity/strategicOpportunityLayer.ts
lib/blundr/opportunity/tacticalOpportunityLayer.ts
lib/blundr/opportunity/testMappingPipeline.ts
lib/blundr/opportunity/testOpportunityRanker.ts
lib/blundr/opportunity/visualRecipeOpportunityLayer.ts
lib/blundr/plans/__tests__/openingPlanRegistry.test.ts
lib/blundr/plans/__tests__/planFeatureMapper.test.ts
lib/blundr/plans/__tests__/planMatcherRules.test.ts
lib/blundr/plans/__tests__/planRecognitionEngine.test.ts
lib/blundr/plans/openingPlanRegistry.ts
lib/blundr/plans/planDebug.ts
lib/blundr/plans/planFeatureMapper.ts
lib/blundr/plans/planMatcherRules.ts
lib/blundr/plans/planRecognitionEngine.ts
lib/blundr/plans/planTypes.ts
lib/blundr/plans/testPlanRecognition.ts
lib/blundr/presentation/__tests__/coachActionStylePolicy.test.ts
lib/blundr/presentation/__tests__/coachHideDoesNotSuppressVisuals.test.ts
lib/blundr/presentation/__tests__/phaseActionGating.test.ts
lib/blundr/presentation/__tests__/presentationLegacySuppression.test.ts
lib/blundr/presentation/__tests__/presentationVisualIndependence.test.ts
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts
lib/blundr/presentation/buildVisibleTeachingSurface.ts
lib/blundr/presentation/coachActionStylePolicy.ts
lib/blundr/presentation/phaseActionGating.ts
lib/blundr/presentation/presentationDebug.ts
lib/blundr/presentation/testPresentationFrame.ts
lib/blundr/presentation/testVisualLayerIndependence.ts
lib/blundr/presentation/trainerPresentationFrame.ts
lib/blundr/presentation/trainerPresentationTypes.ts
lib/blundr/presentation/types.ts
lib/blundr/presentation/visibleActionPolicy.ts
lib/blundr/ruleVisualSelector.ts
lib/blundr/runtime/__tests__/currentInstructionFrame.test.ts
lib/blundr/runtime/__tests__/opponentReplyGuard.test.ts
lib/blundr/runtime/continuationRuntimeState.ts
lib/blundr/runtime/currentInstructionFrame.ts
lib/blundr/runtime/currentInstructionTarget.ts
lib/blundr/runtime/instructionFrameLock.ts
lib/blundr/runtime/opponentReplyGuard.ts
lib/blundr/safety/types.ts
lib/blundr/salience/__tests__/salienceVisualSelector.test.ts
lib/blundr/salience/conceptLabeler.ts
lib/blundr/salience/salienceScorer.ts
lib/blundr/salience/salienceVisualSelector.ts
lib/blundr/salience/visualRecipes.ts
lib/blundr/teaching/__tests__/overlayLifecycle.test.ts
lib/blundr/teaching/__tests__/trainingContextEngine.test.ts
lib/blundr/teaching/boardAnalyzer.ts
lib/blundr/teaching/bookSupport.ts
lib/blundr/teaching/chessFeatureGraph.ts
lib/blundr/teaching/conceptDetectors.ts
lib/blundr/teaching/conceptTemplates.ts
lib/blundr/teaching/evidenceCollector.ts
lib/blundr/teaching/moveDeltaAnalyzer.ts
lib/blundr/teaching/moveQualityGate.ts
lib/blundr/teaching/moveSemanticAnalyzer.ts
lib/blundr/teaching/overlayLifecycle.ts
lib/blundr/teaching/squareUtils.ts
lib/blundr/teaching/storyRanker.ts
lib/blundr/teaching/storyTypes.ts
lib/blundr/teaching/teachingCueCompiler.ts
lib/blundr/teaching/teachingCueTypes.ts
lib/blundr/teaching/teachingOrchestrator.ts
lib/blundr/teaching/teachingPermissions.ts
lib/blundr/teaching/topMoveComparison.ts
lib/blundr/teaching/trainingContextEngine.ts
lib/blundr/teaching/trainingContextTypes.ts
lib/blundr/teaching/trustClassifier.ts
lib/blundr/teaching/visualOverlayRouter.ts
lib/blundr/visual/__tests__/continuationCandidateVisual.test.ts
lib/blundr/visual/continuationCandidateVisual.ts
lib/blundr/visual/normalizeVisualFen.ts
lib/blundr/visualRecipe/__tests__/castlingVisualRecipe.test.ts
lib/blundr/visualRecipe/__tests__/legacyVisualSuppression.test.ts
lib/blundr/visualRecipe/__tests__/visualFenNormalization.test.ts
lib/blundr/visualRecipe/__tests__/visualRecipeAdapter.test.ts
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts
lib/blundr/visualRecipe/__tests__/visualRecipePolicy.test.ts
lib/blundr/visualRecipe/castlingVisualUtils.ts
lib/blundr/visualRecipe/legacyVisualSuppression.ts
lib/blundr/visualRecipe/testCastlingVisualLifecycle.ts
lib/blundr/visualRecipe/visualOpacityPolicy.ts
lib/blundr/visualRecipe/visualPriorityPolicy.ts
lib/blundr/visualRecipe/visualRecipeAdapter.ts
lib/blundr/visualRecipe/visualRecipeBudget.ts
lib/blundr/visualRecipe/visualRecipeCompiler.ts
lib/blundr/visualRecipe/visualRecipeIds.ts
lib/blundr/visualRecipe/visualRecipePermissions.ts
lib/blundr/visualRecipe/visualRecipeTypes.ts
lib/blundr/visualRecipe/visualTimingProfiles.ts

$ find tests/coach -maxdepth 2 -type f | sort
tests/coach/antiHallucination.test.ts
tests/coach/browserContract.test.ts
tests/coach/continuationFlow.test.ts
tests/coach/currentInstructionFrame.test.ts
tests/coach/dynamicConceptActivator.test.ts
tests/coach/evidenceGraph.test.ts
tests/coach/goldenPositions.test.ts
tests/coach/plainLeak.test.ts
tests/coach/providerFailure.test.ts
tests/coach/showMoreVisualReveal.test.ts
tests/coach/targetInvariant.test.ts
tests/coach/teachingConceptRegistry.test.ts
tests/coach/typeContracts.test.ts

$ git grep -n "TeachingConcept\|DynamicConceptActivator\|conceptRegistry\|activatedConcept\|conceptId\|ConceptFamily" lib app components tests || true
app/page.tsx:1508:    concept:teachingOrchestration.cue.conceptId,
app/page.tsx:1523:      conceptId:teachingOrchestration.cue.conceptId,
app/page.tsx:1524:      patternId:`${selectedRepertoireId}:${teachingOrchestration.cue.conceptId}`,
app/page.tsx:1532:      conceptId:visualRecipe.conceptId,
app/page.tsx:2165:      conceptId:coachContextResult.context?.conceptId??"center_tension",
app/page.tsx:2214:    coachContextResult.context?.conceptId,
app/page.tsx:2438:    selectedTeachingConcept: (brainAnalysisForSurface as any)?.pedagogicalFocus?.focus ?? null,
app/page.tsx:2839:    const eventKey=`${normalizeFen(fen)}|${cue.metadata.moveUci}|${cue.conceptId}|${metaText("trainingContextMode")}|${metaText("moveTrust")}|${cue.cueMode}`;
app/page.tsx:2869:        conceptId:metaText("conceptId"),
app/page.tsx:3560:    selectedConceptId:visualRecipe?.conceptId??teachingOrchestration?.cue.conceptId,
app/page.tsx:3756:      {false && activeBoard&&!displayedCoachDecision?.shouldShowCoachCard&&!branchTransitionSurface&&coachSurfacePolicy.allowLegacyTrainingCard&&!visibleTeachingSurface?.coach?.shouldRender&&!isActiveTeachingFrame&&<div className="rounded-3xl border border-stone-200 bg-white/95 p-4 shadow-sm"><div className="mb-2 flex items-center justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-wide text-green-700">{patternCueBadgeLabel.replace("Cue ready","Plan mode")}</div><h2 className="text-lg font-black">{patternCue.title}</h2></div><button onClick={()=>setShowDetails(!showDetails)} className="rounded-full bg-stone-100 px-3 py-2 text-xs font-black text-stone-600">{showDetails?"Hide":"Show more"}</button></div><p className="text-sm leading-6 text-stone-700">{patternCue.snippet}</p>{opponentCue&&boardSettings.showOpponentCue&&shouldRenderOpponentLastMoveHighlight({committed:opponentCue.committed,cueFen:opponentCue.fen,boardFen:normalizeFen(fen)})&&<p className="mt-2 rounded-2xl bg-purple-50 p-3 text-sm leading-6 text-purple-800"><span className="font-black">Opponent cue: </span>{opponentCue.message}</p>}{coachSurfacePolicy.allowNextMoveText&&patternCue.next&&(trainerView==="assisted"||showAnswer)&&<p className="mt-2 rounded-2xl bg-stone-50 p-3 text-sm leading-6 text-stone-600"><span className="font-black text-stone-900">Next: </span>{patternCue.next}</p>}{visualModelError&&<p className="mt-2 rounded-2xl bg-amber-50 p-2 text-[11px] font-bold leading-5 text-amber-700">Visual cue unavailable: {visualModelError}</p>}{coachSurfacePolicy.allowMoveImpactCard&&moveImpactPresentation.show&&<MoveImpact impact={{label:moveImpactPresentation.label,pct:moveImpact.pct,tone:moveImpact.tone,note:moveImpactPresentation.note}}/>}{showDetails&&<div className="mt-3 space-y-2"><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Headline: {patternCue.title}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Visual: {activeVisualModelOutput?.animationPackage?.name??annotation.visualExplanation}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Move Quality Gate</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Version: {MOVE_QUALITY_GATE_VERSION}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Required: {shouldValidateTrainingMove?"yes":"no"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Status: {moveQualityPending?"pending":moveQuality?.status??"idle"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Expected UCI: {moveQuality?.expectedMovesUci?.join(", ")||expectedUserUcis.join(", ")||"none"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Expected SAN: {expectedUserSans.join(", ")||"none"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Stockfish top two: {moveQuality?.topMoves?.map((line)=>line.uci).join(", ")||"none"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Reason: {moveQuality?.reason??"No validation result."}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Checked: {moveQuality?.checkedAt?new Date(moveQuality.checkedAt).toLocaleTimeString():"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Hints hidden: {hideUnverifiedTrainingHints?"yes":"no"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Teaching Cue Compiler</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Compiler version: {TEACHING_CUE_COMPILER_VERSION}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Compiler concept: {teachingOrchestration?.cue.conceptId??"none"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Compiler confidence: {teachingOrchestration?Number((teachingOrchestration.cue.debug.confidence??0).toFixed(3)):"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Compiler reason: {teachingOrchestration?.cue.debug.selectedReason??"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Compiler delta: {teachingOrchestration?.cue.debug.deltaSummary?.join(" | ")||"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Compiler scores: {teachingOrchestration?.cue.debug.detectorScores?.map((s)=>`${s.conceptId}:${s.finalScore.toFixed(2)}`).slice(0,6).join(", ")||"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Orchestrator tier: {teachingOrchestration?.classification.tier??"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Selected story: {teachingOrchestration?.selectedStory?.kind??"n/a"} ({teachingOrchestration?.selectedStory?.score.total?.toFixed?.(2)??"n/a"})</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Rejected stories: {teachingOrchestration?.debug.rejectedStories?.map((r)=>`${r.kind}:${r.total.toFixed(2)}`).join(", ")||"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Visual budget: {teachingOrchestration?JSON.stringify(teachingOrchestration.debug.visualBudget):"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Suppressed visuals: {teachingOrchestration?.debug.suppressionReasons?.join(", ")||"none"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Learning events are being stored locally for future progress and Review features.</div>{annotation.reason&&<div className="rounded-2xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">Fallback reason: {annotation.reason}</div>}</div>}</div>}
app/page.tsx:3783:      {showDetails&&visualRecipe&&<div className="rounded-3xl border border-stone-200 bg-white/95 p-4 text-xs font-semibold text-stone-500 shadow-sm"><div className="font-black text-stone-800">Visual Recipe</div><div className="mt-2">visualRecipeId: {visualRecipe.visualRecipeId}</div><div>recipeSchemaVersion: {visualRecipe.recipeSchemaVersion}</div><div>patternId: {visualRecipe.patternId}</div><div>recipeMode: {visualRecipe.mode}</div><div>recipeConceptId: {visualRecipe.conceptId}</div><div>recipeFrameId: {visualRecipe.frameId??"n/a"}</div><div>recipeFen: {visualRecipe.fen}</div><div>recipeBeatCount: {visualRecipe.beats.length}</div><div>recipePrimitiveCount: {visualRecipe.beats.reduce((sum,beat)=>sum+beat.primitives.length,0)}</div><div>recipePrimitives: {visualRecipe.beats.flatMap((beat)=>beat.primitives.map((primitive)=>`${primitive.type}:${primitive.id}`)).join(", ")||"none"}</div><div>recipePermissions: {JSON.stringify(visualRecipe.permissions)}</div><div>recipeLearningAnchor: {JSON.stringify(visualRecipe.learningAnchor)}</div><div>recipeSuppressedReason: {visualRecipe.debug?.recipeSuppressedReason??"none"}</div><div>recipeLanes: {visualRecipe.debug?.recipeLanes?.join(", ")||"none"}</div><div>recipeEffectFamilies: {visualRecipe.debug?.recipeEffectFamilies?.join(", ")||"none"}</div><div>recipePrioritySummary: {visualRecipe.debug?.recipePrioritySummary??"none"}</div><div>recipeTimingProfile: {visualRecipe.debug?.recipeTimingProfile?JSON.stringify(visualRecipe.debug.recipeTimingProfile):"n/a"}</div><div>recipeOpacityPolicy: {visualRecipe.debug?.recipeOpacityPolicy?JSON.stringify(visualRecipe.debug.recipeOpacityPolicy):"n/a"}</div><div>suppressedByPriority: {visualRecipe.debug?.suppressedByPriority?.join(", ")||"none"}</div><div>suppressedByBudget: {visualRecipe.debug?.suppressedByBudget?.join(", ")||"none"}</div><div>tacticalPrimitivesPresent: {visualRecipe.debug?.tacticalPrimitivesPresent?"true":"false"}</div><div>tacticalPrimitivesRendered: {visualRecipeOverlay.tacticalPrimitivesRendered?"true":"false"}</div><div>schemaSerializable: {visualRecipe.debug?.schemaSerializable?"true":"false"}</div><div>adapterAllowed: {visualRecipeOverlay.adapterAllowed?"true":"false"}</div><div>adapterSuppressedReason: {visualRecipeOverlay.adapterSuppressedReason??"none"}</div><div>recipeFenRaw: {visualRecipeOverlay.recipeFenRaw??"n/a"}</div><div>boardFenRaw: {visualRecipeOverlay.boardFenRaw}</div><div>recipeFenNormalized: {visualRecipeOverlay.recipeFenNormalized??"n/a"}</div><div>boardFenNormalized: {visualRecipeOverlay.boardFenNormalized??"n/a"}</div><div>recipeFrameIdRaw: {String(visualRecipeOverlay.recipeFrameIdRaw??"n/a")}</div><div>boardFrameIdRaw: {String(visualRecipeOverlay.boardFrameIdRaw)}</div><div>recipeFrameMatchesBoard: {visualRecipeOverlay.recipeFrameMatchesBoard?"true":"false"}</div><div>recipeFenMatchesBoard: {visualRecipeOverlay.recipeFenMatchesBoard?"true":"false"}</div></div>}
lib/blundr/animation/__tests__/animationConductor.test.ts:91:    conceptId: "develops_with_pressure",
lib/blundr/animation/__tests__/animationConductor.test.ts:114:      conceptId: "develops_with_pressure",
lib/blundr/animation/__tests__/animationEndStatePersistence.test.ts:13:    conceptId: "castle_for_safety",
lib/blundr/animation/__tests__/animationEndStatePersistence.test.ts:49:    learningAnchor: { patternId: "pattern:castle", conceptId: "castle_for_safety", fen: "x", moveUci: "e1g1", moveSan: "O-O", keySquares: ["e1", "g1", "h1", "f1"], keyPieces: ["king", "rook"], reviewPromptKind: "find_move" },
lib/blundr/brain/hints/buildHintLadder.ts:22:  selectedTeachingConcept?: string | null;
lib/blundr/cache/planCache.ts:9:export function planCacheKey(input: { fen: string; expectedMoveUci?: string; openingId?: string; conceptId?: string; trainerMode?: string }): string {
lib/blundr/cache/planCache.ts:10:  return [normalizedFenCacheKey(input.fen), input.expectedMoveUci ?? "", input.openingId ?? "", input.conceptId ?? "", input.trainerMode ?? ""].join("|");
lib/blundr/cache/planCache.ts:14:  const key = planCacheKey({ fen: input.fen, expectedMoveUci: input.moveUci, openingId: input.openingId, conceptId: input.conceptId });
lib/blundr/coach/__tests__/coachContextBuilder.test.ts:17:      conceptId: "develop_with_pressure",
lib/blundr/coach/__tests__/coachDecisionEngine.test.ts:14:    conceptId: "develop_with_pressure",
lib/blundr/coach/__tests__/coachDecisionEngine.test.ts:97:    context: baseContext({ conceptId: "prepare_center_break", viewMode: "assisted" }),
lib/blundr/coach/__tests__/coachDecisionEngine.test.ts:106:    context: baseContext({ conceptId: "rook_to_center", viewMode: "assisted" }),
lib/blundr/coach/__tests__/coachDecisionEngine.test.ts:115:    context: baseContext({ conceptId: "center_tension", viewMode: "assisted", exactMoveAllowed: false }),
lib/blundr/coach/__tests__/coachSafety.test.ts:8:    conceptId: "develop_with_pressure",
lib/blundr/coach/__tests__/coachSafety.test.ts:22:    conceptId: "x",
lib/blundr/coach/__tests__/coachUtteranceMemory.test.ts:38:        conceptId: "develop_with_pressure",
lib/blundr/coach/__tests__/genericDominancePolicy.test.ts:15:    trainingContext: { conceptId: "prepare_center_break" },
lib/blundr/coach/__tests__/intentFirstCoachEngine.test.ts:16:  const decision = decideIntentFirstCoach({ packet, interaction: "none", conceptId: "develop_with_pressure", openingId: "italian", visualRecipeId: "r" });
lib/blundr/coach/coachContextBuilder.ts:35:        conceptId: trainingContext?.cue?.conceptId ?? trainingContext?.selectedStory?.conceptId ?? input.trainingContext?.conceptId,
lib/blundr/coach/coachContextBuilder.ts:91:      conceptId: recipe.conceptId ?? input.trainingContext?.conceptId,
lib/blundr/coach/coachCopyLibrary.ts:8:  e({ utteranceId: "dwp_a1", utteranceFamily: "dwp_assist", conceptId: "develop_with_pressure", title: "Develop with pressure", text: "The bishop develops and pressures f7.", allowedModes: ["assisted_teach"], requiredConcreteObjects: ["bishop", "f7", "pressure"], claimTypes: ["opening_pattern"], revealRisk: "low", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:9:  e({ utteranceId: "dwp_a2", utteranceFamily: "dwp_assist", conceptId: "develop_with_pressure", title: "Develop with pressure", text: "White develops while creating a concrete target on f7.", allowedModes: ["assisted_teach"], requiredConcreteObjects: ["development", "target", "f7"], claimTypes: ["opening_pattern"], revealRisk: "low", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:10:  e({ utteranceId: "dwp_p1", utteranceFamily: "dwp_prompt", conceptId: "develop_with_pressure", text: "Look for a developing move that creates pressure.", allowedModes: ["plain_prompt"], requiredConcreteObjects: ["development", "pressure"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:11:  e({ utteranceId: "dwp_hs1", utteranceFamily: "dwp_hint", conceptId: "develop_with_pressure", text: "Think about which move develops while creating pressure.", allowedModes: ["plain_hint", "plain_wrong_move"], requiredConcreteObjects: ["development", "pressure"], claimTypes: ["plan_principle"], revealRisk: "low", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:12:  e({ utteranceId: "dwp_hg1", utteranceFamily: "dwp_hint", conceptId: "develop_with_pressure", text: "The key target is f7, and a bishop can pressure it.", allowedModes: ["plain_hint", "plain_wrong_move"], requiredConcreteObjects: ["f7", "bishop", "pressure"], claimTypes: ["opening_pattern"], revealRisk: "medium", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:13:  e({ utteranceId: "dwp_ans1", utteranceFamily: "dwp_answer", conceptId: "develop_with_pressure", text: "Play Bc4. The bishop develops and pressures f7.", allowedModes: ["plain_answer_revealed", "supported_continuation"], requiredConcreteObjects: ["bishop", "f7", "pressure"], claimTypes: ["engine_safe_recommendation", "opening_pattern"], revealRisk: "full_answer", givesAnswer: true, requiresAnswerPermission: true }),
lib/blundr/coach/coachCopyLibrary.ts:14:  e({ utteranceId: "dwp_r1", utteranceFamily: "dwp_reinforce", conceptId: "develop_with_pressure", text: "Good. You developed with pressure, not just development.", allowedModes: ["assisted_reinforce", "correct_fast", "correct_slow"], requiredConcreteObjects: ["development", "pressure"], claimTypes: ["opening_pattern"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:15:  e({ utteranceId: "dwp_w1", utteranceFamily: "dwp_why", conceptId: "develop_with_pressure", text: "Good opening moves often develop a piece while creating a concrete target.", allowedModes: ["assisted_teach", "assisted_wrong_move"], requiredConcreteObjects: ["development", "target"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:17:  e({ utteranceId: "cfs_a1", utteranceFamily: "castle_assist", conceptId: "castle_for_safety", text: "The king moves to safety before the center opens.", allowedModes: ["assisted_teach"], requiredConcreteObjects: ["king", "center", "king safety"], claimTypes: ["opening_pattern"], revealRisk: "low", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:18:  e({ utteranceId: "cfs_p1", utteranceFamily: "castle_prompt", conceptId: "castle_for_safety", text: "Ask whether the king should stay in the center much longer.", allowedModes: ["plain_prompt"], requiredConcreteObjects: ["king", "center"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:19:  e({ utteranceId: "cfs_h1", utteranceFamily: "castle_hint", conceptId: "castle_for_safety", text: "Think about king safety before the center opens.", allowedModes: ["plain_hint", "plain_wrong_move"], requiredConcreteObjects: ["king safety", "center"], claimTypes: ["plan_principle"], revealRisk: "low", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:20:  e({ utteranceId: "cfs_h2", utteranceFamily: "castle_hint", conceptId: "castle_for_safety", text: "This is the moment to move the king to safety.", allowedModes: ["plain_hint", "plain_wrong_move"], requiredConcreteObjects: ["king", "king safety"], claimTypes: ["opening_pattern"], revealRisk: "medium", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:21:  e({ utteranceId: "cfs_ans1", utteranceFamily: "castle_answer", conceptId: "castle_for_safety", text: "Castle kingside. The king moves to safety before the center opens.", allowedModes: ["plain_answer_revealed", "supported_continuation"], requiredConcreteObjects: ["king", "center", "king safety"], claimTypes: ["engine_safe_recommendation"], revealRisk: "full_answer", givesAnswer: true, requiresAnswerPermission: true }),
lib/blundr/coach/coachCopyLibrary.ts:22:  e({ utteranceId: "cfs_r1", utteranceFamily: "castle_reinforce", conceptId: "castle_for_safety", text: "Good. The king is safer before the center opens.", allowedModes: ["assisted_reinforce", "correct_fast", "correct_slow"], requiredConcreteObjects: ["king", "center", "king safety"], claimTypes: ["opening_pattern"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:23:  e({ utteranceId: "cfs_w1", utteranceFamily: "castle_why", conceptId: "castle_for_safety", text: "Castling moves the king away from the center and connects the rook.", allowedModes: ["assisted_teach", "assisted_wrong_move"], requiredConcreteObjects: ["king", "center", "rook"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:25:  e({ utteranceId: "pcb_a1", utteranceFamily: "c3_assist", conceptId: "prepare_center_break", text: "c3 supports a later d4 break and helps White build the center.", allowedModes: ["assisted_teach"], requiredConcreteObjects: ["pawn", "d4", "center", "pawn break"], claimTypes: ["opening_pattern"], revealRisk: "low", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:26:  e({ utteranceId: "pcb_p1", utteranceFamily: "c3_prompt", conceptId: "prepare_center_break", text: "Look for White’s quiet center-building move.", allowedModes: ["plain_prompt"], requiredConcreteObjects: ["center"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:27:  e({ utteranceId: "pcb_h1", utteranceFamily: "c3_hint", conceptId: "prepare_center_break", text: "Think about preparing d4 before playing it.", allowedModes: ["plain_hint", "plain_wrong_move"], requiredConcreteObjects: ["d4", "pawn break"], claimTypes: ["plan_principle"], revealRisk: "low", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:28:  e({ utteranceId: "pcb_h2", utteranceFamily: "c3_hint", conceptId: "prepare_center_break", text: "The c-pawn can help White prepare d4.", allowedModes: ["plain_hint", "plain_wrong_move"], requiredConcreteObjects: ["pawn", "d4"], claimTypes: ["opening_pattern"], revealRisk: "medium", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:29:  e({ utteranceId: "pcb_ans1", utteranceFamily: "c3_answer", conceptId: "prepare_center_break", text: "Play c3. It supports a later d4 break.", allowedModes: ["plain_answer_revealed", "supported_continuation"], requiredConcreteObjects: ["pawn", "d4", "pawn break"], claimTypes: ["engine_safe_recommendation", "opening_pattern"], revealRisk: "full_answer", givesAnswer: true, requiresAnswerPermission: true }),
lib/blundr/coach/coachCopyLibrary.ts:31:  e({ utteranceId: "rtc_a1", utteranceFamily: "re1_assist", conceptId: "rook_to_center", text: "The rook moves toward the center so it can support White’s central plan.", allowedModes: ["assisted_teach"], requiredConcreteObjects: ["rook", "center", "central plan"], claimTypes: ["opening_pattern"], revealRisk: "low", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:32:  e({ utteranceId: "rtc_p1", utteranceFamily: "re1_prompt", conceptId: "rook_to_center", text: "Look for a quiet move that improves central support.", allowedModes: ["plain_prompt"], requiredConcreteObjects: ["center", "central plan"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:33:  e({ utteranceId: "rtc_h1", utteranceFamily: "re1_hint", conceptId: "rook_to_center", text: "The rook can move onto the e-file to support the center.", allowedModes: ["plain_hint", "plain_wrong_move"], requiredConcreteObjects: ["rook", "e-file", "center"], claimTypes: ["plan_principle"], revealRisk: "medium", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:34:  e({ utteranceId: "rtc_ans1", utteranceFamily: "re1_answer", conceptId: "rook_to_center", text: "Play Re1. The rook moves toward the center so it can support White’s central plan.", allowedModes: ["plain_answer_revealed", "supported_continuation"], requiredConcreteObjects: ["rook", "center", "central plan"], claimTypes: ["engine_safe_recommendation"], revealRisk: "full_answer", givesAnswer: true, requiresAnswerPermission: true }),
lib/blundr/coach/coachCopyLibrary.ts:36:  e({ utteranceId: "ct_a1", utteranceFamily: "center_assist", conceptId: "center_tension", text: "The fight in the center decides which pieces become active.", allowedModes: ["assisted_teach", "freeplay_principle"], requiredConcreteObjects: ["center", "piece activity"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:37:  e({ utteranceId: "ct_p1", utteranceFamily: "center_prompt", conceptId: "center_tension", text: "Study the center before choosing a move.", allowedModes: ["plain_prompt"], requiredConcreteObjects: ["center"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:38:  e({ utteranceId: "ct_h1", utteranceFamily: "center_hint", conceptId: "center_tension", text: "Look at how the central pawns affect piece activity.", allowedModes: ["plain_hint", "plain_wrong_move"], requiredConcreteObjects: ["pawn", "center", "piece activity"], claimTypes: ["plan_principle"], revealRisk: "low", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:40:  e({ utteranceId: "ks_p1", utteranceFamily: "ks", conceptId: "king_safety", text: "Before the center opens, the king’s safety matters more than grabbing space.", allowedModes: ["freeplay_principle", "supported_continuation"], requiredConcreteObjects: ["king safety", "center"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:41:  e({ utteranceId: "dev_p1", utteranceFamily: "dev", conceptId: "development", text: "Improve the piece that has not joined the game yet.", allowedModes: ["freeplay_principle", "supported_continuation"], requiredConcreteObjects: ["development", "least active piece"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:42:  e({ utteranceId: "ofr_p1", utteranceFamily: "open_file", conceptId: "open_file_rook", text: "A rook becomes more useful when it supports an open or central file.", allowedModes: ["freeplay_principle", "supported_continuation"], requiredConcreteObjects: ["rook", "open file", "center"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:55:export function normalizeConceptId(conceptId?: string): string {
lib/blundr/coach/coachCopyLibrary.ts:56:  if (!conceptId) return "center_tension";
lib/blundr/coach/coachCopyLibrary.ts:57:  const key = conceptId.toLowerCase();
lib/blundr/coach/coachCopyLibrary.ts:61:export function getCoachCopyEntries(conceptId: string, mode: CoachMode): CoachCopyEntry[] {
lib/blundr/coach/coachCopyLibrary.ts:62:  const normalized = normalizeConceptId(conceptId);
lib/blundr/coach/coachCopyLibrary.ts:63:  const exact = COACH_COPY_LIBRARY.filter((entry) => entry.conceptId === normalized && entry.allowedModes.includes(mode));
lib/blundr/coach/coachCopyLibrary.ts:65:  const fallbackByMode = COACH_COPY_LIBRARY.filter((entry) => entry.conceptId === "center_tension" && entry.allowedModes.includes(mode));
lib/blundr/coach/coachDecisionEngine.ts:79:  const concept = normalizeConceptId(context.conceptId);
lib/blundr/coach/coachDecisionEngine.ts:144:    conceptId: context.conceptId,
lib/blundr/coach/coachDecisionEngine.ts:192:      context.conceptId === "develop_with_pressure"
lib/blundr/coach/coachDecisionEngine.ts:194:        : context.conceptId === "castle_for_safety"
lib/blundr/coach/coachDecisionEngine.ts:196:          : context.conceptId === "prepare_center_break"
lib/blundr/coach/coachDecisionEngine.ts:198:            : context.conceptId === "rook_to_center"
lib/blundr/coach/coachDecisionEngine.ts:216:      concept: context.conceptId,
lib/blundr/coach/coachTypes.ts:61:  conceptId?: string;
lib/blundr/coach/coachTypes.ts:114:  conceptId: string;
lib/blundr/coach/coachTypes.ts:128:  conceptId: string;
lib/blundr/coach/coachTypes.ts:149:    conceptId?: string;
lib/blundr/coach/coachTypes.ts:156:    conceptId?: string;
lib/blundr/coach/coachUtteranceMemory.ts:43:          conceptId: String(candidate.conceptId ?? ""),
lib/blundr/coach/intentFirstCoachEngine.ts:33:  conceptId?: string;
lib/blundr/coach/intentFirstCoachEngine.ts:80:    conceptId: input.conceptId ?? packet.visualRecipeFacts?.conceptId ?? packet.trainingFacts?.conceptId,
lib/blundr/coach/intentFirstCoachEngine.ts:90:    conceptId: input.conceptId ?? packet.visualRecipeFacts?.conceptId ?? packet.trainingFacts?.conceptId,
lib/blundr/coachBrain/__tests__/portionAndThemePolicy.test.ts:21:    trainingContext: { conceptId: "castle_for_safety" },
lib/blundr/coachBrain/boardClaimValidator.ts:30:  if (packet.trainingFacts?.conceptId === "prepare_center_break") return true;
lib/blundr/coachBrain/boardClaimValidator.ts:31:  if (packet.visualRecipeFacts?.conceptId === "prepare_center_break") return true;
lib/blundr/coachBrain/boardClaimValidator.ts:62:  if (packet.visualRecipeFacts?.conceptId === "castle_for_safety" || packet.trainingFacts?.conceptId === "castle_for_safety") return true;
lib/blundr/coachBrain/boardClaimValidator.ts:71:  const concept = packet.visualRecipeFacts?.conceptId ?? packet.trainingFacts?.conceptId;
lib/blundr/coachBrain/coachEvidenceBuilder.ts:193:        conceptId: (input.visualRecipe as any).conceptId,
lib/blundr/coachBrain/coachEvidenceBuilder.ts:205:        conceptId: (input.trainingContext as any).cue?.conceptId ?? (input.trainingContext as any).conceptId,
lib/blundr/coachBrain/coachEvidenceTypes.ts:83:  conceptId?: string;
lib/blundr/coachBrain/coachEvidenceTypes.ts:93:  conceptId?: string;
lib/blundr/coachCompiler/types.ts:1:export interface TeachingConcept {
lib/blundr/coachCompiler/types.ts:59:  primaryConcept: TeachingConcept | null;
lib/blundr/coachCompiler/types.ts:60:  secondaryConcepts: TeachingConcept[];
lib/blundr/coachQuality/coachBenchmarkFixtures.ts:7:function inBookBase(id: string, title: string, conceptId: string, patternId: string, moveUci?: string, moveSan?: string): CoachBenchmarkFixture {
lib/blundr/coachQuality/coachBenchmarkFixtures.ts:28:      conceptId,
lib/blundr/coachQuality/coachBenchmarkFixtures.ts:357:      connectedConcepts: [{ conceptId: "prepare_center_break", strength: 0.9, reason: "d4 support" }],
lib/blundr/coachQuality/coachBenchmarkFixtures.ts:423:      conceptId: "development",
lib/blundr/coachQuality/coachBenchmarkRunner.ts:34:      conceptId: fixture.visualRecipeFixture?.conceptId,
lib/blundr/coachQuality/coachBenchmarkRunner.ts:43:          conceptId: fixture.visualRecipeFixture.conceptId,
lib/blundr/coachQuality/coachBenchmarkTypes.ts:31:    conceptId: string;
lib/blundr/debug/trainerDebugSnapshot.ts:522:      selectedConceptId: input.selectedConceptId ?? input.visualRecipe?.conceptId ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:553:      visualRecipeConceptId: input.visualRecipe?.conceptId ?? null,
lib/blundr/explanation/__tests__/proceduralExplanationEngine.test.ts:12:  const plans = recognizeStrategicPlans({ fen, features, openingId: "italian", conceptId: "develop_with_pressure", moveUci: "f1c4", moveSan: "Bc4" });
lib/blundr/explanation/__tests__/proceduralExplanationEngine.test.ts:13:  const selected = rankTeachingOpportunities(mapFeaturesToOpportunities({ features, plans, expectedMoveUci: "f1c4", expectedMoveSan: "Bc4", trainerView: "assisted", visualRecipeId: "r", conceptId: "develop_with_pressure" }))!;
lib/blundr/explanation/coachTemplateLibrary.ts:57:        conceptIds: [],
lib/blundr/explanation/explanationTypes.ts:56:  conceptIds: string[];
lib/blundr/explanation/templateVariableResolver.ts:34:    repertoireConcept: input.opportunity.conceptId,
lib/blundr/features/advancedFeatureTypes.ts:18:  conceptId?: string;
lib/blundr/golden/__tests__/featureMappingGolden.test.ts:10:  const plans = recognizeStrategicPlans({ fen, features, openingId: "italian", conceptId: "develop_with_pressure", moveUci: "f1c4", moveSan: "Bc4" });
lib/blundr/golden/__tests__/featureMappingGolden.test.ts:11:  const opportunities = mapFeaturesToOpportunities({ features, plans, expectedMoveUci: "f1c4", expectedMoveSan: "Bc4", trainerView: "assisted", visualRecipeId: "r", conceptId: "develop_with_pressure" });
lib/blundr/golden/__tests__/italianBc4Golden.test.ts:10:  const coach = decideIntentFirstCoach({ packet, interaction: "none", conceptId: g.conceptId, openingId: "italian", visualRecipeId: "r" });
lib/blundr/golden/__tests__/italianC3Golden.test.ts:10:  const coach = decideIntentFirstCoach({ packet, interaction: "none", conceptId: g.conceptId, openingId: "italian", visualRecipeId: "r" });
lib/blundr/golden/__tests__/italianCastlingGolden.test.ts:11:  const recipe = compileVisualRecipe({ trainingContext: { mode: "move_teaching", moveTrust: "book_supported", contextTrust: "safe_context", nextPlay: { allowed: true }, cue: { conceptId: g.conceptId, metadata: { moveUci: g.moveUci, moveSan: g.moveSan } } } as any, fen: g.fen, viewMode: "assisted", revealState: "hidden", expectedMoveUci: g.moveUci, expectedMoveSan: g.moveSan, frameId: 1 });
lib/blundr/golden/__tests__/italianCastlingGolden.test.ts:18:  const coach = decideIntentFirstCoach({ packet, interaction: "none", conceptId: g.conceptId, openingId: "italian", visualRecipeId: recipe.visualRecipeId });
lib/blundr/golden/__tests__/italianRe1Golden.test.ts:10:  const coach = decideIntentFirstCoach({ packet, interaction: "none", conceptId: g.conceptId, openingId: "italian", visualRecipeId: "r" });
lib/blundr/golden/__tests__/plainViewGolden.test.ts:9:  const coach = decideIntentFirstCoach({ packet, interaction: "none", conceptId: g.conceptId, openingId: "italian" });
lib/blundr/golden/goldenPositions.ts:6:    conceptId: "castle_for_safety",
lib/blundr/golden/goldenPositions.ts:12:    conceptId: "develop_with_pressure",
lib/blundr/golden/goldenPositions.ts:18:    conceptId: "prepare_center_break",
lib/blundr/golden/goldenPositions.ts:24:    conceptId: "rook_to_center",
lib/blundr/liveCoach/__tests__/patternTransferMatcher.test.ts:13:  assert.equal(result.connectedConcepts.some((c) => c.conceptId === "prepare_center_break"), true);
lib/blundr/liveCoach/candidateMoveProfiler.ts:12:  const patternConcepts = new Set((evidence.patternSignals?.connectedConcepts ?? []).map((c) => c.conceptId));
lib/blundr/liveCoach/liveCoachTypes.ts:83:  connectedConcepts: Array<{ conceptId: string; strength: number; reason: string }>;
lib/blundr/liveCoach/patternTransferMatcher.ts:13:    connectedConcepts.push({ conceptId: "prepare_center_break", strength: 0.85, reason: "d4 break remains relevant" });
lib/blundr/liveCoach/patternTransferMatcher.ts:16:    connectedConcepts.push({ conceptId: "castle_for_safety", strength: 0.78, reason: "king safety still unresolved" });
lib/blundr/liveCoach/patternTransferMatcher.ts:19:    connectedConcepts.push({ conceptId: "open_file_rook", strength: 0.72, reason: "e-file supports rook activity" });
lib/blundr/liveCoach/patternTransferMatcher.ts:22:    connectedConcepts.push({ conceptId: "center_tension", strength: 0.8, reason: "central tension still decides activity" });
lib/blundr/opportunity/__tests__/featureOpportunityMapper.test.ts:10:  const plans = recognizeStrategicPlans({ fen, features, openingId: "italian", conceptId: "develop_with_pressure", moveUci: "f1c4", moveSan: "Bc4" });
lib/blundr/opportunity/__tests__/featureOpportunityMapper.test.ts:11:  const opportunities = mapFeaturesToOpportunities({ features, plans, expectedMoveUci: "f1c4", expectedMoveSan: "Bc4", visualRecipeId: "recipe", conceptId: "develop_with_pressure", trainerView: "assisted" });
lib/blundr/opportunity/__tests__/mappingPipeline.test.ts:14:  const plans = recognizeStrategicPlans({ fen, features, openingId: "italian", conceptId: "develop_with_pressure", moveUci: "f1c4", moveSan: "Bc4" });
lib/blundr/opportunity/__tests__/mappingPipeline.test.ts:15:  const opportunity = rankTeachingOpportunities(mapFeaturesToOpportunities({ features, plans, expectedMoveUci: "f1c4", expectedMoveSan: "Bc4", trainerView: "assisted", visualRecipeId: "r", conceptId: "develop_with_pressure" }))!;
lib/blundr/opportunity/featureOpportunityMapper.ts:11:  conceptId?: string;
lib/blundr/opportunity/featureOpportunityMapper.ts:16:  const expectedPlan = input.plans.plans.find((plan) => plan.canMention && (plan.moveUci === input.expectedMoveUci || plan.conceptId === input.conceptId)) ?? input.plans.plans.find((plan) => plan.canMention);
lib/blundr/opportunity/featureOpportunityMapper.ts:24:      conceptId: input.conceptId,
lib/blundr/opportunity/featureOpportunityMapper.ts:45:      conceptId: input.conceptId,
lib/blundr/opportunity/featureOpportunityMapper.ts:67:      conceptId: plan.conceptId,
lib/blundr/opportunity/featureOpportunityMapper.ts:76:      repertoireRelevance: plan.conceptId ? 80 : 50,
lib/blundr/opportunity/featureOpportunityMapper.ts:104:    conceptId: input.conceptId,
lib/blundr/opportunity/opportunityTypes.ts:31:  conceptId?: string;
lib/blundr/plans/__tests__/openingPlanRegistry.test.ts:7:  assert.equal(findRegistryEntries({ openingId: "italian", conceptId: "castle_for_safety", moveSan: "O-O" })[0]?.planType, "castle_and_connect_rooks");
lib/blundr/plans/__tests__/openingPlanRegistry.test.ts:8:  assert.equal(findRegistryEntries({ openingId: "italian", conceptId: "prepare_center_break", moveUci: "c2c3" })[0]?.planType, "central_break_preparation");
lib/blundr/plans/__tests__/planMatcherRules.test.ts:9:  const entry = OPENING_PLAN_REGISTRY.find((candidate) => candidate.conceptId === "develop_with_pressure")!;
lib/blundr/plans/__tests__/planRecognitionEngine.test.ts:9:    conceptId: "develop_with_pressure",
lib/blundr/plans/__tests__/planRecognitionEngine.test.ts:17:    conceptId: "prepare_center_break",
lib/blundr/plans/openingPlanRegistry.ts:8:    conceptId: "develop_with_pressure",
lib/blundr/plans/openingPlanRegistry.ts:17:    conceptId: "castle_for_safety",
lib/blundr/plans/openingPlanRegistry.ts:26:    conceptId: "prepare_center_break",
lib/blundr/plans/openingPlanRegistry.ts:35:    conceptId: "rook_to_center",
lib/blundr/plans/openingPlanRegistry.ts:44:    conceptId: "center_tension",
lib/blundr/plans/openingPlanRegistry.ts:53:export function findRegistryEntries(input: { openingId?: string; conceptId?: string; moveUci?: string; moveSan?: string }): OpeningPlanRegistryEntry[] {
lib/blundr/plans/openingPlanRegistry.ts:56:    if (input.conceptId && entry.conceptId !== input.conceptId) return false;
lib/blundr/plans/planMatcherRules.ts:25:    id: `${entry.conceptId}:${entry.planType}:${move?.uci ?? move?.san ?? "context"}`,
lib/blundr/plans/planMatcherRules.ts:29:    conceptId: entry.conceptId,
lib/blundr/plans/planRecognitionEngine.ts:12:  conceptId?: string;
lib/blundr/plans/planRecognitionEngine.ts:20:  for (const entry of findRegistryEntries({ openingId: input.openingId, conceptId: input.conceptId, moveUci: input.moveUci, moveSan: input.moveSan })) {
lib/blundr/plans/planTypes.ts:34:  conceptId?: string;
lib/blundr/plans/planTypes.ts:52:  conceptId: string;
lib/blundr/presentation/buildVisibleTeachingSurface.ts:186:  selectedTeachingConcept?: string | null;
lib/blundr/presentation/buildVisibleTeachingSurface.ts:216:    selectedTeachingConcept = null,
lib/blundr/presentation/buildVisibleTeachingSurface.ts:317:    selectedTeachingConcept,
lib/blundr/teaching/__tests__/trainingContextEngine.test.ts:28:  assert.equal(castle.cue.conceptId, "castle_for_safety");
lib/blundr/teaching/__tests__/trainingContextEngine.test.ts:38:  assert.equal(castle.selectedStory?.conceptId === "strong_alternative", false);
lib/blundr/teaching/__tests__/trainingContextEngine.test.ts:59:  assert.equal(bc4.selectedStory?.conceptId === "strong_alternative", false);
lib/blundr/teaching/__tests__/trainingContextEngine.test.ts:85:  assert.equal(c3.cue.conceptId === "center_tension" || c3.cue.conceptId === "pawn_break", true);
lib/blundr/teaching/conceptDetectors.ts:2:import type { TeachingConceptId } from "./teachingCueTypes";
lib/blundr/teaching/conceptDetectors.ts:5:  conceptId: TeachingConceptId;
lib/blundr/teaching/conceptDetectors.ts:39:        conceptId: "win_loose_piece",
lib/blundr/teaching/conceptDetectors.ts:54:        conceptId: "attack_loose_piece",
lib/blundr/teaching/conceptDetectors.ts:70:        conceptId: "hanging_piece_warning",
lib/blundr/teaching/conceptDetectors.ts:85:        conceptId: "king_safety_first",
lib/blundr/teaching/conceptDetectors.ts:100:        conceptId: "center_tension",
lib/blundr/teaching/conceptDetectors.ts:115:        conceptId: "center_control",
lib/blundr/teaching/conceptDetectors.ts:130:        conceptId: "development_lag",
lib/blundr/teaching/conceptDetectors.ts:145:        conceptId: "open_file_context",
lib/blundr/teaching/conceptDetectors.ts:160:        conceptId: "king_activity",
lib/blundr/teaching/conceptDetectors.ts:175:        conceptId: "passed_pawn",
lib/blundr/teaching/conceptDetectors.ts:190:        conceptId: "context_only",
lib/blundr/teaching/conceptTemplates.ts:1:import type { TeachingConceptId, TeachingCueMode } from "./teachingCueTypes";
lib/blundr/teaching/conceptTemplates.ts:37:export function renderConceptTemplate(conceptId: TeachingConceptId, variables: ConceptTemplateVariables = {}, mode: TeachingCueMode = "move_teaching"): TemplateOutput {
lib/blundr/teaching/conceptTemplates.ts:43:  switch (conceptId) {
lib/blundr/teaching/conceptTemplates.ts:129:export function renderTeachingTemplate(conceptId: TeachingConceptId, context: Record<string, unknown>): TemplateOutput {
lib/blundr/teaching/conceptTemplates.ts:130:  return renderConceptTemplate(conceptId, {
lib/blundr/teaching/moveSemanticAnalyzer.ts:178:      conceptId: "castle_for_safety",
lib/blundr/teaching/moveSemanticAnalyzer.ts:208:      conceptId: "wins_loose_piece",
lib/blundr/teaching/moveSemanticAnalyzer.ts:227:      conceptId: target.loose || target.hanging ? "attacks_loose_piece" : "pressure_target",
lib/blundr/teaching/moveSemanticAnalyzer.ts:247:      conceptId: "develops_with_pressure",
lib/blundr/teaching/moveSemanticAnalyzer.ts:266:      conceptId: "develop_and_control",
lib/blundr/teaching/moveSemanticAnalyzer.ts:284:      conceptId: "passive_development",
lib/blundr/teaching/moveSemanticAnalyzer.ts:302:      conceptId: "improves_piece_activity",
lib/blundr/teaching/moveSemanticAnalyzer.ts:319:      conceptId: "center_tension",
lib/blundr/teaching/moveSemanticAnalyzer.ts:338:      conceptId: piece.type === "r" ? "rook_activity" : "open_file_context",
lib/blundr/teaching/storyRanker.ts:10:function inferKind(conceptId: string): TeachingStoryKind {
lib/blundr/teaching/storyRanker.ts:11:  if (conceptId === "win_loose_piece" || conceptId === "immediate_tactic") return "immediate_tactic";
lib/blundr/teaching/storyRanker.ts:12:  if (conceptId === "attack_loose_piece" || conceptId === "pressure_target") return "tactical_pressure";
lib/blundr/teaching/storyRanker.ts:13:  if (conceptId === "king_safety_first") return "king_safety";
lib/blundr/teaching/storyRanker.ts:14:  if (conceptId === "center_tension" || conceptId === "center_control") return "center_decision";
lib/blundr/teaching/storyRanker.ts:15:  if (conceptId === "development_lag") return "development";
lib/blundr/teaching/storyRanker.ts:16:  if (conceptId === "improve_worst_piece") return "improve_piece";
lib/blundr/teaching/storyRanker.ts:17:  if (conceptId === "open_file_context" || conceptId === "half_open_file") return "open_file";
lib/blundr/teaching/storyRanker.ts:18:  if (conceptId === "weak_square" || conceptId === "outpost") return "weak_square";
lib/blundr/teaching/storyRanker.ts:19:  if (conceptId === "pawn_break") return "pawn_break";
lib/blundr/teaching/storyRanker.ts:20:  if (conceptId === "coordinate_pieces" || conceptId === "piece_activity") return "coordination";
lib/blundr/teaching/storyRanker.ts:21:  if (conceptId === "prophylaxis") return "prophylaxis";
lib/blundr/teaching/storyRanker.ts:22:  if (conceptId === "book_pattern") return "book_pattern";
lib/blundr/teaching/storyRanker.ts:23:  if (conceptId === "strong_alternative") return "strong_alternative";
lib/blundr/teaching/storyRanker.ts:24:  if (conceptId === "context_only") return "move_unavailable_context";
lib/blundr/teaching/storyRanker.ts:37:  const materialImpact = candidate.conceptId === "win_loose_piece" ? 0.9 : candidate.conceptId === "attack_loose_piece" ? 0.62 : 0.35;
lib/blundr/teaching/storyRanker.ts:38:  const kingSafetyImpact = candidate.conceptId === "king_safety_first" ? 0.9 : evidence.safetyWarnings.length ? 0.68 : 0.4;
lib/blundr/teaching/storyRanker.ts:87:    const rendered = renderTeachingTemplate(concept.conceptId, { moveSan, targetSquare: concept.relevantSquares[0] });
lib/blundr/teaching/storyRanker.ts:89:      id: `story-${concept.conceptId}-${idx}`,
lib/blundr/teaching/storyRanker.ts:90:      kind: inferKind(concept.conceptId),
lib/blundr/teaching/storyRanker.ts:91:      conceptId: concept.conceptId,
lib/blundr/teaching/storyRanker.ts:140:    if (candidate.score.confidence < 0.42 && candidate.conceptId !== "context_only") rejectionReasons.push("low_confidence");
lib/blundr/teaching/storyRanker.ts:163:        conceptId: candidate.conceptId,
lib/blundr/teaching/storyTypes.ts:1:import type { TeachingConceptId, VisualArrow, VisualLine, VisualSquareCue } from "./teachingCueTypes";
lib/blundr/teaching/storyTypes.ts:47:  conceptId: TeachingConceptId;
lib/blundr/teaching/storyTypes.ts:73:  scoreTable: Array<{ id: string; kind: TeachingStoryKind; conceptId: TeachingConceptId; total: number; reasons: TeachingStoryRejectionReason[] }>;
lib/blundr/teaching/teachingCueCompiler.ts:14:    conceptId: story?.conceptId ?? "context_only",
lib/blundr/teaching/teachingCueCompiler.ts:61:  const template = renderTeachingTemplate(input.selectedStory.conceptId, {
lib/blundr/teaching/teachingCueCompiler.ts:68:    conceptId: input.selectedStory.conceptId,
lib/blundr/teaching/teachingCueCompiler.ts:71:    themesShown: [input.selectedStory.kind, input.selectedStory.conceptId],
lib/blundr/teaching/teachingCueCompiler.ts:100:  const template = renderTeachingTemplate(input.selectedStory.conceptId, {
lib/blundr/teaching/teachingCueCompiler.ts:107:    conceptId: input.selectedStory.conceptId,
lib/blundr/teaching/teachingCueCompiler.ts:110:    themesShown: [input.selectedStory.kind, input.selectedStory.conceptId],
lib/blundr/teaching/teachingCueTypes.ts:1:export type LegacyTeachingConceptId =
lib/blundr/teaching/teachingCueTypes.ts:40:export type TeachingConceptId =
lib/blundr/teaching/teachingCueTypes.ts:75:  | LegacyTeachingConceptId;
lib/blundr/teaching/teachingCueTypes.ts:133:  conceptId: TeachingConceptId;
lib/blundr/teaching/teachingCueTypes.ts:149:  conceptId: TeachingConceptId;
lib/blundr/teaching/teachingCueTypes.ts:253:  conceptId: TeachingConceptId;
lib/blundr/teaching/trainingContextEngine.ts:7:import { TEACHING_CUE_COMPILER_VERSION, type TeachingConceptId, type TeachingCue, type VisualLine, type VisualSquareCue } from "./teachingCueTypes";
lib/blundr/teaching/trainingContextEngine.ts:210:  const conceptId = effect.conceptId;
lib/blundr/teaching/trainingContextEngine.ts:211:  const template = renderConceptTemplate(conceptId, variablesFromEffect(effect, analysis), trusted ? "move_teaching" : "context_only");
lib/blundr/teaching/trainingContextEngine.ts:218:    conceptId,
lib/blundr/teaching/trainingContextEngine.ts:260:  const conceptId: TeachingConceptId = isActiveSquare || !allowStrongAlternative ? "active_square_comparison" : "strong_alternative";
lib/blundr/teaching/trainingContextEngine.ts:261:  const template = renderConceptTemplate(conceptId, {
lib/blundr/teaching/trainingContextEngine.ts:269:    conceptId,
lib/blundr/teaching/trainingContextEngine.ts:322:      conceptId: "hanging_piece_warning",
lib/blundr/teaching/trainingContextEngine.ts:348:      conceptId: "center_tension",
lib/blundr/teaching/trainingContextEngine.ts:375:      conceptId: "king_safety_first",
lib/blundr/teaching/trainingContextEngine.ts:402:      conceptId: openFile.isOpen ? "open_file_context" : "half_open_file",
lib/blundr/teaching/trainingContextEngine.ts:428:      conceptId: weakSquare.isOutpostCandidate ? "outpost" : "weak_square",
lib/blundr/teaching/trainingContextEngine.ts:455:      conceptId: "king_activity",
lib/blundr/teaching/trainingContextEngine.ts:490:      if (options.trustedExpectedMove && (story.kind === "context_safe_contrast" || story.kind === "strong_alternative" || story.conceptId === "strong_alternative")) {
lib/blundr/teaching/trainingContextEngine.ts:617:    conceptId: story?.conceptId ?? "context_only",
lib/blundr/teaching/trainingContextEngine.ts:620:    primaryFocus: story?.conceptId,
lib/blundr/teaching/trainingContextEngine.ts:623:    themesShown: story ? [story.conceptId] : [],
lib/blundr/teaching/trainingContextEngine.ts:816:      conceptId: "book_pattern",
lib/blundr/teaching/trainingContextEngine.ts:904:    conceptId: cue.conceptId,
lib/blundr/teaching/trainingContextTypes.ts:2:import type { TeachingConceptId, TeachingCue, VisualLine, VisualSquareCue } from "./teachingCueTypes";
lib/blundr/teaching/trainingContextTypes.ts:94:  conceptId: TeachingConceptId;
lib/blundr/teaching/trainingContextTypes.ts:210:  conceptId: TeachingConceptId;
lib/blundr/teaching/trustClassifier.ts:41:  const cid = story?.conceptId;
lib/blundr/teaching/visualOverlayRouter.ts:42:    input.cue.conceptId.includes("loose") ? "loose_piece" :
lib/blundr/teaching/visualOverlayRouter.ts:43:    input.cue.conceptId.includes("center") ? "center" :
lib/blundr/teaching/visualOverlayRouter.ts:44:    input.cue.conceptId.includes("king") ? "king_safety" :
lib/blundr/teaching/visualOverlayRouter.ts:45:    input.cue.conceptId.includes("file") || input.cue.conceptId.includes("rook") ? "open_file" :
lib/blundr/teaching/visualOverlayRouter.ts:46:    input.cue.conceptId.includes("weak") || input.cue.conceptId.includes("outpost") ? "weak_square" :
lib/blundr/teaching/visualOverlayRouter.ts:47:    input.cue.conceptId.includes("development") || input.cue.conceptId.includes("piece") || input.cue.conceptId.includes("activity") ? "piece_activity" :
lib/blundr/visualRecipe/__tests__/castlingVisualRecipe.test.ts:7:    trainingContext: { mode: "move_teaching", moveTrust: "book_supported", contextTrust: "safe_context", nextPlay: { allowed: true }, cue: { conceptId: "castle_for_safety", metadata: { moveUci: "e1g1", moveSan: "O-O" } } } as any,
lib/blundr/visualRecipe/__tests__/visualRecipeAdapter.test.ts:18:    conceptId: "castle_for_safety",
lib/blundr/visualRecipe/__tests__/visualRecipeAdapter.test.ts:54:    learningAnchor: { patternId: "pattern:test", conceptId: "castle_for_safety", fen: FEN_START_6, keySquares: ["e1", "g1"], keyPieces: ["king"], reviewPromptKind: "find_move" },
lib/blundr/visualRecipe/__tests__/visualRecipeAdapter.test.ts:160:      cue: { conceptId: "center_tension", metadata: { moveUci: "c2c3", moveSan: "c3", fenBefore: FEN_START_6, compilerVersion: "2.7.35d", createdAt: "now" } },
lib/blundr/visualRecipe/__tests__/visualRecipeAdapter.test.ts:275:    conceptId: "develop_and_control",
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:24:      conceptId: "center_tension",
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:122:    trainingContext: mockContext({ mode: "assisted_context", moveTrust: "untrusted", contextTrust: "safe_context", cue: { conceptId: "center_tension", metadata: { moveUci: "c2c3", moveSan: "c3", fenBefore: c3Fen, compilerVersion: "2.7.35d", createdAt: "now" } } }),
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:142:    trainingContext: mockContext({ moveTrust: "reveal_only_unverified", mode: "assisted_context", contextTrust: "safe_context", cue: { conceptId: "center_tension", metadata: { moveUci: "c2c3", moveSan: "c3", fenBefore: c3Fen, compilerVersion: "2.7.35d", createdAt: "now" } } }),
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:153:    trainingContext: mockContext({ moveTrust: "reveal_only_unverified", mode: "move_teaching", contextTrust: "safe_context", nextPlay: { allowed: true }, cue: { conceptId: "center_tension", metadata: { moveUci: "c2c3", moveSan: "c3", fenBefore: c3Fen, compilerVersion: "2.7.35d", createdAt: "now" } } }),
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:184:      cue: { conceptId: "develops_with_pressure", metadata: { moveUci: "f1c4", moveSan: "Bc4", fenBefore: bc4Fen, compilerVersion: "2.7.35d", createdAt: "now" } },
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:215:  assert.equal(Boolean(bc4Recipe.learningAnchor.conceptId), true);
lib/blundr/visualRecipe/__tests__/visualRecipePolicy.test.ts:158:  assert.equal(Boolean(assistedRecipe.learningAnchor.conceptId), true);
lib/blundr/visualRecipe/visualRecipeCompiler.ts:63:  conceptId?: string;
lib/blundr/visualRecipe/visualRecipeCompiler.ts:71:    sourceConceptId: input.conceptId,
lib/blundr/visualRecipe/visualRecipeCompiler.ts:96:  conceptId?: string;
lib/blundr/visualRecipe/visualRecipeCompiler.ts:105:    conceptId: input.conceptId,
lib/blundr/visualRecipe/visualRecipeCompiler.ts:113:    conceptId: input.conceptId,
lib/blundr/visualRecipe/visualRecipeCompiler.ts:121:    conceptId: input.conceptId,
lib/blundr/visualRecipe/visualRecipeCompiler.ts:131:    conceptId: input.conceptId ?? "context_only",
lib/blundr/visualRecipe/visualRecipeCompiler.ts:154:      conceptId: input.conceptId ?? "context_only",
lib/blundr/visualRecipe/visualRecipeCompiler.ts:246:function conceptMatches(conceptId: string | undefined, options: string[]): boolean {
lib/blundr/visualRecipe/visualRecipeCompiler.ts:247:  const value = (conceptId ?? "").toLowerCase();
lib/blundr/visualRecipe/visualRecipeCompiler.ts:253:  conceptId: string;
lib/blundr/visualRecipe/visualRecipeCompiler.ts:294:  const concept = input.conceptId;
lib/blundr/visualRecipe/visualRecipeCompiler.ts:357:  const conceptId = input.trainingContext?.cue?.conceptId ?? "context_only";
lib/blundr/visualRecipe/visualRecipeCompiler.ts:366:      conceptId,
lib/blundr/visualRecipe/visualRecipeCompiler.ts:387:      conceptId,
lib/blundr/visualRecipe/visualRecipeCompiler.ts:398:    conceptId,
lib/blundr/visualRecipe/visualRecipeCompiler.ts:406:    conceptId,
lib/blundr/visualRecipe/visualRecipeCompiler.ts:414:    conceptId,
lib/blundr/visualRecipe/visualRecipeCompiler.ts:508:    sourceConceptId: conceptId,
lib/blundr/visualRecipe/visualRecipeCompiler.ts:535:    conceptId,
lib/blundr/visualRecipe/visualRecipeCompiler.ts:548:      conceptId,
lib/blundr/visualRecipe/visualRecipeCompiler.ts:555:      keyPieces: conceptMatches(conceptId, ["castle", "king"]) ? ["king"] : [],
lib/blundr/visualRecipe/visualRecipeCompiler.ts:558:      explanationKey: conceptId,
lib/blundr/visualRecipe/visualRecipeIds.ts:22:  conceptId?: string;
lib/blundr/visualRecipe/visualRecipeIds.ts:27:  const conceptKey = cleanToken(input.conceptId ?? "context_only");
lib/blundr/visualRecipe/visualRecipeIds.ts:38:  conceptId?: string;
lib/blundr/visualRecipe/visualRecipeIds.ts:45:  const conceptKey = cleanToken(input.conceptId ?? "context_only");
lib/blundr/visualRecipe/visualRecipeTypes.ts:2:import type { TeachingConceptId } from "../teaching/teachingCueTypes";
lib/blundr/visualRecipe/visualRecipeTypes.ts:183:  conceptId: string;
lib/blundr/visualRecipe/visualRecipeTypes.ts:227:  conceptId: string;
lib/blundr/visualRecipe/visualRecipeTypes.ts:291:export function asConceptId(value?: string): TeachingConceptId | undefined {
lib/blundr/visualRecipe/visualRecipeTypes.ts:292:  return value as TeachingConceptId | undefined;
tests/coach/antiHallucination.test.ts:3:import { activateTeachingConcepts } from "../../lib/blundr/concepts/dynamicConceptActivator";
tests/coach/antiHallucination.test.ts:64:  const concepts = activateTeachingConcepts({ graph, mode: "assisted", maxConcepts: 40 });
tests/coach/antiHallucination.test.ts:65:  assert.equal(concepts.activated.some((c) => c.conceptId === "sacrifice_requires_proof"), false);
tests/coach/antiHallucination.test.ts:66:  assert.equal(concepts.activated.some((c) => c.conceptId === "mate_threat"), false);
tests/coach/evidenceGraph.test.ts:4:import { activateTeachingConcepts } from "../../lib/blundr/concepts/dynamicConceptActivator";
tests/coach/evidenceGraph.test.ts:147:  const conceptActivation = activateTeachingConcepts({ graph: bc4, mode: "assisted", maxConcepts: 10 });
tests/coach/plainLeak.test.ts:3:import { activateTeachingConcepts } from "../../lib/blundr/concepts/dynamicConceptActivator";
tests/coach/plainLeak.test.ts:51:  const plainActivated = activateTeachingConcepts({ graph, mode: "plain", maxConcepts: 40 });
tests/coach/plainLeak.test.ts:52:  assert.equal(plainActivated.activated.some((entry) => entry.conceptId === "show_more_reveal"), false);

$ git grep -n "EvidenceGraph\|CoachEvidenceClaim\|EvidenceClaimStrength\|buildEvidenceGraph" lib/blundr tests/coach || true
lib/blundr/brain/buildEvidenceGraph.ts:9:import type { CoachEvidenceClaim, EvidenceGraph } from "./types";
lib/blundr/brain/buildEvidenceGraph.ts:17:function normalizeClaims(claims: CoachEvidenceClaim[]): CoachEvidenceClaim[] {
lib/blundr/brain/buildEvidenceGraph.ts:30:  boardTruthTargetLegal: EvidenceGraph["boardTruth"]["targetLegal"];
lib/blundr/brain/buildEvidenceGraph.ts:31:  claims: CoachEvidenceClaim[];
lib/blundr/brain/buildEvidenceGraph.ts:32:}): EvidenceGraph["contradictions"] {
lib/blundr/brain/buildEvidenceGraph.ts:33:  const out: EvidenceGraph["contradictions"] = [];
lib/blundr/brain/buildEvidenceGraph.ts:63:export function buildEvidenceGraph(input: {
lib/blundr/brain/buildEvidenceGraph.ts:75:}): EvidenceGraph {
lib/blundr/brain/index.ts:7:export { buildEvidenceGraph } from "./buildEvidenceGraph";
lib/blundr/brain/providers/moveSemanticsProvider.ts:2:import type { BoardTruth, CoachEvidenceClaim, OpeningContext } from "../types";
lib/blundr/brain/providers/moveSemanticsProvider.ts:18:  type: CoachEvidenceClaim["type"],
lib/blundr/brain/providers/moveSemanticsProvider.ts:19:  strength: CoachEvidenceClaim["strength"],
lib/blundr/brain/providers/moveSemanticsProvider.ts:22:): CoachEvidenceClaim {
lib/blundr/brain/providers/moveSemanticsProvider.ts:59:}): CoachEvidenceClaim[] {
lib/blundr/brain/providers/moveSemanticsProvider.ts:65:  const claims: CoachEvidenceClaim[] = [];
lib/blundr/brain/providers/strategicFeatureProvider.ts:2:import type { BoardTruth, CoachEvidenceClaim, OpeningContext } from "../types";
lib/blundr/brain/providers/strategicFeatureProvider.ts:7:  type: CoachEvidenceClaim["type"],
lib/blundr/brain/providers/strategicFeatureProvider.ts:8:  strength: CoachEvidenceClaim["strength"],
lib/blundr/brain/providers/strategicFeatureProvider.ts:11:): CoachEvidenceClaim {
lib/blundr/brain/providers/strategicFeatureProvider.ts:38:}): CoachEvidenceClaim[] {
lib/blundr/brain/providers/strategicFeatureProvider.ts:52:  const claims: CoachEvidenceClaim[] = [];
lib/blundr/brain/providers/tacticalMotifProvider.ts:2:import type { BoardTruth, CoachEvidenceClaim } from "../types";
lib/blundr/brain/providers/tacticalMotifProvider.ts:7:  strength: CoachEvidenceClaim["strength"],
lib/blundr/brain/providers/tacticalMotifProvider.ts:10:): CoachEvidenceClaim {
lib/blundr/brain/providers/tacticalMotifProvider.ts:35:}): CoachEvidenceClaim[] {
lib/blundr/brain/providers/tacticalMotifProvider.ts:47:  const claims: CoachEvidenceClaim[] = [];
lib/blundr/brain/providers/visualEvidenceProvider.ts:2:import type { BoardTruth, CoachEvidenceClaim } from "../types";
lib/blundr/brain/providers/visualEvidenceProvider.ts:7:  strength: CoachEvidenceClaim["strength"],
lib/blundr/brain/providers/visualEvidenceProvider.ts:10:): CoachEvidenceClaim {
lib/blundr/brain/providers/visualEvidenceProvider.ts:35:  claims: CoachEvidenceClaim[];
lib/blundr/brain/providers/visualEvidenceProvider.ts:36:}): CoachEvidenceClaim[] {
lib/blundr/brain/providers/visualEvidenceProvider.ts:43:  const visualClaims: CoachEvidenceClaim[] = [
lib/blundr/brain/types.ts:8:export type EvidenceClaimStrength =
lib/blundr/brain/types.ts:34:export type CoachEvidenceClaimType =
lib/blundr/brain/types.ts:53:export interface CoachEvidenceClaim {
lib/blundr/brain/types.ts:56:  type: CoachEvidenceClaimType;
lib/blundr/brain/types.ts:57:  strength: EvidenceClaimStrength;
lib/blundr/brain/types.ts:67:export interface EvidenceGraph {
lib/blundr/brain/types.ts:72:  claims: CoachEvidenceClaim[];
lib/blundr/brain/types.ts:73:  deterministicClaims: CoachEvidenceClaim[];
lib/blundr/brain/types.ts:74:  tacticClaims: CoachEvidenceClaim[];
lib/blundr/brain/types.ts:75:  strategicClaims: CoachEvidenceClaim[];
lib/blundr/brain/types.ts:76:  visualEvidence: CoachEvidenceClaim[];
lib/blundr/brain/types.ts:77:  blockedClaims: CoachEvidenceClaim[];
tests/coach/antiHallucination.test.ts:2:import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
tests/coach/antiHallucination.test.ts:58:  const graph = buildEvidenceGraph({ frame });
tests/coach/evidenceGraph.test.ts:3:import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
tests/coach/evidenceGraph.test.ts:33:export function testEvidenceGraph(): void {
tests/coach/evidenceGraph.test.ts:40:  const bc4 = buildEvidenceGraph({ frame: bc4Frame, openingKey: "italian_game", openingName: "Italian Game" });
tests/coach/evidenceGraph.test.ts:55:  const nf3 = buildEvidenceGraph({ frame: nf3Frame });
tests/coach/evidenceGraph.test.ts:65:  const castle = buildEvidenceGraph({ frame: castleFrame });
tests/coach/evidenceGraph.test.ts:75:  const e4 = buildEvidenceGraph({ frame: e4Frame });
tests/coach/evidenceGraph.test.ts:85:  const d4 = buildEvidenceGraph({ frame: d4Frame });
tests/coach/evidenceGraph.test.ts:94:  const capture = buildEvidenceGraph({ frame: captureFrame });
tests/coach/evidenceGraph.test.ts:103:  const check = buildEvidenceGraph({ frame: checkFrame });
tests/coach/evidenceGraph.test.ts:116:  const branchGraph = buildEvidenceGraph({ frame: branchComplete });
tests/coach/evidenceGraph.test.ts:129:  const opponentGraph = buildEvidenceGraph({ frame: opponent });
tests/coach/evidenceGraph.test.ts:138:  const illegal = buildEvidenceGraph({ frame: illegalFrame });
tests/coach/evidenceGraph.test.ts:156:testEvidenceGraph();
tests/coach/goldenPositions.test.ts:4:import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
tests/coach/goldenPositions.test.ts:121:      const graph = buildEvidenceGraph({ frame: guidedFrame });
tests/coach/plainLeak.test.ts:2:import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
tests/coach/plainLeak.test.ts:50:  const graph = buildEvidenceGraph({ frame, openingKey: "italian_game", openingName: "Italian Game" });
tests/coach/providerFailure.test.ts:7:import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
tests/coach/providerFailure.test.ts:55:  const nullGraph = buildEvidenceGraph({ frame: nullFrame });

## Step I Validation

$ npm run build

> blundr-v2-7-professional-repair@2.7.3 build
> next build

▲ Next.js 16.2.6 (Turbopack)

  Creating an optimized production build ...
$ npm run build (escalated rerun due sandbox turbopack restriction)

> blundr-v2-7-professional-repair@2.7.3 build
> next build

▲ Next.js 16.2.6 (Turbopack)

  Creating an optimized production build ...
✓ Compiled successfully in 8.5s
  Running TypeScript ...
  Finished TypeScript in 9.4s ...
  Collecting page data using 1 worker ...
  Generating static pages using 1 worker (0/3) ...
✓ Generating static pages using 1 worker (3/3) in 371ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/blundr-visual-model
├ ƒ /api/brain
└ ƒ /api/explorer


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand


$ node --import tsx tests/coach/teachingConceptRegistry.test.ts
teachingConceptRegistry ok

$ node --import tsx tests/coach/dynamicConceptActivator.test.ts

$ node --import tsx tests/coach/evidenceGraph.test.ts
evidenceGraph ok

$ node --import tsx tests/coach/currentInstructionFrame.test.ts
currentInstructionFrame ok

$ node --import tsx tests/coach/typeContracts.test.ts
typeContracts ok

$ node --import tsx tests/coach/goldenPositions.test.ts
goldenPositions ok

$ node --import tsx tests/coach/targetInvariant.test.ts
targetInvariant ok

$ node --import tsx tests/coach/continuationFlow.test.ts
continuationFlow ok

$ node --import tsx tests/coach/plainLeak.test.ts
plainLeak ok

$ node --import tsx tests/coach/showMoreVisualReveal.test.ts
showMoreVisualReveal ok

$ node --import tsx tests/coach/providerFailure.test.ts
providerFailure ok

$ node --import tsx tests/coach/antiHallucination.test.ts
antiHallucination ok

$ node --import tsx tests/coach/browserContract.test.ts
browserContract ok


## Step I Validation Rerun

$ node --import tsx tests/coach/teachingConceptRegistry.test.ts
teachingConceptRegistry ok

$ node --import tsx tests/coach/dynamicConceptActivator.test.ts
dynamicConceptActivator ok

$ node --import tsx tests/coach/evidenceGraph.test.ts
evidenceGraph ok

$ node --import tsx tests/coach/currentInstructionFrame.test.ts
currentInstructionFrame ok

$ node --import tsx tests/coach/typeContracts.test.ts
typeContracts ok

$ node --import tsx tests/coach/goldenPositions.test.ts
goldenPositions ok

$ node --import tsx tests/coach/targetInvariant.test.ts
targetInvariant ok

$ node --import tsx tests/coach/continuationFlow.test.ts
continuationFlow ok

$ node --import tsx tests/coach/plainLeak.test.ts
plainLeak ok

$ node --import tsx tests/coach/showMoreVisualReveal.test.ts
showMoreVisualReveal ok

$ node --import tsx tests/coach/providerFailure.test.ts
providerFailure ok

$ node --import tsx tests/coach/antiHallucination.test.ts
antiHallucination ok

$ node --import tsx tests/coach/browserContract.test.ts
browserContract ok

$ npm test

$ npm run lint

## Step L Final Verification

$ git status --short
 M tests/coach/antiHallucination.test.ts
 M tests/coach/evidenceGraph.test.ts
 M tests/coach/plainLeak.test.ts
?? .agent_runs/v2.8.0-intelligent-coach/20260603_135016/
?? BLUNDR_v2.8.0_INTELLIGENT_COACH_LIVE_VERSION_ROADMAP.md
?? BLUNDR_v2.8.0_PACKAGE_0_CODEX_PROMPT.md
?? "docs/BLUNDR_v2.8.0 Foundation Stabilization Gate_AGENT_6_TEACHING_CONCEPT_REGISTRY_REPORT.md"
?? lib/blundr/concepts/
?? tests/coach/dynamicConceptActivator.test.ts
?? tests/coach/teachingConceptRegistry.test.ts

$ git diff --stat
 tests/coach/antiHallucination.test.ts |  5 +++++
 tests/coach/evidenceGraph.test.ts     |  9 +++++++++
 tests/coach/plainLeak.test.ts         | 33 +++++++++++++++++++++++++++++++++
 3 files changed, 47 insertions(+)
