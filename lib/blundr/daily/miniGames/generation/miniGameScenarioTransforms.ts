import type { Square } from "@/lib/blundr/geometry/boardTypes";
import { parseFenBoard } from "@/lib/blundr/geometry/fenBoardParser";
import { normalizeText } from "../miniGameUtils";
import { buildFenFromPieces, normalizeFen, type MiniGamePiecePlacement } from "./miniGameFenBuilder";
import { applyBoardTransform, type BoardTransformId } from "./miniGameBoardGeometry";
import type { MiniGameGenerationCandidate } from "./miniGameGenerationTypes";

export type MiniGameScenarioTransform = {
  id: BoardTransformId;
};

export function enumerateMiniGameTransforms(seed: string | number, allowMirrorFiles = true, allowMirrorRanks = true): MiniGameScenarioTransform[] {
  const base: MiniGameScenarioTransform[] = [{ id: "identity" }];
  const normalized = normalizeText(seed).toLowerCase();
  if (allowMirrorFiles && normalized.length % 2 === 0) base.push({ id: "mirror_files" });
  if (allowMirrorRanks && normalized.length % 3 === 0) base.push({ id: "mirror_ranks" });
  if (allowMirrorFiles && allowMirrorRanks && normalized.length % 5 === 0) base.push({ id: "rotate_180" });
  return base;
}

export function transformSquare(square: Square, transform: MiniGameScenarioTransform): Square {
  return applyBoardTransform(square, transform.id);
}

export function transformSquareList(values: readonly Square[] | undefined, transform: MiniGameScenarioTransform): Square[] {
  return (values ?? []).map((value) => transformSquare(value, transform));
}

function transformUci(uci: string, transform: MiniGameScenarioTransform): string {
  const text = normalizeText(uci).toLowerCase();
  if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/i.test(text)) return text;
  const from = transformSquare(text.slice(0, 2) as Square, transform);
  const to = transformSquare(text.slice(2, 4) as Square, transform);
  if (!from || !to) return text;
  return `${from}${to}${text.length > 4 ? text.slice(4, 5) : ""}`;
}

export function transformGeneratedCandidate(candidate: MiniGameGenerationCandidate, transform: MiniGameScenarioTransform): MiniGameGenerationCandidate {
  const board = parseFenBoard(candidate.board.fen);
  const pieceMap: Record<string, string> = {
    king: "K",
    queen: "Q",
    rook: "R",
    bishop: "B",
    knight: "N",
    pawn: "P",
  };
  const placements: MiniGamePiecePlacement[] = board.pieces.map((piece) => ({
    square: transformSquare(piece.square, transform),
    piece: piece.color === "white" ? pieceMap[piece.type] ?? "P" : (pieceMap[piece.type]?.toLowerCase() ?? "p"),
  }));
  const fen = normalizeFen(buildFenFromPieces(placements, candidate.board.sideToMove));
  return {
    ...candidate,
    board: {
      ...candidate.board,
      fen,
    },
    solution: {
      ...candidate.solution,
      primaryMoveUci: transformUci(candidate.solution.primaryMoveUci, transform),
      from: transformSquare(candidate.solution.from, transform),
      to: transformSquare(candidate.solution.to, transform),
      acceptedMoves: candidate.solution.acceptedMoves?.map((move) => transformUci(move, transform)).filter((move): move is string => Boolean(move)) ?? candidate.solution.acceptedMoves,
    },
    overlays: {
      ...candidate.overlays,
      selectedSquares: transformSquareList(candidate.overlays.selectedSquares, transform),
      targetSquares: transformSquareList(candidate.overlays.targetSquares, transform),
      keySquares: transformSquareList(candidate.overlays.keySquares, transform),
      dangerSquares: transformSquareList(candidate.overlays.dangerSquares, transform),
      route: transformSquareList(candidate.overlays.route, transform),
      lastMove: candidate.overlays.lastMove ? { from: transformSquare(candidate.overlays.lastMove.from, transform), to: transformSquare(candidate.overlays.lastMove.to, transform) } : undefined,
      arrows: candidate.overlays.arrows?.map((arrow) => ({
        from: transformSquare(arrow.from, transform),
        to: transformSquare(arrow.to, transform),
        type: arrow.type,
      })),
    },
    transformIds: [...(candidate.transformIds ?? []), transform.id],
  };
}
