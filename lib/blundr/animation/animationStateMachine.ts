import type { ActiveVisualRecipePlayback, AnimationClearReason, AnimationPlaybackState, AnimationSuppressionReason } from "./animationTypes";

export type AnimationStateAction =
  | { type: "set_playback_state"; playbackState: AnimationPlaybackState }
  | { type: "clear"; reason: AnimationClearReason }
  | { type: "suppress"; reason: AnimationSuppressionReason };

export function reduceAnimationPlayback(
  state: ActiveVisualRecipePlayback,
  action: AnimationStateAction,
): ActiveVisualRecipePlayback {
  if (action.type === "set_playback_state") {
    return {
      ...state,
      playbackState: action.playbackState,
      suppressedReason: undefined,
      clearedReason: undefined,
    };
  }
  if (action.type === "clear") {
    return {
      ...state,
      playbackState: "cleared",
      visiblePrimitives: [],
      activePrimitiveIds: [],
      clearedReason: action.reason,
      suppressedReason: undefined,
      replayAvailable: false,
    };
  }
  return {
    ...state,
    playbackState: "suppressed",
    visiblePrimitives: [],
    activePrimitiveIds: [],
    suppressedReason: action.reason,
    replayAvailable: false,
  };
}
