import assert from "node:assert/strict";

import { snapshotsEqual } from "../playbackSnapshot";
import type { ActiveVisualRecipePlayback } from "../animationTypes";

function baseSnapshot(): ActiveVisualRecipePlayback {
  return {
    playbackState: "held_end_state",
    recipeId: "vr:v1:test",
    patternId: "pattern:test",
    activeBeatIndex: 1,
    activeBeatId: "beat-2",
    activePrimitiveIds: ["p1", "p2"],
    visiblePrimitives: [
      { id: "p1", type: "move_arrow", from: "e2", to: "e4", lane: "persistent_teaching", effectFamily: "teaching_move", priority: 5 },
      { id: "p2", type: "square_highlight", square: "e4", lane: "persistent_teaching", effectFamily: "center", priority: 5 },
    ] as any,
    reducedMotion: false,
    skippedToEnd: false,
    replayAvailable: true,
    recipeFrameMatchesBoard: true,
    recipeFenMatchesBoard: true,
    tacticalPrimitivesRendered: false,
  };
}

export function testVisualRecipePlaybackSnapshot(): void {
  const a = baseSnapshot();
  const b: ActiveVisualRecipePlayback = {
    ...baseSnapshot(),
    activePrimitiveIds: ["p1", "p2"],
    visiblePrimitives: [
      { id: "p1", type: "move_arrow", from: "e2", to: "e4", lane: "persistent_teaching", effectFamily: "teaching_move", priority: 5 },
      { id: "p2", type: "square_highlight", square: "e4", lane: "persistent_teaching", effectFamily: "center", priority: 5 },
    ] as any,
  };

  assert.equal(snapshotsEqual(a, b), true);

  const changed = { ...b, activeBeatIndex: 2 };
  assert.equal(snapshotsEqual(a, changed), false);
}
