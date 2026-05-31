import assert from "node:assert/strict";

import { AnimationConductor } from "../animationConductor";
import type { VisualRecipe } from "../../visualRecipe/visualRecipeTypes";

export function testAnimationEndStatePersistence(): void {
  const recipe: VisualRecipe = {
    recipeSchemaVersion: 1,
    id: "vr:castle",
    visualRecipeId: "vr:castle",
    patternId: "pattern:castle",
    mode: "move_teaching",
    conceptId: "castle_for_safety",
    frameId: 1,
    fen: "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1",
    moveUci: "e1g1",
    moveSan: "O-O",
    beats: [
      {
        id: "move",
        order: 1,
        durationMs: 100,
        primitives: [
          { id: "king", type: "move_arrow", from: "e1", to: "g1", lane: "persistent_teaching", effectFamily: "teaching_move", priority: 5 },
          { id: "rook", type: "move_arrow", from: "h1", to: "f1", lane: "persistent_teaching", effectFamily: "teaching_move", priority: 5 },
        ],
      },
      {
        id: "meaning",
        order: 2,
        durationMs: 100,
        primitives: [
          { id: "aura", type: "king_safety_aura", square: "g1", lane: "persistent_teaching", effectFamily: "king_safety", priority: 5 },
        ],
      },
    ],
    endState: { persistPrimitives: ["king", "rook", "aura"], clearOn: [] },
    permissions: {
      canShowAnswerMove: true,
      canShowContext: true,
      canShowPressure: true,
      canShowTargets: true,
      canShowGhosts: false,
      canShowTacticalAssist: false,
      canPersistEndState: true,
      revealRequired: false,
      allowedViewModes: ["assisted"],
    },
    learningAnchor: { patternId: "pattern:castle", conceptId: "castle_for_safety", fen: "x", moveUci: "e1g1", moveSan: "O-O", keySquares: ["e1", "g1", "h1", "f1"], keyPieces: ["king", "rook"], reviewPromptKind: "find_move" },
    debug: {} as any,
  };
  const conductor = new AnimationConductor();
  const snapshot = conductor.sync({
    recipe,
    nowMs: 1000,
    reducedMotionMode: "reduce",
    context: { phase: "ready_for_user", viewMode: "assisted", boardFen: "r3k2r/8/8/8/8/8/8/R3K2R w KQkq -", trainerFrameId: 1, overlayFrameId: 1, userToMove: true, adapterAllowed: true },
  });
  assert.equal(snapshot.playbackState, "held_end_state");
  assert.deepEqual(snapshot.activePrimitiveIds, ["king", "rook", "aura"]);
}
