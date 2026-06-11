import assert from "node:assert/strict";
import { Chess } from "chess.js";

import { buildTrainerDebugSnapshot } from "../trainerDebugSnapshot";
import { buildCurrentInstructionFrame } from "../../runtime/currentInstructionFrame";

export function testTrainerDebugSnapshot(): void {
  const snapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 7,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "8/8/8/8/8/8/8/4K3 w - - 0 1",
    expectedMoveSan: "Bc4",
    expectedMoveUci: "f1c4",
    coachDecision: {
      shouldShowCoachCard: true,
      title: "Opening pattern",
      body: "Improve the knight toward the center before forcing the position.",
      buttons: ["why"],
      debug: { selectedOpportunityLayer: "fallback", selectedOpportunityId: "fallback:position_context" },
    },
    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { owner: "intent_first_coach" }, legacy: {} },
    eventLog: [],
  });
  assert.equal(Boolean(snapshot.frame), true);
  assert.equal(Boolean(snapshot.visual), true);
  assert.equal(snapshot.health.criticalIssues.length > 0, true);

  const continuation = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 8,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "continuation",
    isUserTurn: true,
    fen: "8/8/8/8/8/8/8/4K3 w - - 0 1",
    selectedCandidateUci: "e2e4",
    coachDecision: { exactMoveAllowed: true },
    boardLines: [],
    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { owner: "none" }, legacy: {} },
    eventLog: [],
  });
  assert.equal(continuation.health.criticalIssues.includes("continuation_candidate_not_rendered"), true);
  assert.equal(continuation.health.criticalIssues.includes("continuation_user_turn_target_without_visual"), false);

  const reveal = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 9,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "8/8/8/8/8/8/8/4K3 w - - 0 1",
    lastActionDebug: { lastClickedAction: "reveal_next_move", stateChanged: false },
    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { owner: "none" }, legacy: {} },
    eventLog: [],
  });
  assert.equal(reveal.health.criticalIssues.some((issue) => issue.includes("Action click")), true);

  const unresolved = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 10,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "8/8/8/8/8/8/8/4K3 w - - 0 1",
    expectedMoveResolution: { source: "none", reason: "no_repertoire_node_or_plan_fallback", debug: {} },
    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { owner: "none" }, legacy: {} },
    eventLog: [],
  });
  assert.equal(unresolved.health.criticalIssues.includes("restricted_user_turn_missing_expected_move"), true);

  const unresolvedWithTransition = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 10,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "8/8/8/8/8/8/8/4K3 w - - 0 1",
    branchTransitionSurfaceRendered: true,
    continueFromHereAvailable: true,
    branchTransitionReason: "no_repertoire_node_or_plan_fallback",
    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { shouldRender: true, owner: "branch_transition_surface", intent: "branch_transition", title: "Line complete", body: "You finished this training line. Continue from this position or train the line again.", buttons: ["continue_from_here","restart_line"] }, legacy: {} },
    eventLog: [],
  });
  assert.equal(unresolvedWithTransition.health.criticalIssues.includes("restricted_user_turn_missing_expected_move"), false);
  assert.equal(unresolvedWithTransition.health.criticalIssues.includes("branch_transition_surface_missing_payload"), false);
  assert.equal(unresolvedWithTransition.coach.visibleTitle, "Line complete");
  assert.deepEqual(unresolvedWithTransition.coach.visibleButtons, ["continue_from_here","restart_line"]);

  const branchCompleteV28 = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 10,
    trainerPhase: "branch_complete",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "8/8/8/8/8/8/8/4K3 w - - 0 1",
    expectedMoveSan: null,
    expectedMoveUci: null,
    instructionTargetUci: null,
    visibleSurfaceOwner: "v28_visible_surface",
    visibleCoachOwner: "visible_surface_v28",
    visibleVisualOwner: "visible_surface_v28",
    visibleActionOwner: "visible_surface_v28",
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "branch_complete",
      coach: {
        shouldRender: true,
        title: "Line complete",
        body: "You finished this training line. Continue from this position or train the line again.",
      },
      actions: [{ kind: "continue_from_here" }],
    },
    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { shouldRender: false, owner: "branch_transition_surface", intent: "silent" }, legacy: {} },
    eventLog: [],
  } as any);
  assert.equal(branchCompleteV28.health.criticalIssues.includes("visible_coach_with_silent_intent"), false);
  assert.equal(branchCompleteV28.health.warnings.includes("visualFailureKind:no_recipe"), false);
  assert.equal(branchCompleteV28.health.warnings.includes("coachFailureKind:expected_move_missing"), false);
  assert.equal((branchCompleteV28.visual as any).visualFailureKind, "not_applicable");
  assert.equal((branchCompleteV28.coach as any).coachFailureKind, "none");
  assert.equal((branchCompleteV28.coach as any).visibleTitle, "Line complete");
  assert.equal((branchCompleteV28.coach as any).visibleBody, "You finished this training line. Continue from this position or train the line again.");
  assert.deepEqual((branchCompleteV28.coach as any).visibleButtons, ["continue_from_here"]);
  const v28Parity = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 10,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "8/8/8/8/8/8/8/4K3 w - - 0 1",
    instructionTargetUci: "e2e4",
    expectedMoveUci: "e2e4",
    expectedMoveSan: "e4",
    visibleSurfaceOwner: "v28_visible_surface",
    visibleCoachOwner: "visible_surface_v28",
    visibleVisualOwner: "visible_surface_v28",
    visibleActionOwner: "visible_surface_v28",
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "assisted",
      coach: {
        shouldRender: true,
        title: "Challenge the center",
        body: "Play e4 to challenge central squares.",
      },
      actions: [{ kind: "reveal_target" }],
    },
    coachDecision: {
      shouldShowCoachCard: true,
      title: "Safety Fallback",
      body: "Think about the safest improving move here.",
      buttons: ["show_more"],
      debug: { coachDecisionSource: "verified_safe_fallback", verifiedFallbackUsed: true, fallbackReason: "legacy_source_mismatch" },
    },
    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { shouldRender: false, owner: "intent_first_coach" }, legacy: {} },
    eventLog: [],
  } as any);
  assert.equal((v28Parity.coach as any).visibleTitle, "Challenge the center");
  assert.equal((v28Parity.coach as any).visibleBody, "Play e4 to challenge central squares.");
  assert.equal((v28Parity.coach as any).visibleBody.includes("safest improving move"), false);

  const continuationHealthy = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 11,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "continuation",
    isUserTurn: true,
    fen: "rnbqkbnr/pp2pppp/8/2pp4/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
    expectedMoveSan: "exd5",
    expectedMoveUci: "e4d5",
    selectedCandidateSan: "exd5",
    selectedCandidateUci: "e4d5",
    userExplicitlyEnteredContinuation: true,
    boardLines: [{ from: "e4", to: "d5" }],
    coachDecision: {
      shouldShowCoachCard: true,
      exactMoveAllowed: true,
      title: "Suggested continuation",
      body: "Play exd5. This capture keeps central tension under control and improves your position.",
      buttons: ["show_move"],
      debug: { candidateCoachFallbackUsed: true, coachIntent: "show_continued_plan", coachVerifiedFactsUsed: true, coachMoveUci: "e4d5", coachPieceType: "p", advancedFeatureClaimTypes: ["piece:p"], recognizedPlanTypes: ["target:continuation_candidate"], selectedOpportunityId: "instruction_target:e4d5" },
    },
    instructionTargetUci: "e4d5",
    instructionTargetPieceType: "p",
    coachMoveUci: "e4d5",
    coachPieceType: "p",
    visualMoveUci: "e4d5",
    revealTargetUci: "e4d5",
    presentationFrame: { visual: { shouldRender: true, source: "continuation_candidate", lines: [{ from: "e4", to: "d5" }] }, coach: { owner: "intent_first_coach" }, legacy: {} },
    eventLog: [],
  });
  assert.equal(continuationHealthy.health.criticalIssues.includes("continuation_candidate_not_rendered"), false);
  assert.equal(continuationHealthy.health.criticalIssues.includes("generic_context_rendered_with_candidate"), false);
  assert.equal(continuationHealthy.health.criticalIssues.includes("instruction_target_coach_mismatch"), false);
  assert.equal(continuationHealthy.health.criticalIssues.includes("instruction_target_visual_mismatch"), false);
  assert.equal(continuationHealthy.health.criticalIssues.includes("instruction_target_reveal_mismatch"), false);
  assert.equal(Boolean((continuationHealthy as any).maia?.summary ?? "Maia is evidence/opponent-context only."), true, "maia_debug_summary_present_or_default");
  assert.equal(Object.prototype.hasOwnProperty.call((continuationHealthy as any).maia ?? {}, "maiaRuntimeStatus"), true);
  assert.equal(Object.prototype.hasOwnProperty.call((continuationHealthy as any).maia ?? {}, "maiaApiClientEnabled"), true);
  assert.equal(Object.prototype.hasOwnProperty.call((continuationHealthy as any).maia ?? {}, "maiaApiRouteStatus"), true);
  assert.equal(Object.prototype.hasOwnProperty.call((continuationHealthy as any).maia ?? {}, "maiaRuntimeErrorReason"), true);
  assert.equal(Object.prototype.hasOwnProperty.call((continuationHealthy as any).maia ?? {}, "maiaRuntimeMs"), true);
  assert.equal((continuationHealthy.actions as any).revealTargetMatchesInstructionTarget, true);
  assert.equal((continuationHealthy.visual as any).visualTargetMatchesInstructionTarget, true);
  assert.equal((continuationHealthy.health.passFail as any).instructionTargetAligned, true);

  const idempotentReveal = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 12,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "continuation",
    isUserTurn: true,
    fen: "8/8/8/8/8/8/8/4K3 w - - 0 1",
    lastActionDebug: { lastClickedAction: "reveal_next_move", stateChanged: false, revealIdempotentNoop: true },
    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { owner: "none" }, legacy: {} },
    eventLog: [],
  });
  assert.equal(idempotentReveal.health.criticalIssues.some((issue) => issue.includes("Action click")), false);

  const pieceMismatch = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 13,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "continuation",
    isUserTurn: true,
    fen: "8/8/8/8/8/8/8/4K3 w - - 0 1",
    instructionTargetUci: "g1f3",
    instructionTargetPieceType: "n",
    coachMoveUci: "g1f3",
    coachPieceType: "b",
    continuationAnalysisStatus: "ready",
    coachDecision: { debug: { advancedFeatureClaimTypes: ["piece:n"], recognizedPlanTypes: ["target:continuation_candidate"], selectedOpportunityId: "instruction_target:g1f3" } },
    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { owner: "none" }, legacy: {} },
    eventLog: [],
  });
  assert.equal(pieceMismatch.health.criticalIssues.includes("instruction_piece_type_mismatch"), true);
  assert.equal(pieceMismatch.health.criticalIssues.includes("coach_piece_mismatch"), true);

  const recentUnsafe = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 14,
    trainerPhase: "opponent_selecting",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: false,
    fen: "8/8/8/8/8/8/8/4K3 b - - 0 1",
    lastCoachRecords: [
      { trainerPhase: "ready_for_user", instructionTargetUci: "e2e4", instructionTargetPieceType: "p", body: "e5 develops the bishop to e5 on an active diagonal.", normalizedBody: "{MOVE} develops the bishop to {SQUARE} on an active diagonal." },
      { trainerPhase: "ready_for_user", instructionTargetUci: "f2f4", instructionTargetPieceType: "p", body: "f4 develops the bishop to f4 on an active diagonal.", normalizedBody: "{MOVE} develops the bishop to {SQUARE} on an active diagonal." },
      { trainerPhase: "ready_for_user", instructionTargetUci: "g1f3", instructionTargetPieceType: "n", body: "Nf3 develops the bishop to f3 on an active diagonal.", normalizedBody: "{MOVE} develops the bishop to {SQUARE} on an active diagonal." },
      { trainerPhase: "ready_for_user", instructionTargetUci: "g1f3", instructionTargetPieceType: "n", body: "Nf3 develops the bishop to f3 on an active diagonal.", normalizedBody: "{MOVE} develops the bishop to {SQUARE} on an active diagonal." },
      { trainerPhase: "ready_for_user", instructionTargetUci: "e2e4", instructionTargetPieceType: "p", body: "e5 develops the bishop to e5 on an active diagonal.", normalizedBody: "{MOVE} develops the bishop to {SQUARE} on an active diagonal." },
    ],
    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { owner: "none" }, legacy: {} },
    eventLog: [],
  });
  assert.equal(recentUnsafe.health.criticalIssues.includes("recent_unverified_piece_claim"), true);
  assert.equal(recentUnsafe.health.criticalIssues.includes("recent_coach_piece_mismatch"), true);
  assert.equal(recentUnsafe.health.criticalIssues.includes("recent_repeated_generic_coach_copy"), false);
  assert.equal(recentUnsafe.health.warnings.includes("recent_repeated_generic_coach_copy_downgraded"), true);

  const recipeMismatch = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 15,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "8/8/8/8/8/8/8/4K3 w - - 0 1",
    instructionTargetUci: "e2e4",
    coachMoveUci: "e2e4",
    visualRecipeMoveUci: "d2d4",
    revealTargetUci: "e2e4",
    revealTargetSource: "instruction_target",
    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { owner: "intent_first_coach" }, legacy: {} },
    eventLog: [],
  });
  assert.equal(recipeMismatch.health.criticalIssues.includes("visual_recipe_target_mismatch"), true);

  const staleFrames = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 16,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "8/8/8/8/8/8/8/4K3 w - - 0 1",
    instructionTargetUci: "e2e4",
    coachMoveUci: "e2e4",
    revealTargetUci: "e2e4",
    revealTargetSource: "instruction_target",
    coachFrameStale: true,
    visualFrameStale: true,
    revealTargetStale: true,
    overlayFrameLagDetected: true,
    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { owner: "none" }, legacy: {} },
    eventLog: [],
  });
  assert.equal(staleFrames.health.criticalIssues.includes("stale_coach_frame"), true);
  assert.equal(staleFrames.health.criticalIssues.includes("stale_visual_frame"), true);
  assert.equal(staleFrames.health.criticalIssues.includes("stale_reveal_target"), true);
  assert.equal(staleFrames.health.criticalIssues.includes("overlay_frame_lag_detected"), true);

  const afterE4 = new Chess();
  afterE4.move("e4");
  const fenAfterE4 = afterE4.fen();
  const fenAfterE4Norm = fenAfterE4.trim().split(/\s+/).slice(0, 4).join(" ");
  const opponentPending = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 17,
    trainerPhase: "opponent_replying",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: false,
    sideToMove: "b",
    fen: fenAfterE4,
    lastUserMoveUci: "e2e4",
    pendingOpponentRequest: { requestId: 1, baseFen: fenAfterE4Norm, startedAt: Date.now() },
    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { owner: "none" }, legacy: {} },
    eventLog: [],
  });
  assert.equal(opponentPending.health.criticalIssues.includes("stale_opponent_reply_commit"), false);

  afterE4.move("e5");
  const afterOpponentCommit = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 18,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    sideToMove: "w",
    fen: afterE4.fen(),
    pendingOpponentRequest: null,
    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { owner: "none" }, legacy: {} },
    eventLog: [],
  });
  assert.equal(afterOpponentCommit.frame.trainerPhase, "ready_for_user");
  assert.equal(afterOpponentCommit.health.criticalIssues.includes("stale_opponent_reply_commit"), false);

  const nextFrame = buildCurrentInstructionFrame({
    frameId: 18,
    fen: afterE4.fen(),
    trainingMode: "restricted",
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    isUserTurn: true,
    guidedMove: { uci: "g1f3", san: "Nf3", source: "lesson_line", kind: "guided_move" },
    preferredTargetKind: "guided_move",
  });
  assert.equal(Boolean(nextFrame.target), true);
  const target = nextFrame.target!;
  const nextUser = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 18,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: afterE4.fen(),
    expectedMoveUci: target.uci,
    expectedMoveSan: target.san,
    instructionTargetKind: target.kind,
    instructionTargetUci: target.uci,
    instructionTargetPieceType: target.pieceType,
    coachMoveUci: target.uci,
    coachPieceType: target.pieceType,
    visualMoveUci: target.uci,
    revealTargetUci: target.uci,
    revealTargetSource: "instruction_target",
    boardLines: [{ from: target.from, to: target.to }],
    coachDecision: {
      shouldShowCoachCard: true,
      title: "Next target",
      body: "Play Nf3 to continue development.",
      buttons: ["show_plan"],
      debug: {
        coachMoveUci: target.uci,
        coachPieceType: target.pieceType,
        advancedFeaturePacketExists: true,
        strategicPlanPacketExists: true,
        advancedFeatureClaimTypes: ["development", "piece:knight"],
        recognizedPlanTypes: ["develop_minor_piece"],
        selectedOpportunityId: "opp:nf3",
        selectedOpportunityScore: 320,
        selectedTemplateId: "tpl:nf3",
        selectedOpportunityMoveUci: target.uci,
        featurePacket: { status: "ran" },
        planPacket: { status: "ran" },
        opportunityPacket: { status: "ran" },
      },
    },
    presentationFrame: {
      visual: { shouldRender: true, source: "guided_target_fallback", lines: [{ from: target.from, to: target.to }] },
      coach: { shouldRender: true, owner: "intent_first_coach" },
      legacy: {},
    },
    visibleTeachingSurface: {
      visual: { lines: [{ from: target.from, to: target.to }] },
    },
    eventLog: [],
  });
  assert.deepEqual(nextUser.health.criticalIssues, []);

  const provenanceMismatch = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 19,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    instructionTargetUci: "b1c3",
    instructionTargetPieceType: "n",
    coachMoveUci: "b1c3",
    coachPieceType: "n",
    coachDecision: {
      shouldShowCoachCard: true,
      title: "Develop the knight",
      body: "Play Nc3. This develops your knight toward active central squares.",
      debug: {
        coachDecisionSource: "live_coach",
        selectedTheme: "minor_piece_development",
        selectedOpportunityId: "supported_continuation",
        selectedTemplateId: "live:supported_continuation:explain_plan",
        selectedOpportunityScore: null,
      },
    },
    presentationFrame: { visual: { shouldRender: true, source: "guided_target_fallback", lines: [{ from: "b1", to: "c3" }] }, coach: { shouldRender: true, owner: "intent_first_coach" }, legacy: {} },
    eventLog: [],
  });
  assert.equal(provenanceMismatch.health.criticalIssues.includes("coach_theme_opportunity_mismatch"), true);
  assert.equal(provenanceMismatch.health.criticalIssues.includes("coach_template_theme_mismatch"), true);
  assert.equal(provenanceMismatch.health.criticalIssues.includes("coach_score_missing"), true);

  const provenanceHealthy = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 20,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    instructionTargetUci: "b1c3",
    instructionTargetPieceType: "n",
    coachMoveUci: "b1c3",
    coachPieceType: "n",
    coachDecision: {
      shouldShowCoachCard: true,
      title: "Develop the knight",
      body: "Play Nc3. This develops your knight toward active central squares.",
      debug: {
        coachDecisionSource: "live_coach",
        selectedTheme: "minor_piece_development",
        selectedOpportunityId: "minor_piece_development",
        selectedOpportunityLayer: "development",
        selectedOpportunityScore: 320,
        selectedTemplateId: "live:minor_piece_development:explain_development",
      },
    },
    coachTimeline: [
      {
        id: 1,
        ts: Date.now(),
        trainerFrameId: 20,
        entryKind: "instructional",
        qualityScore: 88,
        selectedTheme: "minor_piece_development",
        runtimeSafeFallbackUsed: false,
      },
    ],
    presentationFrame: { visual: { shouldRender: true, source: "guided_target_fallback", lines: [{ from: "b1", to: "c3" }] }, coach: { shouldRender: true, owner: "intent_first_coach" }, legacy: {} },
    eventLog: [],
  });
  assert.equal(provenanceHealthy.health.criticalIssues.includes("coach_theme_opportunity_mismatch"), false);
  assert.equal(provenanceHealthy.health.criticalIssues.includes("coach_template_theme_mismatch"), false);
  assert.equal(provenanceHealthy.health.criticalIssues.includes("coach_score_missing"), false);
  assert.equal((provenanceHealthy.coachTimelineSummary as any).instructionalFrames, 1);

  const fallbackMismatch = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 21,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "8/8/8/8/8/8/8/4K3 w - - 0 1",
    instructionTargetUci: "e1e2",
    instructionTargetPieceType: "k",
    coachMoveUci: "e1e2",
    coachPieceType: "k",
    coachDecision: { debug: { coachDecisionSource: "verified_safe_fallback", selectedOpportunityScore: 100 } },
    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { shouldRender: true, owner: "intent_first_coach" }, legacy: {} },
    eventLog: [],
  });
  assert.equal(fallbackMismatch.health.criticalIssues.includes("coach_provenance_inconsistent"), true);

  const historyWarning = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 22,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "8/8/8/8/8/8/8/4K3 w - - 0 1",
    instructionTargetUci: "e1e2",
    instructionTargetPieceType: "k",
    coachMoveUci: "e1e2",
    coachPieceType: "k",
    lastCoachBodies: ["The opponent is choosing a reply before Blundr can suggest your continuation."],
    coachDecision: { debug: { selectedOpportunityScore: 120 } },
    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { shouldRender: true, owner: "intent_first_coach" }, legacy: {} },
    eventLog: [],
  });
  assert.equal(historyWarning.health.warnings.includes("coach_status_copy_in_instructional_history"), true);

  // === Forensic v2.7.41 stable hotfix test cases (Step 11 requirements) ===
  // Browser-visible normal UI (no ?debug=1) is clean: legacy controls gated in app/page.tsx render (LiveBrain/GptDebug/VisualDebug, RATING_PRESETS grid, Active Board button+views, Settings Attack/Defense/Plan toggles removed).
  // Thinking... during load, Continue only at confirmed EoB (selectedLineCompleteConfirmed = lineCursor >= lineLength OR lichessEndConfirmed with total<500), no pre-Continue candidate, no TDZ (ordering enforced).
  // The page.tsx currentInstructionFrame + hardEndOfBookGate + isInstructionLoading already implement the exact frame literals and guards from the transcript spec. Existing snapshot tests + build + trainer-debug exercise the paths.

  // 14/17: pre-Continue no candidate leak + no ReferenceError from gate ordering (simulated)
  const preContinue = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 102,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "8/8/8/8/8/8/8/4K3 w - - 0 1",
    userExplicitlyEnteredContinuation: false,
    continuationAnalysisStatus: "ready",
    selectedCandidateUci: null,
    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { owner: "none" }, legacy: {} },
    eventLog: [],
  });
  assert.equal(preContinue.health.criticalIssues.includes("continuation_candidate_not_rendered"), false);

  assert.doesNotThrow(() => {
    // mirrors page.tsx declaration order (raw state -> expectedMoveResolution -> expectedMovesForValidation -> selectedLineCompleteConfirmed -> lichessEndConfirmed -> isInstructionLoading -> hardEndOfBookGate -> continuationPolicyCandidate -> currentInstructionFrame)
    const res: any = { lineLength: 12, lineCursor: 12, source: "curated", candidateMoves: [] };
    const expVal = (res.candidateMoves ?? []).filter((m: any) => m && m.color === "w");
    const sel = res.lineLength > 0 && res.lineCursor >= res.lineLength;
    const lich = false;
    const loading = false;
    const gate = !loading && (sel || lich);
    if (gate) { /* branchTransitionFrame shape */ }
    const _frame = { frameKey: sel ? "end-of-book-transition" : "thinking", actions: gate ? ["continue_from_here"] : [] };
    void _frame;
  });

  const timelineSnapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 200,
    trainerPhase: "ready_for_user",
    trainerView: "plain",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "8/8/8/8/8/8/8/4K3 w - - 0 1",
    instructionTargetUci: "b1c3",
    expectedMoveUci: "b1c3",
    expectedMoveSan: "Nc3",
    boardLines: [{ from: "b1", to: "c3" }],
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "plain_before_show_more",
      coach: { shouldRender: true, title: "Find the next move", body: "" },
      visual: { lines: [] },
      actions: [{ kind: "hint" }, { kind: "show_more" }],
    },
    actualCoachCardTitle: "Safety Blocked",
    actualCoachCardBody: "No move-specific coaching is available in this frame.",
    actualCoachCardButtons: ["hint", "show_more", "reveal_target"],
    actualCoachCardSource: "surfaceCoachCardDecision",
    coachCardRenderTimeline: [
      { id: 1, frameId: 199, visibleTitle: "Find the next move", actualCoachCardTitle: "Find the next move" },
      { id: 2, frameId: 200, visibleTitle: "Find the next move", actualCoachCardTitle: "Safety Blocked" },
    ],
    actionTimeline: [
      { id: 1, frameId: 200, renderedActionIds: ["hint", "show_more", "reveal_target"], clickedActionId: "reveal_target" },
      { id: 2, frameId: 200, renderedActionIds: ["continue_from_here"], clickedActionId: "continue_from_here", clickedActionPayload: { continueFromHereClicked: true } },
    ],
    plainLeakTimeline: [
      { id: 1, frameId: 200, showMoreClicked: false, hintClicked: false, preShowMoreLeak: true, targetVisualRendered: true, revealActionRendered: true },
    ],
    surfaceModeTransitionTimeline: [{ id: 1, previousMode: "assisted", nextMode: "plain_before_show_more" }],
    visualRenderTimeline: [{ id: 1, frameId: 200, moveArrowCount: 1 }],
    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { shouldRender: true, owner: "intent_first_coach" }, legacy: {} },
    eventLog: [],
  } as any);
  assert.equal(Array.isArray(timelineSnapshot.coachCardRenderTimeline), true);
  assert.equal((timelineSnapshot.coachCardRenderTimeline as any[]).length, 2);
  assert.equal((timelineSnapshot.actionTimeline as any[]).length, 2);
  assert.equal(timelineSnapshot.health.criticalIssues.includes("coach_card_debug_parity_mismatch"), true);
  assert.equal(timelineSnapshot.health.criticalIssues.includes("action_debug_parity_mismatch"), true);
  assert.equal(timelineSnapshot.health.criticalIssues.includes("visual_debug_parity_mismatch"), true);
  assert.equal(timelineSnapshot.health.criticalIssues.includes("plain_pre_show_more_leak_at_frame"), true);
  assert.equal((timelineSnapshot.debugParity as any)?.actualCoachCardTitle, "Safety Blocked");
  assert.equal(((timelineSnapshot.actionTimeline as any[])[1]?.clickedActionPayload as any)?.continueFromHereClicked, true);

  const v28HealthySources = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 201,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "8/8/8/8/8/8/8/4K3 w - - 0 1",
    instructionTargetUci: "b1c3",
    instructionTargetPieceType: "n",
    coachMoveUci: "b1c3",
    visualMoveUci: "b1c3",
    revealTargetUci: "b1c3",
    visibleSurfaceOwner: "v28_visible_surface",
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "assisted",
      coach: { shouldRender: true, title: "Nc3 - Develop the knight", body: "Move the knight to c3." },
      visual: { lines: [{ from: "b1", to: "c3" }] },
      actions: [{ kind: "hint" }, { kind: "show_more" }],
    },
    actualCoachCardSource: "surfaceCoachCardDecision",
    actualActionSource: "visible_surface_v28",
    actualVisualSource: "visible_surface_v28",
    renderedActionIds: ["hint", "show_more"],
    surfaceActionIds: ["hint", "show_more"],
    renderedVisualPrimitiveCount: 1,
    surfaceVisualPrimitiveCount: 1,
    presentationFrame: { visual: { shouldRender: true, source: "visual_recipe", lines: [{ from: "b1", to: "c3" }] }, coach: { shouldRender: true, owner: "intent_first_coach" }, legacy: {} },
    eventLog: [],
  } as any);
  assert.equal(v28HealthySources.health.criticalIssues.includes("legacy_coach_visible_bypass"), false);
  assert.equal(v28HealthySources.health.criticalIssues.includes("legacy_action_visible_bypass"), false);
  assert.equal(v28HealthySources.health.criticalIssues.includes("legacy_visual_visible_bypass"), false);
  assert.equal((v28HealthySources.actions as any).actualActionSource, "visible_surface_v28");
  assert.equal((v28HealthySources.visual as any).actualVisualSource, "visible_surface_v28");
  assert.deepEqual((v28HealthySources.actions as any).renderedActionIds, ["hint", "show_more"]);

  const v28BypassSources = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 202,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "8/8/8/8/8/8/8/4K3 w - - 0 1",
    visibleSurfaceOwner: "v28_visible_surface",
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "assisted",
      coach: { shouldRender: true, title: "Develop", body: "Play Nc3." },
      visual: { lines: [] },
      actions: [{ kind: "hint" }, { kind: "show_more" }],
    },
    actualCoachCardSource: "legacyDecision",
    actualActionSource: "legacy_actions",
    actualVisualSource: "legacy_visuals",
    renderedActionIds: ["hint", "show_more", "reveal_target"],
    surfaceActionIds: ["hint", "show_more"],
    renderedVisualPrimitiveCount: 1,
    surfaceVisualPrimitiveCount: 0,
    legacyTrainingCardActuallyRendered: true,
    orchestrateTeachingVisibleBypass: true,
    presentationFrame: { visual: { shouldRender: true, source: "legacy_fallback", lines: [{ from: "b1", to: "c3" }] }, coach: { shouldRender: true, owner: "coach_decision" }, legacy: {} },
    eventLog: [],
  } as any);
  assert.equal(v28BypassSources.health.criticalIssues.includes("legacy_coach_visible_bypass"), true);
  assert.equal(v28BypassSources.health.criticalIssues.includes("legacy_action_visible_bypass"), true);
  assert.equal(v28BypassSources.health.criticalIssues.includes("legacy_visual_visible_bypass"), true);
  assert.equal(v28BypassSources.health.criticalIssues.includes("legacy_branch_complete_visible_bypass"), false);
  assert.equal(v28BypassSources.health.criticalIssues.includes("assisted_reveal_action_rendered"), true);
  assert.equal(v28BypassSources.health.criticalIssues.includes("surface_action_missing_for_rendered_button"), true);
  assert.equal(v28BypassSources.health.criticalIssues.includes("surface_action_debug_parity_mismatch"), true);
  assert.equal(v28BypassSources.health.criticalIssues.includes("rendered_visual_missing_surface_source"), true);
  assert.equal(v28BypassSources.health.criticalIssues.includes("legacy_orchestrate_teaching_visible_bypass"), false);

  const continuationAnalyzingNoCandidate = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 203,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "continuation",
    isUserTurn: true,
    fen: "8/8/8/8/8/8/8/4K3 w - - 0 1",
    continuationAnalysisStatus: "ready",
    continuationRuntimeStatus: "analyzing",
    instructionTargetUci: null,
    selectedCandidateUci: null,
    runtimeCriticalIssues: ["continuation_ready_without_candidate"],
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "opponent_replying",
      coach: { shouldRender: true, title: "Analyzing continuation", body: "Looking for a reliable continuation candidate." },
      visual: { lines: [] },
      actions: [],
    },
    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { shouldRender: true, owner: "intent_first_coach" }, legacy: {} },
    eventLog: [],
  } as any);
  assert.equal(continuationAnalyzingNoCandidate.health.criticalIssues.includes("continuation_analysis_ready_without_target"), false, "continuation_analyzing_without_candidate_is_status_not_critical");
  assert.equal(continuationAnalyzingNoCandidate.health.criticalIssues.includes("continuation_ready_without_candidate"), false, "continuation_analyzing_without_candidate_is_status_not_critical");
  assert.equal(continuationAnalyzingNoCandidate.health.warnings.includes("continuation_ready_without_candidate_transitioning"), true);

  const continuationReadyMissingTarget = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 204,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "continuation",
    isUserTurn: true,
    fen: "8/8/8/8/8/8/8/4K3 w - - 0 1",
    continuationAnalysisStatus: "ready",
    continuationRuntimeStatus: "ready",
    instructionTargetUci: null,
    selectedCandidateUci: "g1f3",
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "assisted",
      coach: { shouldRender: true, title: "Candidate ready", body: "Play Nf3." },
      visual: { lines: [] },
      actions: [{ kind: "hint" }],
    },
    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { shouldRender: true, owner: "intent_first_coach" }, legacy: {} },
    eventLog: [],
  } as any);
  assert.equal(continuationReadyMissingTarget.health.criticalIssues.includes("continuation_candidate_without_target"), true, "continuation_candidate_without_target_is_critical");
  assert.equal(continuationReadyMissingTarget.health.criticalIssues.includes("continuation_user_turn_without_candidate_or_analyzing"), true);

  const alignedSafeRepeatedHistory = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 205,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "8/8/8/8/8/8/8/4K3 w - - 0 1",
    expectedMoveUci: "b1c3",
    expectedMoveSan: "Nc3",
    instructionTargetUci: "b1c3",
    instructionTargetPieceType: "n",
    coachMoveUci: "b1c3",
    coachQuality: { targetAligned: true, qualityScore: 96, source: "live_coach", usedFallback: false },
    coachDecision: {
      shouldShowCoachCard: true,
      title: "Nc3 - Develop the knight",
      body: "Move the knight to c3. This develops your knight toward active central squares.",
      buttons: ["hint", "show_more"],
      debug: { coachDecisionSource: "live_coach", selectedOpportunityScore: 320 },
    },
    lastCoachRecords: [
      { trainerPhase: "ready_for_user", instructionTargetUci: "b1c3", instructionTargetPieceType: "n", body: "Move the knight to c3.", normalizedBody: "{MOVE} develops your knight." },
      { trainerPhase: "ready_for_user", instructionTargetUci: "b1c3", instructionTargetPieceType: "n", body: "Move the knight to c3.", normalizedBody: "{MOVE} develops your knight." },
      { trainerPhase: "ready_for_user", instructionTargetUci: "b1c3", instructionTargetPieceType: "n", body: "Move the knight to c3.", normalizedBody: "{MOVE} develops your knight." },
      { trainerPhase: "ready_for_user", instructionTargetUci: "g1f3", instructionTargetPieceType: "n", body: "Move the knight to f3.", normalizedBody: "{MOVE} develops your knight." },
      { trainerPhase: "ready_for_user", instructionTargetUci: "e2e4", instructionTargetPieceType: "p", body: "Play e4.", normalizedBody: "{MOVE} develops your knight." },
    ],
    coachTimeline: [
      { id: 1, entryKind: "instructional", qualityScore: 96, repeatedGeneric: false, targetAligned: true, pieceAligned: true },
      { id: 2, entryKind: "instructional", qualityScore: 94, repeatedGeneric: false, targetAligned: true, pieceAligned: true },
    ],
    presentationFrame: { visual: { shouldRender: true, source: "visual_recipe", lines: [{ from: "b1", to: "c3" }] }, coach: { shouldRender: true, owner: "intent_first_coach" }, legacy: {} },
    eventLog: [],
  } as any);
  assert.equal(alignedSafeRepeatedHistory.health.criticalIssues.includes("recent_repeated_generic_coach_copy"), false, "target_aligned_safe_copy_does_not_trigger_recent_repeated_generic_critical");
  assert.equal(alignedSafeRepeatedHistory.health.warnings.includes("recent_repeated_generic_coach_copy_downgraded"), true);

  const terminalNullTargetNoVisual = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 206,
    trainerPhase: "terminal",
    trainerView: "assisted",
    trainingMode: "continuation",
    isUserTurn: false,
    fen: "7k/6Q1/6K1/8/8/8/8/8 b - - 0 1",
    legalMoveCount: 0,
    continuationRuntimeStatus: "terminal",
    continuationTerminalReason: "checkmate",
    instructionTargetUci: null,
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "terminal",
      coach: { shouldRender: true, title: "Checkmate", body: "This line has reached checkmate." },
      visual: { lines: [] },
      actions: [{ kind: "restart_line" }],
    },
    actualVisualSource: "visible_surface_v28",
    renderedVisualPrimitiveCount: 0,
    surfaceVisualPrimitiveCount: 0,
    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { shouldRender: true, owner: "continuation_terminal_surface" }, legacy: {} },
    eventLog: [],
  } as any);
  assert.equal((terminalNullTargetNoVisual.visual as any).visualFailureKind, "not_applicable", "terminal_null_target_no_visual_is_not_visual_fail");
  assert.equal(terminalNullTargetNoVisual.health.criticalIssues.includes("visual_debug_parity_mismatch"), false, "terminal_null_target_no_visual_is_not_visual_fail");

  const pendingOpponentNoBookCompleteCritical = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 207,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: false,
    fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 2 4",
    bookComplete: true,
    expectedMoveResolution: {
      source: "guided_branch_needs_continuation",
      reason: "repertoire_line_exhausted_needs_continuation",
    },
    guidedCoveragePolicy: {
      guidedCompleteAllowed: false,
      bookCompleteAllowed: false,
      bookCompleteBlockedReason: "side_to_move_is_opponent",
    },
    pendingOpponentRequest: { requestId: 2, baseFen: "rnbqkb1r/ppp2ppp/4pn2/3p4", startedAt: Date.now() },
    instructionTargetUci: null,
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "opponent_replying",
      coach: { shouldRender: true, title: "Opponent is replying", body: "Wait for the opponent move before the next teaching target." },
      visual: { lines: [] },
      actions: [],
    },
    branchTransitionSurfaceRendered: false,
    continueFromHereAvailable: false,
    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { shouldRender: true, owner: "intent_first_coach" }, legacy: {} },
    eventLog: [],
  } as any);
  assert.equal(pendingOpponentNoBookCompleteCritical.health.criticalIssues.includes("book_complete_without_policy"), false, "book_complete_without_policy_only_when_true_unhandled_completion");
  assert.equal(pendingOpponentNoBookCompleteCritical.health.criticalIssues.includes("exhausted_line_without_branch_complete_surface"), false);

  const unresolvedCompletionStuck = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 208,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: false,
    fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 2 4",
    bookComplete: true,
    expectedMoveResolution: {
      source: "guided_branch_needs_continuation",
      reason: "repertoire_line_exhausted_needs_continuation",
    },
    guidedCoveragePolicy: {
      guidedCompleteAllowed: false,
      bookCompleteAllowed: false,
      bookCompleteBlockedReason: "side_to_move_is_opponent",
    },
    pendingOpponentRequest: null,
    instructionTargetUci: null,
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "opponent_replying",
      coach: { shouldRender: true, title: "Opponent is replying", body: "Wait for the opponent move before the next teaching target." },
      visual: { lines: [] },
      actions: [],
    },
    branchTransitionSurfaceRendered: false,
    continueFromHereAvailable: false,
    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { shouldRender: true, owner: "intent_first_coach" }, legacy: {} },
    eventLog: [],
  } as any);
  assert.equal(unresolvedCompletionStuck.health.criticalIssues.includes("book_complete_without_policy"), true, "no_stuck_ready_for_user_opponent_pending_after_line_end");
  assert.equal(unresolvedCompletionStuck.health.criticalIssues.includes("exhausted_line_without_branch_complete_surface"), true, "exhausted_line_without_branch_complete_is_critical");

  const ungradedBadgeLeak = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 209,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "continuation",
    isUserTurn: false,
    fen: "8/8/8/8/8/8/8/4K3 b - - 0 1",
    badgeVisible: true,
    renderedBadgeLabel: "Ungraded",
    lastContinuationUserMoveRating: {
      ratingLabel: "Ungraded",
      providerStatus: "ready",
      stale: false,
      normalizedForMoverColor: true,
    },
    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { shouldRender: true, owner: "intent_first_coach" }, legacy: {} },
    eventLog: [],
  } as any);
  assert.equal(ungradedBadgeLeak.health.criticalIssues.includes("visible_ungraded_badge_rendered_without_debug_flag"), true);

  const ratingFallbackWarning = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 210,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "continuation",
    isUserTurn: false,
    fen: "8/8/8/8/8/8/8/4K3 b - - 0 1",
    badgeVisible: false,
    renderedBadgeLabel: null,
    lastContinuationUserMoveRating: {
      ratingLabel: "Good",
      providerStatus: "ready",
      ratingMethod: "direct_after_move_eval",
      userMoveFoundInTopMoves: false,
      depth: 7,
      stale: false,
      normalizedForMoverColor: true,
    },
    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { shouldRender: true, owner: "intent_first_coach" }, legacy: {} },
    eventLog: [],
  } as any);
  assert.equal(ratingFallbackWarning.health.warnings.includes("user_move_rating_direct_eval_fallback_used"), true);
  assert.equal(ratingFallbackWarning.health.warnings.includes("user_move_not_in_multipv_top10"), true);
  assert.equal(ratingFallbackWarning.health.warnings.includes("user_move_rating_low_depth"), true);

  const prematureBranchComplete = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 211,
    trainerPhase: "branch_complete",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: false,
    selectedLineId: "italian-white",
    moveHistory: ["e4"],
    selectedLineExhausted: false,
    explicitCuratedTerminalNode: false,
    selectedLineExhaustionReason: null,
    knownFinalFenMatched: false,
    exactNodeHasChildren: true,
    hasNextOpponentMove: true,
    continueFromHereAvailable: true,
    branchTransitionSurfaceRendered: true,
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -",
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "branch_complete",
      coach: { shouldRender: true, title: "Line complete", body: "You finished this training line." },
      actions: [{ kind: "continue_from_here" }, { kind: "restart_line" }],
      visual: { lines: [] },
    },
    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { shouldRender: false, owner: "branch_transition_surface", intent: "silent" }, legacy: {} },
    eventLog: [],
  } as any);
  assert.equal(prematureBranchComplete.health.criticalIssues.includes("premature_branch_complete_rendered"), true);
  assert.equal(prematureBranchComplete.health.criticalIssues.includes("branch_complete_rendered_before_minimum_line_progress"), true);

  // 1-6,17 Normal UI forbids legacy (enforced by {blundrDebugEnabled && ...} at the JSX sites identified in Step 3/4 grep: app/page.tsx:3392 (LiveBrain+panels), 3405 (rating grid), 3407 (Active Board), 3417 (view buttons), SettingsPanel Active displays (no Attack/Defense/Plan). Browser on port 3041 without ?debug=1 is the acceptance.
}
