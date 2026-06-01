import assert from "node:assert/strict";

import { buildCoachEvidencePacket } from "../../coachBrain/coachEvidenceBuilder";
import { decideIntentFirstCoach } from "../../coach/intentFirstCoachEngine";
import { GOLDEN_POSITIONS } from "../goldenPositions";

export function testItalianBc4Golden(): void {
  const g = GOLDEN_POSITIONS.italianBc4;
  const packet = buildCoachEvidencePacket({ frameId: "1", fen: g.fen, viewMode: "assisted", trainingMode: "restricted", bookStatus: "in_book", expectedMoveUci: g.moveUci, expectedMoveSan: g.moveSan });
  const coach = decideIntentFirstCoach({ packet, interaction: "none", conceptId: g.conceptId, openingId: "italian", visualRecipeId: "r" });
  assert.equal(/bishop|development/i.test(coach.body), true);
  if (coach.body.includes("f7")) assert.equal(packet.moveFacts?.movedPieceAttacksAfter.includes("f7"), true);
}
