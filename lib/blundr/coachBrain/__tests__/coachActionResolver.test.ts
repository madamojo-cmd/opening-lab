import assert from "node:assert/strict";
import { buildCoachEvidencePacket } from "../coachEvidenceBuilder";
import { resolveCoachAction } from "../coachActionResolver";

export function testCoachActionResolver(): void {
  const fen = "r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQK2R w KQkq - 0 6";
  const packet = buildCoachEvidencePacket({
    frameId: "7",
    trainerFrameId: "7",
    fen,
    viewMode: "plain",
    trainingMode: "continuation",
    bookStatus: "out_of_book",
    selectedCandidateMoveUci: "e1g1",
    selectedCandidateMoveSan: "O-O",
    enginePreview: { pvs: [{ uci: "e1g1", san: "O-O", cp: 40 }] },
  });

  const hint = resolveCoachAction(packet, "hint");
  assert.equal(hint.interaction, "hint");

  const plan = resolveCoachAction(packet, "show_plan");
  assert.equal(plan.interaction, "show_plan");

  const analyze = resolveCoachAction(packet, "analyze_idea");
  assert.equal(analyze.interaction, "analyze_idea");

  const showMoveAllowed = resolveCoachAction({ ...packet, exactMoveAllowed: true }, "show_move");
  assert.equal(showMoveAllowed.interaction, "show_move");

  const showMoveBlocked = resolveCoachAction({ ...packet, exactMoveAllowed: false }, "show_move");
  assert.equal(showMoveBlocked.interaction, "show_plan");
}
