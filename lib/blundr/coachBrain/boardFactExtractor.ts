import { Chess } from "chess.js";

import { getAttackedSquares } from "./attackMap";
import type { BoardFactPacket } from "./coachEvidenceTypes";

const CENTER = ["d4", "e4", "d5", "e5"];

function fileIndex(file: string): number {
  return file.charCodeAt(0) - 97;
}

export function extractBoardFacts(fen: string): BoardFactPacket {
  try {
    const chess = new Chess(fen);
    const attackedWhite = new Set(getAttackedSquares(fen, "w"));
    const attackedBlack = new Set(getAttackedSquares(fen, "b"));

    const occupiedCenterSquares = CENTER.filter((sq) => Boolean(chess.get(sq as any)));
    const controlledCenterSquaresWhite = CENTER.filter((sq) => attackedWhite.has(sq));
    const controlledCenterSquaresBlack = CENTER.filter((sq) => attackedBlack.has(sq));
    const contestedCenterSquares = CENTER.filter((sq) => attackedWhite.has(sq) && attackedBlack.has(sq));

    let centerState: BoardFactPacket["centerState"] = "unclear";
    if (!occupiedCenterSquares.length && !contestedCenterSquares.length) centerState = "empty";
    else if (contestedCenterSquares.length >= 2) centerState = "contested";
    else if (occupiedCenterSquares.length >= 3) centerState = "locked";
    else if (occupiedCenterSquares.length >= 1) centerState = "claimed";
    else centerState = "open";

    let whiteKingSquare: string | undefined;
    let blackKingSquare: string | undefined;
    const openFiles: string[] = [];
    const semiOpenFilesWhite: string[] = [];
    const semiOpenFilesBlack: string[] = [];
    const leastActivePieces: string[] = [];

    for (let file = 0; file < 8; file += 1) {
      let whitePawns = 0;
      let blackPawns = 0;
      for (let rank = 1; rank <= 8; rank += 1) {
        const sq = `${String.fromCharCode(97 + file)}${rank}`;
        const piece = chess.get(sq as any);
        if (!piece) continue;

        if (piece.type === "k" && piece.color === "w") whiteKingSquare = sq;
        if (piece.type === "k" && piece.color === "b") blackKingSquare = sq;

        if (piece.type === "p") {
          if (piece.color === "w") whitePawns += 1;
          else blackPawns += 1;
        }

        if ((piece.type === "n" || piece.type === "b") && piece.color === "w" && ["b1", "g1", "c1", "f1"].includes(sq)) {
          leastActivePieces.push(`w${piece.type}@${sq}`);
        }
        if ((piece.type === "n" || piece.type === "b") && piece.color === "b" && ["b8", "g8", "c8", "f8"].includes(sq)) {
          leastActivePieces.push(`b${piece.type}@${sq}`);
        }
      }

      const fileChar = String.fromCharCode(97 + file);
      if (whitePawns === 0 && blackPawns === 0) openFiles.push(fileChar);
      if (whitePawns === 0 && blackPawns > 0) semiOpenFilesWhite.push(fileChar);
      if (blackPawns === 0 && whitePawns > 0) semiOpenFilesBlack.push(fileChar);
    }

    const castling = fen.split(/\s+/)[2] ?? "-";
    const whiteCanCastleKingside = castling.includes("K");
    const whiteCanCastleQueenside = castling.includes("Q");
    const blackCanCastleKingside = castling.includes("k");
    const blackCanCastleQueenside = castling.includes("q");

    const kingSafetyFacts: string[] = [];
    if (whiteKingSquare && ["e1", "d1"].includes(whiteKingSquare) && !whiteCanCastleKingside && !whiteCanCastleQueenside) kingSafetyFacts.push("white_king_central_without_castle_rights");
    if (blackKingSquare && ["e8", "d8"].includes(blackKingSquare) && !blackCanCastleKingside && !blackCanCastleQueenside) kingSafetyFacts.push("black_king_central_without_castle_rights");

    if (whiteKingSquare && (openFiles.includes(whiteKingSquare[0]) || semiOpenFilesWhite.includes(whiteKingSquare[0]))) {
      kingSafetyFacts.push("white_king_file_exposed");
    }
    if (blackKingSquare && (openFiles.includes(blackKingSquare[0]) || semiOpenFilesBlack.includes(blackKingSquare[0]))) {
      kingSafetyFacts.push("black_king_file_exposed");
    }

    const plausiblePawnBreaks: string[] = [];
    const d4 = chess.get("d4" as any);
    const d2 = chess.get("d2" as any);
    const c3 = chess.get("c3" as any);
    if (!d4 && d2?.type === "p" && d2.color === "w") plausiblePawnBreaks.push("d4");
    if (!d4 && c3?.type === "p" && c3.color === "w") plausiblePawnBreaks.push("d4_supported_by_c3");

    const d5 = chess.get("d5" as any);
    const d7 = chess.get("d7" as any);
    if (!d5 && d7?.type === "p" && d7.color === "b") plausiblePawnBreaks.push("...d5");

    const safePlanObjects = [
      ...(contestedCenterSquares.length ? ["center"] : []),
      ...(kingSafetyFacts.length ? ["king safety"] : []),
      ...(leastActivePieces.length ? ["least active piece"] : []),
      ...(openFiles.length ? ["open file"] : []),
      ...(plausiblePawnBreaks.length ? ["pawn break"] : []),
    ];

    return {
      occupiedCenterSquares,
      contestedCenterSquares,
      controlledCenterSquaresWhite,
      controlledCenterSquaresBlack,
      centerState,
      whiteKingSquare,
      blackKingSquare,
      whiteCanCastleKingside,
      whiteCanCastleQueenside,
      blackCanCastleKingside,
      blackCanCastleQueenside,
      kingSafetyFacts,
      openFiles,
      semiOpenFilesWhite,
      semiOpenFilesBlack,
      plausiblePawnBreaks,
      leastActivePieces,
      safePlanObjects,
    };
  } catch {
    return {
      occupiedCenterSquares: [],
      contestedCenterSquares: [],
      controlledCenterSquaresWhite: [],
      controlledCenterSquaresBlack: [],
      centerState: "unclear",
      whiteCanCastleKingside: false,
      whiteCanCastleQueenside: false,
      blackCanCastleKingside: false,
      blackCanCastleQueenside: false,
      kingSafetyFacts: [],
      openFiles: [],
      semiOpenFilesWhite: [],
      semiOpenFilesBlack: [],
      plausiblePawnBreaks: [],
      leastActivePieces: [],
      safePlanObjects: [],
    };
  }
}
