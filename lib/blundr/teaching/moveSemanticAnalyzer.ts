import { Chess } from "chess.js";
import { buildChessFeatureGraph, pieceName, type ChessFeatureGraph, type PieceFeatureNode } from "./chessFeatureGraph";
import { centerSquares, extendedCenterSquares, fileOf, isValidSquare } from "./squareUtils";
import type { BookSupportResult } from "./bookSupport";
import type { MoveSemanticAnalysis, MoveSemanticEffect, VisualIntent } from "./trainingContextTypes";

type AnalyzeMoveSemanticsInput = {
  fenBefore: string;
  fenAfter?: string;
  moveUci: string;
  moveSan?: string;
  featureGraphBefore?: ChessFeatureGraph;
  featureGraphAfter?: ChessFeatureGraph;
  topMoves?: Array<{ uci: string; san?: string; rank?: number; scoreCp?: number; mate?: number; pv?: string[] }>;
  moveQualityStatus?: string;
  bookSupport?: BookSupportResult | { hasBookSupport?: boolean; confidence?: number };
  repertoireSupport?: boolean;
};

function normUci(uci: string): string {
  return typeof uci === "string" ? uci.trim().toLowerCase().replace(/\s+/g, "") : "";
}

function applyMove(fen: string, uci: string): { fenAfter?: string; san?: string; captured?: string; piece?: string; promotion?: string } {
  try {
    const normalized = normUci(uci);
    if (normalized.length < 4) return {};
    const game = new Chess(fen);
    const move = game.move({
      from: normalized.slice(0, 2),
      to: normalized.slice(2, 4),
      promotion: normalized.length > 4 ? normalized.slice(4, 5) : "q",
    });
    if (!move) return {};
    return {
      fenAfter: game.fen(),
      san: move.san,
      captured: move.captured,
      piece: move.piece,
      promotion: move.promotion,
    };
  } catch {
    return {};
  }
}

function findPiece(graph: ChessFeatureGraph, square: string): PieceFeatureNode | undefined {
  return graph.pieces.find((piece) => piece.square === square);
}

function pieceLabel(piece?: PieceFeatureNode | { type?: string }): string {
  return pieceName(piece?.type);
}

function diff(next: string[], prev: string[]): string[] {
  const prevSet = new Set(prev);
  return next.filter((value) => !prevSet.has(value));
}

function intersectionCount(a: string[], b: string[]): number {
  const set = new Set(b);
  return a.filter((item) => set.has(item)).length;
}

function squarePieceLabel(graph: ChessFeatureGraph, square: string): string {
  const node = graph.pieces.find((piece) => piece.square === square);
  return node ? `${node.color === "w" ? "White" : "Black"} ${pieceName(node.type)}` : "piece";
}

function visualIntent(input: {
  category: VisualIntent["category"];
  primarySquare?: string;
  secondarySquare?: string;
  primaryPiece?: string;
  reason: string;
  allowAnswerArrow?: boolean;
}): VisualIntent {
  const squares = [input.primarySquare, input.secondarySquare]
    .filter((square): square is string => Boolean(square && isValidSquare(square)))
    .slice(0, 2)
    .map((square, index) => ({
      square,
      kind: (input.category === "king_safety" ? "danger" : index === 0 ? "target" : "support") as "target" | "support" | "danger",
    }));
  return {
    category: input.category,
    primarySquare: input.primarySquare,
    secondarySquare: input.secondarySquare,
    primaryPiece: input.primaryPiece,
    squares,
    allowAnswerArrow: Boolean(input.allowAnswerArrow),
    reason: input.reason,
  };
}

function effect(input: Omit<MoveSemanticEffect, "claimSafety" | "revealRisk"> & {
  claimSafety?: MoveSemanticEffect["claimSafety"];
  revealRisk?: MoveSemanticEffect["revealRisk"];
}): MoveSemanticEffect {
  return {
    ...input,
    claimSafety: input.claimSafety ?? "safe",
    revealRisk: input.revealRisk ?? (input.requiresMoveRecommendation ? "high" : "low"),
  };
}

