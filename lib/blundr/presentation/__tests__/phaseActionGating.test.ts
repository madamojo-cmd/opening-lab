import assert from "node:assert/strict";

import { attributeLastMove, decideTrainerPhaseActionGate } from "../phaseActionGating";

export function testPhaseActionGating(): void {
  const opponentSelecting = decideTrainerPhaseActionGate({
    trainerPhase: "opponent_selecting",
    isUserTurn: false,
    trainingMode: "restricted",
    expectedMoveSan: null,
    expectedMoveUci: null,
    trustedContinuationCandidateAvailable: false,
    coachShouldShow: true,
    coachButtons: ["hint", "show_plan", "analyze_idea", "answer", "show_move"],
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
    coachButtons: ["hint", "show_plan", "analyze_idea", "answer", "hide"],
  });
  assert.equal(userTurn.shouldRenderCoach, true);
  assert.deepEqual(userTurn.filteredButtons, ["hint", "show_plan", "analyze_idea", "answer", "hide"]);
  assert.equal(userTurn.revealButtonVisible, true);

  const missingExpectedMove = decideTrainerPhaseActionGate({
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    trainingMode: "restricted",
    expectedMoveSan: null,
    expectedMoveUci: null,
    trustedContinuationCandidateAvailable: false,
    coachShouldShow: true,
    coachButtons: ["hint", "answer"],
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
}
