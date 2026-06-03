# Package 10.5 Command Log
$ git branch --show-current
v2.8.0-intelligent-coach-live

$ git status --short
 M next-env.d.ts
?? .agent_runs/v2.8.0-intelligent-coach/20260603_151516/
?? BLUNDR_v2.8.0_INTELLIGENT_COACH_LIVE_VERSION_ROADMAP.md
?? BLUNDR_v2.8.0_PACKAGE_0_CODEX_PROMPT.md
?? review_exports/

$ git log --oneline --decorate -12
1b4c509 (HEAD -> v2.8.0-intelligent-coach-live) Wire v2.8.0 visible teaching surface into UI
58721ef Add v2.8.0 visible teaching surface builder
896b92e Add v2.8.0 headless live chain smoke test
35a84d5 Add v2.8.0 coach safety gate
5757851 Add v2.8.0 coach compiler MVP
75c5296 Add v2.8.0 teaching concept registry
ff565d6 Add v2.8.0 deterministic evidence graph
7cad573 Add v2.8.0 current instruction frame authority
27b67e5 Add v2.8.0 intelligent coach ground truth harness
1567e53 Add v2.8.0 intelligent coach core contracts
88f47e1 (origin/checkpoint/v2.7.42-continuation-stabilization, checkpoint/v2.7.42-continuation-stabilization) Document v2.7.42 final stable checkpoint
b2ead91 (tag: v2.7.42-final-code-backup, tag: v2.7.42-cleaned-ui-repair-checkpoint, origin/backup/v2.7.42-final-code, backup/v2.7.42-final-code) Scope green continuation pause actions

$ find app -maxdepth 3 -type f | sort
app/api/blundr-visual-model/route.ts
app/api/brain/route.ts
app/api/explorer/route.ts
app/globals.css
app/layout.tsx
app/page.tsx

$ find components -maxdepth 4 -type f | sort
components/board/TeachingOverlay.tsx
components/board/VisualRecipeLayer.tsx
components/board/useVisualRecipePlayback.ts
components/board/visualPrimitiveRenderers.tsx
components/coach/CoachCard.tsx
components/debug/BlundrDiagnosticsPanel.tsx
components/debug/DebugBadge.tsx
components/debug/DebugCopyButton.tsx
components/debug/DebugEventTimeline.tsx
components/debug/DebugJsonViewer.tsx
components/debug/DebugSection.tsx

$ find lib/blundr/presentation -maxdepth 4 -type f | sort
lib/blundr/presentation/__tests__/coachActionStylePolicy.test.ts
lib/blundr/presentation/__tests__/coachHideDoesNotSuppressVisuals.test.ts
lib/blundr/presentation/__tests__/phaseActionGating.test.ts
lib/blundr/presentation/__tests__/presentationLegacySuppression.test.ts
lib/blundr/presentation/__tests__/presentationVisualIndependence.test.ts
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts
lib/blundr/presentation/actionPolicyBuilder.ts
lib/blundr/presentation/buildLiveVisibleTeachingSurface.ts
lib/blundr/presentation/buildVisibleTeachingSurface.ts
lib/blundr/presentation/coachActionStylePolicy.ts
lib/blundr/presentation/copySurfaceBuilder.ts
lib/blundr/presentation/featureFlags.ts
lib/blundr/presentation/index.ts
lib/blundr/presentation/modeSurfacePolicy.ts
lib/blundr/presentation/phaseActionGating.ts
lib/blundr/presentation/presentationDebug.ts
lib/blundr/presentation/surfaceDebug.ts
lib/blundr/presentation/testPresentationFrame.ts
lib/blundr/presentation/testVisualLayerIndependence.ts
lib/blundr/presentation/trainerPresentationFrame.ts
lib/blundr/presentation/trainerPresentationTypes.ts
lib/blundr/presentation/types.ts
lib/blundr/presentation/uiSurfaceAdapter.ts
lib/blundr/presentation/visibleActionPolicy.ts
lib/blundr/presentation/visualRecipeMapper.ts

$ find lib/blundr/runtime -maxdepth 4 -type f | sort
lib/blundr/runtime/__tests__/currentInstructionFrame.test.ts
lib/blundr/runtime/__tests__/opponentReplyGuard.test.ts
lib/blundr/runtime/continuationRuntimeState.ts
lib/blundr/runtime/currentInstructionFrame.ts
lib/blundr/runtime/currentInstructionTarget.ts
lib/blundr/runtime/instructionFrameLock.ts
lib/blundr/runtime/opponentReplyGuard.ts

$ find lib/blundr/safety -maxdepth 4 -type f | sort
lib/blundr/safety/coachSafetyGate.ts
lib/blundr/safety/index.ts
lib/blundr/safety/nullTargetPolicy.ts
lib/blundr/safety/plainLeakPolicy.ts
lib/blundr/safety/providerAuthorityPolicy.ts
lib/blundr/safety/safeFallbackFrame.ts
lib/blundr/safety/strongClaimPolicy.ts
lib/blundr/safety/targetInvariantPolicy.ts
lib/blundr/safety/types.ts

$ find lib/blundr/debug -maxdepth 4 -type f | sort
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

$ find tests/coach -maxdepth 2 -type f | sort
tests/coach/antiHallucination.test.ts
tests/coach/browserContract.test.ts
tests/coach/coachCompiler.test.ts
tests/coach/coachSafetyGate.test.ts
tests/coach/continuationFlow.test.ts
tests/coach/currentInstructionFrame.test.ts
tests/coach/dynamicConceptActivator.test.ts
tests/coach/evidenceGraph.test.ts
tests/coach/goldenPositions.test.ts
tests/coach/liveChainSmoke.test.ts
tests/coach/plainLeak.test.ts
tests/coach/providerFailure.test.ts
tests/coach/showMoreVisualReveal.test.ts
tests/coach/targetInvariant.test.ts
tests/coach/teachingConceptRegistry.test.ts
tests/coach/typeContracts.test.ts
tests/coach/uiSurfaceAdapter.test.ts
tests/coach/visibleTeachingSurface.test.ts

