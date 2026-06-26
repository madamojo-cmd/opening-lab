// Lightweight start-safe runtime line loader built from split opening-specific modules.
// Do not edit by hand.

import { Chess } from "chess.js";
import { STAGE2_OPENING_AVAILABILITY_MATRIX } from "./openingAvailability";
import { resolveStage2CanonicalOpeningId, STAGE2_RUNTIME_OPENING_IDS } from "./openingIdentity";
import {
  STAGE2_RUNTIME_OPENING_INDEX,
  STAGE2_RUNTIME_OPENING_INDEX_BY_ID,
  type RuntimeOpeningIndexEntry,
} from "./runtimeOpeningIndex.generated";
import { applyRuntimeUciMove } from "../runtime/uciReplay";
import { normalizeRuntimePlaySequenceUci } from "../runtime/uciNormalization";
import {
  buildStage2RatingAwareSeed,
  getStage2RatingBand,
  stage2RatingBandMatchesLocalMetadata,
  type Stage2RatingBandId,
} from "../ratings/ratingBands";

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
  ratingBandId?: Stage2RatingBandId | string | null;
  ratingBandLabel?: string | null;
  ratingBandTarget?: string | null;
  ratingAware?: boolean;
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
  ratingBandId?: Stage2RatingBandId | string | null;
  ratingBandLabel?: string | null;
  ratingBandTarget?: string | null;
  ratingAware?: boolean;
  ratingGateFallbackUsed?: boolean;
};

export type RuntimeOpeningIdentityLine = {
  openingId: string;
  openingName: string;
  lineId: string;
  playKey: string;
  playSequenceUci: string[];
  moveCount: number;
  totalGames: number;
  averageRating?: number | string | null;
  profileId?: string | null;
  profile?: string | null;
  profiles?: string | null;
};

type RuntimeTrainableLineData = {
  lineId: string;
  playKey: string;
  playSequenceUci: readonly string[];
  movesSan: readonly string[];
  totalGames: number;
  averageRating?: number | string | null;
  profileId?: string | null;
  profile?: string | null;
  profiles?: string | null;
};

type RuntimeLineBodyModule = {
  STAGE2_RUNTIME_LINE_BODIES: readonly RuntimeTrainableLineData[];
};

const RUNTIME_LINE_MODULE_LOADERS: Readonly<Record<string, () => Promise<RuntimeLineBodyModule>>> = {
  "caro-kann-black": () => import("./runtimeLines/caro-kann-black.generated"),
  "colle-white": () => import("./runtimeLines/colle-white.generated"),
  "english-white": () => import("./runtimeLines/english-white.generated"),
  "french-black": () => import("./runtimeLines/french-black.generated"),
  "italian-black": () => import("./runtimeLines/italian-black.generated"),
  "italian-white": () => import("./runtimeLines/italian-white.generated"),
  "kings-indian-black": () => import("./runtimeLines/kings-indian-black.generated"),
  "london-white": () => import("./runtimeLines/london-white.generated"),
  "nimzo-indian-black": () => import("./runtimeLines/nimzo-indian-black.generated"),
  "petroff-black": () => import("./runtimeLines/petroff-black.generated"),
  "pirc-black": () => import("./runtimeLines/pirc-black.generated"),
  "qgd-black": () => import("./runtimeLines/qgd-black.generated"),
  "queens-gambit-white": () => import("./runtimeLines/queens-gambit-white.generated"),
  "queens-indian-black": () => import("./runtimeLines/queens-indian-black.generated"),
  "reti-white": () => import("./runtimeLines/reti-white.generated"),
  "ruy-lopez-white": () => import("./runtimeLines/ruy-lopez-white.generated"),
  "scandinavian-black": () => import("./runtimeLines/scandinavian-black.generated"),
  "scotch-white": () => import("./runtimeLines/scotch-white.generated"),
  "sicilian-black": () => import("./runtimeLines/sicilian-black.generated"),
  "slav-black": () => import("./runtimeLines/slav-black.generated"),
  "vienna-white": () => import("./runtimeLines/vienna-white.generated"),
};

const loadedLineDataCache = new Map<string, readonly RuntimeTrainableLineData[]>();
const loadedRepertoireCache = new Map<string, RuntimeTrainableRepertoire>();
const pendingRepertoireLoads = new Map<string, Promise<RuntimeTrainableRepertoire | null>>();

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

function getLoadedRuntimeLineData(openingId: string): readonly RuntimeTrainableLineData[] | null {
  return loadedLineDataCache.get(openingId) ?? null;
}

