import type { BoardAnalysis, MoveDelta, TeachingCueInput } from "./teachingCueTypes";
import { centerSquares, fileOf, isBackRankPieceStart } from "./squareUtils";

function setDiff(next: string[], prev: string[]): string[] {
  const prevSet = new Set(prev);
  return next.filter((value) => !prevSet.has(value));
}

export function analyzeMoveDelta(input: {
  before: BoardAnalysis;
  after: BoardAnalysis;
  move: TeachingCueInput["move"];
  side: "w" | "b";
}): MoveDelta {
  const { before, after, move, side } = input;
  const enemy = side === "w" ? "b" : "w";
  const movedAfter = after.pieces.find((p) => p.square === move.to && p.color === side);
  const movedBefore = before.pieces.find((p) => p.square === move.from && p.color === side);

  const beforeTargets = Object.entries(before.attacksBySquare)
    .filter(([, attackers]) => attackers.includes(move.from))
    .map(([sq]) => sq);
  const afterTargets = Object.entries(after.attacksBySquare)
    .filter(([, attackers]) => attackers.includes(move.to))
    .map(([sq]) => sq);

  const newlyAttackedSquares = setDiff(afterTargets, beforeTargets);
  const newlyDefendedSquares = newlyAttackedSquares.filter((sq) => {
    const ownPiece = after.pieces.find((p) => p.square === sq && p.color === side);
    return Boolean(ownPiece);
  });

  const newlyAttackedPieces = newlyAttackedSquares.filter((sq) =>
    after.pieces.some((p) => p.square === sq && p.color === enemy),
  );
  const newlyDefendedPieces = newlyDefendedSquares.filter((sq) =>
    after.pieces.some((p) => p.square === sq && p.color === side),
  );

  const centerControlDelta = after.centerControl[side] - before.centerControl[side];
  const kingZonePressureDelta = after.kingZoneControl[side] - before.kingZoneControl[side];
  const mobilityDelta = (after.pieceMobility[move.to] ?? 0) - (before.pieceMobility[move.from] ?? 0);
  const kingSafetyDelta = after.kingSafety[side] - before.kingSafety[side];

  const movedPieceType = movedAfter?.type ?? movedBefore?.type ?? move.piece;
  const developmentDelta = movedPieceType && (movedPieceType === "n" || movedPieceType === "b")
    ? (isBackRankPieceStart(move.from, movedPieceType, side) ? 1 : 0)
    : 0;

  const fileChange = fileOf(move.from) !== fileOf(move.to) ? [fileOf(move.from), fileOf(move.to)] : [fileOf(move.to)];

  const pawnStructureDelta: string[] = [];
  if (before.pawnStructure.doubledPawns[side] !== after.pawnStructure.doubledPawns[side]) pawnStructureDelta.push("doubled_pawn_change");
  if (before.pawnStructure.isolatedPawns[side] !== after.pawnStructure.isolatedPawns[side]) pawnStructureDelta.push("isolated_pawn_change");
  if (before.pawnStructure.passedPawns[side].length !== after.pawnStructure.passedPawns[side].length) pawnStructureDelta.push("passed_pawn_change");

  const tacticalCandidates: string[] = [];
  if (newlyAttackedPieces.length > 0) tacticalCandidates.push("new_attack");
  if (move.captured) tacticalCandidates.push("capture");
  if (newlyAttackedPieces.some((sq) => after.hangingPieces.includes(sq))) tacticalCandidates.push("hanging_piece");

  return {
    movedPiece: movedPieceType,
    from: move.from,
    to: move.to,
    isCapture: Boolean(move.captured || move.san.includes("x")),
    isCheck: move.san.includes("+"),
    isCheckmate: move.san.includes("#"),
    isCastle: move.san.includes("O-O"),
    isPromotion: Boolean(move.promotion || move.san.includes("=")),
    isPawnMove: movedPieceType === "p" || /^[a-h]/.test(move.san),
    newlyAttackedSquares,
    newlyDefendedSquares,
    newlyAttackedPieces,
    newlyDefendedPieces,
    centerControlDelta,
    kingZonePressureDelta,
    mobilityDelta,
    developmentDelta,
    kingSafetyDelta,
    fileChange,
    pawnStructureDelta,
    tacticalCandidates,
  };
}
