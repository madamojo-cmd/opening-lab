import { Chess, validateFen } from "chess.js";
import type { Square } from "chess.js";

import {
  classifyLine,
  isBoardSquare,
  rayFrom,
  squareToCoords,
} from "./lineGeometry";
import { computeInfluenceMap } from "./influenceMap";
import {
  ChangedLine,
  ChangedSquare,
  Color,
  MoveDelta,
  PieceSymbol,
} from "./salienceTypes";

const SLIDING_DIRECTIONS = {
  b: [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ],
  r: [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ],
  q: [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ],
} as const;

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

function attackWeightForColor(
  square: ReturnType<typeof computeInfluenceMap>["squares"][string],
  color: Color,
): number {
  return color === "w" ? square.whiteAttackWeight : square.blackAttackWeight;
}

function defenseWeightForColor(
  square: ReturnType<typeof computeInfluenceMap>["squares"][string],
  color: Color,
): number {
  return color === "w" ? square.whiteDefenseWeight : square.blackDefenseWeight;
}

function weakForColor(
  square: ReturnType<typeof computeInfluenceMap>["squares"][string],
  color: Color,
): boolean {
  return color === "w" ? square.weakForWhite : square.weakForBlack;
}

function kingProximityForColor(
  square: ReturnType<typeof computeInfluenceMap>["squares"][string],
  color: Color,
): number {
  return color === "w" ? square.kingProximityWhite : square.kingProximityBlack;
}

function buildChangedLines(
  piece: PieceSymbol,
  color: Color,
  to: string,
  beforeMap: ReturnType<typeof computeInfluenceMap>,
  afterMap: ReturnType<typeof computeInfluenceMap>,
): ChangedLine[] {
  if (piece !== "b" && piece !== "r" && piece !== "q") {
    return [];
  }

  const directions = SLIDING_DIRECTIONS[piece];
  const lines: ChangedLine[] = [];

  for (const [df, dr] of directions) {
    const lineSquares: string[] = [];

    for (const square of rayFrom(to, df, dr)) {
      lineSquares.push(square);
      if (afterMap.squares[square].occupiedBy) {
        break;
      }
    }

    const salience = lineSquares.reduce((sum, square) => {
      const before = beforeMap.squares[square];
      const after = afterMap.squares[square];
      return (
        sum +
        Math.max(0, attackWeightForColor(after, color) - attackWeightForColor(before, color))
      );
    }, 0);

    if (lineSquares.length > 0 && salience > 0) {
      const end = lineSquares[lineSquares.length - 1];
      const lineKind = classifyLine(to, end);
      lines.push({
        from: to,
        to: end,
        lineSquares,
        role: lineKind === "file" ? "file" : lineKind === "rank" ? "rank" : "diagonal",
        salience,
      });
    }
  }

  return lines.sort((a, b) => b.salience - a.salience).slice(0, 4);
}

export function computeMoveDelta(
  fen: string,
  move: string,
  options: { topSquares?: number } = {},
): MoveDelta {
  assertValidFen(fen);
  const parsed = parseUciMove(move);
  const game = new Chess(fen);
  const movingPiece = game.get(parsed.from);

  if (!movingPiece) {
    throw new Error(`Illegal move: no piece on ${parsed.from}`);
  }

  let appliedMove: ReturnType<Chess["move"]>;
  try {
    appliedMove = game.move(parsed);
  } catch {
    throw new Error(`Illegal move: ${move}`);
  }

  if (!appliedMove) {
    throw new Error(`Illegal move: ${move}`);
  }

  const beforeMap = computeInfluenceMap(fen);
  const afterFen = game.fen();
  const afterMap = computeInfluenceMap(afterFen);
  const moverColor = movingPiece.color as Color;
  const opponentColor: Color = moverColor === "w" ? "b" : "w";
  const topSquares = options.topSquares ?? 8;

  const changedSquares = Object.keys(afterMap.squares)
    .map((square): ChangedSquare => {
      const before = beforeMap.squares[square];
      const after = afterMap.squares[square];
      const attackGain = Math.max(
        0,
        attackWeightForColor(after, moverColor) -
          attackWeightForColor(before, moverColor),
      );
      const defenseGain = Math.max(
        0,
        defenseWeightForColor(after, moverColor) -
          defenseWeightForColor(before, moverColor),
      );
      const moverBefore = attackWeightForColor(before, moverColor);
      const moverAfter = attackWeightForColor(after, moverColor);
      const opponentBefore = attackWeightForColor(before, opponentColor);
      const opponentAfter = attackWeightForColor(after, opponentColor);
      const netControlChange = Math.max(
        0,
        moverAfter - opponentAfter - (moverBefore - opponentBefore),
      );
      const occupiedTargetValue =
        after.occupiedBy?.color === opponentColor ? after.occupiedBy.value : 0;
      const vulnerabilityScore =
        occupiedTargetValue + (weakForColor(after, opponentColor) ? 1 : 0);
      const kingProximityScore = kingProximityForColor(after, opponentColor);
      const destinationScore = square === parsed.to ? 1 : 0;
      const totalSalience =
        attackGain * 2 +
        defenseGain * 0.75 +
        netControlChange +
        vulnerabilityScore * 1.5 +
        kingProximityScore * 0.5 +
        occupiedTargetValue +
        destinationScore;

      return {
        square,
        attackGain,
        defenseGain,
        netControlChange,
        vulnerabilityScore,
        kingProximityScore,
        occupiedTargetValue,
        totalSalience,
      };
    })
    .filter((square) => square.totalSalience > 0)
    .sort((a, b) => b.totalSalience - a.totalSalience || a.square.localeCompare(b.square));

  if (!changedSquares.some((square) => square.square === parsed.to)) {
    const destination = afterMap.squares[parsed.to];
    changedSquares.push({
      square: parsed.to,
      attackGain: 0,
      defenseGain: 0,
      netControlChange: 0,
      vulnerabilityScore: 0,
      kingProximityScore: kingProximityForColor(destination, opponentColor),
      occupiedTargetValue: 0,
      totalSalience: 1,
    });
    changedSquares.sort(
      (a, b) => b.totalSalience - a.totalSalience || a.square.localeCompare(b.square),
    );
  }

  const selectedChangedSquares = changedSquares.slice(0, topSquares);
  if (
    topSquares > 0 &&
    !selectedChangedSquares.some((square) => square.square === parsed.to)
  ) {
    const destination =
      changedSquares.find((square) => square.square === parsed.to) ??
      ({
        square: parsed.to,
        attackGain: 0,
        defenseGain: 0,
        netControlChange: 0,
        vulnerabilityScore: 0,
        kingProximityScore: kingProximityForColor(
          afterMap.squares[parsed.to],
          opponentColor,
        ),
        occupiedTargetValue: 0,
        totalSalience: 1,
      } satisfies ChangedSquare);

    selectedChangedSquares.splice(
      Math.max(0, selectedChangedSquares.length - 1),
      selectedChangedSquares.length === 0 ? 0 : 1,
      destination,
    );
  }

  return {
    move,
    from: parsed.from,
    to: parsed.to,
    promotion: parsed.promotion,
    piece: movingPiece.type as PieceSymbol,
    color: moverColor,
    san: appliedMove.san,
    beforeFen: fen,
    afterFen,
    moveArrow: { from: parsed.from, to: parsed.to, role: "move", intensity: 1 },
    changedSquares: selectedChangedSquares,
    changedLines: buildChangedLines(
      movingPiece.type as PieceSymbol,
      moverColor,
      parsed.to,
      beforeMap,
      afterMap,
    ),
  };
}
