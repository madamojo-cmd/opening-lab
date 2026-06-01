import type { TrainerDebugSnapshot } from "./trainerDebugTypes";
import { buildTrainerDebugSnapshot } from "./trainerDebugSnapshot";

export function collectTrainerDebugSnapshot(input: Record<string, unknown>): TrainerDebugSnapshot {
  return buildTrainerDebugSnapshot(input as Record<string, any>);
}
