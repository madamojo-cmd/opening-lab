import { STAGE2_OPENING_AVAILABILITY_MATRIX } from "./openingAvailability";

export type RuntimeWeightedOpeningSelectionSummary = {
  openingId: string;
  runtimeNodeCount: number;
  runtimeCandidateMoveCount: number;
  weight: number;
};

export type RuntimeWeightedOpeningSelection = {
  mode: "runtime_weighted";
  source: "local_runtime_package";
  selectedOpeningId: string;
  eligibleCount: number;
  eligibleOpeningIds: string[];
  weighted: true;
  contentGated: false;
  stageGated: false;
  visibilityGated: false;
  openingSelectionStickyReason: string | null;
  openingSelectionSeed: string | null;
  openingSelectionWasPersisted: boolean;
  weightsSummary: RuntimeWeightedOpeningSelectionSummary[];
};

export type RuntimeWeightedTrainingLineSelectionSummary = {
  openingId: string;
  lineId: string;
  lineKey: string;
  lineIndex: number;
  playKey: string;
  moveCount: number;
  weight: number;
};

export type RuntimeWeightedTrainingLineSelection = {
  mode: "runtime_weighted_line";
  source: "local_runtime_package";
  openingId: string;
  selectedLineId: string;
  selectedLineKey: string;
  selectedLineIndex: number;
  selectedPlayKey: string;
  selectedPlaySequenceUci: string[];
  eligibleCount: number;
  eligibleLineIds: string[];
  eligibleLineKeys: string[];
  weighted: true;
  recentLineKeys: string[];
  blockedRecentLineKeys: string[];
  blockedThirdRepeatLineKeys: string[];
  variationReason: string | null;
  repeatUnavoidable: boolean;
  selectionSeed: string | null;
  lineWeightsSummary: RuntimeWeightedTrainingLineSelectionSummary[];
};

const RUNTIME_WEIGHTED_OPENING_SELECTION_SEED = "stage2-runtime-weighted-opening-selection-v1";

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRandom(seed: string): () => number {
  let state = hashSeed(seed) || 0x9e3779b9;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) % 0x100000000) / 0x100000000;
  };
}

function pickWeighted<T extends { weight: number }>(items: T[], seed: string): T {
  if (!items.length) {
    throw new Error("weighted_selection_requires_items");
  }
  const total = items.reduce((sum, item) => sum + Math.max(1, item.weight), 0);
  const random = createSeededRandom(seed)();
  let roll = random * total;
  for (const item of items) {
    roll -= Math.max(1, item.weight);
    if (roll <= 0) {
      return item;
    }
  }
  return items[items.length - 1];
}

export function selectRuntimeWeightedOpeningSelection(seed: string = RUNTIME_WEIGHTED_OPENING_SELECTION_SEED): RuntimeWeightedOpeningSelection {
  const eligibleOpenings = STAGE2_OPENING_AVAILABILITY_MATRIX.filter((entry) => entry.runtimeAvailable);
  const weightsSummary: RuntimeWeightedOpeningSelectionSummary[] = eligibleOpenings.map((entry) => ({
    openingId: entry.openingId,
    runtimeNodeCount: entry.runtimeNodeCount,
    runtimeCandidateMoveCount: entry.runtimeCandidateMoveCount,
    weight: Math.max(1, entry.runtimeCandidateMoveCount),
  }));
  const selected = pickWeighted(weightsSummary, seed);
  return {
    mode: "runtime_weighted",
    source: "local_runtime_package",
    selectedOpeningId: selected.openingId,
    eligibleCount: eligibleOpenings.length,
    eligibleOpeningIds: eligibleOpenings.map((entry) => entry.openingId),
    weighted: true,
    contentGated: false,
    stageGated: false,
    visibilityGated: false,
    openingSelectionStickyReason: null,
    openingSelectionSeed: seed,
    openingSelectionWasPersisted: false,
    weightsSummary,
  };
}

export function updateRuntimeTrainingLineKeys(current: string[], selectedLineKey: string): string[] {
  const key = String(selectedLineKey ?? "").trim();
  if (!key) return current.slice(0, 2);
  return [key, ...current].slice(0, 2);
}
