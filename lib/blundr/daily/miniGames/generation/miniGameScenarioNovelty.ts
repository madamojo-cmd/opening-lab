import type { Square } from "@/lib/blundr/geometry/boardTypes";
import { normalizeFen } from "./miniGameFenBuilder";
import type { GeneratedMiniGameDifficulty, MiniGameGenerationCandidate } from "./miniGameGenerationTypes";
import { normalizeText } from "../miniGameUtils";

function normalizeSquareList(values: readonly Square[] | undefined): string {
  return (values ?? []).map((square) => normalizeText(square).toLowerCase()).filter(Boolean).join(",");
}

function normalizeTargetPart(values: readonly Square[] | undefined): string {
  return normalizeSquareList(values);
}

export function buildGeneratedScenarioKey(input: {
  miniGameId: string;
  source: string;
  family: string;
  motif?: string;
  fen: string;
  primaryMoveUci: string;
  targetSquares?: readonly Square[] | undefined;
  difficulty: GeneratedMiniGameDifficulty;
  orientation: "white" | "black";
}): string {
  return [
    "procedural",
    input.source,
    input.miniGameId,
    normalizeText(input.family).toLowerCase(),
    normalizeText(input.motif ?? "").toLowerCase() || "motif",
    normalizeFen(input.fen),
    normalizeText(input.primaryMoveUci).toLowerCase(),
    normalizeTargetPart(input.targetSquares),
    input.difficulty,
    input.orientation,
  ].join("::");
}

export function buildCandidateScenarioKey(candidate: MiniGameGenerationCandidate, source: string): string {
  return buildGeneratedScenarioKey({
    miniGameId: candidate.miniGameId,
    source,
    family: candidate.family,
    motif: candidate.motif,
    fen: candidate.board.fen,
    primaryMoveUci: candidate.solution.primaryMoveUci,
    targetSquares: candidate.overlays.targetSquares ?? candidate.overlays.keySquares ?? [],
    difficulty: candidate.difficulty,
    orientation: candidate.board.orientation,
  });
}

export function rankScenarioKeysByNovelty(input: {
  candidateKeys: readonly { key: string; index: number }[];
  recentScenarioKeys?: readonly string[] | null;
}): string[] {
  const recent = new Map<string, number>();
  (input.recentScenarioKeys ?? []).forEach((value, index) => {
    recent.set(normalizeText(value).toLowerCase(), index);
  });
  return [...input.candidateKeys]
    .map((entry) => ({
      ...entry,
      recentIndex: recent.has(normalizeText(entry.key).toLowerCase()) ? (recent.get(normalizeText(entry.key).toLowerCase()) ?? -1) : -1,
    }))
    .sort((a, b) => {
      if (a.recentIndex >= 0 && b.recentIndex >= 0) return b.recentIndex - a.recentIndex || a.index - b.index;
      if (a.recentIndex >= 0) return 1;
      if (b.recentIndex >= 0) return -1;
      return a.index - b.index;
    })
    .map((entry) => entry.key);
}

export function selectNovelScenarioKey(input: {
  candidateKeys: readonly { key: string; index: number }[];
  recentScenarioKeys?: readonly string[] | null;
}): string | null {
  const ranked = rankScenarioKeysByNovelty(input);
  return ranked[0] ?? null;
}
