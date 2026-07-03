import { Chess, type Move } from "chess.js";
import type { DailyBlundrCard, DailyBlundrDifficulty, DailyBlundrMasteryTarget } from "../dailyBlundrTypes";
import type { DailyBlundrTrainingTargetCard } from "./dailyTrainingTargetTypes";
import type { DailyTrainingTargetCandidateMove, DailyTrainingTargetSkillId, DailyTrainingTargetState } from "./dailyTrainingTargetTypes";

export function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function fileIndex(square: string): number {
  return Math.max(0, Math.min(7, square.toLowerCase().charCodeAt(0) - 97));
}

export function rankIndex(square: string): number {
  return Math.max(0, Math.min(7, 8 - Number(square.slice(1))));
}

export function squareToCoords(square: string): { file: number; rank: number } {
  return {
    file: fileIndex(square),
    rank: rankIndex(square),
  };
}

export function coordsToSquare(file: number, rank: number): string {
  const clampedFile = Math.max(0, Math.min(7, file));
  const clampedRank = Math.max(0, Math.min(7, rank));
  return `${String.fromCharCode(97 + clampedFile)}${8 - clampedRank}`;
}

export function squareDistance(a: string, b: string): number {
  const fileDistance = Math.abs(fileIndex(a) - fileIndex(b));
  const rankDistance = Math.abs(rankIndex(a) - rankIndex(b));
  return Math.max(fileDistance, rankDistance);
}

export function squareManhattanDistance(a: string, b: string): number {
  const fileDistance = Math.abs(fileIndex(a) - fileIndex(b));
  const rankDistance = Math.abs(rankIndex(a) - rankIndex(b));
  return fileDistance + rankDistance;
}

export function hashString(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function uniqueSquares(values: readonly string[] | undefined): string[] {
  return Array.from(new Set((values ?? []).map((value) => normalizeText(value).toLowerCase()).filter(Boolean)));
}

export function buildBoardFen(pieces: Array<{ square: string; piece: string }>, sideToMove: "w" | "b" = "w"): string {
  const board = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => ""));
  const place = (square: string, piece: string) => {
    const file = fileIndex(square);
    const rank = rankIndex(square);
    if (file < 0 || file > 7 || rank < 0 || rank > 7) return;
    board[rank][file] = piece;
  };
  for (const entry of pieces) place(entry.square, entry.piece);
  const ranks = board
    .map((rank) => {
      let empty = 0;
      let row = "";
      for (const cell of rank) {
        if (!cell) {
          empty += 1;
          continue;
        }
        if (empty > 0) {
          row += String(empty);
          empty = 0;
        }
        row += cell;
      }
      if (empty > 0) row += String(empty);
      return row || "8";
    })
    .join("/");
  return `${ranks} ${sideToMove} - - 0 1`;
}

export function applyMoveUci(fen: string, uci: string): { chess: Chess; move: Move | null } | null {
  const normalized = normalizeText(uci).toLowerCase();
  if (!normalized) return null;
  try {
    const chess = new Chess(fen);
    const move = chess.move({
      from: normalized.slice(0, 2) as never,
      to: normalized.slice(2, 4) as never,
      promotion: normalized.length > 4 ? (normalized.slice(4, 5) as never) : undefined,
    });
    return { chess, move };
  } catch {
    return null;
  }
}

export function isPawnMove(fen: string, uci: string): boolean {
  const normalized = normalizeText(uci).toLowerCase();
  if (!normalized) return false;
  try {
    const chess = new Chess(fen);
    const piece = chess.get(normalized.slice(0, 2) as never);
    return piece?.type === "p";
  } catch {
    return false;
  }
}

export function getMoveSan(fen: string, uci: string): string | null {
  const applied = applyMoveUci(fen, uci);
  return applied?.move?.san ?? null;
}

function moveScore(move: Move): number {
  const captureValue: Record<string, number> = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 0,
  };
  const pieceValue: Record<string, number> = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 0,
  };
  const destination = move.to.toLowerCase();
  const centerDistance = squareManhattanDistance(destination, "d4") + squareManhattanDistance(destination, "e4") + squareManhattanDistance(destination, "d5") + squareManhattanDistance(destination, "e5");
  const centerBonus = Math.max(0, 20 - centerDistance * 2);
  const advancement = move.color === "w" ? 8 - Number(destination.slice(1)) : Number(destination.slice(1)) - 1;
  const captureBonus = move.captured ? 10 + (captureValue[move.captured] ?? 0) * 2 : 0;
  const promotionBonus = move.promotion ? 18 : 0;
  const developmentBonus = move.piece === "n" || move.piece === "b" ? 6 : move.piece === "r" || move.piece === "q" ? 3 : 0;
  const pawnBonus = move.piece === "p" ? advancement * 2 : 0;
  const fromRank = Number(move.from.slice(1));
  const initialRankBonus = move.piece === "n" && ((move.color === "w" && fromRank === 1) || (move.color === "b" && fromRank === 8)) ? 5 : 0;
  return captureBonus + promotionBonus + centerBonus + developmentBonus + pawnBonus + initialRankBonus + (pieceValue[move.piece] ?? 0);
}

