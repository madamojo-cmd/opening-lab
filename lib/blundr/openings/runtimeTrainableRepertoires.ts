import { Chess } from "chess.js";

import {
  STAGE2_OPENING_AVAILABILITY_MATRIX,
  STAGE2_RUNTIME_OPENING_IDS,
  type OpeningAvailability,
} from "./openingAvailability";

export type RuntimeTrainableRepertoire = {
  id: string;
  name: string;
  color: "white" | "black";
  description: string;
  lines: string[][];
  custom?: boolean;
};

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
  variationReason: string | null;
  selectionSeed: string | null;
  lineWeightsSummary: RuntimeWeightedTrainingLineSelectionSummary[];
};

type RuntimeTrainableRepertoireSpec = {
  openingId: string;
  uciSequence: string[];
};

const RUNTIME_TRAINABLE_REPERTOIRE_SPECS: Record<string, RuntimeTrainableRepertoireSpec> = {
  "caro-kann-black": { openingId: "caro-kann-black", uciSequence: ["e2e4", "c7c6"] },
  "colle-white": { openingId: "colle-white", uciSequence: ["d2d4"] },
  "english-white": { openingId: "english-white", uciSequence: ["c2c4"] },
  "french-black": { openingId: "french-black", uciSequence: ["e2e4", "e7e6"] },
  "italian-black": { openingId: "italian-black", uciSequence: ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4"] },
  "italian-white": { openingId: "italian-white", uciSequence: ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4"] },
  "kings-indian-black": { openingId: "kings-indian-black", uciSequence: ["d2d4", "g8f6", "c2c4", "g7g6"] },
  "london-white": { openingId: "london-white", uciSequence: ["d2d4"] },
  "nimzo-indian-black": { openingId: "nimzo-indian-black", uciSequence: ["d2d4", "g8f6", "c2c4", "e7e6", "b1c3", "f8b4"] },
  "petroff-black": { openingId: "petroff-black", uciSequence: ["e2e4", "e7e5", "g1f3", "g8f6"] },
  "pirc-black": { openingId: "pirc-black", uciSequence: ["e2e4", "d7d6", "d2d4", "g8f6"] },
  "qgd-black": { openingId: "qgd-black", uciSequence: ["d2d4", "d7d5", "c2c4", "e7e6"] },
  "queens-gambit-white": { openingId: "queens-gambit-white", uciSequence: ["d2d4", "d7d5", "c2c4"] },
  "queens-indian-black": { openingId: "queens-indian-black", uciSequence: ["d2d4", "g8f6", "c2c4", "e7e6", "g1f3", "b7b6"] },
  "reti-white": { openingId: "reti-white", uciSequence: ["g1f3", "d7d5", "c2c4"] },
  "ruy-lopez-white": { openingId: "ruy-lopez-white", uciSequence: ["e2e4", "e7e5", "g1f3", "b8c6", "f1b5"] },
  "scandinavian-black": { openingId: "scandinavian-black", uciSequence: ["e2e4", "d7d5"] },
  "scotch-white": { openingId: "scotch-white", uciSequence: ["e2e4", "e7e5", "g1f3", "b8c6", "d2d4"] },
  "sicilian-black": { openingId: "sicilian-black", uciSequence: ["e2e4", "c7c5"] },
  "slav-black": { openingId: "slav-black", uciSequence: ["d2d4", "d7d5", "c2c4", "c7c6"] },
  "vienna-white": { openingId: "vienna-white", uciSequence: ["e2e4", "e7e5", "b1c3"] },
};

function uciToMove(uci: string): { from: string; to: string; promotion?: string } {
  return {
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci.length > 4 ? uci.slice(4, 5) : undefined,
  };
}

function moveToUci(move: { from?: string; to?: string; promotion?: string | null }): string {
  return `${String(move.from ?? "").toLowerCase()}${String(move.to ?? "").toLowerCase()}${String(move.promotion ?? "").toLowerCase()}`;
}

function uciSequenceToSanLine(uciSequence: string[]): string[] {
  const game = new Chess();
  const sanLine: string[] = [];
  for (const uci of uciSequence) {
    const move = game.move(uciToMove(uci));
    if (!move) {
      throw new Error(`runtime_trainable_line_invalid_uci:${uci}`);
    }
    sanLine.push(move.san);
  }
  return sanLine;
}

function sanLineToUciSequence(sanLine: string[]): string[] {
  const game = new Chess();
  const uciLine: string[] = [];
  for (const san of sanLine) {
    const move = game.move(san);
    if (!move) {
      throw new Error(`runtime_trainable_line_invalid_san:${san}`);
    }
    uciLine.push(moveToUci(move));
  }
  return uciLine;
}

function buildTrainableRepertoire(entry: OpeningAvailability): RuntimeTrainableRepertoire {
  const spec = RUNTIME_TRAINABLE_REPERTOIRE_SPECS[entry.openingId];
  if (!spec) {
    throw new Error(`runtime_trainable_repertoire_missing:${entry.openingId}`);
  }
  const line = uciSequenceToSanLine(spec.uciSequence);
  return {
    id: entry.openingId,
    name: entry.displayName,
    color: entry.learnerPerspective,
    description: `Runtime-backed local crawled package line for ${entry.displayName}. Fallback-only coaching remains available.`,
    lines: [line],
    custom: false,
  };
}

export const STAGE2_RUNTIME_TRAINABLE_REPERTOIRES: RuntimeTrainableRepertoire[] = STAGE2_RUNTIME_OPENING_IDS.map((openingId) => {
  const entry = STAGE2_OPENING_AVAILABILITY_MATRIX.find((candidate) => candidate.openingId === openingId);
  if (!entry) {
    throw new Error(`runtime_trainable_availability_missing:${openingId}`);
  }
  return buildTrainableRepertoire(entry);
});

export function getStage2RuntimeTrainableRepertoire(openingId: string): RuntimeTrainableRepertoire | null {
  return STAGE2_RUNTIME_TRAINABLE_REPERTOIRES.find((entry) => entry.id === openingId) ?? null;
}

export function selectRuntimeWeightedTrainingLineSelection(input: {
  openingId: string;
  recentLineKeys?: string[] | null;
  seed?: string | null;
  repertoire?: RuntimeTrainableRepertoire | null;
}): RuntimeWeightedTrainingLineSelection | null {
  const repertoire = input.repertoire ?? getStage2RuntimeTrainableRepertoire(input.openingId);
  if (!repertoire || !Array.isArray(repertoire.lines) || repertoire.lines.length === 0) {
    return null;
  }

  const recentLineKeys = Array.from(
    new Set(
      (input.recentLineKeys ?? [])
        .map((entry) => String(entry ?? "").trim())
        .filter(Boolean),
    ),
  ).slice(0, 2);

  const lineSummaries = repertoire.lines.map((line, lineIndex) => {
    const selectedPlaySequenceUci = sanLineToUciSequence(line);
    const selectedPlayKey = selectedPlaySequenceUci.join(",");
    const lineId = `${repertoire.id}:${lineIndex}`;
    const lineKey = `${lineId}:${selectedPlayKey}`;
    return {
      openingId: repertoire.id,
      lineId,
      lineKey,
      lineIndex,
      playKey: selectedPlayKey,
      moveCount: selectedPlaySequenceUci.length,
      weight: Math.max(1, selectedPlaySequenceUci.length),
      selectedPlaySequenceUci,
    };
  });

  const eligibleLineSummaries = lineSummaries.filter((line) => !recentLineKeys.includes(line.lineKey));
  const blockedRecentLineKeys = lineSummaries
    .filter((line) => recentLineKeys.includes(line.lineKey))
    .map((line) => line.lineKey);
  const weightedCandidates = eligibleLineSummaries.length > 0 ? eligibleLineSummaries : lineSummaries;
  const selected = pickWeighted(
    weightedCandidates,
    `${input.seed ?? RUNTIME_WEIGHTED_OPENING_SELECTION_SEED}:${repertoire.id}:${recentLineKeys.join("|")}`,
  );

  return {
    mode: "runtime_weighted_line",
    source: "local_runtime_package",
    openingId: repertoire.id,
    selectedLineId: selected.lineId,
    selectedLineKey: selected.lineKey,
    selectedLineIndex: selected.lineIndex,
    selectedPlayKey: selected.playKey,
    selectedPlaySequenceUci: selected.selectedPlaySequenceUci,
    eligibleCount: eligibleLineSummaries.length,
    eligibleLineIds: eligibleLineSummaries.map((line) => line.lineId),
    eligibleLineKeys: eligibleLineSummaries.map((line) => line.lineKey),
    weighted: true,
    recentLineKeys,
    blockedRecentLineKeys,
    variationReason:
      eligibleLineSummaries.length > 0
        ? (blockedRecentLineKeys.length > 0 ? "recent_line_keys_excluded" : "fresh_line_selection")
        : "recent_line_memory_exhausted",
    selectionSeed: input.seed ?? RUNTIME_WEIGHTED_OPENING_SELECTION_SEED,
    lineWeightsSummary: lineSummaries.map(({ openingId, lineId, lineKey, lineIndex, playKey, moveCount, weight }) => ({
      openingId,
      lineId,
      lineKey,
      lineIndex,
      playKey,
      moveCount,
      weight,
    })),
  };
}

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
  const eligibleOpenings = STAGE2_OPENING_AVAILABILITY_MATRIX.filter(
    (entry) => entry.runtimeAvailable && STAGE2_RUNTIME_TRAINABLE_REPERTOIRES.some((repertoire) => repertoire.id === entry.openingId),
  );
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

export const STAGE2_RUNTIME_WEIGHTED_OPENING_SELECTION = selectRuntimeWeightedOpeningSelection();