async function loadRuntimeLineModule(openingId: string): Promise<readonly RuntimeTrainableLineData[] | null> {
  const canonicalOpeningId = resolveStage2CanonicalOpeningId(openingId);
  if (!canonicalOpeningId) return null;
  const cached = getLoadedRuntimeLineData(canonicalOpeningId);
  if (cached) return cached;
  const loader = RUNTIME_LINE_MODULE_LOADERS[canonicalOpeningId];
  if (!loader) return null;
  const mod = await loader();
  loadedLineDataCache.set(canonicalOpeningId, mod.STAGE2_RUNTIME_LINE_BODIES);
  return mod.STAGE2_RUNTIME_LINE_BODIES;
}

function buildRuntimeTrainableRepertoireFromIndexEntry(openingId: string, rawLines: readonly RuntimeTrainableLineData[]): RuntimeTrainableRepertoire | null {
  const indexEntry = STAGE2_RUNTIME_OPENING_INDEX_BY_ID[openingId];
  if (!indexEntry) return null;
  if (!rawLines.length) return null;
  return {
    id: openingId,
    name: indexEntry.openingName,
    color: indexEntry.side,
    description: `Runtime-backed local crawled package line pool for ${indexEntry.openingName}. Fallback-only coaching remains available.`,
    lines: rawLines.map((line) => (line.movesSan.length > 0 ? line.movesSan.map(String) : buildSanLineFromUciSequence(line.playSequenceUci))),
    custom: false,
  };
}

function normalizeSeed(value: string | null | undefined): string {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : "stage2-runtime-weighted-opening-selection-v1";
}

export function getStage2RuntimeOpeningIndexEntries(): readonly RuntimeOpeningIndexEntry[] {
  return STAGE2_RUNTIME_OPENING_INDEX.slice();
}

export function getStage2RuntimeOpeningIndexEntry(openingId: string): RuntimeOpeningIndexEntry | null {
  const canonicalOpeningId = resolveStage2CanonicalOpeningId(openingId);
  if (!canonicalOpeningId) return null;
  return STAGE2_RUNTIME_OPENING_INDEX_BY_ID[canonicalOpeningId] ?? null;
}

export async function loadStage2RuntimeTrainableRepertoire(openingId: string): Promise<RuntimeTrainableRepertoire | null> {
  const canonicalOpeningId = resolveStage2CanonicalOpeningId(openingId);
  if (!canonicalOpeningId) return null;
  const cached = loadedRepertoireCache.get(canonicalOpeningId);
  if (cached) return cached;
  const pending = pendingRepertoireLoads.get(canonicalOpeningId);
  if (pending) return pending;
  const next = (async () => {
    const rawLines = await loadRuntimeLineModule(canonicalOpeningId);
    if (!rawLines || rawLines.length === 0) return null;
    const repertoire = buildRuntimeTrainableRepertoireFromIndexEntry(canonicalOpeningId, rawLines);
    if (!repertoire) return null;
    loadedRepertoireCache.set(canonicalOpeningId, repertoire);
    return repertoire;
  })();
  pendingRepertoireLoads.set(canonicalOpeningId, next);
  try {
    return await next;
  } finally {
    pendingRepertoireLoads.delete(canonicalOpeningId);
  }
}

export async function loadStage2RuntimeTrainableRepertoires(): Promise<RuntimeTrainableRepertoire[]> {
  const loaded = await Promise.all(STAGE2_RUNTIME_OPENING_IDS.map((openingId) => loadStage2RuntimeTrainableRepertoire(openingId)));
  return loaded.filter((entry): entry is RuntimeTrainableRepertoire => Boolean(entry));
}

export function selectRuntimeWeightedOpeningSelection(
  seed: string = "stage2-runtime-weighted-opening-selection-v1",
  ratingBandId?: Stage2RatingBandId | string | null,
): RuntimeWeightedOpeningSelection {
  const ratingBandExplicit = Boolean(ratingBandId);
  const ratingBand = getStage2RatingBand(ratingBandId);
  const eligibleOpenings = STAGE2_OPENING_AVAILABILITY_MATRIX.filter((entry) => entry.runtimeAvailable && Boolean(STAGE2_RUNTIME_OPENING_INDEX_BY_ID[entry.openingId]));
  const weightsSummary: RuntimeWeightedOpeningSelectionSummary[] = eligibleOpenings.map((entry) => ({
    openingId: entry.openingId,
    runtimeNodeCount: entry.runtimeNodeCount,
    runtimeCandidateMoveCount: entry.runtimeCandidateMoveCount,
    weight: Math.max(1, entry.runtimeCandidateMoveCount),
  }));
  const selected = pickWeighted(weightsSummary, ratingBandExplicit ? buildStage2RatingAwareSeed(normalizeSeed(seed), ratingBand.id) : normalizeSeed(seed));
  return {
    mode: "runtime_weighted",
    source: "local_runtime_package",
    ratingBandId: ratingBandExplicit ? ratingBand.id : null,
    ratingBandLabel: ratingBandExplicit ? ratingBand.label : null,
    ratingBandTarget: ratingBandExplicit ? ratingBand.target : null,
    ratingAware: ratingBandExplicit,
    selectedOpeningId: selected.openingId,
    eligibleCount: eligibleOpenings.length,
    eligibleOpeningIds: eligibleOpenings.map((entry) => entry.openingId),
    weighted: true,
    contentGated: false,
    stageGated: false,
    visibilityGated: false,
    openingSelectionStickyReason: null,
    openingSelectionSeed: normalizeSeed(seed),
    openingSelectionWasPersisted: false,
    weightsSummary,
  };
}

