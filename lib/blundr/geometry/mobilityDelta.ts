import { Chess, validateFen } from "chess.js";
import type { Square } from "chess.js";

import { coordsToSquare, isBoardSquare, rayFrom, squareToCoords } from "./lineGeometry";
import {
  Color,
  MobilityDelta,
  OccupantRef,
  PieceSymbol,
  PIECE_VALUES,
} from "./salienceTypes";

type BoardOccupants = Record<string, OccupantRef>;

const KNIGHT_DELTAS = [
  [1, 2],
  [2, 1],
  [2, -1],
  [1, -2],
  [-1, -2],
  [-2, -1],
  [-2, 1],
  [-1, 2],
] as const;

const KING_DELTAS = [
  [1, 1],
  [1, 0],
  [1, -1],
  [0, 1],
  [0, -1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
] as const;

const BISHOP_DIRECTIONS = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
] as const;

const ROOK_DIRECTIONS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

function assertValidFen(fen: string): void {
  const validation = validateFen(fen);
  if (!validation.ok) {
    throw new Error(`Invalid FEN: ${validation.error}`);
  }
}

function parseUciMove(move: string): {
  from: Square;
  to: Square;
  promotion?: string;
} {
  const trimmed = move.trim().toLowerCase();
  const from = trimmed.slice(0, 2);
  const to = trimmed.slice(2, 4);
  const promotion = trimmed.slice(4, 5) || undefined;

  if (
    trimmed.length < 4 ||
    trimmed.length > 5 ||
    !isBoardSquare(from) ||
    !isBoardSquare(to) ||
    (promotion && !["q", "r", "b", "n"].includes(promotion))
  ) {
    throw new Error(`Invalid move format: ${move}`);
  }

  return promotion
    ? { from: from as Square, to: to as Square, promotion }
    : { from: from as Square, to: to as Square };
}

function boardOccupants(game: Chess): BoardOccupants {
  const occupants: BoardOccupants = {};

  for (const row of game.board()) {
    for (const piece of row) {
      if (!piece) {
        continue;
      }

      occupants[piece.square] = {
        color: piece.color as Color,
        piece: piece.type as PieceSymbol,
        value: PIECE_VALUES[piece.type as PieceSymbol],
      };
    }
  }

  return occupants;
}

function canLand(
  target: string | null,
  color: Color,
  occupants: BoardOccupants,
): target is string {
  return Boolean(target) && occupants[target!]?.color !== color;
}

function pseudoLegalMobilityFrom(
  square: string,
  occupants: BoardOccupants,
): number {
  const occupant = occupants[square];
  if (!occupant) {
    return 0;
  }

  const { file, rank } = squareToCoords(square);

  if (occupant.piece === "p") {
    const direction = occupant.color === "w" ? 1 : -1;
    const startRank = occupant.color === "w" ? 1 : 6;
    const oneForward = coordsToSquare(file, rank + direction);
    const twoForward = coordsToSquare(file, rank + direction * 2);
    let count = 0;

    if (oneForward && !occupants[oneForward]) {
      count += 1;
      if (rank === startRank && twoForward && !occupants[twoForward]) {
        count += 1;
      }
    }

    for (const df of [-1, 1]) {
      const target = coordsToSquare(file + df, rank + direction);
      if (target && occupants[target] && occupants[target].color !== occupant.color) {
        count += 1;
      }
    }

    return count;
  }

  if (occupant.piece === "n") {
    return KNIGHT_DELTAS.filter(([df, dr]) =>
      canLand(coordsToSquare(file + df, rank + dr), occupant.color, occupants),
    ).length;
  }

  if (occupant.piece === "k") {
    return KING_DELTAS.filter(([df, dr]) =>
      canLand(coordsToSquare(file + df, rank + dr), occupant.color, occupants),
    ).length;
  }

  const directions =
    occupant.piece === "b"
      ? BISHOP_DIRECTIONS
      : occupant.piece === "r"
        ? ROOK_DIRECTIONS
        : [...BISHOP_DIRECTIONS, ...ROOK_DIRECTIONS];
  let count = 0;

  for (const [df, dr] of directions) {
    for (const target of rayFrom(square, df, dr)) {
      if (!occupants[target]) {
        count += 1;
        continue;
      }

      if (occupants[target].color !== occupant.color) {
        count += 1;
      }
      break;
    }
  }

  return count;
}

function totalMobility(color: Color, occupants: BoardOccupants): number {
  return Object.entries(occupants).reduce((sum, [square, occupant]) => {
    if (occupant.color !== color) {
      return sum;
    }

    return sum + pseudoLegalMobilityFrom(square, occupants);
  }, 0);
}

export function computeMobilityDelta(fen: string, move: string): MobilityDelta {
  assertValidFen(fen);
  const parsed = parseUciMove(move);
  const game = new Chess(fen);
  const movingPiece = game.get(parsed.from);

  if (!movingPiece) {
    throw new Error(`Illegal move: no piece on ${parsed.from}`);
  }

  const color = movingPiece.color as Color;
  const enemy: Color = color === "w" ? "b" : "w";
  const beforeOccupants = boardOccupants(game);
  const movedPieceBefore = game
    .moves({ square: parsed.from, verbose: true })
    .filter((candidate) => candidate.color === color).length;
  const friendlyTotalBefore = totalMobility(color, beforeOccupants);
  const enemyTotalBefore = totalMobility(enemy, beforeOccupants);

  try {
    game.move(parsed);
  } catch {
    throw new Error(`Illegal move: ${move}`);
  }

  const afterOccupants = boardOccupants(game);
  const movedPieceAfter =
    afterOccupants[parsed.to]?.color === color
      ? pseudoLegalMobilityFrom(parsed.to, afterOccupants)
      : 0;
  const friendlyTotalAfter = totalMobility(color, afterOccupants);
  const enemyTotalAfter = totalMobility(enemy, afterOccupants);

  return {
    move,
    from: parsed.from,
    to: parsed.to,
    piece: movingPiece.type as PieceSymbol,
    color,
    movedPieceBefore,
    movedPieceAfter,
    movedPieceGain: movedPieceAfter - movedPieceBefore,
    friendlyTotalBefore,
    friendlyTotalAfter,
    friendlyTotalGain: friendlyTotalAfter - friendlyTotalBefore,
    enemyTotalBefore,
    enemyTotalAfter,
    enemyTotalLoss: enemyTotalBefore - enemyTotalAfter,
  };
}