export function listLegalMoves(fen: string): Move[] {
  try {
    const chess = new Chess(fen);
    return chess.moves({ verbose: true }) as Move[];
  } catch {
    return [];
  }
}

export function moveToUci(move: Move | null | undefined): string {
  if (!move) return "";
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}

export function moveToSan(move: Move | null | undefined): string | null {
  return move?.san ?? null;
}

export function pickBestLegalMove(fen: string, excludedMoves: readonly string[] = []): Move | null {
  const excluded = new Set(excludedMoves.map((value) => normalizeText(value).toLowerCase()).filter(Boolean));
  const moves = listLegalMoves(fen)
    .filter((move) => !excluded.has(moveToUci(move).toLowerCase()))
    .sort((a, b) => moveScore(b) - moveScore(a) || moveToUci(a).localeCompare(moveToUci(b)));
  return moves[0] ?? null;
}

export function buildCandidateMoves(fen: string, correctUci: string, count: number): Array<{ uci: string; san?: string | null; label?: string | null; isCorrect: boolean; explanation?: string | null }> {
  const normalizedCorrect = normalizeText(correctUci).toLowerCase();
  const legalMoves = listLegalMoves(fen)
    .sort((a, b) => moveScore(b) - moveScore(a) || moveToUci(a).localeCompare(moveToUci(b)));
  const candidates: Array<{ uci: string; san?: string | null; label?: string | null; isCorrect: boolean; explanation?: string | null }> = [];
  const correctMove = legalMoves.find((move) => moveToUci(move).toLowerCase() === normalizedCorrect);
  if (correctMove) {
    candidates.push({
      uci: moveToUci(correctMove),
      san: moveToSan(correctMove),
      label: moveToSan(correctMove) || moveToUci(correctMove),
      isCorrect: true,
      explanation: "tempo_choice",
    });
  } else if (normalizedCorrect) {
    candidates.push({
      uci: normalizedCorrect,
      san: null,
      label: normalizedCorrect,
      isCorrect: true,
      explanation: "tempo_choice",
    });
  }

  for (const move of legalMoves) {
    const uci = moveToUci(move);
    if (!uci || uci.toLowerCase() === normalizedCorrect) continue;
    candidates.push({
      uci,
      san: moveToSan(move),
      label: moveToSan(move) || uci,
      isCorrect: false,
      explanation: "plausible_reply",
    });
    if (candidates.length >= Math.max(2, count)) break;
  }

  return candidates.slice(0, Math.max(2, count));
}

export function buildSequenceFromFen(fen: string, plyCount: number, preferredMoves: readonly string[] = []): { sequence: string[]; finalFen: string } {
  const sequence: string[] = [];
  let currentFen = fen;
  const limit = Math.max(1, plyCount);
  const seen = new Set<string>();

  for (const preferred of preferredMoves) {
    if (sequence.length >= limit) break;
    const applied = applyMoveUci(currentFen, preferred);
    if (!applied?.move) continue;
    const uci = moveToUci(applied.move);
    if (!uci || seen.has(uci)) continue;
    sequence.push(uci);
    seen.add(uci);
    currentFen = applied.chess.fen();
  }

  while (sequence.length < limit) {
    const move = pickBestLegalMove(currentFen, sequence);
    if (!move) break;
    const uci = moveToUci(move);
    if (!uci || seen.has(uci)) break;
    sequence.push(uci);
    seen.add(uci);
    const applied = applyMoveUci(currentFen, uci);
    if (!applied?.move) break;
    currentFen = applied.chess.fen();
  }

  return { sequence, finalFen: currentFen };
}

export function pickDailyBlundrCard<T extends Pick<DailyBlundrCard, "kind" | "source" | "expectedMoveUci" | "expectedMoveSan" | "fen" | "openingName" | "openingId" | "patternId" | "concept" | "signals" | "masteryTargets">>(
  cards: readonly T[] | null | undefined,
  predicate: (card: T) => boolean,
  score: (card: T) => number,
): T | null {
  const pool = (cards ?? []).filter(predicate);
  if (!pool.length) return null;
  return [...pool].sort((a, b) => score(b) - score(a) || normalizeText(a.openingName).localeCompare(normalizeText(b.openingName)) || normalizeText(a.fen).localeCompare(normalizeText(b.fen)))[0] ?? null;
}

