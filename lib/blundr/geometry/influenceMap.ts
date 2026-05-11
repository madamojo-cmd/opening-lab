import { Chess, validateFen } from "chess.js";

import {
  ALL_SQUARES,
  coordsToSquare,
  kingDistance,
  rayFrom,
  squareToCoords,
} from "./lineGeometry";
import {
  AttackRef,
  Color,
  InfluenceMap,
  OccupantRef,
  PIECE_VALUES,
  PieceSymbol,
  SquareInfluence,
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

export function getPieceValue(piece: PieceSymbol): number {
  return PIECE_VALUES[piece];
}

function assertValidFen(fen: string): void {
  const validation = validateFen(fen);
  if (!validation.ok) {
    throw new Error(`Invalid FEN: ${validation.error}`);
  }
}

export function getBoardOccupants(fen: string): BoardOccupants {
  assertValidFen(fen);
  const game = new Chess(fen);
  const occupants: BoardOccupants = {};

  for (const row of game.board()) {
    for (const piece of row) {
      if (!piece) {
        continue;
      }

      occupants[piece.square] = {
        color: piece.color as Color,
        piece: piece.type as PieceSymbol,
        value: getPieceValue(piece.type as PieceSymbol),
      };
    }
  }

  return occupants;
}

function attacksFrom(
  square: string,
  occupant: OccupantRef,
  occupants: BoardOccupants,
): string[] {
  const { file, rank } = squareToCoords(square);

  if (occupant.piece === "p") {
    const direction = occupant.color === "w" ? 1 : -1;
    return [-1, 1]
      .map((df) => coordsToSquare(file + df, rank + direction))
      .filter((target): target is string => Boolean(target));
  }

  if (occupant.piece === "n") {
    return KNIGHT_DELTAS.map(([df, dr]) => coordsToSquare(file + df, rank + dr))
      .filter((target): target is string => Boolean(target));
  }

  if (occupant.piece === "k") {
    return KING_DELTAS.map(([df, dr]) => coordsToSquare(file + df, rank + dr))
      .filter((target): target is string => Boolean(target));
  }

  const directions =
    occupant.piece === "b"
      ? BISHOP_DIRECTIONS
      : occupant.piece === "r"
        ? ROOK_DIRECTIONS
        : [...BISHOP_DIRECTIONS, ...ROOK_DIRECTIONS];
  const targets: string[] = [];

  for (const [df, dr] of directions) {
    for (const target of rayFrom(square, df, dr)) {
      targets.push(target);
      if (occupants[target]) {
        break;
      }
    }
  }

  return targets;
}

export function getAttackersForSquare(
  square: string,
  fenOrOccupants: string | BoardOccupants,
): AttackRef[] {
  const occupants =
    typeof fenOrOccupants === "string"
      ? getBoardOccupants(fenOrOccupants)
      : fenOrOccupants;
  const attackers: AttackRef[] = [];

  for (const [source, occupant] of Object.entries(occupants)) {
    if (attacksFrom(source, occupant, occupants).includes(square)) {
      attackers.push({
        square: source,
        piece: occupant.piece,
        color: occupant.color,
        value: occupant.value,
      });
    }
  }

  return attackers;
}

function attackWeight(attackers: AttackRef[]): number {
  return attackers.reduce((sum, attacker) => sum + attacker.value, 0);
}

function proximity(square: string, kingSquare?: string): number {
  if (!kingSquare) {
    return 0;
  }

  return Math.max(0, 8 - kingDistance(square, kingSquare));
}

export function computeInfluenceMap(fen: string): InfluenceMap {
  assertValidFen(fen);
  const occupants = getBoardOccupants(fen);
  let whiteKingSquare: string | undefined;
  let blackKingSquare: string | undefined;

  for (const [square, occupant] of Object.entries(occupants)) {
    if (occupant.piece === "k" && occupant.color === "w") {
      whiteKingSquare = square;
    }
    if (occupant.piece === "k" && occupant.color === "b") {
      blackKingSquare = square;
    }
  }

  const squares: Record<string, SquareInfluence> = {};

  for (const square of ALL_SQUARES) {
    const occupiedBy = occupants[square];
    const attackers = getAttackersForSquare(square, occupants);
    const whiteAttackers = attackers.filter((attacker) => attacker.color === "w");
    const blackAttackers = attackers.filter((attacker) => attacker.color === "b");
    const whiteAttackWeight = attackWeight(whiteAttackers);
    const blackAttackWeight = attackWeight(blackAttackers);
    const whiteDefenders =
      occupiedBy?.color === "w" ? whiteAttackers : [];
    const blackDefenders =
      occupiedBy?.color === "b" ? blackAttackers : [];
    const whiteDefenseWeight = attackWeight(whiteDefenders);
    const blackDefenseWeight = attackWeight(blackDefenders);
    const whiteRelevant =
      occupiedBy?.color === "w" || blackAttackWeight > 0 || whiteAttackWeight > 0;
    const blackRelevant =
      occupiedBy?.color === "b" || whiteAttackWeight > 0 || blackAttackWeight > 0;

    squares[square] = {
      square,
      occupiedBy,
      whiteAttackers,
      blackAttackers,
      whiteAttackWeight,
      blackAttackWeight,
      whiteDefenders,
      blackDefenders,
      whiteDefenseWeight,
      blackDefenseWeight,
      contested: whiteAttackWeight > 0 && blackAttackWeight > 0,
      weakForWhite:
        whiteRelevant &&
        blackAttackWeight > 0 &&
        (whiteDefenseWeight === 0 || blackAttackWeight > whiteDefenseWeight),
      weakForBlack:
        blackRelevant &&
        whiteAttackWeight > 0 &&
        (blackDefenseWeight === 0 || whiteAttackWeight > blackDefenseWeight),
      hangingWhitePiece:
        occupiedBy?.color === "w" && blackAttackWeight > whiteDefenseWeight,
      hangingBlackPiece:
        occupiedBy?.color === "b" && whiteAttackWeight > blackDefenseWeight,
      kingProximityWhite: proximity(square, whiteKingSquare),
      kingProximityBlack: proximity(square, blackKingSquare),
    };
  }

  return {
    fen,
    squares,
    whiteKingSquare,
    blackKingSquare,
  };
}
