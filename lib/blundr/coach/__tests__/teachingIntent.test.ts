import assert from "node:assert/strict";

import { buildCoachEvidencePacket } from "../../coachBrain/coachEvidenceBuilder";
import { resolveCoachTeachingIntent } from "../teachingIntent";

export function testTeachingIntent(): void {
  const packet = buildCoachEvidencePacket({
    frameId: "1",
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
    viewMode: "assisted",
    trainingMode: "restricted",
    bookStatus: "in_book",
    expectedMoveUci: "f1c4",
    expectedMoveSan: "Bc4",
  });
  assert.equal(resolveCoachTeachingIntent({ packet, interaction: "none", hasVisualRecipe: true }), "explain_visual_recipe");
  assert.equal(resolveCoachTeachingIntent({ packet: { ...packet, viewMode: "plain" }, interaction: "hint", hasVisualRecipe: false }), "recall_hint");
  assert.equal(resolveCoachTeachingIntent({ packet, interaction: "hide", hasVisualRecipe: true }), "silent");
}
