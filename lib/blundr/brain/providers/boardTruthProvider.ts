import { Chess } from "chess.js";
import type { CurrentInstructionFrame } from "../../runtime/currentInstructionFrame";
import type { BoardTruth } from "../types";

function moveToUci(move: any): string {
  return `${move.from}${move.to}${move.promotion ?? ""}`.toLowerCase();
}

function findKingSquares(game: Chess): { white: string | null; black: string | null } {
  const board = game.board();
  let white: string | null = null;
  let black: string | null = null;

  for (let rank = 0; rank < board.length; rank += 1) {
    for (let file = 0; file < board[rank].length; file += 1) {
      const piece = board[rank][file];
      if (!piece || piece.type !== "k") continue;
      const sq = `${String.fromCharCode(97 + file)}${8 - rank}`;
      if (piece.color === "w") white = sq;
      if (piece.color === "b") black = sq;
    }
  }
  return { white, black };
}

export function buildBoardTruth(input: { frame: CurrentInstructionFrame }): BoardTruth {
  const { frame } = input;

  if (!frame.target) {
    return {
      fenBefore: frame.fenBefore,
      sideToMove: frame.sideToMove,
      legalMoves: [],
      targetLegal: "not_applicable",
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
      debug: { reason: "frame_target_null" },
    };
  }

  const targetUci = String(frame.target.uci || "").toLowerCase();
  if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(targetUci)) {
    return {
      fenBefore: frame.fenBefore,
      sideToMove: frame.sideToMove,
      legalMoves: [],
      targetLegal: false,
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
      debug: { reason: "invalid_target_uci", targetUci },
    };
  }

  try {
    const game = new Chess(frame.fenBefore);
    const legalVerbose = game.moves({ verbose: true }) as any[];
    const legalMoves = legalVerbose.map((move) => ({
      uci: moveToUci(move),
      san: move.san,
      from: move.from,
      to: move.to,
      piece: move.piece,
      color: move.color,
      flags: move.flags,
    }));

    const sourcePieceBefore = game.get(frame.target.from as any);
    const destinationPieceBefore = game.get(frame.target.to as any);
    const targetMove = legalVerbose.find((move) => moveToUci(move) === targetUci);

    let afterFen: string | null = null;
    let isCheck = false;
    let isCheckmate = false;

    if (targetMove) {
      game.move({ from: targetMove.from, to: targetMove.to, promotion: targetMove.promotion });
      afterFen = game.fen();
      isCheck = Boolean((game as any).isCheck?.() ?? (game as any).in_check?.() ?? false);
      isCheckmate = Boolean((game as any).isCheckmate?.() ?? (game as any).in_checkmate?.() ?? false);
    }

    return {
      fenBefore: frame.fenBefore,
      sideToMove: frame.sideToMove,
      legalMoves,
      targetLegal: Boolean(targetMove),
      sourcePiece: sourcePieceBefore
        ? {
            square: frame.target.from,
            type: sourcePieceBefore.type,
            color: sourcePieceBefore.color,
          }
        : null,
      destinationOccupancy: destinationPieceBefore
        ? {
            square: frame.target.to,
            occupied: true,
            type: destinationPieceBefore.type,
            color: destinationPieceBefore.color,
          }
        : {
            square: frame.target.to,
            occupied: false,
          },
      isCapture: Boolean(targetMove?.captured || frame.target.flags.isCapture),
      isCheck: Boolean(targetMove ? targetMove.san?.includes("+") || targetMove.san?.includes("#") || isCheck : frame.target.flags.isCheck),
      isCheckmate: Boolean(targetMove ? targetMove.san?.includes("#") || isCheckmate : frame.target.flags.isCheckmate),
      isCastle: Boolean(targetMove ? targetMove.flags?.includes("k") || targetMove.flags?.includes("q") : frame.target.flags.isCastle),
      isPromotion: Boolean(targetMove ? targetMove.flags?.includes("p") || targetMove.promotion : frame.target.flags.isPromotion),
      isEnPassant: Boolean(targetMove ? targetMove.flags?.includes("e") : frame.target.flags.isEnPassant),
      kingSquares: findKingSquares(targetMove ? game : new Chess(frame.fenBefore)),
      attackedSquaresBefore: undefined,
      attackedSquaresAfter: undefined,
      pinnedPieces: [],
      loosePieces: [],
      targetSan: targetMove?.san ?? frame.target.san ?? null,
      fenAfterTarget: afterFen,
      debug: {
        legalMoveCount: legalMoves.length,
        legalTargetMatch: Boolean(targetMove),
      },
    };
  } catch {
    return {
      fenBefore: frame.fenBefore,
      sideToMove: frame.sideToMove,
      legalMoves: [],
      targetLegal: "unknown",
      sourcePiece: null,
      destinationOccupancy: null,
      isCapture: frame.target.flags.isCapture,
      isCheck: frame.target.flags.isCheck,
      isCheckmate: frame.target.flags.isCheckmate,
      isCastle: frame.target.flags.isCastle,
      isPromotion: frame.target.flags.isPromotion,
      isEnPassant: frame.target.flags.isEnPassant,
      kingSquares: { white: null, black: null },
      pinnedPieces: [],
      loosePieces: [],
      debug: { reason: "fen_parse_failed" },
    };
  }
}
