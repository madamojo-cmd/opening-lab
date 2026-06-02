import assert from "node:assert/strict";

import { attributeLastMove, decideTrainerPhaseActionGate } from "../phaseActionGating";
import { getVisibleCoachActions, getVisibleActionLabel, filterToVisibleCoachActions, type VisibleCoachAction } from "../visibleActionPolicy";

export function testPhaseActionGating(): void {
  const opponentSelecting = decideTrainerPhaseActionGate({
    trainerPhase: "opponent_selecting",
    isUserTurn: false,
    trainingMode: "restricted",
    expectedMoveSan: null,
    expectedMoveUci: null,
    trustedContinuationCandidateAvailable: false,
    coachShouldShow: true,
    coachButtons: ["hint", "show_more"],
  });
  assert.equal(opponentSelecting.shouldRenderCoach, false);
  assert.deepEqual(opponentSelecting.filteredButtons, []);
  assert.equal(opponentSelecting.revealButtonVisible, false);
  assert.equal(opponentSelecting.blockedReason, "opponent_selecting");

  const userTurn = decideTrainerPhaseActionGate({
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    trainingMode: "restricted",
    expectedMoveSan: "Nbd2",
    expectedMoveUci: "b1d2",
    trustedContinuationCandidateAvailable: false,
    coachShouldShow: true,
    coachButtons: ["hint", "show_more", "continue_from_here", "hide"],
  });
  assert.equal(userTurn.shouldRenderCoach, true);
  // v2.7.40: filtered now only visible policy (legacy dropped by gate)
  assert.deepEqual(userTurn.filteredButtons, ["hint", "show_more", "continue_from_here"]);
  assert.equal(userTurn.revealButtonVisible, true);

  const missingExpectedMove = decideTrainerPhaseActionGate({
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    trainingMode: "restricted",
    expectedMoveSan: null,
    expectedMoveUci: null,
    trustedContinuationCandidateAvailable: false,
    coachShouldShow: true,
    coachButtons: ["hint", "show_more"],
  });
  assert.equal(missingExpectedMove.shouldRenderCoach, false);
  assert.equal(missingExpectedMove.revealButtonVisible, false);
  assert.equal(missingExpectedMove.blockedReason, "missing_expected_move");

  const attribution = attributeLastMove({
    lastMoveSan: "Nbd2",
    lastMoveUci: "b1d2",
    lastMoveColor: "w",
    userColor: "w",
  });
  assert.equal(attribution.lastUserMoveSan, "Nbd2");
  assert.equal(attribution.lastUserMoveUci, "b1d2");
  assert.equal(attribution.lastOpponentMoveSan, null);
  assert.equal(attribution.lastOpponentMoveUci, null);

  const opponentAttribution = attributeLastMove({
    lastMoveSan: "Nf6",
    lastMoveUci: "g8f6",
    lastMoveColor: "b",
    userColor: "w",
  });
  assert.equal(opponentAttribution.lastUserMoveSan, null);
  assert.equal(opponentAttribution.lastOpponentMoveSan, "Nf6");
  assert.equal(opponentAttribution.lastOpponentMoveUci, "g8f6");

  // === v2.7.40 Agent 2 required policy tests (added to phase gating test file per instructions) ===
  // Assisted teaching frame produces no forbidden actions (exactly [])
  const assistedTeaching = getVisibleCoachActions({ trainerView: "assisted", trainerPhase: "ready_for_user", isUserTurn: true, trainingMode: "restricted", hasActiveTarget: true });
  assert.deepEqual(assistedTeaching.actions, []);
  assert.equal(assistedTeaching.frameKind, "assisted_teaching");
  assert.ok(!assistedTeaching.actions.includes("answer" as any));
  assert.ok(!assistedTeaching.actions.includes("show_plan" as any));

  // Plain teaching frame pre-ShowMore produces exactly ["hint", "show_more"]
  const plainPre = getVisibleCoachActions({ trainerView: "plain", trainerPhase: "ready_for_user", isUserTurn: true, trainingMode: "restricted", answerShown: false, hasActiveTarget: true });
  assert.deepEqual(plainPre.actions, ["hint", "show_more"] as VisibleCoachAction[]);
  assert.equal(plainPre.frameKind, "plain_teaching");

  // Branch transition produces exactly ["continue_from_here","restart_line"]
  const branch = getVisibleCoachActions({ trainerView: "assisted", trainerPhase: "ready_for_user", isUserTurn: true, trainingMode: "continuation", isBranchTransition: true, coachOwner: "branch_transition_surface" });
  assert.deepEqual(branch.actions, ["continue_from_here", "restart_line"] as VisibleCoachAction[]);
  assert.equal(branch.frameKind, "branch_transition");

  // Terminal / opponent frames produce [] for teaching actions
  const terminal = getVisibleCoachActions({ trainerView: "plain", trainerPhase: "terminal", isUserTurn: false, trainingMode: "restricted", isTerminal: true });
  assert.deepEqual(terminal.actions, []);
  const opponentFrame = getVisibleCoachActions({ trainerView: "assisted", trainerPhase: "opponent_selecting", isUserTurn: false, trainingMode: "restricted" });
  assert.deepEqual(opponentFrame.actions, []);

  // Forbidden labels do not appear in policy output or CoachCard for teaching frames (labels test)
  const allPlain = getVisibleCoachActions({ trainerView: "plain", trainerPhase: "ready_for_user", isUserTurn: true, trainingMode: "restricted", answerShown: false });
  allPlain.actions.forEach(a => {
    const lbl = getVisibleActionLabel(a);
    assert.ok(!/reveal|show answer|show move|show plan|analyze|attack|defense|plan|verified/i.test(lbl), `Forbidden label leaked: ${lbl}`);
  });
  const filteredLegacy = filterToVisibleCoachActions(["hint", "answer", "show_plan", "analyze_idea", "continue_from_here"]);
  assert.deepEqual(filteredLegacy, ["hint", "continue_from_here"] as VisibleCoachAction[]);

  console.log("✓ v2.7.40 visibleActionPolicy regression tests passed (assisted=[], plain=[hint,show_more], branch=[continue,restart], terminal=[], no forbidden)");
}
