import { Chess } from "chess.js";

import { coordsToSquare, normalizeText, squareToCoords } from "./miniGameUtils";

export type MiniGameSquareTransform = {
  id: string;
  fileDelta: number;
  rankDelta: number;
  mirrorFiles: boolean;
  mirrorRanks: boolean;
};

function uniqueText(values: readonly (string | null | undefined)[]): string[] {
  return Array.from(new Set(values.map((value) => normalizeText(value)).filter(Boolean)));
}

function buildFenFromPieces(pieces: Array<{ square: string; piece: string }>, sideToMove: "w" | "b"): string {
  const board = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => ""));
  for (const entry of pieces) {
    const file = entry.square.toLowerCase().charCodeAt(0) - 97;
    const rank = 8 - Number(entry.square.slice(1));
    if (file < 0 || file > 7 || rank < 0 || rank > 7) {
      continue;
    }
    board[rank][file] = entry.piece;
  }

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

function transformCoords(square: string, transform: MiniGameSquareTransform): string | null {
  const coords = squareToCoords(square);
  const mirroredFile = transform.mirrorFiles ? 7 - coords.file : coords.file;
  const mirroredRank = transform.mirrorRanks ? 7 - coords.rank : coords.rank;
  const nextFile = mirroredFile + transform.fileDelta;
  const nextRank = mirroredRank + transform.rankDelta;
  if (nextFile < 0 || nextFile > 7 || nextRank < 0 || nextRank > 7) return null;
  return coordsToSquare(nextFile, nextRank);
}

export function transformSquare(square: string, transform: MiniGameSquareTransform): string | null {
  return transformCoords(square, transform);
}

export function transformUci(uci: string, transform: MiniGameSquareTransform): string | null {
  const text = normalizeText(uci).toLowerCase();
  if (text.length < 4) return null;
  const from = transformSquare(text.slice(0, 2), transform);
  const to = transformSquare(text.slice(2, 4), transform);
  if (!from || !to) return null;
  return `${from}${to}${text.slice(4)}`;
}

export function transformSquareList(values: readonly string[] | undefined, transform: MiniGameSquareTransform): string[] | null {
  const nextValues: string[] = [];
  for (const value of uniqueText(values ?? []).map((entry) => entry.toLowerCase())) {
    const transformed = transformSquare(value, transform);
    if (!transformed) return null;
    nextValues.push(transformed);
  }
  return Array.from(new Set(nextValues));
}

export function enumerateMiniGameTransforms(
  referenceSquares: readonly string[],
  options: {
    allowMirrorFiles?: boolean;
    allowMirrorRanks?: boolean;
    maxFileDelta?: number;
    maxRankDelta?: number;
  } = {},
): MiniGameSquareTransform[] {
  const normalized = uniqueText(referenceSquares).map((square) => square.toLowerCase());
  if (!normalized.length) {
    return [
      {
        id: "identity",
        fileDelta: 0,
        rankDelta: 0,
        mirrorFiles: false,
        mirrorRanks: false,
      },
    ];
  }

  const coordinates = normalized.map(squareToCoords);
  const minFile = Math.min(...coordinates.map((entry) => entry.file));
  const maxFile = Math.max(...coordinates.map((entry) => entry.file));
  const minRank = Math.min(...coordinates.map((entry) => entry.rank));
  const maxRank = Math.max(...coordinates.map((entry) => entry.rank));
  const maxFileDelta = Math.max(0, Math.floor(Number(options.maxFileDelta ?? 3) || 3));
  const maxRankDelta = Math.max(0, Math.floor(Number(options.maxRankDelta ?? 3) || 3));
  const fileDeltaStart = Math.max(-maxFileDelta, -minFile);
  const fileDeltaEnd = Math.min(maxFileDelta, 7 - maxFile);
  const rankDeltaStart = Math.max(-maxRankDelta, -minRank);
  const rankDeltaEnd = Math.min(maxRankDelta, 7 - maxRank);
  const mirrorOptions = options.allowMirrorFiles === false ? [false] : [false, true];
  const rankMirrorOptions = options.allowMirrorRanks === false ? [false] : [false, true];
  const transforms: MiniGameSquareTransform[] = [];

  for (const mirrorFiles of mirrorOptions) {
    for (const mirrorRanks of rankMirrorOptions) {
      for (let rankDelta = rankDeltaStart; rankDelta <= rankDeltaEnd; rankDelta += 1) {
        for (let fileDelta = fileDeltaStart; fileDelta <= fileDeltaEnd; fileDelta += 1) {
          transforms.push({
            id: `mirror_${mirrorFiles ? "1" : "0"}_rank_${mirrorRanks ? "1" : "0"}_dx_${fileDelta}_dy_${rankDelta}`,
            fileDelta,
            rankDelta,
            mirrorFiles,
            mirrorRanks,
          });
        }
      }
    }
  }

  return transforms.length > 0
    ? transforms
    : [
        {
          id: "identity",
          fileDelta: 0,
          rankDelta: 0,
          mirrorFiles: false,
          mirrorRanks: false,
        },
      ];
}

export function transformFenWithPieces(
  fen: string,
  transform: MiniGameSquareTransform,
): { fen: string; sideToMove: "w" | "b" } | null {
  try {
    const chess = new Chess(fen);
    const board = chess.board();
    const pieces: Array<{ square: string; piece: string }> = [];
    const occupied = new Set<string>();
    for (let rank = 0; rank < board.length; rank += 1) {
      for (let file = 0; file < board[rank].length; file += 1) {
        const piece = board[rank][file];
        if (!piece) continue;
        const square = `${String.fromCharCode(97 + file)}${8 - rank}`;
        const transformedSquare = transformSquare(square, transform);
        if (!transformedSquare || occupied.has(transformedSquare)) {
          return null;
        }
        occupied.add(transformedSquare);
        pieces.push({
          square: transformedSquare,
          piece: piece.color === "w" ? piece.type.toUpperCase() : piece.type,
        });
      }
    }

    const transformedFen = buildFenFromPieces(pieces, chess.turn());
    const verification = new Chess(transformedFen);
    return { fen: verification.fen(), sideToMove: verification.turn() };
  } catch {
    return null;
  }
}

export function hashTransformSelection(seed: string, scenarioKey: string, index: number): number {
  let hash = 0;
  const input = `${normalizeText(seed)}|${normalizeText(scenarioKey)}|${index}`;
  for (let offset = 0; offset < input.length; offset += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(offset);
    hash |= 0;
  }
  return Math.abs(hash);
}
