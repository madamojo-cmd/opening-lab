import { Chess } from "chess.js";

import {
  centerSquaresAffected,
  getAttackedSquares,
  getPieceAtSquare,
  getPieceAttacksFrom,
  getPieceDefendsFrom,
  getSliderRayInfo,
  normalizeFenForCoach,
} from "./attackMap";
import type { MoveFactPacket } from "./coachEvidenceTypes";
import { buildVerifiedMoveFacts } from "../runtime/currentInstructionFrame";

function moveToUci(move: { from: string; to: string; promotion?: string }): string {
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}

function findLegalMove(input: { fenBefore: string; moveUci?: string; moveSan?: string }): any | null {
  try {
    const game = new Chess(input.fenBefore);
    const legal = game.moves({ verbose: true }) as any[];
    const uci = input.moveUci?.trim().toLowerCase();
    if (uci) {
      const byUci = legal.find((move) => moveToUci(move) === uci);
      if (byUci) return byUci;
    }
    const san = input.moveSan?.trim();
    if (san) {
      const bySan = legal.find((move) => move.san === san);
      if (bySan) return bySan;
    }
    return null;
  } catch {
    return null;
  }
}

export function extractMoveFacts(input: {
  fenBefore: string;
  moveUci?: string;
  moveSan?: string;
}): MoveFactPacket | null {
  if (!input.moveUci && !input.moveSan) return null;
  try {
    const before = new Chess(input.fenBefore);
    const mover = before.turn() as "w" | "b";
    const attackedBefore = getAttackedSquares(input.fenBefore, mover);

    const matched = findLegalMove(input);
    if (!matched) return null;

    const verified = buildVerifiedMoveFacts({ fenBefore: input.fenBefore, uci: input.moveUci, san: input.moveSan });
    if (!verified) return null;

    const applied = before.move({ from: matched.from, to: matched.to, promotion: matched.promotion });
    if (!applied) return null;

    const fenAfterFull = before.fen();
    const fenAfter = normalizeFenForCoach(fenAfterFull);
    const attackedAfter = getAttackedSquares(fenAfterFull, mover);

    const movedPieceAttacksAfter = getPieceAttacksFrom(fenAfterFull, matched.to);
    const movedPieceDefendsAfter = getPieceDefendsFrom(fenAfterFull, matched.to);
    const rayInfo = getSliderRayInfo(fenAfterFull, matched.to);
    const defendedBefore = getPieceDefendsFrom(input.fenBefore, matched.from);

    const opponentColor = mover === "w" ? "b" : "w";
    const targetSquaresActuallyAttacked = movedPieceAttacksAfter.filter((sq) => {
      const piece = getPieceAtSquare(fenAfterFull, sq);
      return Boolean(piece && piece.color === opponentColor);
    });

    const centerAffectedSet = new Set<string>([
      ...centerSquaresAffected([matched.from, matched.to]),
      ...centerSquaresAffected(movedPieceAttacksAfter),
    ]);

    return {
      legal: true,
      san: verified.san,
      uci: verified.uci,
      movedPiece: {
        type: verified.pieceType,
        color: verified.color,
        from: verified.from,
        to: verified.to,
      },
      isCapture: verified.isCapture,
      capturedPieceType: applied.captured,
      isCastle: verified.isCastle,
      isPromotion: verified.isPromotion,
      isCheck: verified.isCheck,
      fenAfter,
      attackedSquaresBefore: attackedBefore,
      attackedSquaresAfter: attackedAfter,
      newlyAttackedSquares: attackedAfter.filter((sq) => !attackedBefore.includes(sq)),
      defendedSquaresBefore: defendedBefore,
      defendedSquaresAfter: movedPieceDefendsAfter,
      targetSquaresActuallyAttacked,
      centerSquaresAffected: Array.from(centerAffectedSet).sort(),
      movedPieceAttacksAfter,
      movedPieceDefendsAfter,
      xrayAlignedSquares: rayInfo.xray,
    };
  } catch {
    return null;
  }
}