$ git grep -n "Safety Fallback\|Think about the safest improving move here\|visible_coach_with_silent_intent\|visualFailureKind\|coachFailureKind\|expected_move_missing\|no_recipe\|branch_transition\|branch_complete\|continue_from_here\|Continue from Here\|visible_surface_v28\|VisibleTeachingSurface" app components lib tests || true
app/page.tsx:48:import { buildVisibleTeachingSurface } from "@/lib/blundr/presentation/buildVisibleTeachingSurface"; // v2.7.40 Agent 3: single visible owner surface
app/page.tsx:49:import { buildLiveVisibleTeachingSurface } from "@/lib/blundr/presentation/buildLiveVisibleTeachingSurface";
app/page.tsx:1159:        kind: "branch_transition",
app/page.tsx:1173:        actions: ["continue_from_here","restart_line"],
app/page.tsx:1180:        kind: "branch_transition",
app/page.tsx:1194:        actions: ["continue_from_here","restart_line"],
app/page.tsx:2006:    const transitionButtons = ["continue_from_here","restart_line"] as const;
app/page.tsx:2124:    if(presentationFrame.coach.owner!=="branch_transition_surface")return coachDecision;
app/page.tsx:2130:      buttons:(presentationFrame.coach.buttons as CoachButton[])??(["continue_from_here","restart_line"] as CoachButton[]),
app/page.tsx:2138:        coachIntent:"branch_transition",
app/page.tsx:2310:    // v2.7.40 stabilization: prefer VisibleTeachingSurface.actions (single source) for rendered button reporting in debug.
app/page.tsx:2342:    if(button==="continue_from_here"){
app/page.tsx:2343:      const after={...before,coachInteraction:"continue_from_here",showAnswer:false};
app/page.tsx:2351:        normalizedAction:"continue_from_here",
app/page.tsx:2355:        reason:terminalDetected?"user_continue_from_here_terminal":"user_continue_from_here",
app/page.tsx:2372:    const internalWhitelist = ["replay", "hide", "continue_from_here", "restart_line"];
app/page.tsx:2405:  // v2.7.40 Agent 3 (late placement after all frame deps): VisibleTeachingSurface — single owner.
app/page.tsx:2429:  const legacyVisibleTeachingSurface = buildVisibleTeachingSurface({
app/page.tsx:2452:  const v28VisibleSurface = (v28VisibleSurfaceEnabled && currentInstructionFrame) ? buildLiveVisibleTeachingSurface({
app/page.tsx:2505:      source: "visible_surface_v28",
app/page.tsx:2518:      visibleCoachOwner: "visible_surface_v28",
app/page.tsx:2519:      visibleVisualOwner: "visible_surface_v28",
app/page.tsx:2520:      visibleActionOwner: "visible_surface_v28",
app/page.tsx:2525:  } as any : legacyVisibleTeachingSurface;
app/page.tsx:3574:  // v2.7.40 Agent 3: Visual overlays prefer VisibleTeachingSurface (enforces alignment + plain-pre + mismatch blocks)
app/page.tsx:3842:      {/* v2.7.40 Agent 3 wiring: CoachCard now driven exclusively by VisibleTeachingSurface (coach + hint + showMore + actions).
components/debug/BlundrDiagnosticsPanel.tsx:56:failureKind: ${snapshot.coach.coachFailureKind}
components/debug/BlundrDiagnosticsPanel.tsx:90:      visual: status(snapshot?.visual.visualFailureKind !== "none", false),
components/debug/BlundrDiagnosticsPanel.tsx:91:      coach: status(snapshot?.coach.coachFailureKind !== "none", false),
lib/blundr/animation/animationConductor.ts:183:      return this.setSuppressed("no_recipe");
lib/blundr/animation/animationConductor.ts:248:    if (!recipe) return this.setSuppressed("no_recipe");
lib/blundr/animation/animationTypes.ts:23:  | "no_recipe"
lib/blundr/animation/playbackKey.ts:24:    input.recipe?.visualRecipeId ?? "no_recipe",
lib/blundr/coach/coachDecisionEngine.ts:66:    return ["continue_from_here"];
lib/blundr/coach/coachTypes.ts:37:  | "continue_from_here"
lib/blundr/coachCompiler/compileCoachFrame.ts:37:    if (input.frame.kind === "branch_complete") {
lib/blundr/coachCompiler/revealActionBuilder.ts:20:  if (frame.kind === "branch_complete" && frame.branchComplete?.continueFromHereAvailable) {
lib/blundr/coachCompiler/revealActionBuilder.ts:22:      kind: "continue_from_here",
lib/blundr/coachCompiler/types.ts:45:  kind: "reveal_target" | "continue_from_here" | "none";
lib/blundr/concepts/dynamicConceptActivator.ts:19:  "continue_from_here_available",
lib/blundr/concepts/dynamicConceptActivator.ts:21:  "branch_complete_no_target",
lib/blundr/concepts/dynamicConceptActivator.ts:92:  if (frameKey.includes("branch_complete")) return "branch complete state has no target";
lib/blundr/concepts/teachingConceptRegistry.ts:218:  { id: "safety_fallback_explain_legal_move", label: "Safety Fallback Explain Legal Move", family: "safety_fallback", summary: "Use grounded legal-move explanation when stronger claims are unavailable.", claimTypes: ["safe_fallback"], minStrength: "probable", allowInPlainBeforeShowMore: true, overclaimRisk: "low" },
lib/blundr/concepts/teachingConceptRegistry.ts:229:  { id: "continue_from_here_available", label: "Continue From Here Available", family: "continuation", summary: "Branch completion can safely offer a continuation option.", claimTypes: ["safe_fallback"], minStrength: "probable", allowInPlainBeforeShowMore: true },
lib/blundr/concepts/teachingConceptRegistry.ts:233:  { id: "branch_complete_no_target", label: "Branch Complete No Target", family: "continuation", summary: "At branch completion, no direct user target should be taught.", claimTypes: ["safe_fallback"], minStrength: "probable", allowInPlainBeforeShowMore: true },
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:300:          buttons: ["continue_from_here", "restart_line"],
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:316:          suppressedReason: input.branchTransitionReason ?? "branch_transition_surface",
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:612:  assert.equal(frame.coachDecision.shouldShowCoachCard || frame.presentationFrame.coach.owner === "branch_transition_surface", true, `${label}: coach should be visible or branch transition should render`);
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:613:  if (frame.presentationFrame.coach.owner !== "branch_transition_surface") {
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:617:    Boolean(frame.coachDecision.debug?.selectedOpportunityId || frame.coachDecision.debug?.selectedTemplateId || frame.coachDecision.debug?.candidateCoachFallbackUsed || frame.presentationFrame.coach.owner === "branch_transition_surface"),
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:704:  assertNoCriticalIssues(mainStart, ["stale_selected_candidate", "visible_coach_with_silent_intent", "generic_context_rendered_with_candidate", "continuation_candidate_not_rendered", "premature_continuation_transition", "guided_complete_without_policy", "restricted_line_exhausted_but_completion_blocked", "branch_transition_missing", "reveal_failed_with_revealable_target"], "mainline start");
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:726:  assertNoCriticalIssues(afterE4, ["visible_coach_with_silent_intent", "generic_context_rendered_with_candidate", "continuation_candidate_not_rendered", "premature_continuation_transition", "guided_complete_without_policy", "restricted_line_exhausted_but_completion_blocked", "branch_transition_missing"], "after e4");
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:860:  assertNoCriticalIssues(continuationStart, ["visible_coach_with_silent_intent", "generic_context_rendered_with_candidate", "continuation_candidate_not_rendered", "premature_continuation_transition"], "continuation start");
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:878:      continuationAfter1.presentationFrame.coach.owner === "branch_transition_surface" ||
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:901:      continuationAfter2.presentationFrame.coach.owner === "branch_transition_surface" ||
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:994:      providedContinuation.presentationFrame.coach.owner === "branch_transition_surface" ||
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:998:  assertNoCriticalIssues(providedContinuation, ["visible_coach_with_silent_intent", "generic_context_rendered_with_candidate", "continuation_candidate_not_rendered", "premature_continuation_transition"], "provided continuation");
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:1026:  assertNoCriticalIssues(hiddenContinuation, ["visible_coach_with_silent_intent", "generic_context_rendered_with_candidate", "continuation_candidate_not_rendered"], "hidden continuation");
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:88:    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { shouldRender: true, owner: "branch_transition_surface", intent: "branch_transition", title: "Line complete", body: "You finished this training line. Continue from this position or train the line again.", buttons: ["continue_from_here","restart_line"] }, legacy: {} },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:92:  assert.equal(unresolvedWithTransition.health.criticalIssues.includes("branch_transition_surface_missing_payload"), false);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:94:  assert.deepEqual(unresolvedWithTransition.coach.visibleButtons, ["continue_from_here","restart_line"]);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:475:    const _frame = { frameKey: sel ? "end-of-book-transition" : "thinking", actions: gate ? ["continue_from_here"] : [] };
lib/blundr/debug/trainerDebugSnapshot.ts:20:  if (!input.visualRecipe) return "no_recipe";
lib/blundr/debug/trainerDebugSnapshot.ts:33:  if (!expected && input.trainingMode === "restricted") return "expected_move_missing";
lib/blundr/debug/trainerDebugSnapshot.ts:86:  const visualFailureKind = inferVisualFailure(input);
lib/blundr/debug/trainerDebugSnapshot.ts:87:  const coachFailureKind = inferCoachFailure({ ...input, coachDebug });
lib/blundr/debug/trainerDebugSnapshot.ts:129:      visibleButtons.includes("continue_from_here") &&
lib/blundr/debug/trainerDebugSnapshot.ts:162:  ) criticalIssues.push("branch_transition_surface_missing_payload");
lib/blundr/debug/trainerDebugSnapshot.ts:182:  if (input.coachDecision?.title === "Opening pattern" && expectedMoveExists && coachFailureKind !== "none") criticalIssues.push("Opening pattern title is paired with a suspicious/fallback coach decision");
lib/blundr/debug/trainerDebugSnapshot.ts:357:  if (presentationCoach.shouldRender && visibleCoachIntent === "silent") criticalIssues.push("visible_coach_with_silent_intent");
lib/blundr/debug/trainerDebugSnapshot.ts:359:  if (input.trainingMode === "continuation" && input.selectedCandidateUci && presentationCoach.shouldRender && visibleCoachOwner !== "branch_transition_surface" && !coachDebug.selectedOpportunityId && !coachDebug.selectedTemplateId && !coachDebug.mappingTemplateId && !coachDebug.candidateCoachFallbackUsed) criticalIssues.push("visible_coach_missing_template_and_opportunity");
lib/blundr/debug/trainerDebugSnapshot.ts:369:  if (visualFailureKind !== "none") warnings.push(`visualFailureKind:${visualFailureKind}`);
lib/blundr/debug/trainerDebugSnapshot.ts:370:  if (coachFailureKind !== "none") warnings.push(`coachFailureKind:${coachFailureKind}`);
lib/blundr/debug/trainerDebugSnapshot.ts:515:      continueFromHereButtonRendered: visibleButtons.includes("continue_from_here"),
lib/blundr/debug/trainerDebugSnapshot.ts:576:      visualFailureKind,
lib/blundr/debug/trainerDebugSnapshot.ts:644:      coachMismatchReason: coachFailureKind === "none" ? null : coachFailureKind,
lib/blundr/debug/trainerDebugSnapshot.ts:649:      coachFailureKind,
lib/blundr/debug/trainerDebugSnapshot.ts:766:      // Agent 6: surface owner + 4-target/2-piece + leak/bypass from VisibleTeachingSurface guard
lib/blundr/debug/trainerDebugSnapshot.ts:787:      // v2.7.40 P0 Fix 2: when VisibleTeachingSurface owns the coach render on teaching, live coach path is not "actually rendered" visibly (internal evidence only).
lib/blundr/debug/trainerDebugSnapshot.ts:840:        coachMatchesExpectedMove: expectedMoveExists ? coachFailureKind === "none" : "unknown",
lib/blundr/opportunity/opportunityTypes.ts:20:  | "branch_transition"
lib/blundr/presentation/__tests__/coachActionStylePolicy.test.ts:6:  const branchActions: VisibleCoachAction[] = ["continue_from_here", "restart_line"];
lib/blundr/presentation/__tests__/coachActionStylePolicy.test.ts:22:  assert.equal(resolveCoachActionStyle("continue_from_here", branchByTitle), "branch_continue");
lib/blundr/presentation/__tests__/coachActionStylePolicy.test.ts:45:    buttons: ["continue_from_here", "restart_line"],
lib/blundr/presentation/__tests__/coachActionStylePolicy.test.ts:51:    debug: { coachIntent: "branch_transition" },
lib/blundr/presentation/__tests__/coachActionStylePolicy.test.ts:53:  assert.equal(debugIntent, "branch_transition");
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:30:    coachButtons: ["hint", "show_more", "continue_from_here", "hide"],
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:34:  assert.deepEqual(userTurn.filteredButtons, ["hint", "show_more", "continue_from_here"]);
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:85:  // Branch transition produces exactly ["continue_from_here","restart_line"]
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:86:  const branch = getVisibleCoachActions({ trainerView: "assisted", trainerPhase: "ready_for_user", isUserTurn: true, trainingMode: "continuation", isBranchTransition: true, coachOwner: "branch_transition_surface" });
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:87:  assert.deepEqual(branch.actions, ["continue_from_here", "restart_line"] as VisibleCoachAction[]);
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:88:  assert.equal(branch.frameKind, "branch_transition");
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:102:  const filteredLegacy = filterToVisibleCoachActions(["hint", "answer", "show_plan", "analyze_idea", "continue_from_here"]);
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:103:  assert.deepEqual(filteredLegacy, ["hint", "continue_from_here"] as VisibleCoachAction[]);
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:4:import { buildVisibleTeachingSurface, detectPlainTeachingLeak } from "../buildVisibleTeachingSurface";
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:60:    coachSurfacePolicy: { allowLegacyTrainingCard: false, allowLegacyAnswerCard: false, allowMoveImpactCard: false, allowNextMoveText: false, owner: "none", reason: "no_recipe" } as any,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:84:    coachSurfacePolicy: { allowLegacyTrainingCard: false, allowLegacyAnswerCard: false, allowMoveImpactCard: false, allowNextMoveText: false, owner: "none", reason: "no_recipe" } as any,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:110:    coachSurfacePolicy: { allowLegacyTrainingCard: false, allowLegacyAnswerCard: false, allowMoveImpactCard: false, allowNextMoveText: false, owner: "none", reason: "no_recipe" } as any,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:113:  assert.equal(branchTransitionFrame.coach.owner, "branch_transition_surface");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:116:// v2.7.40 VisibleTeachingSurface + Agent4/5 tests (imports consolidated at top)
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:190:export function testVisibleTeachingSurface(): void {
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:194:  const s1 = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres1, trainerView: "assisted", trainerPhase: "ready_for_user", isUserTurn: true });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:207:  const s2 = buildVisibleTeachingSurface({ currentInstructionFrame: contFrame, trainerPresentationFrame: pres2, trainingMode: "continuation", trainerView: "assisted" });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:213:  const sPlain = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres1, trainerView: "plain", showMoreShown: false, hintCount: 0 });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:225:  const sMismatch = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres1, legacyCoachDecision: badLegacy as any });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:234:  const sPiece = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres1, legacyCoachDecision: badPieceLegacy as any });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:240:  const sLegacy = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: makeMockPresentationFrame(true, true, "legacy_fallback", "legacy_fallback"), legacyCoachDecision: { body: "legacy" } as any });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:247:  const s4Target = buildVisibleTeachingSurface({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:262:  const s2Piece = buildVisibleTeachingSurface({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:278:  const sLeak = buildVisibleTeachingSurface({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:295:  const sTerm = buildVisibleTeachingSurface({ currentInstructionFrame: termInput, trainerPresentationFrame: pres1, isTerminal: true, isUserTurn: false, trainerPhase: "terminal" });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:299:  const sOpp = buildVisibleTeachingSurface({ currentInstructionFrame: oppInput, trainerPresentationFrame: pres1, trainerPhase: "opponent_replying", isUserTurn: false });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:303:  const sClean = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres1, coachMoveUci: "e2e4", visualMoveUci: "e2e4", coachPieceType: "p" });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:312:  console.log("✓ v2.7.40 buildVisibleTeachingSurface tests passed (6 cases + 6 Agent6 invariant guard cases)");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:337:  const sPlainPre0 = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres, trainerView: "plain", showMoreShown: false, hintCount: 0 });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:346:  const sPlainPost = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres, trainerView: "plain", showMoreShown: true, hintCount: 0 });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:357:  const sNewFrame = buildVisibleTeachingSurface({ currentInstructionFrame: { ...guidedFrame, frameId: "f99", target: { ...guidedFrame.target!, uci: "d2d4" } } as any, trainerPresentationFrame: pres, trainerView: "plain", showMoreShown: false, hintCount: 0 });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:429:  const surface = buildVisibleTeachingSurface({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:469:  const sAssisted = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres, trainerView: "assisted", trainerPhase: "ready_for_user", isUserTurn: true });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:475:  const sPlainPre = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres, trainerView: "plain", showMoreShown: false, hintCount: 0 });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:481:  const sTerm = buildVisibleTeachingSurface({ currentInstructionFrame: termInput, trainerPresentationFrame: pres, isTerminal: true, trainerPhase: "terminal", isUserTurn: false });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:486:  const sOpp = buildVisibleTeachingSurface({ currentInstructionFrame: oppInput, trainerPresentationFrame: pres, trainerPhase: "opponent_replying", isUserTurn: false });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:491:  const sBranch = buildVisibleTeachingSurface({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:499:  assert.deepEqual(sBranch.actions, ["continue_from_here", "restart_line"] as any, "branch must expose Continue + Train Again (stale cleared)");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:504:  const noTargetBranchSurface = buildVisibleTeachingSurface({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:513:  assert.equal(noTargetBranchSurface.actions.includes("continue_from_here"), true);
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:577:  const preSurface = buildVisibleTeachingSurface({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:592:  const postSurface = buildVisibleTeachingSurface({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:631:  const postSurfForShow = buildVisibleTeachingSurface({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:646:  const preBc4Surf = buildVisibleTeachingSurface({
lib/blundr/presentation/actionPolicyBuilder.ts:39:  if (mode === "branch_complete") {
lib/blundr/presentation/actionPolicyBuilder.ts:40:    if (safeFrame.revealAction.kind === "continue_from_here") {
lib/blundr/presentation/actionPolicyBuilder.ts:43:          kind: "continue_from_here",
lib/blundr/presentation/actionPolicyBuilder.ts:44:          label: safeFrame.revealAction.label || "Continue from Here",
lib/blundr/presentation/buildLiveVisibleTeachingSurface.ts:6:import { buildVisibleTeachingSurface } from "./buildVisibleTeachingSurface";
lib/blundr/presentation/buildLiveVisibleTeachingSurface.ts:7:import type { VisibleTeachingSurface } from "./types";
lib/blundr/presentation/buildLiveVisibleTeachingSurface.ts:9:export function buildLiveVisibleTeachingSurface(input: {
lib/blundr/presentation/buildLiveVisibleTeachingSurface.ts:23:}): VisibleTeachingSurface {
lib/blundr/presentation/buildLiveVisibleTeachingSurface.ts:62:  return buildVisibleTeachingSurface({
lib/blundr/presentation/buildVisibleTeachingSurface.ts:8:import type { VisibleTeachingSurface } from "./types";
lib/blundr/presentation/buildVisibleTeachingSurface.ts:11:export interface BuildVisibleTeachingSurfaceInput {
lib/blundr/presentation/buildVisibleTeachingSurface.ts:19:type LegacyBuildVisibleTeachingSurfaceInput = {
lib/blundr/presentation/buildVisibleTeachingSurface.ts:27:function isCanonicalInput(input: unknown): input is BuildVisibleTeachingSurfaceInput {
lib/blundr/presentation/buildVisibleTeachingSurface.ts:28:  const candidate = input as BuildVisibleTeachingSurfaceInput;
lib/blundr/presentation/buildVisibleTeachingSurface.ts:32:function buildLegacyCompatibilitySurface(input: LegacyBuildVisibleTeachingSurfaceInput): any {
lib/blundr/presentation/buildVisibleTeachingSurface.ts:100:export function buildVisibleTeachingSurface(input: BuildVisibleTeachingSurfaceInput): VisibleTeachingSurface;
lib/blundr/presentation/buildVisibleTeachingSurface.ts:101:export function buildVisibleTeachingSurface(input: LegacyBuildVisibleTeachingSurfaceInput): any;
lib/blundr/presentation/buildVisibleTeachingSurface.ts:102:export function buildVisibleTeachingSurface(
lib/blundr/presentation/buildVisibleTeachingSurface.ts:103:  input: BuildVisibleTeachingSurfaceInput | LegacyBuildVisibleTeachingSurfaceInput,
lib/blundr/presentation/buildVisibleTeachingSurface.ts:104:): VisibleTeachingSurface | any {
lib/blundr/presentation/buildVisibleTeachingSurface.ts:117:  const surfaceBase: VisibleTeachingSurface = {
lib/blundr/presentation/buildVisibleTeachingSurface.ts:152:export default buildVisibleTeachingSurface;
lib/blundr/presentation/coachActionStylePolicy.ts:12:const BRANCH_ACTION_IDS: VisibleCoachAction[] = ["continue_from_here", "restart_line"];
lib/blundr/presentation/coachActionStylePolicy.ts:24:    coachIntent === "branch_transition" ||
lib/blundr/presentation/coachActionStylePolicy.ts:32:  if (action === "continue_from_here") return "branch_continue";
lib/blundr/presentation/copySurfaceBuilder.ts:35:  if (mode === "branch_complete") {
lib/blundr/presentation/index.ts:7:export * from "./buildVisibleTeachingSurface";
lib/blundr/presentation/index.ts:9:export * from "./buildLiveVisibleTeachingSurface";
lib/blundr/presentation/modeSurfacePolicy.ts:15:  if (input.frame.kind === "branch_complete") {
lib/blundr/presentation/modeSurfacePolicy.ts:16:    return "branch_complete";
lib/blundr/presentation/phaseActionGating.ts:10:  "continue_from_here",
lib/blundr/presentation/phaseActionGating.ts:77:    if (button === "continue_from_here") return true; // branch allowed
lib/blundr/presentation/surfaceDebug.ts:1:import type { VisibleTeachingSurface } from "./types";
lib/blundr/presentation/surfaceDebug.ts:4:  surface: VisibleTeachingSurface;
lib/blundr/presentation/surfaceDebug.ts:5:}): VisibleTeachingSurface["debug"] {
lib/blundr/presentation/trainerPresentationFrame.ts:6:export type TrainerCoachOwner = "none" | "coach_decision" | "branch_transition_surface" | "brain_skeleton";
lib/blundr/presentation/trainerPresentationFrame.ts:173:      owner: "branch_transition_surface",
lib/blundr/presentation/trainerPresentationFrame.ts:177:      buttons: [...(input.branchTransitionButtons ?? ["continue_from_here", "restart_line"])],
lib/blundr/presentation/trainerPresentationFrame.ts:183:  // CurrentInstructionFrame.target -> BlundrBrainAnalysis.safeFallbackCopy (piece-matched, evidence-backed, no halluc) -> TrainerPresentationFrame -> VisibleTeachingSurface
lib/blundr/presentation/trainerPresentationTypes.ts:26:    owner: "intent_first_coach" | "legacy_fallback" | "branch_transition_surface" | "none";
lib/blundr/presentation/types.ts:5:  | "branch_complete"
lib/blundr/presentation/types.ts:14:  | "continue_from_here"
lib/blundr/presentation/types.ts:53:export interface VisibleTeachingSurface {
lib/blundr/presentation/uiSurfaceAdapter.ts:1:import type { VisibleTeachingSurface } from "./types";
lib/blundr/presentation/uiSurfaceAdapter.ts:25:    source: "VisibleTeachingSurface";
lib/blundr/presentation/uiSurfaceAdapter.ts:43:    source: "VisibleTeachingSurface";
lib/blundr/presentation/uiSurfaceAdapter.ts:48:export function adaptVisibleSurfaceToCoachUi(surface: VisibleTeachingSurface): CoachUiModel {
lib/blundr/presentation/uiSurfaceAdapter.ts:73:      source: "VisibleTeachingSurface",
lib/blundr/presentation/uiSurfaceAdapter.ts:81:export function adaptVisibleSurfaceToBoardVisuals(surface: VisibleTeachingSurface): BoardVisualUiModel {
lib/blundr/presentation/uiSurfaceAdapter.ts:95:      source: "VisibleTeachingSurface",
lib/blundr/presentation/visibleActionPolicy.ts:8: * - Branch transition: EXACTLY ["continue_from_here", "restart_line"]
lib/blundr/presentation/visibleActionPolicy.ts:17:  | "continue_from_here"
lib/blundr/presentation/visibleActionPolicy.ts:31:  coachOwner?: string; // e.g. "branch_transition_surface" from presentation
lib/blundr/presentation/visibleActionPolicy.ts:36:  frameKind: "assisted_teaching" | "plain_teaching" | "branch_transition" | "terminal" | "opponent" | "other";
lib/blundr/presentation/visibleActionPolicy.ts:76:    coachOwner === "branch_transition_surface" ||
lib/blundr/presentation/visibleActionPolicy.ts:82:      actions: ["continue_from_here", "restart_line"],
lib/blundr/presentation/visibleActionPolicy.ts:83:      frameKind: "branch_transition",
lib/blundr/presentation/visibleActionPolicy.ts:84:      reason: "branch_transition_continue_or_restart",
lib/blundr/presentation/visibleActionPolicy.ts:117:      actions: ["continue_from_here", "restart_line"], // branch fallback
lib/blundr/presentation/visibleActionPolicy.ts:118:      frameKind: "branch_transition",
lib/blundr/presentation/visibleActionPolicy.ts:141:    case "continue_from_here":
lib/blundr/presentation/visibleActionPolicy.ts:158:  const allowed: VisibleCoachAction[] = ["hint", "show_more", "continue_from_here", "restart_line", "review_pattern"];
lib/blundr/runtime/continuationRuntimeState.ts:37:  | "branch_complete_waiting_for_continue"
lib/blundr/runtime/continuationRuntimeState.ts:166:      phase: "branch_complete_waiting_for_continue",
lib/blundr/runtime/currentInstructionFrame.ts:320:    input.kind === "branch_complete" ||
lib/blundr/runtime/currentInstructionFrame.ts:404:          : input.kind === "branch_complete"
lib/blundr/runtime/currentInstructionFrame.ts:405:            ? "branch_complete"
lib/blundr/runtime/currentInstructionFrame.ts:687:  if (frame.kind === "opponent_replying" || frame.kind === "transitioning" || frame.kind === "branch_complete" || frame.kind === "terminal") {
lib/blundr/runtime/currentInstructionTarget.ts:27:  | "branch_complete"
lib/blundr/safety/nullTargetPolicy.ts:60:    input.frame.kind === "branch_complete"
lib/blundr/safety/nullTargetPolicy.ts:61:    && input.compiled.revealAction.kind === "continue_from_here"
lib/blundr/safety/nullTargetPolicy.ts:67:      message: "continue_from_here action present without branch-complete eligibility.",
lib/blundr/safety/safeFallbackFrame.ts:40:      title: "Safety Fallback",
lib/blundr/safety/safeFallbackFrame.ts:41:      body: "Think about the safest improving move here.",
lib/blundr/visualRecipe/visualRecipeAdapter.ts:96:      suppressedReason: recipe?.debug?.recipeSuppressedReason ?? "no_recipe",
lib/blundr/visualRecipe/visualRecipeAdapter.ts:97:      adapterSuppressedReason: recipe?.debug?.recipeSuppressedReason ?? "no_recipe",
tests/coach/browserContract.test.ts:16:    continueBeforeCandidate: "Before Continue from Here, continuation candidate target is null and action is visible.",
tests/coach/browserContract.test.ts:19:    visibleSurfaceSafeFrameOnly: "VisibleTeachingSurface must be built from SafetyGateOutput.safeFrame only.",
tests/coach/browserContract.test.ts:20:    uiConsumesVisibleSurface: "When v2.8 flag is enabled, UI consumes coach/actions/visuals from VisibleTeachingSurface adapters.",
tests/coach/coachCompiler.test.ts:84:    kind: "branch_complete",
tests/coach/coachCompiler.test.ts:96:  assert.equal(branchCompiled.revealAction.kind, "continue_from_here");
tests/coach/coachSafetyGate.test.ts:6:import { buildVisibleTeachingSurface } from "../../lib/blundr/presentation/buildVisibleTeachingSurface";
tests/coach/coachSafetyGate.test.ts:217:    kind: "branch_complete",
tests/coach/coachSafetyGate.test.ts:286:  const blockedSurface = buildVisibleTeachingSurface({
tests/coach/continuationFlow.test.ts:4:import { buildVisibleTeachingSurface } from "../../lib/blundr/presentation/buildVisibleTeachingSurface";
tests/coach/continuationFlow.test.ts:20:  assert.equal(beforeContinue.phase, "branch_complete_waiting_for_continue");
tests/coach/continuationFlow.test.ts:65:    kind: "branch_complete",
tests/coach/continuationFlow.test.ts:77:  const branchSurface = buildVisibleTeachingSurface({
tests/coach/continuationFlow.test.ts:84:  assert.equal(branchSurface.mode, "branch_complete");
tests/coach/continuationFlow.test.ts:86:  assert.equal(branchSurface.actions.some((action) => action.kind === "continue_from_here"), true);
tests/coach/currentInstructionFrame.test.ts:141:    kind: "branch_complete",
tests/coach/dynamicConceptActivator.test.ts:100:    kind: "branch_complete",
tests/coach/dynamicConceptActivator.test.ts:114:        "continue_from_here_available",
tests/coach/dynamicConceptActivator.test.ts:115:        "branch_complete_no_target",
tests/coach/evidenceGraph.test.ts:107:    kind: "branch_complete",
tests/coach/goldenPositions.test.ts:12:  "branch_complete",
tests/coach/liveChainSmoke.test.ts:6:import { buildVisibleTeachingSurface } from "../../lib/blundr/presentation/buildVisibleTeachingSurface";
tests/coach/liveChainSmoke.test.ts:60:  const surface = buildVisibleTeachingSurface({
tests/coach/liveChainSmoke.test.ts:140:    kind: "branch_complete",
tests/coach/liveChainSmoke.test.ts:152:  assert.equal(branch.compiled.revealAction.kind, "continue_from_here");
tests/coach/liveChainSmoke.test.ts:155:  assert.equal(branch.surface.mode, "branch_complete");
tests/coach/liveChainSmoke.test.ts:156:  assert.equal(branch.surface.actions.some((action) => action.kind === "continue_from_here"), true);
tests/coach/liveChainSmoke.test.ts:195:  const blockedSurface = buildVisibleTeachingSurface({
tests/coach/plainLeak.test.ts:6:import { buildVisibleTeachingSurface } from "../../lib/blundr/presentation/buildVisibleTeachingSurface";
tests/coach/plainLeak.test.ts:68:  const plainPreSurface = buildVisibleTeachingSurface({
tests/coach/providerFailure.test.ts:49:    kind: "branch_complete",
tests/coach/showMoreVisualReveal.test.ts:6:import { buildVisibleTeachingSurface } from "../../lib/blundr/presentation/buildVisibleTeachingSurface";
tests/coach/showMoreVisualReveal.test.ts:37:  const assistedSurface = buildVisibleTeachingSurface({
tests/coach/showMoreVisualReveal.test.ts:44:  const plainShowMoreSurface = buildVisibleTeachingSurface({
tests/coach/targetInvariant.test.ts:6:import { buildVisibleTeachingSurface } from "../../lib/blundr/presentation/buildVisibleTeachingSurface";
tests/coach/targetInvariant.test.ts:39:  const surface = buildVisibleTeachingSurface({
tests/coach/typeContracts.test.ts:7:import type { VisibleTeachingSurface } from "../../lib/blundr/presentation/types";
tests/coach/typeContracts.test.ts:151:  const safeFallbackSurface: VisibleTeachingSurface = {
tests/coach/uiSurfaceAdapter.test.ts:3:import { buildLiveVisibleTeachingSurface } from "../../lib/blundr/presentation/buildLiveVisibleTeachingSurface";
tests/coach/uiSurfaceAdapter.test.ts:5:import { buildVisibleTeachingSurface } from "../../lib/blundr/presentation/buildVisibleTeachingSurface";
tests/coach/uiSurfaceAdapter.test.ts:50:  const assistedSurface = buildLiveVisibleTeachingSurface({
tests/coach/uiSurfaceAdapter.test.ts:62:  assert.equal(assistedCoach.debug.source, "VisibleTeachingSurface");
tests/coach/uiSurfaceAdapter.test.ts:63:  assert.equal(assistedBoard.debug.source, "VisibleTeachingSurface");
tests/coach/uiSurfaceAdapter.test.ts:65:  const plainPreSurface = buildLiveVisibleTeachingSurface({
tests/coach/uiSurfaceAdapter.test.ts:83:  const plainPostSurface = buildLiveVisibleTeachingSurface({
tests/coach/uiSurfaceAdapter.test.ts:99:    kind: "branch_complete",
tests/coach/uiSurfaceAdapter.test.ts:108:  const branchSurface = buildLiveVisibleTeachingSurface({
tests/coach/uiSurfaceAdapter.test.ts:117:  assert.equal(branchCoach.actions.some((action) => action.kind === "continue_from_here"), true);
tests/coach/uiSurfaceAdapter.test.ts:129:  const opponentSurface = buildLiveVisibleTeachingSurface({ frame: opponentFrame, requestedMode: "assisted", showMoreRevealed: false });
tests/coach/uiSurfaceAdapter.test.ts:135:  const e4 = buildLiveVisibleTeachingSurface({
tests/coach/uiSurfaceAdapter.test.ts:145:  const nf3 = buildLiveVisibleTeachingSurface({
tests/coach/uiSurfaceAdapter.test.ts:156:  const castle = buildLiveVisibleTeachingSurface({
tests/coach/uiSurfaceAdapter.test.ts:177:  const blockedSurface = buildVisibleTeachingSurface({
tests/coach/visibleTeachingSurface.test.ts:6:import { buildVisibleTeachingSurface } from "../../lib/blundr/presentation/buildVisibleTeachingSurface";
tests/coach/visibleTeachingSurface.test.ts:49:  const surface = buildVisibleTeachingSurface({
tests/coach/visibleTeachingSurface.test.ts:59:export function testVisibleTeachingSurface(): void {
tests/coach/visibleTeachingSurface.test.ts:104:    kind: "branch_complete",
tests/coach/visibleTeachingSurface.test.ts:114:  assert.equal(branch.surface.mode, "branch_complete");
tests/coach/visibleTeachingSurface.test.ts:116:  assert.equal(branch.surface.actions.some((action) => action.kind === "continue_from_here"), true);
tests/coach/visibleTeachingSurface.test.ts:156:  const blockedSurface = buildVisibleTeachingSurface({
tests/coach/visibleTeachingSurface.test.ts:199:testVisibleTeachingSurface();

# Package 10.5 Validation

$ npm run build
PASS

$ node --import tsx tests/coach/uiSurfaceAdapter.test.ts
uiSurfaceAdapter ok

$ node --import tsx tests/coach/visibleTeachingSurface.test.ts
visibleTeachingSurface ok

$ node --import tsx tests/coach/liveChainSmoke.test.ts
liveChainSmoke ok

$ node --import tsx tests/coach/browserContract.test.ts
browserContract ok

$ node --import tsx tests/coach/continuationFlow.test.ts
continuationFlow ok

$ node --import tsx tests/coach/plainLeak.test.ts
plainLeak ok

$ node --import tsx tests/coach/showMoreVisualReveal.test.ts
showMoreVisualReveal ok

$ node --import tsx tests/coach/targetInvariant.test.ts
targetInvariant ok

$ node --import tsx tests/coach/coachSafetyGate.test.ts
coachSafetyGate ok

$ node --import tsx tests/coach/coachCompiler.test.ts
coachCompiler ok

$ node --import tsx tests/coach/evidenceGraph.test.ts
evidenceGraph ok

$ node --import tsx tests/coach/dynamicConceptActivator.test.ts
dynamicConceptActivator ok

$ node --import tsx tests/coach/teachingConceptRegistry.test.ts
teachingConceptRegistry ok

$ node --import tsx tests/coach/currentInstructionFrame.test.ts
currentInstructionFrame ok

$ node --import tsx tests/coach/typeContracts.test.ts
typeContracts ok

$ node --import tsx tests/coach/goldenPositions.test.ts
goldenPositions ok

$ node --import tsx tests/coach/providerFailure.test.ts
providerFailure ok

$ node --import tsx tests/coach/antiHallucination.test.ts
antiHallucination ok

$ node --import tsx lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts
PASS

$ npm test
Missing script: test

$ npm run lint
Missing script: lint

$ git status --short
 M app/page.tsx
 M lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts
 M lib/blundr/debug/trainerDebugSnapshot.ts
 M lib/blundr/presentation/copySurfaceBuilder.ts
 M tests/coach/browserContract.test.ts
 M tests/coach/coachSafetyGate.test.ts
 M tests/coach/liveChainSmoke.test.ts
 M tests/coach/uiSurfaceAdapter.test.ts
 M tests/coach/visibleTeachingSurface.test.ts
?? .agent_runs/v2.8.0-intelligent-coach/20260603_151516/
?? BLUNDR_v2.8.0_INTELLIGENT_COACH_LIVE_VERSION_ROADMAP.md
?? BLUNDR_v2.8.0_PACKAGE_0_CODEX_PROMPT.md
?? "docs/BLUNDR_v2.8.0 Foundation Stabilization Gate_AGENT_10_5_COMPREHENSIVE_LIVE_UI_REPAIR_REPORT.md"
?? review_exports/

$ git diff --stat
 app/page.tsx                                       | 93 ++++++++++------------
 .../debug/__tests__/trainerDebugSnapshot.test.ts   | 37 +++++++++
 lib/blundr/debug/trainerDebugSnapshot.ts           | 54 +++++++++++--
 lib/blundr/presentation/copySurfaceBuilder.ts      |  6 +-
 tests/coach/browserContract.test.ts                |  4 +-
 tests/coach/coachSafetyGate.test.ts                |  3 +
 tests/coach/liveChainSmoke.test.ts                 |  5 ++
 tests/coach/uiSurfaceAdapter.test.ts               |  8 ++
 tests/coach/visibleTeachingSurface.test.ts         |  5 ++
 9 files changed, 152 insertions(+), 63 deletions(-)