export function buildTrainingTargetMasteryTargets(
  trainingTargetId: string,
  skillIds: readonly string[],
  difficulty: DailyBlundrDifficulty,
  labels: readonly string[],
): DailyBlundrMasteryTarget[] {
  return skillIds.map((skillId, index) => ({
    conceptKey: `target:${trainingTargetId}:${skillId}`,
    domain: "training_target",
    label: labels[index] ?? skillId,
    difficultyHint: difficulty,
  }));
}

export function chooseTrainingTargetDifficulty(currentMastery: number, confidence: number, baseDifficulty: DailyBlundrDifficulty): DailyBlundrDifficulty {
  const mastery = clamp01(currentMastery);
  const trust = clamp01(confidence);
  if (mastery < 0.35) return trust > 0.55 ? "beginner" : "intro";
  if (mastery < 0.7) return trust > 0.6 ? "intermediate" : "beginner";
  if (mastery < 0.82) return trust > 0.6 ? "advanced" : "intermediate";
  return trust > 0.6 ? "expert" : "advanced";
}

export function buildTrainingTargetTrainingState(input: {
  trainingTargetId: DailyTrainingTargetState["trainingTargetId"];
  skillIds: readonly DailyTrainingTargetSkillId[];
  difficulty: DailyBlundrDifficulty;
  interactionKind: DailyTrainingTargetState["interactionKind"];
  startFen: string;
  currentFen?: string;
  learnerSide: DailyTrainingTargetState["learnerSide"];
  sideToMove: DailyTrainingTargetState["sideToMove"];
  prompt: string;
  expectedMoveUci?: string | null;
  expectedMoveSan?: string | null;
  expectedSequenceUci?: string[];
  candidateMoves?: DailyTrainingTargetCandidateMove[];
  targetSquares?: string[];
  correctSquareKeys?: string[];
  moveLimit?: number;
  plyCount?: number;
  bestKnownScore?: number;
  formationHash: string;
  noveltyKey: string;
  sourceCardKey?: string | null;
  sourceLabel?: string | null;
  lastMoveUci?: string | null;
  lastMoveSan?: string | null;
}): DailyTrainingTargetState {
  return {
    trainingTargetId: input.trainingTargetId,
    skillIds: [...input.skillIds],
    difficulty: input.difficulty,
    interactionKind: input.interactionKind,
    startFen: input.startFen,
    currentFen: input.currentFen ?? input.startFen,
    learnerSide: input.learnerSide,
    sideToMove: input.sideToMove,
    prompt: input.prompt,
    expectedMoveUci: input.expectedMoveUci ?? null,
    expectedMoveSan: input.expectedMoveSan ?? null,
    expectedSequenceUci: input.expectedSequenceUci,
    candidateMoves: input.candidateMoves,
    targetSquares: input.targetSquares,
    correctSquareKeys: input.correctSquareKeys,
    selectedSquares: [],
    moveLimit: input.moveLimit,
    plyCount: Math.max(0, Number(input.plyCount ?? 0) || 0),
    completed: false,
    won: false,
    bestKnownScore: input.bestKnownScore,
    formationHash: input.formationHash,
    noveltyKey: input.noveltyKey,
    sourceCardKey: input.sourceCardKey ?? null,
    sourceLabel: input.sourceLabel ?? null,
    lastMoveUci: input.lastMoveUci ?? null,
    lastMoveSan: input.lastMoveSan ?? null,
  };
}

export function buildTrainingTargetCard(input: Omit<DailyBlundrTrainingTargetCard, "kind" | "trainingTarget"> & { trainingTarget: DailyTrainingTargetState }): DailyBlundrTrainingTargetCard {
  const { trainingTarget, ...base } = input;
  return {
    ...base,
    kind: "training_target",
    trainingTarget,
  };
}

export function pathSquares(from: string, to: string): string[] {
  const fromCoords = squareToCoords(from);
  const toCoords = squareToCoords(to);
  const fileDelta = Math.sign(toCoords.file - fromCoords.file);
  const rankDelta = Math.sign(toCoords.rank - fromCoords.rank);
  const squares: string[] = [from.toLowerCase()];
  let currentFile = fromCoords.file;
  let currentRank = fromCoords.rank;
  while (currentFile !== toCoords.file || currentRank !== toCoords.rank) {
    if (currentFile !== toCoords.file) currentFile += fileDelta;
    if (currentRank !== toCoords.rank) currentRank += rankDelta;
    squares.push(coordsToSquare(currentFile, currentRank));
    if (squares.length > 8) break;
  }
  return uniqueSquares(squares);
}