export function analyzeMoveSemantics(input: AnalyzeMoveSemanticsInput): MoveSemanticAnalysis {
  const moveUci = normUci(input.moveUci);
  const fromSquare = moveUci.slice(0, 2);
  const toSquare = moveUci.slice(2, 4);
  const before = input.featureGraphBefore ?? buildChessFeatureGraph(input.fenBefore);
  const applied = input.fenAfter ? {} : applyMove(input.fenBefore, moveUci);
  const fenAfter = input.fenAfter ?? applied.fenAfter;
  const after = input.featureGraphAfter ?? (fenAfter ? buildChessFeatureGraph(fenAfter) : undefined);
  const movingPieceBefore = findPiece(before, fromSquare);
  const movingPieceAfter = after ? findPiece(after, toSquare) : undefined;
  const movingPiece = movingPieceBefore ?? movingPieceAfter;
  const moveSan = input.moveSan ?? applied.san;
  const capturedPieceBefore = findPiece(before, toSquare);
  const isCapture = Boolean(capturedPieceBefore || applied.captured);

  const beforeAttacks = movingPieceBefore?.attackedSquares ?? [];
  const afterAttacks = movingPieceAfter?.attackedSquares ?? [];
  const beforeDefenses = movingPieceBefore?.defendedSquares ?? [];
  const afterDefenses = movingPieceAfter?.defendedSquares ?? [];
  const newAttacks = diff(afterAttacks, beforeAttacks);
  const newDefenses = diff(afterDefenses, beforeDefenses);
  const lostAttacks = diff(beforeAttacks, afterAttacks);
  const lostDefenses = diff(beforeDefenses, afterDefenses);
  const center = centerSquares();
  const extended = extendedCenterSquares();
  const beforeCenter = intersectionCount(beforeAttacks, [...center, ...extended]);
  const afterCenter = intersectionCount(afterAttacks, [...center, ...extended]);
  const enemyKingZone = movingPiece ? before.kingZones[movingPiece.color === "w" ? "b" : "w"].zoneSquares : [];
  const beforeKingPressure = intersectionCount(beforeAttacks, enemyKingZone);
  const afterKingPressure = intersectionCount(afterAttacks, enemyKingZone);
  const mobilityChange = (movingPieceAfter?.mobilityCount ?? afterAttacks.length) - (movingPieceBefore?.mobilityCount ?? beforeAttacks.length);
  const developmentChange = movingPiece && movingPieceBefore && !movingPieceBefore.isDeveloped && movingPieceAfter?.isDeveloped ? 1 : 0;

  const newlyAttackedTargets = newAttacks
    .map((square) => after?.pieces.find((piece) => piece.square === square))
    .filter((piece): piece is PieceFeatureNode => Boolean(piece && movingPiece && piece.color !== movingPiece.color))
    .map((piece) => ({
      square: piece.square,
      piece: pieceLabel(piece),
      loose: piece.isLoose,
      hanging: piece.isHanging,
    }));

  const newlyDefendedWeaknesses = newDefenses.filter((square) => {
    const piece = after?.pieces.find((candidate) => candidate.square === square);
    return Boolean(piece && movingPiece && piece.color === movingPiece.color && (piece.isLoose || piece.isHanging));
  });

  const effects: MoveSemanticEffect[] = [];
  const piece = movingPieceBefore ?? movingPieceAfter;
  const pieceText = pieceLabel(piece);
  const target = newlyAttackedTargets.find((candidate) => candidate.loose || candidate.hanging) ?? newlyAttackedTargets[0];
  const attacksKingZone = afterKingPressure > beforeKingPressure;
  const attacksCenter = afterCenter > beforeCenter;
  const isCastlingMove =
    piece?.type === "k" &&
    ((fromSquare === "e1" && (toSquare === "g1" || toSquare === "c1")) || (fromSquare === "e8" && (toSquare === "g8" || toSquare === "c8")));

  if (piece && isCastlingMove) {
    const rookFrom =
      toSquare === "g1" ? "h1" :
      toSquare === "c1" ? "a1" :
      toSquare === "g8" ? "h8" :
      "a8";
    const rookTo =
      toSquare === "g1" ? "f1" :
      toSquare === "c1" ? "d1" :
      toSquare === "g8" ? "f8" :
      "d8";
    effects.push(effect({
      type: "adds_king_safety",
      conceptId: "castle_for_safety",
      confidence: 0.93,
      relevantSquares: [fromSquare, toSquare, rookFrom, rookTo],
      relevantPieces: ["king", "rook"],
      targetSquare: toSquare,
      before: `The king is still on ${fromSquare}.`,
      after: `Castling places the king on ${toSquare} and connects the rook via ${rookTo}.`,
      whyItMatters: "The king moves to safety before the center opens.",
      requiresMoveRecommendation: true,
      allowedInContextOnly: false,
      visualIntent: {
        category: "castle_move",
        primarySquare: fromSquare,
        secondarySquare: toSquare,
        primaryPiece: "king",
        squares: [
          { square: toSquare, kind: "target" },
          { square: rookFrom, kind: "support" },
          { square: rookTo, kind: "support" },
        ],
        allowAnswerArrow: true,
        reason: "Castling improves king safety and rook coordination.",
      },
      evidenceReason: `Castling from ${fromSquare} to ${toSquare} improves king safety.`,
    }));
  }

  if (piece && isCapture && capturedPieceBefore && (capturedPieceBefore.isLoose || capturedPieceBefore.isHanging)) {
    effects.push(effect({
      type: "wins_loose_piece",
      conceptId: "wins_loose_piece",
      confidence: 0.9,
      relevantSquares: [fromSquare, toSquare],
      relevantPieces: [pieceText, pieceLabel(capturedPieceBefore)],
      targetSquare: toSquare,
      targetPiece: pieceLabel(capturedPieceBefore),
      before: `${squarePieceLabel(before, toSquare)} was loose on ${toSquare}.`,
      after: `${moveSan ?? moveUci} removes that target.`,
      whyItMatters: "A loose target can be taken before it is defended.",
      requiresMoveRecommendation: true,
      allowedInContextOnly: false,
      visualIntent: visualIntent({ category: "loose_piece", primarySquare: toSquare, secondarySquare: fromSquare, primaryPiece: pieceText, allowAnswerArrow: true, reason: "The move captures a loose target." }),
      evidenceReason: "The move captures a loose or hanging piece.",
    }));
  }

  if (piece && target && !isCapture) {
    effects.push(effect({
      type: target.loose || target.hanging ? "attacks_loose_piece" : "attacks_target",
      conceptId: target.loose || target.hanging ? "attacks_loose_piece" : "pressure_target",
      confidence: target.loose || target.hanging ? 0.84 : 0.72,
      relevantSquares: [fromSquare, toSquare, target.square],
      relevantPieces: [pieceText, target.piece],
      targetSquare: target.square,
      targetPiece: target.piece,
      before: `${pieceText} did not pressure ${target.square}.`,
      after: `${pieceText} on ${toSquare} pressures ${target.square}.`,
      whyItMatters: `The ${pieceText} creates pressure on the ${target.piece}.`,
      requiresMoveRecommendation: true,
      allowedInContextOnly: target.loose || target.hanging,
      visualIntent: visualIntent({ category: "loose_piece", primarySquare: target.square, secondarySquare: toSquare, primaryPiece: pieceText, allowAnswerArrow: false, reason: "A target is newly under pressure." }),
      evidenceReason: `New attack from ${toSquare} to ${target.square}.`,
    }));
  }

  if (piece && developmentChange > 0 && (target || attacksKingZone)) {
    const targetSquare = target?.square ?? enemyKingZone.find((square) => afterAttacks.includes(square)) ?? toSquare;
    effects.push(effect({
      type: "develops_with_pressure",
      conceptId: "develops_with_pressure",
      confidence: 0.86,
      relevantSquares: [fromSquare, toSquare, targetSquare],
      relevantPieces: [pieceText, target?.piece ?? "target"],
      targetSquare,
      targetPiece: target?.piece,
      before: `${pieceText} started undeveloped on ${fromSquare}.`,
      after: `${pieceText} joins the game on ${toSquare} and pressures ${targetSquare}.`,
      whyItMatters: "Development is strongest when it also creates pressure.",
      requiresMoveRecommendation: true,
      allowedInContextOnly: false,
      visualIntent: visualIntent({ category: "piece_activity", primarySquare: toSquare, secondarySquare: targetSquare, primaryPiece: pieceText, allowAnswerArrow: true, reason: "Development creates a concrete pressure target." }),
      evidenceReason: `Back-rank ${pieceText} developed and gained a pressure target.`,
    }));
  }

  if (piece && developmentChange > 0 && attacksCenter) {
    effects.push(effect({
      type: "develops_piece",
      conceptId: "develop_and_control",
      confidence: target ? 0.74 : 0.82,
      relevantSquares: [fromSquare, toSquare, ...afterAttacks.filter((square) => center.includes(square)).slice(0, 2)],
      relevantPieces: [pieceText],
      targetSquare: afterAttacks.find((square) => center.includes(square)),
      before: `${pieceText} was not active from ${fromSquare}.`,
      after: `${pieceText} develops and increases central control.`,
      whyItMatters: "Early development should fight for useful central squares.",
      requiresMoveRecommendation: true,
      allowedInContextOnly: false,
      visualIntent: visualIntent({ category: "piece_activity", primarySquare: toSquare, secondarySquare: afterAttacks.find((square) => center.includes(square)), primaryPiece: pieceText, allowAnswerArrow: true, reason: "The developed piece now fights for the center." }),
      evidenceReason: `Central influence changed from ${beforeCenter} to ${afterCenter}.`,
    }));
  }

  if (piece && developmentChange > 0 && !target && !attacksCenter && !attacksKingZone) {
    effects.push(effect({
      type: "passive_development",
      conceptId: "passive_development",
      confidence: 0.52,
      relevantSquares: [fromSquare, toSquare],
      relevantPieces: [pieceText],
      before: `${pieceText} was undeveloped.`,
      after: `${pieceText} moved to ${toSquare}.`,
      whyItMatters: "Development needs a purpose square, not just movement.",
      claimSafety: "cautious",
      requiresMoveRecommendation: true,
      allowedInContextOnly: true,
      visualIntent: visualIntent({ category: "piece_activity", primarySquare: toSquare, secondarySquare: fromSquare, primaryPiece: pieceText, allowAnswerArrow: false, reason: "The piece developed without a strong target." }),
      evidenceReason: "The piece developed, but no stronger target or central gain was detected.",
    }));
  }

  if (piece && !developmentChange && mobilityChange > 2) {
    effects.push(effect({
      type: "improves_piece_activity",
      conceptId: "improves_piece_activity",
      confidence: 0.7,
      relevantSquares: [fromSquare, toSquare],
      relevantPieces: [pieceText],
      before: `${pieceText} had limited scope from ${fromSquare}.`,
      after: `${pieceText} gains mobility from ${toSquare}.`,
      whyItMatters: "An active piece creates choices and pressure.",
      requiresMoveRecommendation: true,
      allowedInContextOnly: true,
      visualIntent: visualIntent({ category: "piece_activity", primarySquare: toSquare, secondarySquare: fromSquare, primaryPiece: pieceText, allowAnswerArrow: false, reason: "The move improves piece activity." }),
      evidenceReason: `Mobility changed by ${mobilityChange}.`,
    }));
  }

  if (piece && piece.type === "p" && (center.includes(toSquare) || center.some((square) => afterAttacks.includes(square)))) {
    effects.push(effect({
      type: center.includes(toSquare) ? "controls_center" : "resolves_center_tension",
      conceptId: "center_tension",
      confidence: 0.74,
      relevantSquares: [fromSquare, toSquare, ...center.filter((square) => afterAttacks.includes(square)).slice(0, 2)],
      relevantPieces: [pieceText],
      targetSquare: toSquare,
      before: `The central structure was still being contested.`,
      after: `${moveSan ?? moveUci} changes the central fight.`,
      whyItMatters: "Central pawn moves decide which pieces become active.",
      requiresMoveRecommendation: true,
      allowedInContextOnly: true,
      visualIntent: visualIntent({ category: "center", primarySquare: toSquare, secondarySquare: center.find((square) => afterAttacks.includes(square)), primaryPiece: pieceText, allowAnswerArrow: true, reason: "The move changes central control." }),
      evidenceReason: "Pawn move touches or attacks central squares.",
    }));
  }

  const file = fileOf(toSquare);
  if (piece && (piece.type === "r" || piece.type === "q") && file && after?.files.find((candidate) => candidate.file === file)?.rookOrQueenPotential) {
    effects.push(effect({
      type: "opens_file",
      conceptId: piece.type === "r" ? "rook_activity" : "open_file_context",
      confidence: 0.7,
      relevantSquares: [toSquare],
      relevantPieces: [pieceText],
      targetSquare: toSquare,
      before: `${pieceText} was not using the ${file}-file.`,
      after: `${pieceText} works on the ${file}-file.`,
      whyItMatters: "Heavy pieces need files to create pressure.",
      requiresMoveRecommendation: true,
      allowedInContextOnly: true,
      visualIntent: visualIntent({ category: "open_file", primarySquare: toSquare, primaryPiece: pieceText, allowAnswerArrow: false, reason: "The heavy piece uses an open or half-open file." }),
      evidenceReason: `${file}-file is open or half-open.`,
    }));
  }

  const fileOrDiagonalChange = [];
  if (piece && fileOf(fromSquare) !== fileOf(toSquare)) fileOrDiagonalChange.push(`${fileOf(fromSquare)}-file to ${fileOf(toSquare)}-file`);
  if (piece && piece.type === "b" && fromSquare[0] !== toSquare[0]) fileOrDiagonalChange.push(`bishop diagonal from ${fromSquare} to ${toSquare}`);

  return {
    moveUci,
    moveSan,
    movingPiece: pieceText,
    fromSquare,
    toSquare,
    isCapture,
    capturedPiece: capturedPieceBefore ? pieceLabel(capturedPieceBefore) : applied.captured ? pieceName(applied.captured) : undefined,
    promotion: applied.promotion,
    pieceRoleBefore: movingPieceBefore?.roleSummary,
    pieceRoleAfter: movingPieceAfter?.roleSummary,
    newAttacks,
    newDefenses,
    lostAttacks,
    lostDefenses,
    newlyAttackedTargets,
    newlyDefendedWeaknesses,
    centerControlChange: afterCenter - beforeCenter,
    kingZonePressureChange: afterKingPressure - beforeKingPressure,
    developmentChange,
    mobilityChange,
    fileOrDiagonalChange,
    pawnStructureChange: [],
    tacticalPressureChange: newlyAttackedTargets.length + Math.max(0, afterKingPressure - beforeKingPressure),
    tradeoffs: lostAttacks.slice(0, 3).map((square) => `Gives up pressure on ${square}.`),
    effects,
    summary: [
      piece ? `${pieceText} moved from ${fromSquare} to ${toSquare}.` : `Move ${moveUci} was analyzed from board geometry.`,
      ...effects.slice(0, 3).map((item) => item.evidenceReason),
    ],
  };
}
