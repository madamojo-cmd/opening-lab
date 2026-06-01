import assert from "node:assert/strict";

import { canMakeCenterTensionDominant, canMakeKingSafetyDominant } from "../../coachBrain/boardClaimValidator";
import { buildCoachEvidencePacket } from "../../coachBrain/coachEvidenceBuilder";

export function testGenericDominancePolicy(): void {
  const packet = buildCoachEvidencePacket({
    frameId: "1",
    fen: "r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 6",
    viewMode: "assisted",
    trainingMode: "restricted",
    bookStatus: "in_book",
    expectedMoveUci: "c2c3",
    expectedMoveSan: "c3",
    trainingContext: { conceptId: "prepare_center_break" },
  });
  assert.equal(canMakeCenterTensionDominant(packet), true);
  assert.equal(typeof canMakeKingSafetyDominant(packet), "boolean");
}
