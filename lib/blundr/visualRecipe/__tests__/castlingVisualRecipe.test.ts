import assert from "node:assert/strict";

import { compileVisualRecipe } from "../visualRecipeCompiler";

export function testCastlingVisualRecipe(): void {
  const recipe = compileVisualRecipe({
    trainingContext: { mode: "move_teaching", moveTrust: "book_supported", contextTrust: "safe_context", nextPlay: { allowed: true }, cue: { conceptId: "castle_for_safety", metadata: { moveUci: "e1g1", moveSan: "O-O" } } } as any,
    fen: "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1",
    viewMode: "assisted",
    revealState: "hidden",
    expectedMoveUci: "e1g1",
    expectedMoveSan: "O-O",
    frameId: 1,
  });
  const primitives = recipe.beats.flatMap((beat) => beat.primitives);
  assert.equal(primitives.some((primitive: any) => primitive.type === "move_arrow" && primitive.from === "e1" && primitive.to === "g1"), true);
  assert.equal(primitives.some((primitive: any) => primitive.type === "move_arrow" && primitive.from === "h1" && primitive.to === "f1"), true);
  assert.equal(recipe.endState.persistPrimitives.some((id) => id.includes("move_arrow:e1:g1")), true);
}
