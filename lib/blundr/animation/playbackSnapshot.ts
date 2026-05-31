import type { ActiveVisualRecipePlayback } from "./animationTypes";

function equalStringArray(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function snapshotsEqual(a: ActiveVisualRecipePlayback, b: ActiveVisualRecipePlayback): boolean {
  if (a.playbackState !== b.playbackState) return false;
  if (a.recipeId !== b.recipeId) return false;
  if (a.patternId !== b.patternId) return false;
  if (a.activeBeatIndex !== b.activeBeatIndex) return false;
  if (a.activeBeatId !== b.activeBeatId) return false;
  if (a.reducedMotion !== b.reducedMotion) return false;
  if (a.skippedToEnd !== b.skippedToEnd) return false;
  if (a.clearedReason !== b.clearedReason) return false;
  if (a.suppressedReason !== b.suppressedReason) return false;
  if (a.replayAvailable !== b.replayAvailable) return false;
  if (a.recipeFrameMatchesBoard !== b.recipeFrameMatchesBoard) return false;
  if (a.recipeFenMatchesBoard !== b.recipeFenMatchesBoard) return false;
  if (!equalStringArray(a.activePrimitiveIds, b.activePrimitiveIds)) return false;
  if (a.visiblePrimitives.length !== b.visiblePrimitives.length) return false;
  for (let i = 0; i < a.visiblePrimitives.length; i += 1) {
    if (a.visiblePrimitives[i]?.id !== b.visiblePrimitives[i]?.id) return false;
  }
  return true;
}
