import assert from "node:assert/strict";

import { buildVisualPlaybackKey } from "../playbackKey";

export function testVisualRecipePlaybackHookKey(): void {
  const base = {
    recipe: {
      visualRecipeId: "vr:v1:bc4",
      frameId: 10,
      fen: "fenA",
      mode: "move_teaching",
      patternId: "pattern:bc4",
    },
    phase: "ready_for_user",
    viewMode: "assisted",
    boardFen: "fenA",
    trainerFrameId: 10,
    overlayFrameId: 10,
    userToMove: true,
    adapterAllowed: true,
    enabled: true,
    reduced: false,
  } as any;

  const keyA = buildVisualPlaybackKey({ recipe: base.recipe, enabled: base.enabled, reduced: base.reduced, trainerFrameId: base.trainerFrameId, boardFen: base.boardFen });
  const keyB = buildVisualPlaybackKey({ recipe: { ...base.recipe }, enabled: base.enabled, reduced: base.reduced, trainerFrameId: base.trainerFrameId, boardFen: base.boardFen });
  assert.equal(keyA, keyB);

  const changedFen = buildVisualPlaybackKey({ recipe: base.recipe, enabled: base.enabled, reduced: base.reduced, trainerFrameId: base.trainerFrameId, boardFen: "fenB" });
  assert.notEqual(keyA, changedFen);

  const changedRecipe = buildVisualPlaybackKey({ recipe: { ...base.recipe, visualRecipeId: "vr:v1:c3" }, enabled: base.enabled, reduced: base.reduced, trainerFrameId: base.trainerFrameId, boardFen: base.boardFen });
  assert.notEqual(keyA, changedRecipe);
}
