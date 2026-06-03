# Package 7 Command Log

## Step A Inspection

$ git branch --show-current
v2.8.0-intelligent-coach-live

$ git status --short
?? .agent_runs/v2.8.0-intelligent-coach/20260603_141148/
?? BLUNDR_v2.8.0_INTELLIGENT_COACH_LIVE_VERSION_ROADMAP.md
?? BLUNDR_v2.8.0_PACKAGE_0_CODEX_PROMPT.md

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

$ git grep -n "CompiledCoachFrame\|compileCoachFrame\|CoachCompiler\|templateRenderer\|showMore\|plainHint\|revealAction\|visualIntents" lib app components tests || true
app/page.tsx:776:  // v2.7.40 Agent 4: dedicated showMoreShown for Plain View Hint+Show More escalation (resets on new frame; distinct from showDetails debug toggle)
app/page.tsx:777:  const [showMoreShown,setShowMoreShown]=useState(false);
app/page.tsx:1413:  const effectiveViewModeForVisual = (trainerView === "plain" && showMoreShown) ? "assisted" : trainerView;
app/page.tsx:1426:  }):null,[teachingOrchestration,selectedRepertoireId,fen,trainerFrameId,trainerView,showAnswer,trainerPhase,isUserTurn,showMoreShown,effectiveViewModeForVisual]);
app/page.tsx:1440:  }),[visualRecipeForRender,trainerPhase,isUserTurn,trainerView,boardFen,trainerFrameId,overlayFrameId,showMoreShown,effectiveViewModeForVisual]);
app/page.tsx:2067:    answerShown:showAnswer || (trainerView === "plain" && showMoreShown),
app/page.tsx:2103:  }),[trainerFrameId,fen,activeBoard,trainerView,trainerPhase,trainingMode,isUserTurn,visualRecipeForRender,visualRecipeMainLines,safeMoveArrowVisual.lines,continuationCandidateVisual.lines,legacyVisualLines,visualRecipePlayback.activePrimitiveIds,visualRecipePlayback.animationState,visualRecipeOverlay,overlayFrameId,coachDecision,coachHiddenForFrame,coachSurfacePolicy,branchTransitionSurface,brainAnalysisForPresentation,showMoreShown]);
app/page.tsx:2383:    if(button==="show_more" || (button as any)==="show_more"){const after={...before,showMoreShown:true,coachInteraction:"show_plan"};setShowMoreShown(true);setCoachInteraction("show_plan");recordDebugAction({action:button,normalizedAction:"show_more",before,after,result:"handled",reason:"plain_show_more_escalation_to_full_content"});return;}
app/page.tsx:2416:  const intendedShowMoreTargetUci = showMoreShown ? instructionTarget?.uci ?? null : null;
app/page.tsx:2427:    showMoreShown, // v2.7.40 Agent 4: dedicated state (not showDetails)
app/page.tsx:2442:    showMoreTargetUci: intendedShowMoreTargetUci,
app/page.tsx:3689:    showMoreTargetUci: intendedShowMoreTargetUci,
app/page.tsx:3758:      {/* v2.7.40 Agent 3 wiring: CoachCard now driven exclusively by VisibleTeachingSurface (coach + hint + showMore + actions).
app/page.tsx:3775:            // hint/showMore exposed via surface for future Agent 4
app/page.tsx:3777:            showMoreContent: visibleTeachingSurface.showMore.content,
lib/blundr/brain/hints/buildHintLadder.ts:6: * - Only called/used before showMoreShown for Plain teaching frames.
lib/blundr/brain/hints/buildHintLadder.ts:11: * - leaksAnswer=false for all pre-showMore.
lib/blundr/brain/hints/buildHintLadder.ts:13: * - Never leaks target move before showMoreShown.
lib/blundr/brain/hints/buildHintLadder.ts:26:  showMoreShown: boolean;
lib/blundr/brain/hints/buildHintLadder.ts:52:    showMoreShown = false,
lib/blundr/brain/hints/buildHintLadder.ts:58:  if (!target || showMoreShown) {
lib/blundr/brain/hints/buildHintLadder.ts:165:  const currentHint = effectiveCount > 0 && !showMoreShown ? hints[hintIndex].text : null;
lib/blundr/coachBrain/evidenceConditionedCopyBuilder.ts:202:  // Narrow fix for plain pre-showMore: ensure the .hint returned for interaction="hint" in plain does not include exact move name (raw verified fallback may name it; surface ladder also protects, but copy .hint must be safe for pre-answer).
lib/blundr/coachBrain/evidenceConditionedCopyBuilder.ts:203:  // This resolves the answer-leak test without broadly altering assisted/ post-showMore / continuation copy formats.
lib/blundr/coachCompiler/types.ts:54:export interface CompiledCoachFrame {
lib/blundr/coachCompiler/types.ts:64:    showMoreAvailable: boolean;
lib/blundr/coachCompiler/types.ts:71:  showMore: {
lib/blundr/coachCompiler/types.ts:75:  visualIntents: VisualIntent[];
lib/blundr/coachCompiler/types.ts:76:  revealAction: RevealAction;
lib/blundr/coachCompiler/types.ts:97:  plainHint: string;
lib/blundr/coachCompiler/types.ts:99:  showMore: string;
lib/blundr/concepts/TeachingConcept.ts:49:  plainHintTemplate: {
lib/blundr/concepts/TeachingConcept.ts:60:  showMoreTemplate: {
lib/blundr/concepts/TeachingConcept.ts:90:    plainHint: boolean;
lib/blundr/concepts/TeachingConcept.ts:92:    showMore: boolean;
lib/blundr/concepts/conceptSafety.ts:65:  const template = input.concept.plainHintTemplate.template;
lib/blundr/concepts/conceptSafety.ts:86:  if (input.concept.plainHintTemplate.leakRisk === "high") {
lib/blundr/concepts/conceptSafety.ts:87:    const forbiddenMatch = input.concept.plainHintTemplate.forbiddenTokens
lib/blundr/concepts/dynamicConceptActivator.ts:197:            plainHint: concept.safety.allowInPlainBeforeShowMore,
lib/blundr/concepts/dynamicConceptActivator.ts:199:            showMore: true,
lib/blundr/concepts/dynamicConceptActivator.ts:240:        plainHint: concept.safety.allowInPlainBeforeShowMore,
lib/blundr/concepts/dynamicConceptActivator.ts:242:        showMore: modeEligible(concept, "show_more"),
lib/blundr/concepts/teachingConceptRegistry.ts:37:  plainHintTemplate?: string;
lib/blundr/concepts/teachingConceptRegistry.ts:39:  showMoreTemplate?: string;
lib/blundr/concepts/teachingConceptRegistry.ts:41:  showMoreSlots?: string[];
lib/blundr/concepts/teachingConceptRegistry.ts:269:    plainHintTemplate: {
lib/blundr/concepts/teachingConceptRegistry.ts:271:      template: spec.plainHintTemplate ?? defaultPlainTemplate(spec),
lib/blundr/concepts/teachingConceptRegistry.ts:278:    showMoreTemplate: {
lib/blundr/concepts/teachingConceptRegistry.ts:279:      template: spec.showMoreTemplate ?? "Detail how {conceptLabel} follows from {evidenceSummary} and board truth.",
lib/blundr/concepts/teachingConceptRegistry.ts:280:      requiredSlots: spec.showMoreSlots ?? ["conceptLabel", "evidenceSummary", "boardTruth"],
lib/blundr/concepts/teachingConceptRegistry.ts:312:  return !concept.plainHintTemplate.template.trim()
lib/blundr/concepts/teachingConceptRegistry.ts:314:    || !concept.showMoreTemplate.template.trim();
lib/blundr/concepts/teachingConceptRegistry.ts:341:    if (concept.plainHintTemplate.leakRisk === "high") {
lib/blundr/concepts/teachingConceptRegistry.ts:342:      const lower = concept.plainHintTemplate.template.toLowerCase();
lib/blundr/concepts/teachingConceptRegistry.ts:348:    const joined = `${concept.label} ${concept.summary} ${concept.plainHintTemplate.template} ${concept.assistedTemplate.template} ${concept.showMoreTemplate.template}`.toLowerCase();
lib/blundr/debug/trainerDebugSnapshot.ts:771:      showMoreTargetUci: input.showMoreTargetUci ?? input.visibleTeachingSurface?.targetUci ?? null,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:213:  const sPlain = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres1, trainerView: "plain", showMoreShown: false, hintCount: 0 });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:252:    showMoreTargetUci: "e2e4",
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:271:  // 9. Plain leak detector standalone + blocks when triggered (pre-showMore)
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:282:    showMoreShown: false,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:320:  // 1. Hint 1/2/3 never contain SAN/UCI/direct move/target square before showMore
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:321:  const l0 = buildHintLadder({ target: guidedFrame.target, hintCount: 0, trainerView: "plain", showMoreShown: false });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:322:  const l1 = buildHintLadder({ target: guidedFrame.target, hintCount: 1, trainerView: "plain", showMoreShown: false });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:323:  const l2 = buildHintLadder({ target: guidedFrame.target, hintCount: 2, trainerView: "plain", showMoreShown: false });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:324:  const l3 = buildHintLadder({ target: guidedFrame.target, hintCount: 3, trainerView: "plain", showMoreShown: false });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:336:  // 2. Plain pre showMore: surface coach may render prompt, but body/visuals suppressed unless progressive hint; actions exactly hint+show_more
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:337:  const sPlainPre0 = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres, trainerView: "plain", showMoreShown: false, hintCount: 0 });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:341:  if (sPlainPre0.visual.shouldRender) throw new Error("visuals must be hidden pre showMore in plain");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:345:  // 3. After showMore in plain: shows full assisted-style content aligned to target (no leak check needed post)
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:346:  const sPlainPost = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres, trainerView: "plain", showMoreShown: true, hintCount: 0 });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:347:  if (!sPlainPost.coach.shouldRender) throw new Error("post showMore must render coach");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:348:  if (sPlainPost.showMore.content == null && !pres.coach.body) { /* ok if pres has none in mock */ }
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:356:  // 5. Hint count + showMoreShown reset behavior (simulated via new frame input)
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:357:  const sNewFrame = buildVisibleTeachingSurface({ currentInstructionFrame: { ...guidedFrame, frameId: "f99", target: { ...guidedFrame.target!, uci: "d2d4" } } as any, trainerPresentationFrame: pres, trainerView: "plain", showMoreShown: false, hintCount: 0 });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:360:  if (buildHintLadder({ target: guidedFrame.target, hintCount: 0, trainerView: "plain", showMoreShown: false }).currentHint != null) {
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:434:    showMoreShown: false,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:462:// v2.7.40 Agent 7: Full prompt coverage tests for all listed items (UI forbidden labels non-debug; continuation branch clean + candidate locked + no emergency legal fallback as teaching target; stale buttons cleared; Show More not on terminal/opp; debug invariants coach/visual/showMore targets==instruction; piece match; mismatch blocks)
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:475:  const sPlainPre = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres, trainerView: "plain", showMoreShown: false, hintCount: 0 });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:482:  if (sTerm.showMore.actionAvailable !== false) throw new Error("Show More must not be available on terminal");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:487:  if (sOpp.showMore.actionAvailable !== false) throw new Error("Show More must not be available on opponent");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:522:  // Architecture + Invariant: coach/visual/showMore targets == instruction target; piece types match; mismatch blocks (reaffirm + explicit)
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:525:  if (sAssisted.showMore.shown && sAssisted.showMore.content && sAssisted.targetUci !== guidedFrame.target!.uci) {
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:526:    throw new Error("showMore target must match instruction target");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:540:  // Use bc4 teaching context (trusted book) to drive recipe + copy + surface for plain pre/post showMore
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:564:  // simulate presentation frame input for pre (showMoreShown=false) and post (true)
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:572:    brainAnalysis: null, branchTransitionSurface: null, showMoreShown: false, hintCount: 0,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:573:    coachMoveUci: null, visualMoveUci: "f1c4", showMoreTargetUci: null,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:576:  // pre showMore: build surface, prove does not expose SAN/UCI/source/target/arrow/hint (task4)
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:579:    trainerPresentationFrame: computeTrainerPresentationFrame({ ...basePresInput, showMoreShown: false, answerShown: false, visualRecipeLines: plainBc4Recipe.beats.flatMap((b: any) => b.primitives.map((p: any) => ({ from: p.from, to: p.to, kind: p.type }))) as any, coachBody: plainCopy.body } as any),
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:580:    showMoreShown: false, trainerView: "plain", trainingMode: "restricted", isUserTurn: true, trainerPhase: "ready_for_user", bookStatus: "in_book", isBranchTransition: false, isTerminal: false, brainAnalysis: null, hintCount: 0,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:581:    coachMoveUci: null, visualMoveUci: "f1c4", showMoreTargetUci: null,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:591:  // post showMore: reuses assisted primary recipe (task5)
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:594:    trainerPresentationFrame: computeTrainerPresentationFrame({ ...basePresInput, showMoreShown: true, answerShown: true, visualRecipeLines: plainBc4Recipe.beats.flatMap((b: any) => b.primitives.map((p: any) => ({ from: p.from, to: p.to, kind: p.type }))) as any, coachBody: plainCopy.body } as any),
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:595:    showMoreShown: true, trainerView: "plain", trainingMode: "restricted", isUserTurn: true, trainerPhase: "ready_for_user", bookStatus: "in_book", isBranchTransition: false, isTerminal: false, brainAnalysis: null, hintCount: 0,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:596:    coachMoveUci: null, visualMoveUci: "f1c4", showMoreTargetUci: "f1c4",
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:598:  assert.equal(postSurface.showMore.shown, true);
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:602:    assert.equal(postArrows >= 1, true, "post showMore should have the primary move arrow");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:604:    assert.equal(postHasPressure, false, "post showMore primary must have no pressure lines");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:615:  // build a pipeline copy for the bc4 and feed to post pres to verify showMore matches
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:616:  const showMorePipeline = buildCoachExplanationPipeline({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:625:    showMoreShown: true,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:627:    coachTitle: showMorePipeline.coachExplanation.title,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:628:    coachBody: showMorePipeline.coachExplanation.body,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:634:    showMoreShown: true, trainerView: "plain", trainingMode: "restricted", isUserTurn: true, trainerPhase: "ready_for_user", bookStatus: "in_book", isBranchTransition: false, isTerminal: false, brainAnalysis: null, hintCount: 0,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:635:    coachMoveUci: null, visualMoveUci: "f1c4", showMoreTargetUci: "f1c4",
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:637:  const mainTitle = showMorePipeline.coachExplanation.title;
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:638:  const showMoreContent = postSurfForShow.showMore?.content || "";
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:640:  assert.equal(/Bc4/i.test(showMoreContent || mainTitle), true, "Show More must include same SAN as main coaching box");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:641:  assert.equal(/bishop|b/i.test(mainTitle + " " + showMoreContent), true);
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:642:  assert.equal(postSurfForShow.showMore.shown, true);
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:648:    trainerPresentationFrame: computeTrainerPresentationFrame({ ...basePresInput, showMoreShown: false, answerShown: false, visualRecipeLines: plainBc4Recipe.beats.flatMap((b: any) => b.primitives.map((p: any) => ({ from: p.from, to: p.to, kind: p.type }))) as any, coachBody: "Find the next move." } as any),
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:649:    showMoreShown: false, trainerView: "plain", trainingMode: "restricted", isUserTurn: true, trainerPhase: "ready_for_user", bookStatus: "in_book", isBranchTransition: false, isTerminal: false, brainAnalysis: null, hintCount: 0,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:650:    coachMoveUci: null, visualMoveUci: null, showMoreTargetUci: null,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:671:  const postCoachText = (postSurfForShow.coach && (postSurfForShow.coach.body || postSurfForShow.coach.title) || "") + " " + (postSurfForShow.showMore && postSurfForShow.showMore.content || "");
lib/blundr/presentation/buildVisibleTeachingSurface.ts:14: * 2. target mismatch (any consumer vs instruction target) → safety.blocked=true + full suppress of coach body/visuals/hint/showMore content.
lib/blundr/presentation/buildVisibleTeachingSurface.ts:16: * 4. Plain View (trainerView==="plain") before showMoreShown → hide coach body + visuals; only hint + showMore actions exposed.
lib/blundr/presentation/buildVisibleTeachingSurface.ts:20: * 8. safety.blocked=true forces coach.shouldRender=false, visual.shouldRender=false, hint suppressed, showMore content hidden.
lib/blundr/presentation/buildVisibleTeachingSurface.ts:27: * - Progressive hint ladder (via buildHintLadder) drives .hint.text and pre-showMore coach body for plain.
lib/blundr/presentation/buildVisibleTeachingSurface.ts:29: * - Plain post showMore: full assisted-style coach body + visuals from presentation (aligned).
lib/blundr/presentation/buildVisibleTeachingSurface.ts:30: * - hintCount + showMoreShown drive ladder + suppression.
lib/blundr/presentation/buildVisibleTeachingSurface.ts:31: * - All hint texts pre-showMore never contain SAN/UCI/direct move/target square (enforced in ladder + tests).
lib/blundr/presentation/buildVisibleTeachingSurface.ts:34: * - 4-target (instructionTargetUci, coachMoveUci, visualMoveUci, showMoreTargetUci) + 2-pieceType (instruction, coach) invariants enforced on active teaching frames.
lib/blundr/presentation/buildVisibleTeachingSurface.ts:35: * - Any fail → safety.blocked=true, suppress coach/visual/hint/showMore (except safe fallback), owner=_blocked, debug flags + fourTargetMismatch etc.
lib/blundr/presentation/buildVisibleTeachingSurface.ts:36: * - Plain leak detector (pre-showMore in plain): scans visible coach/hint/actions for UCI/SAN/squares/"Play {move}"/forbidden debug labels → block + plainLeakDetected.
lib/blundr/presentation/buildVisibleTeachingSurface.ts:52: * Agent 6 plain leak detector (runtime guard, pre-showMore Plain View).
lib/blundr/presentation/buildVisibleTeachingSurface.ts:116:  showMore: {
lib/blundr/presentation/buildVisibleTeachingSurface.ts:138:    plainLeakDetected: boolean; // Agent 6: runtime plain view leak guard (pre-showMore)
lib/blundr/presentation/buildVisibleTeachingSurface.ts:173:  showMoreShown?: boolean;
lib/blundr/presentation/buildVisibleTeachingSurface.ts:191:  showMoreTargetUci?: string | null;
lib/blundr/presentation/buildVisibleTeachingSurface.ts:206:    showMoreShown = false,
lib/blundr/presentation/buildVisibleTeachingSurface.ts:221:    showMoreTargetUci = null,
lib/blundr/presentation/buildVisibleTeachingSurface.ts:274:  // coachMoveUci, visualMoveUci, showMoreTargetUci (when shown) + coachPieceType MUST align or block.
lib/blundr/presentation/buildVisibleTeachingSurface.ts:278:    const provided4 = [coachMoveUci, visualMoveUci, (showMoreShown ? showMoreTargetUci : null)].filter(Boolean) as string[];
lib/blundr/presentation/buildVisibleTeachingSurface.ts:310:  // Plain View pre-showMore rule (hides body + visuals; limits actions)
lib/blundr/presentation/buildVisibleTeachingSurface.ts:311:  const isPlainPreShowMore = trainerView === "plain" && !showMoreShown && isBrainTeachingFrame;
lib/blundr/presentation/buildVisibleTeachingSurface.ts:313:  // v2.7.40 Agent 4: Compute progressive hint ladder (always safe; only currentHint used pre-showMore)
lib/blundr/presentation/buildVisibleTeachingSurface.ts:321:    showMoreShown,
lib/blundr/presentation/buildVisibleTeachingSurface.ts:348:    answerShown: showMoreShown, // proxy; real showAnswer state upstream
lib/blundr/presentation/buildVisibleTeachingSurface.ts:383:  // === Agent 6: Plain leak detector (final scan of visible pre-showMore Plain content) ===
lib/blundr/presentation/buildVisibleTeachingSurface.ts:409:  // Hint (Agent 4): now driven by ladder for Plain; suppressed on block. Current progressive only pre-showMore.
lib/blundr/presentation/buildVisibleTeachingSurface.ts:414:  const showMoreContent = showMoreShown && !safetyBlocked ? (coachBody || trainerPresentationFrame?.coach?.body || null) : null;
lib/blundr/presentation/buildVisibleTeachingSurface.ts:415:  const showMoreActionAvailable = actions.includes("show_more");
lib/blundr/presentation/buildVisibleTeachingSurface.ts:510:    showMore: {
lib/blundr/presentation/buildVisibleTeachingSurface.ts:511:      shown: showMoreShown,
lib/blundr/presentation/buildVisibleTeachingSurface.ts:512:      content: showMoreContent,
lib/blundr/presentation/buildVisibleTeachingSurface.ts:513:      actionAvailable: showMoreActionAvailable,
lib/blundr/presentation/trainerPresentationFrame.ts:95:    // Step 4: allow plain so that when showMoreShown, the (effective-assisted) visualRecipeLines
lib/blundr/presentation/trainerPresentationFrame.ts:97:    // for plain pre-showMore via !isPlainPreShowMore. This enables plain post to reuse assisted
lib/blundr/presentation/types.ts:17:  showMore: boolean;
lib/blundr/presentation/types.ts:31:    showMore?: {
lib/blundr/presentation/types.ts:36:  plainHint: string | null;
lib/blundr/presentation/types.ts:37:  revealAction: {
tests/coach/browserContract.test.ts:7:    plainHint: '[data-testid="plain-hint"]',
tests/coach/browserContract.test.ts:8:    showMoreButton: '[data-testid="show-more-button"]',
tests/coach/browserContract.test.ts:15:    showMoreRevealsSameTarget: "After Show More, revealed visual target must equal CurrentInstructionFrame.target.",
tests/coach/evidenceGraph.test.ts:141:  const hasCoachCopyFields = JSON.stringify(illegal).includes("assisted") || JSON.stringify(illegal).includes("plain.hint") || JSON.stringify(illegal).includes("showMore");
tests/coach/plainLeak.test.ts:27:    .filter((concept) => concept.plainHintTemplate.leakRisk === "high")
tests/coach/plainLeak.test.ts:29:      const low = concept.plainHintTemplate.template.toLowerCase();
tests/coach/showMoreVisualReveal.test.ts:13:    showMoreShown: false,
tests/coach/showMoreVisualReveal.test.ts:20:    showMoreShown: true,
tests/coach/showMoreVisualReveal.test.ts:25:  assert.equal(plainBeforeShowMore.answerVisualTarget, null, "plain pre-showMore must not reveal answer visual");
tests/coach/showMoreVisualReveal.test.ts:27:  assert.equal(plainAfterShowMore.answerVisualTarget, instructionTarget, "showMore visual target must equal instruction target");
tests/coach/showMoreVisualReveal.test.ts:29:  assert.equal(shouldResetShowMore("frame-a", "frame-b"), true, "frameKey change should reset showMore state");
tests/coach/showMoreVisualReveal.test.ts:34:console.log("showMoreVisualReveal ok");
tests/coach/targetInvariant.test.ts:3:import type { CompiledCoachFrame } from "../../lib/blundr/coachCompiler/types";
tests/coach/targetInvariant.test.ts:13:  showMoreTargetUci: string | null;
tests/coach/targetInvariant.test.ts:20:    input.showMoreTargetUci,
tests/coach/targetInvariant.test.ts:76:  const compiled: CompiledCoachFrame = {
tests/coach/targetInvariant.test.ts:84:    plain: { hint: "Improve development.", showMoreAvailable: true, leakRisk: "low" },
tests/coach/targetInvariant.test.ts:86:    showMore: { title: "Bc4 details", body: "This supports pressure near f7." },
tests/coach/targetInvariant.test.ts:87:    visualIntents: [
tests/coach/targetInvariant.test.ts:100:    revealAction: { kind: "reveal_move", targetUci: "f1c4" },
tests/coach/targetInvariant.test.ts:103:    debug: { showMoreTargetUci: "f1c4" },
tests/coach/targetInvariant.test.ts:114:      showMore: { title: "More", body: "Controls key squares." },
tests/coach/targetInvariant.test.ts:116:    plainHint: null,
tests/coach/targetInvariant.test.ts:117:    revealAction: { kind: "reveal_move", targetUci: "f1c4" },
tests/coach/targetInvariant.test.ts:125:      showMore: true,
tests/coach/targetInvariant.test.ts:138:    revealTargetUci: surface.revealAction?.targetUci ?? null,
tests/coach/targetInvariant.test.ts:139:    showMoreTargetUci: String(compiled.debug.showMoreTargetUci ?? null),
tests/coach/targetInvariant.test.ts:148:      showMoreTargetUci: "g1f3",
tests/coach/targetInvariant.test.ts:155:    surface: "showMore",
tests/coach/teachingConceptRegistry.test.ts:61:    assert.equal(concept.plainHintTemplate.template.trim().length > 0, true, `${concept.id}: empty plain template`);
tests/coach/teachingConceptRegistry.test.ts:63:    assert.equal(concept.showMoreTemplate.template.trim().length > 0, true, `${concept.id}: empty showMore template`);
tests/coach/teachingConceptRegistry.test.ts:65:    const textBlob = `${concept.label} ${concept.summary} ${concept.plainHintTemplate.template} ${concept.assistedTemplate.template} ${concept.showMoreTemplate.template}`.toLowerCase();
tests/coach/teachingConceptRegistry.test.ts:71:    if (concept.plainHintTemplate.leakRisk === "high") {
tests/coach/teachingConceptRegistry.test.ts:72:      const low = concept.plainHintTemplate.template.toLowerCase();
tests/coach/typeContracts.test.ts:3:import type { CompiledCoachFrame } from "../../lib/blundr/coachCompiler/types";
tests/coach/typeContracts.test.ts:157:    plainHint: "No safe teaching claim available.",
tests/coach/typeContracts.test.ts:158:    revealAction: { kind: "none", targetUci: null },
tests/coach/typeContracts.test.ts:162:      showMore: false,
tests/coach/typeContracts.test.ts:165:      disabledReasons: { showMore: "blocked_by_safety" },
tests/coach/typeContracts.test.ts:176:  const compiledFrame: CompiledCoachFrame = {
tests/coach/typeContracts.test.ts:186:      showMoreAvailable: true,
tests/coach/typeContracts.test.ts:193:    showMore: {
tests/coach/typeContracts.test.ts:197:    visualIntents: [
tests/coach/typeContracts.test.ts:210:    revealAction: {
tests/coach/typeContracts.test.ts:224:  assert.equal(compiledFrame.visualIntents.length, 1);

$ git grep -n "CurrentInstructionFrame\|EvidenceGraph\|ActivatedTeachingConcept\|activateTeachingConcepts" lib/blundr tests/coach || true
lib/blundr/brain/analyzeBlundrPosition.ts:8: * - Target is always respected from CurrentInstructionFrame.
lib/blundr/brain/analyzeBlundrPosition.ts:127:      note: "Production Brain v2.7.40 Agent5 - target facts + concept + evidence + safe copy (pieceType enforced from CurrentInstructionFrame.target)",
lib/blundr/brain/analyzeBlundrPosition.ts:136:// All derive strictly from CurrentInstructionFrame.target facts. No SAN in prompt/hint copy. No banned terms.
lib/blundr/brain/analyzeBlundrPosition.ts:217:    pieceType: target.pieceType, // enforced match to CurrentInstructionFrame.target
lib/blundr/brain/buildEvidenceGraph.ts:1:import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
lib/blundr/brain/buildEvidenceGraph.ts:9:import type { CoachEvidenceClaim, EvidenceGraph } from "./types";
lib/blundr/brain/buildEvidenceGraph.ts:29:  frame: CurrentInstructionFrame;
lib/blundr/brain/buildEvidenceGraph.ts:30:  boardTruthTargetLegal: EvidenceGraph["boardTruth"]["targetLegal"];
lib/blundr/brain/buildEvidenceGraph.ts:32:}): EvidenceGraph["contradictions"] {
lib/blundr/brain/buildEvidenceGraph.ts:33:  const out: EvidenceGraph["contradictions"] = [];
lib/blundr/brain/buildEvidenceGraph.ts:63:export function buildEvidenceGraph(input: {
lib/blundr/brain/buildEvidenceGraph.ts:64:  frame: CurrentInstructionFrame;
lib/blundr/brain/buildEvidenceGraph.ts:75:}): EvidenceGraph {
lib/blundr/brain/index.ts:7:export { buildEvidenceGraph } from "./buildEvidenceGraph";
lib/blundr/brain/providers/boardTruthProvider.ts:2:import type { CurrentInstructionFrame } from "../../runtime/currentInstructionFrame";
lib/blundr/brain/providers/boardTruthProvider.ts:26:export function buildBoardTruth(input: { frame: CurrentInstructionFrame }): BoardTruth {
lib/blundr/brain/providers/moveSemanticsProvider.ts:1:import type { CurrentInstructionFrame } from "../../runtime/currentInstructionFrame";
lib/blundr/brain/providers/moveSemanticsProvider.ts:16:  frame: CurrentInstructionFrame,
lib/blundr/brain/providers/moveSemanticsProvider.ts:56:  frame: CurrentInstructionFrame;
lib/blundr/brain/providers/openingContextProvider.ts:1:import type { CurrentInstructionFrame } from "../../runtime/currentInstructionFrame";
lib/blundr/brain/providers/openingContextProvider.ts:5:  frame: CurrentInstructionFrame;
lib/blundr/brain/providers/strategicFeatureProvider.ts:1:import type { CurrentInstructionFrame } from "../../runtime/currentInstructionFrame";
lib/blundr/brain/providers/strategicFeatureProvider.ts:5:  frame: CurrentInstructionFrame,
lib/blundr/brain/providers/strategicFeatureProvider.ts:35:  frame: CurrentInstructionFrame;
lib/blundr/brain/providers/tacticalMotifProvider.ts:1:import type { CurrentInstructionFrame } from "../../runtime/currentInstructionFrame";
lib/blundr/brain/providers/tacticalMotifProvider.ts:5:  frame: CurrentInstructionFrame,
lib/blundr/brain/providers/tacticalMotifProvider.ts:33:  frame: CurrentInstructionFrame;
lib/blundr/brain/providers/visualEvidenceProvider.ts:1:import type { CurrentInstructionFrame } from "../../runtime/currentInstructionFrame";
lib/blundr/brain/providers/visualEvidenceProvider.ts:5:  frame: CurrentInstructionFrame,
lib/blundr/brain/providers/visualEvidenceProvider.ts:33:  frame: CurrentInstructionFrame;
lib/blundr/brain/types.ts:6:import type { CurrentInstructionTarget, CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
lib/blundr/brain/types.ts:67:export interface EvidenceGraph {
lib/blundr/brain/types.ts:153:  currentInstructionFrame: CurrentInstructionFrame | null;
lib/blundr/brain/types.ts:228:  // CurrentInstructionFrame.target is source; these derive strictly from it + basic facts (no halluc)
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:4:import { buildCurrentInstructionFrame } from "../../runtime/currentInstructionFrame";
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:8:  const frame = buildCurrentInstructionFrame({
lib/blundr/concepts/TeachingConcept.ts:82:export interface ActivatedTeachingConcept {
lib/blundr/concepts/dynamicConceptActivator.ts:1:import type { CoachEvidenceClaim, EvidenceGraph } from "../brain/types";
lib/blundr/concepts/dynamicConceptActivator.ts:2:import type { ActivatedTeachingConcept, ActivationMode, ConceptEloBand, TeachingConcept } from "./TeachingConcept";
lib/blundr/concepts/dynamicConceptActivator.ts:45:function strongestActivationStrength(claims: CoachEvidenceClaim[]): ActivatedTeachingConcept["strength"] {
lib/blundr/concepts/dynamicConceptActivator.ts:56:function hasEngineEvidence(graph: EvidenceGraph): boolean {
lib/blundr/concepts/dynamicConceptActivator.ts:62:function matchesMoveFlags(concept: TeachingConcept, graph: EvidenceGraph): boolean {
lib/blundr/concepts/dynamicConceptActivator.ts:77:function openingThemeScore(concept: TeachingConcept, graph: EvidenceGraph): number {
lib/blundr/concepts/dynamicConceptActivator.ts:97:export function activateTeachingConcepts(input: {
lib/blundr/concepts/dynamicConceptActivator.ts:98:  graph: EvidenceGraph;
lib/blundr/concepts/dynamicConceptActivator.ts:103:  activated: ActivatedTeachingConcept[];
lib/blundr/concepts/dynamicConceptActivator.ts:120:  const activatedWithScore: Array<{ concept: ActivatedTeachingConcept; score: number }> = [];
lib/blundr/concepts/dynamicConceptActivator.ts:189:        const synthetic: ActivatedTeachingConcept = {
lib/blundr/concepts/dynamicConceptActivator.ts:232:    const activation: ActivatedTeachingConcept = {
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:13:import { buildCurrentInstructionFrame } from "../../runtime/currentInstructionFrame";
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:440:  const instructionFrame = buildCurrentInstructionFrame({
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:5:import { buildCurrentInstructionFrame } from "../../runtime/currentInstructionFrame";
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:271:  const nextFrame = buildCurrentInstructionFrame({
lib/blundr/debug/testTrainerDebug.ts:6:import { testCurrentInstructionFrame } from "../runtime/__tests__/currentInstructionFrame.test";
lib/blundr/debug/testTrainerDebug.ts:19:  testCurrentInstructionFrame();
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:6:import type { CurrentInstructionFrame } from "../../runtime/currentInstructionFrame";
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:119:function makeMockInstructionFrame(targetKind: "guided_move" | "continuation_candidate", uci = "e2e4", san = "e4", piece = "p"): CurrentInstructionFrame {
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:442:    throw new Error("Surface target/pieceType must come ONLY from CurrentInstructionFrame.target");
lib/blundr/presentation/buildVisibleTeachingSurface.ts:5: *   CurrentInstructionFrame.target → BlundrBrainAnalysis → TrainerPresentationFrame → VisibleTeachingSurface → UI
lib/blundr/presentation/buildVisibleTeachingSurface.ts:7: * CurrentInstructionFrame.target is the SINGLE SOURCE OF TRUTH for targetUci/targetSan/targetPieceType.
lib/blundr/presentation/buildVisibleTeachingSurface.ts:41:import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
lib/blundr/presentation/buildVisibleTeachingSurface.ts:97:  // STRICTLY from CurrentInstructionFrame.target — never legacy
lib/blundr/presentation/buildVisibleTeachingSurface.ts:161:  currentInstructionFrame: CurrentInstructionFrame;
lib/blundr/presentation/trainerPresentationFrame.ts:81:  // v2.7.40 Agent 5: pass brainAnalysis (from analyzeBlundrPosition) so coach copy derives from CurrentInstructionFrame.target via Brain -> PresentationFrame
lib/blundr/presentation/trainerPresentationFrame.ts:183:  // CurrentInstructionFrame.target -> BlundrBrainAnalysis.safeFallbackCopy (piece-matched, evidence-backed, no halluc) -> TrainerPresentationFrame -> VisibleTeachingSurface
lib/blundr/runtime/__tests__/currentInstructionFrame.test.ts:4:import { buildCurrentInstructionFrame, buildVerifiedMoveFacts, isBookLikeInstructionTarget } from "../currentInstructionFrame";
lib/blundr/runtime/__tests__/currentInstructionFrame.test.ts:12:export function testCurrentInstructionFrame(): void {
lib/blundr/runtime/__tests__/currentInstructionFrame.test.ts:21:  const e5 = buildCurrentInstructionFrame({
lib/blundr/runtime/__tests__/currentInstructionFrame.test.ts:30:  const f4 = buildCurrentInstructionFrame({
lib/blundr/runtime/__tests__/currentInstructionFrame.test.ts:39:  const nf3 = buildCurrentInstructionFrame({
lib/blundr/runtime/__tests__/currentInstructionFrame.test.ts:48:  const bc4 = buildCurrentInstructionFrame({
lib/blundr/runtime/__tests__/currentInstructionFrame.test.ts:56:  const castle = buildCurrentInstructionFrame({
lib/blundr/runtime/__tests__/currentInstructionFrame.test.ts:65:  const nxc6Check = buildCurrentInstructionFrame({
lib/blundr/runtime/__tests__/currentInstructionFrame.test.ts:75:  const qxe7Mate = buildCurrentInstructionFrame({
lib/blundr/runtime/__tests__/currentInstructionFrame.test.ts:85:  const promotion = buildCurrentInstructionFrame({
lib/blundr/runtime/__tests__/currentInstructionFrame.test.ts:98:  const lichessBranch = buildCurrentInstructionFrame({
lib/blundr/runtime/__tests__/currentInstructionFrame.test.ts:107:  const adaptiveBranch = buildCurrentInstructionFrame({
lib/blundr/runtime/continuationRuntimeState.ts:3:import type { CurrentInstructionFrame } from "./currentInstructionFrame";
lib/blundr/runtime/continuationRuntimeState.ts:127:export function buildContinuationRuntimeAuthorityState(frame: CurrentInstructionFrame): ContinuationRuntimeAuthorityState {
lib/blundr/runtime/currentInstructionFrame.ts:9:  type CurrentInstructionFrameKind,
lib/blundr/runtime/currentInstructionFrame.ts:30:export type CurrentInstructionFrame = {
lib/blundr/runtime/currentInstructionFrame.ts:32:  kind: CurrentInstructionFrameKind;
lib/blundr/runtime/currentInstructionFrame.ts:72:export type LegacyBuildCurrentInstructionFrameInput = {
lib/blundr/runtime/currentInstructionFrame.ts:84:export type CanonicalBuildCurrentInstructionFrameInput = {
lib/blundr/runtime/currentInstructionFrame.ts:85:  kind: CurrentInstructionFrameKind;
lib/blundr/runtime/currentInstructionFrame.ts:103:  debug?: Partial<CurrentInstructionFrame["debug"]>;
lib/blundr/runtime/currentInstructionFrame.ts:106:export type BuildCurrentInstructionFrameInput =
lib/blundr/runtime/currentInstructionFrame.ts:107:  | LegacyBuildCurrentInstructionFrameInput
lib/blundr/runtime/currentInstructionFrame.ts:108:  | CanonicalBuildCurrentInstructionFrameInput;
lib/blundr/runtime/currentInstructionFrame.ts:156:function mapMode(trainingMode: TrainingMode | string, hasTarget: boolean, kind: CurrentInstructionFrameKind): CurrentInstructionMode {
lib/blundr/runtime/currentInstructionFrame.ts:243:  kind: CurrentInstructionFrameKind;
lib/blundr/runtime/currentInstructionFrame.ts:281:function isCanonicalBuildInput(input: BuildCurrentInstructionFrameInput): input is CanonicalBuildCurrentInstructionFrameInput {
lib/blundr/runtime/currentInstructionFrame.ts:295:  kind: CurrentInstructionFrameKind;
lib/blundr/runtime/currentInstructionFrame.ts:305:function buildCanonicalFrame(input: CanonicalBuildCurrentInstructionFrameInput): CurrentInstructionFrame {
lib/blundr/runtime/currentInstructionFrame.ts:515:export function buildCurrentInstructionFrame(input: BuildCurrentInstructionFrameInput): CurrentInstructionFrame {
lib/blundr/runtime/currentInstructionFrame.ts:520:  const legacyInput = input as LegacyBuildCurrentInstructionFrameInput;
lib/blundr/runtime/currentInstructionFrame.ts:546:    const kind: CurrentInstructionFrameKind = "opponent_replying";
lib/blundr/runtime/currentInstructionFrame.ts:570:    const kind: CurrentInstructionFrameKind = legacyInput.trainerPhase === "terminal" ? "terminal" : "transitioning";
lib/blundr/runtime/currentInstructionFrame.ts:612:      const kind = target.kind as CurrentInstructionFrameKind;
lib/blundr/runtime/currentInstructionFrame.ts:640:  const kind: CurrentInstructionFrameKind = "blocked";
lib/blundr/runtime/currentInstructionFrame.ts:685:export function isUserTurnTeachingFrame(frame: CurrentInstructionFrame): boolean {
lib/blundr/runtime/currentInstructionFrame.ts:693:export function isGuidedTeachingFrame(frame: CurrentInstructionFrame): boolean {
lib/blundr/runtime/currentInstructionFrame.ts:698:export function isContinuationTeachingFrame(frame: CurrentInstructionFrame): boolean {
lib/blundr/runtime/currentInstructionFrame.ts:703:export function getInstructionTargetOrNull(frame: CurrentInstructionFrame): CurrentInstructionTarget | null {
lib/blundr/runtime/currentInstructionFrame.ts:707:export function assertLockedInstructionTarget(frame: CurrentInstructionFrame): CurrentInstructionTarget {
lib/blundr/runtime/currentInstructionFrame.ts:710:    throw new Error("CurrentInstructionFrame has no locked instruction target.");
lib/blundr/runtime/currentInstructionFrame.ts:713:    throw new Error("CurrentInstructionFrame target is not locked.");
lib/blundr/runtime/currentInstructionFrame.ts:718:export function getFrameTargetSignature(frame: CurrentInstructionFrame): string {
lib/blundr/runtime/currentInstructionFrame.ts:727:  CurrentInstructionFrameKind,
lib/blundr/runtime/currentInstructionTarget.ts:20:export type CurrentInstructionFrameKind =
lib/blundr/runtime/instructionFrameLock.ts:5:  type CurrentInstructionFrame,
lib/blundr/runtime/instructionFrameLock.ts:25:export function createInstructionFrameLock(frame: CurrentInstructionFrame): InstructionFrameLock {
lib/blundr/runtime/instructionFrameLock.ts:36:  frame: CurrentInstructionFrame;
lib/blundr/runtime/instructionFrameLock.ts:102:export function assertFrameTargetLocked(frame: CurrentInstructionFrame): CurrentInstructionTarget {
tests/coach/antiHallucination.test.ts:2:import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
tests/coach/antiHallucination.test.ts:3:import { activateTeachingConcepts } from "../../lib/blundr/concepts/dynamicConceptActivator";
tests/coach/antiHallucination.test.ts:4:import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/antiHallucination.test.ts:42:  const frame = buildCurrentInstructionFrame({
tests/coach/antiHallucination.test.ts:58:  const graph = buildEvidenceGraph({ frame });
tests/coach/antiHallucination.test.ts:64:  const concepts = activateTeachingConcepts({ graph, mode: "assisted", maxConcepts: 40 });
tests/coach/browserContract.test.ts:15:    showMoreRevealsSameTarget: "After Show More, revealed visual target must equal CurrentInstructionFrame.target.",
tests/coach/currentInstructionFrame.test.ts:6:  buildCurrentInstructionFrame,
tests/coach/currentInstructionFrame.test.ts:15:export function testCurrentInstructionFrameRuntimeAuthority(): void {
tests/coach/currentInstructionFrame.test.ts:25:  const guided = buildCurrentInstructionFrame({
tests/coach/currentInstructionFrame.test.ts:39:  const lichess = buildCurrentInstructionFrame({
tests/coach/currentInstructionFrame.test.ts:57:  const adaptive = buildCurrentInstructionFrame({
tests/coach/currentInstructionFrame.test.ts:75:  const continuation = buildCurrentInstructionFrame({
tests/coach/currentInstructionFrame.test.ts:98:  const continuationUnlocked = buildCurrentInstructionFrame({
tests/coach/currentInstructionFrame.test.ts:117:  const opponent = buildCurrentInstructionFrame({
tests/coach/currentInstructionFrame.test.ts:128:  const opponentWithTarget = buildCurrentInstructionFrame({
tests/coach/currentInstructionFrame.test.ts:140:  const branchComplete = buildCurrentInstructionFrame({
tests/coach/currentInstructionFrame.test.ts:157:  const terminal = buildCurrentInstructionFrame({
tests/coach/currentInstructionFrame.test.ts:168:  const terminalWithTarget = buildCurrentInstructionFrame({
tests/coach/currentInstructionFrame.test.ts:182:  const changedTarget = buildCurrentInstructionFrame({
tests/coach/currentInstructionFrame.test.ts:200:  const changedFen = buildCurrentInstructionFrame({
tests/coach/currentInstructionFrame.test.ts:233:testCurrentInstructionFrameRuntimeAuthority();
tests/coach/dynamicConceptActivator.test.ts:3:import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
tests/coach/dynamicConceptActivator.test.ts:4:import { activateTeachingConcepts } from "../../lib/blundr/concepts/dynamicConceptActivator";
tests/coach/dynamicConceptActivator.test.ts:5:import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/dynamicConceptActivator.test.ts:15:  return buildCurrentInstructionFrame({
tests/coach/dynamicConceptActivator.test.ts:33:function activatedIds(activated: ReturnType<typeof activateTeachingConcepts>): string[] {
tests/coach/dynamicConceptActivator.test.ts:38:  const bc4Graph = buildEvidenceGraph({
tests/coach/dynamicConceptActivator.test.ts:48:  const bc4Activated = activateTeachingConcepts({ graph: bc4Graph, mode: "assisted", maxConcepts: 30 });
tests/coach/dynamicConceptActivator.test.ts:53:  const nf3Graph = buildEvidenceGraph({
tests/coach/dynamicConceptActivator.test.ts:61:  const nf3Activated = activateTeachingConcepts({ graph: nf3Graph, mode: "assisted", maxConcepts: 30 });
tests/coach/dynamicConceptActivator.test.ts:65:  const castleGraph = buildEvidenceGraph({
tests/coach/dynamicConceptActivator.test.ts:73:  const castleActivated = activateTeachingConcepts({ graph: castleGraph, mode: "assisted", maxConcepts: 30 });
tests/coach/dynamicConceptActivator.test.ts:77:  const e4Graph = buildEvidenceGraph({
tests/coach/dynamicConceptActivator.test.ts:85:  const e4Activated = activateTeachingConcepts({ graph: e4Graph, mode: "assisted", maxConcepts: 30 });
tests/coach/dynamicConceptActivator.test.ts:88:  const d4Graph = buildEvidenceGraph({
tests/coach/dynamicConceptActivator.test.ts:96:  const d4Activated = activateTeachingConcepts({ graph: d4Graph, mode: "assisted", maxConcepts: 30 });
tests/coach/dynamicConceptActivator.test.ts:99:  const branchCompleteFrame = buildCurrentInstructionFrame({
tests/coach/dynamicConceptActivator.test.ts:109:  const branchGraph = buildEvidenceGraph({ frame: branchCompleteFrame });
tests/coach/dynamicConceptActivator.test.ts:110:  const branchActivated = activateTeachingConcepts({ graph: branchGraph, mode: "assisted", maxConcepts: 20 });
tests/coach/dynamicConceptActivator.test.ts:125:  const opponentFrame = buildCurrentInstructionFrame({
tests/coach/dynamicConceptActivator.test.ts:134:  const opponentGraph = buildEvidenceGraph({ frame: opponentFrame });
tests/coach/dynamicConceptActivator.test.ts:135:  const opponentActivated = activateTeachingConcepts({ graph: opponentGraph, mode: "assisted", maxConcepts: 20 });
tests/coach/dynamicConceptActivator.test.ts:141:  const bc4Plain = activateTeachingConcepts({ graph: bc4Graph, mode: "plain", maxConcepts: 30 });
tests/coach/dynamicConceptActivator.test.ts:144:  const bc4ShowMore = activateTeachingConcepts({ graph: bc4Graph, mode: "show_more", maxConcepts: 30 });
tests/coach/evidenceGraph.test.ts:3:import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
tests/coach/evidenceGraph.test.ts:4:import { activateTeachingConcepts } from "../../lib/blundr/concepts/dynamicConceptActivator";
tests/coach/evidenceGraph.test.ts:5:import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/evidenceGraph.test.ts:15:  return buildCurrentInstructionFrame({
tests/coach/evidenceGraph.test.ts:33:export function testEvidenceGraph(): void {
tests/coach/evidenceGraph.test.ts:40:  const bc4 = buildEvidenceGraph({ frame: bc4Frame, openingKey: "italian_game", openingName: "Italian Game" });
tests/coach/evidenceGraph.test.ts:55:  const nf3 = buildEvidenceGraph({ frame: nf3Frame });
tests/coach/evidenceGraph.test.ts:65:  const castle = buildEvidenceGraph({ frame: castleFrame });
tests/coach/evidenceGraph.test.ts:75:  const e4 = buildEvidenceGraph({ frame: e4Frame });
tests/coach/evidenceGraph.test.ts:85:  const d4 = buildEvidenceGraph({ frame: d4Frame });
tests/coach/evidenceGraph.test.ts:94:  const capture = buildEvidenceGraph({ frame: captureFrame });
tests/coach/evidenceGraph.test.ts:103:  const check = buildEvidenceGraph({ frame: checkFrame });
tests/coach/evidenceGraph.test.ts:106:  const branchComplete = buildCurrentInstructionFrame({
tests/coach/evidenceGraph.test.ts:116:  const branchGraph = buildEvidenceGraph({ frame: branchComplete });
tests/coach/evidenceGraph.test.ts:120:  const opponent = buildCurrentInstructionFrame({
tests/coach/evidenceGraph.test.ts:129:  const opponentGraph = buildEvidenceGraph({ frame: opponent });
tests/coach/evidenceGraph.test.ts:138:  const illegal = buildEvidenceGraph({ frame: illegalFrame });
tests/coach/evidenceGraph.test.ts:147:  const conceptActivation = activateTeachingConcepts({ graph: bc4, mode: "assisted", maxConcepts: 10 });
tests/coach/evidenceGraph.test.ts:156:testEvidenceGraph();
tests/coach/goldenPositions.test.ts:4:import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
tests/coach/goldenPositions.test.ts:5:import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/goldenPositions.test.ts:73:      const nullFrame = buildCurrentInstructionFrame({
tests/coach/goldenPositions.test.ts:97:      const guidedFrame = buildCurrentInstructionFrame({
tests/coach/goldenPositions.test.ts:121:      const graph = buildEvidenceGraph({ frame: guidedFrame });
tests/coach/plainLeak.test.ts:2:import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
tests/coach/plainLeak.test.ts:3:import { activateTeachingConcepts } from "../../lib/blundr/concepts/dynamicConceptActivator";
tests/coach/plainLeak.test.ts:5:import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/plainLeak.test.ts:34:  const frame = buildCurrentInstructionFrame({
tests/coach/plainLeak.test.ts:50:  const graph = buildEvidenceGraph({ frame, openingKey: "italian_game", openingName: "Italian Game" });
tests/coach/plainLeak.test.ts:51:  const plainActivated = activateTeachingConcepts({ graph, mode: "plain", maxConcepts: 40 });
tests/coach/providerFailure.test.ts:7:import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
tests/coach/providerFailure.test.ts:8:import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/providerFailure.test.ts:45:  const nullFrame = buildCurrentInstructionFrame({
tests/coach/providerFailure.test.ts:55:  const nullGraph = buildEvidenceGraph({ frame: nullFrame });
tests/coach/targetInvariant.test.ts:5:import type { CurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/targetInvariant.test.ts:29:  const frame: CurrentInstructionFrame = {
tests/coach/teachingConceptRegistry.test.ts:3:import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
tests/coach/teachingConceptRegistry.test.ts:4:import { activateTeachingConcepts } from "../../lib/blundr/concepts/dynamicConceptActivator";
tests/coach/teachingConceptRegistry.test.ts:9:import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/teachingConceptRegistry.test.ts:27:  const frame = buildCurrentInstructionFrame({
tests/coach/teachingConceptRegistry.test.ts:43:  return buildEvidenceGraph({ frame, openingKey: "italian_game", openingName: "Italian Game" });
tests/coach/teachingConceptRegistry.test.ts:78:  const activated = activateTeachingConcepts({ graph, mode: "assisted", maxConcepts: 50 });
tests/coach/typeContracts.test.ts:8:import { assertLockedInstructionTarget, type CurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/typeContracts.test.ts:11:  const guidedFrame: CurrentInstructionFrame = {
tests/coach/typeContracts.test.ts:62:  const terminalFrame: CurrentInstructionFrame = {
tests/coach/typeContracts.test.ts:73:  const opponentFrame: CurrentInstructionFrame = {

## Step L Validation

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
✓ Compiled successfully in 8.2s
  Running TypeScript ...
  Finished TypeScript in 9.2s ...
  Collecting page data using 1 worker ...
  Generating static pages using 1 worker (0/3) ...
✓ Generating static pages using 1 worker (3/3) in 393ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/blundr-visual-model
├ ƒ /api/brain
└ ƒ /api/explorer


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand


$ node --import tsx tests/coach/coachCompiler.test.ts
coachCompiler ok

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

## Step O Final Verification

$ git status --short
 M lib/blundr/coachCompiler/types.ts
 M tests/coach/antiHallucination.test.ts
 M tests/coach/plainLeak.test.ts
 M tests/coach/showMoreVisualReveal.test.ts
 M tests/coach/targetInvariant.test.ts
 M tests/coach/typeContracts.test.ts
?? .agent_runs/v2.8.0-intelligent-coach/20260603_141148/
?? BLUNDR_v2.8.0_INTELLIGENT_COACH_LIVE_VERSION_ROADMAP.md
?? BLUNDR_v2.8.0_PACKAGE_0_CODEX_PROMPT.md
?? "docs/BLUNDR_v2.8.0 Foundation Stabilization Gate_AGENT_7_COACH_COMPILER_REPORT.md"
?? lib/blundr/coachCompiler/compileCoachFrame.ts
?? lib/blundr/coachCompiler/compilerDebug.ts
?? lib/blundr/coachCompiler/copyPolicy.ts
?? lib/blundr/coachCompiler/index.ts
?? lib/blundr/coachCompiler/revealActionBuilder.ts
?? lib/blundr/coachCompiler/slotBuilder.ts
?? lib/blundr/coachCompiler/templateRenderer.ts
?? lib/blundr/coachCompiler/visualIntentBuilder.ts
?? tests/coach/coachCompiler.test.ts

$ git diff --stat
 lib/blundr/coachCompiler/types.ts        | 148 +++++++++++++---------------
 tests/coach/antiHallucination.test.ts    |   6 ++
 tests/coach/plainLeak.test.ts            |  10 ++
 tests/coach/showMoreVisualReveal.test.ts |  52 +++++-----
 tests/coach/targetInvariant.test.ts      | 164 +++++--------------------------
 tests/coach/typeContracts.test.ts        |  51 ++++++----
 6 files changed, 167 insertions(+), 264 deletions(-)
