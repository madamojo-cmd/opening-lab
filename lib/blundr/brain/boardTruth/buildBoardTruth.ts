/**
 * buildBoardTruth - Production Board Truth Engine (Step 3+)
 * Per Brain V2 Production Spec.
 * Delegates to existing high-quality geometry modules during transition.
 */

import type { BoardTruth } from "../types";
import { parseFenBoard } from "../../geometry/fenBoardParser";
import { getLegalMoves } from "../../geometry/legalMoveUtils";
import { getAttackedSquares } from "../../geometry/attackMap";
import type { ParsedBoard } from "../../geometry/boardTypes";

export function buildBoardTruth(fen: string): BoardTruth {
  try {
    const board: ParsedBoard = parseFenBoard(fen);
    const legalMoves = getLegalMoves(fen);
    const attackedByWhite = getAttackedSquares(board, 'white' as any);
    const attackedByBlack = getAttackedSquares(board, 'black' as any);

    return {
      fenBefore: fen,
      sideToMove: board.sideToMove,
      legalMoves: legalMoves.map((m: any) => ({
        uci: `${m.from}${m.to}${m.promotion || ''}`,
        from: m.from,
        to: m.to,
        san: m.san,
        piece: m.piece,
        color: m.color,
      })),
      targetLegal: "unknown",
      sourcePiece: null,
      destinationOccupancy: null,
      isCapture: false,
      isCheck: false,
      isCheckmate: false,
      isCastle: false,
      isPromotion: false,
      isEnPassant: false,
      kingSquares: { white: null, black: null },
      pinnedPieces: [],
      loosePieces: [],
      attackedSquaresWhite: attackedByWhite,
      attackedSquaresBlack: attackedByBlack,
      inCheck: false, // TODO: compute properly
      // TODO: Expand with pins, king zones, loose pieces, etc. using existing geometry
      _rawBoard: board,
    };
  } catch (e) {
    return {
      fenBefore: fen,
      sideToMove: fen.split(' ')[1] === 'w' ? 'white' : 'black',
      legalMoves: [],
      targetLegal: "unknown",
      sourcePiece: null,
      destinationOccupancy: null,
      isCapture: false,
      isCheck: false,
      isCheckmate: false,
      isCastle: false,
      isPromotion: false,
      isEnPassant: false,
      kingSquares: { white: null, black: null },
      pinnedPieces: [],
      loosePieces: [],
      error: "board_truth_parsing_failed",
    };
  }
}
