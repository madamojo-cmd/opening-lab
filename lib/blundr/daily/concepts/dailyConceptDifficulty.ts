import type { DailyBlundrMasteryRecord } from "../dailyBlundrTypes";
import type { DailyConceptDefinition, DailyConceptDifficulty } from "./dailyConceptTypes";

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function difficultyRank(difficulty: DailyConceptDifficulty): number {
  switch (difficulty) {
    case "intro":
      return 0;
    case "beginner":
      return 1;
    case "intermediate":
      return 2;
    case "advanced":
      return 3;
    case "expert":
      return 4;
  }
}

function highestDifficulty(difficulties: readonly DailyConceptDifficulty[]): DailyConceptDifficulty {
  return [...difficulties].sort((a, b) => difficultyRank(a) - difficultyRank(b))[difficulties.length - 1] ?? "beginner";
}

function nearestDifficulty(target: DailyConceptDifficulty, supported: readonly DailyConceptDifficulty[]): DailyConceptDifficulty {
  if (supported.includes(target)) return target;
  return [...supported].sort((a, b) => Math.abs(difficultyRank(a) - difficultyRank(target)) - Math.abs(difficultyRank(b) - difficultyRank(target)) || difficultyRank(a) - difficultyRank(b))[0] ?? target;
}

function masteryBand(mastery: Pick<DailyBlundrMasteryRecord, "currentMastery" | "confidence"> | null | undefined): DailyConceptDifficulty {
  const currentMastery = clamp01(mastery?.currentMastery ?? 0);
  const confidence = clamp01(mastery?.confidence ?? 0);
  if (currentMastery < 0.35) {
    return confidence > 0.55 ? "beginner" : "intro";
  }
  if (currentMastery < 0.7) {
    return confidence > 0.6 ? "intermediate" : "beginner";
  }
  if (currentMastery < 0.8) {
    return confidence > 0.6 ? "advanced" : "intermediate";
  }
  return confidence > 0.6 ? "expert" : "advanced";
}

export function getRecommendedConceptDifficulty(
  concept: DailyConceptDefinition,
  mastery: Pick<DailyBlundrMasteryRecord, "currentMastery" | "confidence"> | null | undefined,
): DailyConceptDifficulty {
  const supported: DailyConceptDifficulty[] = concept.recommendedDifficulty.length > 0 ? [...concept.recommendedDifficulty] : ["beginner"];
  const target = masteryBand(mastery);
  if (shouldAdvanceConceptDifficulty(concept, mastery)) {
    return highestDifficulty(supported);
  }
  if (shouldSuppressIntroConcept(concept, mastery)) {
    const suppressed = supported.find((difficulty) => difficulty !== "intro") ?? highestDifficulty(supported);
    return suppressed;
  }
  return nearestDifficulty(target, supported);
}

export function shouldSuppressIntroConcept(
  concept: DailyConceptDefinition,
  mastery: Pick<DailyBlundrMasteryRecord, "currentMastery" | "confidence"> | null | undefined,
): boolean {
  const currentMastery = clamp01(mastery?.currentMastery ?? 0);
  const confidence = clamp01(mastery?.confidence ?? 0);
  return currentMastery > 0.8 && confidence > 0.6 && concept.recommendedDifficulty.includes("intro");
}

export function shouldAdvanceConceptDifficulty(
  _concept: DailyConceptDefinition,
  mastery: Pick<DailyBlundrMasteryRecord, "currentMastery" | "confidence"> | null | undefined,
): boolean {
  const currentMastery = clamp01(mastery?.currentMastery ?? 0);
  const confidence = clamp01(mastery?.confidence ?? 0);
  return currentMastery > 0.8 && confidence > 0.6;
}
