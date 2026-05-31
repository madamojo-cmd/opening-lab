import assert from "node:assert/strict";

import { AnimationConductor } from "../../animation/animationConductor";
import { buildCoachEvidencePacket } from "../../coachBrain/coachEvidenceBuilder";
import { decideIntentFirstCoach } from "../../coach/intentFirstCoachEngine";
import { compileVisualRecipe } from "../../visualRecipe/visualRecipeCompiler";
import { GOLDEN_POSITIONS } from "../goldenPositions";

export function testItalianCastlingGolden(): void {
  const g = GOLDEN_POSITIONS.italianCastling;
  const recipe = compileVisualRecipe({ trainingContext: { mode: "move_teaching", moveTrust: "book_supported", contextTrust: "safe_context", nextPlay: { allowed: true }, cue: { conceptId: g.conceptId, metadata: { moveUci: g.moveUci, moveSan: g.moveSan } } } as any, fen: g.fen, viewMode: "assisted", revealState: "hidden", expectedMoveUci: g.moveUci, expectedMoveSan: g.moveSan, frameId: 1 });
  const primitives = recipe.beats.flatMap((beat) => beat.primitives) as any[];
  assert.equal(primitives.some((p) => p.from === "e1" && p.to === "g1"), true);
  assert.equal(primitives.some((p) => p.from === "h1" && p.to === "f1"), true);
  const held = new AnimationConductor().sync({ recipe, nowMs: 1, reducedMotionMode: "reduce", context: { phase: "ready_for_user", viewMode: "assisted", boardFen: g.fen, trainerFrameId: 1, overlayFrameId: 1, userToMove: true, adapterAllowed: true } });
  assert.equal(held.activePrimitiveIds.some((id) => id.includes("move_arrow:e1:g1")), true);
  const packet = buildCoachEvidencePacket({ frameId: "1", fen: g.fen, viewMode: "assisted", trainingMode: "restricted", bookStatus: "in_book", expectedMoveUci: g.moveUci, expectedMoveSan: g.moveSan });
  const coach = decideIntentFirstCoach({ packet, interaction: "none", conceptId: g.conceptId, openingId: "italian", visualRecipeId: recipe.visualRecipeId });
  assert.equal(/castle|king|rook/i.test(coach.body), true);
}
