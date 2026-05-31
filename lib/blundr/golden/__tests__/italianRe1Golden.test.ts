import assert from "node:assert/strict";

import { buildCoachEvidencePacket } from "../../coachBrain/coachEvidenceBuilder";
import { decideIntentFirstCoach } from "../../coach/intentFirstCoachEngine";
import { GOLDEN_POSITIONS } from "../goldenPositions";

export function testItalianRe1Golden(): void {
  const g = GOLDEN_POSITIONS.italianRe1;
  const packet = buildCoachEvidencePacket({ frameId: "1", fen: g.fen, viewMode: "assisted", trainingMode: "restricted", bookStatus: "in_book", expectedMoveUci: g.moveUci, expectedMoveSan: g.moveSan });
  const coach = decideIntentFirstCoach({ packet, interaction: "none", conceptId: g.conceptId, openingId: "italian", visualRecipeId: "r" });
  assert.equal(/fork|pin|skewer|mate|forced win/i.test(coach.body), false);
}
