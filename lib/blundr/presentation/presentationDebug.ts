import type { TrainerPresentationFrame } from "./trainerPresentationTypes";

export function buildPresentationDebug(frame: TrainerPresentationFrame): Record<string, unknown> {
  return {
    frameId: frame.frameId,
    normalizedFen: frame.normalizedFen,
    visualLayerSource: frame.debug.visualLayerSource,
    visualLayerBlockedReason: frame.debug.visualLayerBlockedReason,
    coachSurfaceOwner: frame.debug.coachSurfaceOwner,
    coachBlockedReason: frame.debug.coachBlockedReason,
    allowLegacyTrainingCard: frame.legacy.allowTrainingCard,
    allowMoveImpact: frame.legacy.allowMoveImpact,
    allowNextMoveText: frame.legacy.allowNextMoveText,
  };
}
