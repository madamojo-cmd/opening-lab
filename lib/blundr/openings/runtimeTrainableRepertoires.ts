import { Chess } from "chess.js";

import { STAGE2_RUNTIME_TRAINABLE_REPERTOIRE_LINES } from "./stage2RuntimeTrainableRepertoires.generated";
import {
  STAGE2_OPENING_AVAILABILITY_MATRIX,
  STAGE2_RUNTIME_OPENING_IDS,
  type OpeningAvailability,
} from "./openingAvailability";
import { applyRuntimeUciMove } from "../runtime/uciReplay";
import { normalizeRuntimePlaySequenceUci } from "../runtime/uciNormalization";

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
  blockedThirdRepeatLineKeys: string[];
  variationReason: string | null;
  repeatUnavoidable: boolean;
  selectionSeed: string | null;
  lineWeightsSummary: RuntimeWeightedTrainingLineSelectionSummary[];
};

type RuntimeTrainableLineData = {
  lineId: string;
  playKey: string;
  playSequenceUci: readonly string[];
  movesSan: readonly string[];
  totalGames: number;
};

const GENERATED_REPERTOIRE_LINES = STAGE2_RUNTIME_TRAINABLE_REPERTOIRE_LINES as unknown as Record<string, readonly RuntimeTrainableLineData[]>;

function buildSanLineFromUciSequence(uciSequence: readonly string[]): string[] {
  const game = new Chess();
  const sanLine: string[] = [];
  for (const uci of normalizeRuntimePlaySequenceUci(uciSequence)) {
    const move = applyRuntimeUciMove(game, uci);
    if (!move) {
      throw new Error(`runtime_trainable_line_invalid_uci:${uci}`);
    }
    sanLine.push(move.san);
  }
  return sanLine;
}

function buildUciSequenceFromSanLine(sanLine: readonly string[]): string[] {
  const game = new Chess();
  const uciLine: string[] = [];
  for (const san of sanLine) {
    const move = game.move(san);
    if (!move) {
      throw new Error(`runtime_trainable_line_invalid_san:${san}`);
    }
    uciLine.push(`${move.from}${move.to}${move.promotion ?? ""}`.toLowerCase());
  }
  return uciLine;
}

function getGeneratedLinesForOpening(openingId: string): readonly RuntimeTrainableLineData[] {
  return GENERATED_REPERTOIRE_LINES[openingId] ?? [];
}

function buildTrainableRepertoire(entry: OpeningAvailability): RuntimeTrainableRepertoire {
  const rawLines = getGeneratedLinesForOpening(entry.openingId);
  if (rawLines.length === 0) {
    throw new Error(`runtime_trainable_repertoire_missing:${entry.openingId}`);
  }
  return {
    id: entry.openingId,
    name: entry.displayName,
    color: entry.learnerPerspective,
    description: `Runtime-backed local crawled package line pool for ${entry.displayName}. Fallback-only coaching remains available.`,
    lines: rawLines.map((line) => (line.movesSan.length > 0 ? line.movesSan.map(String) : buildSanLineFromUciSequence(line.playSequenceUci))),
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

function lineDataForRepertoire(repertoire: RuntimeTrainableRepertoire): readonly RuntimeTrainableLineData[] {
  return getGeneratedLinesForOpening(repertoire.id);
}

export function updateRuntimeTrainingLineKeys(current: string[], selectedLineKey: string): string[] {
  const key = String(selectedLineKey ?? "").trim();
  if (!key) return current.slice(0, 2);
  return [key, ...current].slice(0, 2);
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

  const rawLines = lineDataForRepertoire(repertoire);
  const recentLineKeys = (input.recentLineKeys ?? [])
    .map((entry) => String(entry ?? "").trim())
    .filter(Boolean)
    .slice(0, 2);

  const thirdConsecutiveRepeatLineKey =
    recentLineKeys.length === 2 && recentLineKeys[0] === recentLineKeys[1]
      ? recentLineKeys[0]
      : null;

  const lineSummaries = repertoire.lines.map((line, lineIndex) => {
    const sourceLine = rawLines[lineIndex];
    const normalizedPlaySequenceUci = sourceLine?.playSequenceUci
      ? normalizeRuntimePlaySequenceUci(sourceLine.playSequenceUci)
      : buildUciSequenceFromSanLine(line);
    const playKey = sourceLine?.playKey ?? normalizedPlaySequenceUci.join(",");
    const lineId = sourceLine?.lineId ?? `${repertoire.id}:${lineIndex}`;
    const lineKey = `${lineId}:${playKey}`;
    const totalGames = sourceLine?.totalGames ?? normalizedPlaySequenceUci.length;
    return {
      openingId: repertoire.id,
      lineId,
      lineKey,
      lineIndex,
      playKey,
      moveCount: normalizedPlaySequenceUci.length,
      weight: Math.max(1, totalGames),
      selectedPlaySequenceUci: normalizedPlaySequenceUci,
    };
  });

  const eligibleLineSummaries = thirdConsecutiveRepeatLineKey
    ? lineSummaries.filter((line) => line.lineKey !== thirdConsecutiveRepeatLineKey)
    : lineSummaries;
  const blockedThirdRepeatLineKeys = thirdConsecutiveRepeatLineKey ? [thirdConsecutiveRepeatLineKey] : [];
  const repeatUnavoidable = Boolean(thirdConsecutiveRepeatLineKey && eligibleLineSummaries.length === 0);
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
    blockedRecentLineKeys: blockedThirdRepeatLineKeys,
    blockedThirdRepeatLineKeys,
    variationReason:
      repeatUnavoidable
        ? "repeat_unavoidable_no_alternative"
        : (blockedThirdRepeatLineKeys.length > 0 ? "third_consecutive_repeat_excluded" : "fresh_line_selection"),
    repeatUnavoidable,
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
