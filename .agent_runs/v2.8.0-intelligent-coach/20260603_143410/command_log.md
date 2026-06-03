# Package 8 Command Log

## Step A Inspection

$ git branch --show-current
v2.8.0-intelligent-coach-live

$ git status --short
?? .agent_runs/v2.8.0-intelligent-coach/20260603_143410/
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
lib/blundr/coachCompiler/compileCoachFrame.ts
lib/blundr/coachCompiler/compilerDebug.ts
lib/blundr/coachCompiler/copyPolicy.ts
lib/blundr/coachCompiler/index.ts
lib/blundr/coachCompiler/revealActionBuilder.ts
lib/blundr/coachCompiler/slotBuilder.ts
lib/blundr/coachCompiler/templateRenderer.ts
lib/blundr/coachCompiler/types.ts
lib/blundr/coachCompiler/visualIntentBuilder.ts
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
tests/coach/coachCompiler.test.ts
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

$ git grep -n "CoachSafetyGate\|CoachSafetyResult\|criticalIssues\|plain leak\|target mismatch\|provider authority\|safeFallback" lib app components tests || true
app/page.tsx:191:  criticalIssuesAtFrame: string[];
app/page.tsx:1851:      const safeFallback=instructionTarget?buildUserFacingTargetFallback({
app/page.tsx:1866:        title:safeFallback?.title??"Suggested continuation",
app/page.tsx:1867:        body:safeFallback?.body??"A verified continuation is available.",
app/page.tsx:1875:        debug:normalizeCoachDebugMetadata({...(rawCoachDecision?.debug??{}),...coachDebugBase,phaseActionGate,coachIntent:"show_continued_plan",candidateCoachFallbackUsed:true,candidateCoachFallbackReason:"missing_template_or_silent_generic_candidate",coachSelectedCandidateMove:currentSelectedCandidateUci,coachDecisionSource:"verified_safe_fallback",selectedTheme:safeFallback?.theme,coachQuality:safeFallback?.quality,fallbackReason:safeFallback?.reason??"candidate_safe_fallback"}),
app/page.tsx:1899:      const safeFallback=buildUserFacingTargetFallback({
app/page.tsx:1912:        title:safeFallback.title,
app/page.tsx:1913:        body:safeFallback.body,
app/page.tsx:1922:          selectedTheme:safeFallback.theme,
app/page.tsx:1923:          coachQuality:safeFallback.quality,
app/page.tsx:1947:      const safeFallback=buildUserFacingTargetFallback({
app/page.tsx:1960:        title:out.title==="Analyzing continuation"?out.title:safeFallback.title,
app/page.tsx:1961:        body:safeFallback.body,
app/page.tsx:1969:          selectedTheme:safeFallback.theme,
app/page.tsx:1970:          coachQuality:safeFallback.quality,
app/page.tsx:2266:      criticalIssuesAtFrame:runtimeCriticalIssues.slice(),
components/debug/BlundrDiagnosticsPanel.tsx:64:criticalIssues: ${JSON.stringify(snapshot.health.criticalIssues)}
components/debug/BlundrDiagnosticsPanel.tsx:87:    const critical = (snapshot?.health.criticalIssues.length ?? 0) > 0;
components/debug/BlundrDiagnosticsPanel.tsx:92:      actions: status(Boolean(snapshot?.health.criticalIssues.some((issue) => issue.includes("Action"))), false),
components/debug/BlundrDiagnosticsPanel.tsx:93:      continuation: status(Boolean(snapshot?.health.criticalIssues.some((issue) => issue.includes("Continuation"))), Boolean(snapshot?.continuation.isContinuationMode && snapshot?.continuation.continuationLinesPassedToBoard === 0)),
components/debug/BlundrDiagnosticsPanel.tsx:108:      if (timelineFilter === "critical") return Array.isArray(entry?.criticalIssuesAtFrame) && entry.criticalIssuesAtFrame.length > 0;
components/debug/BlundrDiagnosticsPanel.tsx:130:      framesWithCriticalIssues: coachTimeline.filter((entry: any) => Array.isArray(entry?.criticalIssuesAtFrame) && entry.criticalIssuesAtFrame.length > 0).map((entry: any) => ({
components/debug/BlundrDiagnosticsPanel.tsx:132:        issues: entry?.criticalIssuesAtFrame,
components/debug/BlundrDiagnosticsPanel.tsx:143:        Blundr Diagnostics {snapshot.health.criticalIssues.length ? `(${snapshot.health.criticalIssues.length})` : ""}
lib/blundr/brain/analyzeBlundrPosition.ts:115:    safeFallbackCopy: input.currentInstructionFrame?.target ? buildSafeFallbackCopy(input.currentInstructionFrame.target) : null,
lib/blundr/brain/types.ts:231:  safeFallbackCopy: {
lib/blundr/coach/coachSafety.ts:46:export type CoachSafetyResult = {
lib/blundr/coach/coachSafety.ts:70:export function validateCoachCopyEntry(entry: CoachCopyEntry): CoachSafetyResult {
lib/blundr/coach/coachSafety.ts:82:export function validateCoachDecision(context: CoachContext, decision: CoachDecision): CoachSafetyResult {
lib/blundr/coachBrain/coachExplanationPipeline.ts:132:export type CoachSafetyResult = {
lib/blundr/coachBrain/coachExplanationPipeline.ts:566:): CoachSafetyResult {
lib/blundr/coachBrain/coachExplanationPipeline.ts:588:  safety: CoachSafetyResult;
lib/blundr/coachBrain/coachExplanationPipeline.ts:623:  safetyResult: CoachSafetyResult;
lib/blundr/coachCompiler/compilerDebug.ts:13:  criticalIssues: string[];
lib/blundr/coachCompiler/compilerDebug.ts:16:  const criticalIssues: string[] = [];
lib/blundr/coachCompiler/compilerDebug.ts:23:    criticalIssues.push(`frame/graph target mismatch: frame=${frameTarget ?? "null"}, graph=${graphTarget ?? "null"}`);
lib/blundr/coachCompiler/compilerDebug.ts:27:    criticalIssues.push(`frame/compiled target mismatch: frame=${frameTarget ?? "null"}, compiled=${input.compiledTargetUci ?? "null"}`);
lib/blundr/coachCompiler/compilerDebug.ts:31:    criticalIssues.push("visual target mismatch against frame target");
lib/blundr/coachCompiler/compilerDebug.ts:35:    criticalIssues.push("reveal target mismatch against frame target");
lib/blundr/coachCompiler/compilerDebug.ts:40:      criticalIssues.push("null-target frame contains target-specific visual intent");
lib/blundr/coachCompiler/compilerDebug.ts:43:      criticalIssues.push("null-target frame contains target reveal");
lib/blundr/coachCompiler/compilerDebug.ts:56:    warnings.push("plain leak suspected");
lib/blundr/coachCompiler/compilerDebug.ts:59:  return { criticalIssues, warnings };
lib/blundr/coachCompiler/types.ts:70:    criticalIssues: string[];
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:602:      frame.debugSnapshot.health.criticalIssues.includes(issue),
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:604:      `${label}: unexpected critical issue ${issue} (${frame.debugSnapshot.health.criticalIssues.join(", ")})`,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:660:  assert.equal(frame.debugSnapshot.health.criticalIssues.includes("stale_selected_candidate"), false, `${label}: stale selected candidate should not remain in health`);
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:833:  assert.equal(afterSideline.debugSnapshot.health.criticalIssues.includes("restricted_line_exhausted_but_completion_blocked"), false);
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:964:  assert.equal(providedBranchRestricted.debugSnapshot.health.criticalIssues.includes("restricted_user_turn_missing_expected_move"), false);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:30:  assert.equal(snapshot.health.criticalIssues.length > 0, true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:46:  assert.equal(continuation.health.criticalIssues.includes("continuation_candidate_not_rendered"), true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:47:  assert.equal(continuation.health.criticalIssues.includes("continuation_user_turn_target_without_visual"), false);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:61:  assert.equal(reveal.health.criticalIssues.some((issue) => issue.includes("Action click")), true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:75:  assert.equal(unresolved.health.criticalIssues.includes("restricted_user_turn_missing_expected_move"), true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:91:  assert.equal(unresolvedWithTransition.health.criticalIssues.includes("restricted_user_turn_missing_expected_move"), false);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:92:  assert.equal(unresolvedWithTransition.health.criticalIssues.includes("branch_transition_surface_missing_payload"), false);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:127:  assert.equal(continuationHealthy.health.criticalIssues.includes("continuation_candidate_not_rendered"), false);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:128:  assert.equal(continuationHealthy.health.criticalIssues.includes("generic_context_rendered_with_candidate"), false);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:129:  assert.equal(continuationHealthy.health.criticalIssues.includes("instruction_target_coach_mismatch"), false);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:130:  assert.equal(continuationHealthy.health.criticalIssues.includes("instruction_target_visual_mismatch"), false);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:131:  assert.equal(continuationHealthy.health.criticalIssues.includes("instruction_target_reveal_mismatch"), false);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:148:  assert.equal(idempotentReveal.health.criticalIssues.some((issue) => issue.includes("Action click")), false);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:167:  assert.equal(pieceMismatch.health.criticalIssues.includes("instruction_piece_type_mismatch"), true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:168:  assert.equal(pieceMismatch.health.criticalIssues.includes("coach_piece_mismatch"), true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:188:  assert.equal(recentUnsafe.health.criticalIssues.includes("recent_unverified_piece_claim"), true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:189:  assert.equal(recentUnsafe.health.criticalIssues.includes("recent_coach_piece_mismatch"), true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:190:  assert.equal(recentUnsafe.health.criticalIssues.includes("recent_repeated_generic_coach_copy"), true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:208:  assert.equal(recipeMismatch.health.criticalIssues.includes("visual_recipe_target_mismatch"), true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:229:  assert.equal(staleFrames.health.criticalIssues.includes("stale_coach_frame"), true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:230:  assert.equal(staleFrames.health.criticalIssues.includes("stale_visual_frame"), true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:231:  assert.equal(staleFrames.health.criticalIssues.includes("stale_reveal_target"), true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:232:  assert.equal(staleFrames.health.criticalIssues.includes("overlay_frame_lag_detected"), true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:252:  assert.equal(opponentPending.health.criticalIssues.includes("stale_opponent_reply_commit"), false);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:269:  assert.equal(afterOpponentCommit.health.criticalIssues.includes("stale_opponent_reply_commit"), false);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:330:  assert.deepEqual(nextUser.health.criticalIssues, []);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:359:  assert.equal(provenanceMismatch.health.criticalIssues.includes("coach_theme_opportunity_mismatch"), true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:360:  assert.equal(provenanceMismatch.health.criticalIssues.includes("coach_template_theme_mismatch"), true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:361:  assert.equal(provenanceMismatch.health.criticalIssues.includes("coach_score_missing"), true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:402:  assert.equal(provenanceHealthy.health.criticalIssues.includes("coach_theme_opportunity_mismatch"), false);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:403:  assert.equal(provenanceHealthy.health.criticalIssues.includes("coach_template_theme_mismatch"), false);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:404:  assert.equal(provenanceHealthy.health.criticalIssues.includes("coach_score_missing"), false);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:423:  assert.equal(fallbackMismatch.health.criticalIssues.includes("coach_provenance_inconsistent"), true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:464:  assert.equal(preContinue.health.criticalIssues.includes("continuation_candidate_not_rendered"), false);
lib/blundr/debug/trainerDebugSnapshot.ts:100:  const criticalIssues: string[] = [];
lib/blundr/debug/trainerDebugSnapshot.ts:132:  if (input.trainerPhase === "transitioning") criticalIssues.push("illegal_transitioning_phase");
lib/blundr/debug/trainerDebugSnapshot.ts:133:  if (input.trainerPhase === "opponent_animating") criticalIssues.push("illegal_transitioning_phase");
lib/blundr/debug/trainerDebugSnapshot.ts:135:    criticalIssues.push("opponent_reply_pending_too_long");
lib/blundr/debug/trainerDebugSnapshot.ts:138:    criticalIssues.push("line_complete_surface_missing");
lib/blundr/debug/trainerDebugSnapshot.ts:150:    criticalIssues.push("terminal_surface_missing");
lib/blundr/debug/trainerDebugSnapshot.ts:158:  ) criticalIssues.push("restricted_user_turn_missing_expected_move");
lib/blundr/debug/trainerDebugSnapshot.ts:162:  ) criticalIssues.push("branch_transition_surface_missing_payload");
lib/blundr/debug/trainerDebugSnapshot.ts:170:  ) criticalIssues.push("restricted_line_exhausted_but_completion_blocked");
lib/blundr/debug/trainerDebugSnapshot.ts:171:  if (input.trainingMode === "restricted" && expectedMoveResolution.source === "engine_preview_fallback" && !expectedMoveResolution.debug?.engineFallbackInRestrictedUsed) criticalIssues.push("expected_move_source_engine_used_in_restricted_without_policy");
lib/blundr/debug/trainerDebugSnapshot.ts:178:  if (expectedMoveResolution.source === "opening_family_plan" && !expectedMoveResolution.debug?.openingFamilyPlanType) criticalIssues.push("opening_family_plan_used_without_plan_or_feature");
lib/blundr/debug/trainerDebugSnapshot.ts:180:  if (selectedOpportunityMoveExists && !expectedMoveResolution.expectedMoveUci && input.trainingMode === "restricted") criticalIssues.push("selectedOpportunityMoveSan exists but expectedMoveUci null");
lib/blundr/debug/trainerDebugSnapshot.ts:181:  if (expectedMoveExists && coachDebug.selectedOpportunityLayer === "fallback") criticalIssues.push("expectedMove exists but fallback opportunity selected");
lib/blundr/debug/trainerDebugSnapshot.ts:182:  if (input.coachDecision?.title === "Opening pattern" && expectedMoveExists && coachFailureKind !== "none") criticalIssues.push("Opening pattern title is paired with a suspicious/fallback coach decision");
lib/blundr/debug/trainerDebugSnapshot.ts:183:  if (/Improve the knight/i.test(String(input.coachDecision?.body ?? "")) && input.expectedMoveUci && !["b", "g"].includes(String(input.expectedMoveUci)[0])) criticalIssues.push("Knight improvement copy shown for non-knight expected move");
lib/blundr/debug/trainerDebugSnapshot.ts:184:  if (input.lastActionDebug?.lastClickedAction && input.lastActionDebug?.stateChanged === false && !input.lastActionDebug?.revealIdempotentNoop) criticalIssues.push("Action click did not change state");
lib/blundr/debug/trainerDebugSnapshot.ts:185:  if (input.trainingMode === "continuation" && input.selectedCandidateUci && input.coachDecision?.exactMoveAllowed && continuationLinesPassedToBoard === 0) criticalIssues.push("continuation_candidate_not_rendered");
lib/blundr/debug/trainerDebugSnapshot.ts:189:  if (continuationTerminalDetected && continuationRuntimeStatus !== "terminal") criticalIssues.push("continuation_terminal_not_classified");
lib/blundr/debug/trainerDebugSnapshot.ts:190:  if (continuationTerminalDetected && presentationCoach.owner !== "intent_first_coach" && presentationCoach.owner !== "continuation_terminal_surface" && presentationCoach.shouldRender !== true) criticalIssues.push("terminal_position_without_terminal_surface");
lib/blundr/debug/trainerDebugSnapshot.ts:191:  if (input.trainingMode === "continuation" && input.userExplicitlyEnteredContinuation && (continuationRuntimeStatus === "idle" || input.continuationAnalysisStatus === "idle") && !continuationTerminalDetected) criticalIssues.push("continuation_idle_after_continue");
lib/blundr/debug/trainerDebugSnapshot.ts:192:  if (input.trainingMode === "continuation" && input.trainerPhase === "transitioning" && !["analyzing", "opponent_replying", "terminal"].includes(String(continuationRuntimeStatus))) criticalIssues.push("transition_state_without_pending_work");
lib/blundr/debug/trainerDebugSnapshot.ts:193:  if (isTeachingFrame(input) && instructionTargetUci == null && !branchTransitionSurfaceRendered) criticalIssues.push("instruction_target_missing_on_teaching_frame");
lib/blundr/debug/trainerDebugSnapshot.ts:195:    criticalIssues.push("user_turn_missing_instruction_target");
lib/blundr/debug/trainerDebugSnapshot.ts:196:    criticalIssues.push("ready_for_user_without_target");
lib/blundr/debug/trainerDebugSnapshot.ts:198:  if (instructionTargetUci && presentationCoach.shouldRender === false && !branchTransitionSurfaceRendered) criticalIssues.push("coach_missing_for_instruction_target");
lib/blundr/debug/trainerDebugSnapshot.ts:199:  if (instructionTargetUci && presentationCoach.shouldRender === false && !branchTransitionSurfaceRendered) criticalIssues.push("silent_coach_with_instruction_target");
lib/blundr/debug/trainerDebugSnapshot.ts:200:  if (instructionTargetUci && containsDebugLeak) criticalIssues.push("debug_copy_leaked_to_user");
lib/blundr/debug/trainerDebugSnapshot.ts:202:    criticalIssues.push("coach_move_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:203:    criticalIssues.push("instruction_target_coach_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:207:    if (input.visibleTeachingSurface.safety.targetMismatch || input.visibleTeachingSurface.debug?.fourTargetMismatch) criticalIssues.push("surface_target_mismatch_blocked");
lib/blundr/debug/trainerDebugSnapshot.ts:208:    if (input.visibleTeachingSurface.safety.pieceMismatch || input.visibleTeachingSurface.debug?.twoPieceTypeMismatch) criticalIssues.push("surface_piece_mismatch_blocked");
lib/blundr/debug/trainerDebugSnapshot.ts:209:    if (input.visibleTeachingSurface.safety.plainLeakDetected) criticalIssues.push("plain_leak_detected_and_blocked");
lib/blundr/debug/trainerDebugSnapshot.ts:210:    if (input.visibleTeachingSurface.safety.legacyBypassDetected) criticalIssues.push("surface_legacy_bypass_flagged");
lib/blundr/debug/trainerDebugSnapshot.ts:213:    criticalIssues.push("visual_target_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:214:    criticalIssues.push("instruction_target_visual_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:217:    criticalIssues.push("reveal_target_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:218:    criticalIssues.push("instruction_target_reveal_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:221:    criticalIssues.push("presentation_debug_disagreement");
lib/blundr/debug/trainerDebugSnapshot.ts:224:    criticalIssues.push("coach_piece_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:225:    criticalIssues.push("instruction_piece_type_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:231:    if (featureStatus === "not_exposed_from_module") criticalIssues.push("missing_feature_pipeline");
lib/blundr/debug/trainerDebugSnapshot.ts:232:    if (planStatus === "not_exposed_from_module") criticalIssues.push("missing_plan_pipeline");
lib/blundr/debug/trainerDebugSnapshot.ts:233:    if (oppStatus === "not_exposed_from_module") criticalIssues.push("missing_opportunity_pipeline");
lib/blundr/debug/trainerDebugSnapshot.ts:234:    if ((coachQuality.targetAligned ?? (coachMoveUci === instructionTargetUci)) !== true) criticalIssues.push("coach_target_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:235:    if ((coachQuality.pieceAligned ?? (!instructionTargetPieceType || !coachPieceType || instructionTargetPieceType === coachPieceType)) !== true) criticalIssues.push("coach_piece_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:240:      if (score < required) criticalIssues.push("coach_low_quality");
lib/blundr/debug/trainerDebugSnapshot.ts:242:    if (selectedOpportunityScore == null) criticalIssues.push("coach_score_missing");
lib/blundr/debug/trainerDebugSnapshot.ts:244:      criticalIssues.push("coach_theme_opportunity_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:245:      criticalIssues.push("coach_provenance_inconsistent");
lib/blundr/debug/trainerDebugSnapshot.ts:248:      criticalIssues.push("coach_template_theme_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:249:      criticalIssues.push("coach_provenance_inconsistent");
lib/blundr/debug/trainerDebugSnapshot.ts:266:    if (coachSource === "verified_safe_fallback" && !runtimeSafeFallbackUsed) criticalIssues.push("coach_provenance_inconsistent");
lib/blundr/debug/trainerDebugSnapshot.ts:267:    if (runtimeSafeFallbackUsed && !qualityUsedFallback) criticalIssues.push("coach_provenance_inconsistent");
lib/blundr/debug/trainerDebugSnapshot.ts:269:      criticalIssues.push("coach_provenance_inconsistent");
lib/blundr/debug/trainerDebugSnapshot.ts:281:  if (instructionTargetUci && !featurePipelineConnected && !coachDebug.pipelineBypassReason) criticalIssues.push("feature_pipeline_not_connected");
lib/blundr/debug/trainerDebugSnapshot.ts:282:  if (instructionTargetUci && !planPipelineConnected && !coachDebug.pipelineBypassReason) criticalIssues.push("plan_pipeline_not_connected");
lib/blundr/debug/trainerDebugSnapshot.ts:283:  if (instructionTargetUci && !opportunityPipelineConnected && !coachDebug.pipelineBypassReason) criticalIssues.push("opportunity_pipeline_not_connected");
lib/blundr/debug/trainerDebugSnapshot.ts:284:  if (instructionTargetUci && !explanationPipelineConnected && !coachDebug.pipelineBypassReason) criticalIssues.push("explanation_pipeline_not_connected");
lib/blundr/debug/trainerDebugSnapshot.ts:285:  if (instructionTargetUci && visualRecipeMoveUci && visualRecipeMoveUci !== instructionTargetUci) criticalIssues.push("visual_recipe_target_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:286:  if (instructionTargetUci && revealTargetSource && revealTargetSource !== "instruction_target") criticalIssues.push("reveal_target_source_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:287:  if (input.coachFrameStale) criticalIssues.push("stale_coach_frame");
lib/blundr/debug/trainerDebugSnapshot.ts:288:  if (input.visualFrameStale) criticalIssues.push("stale_visual_frame");
lib/blundr/debug/trainerDebugSnapshot.ts:289:  if (input.revealTargetStale) criticalIssues.push("stale_reveal_target");
lib/blundr/debug/trainerDebugSnapshot.ts:290:  if (input.overlayFrameLagDetected) criticalIssues.push("overlay_frame_lag_detected");
lib/blundr/debug/trainerDebugSnapshot.ts:292:    criticalIssues.push("continuation_candidate_not_rendered");
lib/blundr/debug/trainerDebugSnapshot.ts:293:    criticalIssues.push("continuation_user_turn_target_without_visual");
lib/blundr/debug/trainerDebugSnapshot.ts:294:    criticalIssues.push("assisted_view_target_without_visual");
lib/blundr/debug/trainerDebugSnapshot.ts:297:    criticalIssues.push("continuation_analysis_ready_without_target");
lib/blundr/debug/trainerDebugSnapshot.ts:298:    criticalIssues.push("continuation_user_turn_without_candidate");
lib/blundr/debug/trainerDebugSnapshot.ts:300:  if (instructionTargetUci && coachDebug.candidateCoachFallbackUsed && !coachDebug.coachVerifiedFactsUsed) criticalIssues.push("generic_fallback_without_verified_facts");
lib/blundr/debug/trainerDebugSnapshot.ts:301:  if (instructionTargetUci && String(input.trainerView) === "assisted" && !visualMoveUci) criticalIssues.push("assisted_view_target_without_visual");
lib/blundr/debug/trainerDebugSnapshot.ts:302:  if (instructionTargetUci && String(input.trainerView) === "assisted" && !visualMoveUci) criticalIssues.push("missing_visual_for_instruction_target");
lib/blundr/debug/trainerDebugSnapshot.ts:305:    criticalIssues.push("unsafe_template_rendered");
lib/blundr/debug/trainerDebugSnapshot.ts:307:      if (claim.includes("unverified_piece_claim")) criticalIssues.push("unverified_piece_claim");
lib/blundr/debug/trainerDebugSnapshot.ts:308:      if (claim.includes("unverified_development_claim")) criticalIssues.push("unverified_development_claim");
lib/blundr/debug/trainerDebugSnapshot.ts:309:      if (claim.includes("unverified_diagonal_claim")) criticalIssues.push("unverified_diagonal_claim");
lib/blundr/debug/trainerDebugSnapshot.ts:310:      if (claim.includes("unverified_center_tension_claim")) criticalIssues.push("unverified_center_tension_claim");
lib/blundr/debug/trainerDebugSnapshot.ts:311:      if (claim.includes("unverified_pressure_claim")) criticalIssues.push("unverified_pressure_claim");
lib/blundr/debug/trainerDebugSnapshot.ts:312:      if (claim.includes("unverified_king_safety_claim")) criticalIssues.push("unverified_king_safety_claim");
lib/blundr/debug/trainerDebugSnapshot.ts:313:      if (claim.includes("template_claim_not_supported_by_move_fact")) criticalIssues.push("template_claim_not_supported_by_move_fact");
lib/blundr/debug/trainerDebugSnapshot.ts:314:      if (claim.includes("debug_copy_leaked_to_user")) criticalIssues.push("debug_copy_leaked_to_user");
lib/blundr/debug/trainerDebugSnapshot.ts:315:      if (claim.includes("unsafe_unverified_coach_claim")) criticalIssues.push("unsafe_unverified_coach_claim");
lib/blundr/debug/trainerDebugSnapshot.ts:322:      criticalIssues.push("recent_unverified_piece_claim");
lib/blundr/debug/trainerDebugSnapshot.ts:323:      criticalIssues.push("recent_coach_piece_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:326:      criticalIssues.push("recent_unverified_piece_claim");
lib/blundr/debug/trainerDebugSnapshot.ts:327:      criticalIssues.push("recent_coach_piece_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:330:      criticalIssues.push("recent_unverified_piece_claim");
lib/blundr/debug/trainerDebugSnapshot.ts:333:      criticalIssues.push("recent_unverified_piece_claim");
lib/blundr/debug/trainerDebugSnapshot.ts:336:      criticalIssues.push("recent_unverified_piece_claim");
lib/blundr/debug/trainerDebugSnapshot.ts:338:    if (record?.coachMoveUci && record?.instructionTargetUci && record.coachMoveUci !== record.instructionTargetUci) criticalIssues.push("recent_template_target_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:339:    if (record?.visualMoveUci && record?.instructionTargetUci && record.visualMoveUci !== record.instructionTargetUci) criticalIssues.push("recent_template_target_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:340:    if (record?.revealTargetUci && record?.instructionTargetUci && record.revealTargetUci !== record.instructionTargetUci) criticalIssues.push("recent_template_target_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:354:      criticalIssues.push("recent_repeated_generic_coach_copy");
lib/blundr/debug/trainerDebugSnapshot.ts:357:  if (presentationCoach.shouldRender && visibleCoachIntent === "silent") criticalIssues.push("visible_coach_with_silent_intent");
lib/blundr/debug/trainerDebugSnapshot.ts:358:  if (input.trainingMode === "continuation" && input.selectedCandidateUci && visibleTitle === "Position context" && !branchTransitionSurfaceRendered) criticalIssues.push("generic_context_rendered_with_candidate");
lib/blundr/debug/trainerDebugSnapshot.ts:359:  if (input.trainingMode === "continuation" && input.selectedCandidateUci && presentationCoach.shouldRender && visibleCoachOwner !== "branch_transition_surface" && !coachDebug.selectedOpportunityId && !coachDebug.selectedTemplateId && !coachDebug.mappingTemplateId && !coachDebug.candidateCoachFallbackUsed) criticalIssues.push("visible_coach_missing_template_and_opportunity");
lib/blundr/debug/trainerDebugSnapshot.ts:360:  if (input.staleSelectedCandidateDetected) criticalIssues.push("stale_selected_candidate");
lib/blundr/debug/trainerDebugSnapshot.ts:361:  if (input.trainingMode === "continuation" && !input.userExplicitlyEnteredContinuation && !guidedCoveragePolicy.guidedCompleteAllowed && (input.moveHistory?.length ?? 0) < (guidedCoveragePolicy.minimumGuidedDepthPly ?? 8)) criticalIssues.push("premature_continuation_transition");
lib/blundr/debug/trainerDebugSnapshot.ts:362:  if (input.bookComplete && !guidedCoveragePolicy.guidedCompleteAllowed) criticalIssues.push("book_complete_without_policy");
lib/blundr/debug/trainerDebugSnapshot.ts:363:  if (input.visualRecipe && input.visualReady === false && !presentation.visual?.shouldRender && input.visualRecipeOverlay?.adapterAllowed) criticalIssues.push("VisualRecipe exists but visual did not render while legacy ready was false");
lib/blundr/debug/trainerDebugSnapshot.ts:364:  if (input.coachSurfacePolicyAffectsVisualLayer) criticalIssues.push("Coach surface policy affected visual layer");
lib/blundr/debug/trainerDebugSnapshot.ts:365:  if (input.coachMemoryLegacyDetected && !input.memoryMigratedOrCleared) criticalIssues.push("legacy_memory_not_migrated");
lib/blundr/debug/trainerDebugSnapshot.ts:367:    for (const issue of input.runtimeCriticalIssues.map(String)) criticalIssues.push(issue);
lib/blundr/debug/trainerDebugSnapshot.ts:386:  const uniqueCriticalIssues = Array.from(new Set(criticalIssues));
lib/blundr/debug/trainerDebugSnapshot.ts:836:      criticalIssues: uniqueCriticalIssues,
lib/blundr/debug/trainerDebugSnapshot.ts:839:        visualRecipeIndependent: !criticalIssues.some((issue) => issue.includes("VisualRecipe exists")),
lib/blundr/debug/trainerDebugTypes.ts:84:    criticalIssues: string[];
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:275:  if (!leakYes) throw new Error("detector must flag plain leak text");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:390:  if (!brain.safeFallbackCopy || brain.safeFallbackCopy.pieceType !== "p" || brain.safeFallbackCopy.targetUci !== "e2e4") {
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:391:    throw new Error("Brain safeFallbackCopy must exist with pieceType and targetUci from instruction target");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:395:  if (brain.safeFallbackCopy!.pieceType !== brain.currentTarget.pieceType) {
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:400:  const copyText = (brain.safeFallbackCopy!.title + " " + brain.safeFallbackCopy!.body + " " + (brain.safeFallbackCopy!.hint || "")).toLowerCase();
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:405:  if (!brain.safeFallbackCopy!.isSafe) throw new Error("safeFallbackCopy.isSafe must be true");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:406:  if (brain.safeFallbackCopy!.evidenceClaims.length === 0) throw new Error("safe copy must be evidence-backed");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:456:  const fb = brain.safeFallbackCopy!;
lib/blundr/presentation/buildVisibleTeachingSurface.ts:14: * 2. target mismatch (any consumer vs instruction target) → safety.blocked=true + full suppress of coach body/visuals/hint/showMore content.
lib/blundr/presentation/buildVisibleTeachingSurface.ts:52: * Agent 6 plain leak detector (runtime guard, pre-showMore Plain View).
lib/blundr/presentation/buildVisibleTeachingSurface.ts:325:  // === Agent 6 early plain leak pre-scan (after ladder, before decisions) for early safety block on plain pre ===
lib/blundr/presentation/buildVisibleTeachingSurface.ts:396:  // Agent 6: if (final) plain leak detected → ensure blocked
lib/blundr/presentation/trainerPresentationFrame.ts:183:  // CurrentInstructionFrame.target -> BlundrBrainAnalysis.safeFallbackCopy (piece-matched, evidence-backed, no halluc) -> TrainerPresentationFrame -> VisibleTeachingSurface
lib/blundr/presentation/trainerPresentationFrame.ts:185:  const brainCopy = input.brainAnalysis?.safeFallbackCopy;
lib/blundr/presentation/types.ts:46:    criticalIssues: string[];
lib/blundr/safety/types.ts:22:export interface CoachSafetyResult {
lib/blundr/safety/types.ts:25:  criticalIssues: CoachSafetyIssue[];
tests/coach/antiHallucination.test.ts:39:  const safeFallback = "This move improves piece activity and keeps your position solid.";
tests/coach/antiHallucination.test.ts:40:  assert.equal(mayUseCopy(safeFallback, []), true);
tests/coach/coachCompiler.test.ts:141:    mismatchCompiled.safetyPrecheck.criticalIssues.some((issue) => issue.includes("frame/graph target mismatch")),
tests/coach/typeContracts.test.ts:151:  const safeFallbackSurface: VisibleTeachingSurface = {
tests/coach/typeContracts.test.ts:169:      criticalIssues: ["type_claim_without_evidence"],
tests/coach/typeContracts.test.ts:174:  assert.equal(safeFallbackSurface.targetUci, null);
tests/coach/typeContracts.test.ts:225:      criticalIssues: [],

$ git grep -n "CompiledCoachFrame\|compileCoachFrame\|CurrentInstructionFrame\|EvidenceGraph\|ActivatedTeachingConcept" lib/blundr tests/coach || true
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
lib/blundr/coachCompiler/compileCoachFrame.ts:1:import type { EvidenceGraph } from "../brain/types";
lib/blundr/coachCompiler/compileCoachFrame.ts:2:import type { ActivatedTeachingConcept } from "../concepts/TeachingConcept";
lib/blundr/coachCompiler/compileCoachFrame.ts:3:import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
lib/blundr/coachCompiler/compileCoachFrame.ts:9:import type { CompiledCoachFrame, CompiledCoachTextBlock } from "./types";
lib/blundr/coachCompiler/compileCoachFrame.ts:14:function highestConcept(activatedConcepts: ActivatedTeachingConcept[]): ActivatedTeachingConcept | null {
lib/blundr/coachCompiler/compileCoachFrame.ts:18:function evidenceClaimIdsFromConcepts(activatedConcepts: ActivatedTeachingConcept[]): string[] {
lib/blundr/coachCompiler/compileCoachFrame.ts:22:function hasVerifiedSupportForStrongWords(graph: EvidenceGraph, evidenceClaimIds: string[]): boolean {
lib/blundr/coachCompiler/compileCoachFrame.ts:28:  frame: CurrentInstructionFrame;
lib/blundr/coachCompiler/compileCoachFrame.ts:29:  graph: EvidenceGraph;
lib/blundr/coachCompiler/compileCoachFrame.ts:30:  activatedConcepts: ActivatedTeachingConcept[];
lib/blundr/coachCompiler/compileCoachFrame.ts:89:  frame: CurrentInstructionFrame;
lib/blundr/coachCompiler/compileCoachFrame.ts:90:  graph: EvidenceGraph;
lib/blundr/coachCompiler/compileCoachFrame.ts:91:  activatedConcepts: ActivatedTeachingConcept[];
lib/blundr/coachCompiler/compileCoachFrame.ts:129:  frame: CurrentInstructionFrame;
lib/blundr/coachCompiler/compileCoachFrame.ts:130:  graph: EvidenceGraph;
lib/blundr/coachCompiler/compileCoachFrame.ts:131:  activatedConcepts: ActivatedTeachingConcept[];
lib/blundr/coachCompiler/compileCoachFrame.ts:174:export function compileCoachFrame(input: {
lib/blundr/coachCompiler/compileCoachFrame.ts:175:  frame: CurrentInstructionFrame;
lib/blundr/coachCompiler/compileCoachFrame.ts:176:  graph: EvidenceGraph;
lib/blundr/coachCompiler/compileCoachFrame.ts:177:  activatedConcepts: ActivatedTeachingConcept[];
lib/blundr/coachCompiler/compileCoachFrame.ts:179:}): CompiledCoachFrame {
lib/blundr/coachCompiler/compilerDebug.ts:1:import type { EvidenceGraph } from "../brain/types";
lib/blundr/coachCompiler/compilerDebug.ts:2:import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
lib/blundr/coachCompiler/compilerDebug.ts:7:  frame: CurrentInstructionFrame;
lib/blundr/coachCompiler/compilerDebug.ts:8:  graph: EvidenceGraph;
lib/blundr/coachCompiler/index.ts:8:export * from "./compileCoachFrame";
lib/blundr/coachCompiler/revealActionBuilder.ts:1:import type { EvidenceGraph } from "../brain/types";
lib/blundr/coachCompiler/revealActionBuilder.ts:2:import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
lib/blundr/coachCompiler/revealActionBuilder.ts:6:  frame: CurrentInstructionFrame;
lib/blundr/coachCompiler/revealActionBuilder.ts:7:  graph: EvidenceGraph;
lib/blundr/coachCompiler/slotBuilder.ts:1:import type { EvidenceGraph } from "../brain/types";
lib/blundr/coachCompiler/slotBuilder.ts:2:import type { ActivatedTeachingConcept } from "../concepts/TeachingConcept";
lib/blundr/coachCompiler/slotBuilder.ts:3:import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
lib/blundr/coachCompiler/slotBuilder.ts:19:  frame: CurrentInstructionFrame;
lib/blundr/coachCompiler/slotBuilder.ts:20:  graph: EvidenceGraph;
lib/blundr/coachCompiler/slotBuilder.ts:21:  activatedConcepts: ActivatedTeachingConcept[];
lib/blundr/coachCompiler/types.ts:1:import type { ActivatedTeachingConcept } from "../concepts/TeachingConcept";
lib/blundr/coachCompiler/types.ts:51:export interface CompiledCoachFrame {
lib/blundr/coachCompiler/types.ts:88:  frame: import("../runtime/currentInstructionFrame").CurrentInstructionFrame;
lib/blundr/coachCompiler/types.ts:89:  graph: import("../brain/types").EvidenceGraph;
lib/blundr/coachCompiler/types.ts:90:  activatedConcepts: ActivatedTeachingConcept[];
lib/blundr/coachCompiler/visualIntentBuilder.ts:1:import type { EvidenceGraph } from "../brain/types";
lib/blundr/coachCompiler/visualIntentBuilder.ts:2:import type { ActivatedTeachingConcept } from "../concepts/TeachingConcept";
lib/blundr/coachCompiler/visualIntentBuilder.ts:3:import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
lib/blundr/coachCompiler/visualIntentBuilder.ts:10:    frame: CurrentInstructionFrame;
lib/blundr/coachCompiler/visualIntentBuilder.ts:30:  frame: CurrentInstructionFrame;
lib/blundr/coachCompiler/visualIntentBuilder.ts:31:  graph: EvidenceGraph;
lib/blundr/coachCompiler/visualIntentBuilder.ts:32:  activatedConcepts: ActivatedTeachingConcept[];
lib/blundr/concepts/TeachingConcept.ts:82:export interface ActivatedTeachingConcept {
lib/blundr/concepts/dynamicConceptActivator.ts:1:import type { CoachEvidenceClaim, EvidenceGraph } from "../brain/types";
lib/blundr/concepts/dynamicConceptActivator.ts:2:import type { ActivatedTeachingConcept, ActivationMode, ConceptEloBand, TeachingConcept } from "./TeachingConcept";
lib/blundr/concepts/dynamicConceptActivator.ts:45:function strongestActivationStrength(claims: CoachEvidenceClaim[]): ActivatedTeachingConcept["strength"] {
lib/blundr/concepts/dynamicConceptActivator.ts:56:function hasEngineEvidence(graph: EvidenceGraph): boolean {
lib/blundr/concepts/dynamicConceptActivator.ts:62:function matchesMoveFlags(concept: TeachingConcept, graph: EvidenceGraph): boolean {
lib/blundr/concepts/dynamicConceptActivator.ts:77:function openingThemeScore(concept: TeachingConcept, graph: EvidenceGraph): number {
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
tests/coach/antiHallucination.test.ts:3:import { compileCoachFrame } from "../../lib/blundr/coachCompiler/compileCoachFrame";
tests/coach/antiHallucination.test.ts:5:import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/antiHallucination.test.ts:43:  const frame = buildCurrentInstructionFrame({
tests/coach/antiHallucination.test.ts:59:  const graph = buildEvidenceGraph({ frame });
tests/coach/antiHallucination.test.ts:69:  const compiled = compileCoachFrame({ frame, graph, activatedConcepts: concepts.activated });
tests/coach/browserContract.test.ts:15:    showMoreRevealsSameTarget: "After Show More, revealed visual target must equal CurrentInstructionFrame.target.",
tests/coach/coachCompiler.test.ts:3:import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
tests/coach/coachCompiler.test.ts:4:import { compileCoachFrame } from "../../lib/blundr/coachCompiler/compileCoachFrame";
tests/coach/coachCompiler.test.ts:6:import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/coachCompiler.test.ts:15:  return buildCurrentInstructionFrame({
tests/coach/coachCompiler.test.ts:34:  const graph = buildEvidenceGraph({ frame, openingKey: opening?.openingKey, openingName: opening?.openingName });
tests/coach/coachCompiler.test.ts:39:    compiled: compileCoachFrame({
tests/coach/coachCompiler.test.ts:82:  const branchComplete = buildCurrentInstructionFrame({
tests/coach/coachCompiler.test.ts:92:  const branchGraph = buildEvidenceGraph({ frame: branchComplete });
tests/coach/coachCompiler.test.ts:94:  const branchCompiled = compileCoachFrame({ frame: branchComplete, graph: branchGraph, activatedConcepts: branchConcepts.activated });
tests/coach/coachCompiler.test.ts:98:  const opponent = buildCurrentInstructionFrame({
tests/coach/coachCompiler.test.ts:107:  const opponentGraph = buildEvidenceGraph({ frame: opponent });
tests/coach/coachCompiler.test.ts:108:  const opponentCompiled = compileCoachFrame({ frame: opponent, graph: opponentGraph, activatedConcepts: [] });
tests/coach/coachCompiler.test.ts:112:  const terminal = buildCurrentInstructionFrame({
tests/coach/coachCompiler.test.ts:121:  const terminalGraph = buildEvidenceGraph({ frame: terminal });
tests/coach/coachCompiler.test.ts:122:  const terminalCompiled = compileCoachFrame({ frame: terminal, graph: terminalGraph, activatedConcepts: [] });
tests/coach/coachCompiler.test.ts:130:  compileCoachFrame({ frame: bc4Frame, graph: bc4.graph, activatedConcepts: bc4.concepts.activated });
tests/coach/coachCompiler.test.ts:134:  const mismatchCompiled = compileCoachFrame({
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
tests/coach/dynamicConceptActivator.test.ts:5:import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/dynamicConceptActivator.test.ts:15:  return buildCurrentInstructionFrame({
tests/coach/dynamicConceptActivator.test.ts:38:  const bc4Graph = buildEvidenceGraph({
tests/coach/dynamicConceptActivator.test.ts:53:  const nf3Graph = buildEvidenceGraph({
tests/coach/dynamicConceptActivator.test.ts:65:  const castleGraph = buildEvidenceGraph({
tests/coach/dynamicConceptActivator.test.ts:77:  const e4Graph = buildEvidenceGraph({
tests/coach/dynamicConceptActivator.test.ts:88:  const d4Graph = buildEvidenceGraph({
tests/coach/dynamicConceptActivator.test.ts:99:  const branchCompleteFrame = buildCurrentInstructionFrame({
tests/coach/dynamicConceptActivator.test.ts:109:  const branchGraph = buildEvidenceGraph({ frame: branchCompleteFrame });
tests/coach/dynamicConceptActivator.test.ts:125:  const opponentFrame = buildCurrentInstructionFrame({
tests/coach/dynamicConceptActivator.test.ts:134:  const opponentGraph = buildEvidenceGraph({ frame: opponentFrame });
tests/coach/evidenceGraph.test.ts:3:import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
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
tests/coach/evidenceGraph.test.ts:156:testEvidenceGraph();
tests/coach/goldenPositions.test.ts:4:import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
tests/coach/goldenPositions.test.ts:5:import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/goldenPositions.test.ts:73:      const nullFrame = buildCurrentInstructionFrame({
tests/coach/goldenPositions.test.ts:97:      const guidedFrame = buildCurrentInstructionFrame({
tests/coach/goldenPositions.test.ts:121:      const graph = buildEvidenceGraph({ frame: guidedFrame });
tests/coach/plainLeak.test.ts:2:import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
tests/coach/plainLeak.test.ts:3:import { compileCoachFrame } from "../../lib/blundr/coachCompiler/compileCoachFrame";
tests/coach/plainLeak.test.ts:6:import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/plainLeak.test.ts:35:  const frame = buildCurrentInstructionFrame({
tests/coach/plainLeak.test.ts:51:  const graph = buildEvidenceGraph({ frame, openingKey: "italian_game", openingName: "Italian Game" });
tests/coach/plainLeak.test.ts:56:  const compiled = compileCoachFrame({ frame, graph, activatedConcepts: assistedConcepts.activated });
tests/coach/providerFailure.test.ts:7:import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
tests/coach/providerFailure.test.ts:8:import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/providerFailure.test.ts:45:  const nullFrame = buildCurrentInstructionFrame({
tests/coach/providerFailure.test.ts:55:  const nullGraph = buildEvidenceGraph({ frame: nullFrame });
tests/coach/showMoreVisualReveal.test.ts:3:import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
tests/coach/showMoreVisualReveal.test.ts:4:import { compileCoachFrame } from "../../lib/blundr/coachCompiler/compileCoachFrame";
tests/coach/showMoreVisualReveal.test.ts:6:import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/showMoreVisualReveal.test.ts:10:  const frame = buildCurrentInstructionFrame({
tests/coach/showMoreVisualReveal.test.ts:26:  const graph = buildEvidenceGraph({ frame, openingKey: "italian_game", openingName: "Italian Game" });
tests/coach/showMoreVisualReveal.test.ts:28:  const compiled = compileCoachFrame({ frame, graph, activatedConcepts: concepts.activated });
tests/coach/targetInvariant.test.ts:3:import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
tests/coach/targetInvariant.test.ts:4:import { compileCoachFrame } from "../../lib/blundr/coachCompiler/compileCoachFrame";
tests/coach/targetInvariant.test.ts:6:import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/targetInvariant.test.ts:10:  const frame = buildCurrentInstructionFrame({
tests/coach/targetInvariant.test.ts:27:  const graph = buildEvidenceGraph({ frame, openingKey: "italian_game", openingName: "Italian Game" });
tests/coach/targetInvariant.test.ts:29:  const compiled = compileCoachFrame({ frame, graph, activatedConcepts: concepts.activated });
tests/coach/teachingConceptRegistry.test.ts:3:import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
tests/coach/teachingConceptRegistry.test.ts:9:import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/teachingConceptRegistry.test.ts:27:  const frame = buildCurrentInstructionFrame({
tests/coach/teachingConceptRegistry.test.ts:43:  return buildEvidenceGraph({ frame, openingKey: "italian_game", openingName: "Italian Game" });
tests/coach/typeContracts.test.ts:3:import type { CompiledCoachFrame } from "../../lib/blundr/coachCompiler/types";
tests/coach/typeContracts.test.ts:8:import { assertLockedInstructionTarget, type CurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/typeContracts.test.ts:11:  const guidedFrame: CurrentInstructionFrame = {
tests/coach/typeContracts.test.ts:62:  const terminalFrame: CurrentInstructionFrame = {
tests/coach/typeContracts.test.ts:73:  const opponentFrame: CurrentInstructionFrame = {
tests/coach/typeContracts.test.ts:176:  const compiledFrame: CompiledCoachFrame = {

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
✓ Compiled successfully in 8.5s
  Running TypeScript ...
  Finished TypeScript in 9.9s ...
  Collecting page data using 1 worker ...
  Generating static pages using 1 worker (0/3) ...
✓ Generating static pages using 1 worker (3/3) in 367ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/blundr-visual-model
├ ƒ /api/brain
└ ƒ /api/explorer


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand


$ node --import tsx tests/coach/coachSafetyGate.test.ts

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


## Step L Validation Rerun

$ node --import tsx tests/coach/coachSafetyGate.test.ts

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


## Step L Validation Rerun

$ node --import tsx tests/coach/coachSafetyGate.test.ts
coachSafetyGate ok

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
 M lib/blundr/safety/types.ts
 M tests/coach/antiHallucination.test.ts
 M tests/coach/browserContract.test.ts
 M tests/coach/coachCompiler.test.ts
 M tests/coach/plainLeak.test.ts
 M tests/coach/providerFailure.test.ts
 M tests/coach/showMoreVisualReveal.test.ts
 M tests/coach/targetInvariant.test.ts
?? .agent_runs/v2.8.0-intelligent-coach/20260603_143410/
?? BLUNDR_v2.8.0_INTELLIGENT_COACH_LIVE_VERSION_ROADMAP.md
?? BLUNDR_v2.8.0_PACKAGE_0_CODEX_PROMPT.md
?? "docs/BLUNDR_v2.8.0 Foundation Stabilization Gate_AGENT_8_COACH_SAFETY_GATE_REPORT.md"
?? lib/blundr/safety/coachSafetyGate.ts
?? lib/blundr/safety/index.ts
?? lib/blundr/safety/nullTargetPolicy.ts
?? lib/blundr/safety/plainLeakPolicy.ts
?? lib/blundr/safety/providerAuthorityPolicy.ts
?? lib/blundr/safety/safeFallbackFrame.ts
?? lib/blundr/safety/strongClaimPolicy.ts
?? lib/blundr/safety/targetInvariantPolicy.ts
?? tests/coach/coachSafetyGate.test.ts

$ git diff --stat
 lib/blundr/safety/types.ts               | 61 ++++++++++++++++++++++++--------
 tests/coach/antiHallucination.test.ts    | 12 +++++++
 tests/coach/browserContract.test.ts      |  3 +-
 tests/coach/coachCompiler.test.ts        |  4 +++
 tests/coach/plainLeak.test.ts            | 12 +++++++
 tests/coach/providerFailure.test.ts      | 37 +++++++++++++++++++
 tests/coach/showMoreVisualReveal.test.ts |  3 ++
 tests/coach/targetInvariant.test.ts      |  3 ++
 8 files changed, 120 insertions(+), 15 deletions(-)