function lineDataForRepertoire(openingId: string): readonly RuntimeTrainableLineData[] | null {
  return getLoadedRuntimeLineData(openingId);
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
  ratingBandId?: Stage2RatingBandId | string | null;
}): RuntimeWeightedTrainingLineSelection | null {
  const ratingBandExplicit = Boolean(input.ratingBandId);
  const ratingBand = getStage2RatingBand(input.ratingBandId);
  const repertoire = input.repertoire ?? null;
  if (!repertoire || !Array.isArray(repertoire.lines) || repertoire.lines.length === 0) {
    return null;
  }
  const rawLines = lineDataForRepertoire(repertoire.id);
  if (!rawLines || rawLines.length === 0) {
    return null;
  }

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
      averageRating: sourceLine?.averageRating ?? null,
      profileId: sourceLine?.profileId ?? null,
      profile: sourceLine?.profile ?? null,
      profiles: sourceLine?.profiles ?? null,
    };
  });

  const ratingMatchedLineSummaries = ratingBandExplicit
    ? lineSummaries.filter((line) =>
        stage2RatingBandMatchesLocalMetadata({
          bandId: ratingBand.id,
          averageRating: line.averageRating,
          profileId: line.profileId,
          profile: line.profile,
          profiles: line.profiles,
        }),
      )
    : lineSummaries;

  const ratingGateFallbackUsed = ratingBandExplicit && ratingMatchedLineSummaries.length === 0;
  const ratingCandidateLineSummaries = ratingGateFallbackUsed ? lineSummaries : ratingMatchedLineSummaries;

  const eligibleLineSummaries = thirdConsecutiveRepeatLineKey
    ? ratingCandidateLineSummaries.filter((line) => line.lineKey !== thirdConsecutiveRepeatLineKey)
    : ratingCandidateLineSummaries;

  const blockedThirdRepeatLineKeys = thirdConsecutiveRepeatLineKey ? [thirdConsecutiveRepeatLineKey] : [];
  const repeatUnavoidable = Boolean(thirdConsecutiveRepeatLineKey && eligibleLineSummaries.length === 0);
  const weightedCandidates = eligibleLineSummaries.length > 0 ? eligibleLineSummaries : ratingCandidateLineSummaries;

  const selectionSeed = ratingBandExplicit
    ? buildStage2RatingAwareSeed(normalizeSeed(input.seed), ratingBand.id)
    : normalizeSeed(input.seed);

  const selected = pickWeighted(weightedCandidates, `${selectionSeed}:${repertoire.id}:${recentLineKeys.join("|")}`);

  return {
    mode: "runtime_weighted_line",
    source: "local_runtime_package",
    ratingBandId: ratingBandExplicit ? ratingBand.id : null,
    ratingBandLabel: ratingBandExplicit ? ratingBand.label : null,
    ratingBandTarget: ratingBandExplicit ? ratingBand.target : null,
    ratingAware: ratingBandExplicit,
    ratingGateFallbackUsed,
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
    variationReason: repeatUnavoidable
      ? "repeat_unavoidable_no_alternative"
      : blockedThirdRepeatLineKeys.length > 0
        ? "third_consecutive_repeat_excluded"
        : "fresh_line_selection",
    repeatUnavoidable,
    selectionSeed: normalizeSeed(input.seed),
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

export function buildRuntimeOpeningIdentityLines(repertoire: RuntimeTrainableRepertoire | null | undefined): RuntimeOpeningIdentityLine[] {
  if (!repertoire || !Array.isArray(repertoire.lines) || repertoire.lines.length === 0) return [];
  const rawLines = getLoadedRuntimeLineData(repertoire.id);
  if (!rawLines || rawLines.length === 0) return [];
  return rawLines.map((line, lineIndex) => {
    const playSequenceUci = normalizeRuntimePlaySequenceUci(line.playSequenceUci);
    return {
      openingId: repertoire.id,
      openingName: repertoire.name,
      lineId: line.lineId || `${repertoire.id}:${lineIndex}`,
      playKey: line.playKey || playSequenceUci.join(","),
      playSequenceUci,
      moveCount: playSequenceUci.length,
      totalGames: Math.max(1, Number(line.totalGames ?? playSequenceUci.length)),
    };
  });
}
