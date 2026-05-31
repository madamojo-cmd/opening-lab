import type { CoachCopyEntry, CoachUtteranceMemoryEntry } from "./coachTypes";

export type VariationSelection = {
  entry: CoachCopyEntry;
  reason: string;
};

export function selectCoachCopyVariant(
  candidates: CoachCopyEntry[],
  patternId: string,
  memory: CoachUtteranceMemoryEntry[],
): VariationSelection | null {
  if (!candidates.length) return null;
  const patternMemory = memory.filter((item) => item.patternId === patternId);
  const last = patternMemory.at(-1);
  const lastFive = patternMemory.slice(-5);

  const avoidId = candidates.filter((candidate) => candidate.utteranceId !== last?.utteranceId);
  const firstPool = avoidId.length ? avoidId : candidates;

  const familyCount = new Map<string, number>();
  for (const item of lastFive) {
    if (!item.utteranceFamily) continue;
    familyCount.set(item.utteranceFamily, (familyCount.get(item.utteranceFamily) ?? 0) + 1);
  }
  const avoidFamily = firstPool.filter((candidate) => (familyCount.get(candidate.utteranceFamily) ?? 0) < 2);
  const secondPool = avoidFamily.length ? avoidFamily : firstPool;

  const sorted = secondPool.slice().sort((a, b) => a.utteranceId.localeCompare(b.utteranceId));
  const reason = !avoidId.length
    ? "repeat_unavoidable_same_id"
    : !avoidFamily.length
      ? "repeat_unavoidable_same_family"
      : "selected_non_repetitive";
  return {
    entry: sorted[0],
    reason,
  };
}
