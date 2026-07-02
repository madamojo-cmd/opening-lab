import { sanToUci } from "@/lib/blundr/geometry/legalMoveUtils";
import { normalizeFenForVisualFrame } from "@/lib/blundr/teaching/overlayLifecycle";
import type {
  DailyBlundrCardSource,
  DailyBlundrDifficulty,
  DailyBlundrMasteryTarget,
  DailyBlundrSeed,
} from "../dailyBlundrTypes";

export const LEGACY_PROGRESS_STORAGE_KEY = "blundr-v22-progress";

export type LegacyMistakeSnapshot = {
  fen: string;
  expectedMove: string;
  playedMove: string;
  count: number;
  opening: string;
  repertoireId: string;
};

export type LegacyProgressSnapshot = {
  attempts: number;
  correct: number;
  incorrect: number;
  streak: number;
  trainedPositions: Record<string, boolean>;
  mistakes: Record<string, LegacyMistakeSnapshot>;
};

function getStorage(): Storage | undefined {
  if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  return typeof globalThis !== "undefined" && "localStorage" in globalThis ? (globalThis as { localStorage?: Storage }).localStorage : undefined;
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

export function buildDailyBlundrPositionKey(fen: string): string {
  return normalizeFenForVisualFrame(fen) ?? normalizeText(fen).replace(/\s+/g, " ");
}

export function buildDailyBlundrMoveKey(move: string | null | undefined): string {
  return normalizeText(move).toLowerCase().replace(/\s+/g, "");
}

function buildMasteryTargets(input: {
  positionKey: string;
  openingId: string | null;
  openingName: string | null;
  expectedMoveUci: string | null;
  expectedMoveSan: string | null;
}): DailyBlundrMasteryTarget[] {
  const moveKey = buildDailyBlundrMoveKey(input.expectedMoveUci ?? input.expectedMoveSan);
  const targets: DailyBlundrMasteryTarget[] = [
    {
      conceptKey: `daily:${input.positionKey}:${moveKey || "unknown"}`,
      domain: "daily_recall",
      label: input.openingName || "Daily recall",
      difficultyHint: input.expectedMoveUci ? "intermediate" : "early_intermediate",
    },
  ];

  if (input.openingId) {
    targets.push({
      conceptKey: `opening:${input.openingId}`,
      domain: "opening_review",
      label: input.openingName || input.openingId,
      difficultyHint: "beginner",
    });
  }

  return targets;
}

function buildDifficulty(count: number, hasExpectedUci: boolean): DailyBlundrDifficulty {
  if (!hasExpectedUci) return "beginner";
  if (count >= 5) return "advanced";
  if (count >= 3) return "intermediate";
  if (count >= 2) return "early_intermediate";
  return "beginner";
}

export function buildDailyBlundrCardKey(input: {
  fen: string;
  expectedMoveUci?: string | null;
  expectedMoveSan?: string | null;
}): string {
  const positionKey = buildDailyBlundrPositionKey(input.fen);
  const moveKey = buildDailyBlundrMoveKey(input.expectedMoveUci ?? input.expectedMoveSan);
  return `${positionKey}|${moveKey || "unknown"}`;
}

function createEmptyProgress(): LegacyProgressSnapshot {
  return {
    attempts: 0,
    correct: 0,
    incorrect: 0,
    streak: 0,
    trainedPositions: {},
    mistakes: {},
  };
}

function sanitizeMistake(raw: unknown): LegacyMistakeSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const mistake = raw as Partial<LegacyMistakeSnapshot>;
  const fen = normalizeText(mistake.fen);
  const expectedMove = normalizeText(mistake.expectedMove);
  const playedMove = normalizeText(mistake.playedMove);
  const opening = normalizeText(mistake.opening);
  const repertoireId = normalizeText(mistake.repertoireId);
  if (!fen || !expectedMove || !playedMove) return null;
  return {
    fen,
    expectedMove,
    playedMove,
    count: Number(mistake.count ?? 0) > 0 ? Number(mistake.count) : 1,
    opening: opening || "Unknown opening",
    repertoireId: repertoireId || "unknown",
  };
}

