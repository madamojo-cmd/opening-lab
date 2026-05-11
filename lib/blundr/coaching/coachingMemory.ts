import type { ExplanationMode } from "./contextVariants";

export type CoachingMemoryInput = {
  conceptSeenCount?: number;
  lastExplanationKey?: string;
  missedCount?: number;
  successCount?: number;
};

export type CoachingMemorySnapshot = Required<CoachingMemoryInput>;

export function normalizeCoachingMemory(input: CoachingMemoryInput = {}): CoachingMemorySnapshot {
  return {
    conceptSeenCount: Math.max(0, Number(input.conceptSeenCount ?? 0) || 0),
    lastExplanationKey: String(input.lastExplanationKey ?? ""),
    missedCount: Math.max(0, Number(input.missedCount ?? 0) || 0),
    successCount: Math.max(0, Number(input.successCount ?? 0) || 0),
  };
}

export function chooseExplanationMode(
  memoryInput: CoachingMemoryInput = {},
  trainingPhase?: string,
  explanationKey = "",
): ExplanationMode {
  const memory = normalizeCoachingMemory(memoryInput);

  if (trainingPhase === "continuation") {
    return "continuation";
  }
  if (memory.missedCount > 0 && memory.missedCount >= memory.successCount) {
    return "missed_recently";
  }
  if (memory.successCount >= 3 && memory.successCount > memory.missedCount) {
    return "mastered";
  }
  if (memory.conceptSeenCount > 1 && memory.lastExplanationKey === explanationKey) {
    return "quiz";
  }
  if (memory.conceptSeenCount > 0) {
    return "repeat";
  }

  return "first_time";
}
