import type { DailyTrainingTargetDefinition } from "./dailyTrainingTargetTypes";
import { replyRadarDefinition } from "./replyRadar";
import { openingBranchBuilderDefinition } from "./openingBranchBuilder";
import { opponentReplyTrainerDefinition } from "./opponentReplyTrainer";
import { breakTimingDrillDefinition } from "./breakTimingDrill";
import { keySquareClickDefinition } from "./keySquareClick";

export const DAILY_TRAINING_TARGET_REGISTRY: DailyTrainingTargetDefinition[] = [
  replyRadarDefinition,
  openingBranchBuilderDefinition,
  opponentReplyTrainerDefinition,
  breakTimingDrillDefinition,
  keySquareClickDefinition,
];

const REGISTRY_BY_ID = new Map(DAILY_TRAINING_TARGET_REGISTRY.map((definition) => [definition.id, definition] as const));

export function getDailyTrainingTargetDefinition(id: DailyTrainingTargetDefinition["id"]): DailyTrainingTargetDefinition | null {
  return REGISTRY_BY_ID.get(id) ?? null;
}