export function readLegacyProgressSnapshot(raw: unknown): LegacyProgressSnapshot {
  if (!raw || typeof raw !== "object") return createEmptyProgress();
  const candidate = raw as Partial<LegacyProgressSnapshot>;
  const mistakes: Record<string, LegacyMistakeSnapshot> = {};
  const rawMistakes = candidate.mistakes;

  if (rawMistakes && typeof rawMistakes === "object") {
    for (const [key, value] of Object.entries(rawMistakes)) {
      const sanitized = sanitizeMistake(value);
      if (sanitized) {
        mistakes[buildDailyBlundrPositionKey(sanitized.fen)] = sanitized;
      } else if (typeof key === "string" && key.trim()) {
        const fallbackFen = normalizeText((value as Partial<LegacyMistakeSnapshot> | null | undefined)?.fen ?? "");
        if (fallbackFen) {
          const fallback = sanitizeMistake(value);
          if (fallback) mistakes[buildDailyBlundrPositionKey(fallbackFen)] = fallback;
        }
      }
    }
  }

  return {
    attempts: Number(candidate.attempts ?? 0) || 0,
    correct: Number(candidate.correct ?? 0) || 0,
    incorrect: Number(candidate.incorrect ?? 0) || 0,
    streak: Number(candidate.streak ?? 0) || 0,
    trainedPositions: candidate.trainedPositions && typeof candidate.trainedPositions === "object" ? { ...candidate.trainedPositions } : {},
    mistakes,
  };
}

export function loadLegacyProgressSnapshot(): LegacyProgressSnapshot {
  const storage = getStorage();
  if (!storage) return createEmptyProgress();

  try {
    const raw = storage.getItem(LEGACY_PROGRESS_STORAGE_KEY);
    if (!raw) return createEmptyProgress();
    return readLegacyProgressSnapshot(JSON.parse(raw));
  } catch {
    return createEmptyProgress();
  }
}

function deriveExpectedMoveUci(fen: string, expectedMove: string): string | null {
  const uci = sanToUci(fen, expectedMove);
  return uci ? uci.toLowerCase() : null;
}

function estimateSourceWeight(count: number, source: DailyBlundrCardSource): number {
  return source === "learning_event" ? 1 + Math.max(0, count - 1) * 0.15 : Math.max(1, count);
}

export function adaptProgressMistakesToDailySeeds(progress: LegacyProgressSnapshot | null | undefined): DailyBlundrSeed[] {
  if (!progress?.mistakes) return [];
  const seeds: DailyBlundrSeed[] = [];

  for (const mistake of Object.values(progress.mistakes)) {
    const fen = normalizeText(mistake.fen);
    const expectedMoveSan = normalizeText(mistake.expectedMove);
    if (!fen || !expectedMoveSan) continue;

    const expectedMoveUci = deriveExpectedMoveUci(fen, expectedMoveSan);
    const playedMoveSan = normalizeText(mistake.playedMove);
    const playedMoveUci = playedMoveSan ? deriveExpectedMoveUci(fen, playedMoveSan) : null;

    const positionKey = buildDailyBlundrPositionKey(fen);
    const cardKey = buildDailyBlundrCardKey({ fen, expectedMoveSan, expectedMoveUci });
    const count = Number(mistake.count ?? 0) > 0 ? Number(mistake.count) : 1;
    const hasExpectedUci = Boolean(expectedMoveUci);
    seeds.push({
      source: "progress_mistake",
      cardKey,
      positionKey,
      fen,
      expectedMoveUci,
      expectedMoveSan,
      playedMoveUci,
      playedMoveSan,
      openingId: normalizeText(mistake.repertoireId) || null,
      openingName: normalizeText(mistake.opening) || null,
      patternId: null,
      concept: null,
      count,
      weight: estimateSourceWeight(count, "progress_mistake") * (hasExpectedUci ? 1 : 0.7),
      lastSeenAt: null,
      note: hasExpectedUci ? `Missed ${count}x` : `Missed ${count}x (SAN only)`,
      signals: ["progress_mistake", `repeat_count:${count}`, hasExpectedUci ? "uci_available" : "san_only"],
      masteryTargets: buildMasteryTargets({
        positionKey,
        openingId: normalizeText(mistake.repertoireId) || null,
        openingName: normalizeText(mistake.opening) || null,
        expectedMoveUci,
        expectedMoveSan,
      }),
      confidence: hasExpectedUci ? (count >= 2 ? "high" : "medium") : "low",
      difficulty: buildDifficulty(count, hasExpectedUci),
    });
  }

  return seeds;
}
