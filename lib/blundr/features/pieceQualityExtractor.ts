import type { ParsedBoard } from "../geometry/boardTypes";
import { attackersTo, getPieceAttacks } from "../geometry/attackMap";
import { squareColor } from "../geometry/colorComplex";
import { mobilitySquares, pseudoLegalMobilityCount } from "../geometry/mobilityMap";
import type { PieceQualityFeatures } from "./advancedFeatureTypes";

export function extractPieceQuality(board: ParsedBoard): PieceQualityFeatures {
  const undevelopedPieces = board.pieces
    .filter((piece) => ["knight", "bishop"].includes(piece.type))
    .filter((piece) => ["b1", "g1", "c1", "f1", "b8", "g8", "c8", "f8"].includes(piece.square))
    .map((piece) => ({ color: piece.color, piece: piece.type, square: piece.square }));

  const badBishops = board.pieces
    .filter((piece) => piece.type === "bishop")
    .filter((piece) => pseudoLegalMobilityCount(board, piece.square) <= 4)
    .map((piece) => ({ color: piece.color, square: piece.square, confidence: "medium" as const }));

  const activeBishops = board.pieces
    .filter((piece) => piece.type === "bishop")
    .map((piece) => ({ piece, attacks: getPieceAttacks(board, piece.square, { directOnly: true }) }))
    .filter(({ attacks }) => attacks.length >= 6 || attacks.some((sq) => ["f7", "f2", "d5", "e5", "d4", "e4"].includes(sq)))
    .map(({ piece, attacks }) => ({ color: piece.color, square: piece.square, targets: attacks.filter((sq) => board.pieceBySquare[sq]?.color !== piece.color) }));

  const knightOutposts = board.pieces
    .filter((piece) => piece.type === "knight")
    .filter((piece) => ["c4", "d4", "e4", "f4", "c5", "d5", "e5", "f5"].includes(piece.square))
    .map((piece) => ({ color: piece.color, square: piece.square, protectedByPawn: attackersTo(board, piece.square, piece.color).some((p) => p.type === "pawn") }));

  const rooksOnOpenFiles: PieceQualityFeatures["rooksOnOpenFiles"] = [];
  const rooksOnSemiOpenFiles: PieceQualityFeatures["rooksOnSemiOpenFiles"] = [];
  for (const rook of board.pieces.filter((piece) => piece.type === "rook")) {
    const file = rook.square[0];
    const pawnsOnFile = board.pieces.filter((piece) => piece.type === "pawn" && piece.square[0] === file);
    if (!pawnsOnFile.length) rooksOnOpenFiles.push({ color: rook.color, square: rook.square, file });
    else if (!pawnsOnFile.some((piece) => piece.color === rook.color)) rooksOnSemiOpenFiles.push({ color: rook.color, square: rook.square, file });
  }

  const connectedRooks: PieceQualityFeatures["connectedRooks"] = [];
  for (const color of ["white", "black"] as const) {
    const rooks = board.pieces.filter((piece) => piece.type === "rook" && piece.color === color);
    if (rooks.length >= 2 && rooks.some((a) => rooks.some((b) => a !== b && a.square[1] === b.square[1]))) connectedRooks.push(color);
  }

  const loosePieces = board.pieces
    .filter((piece) => piece.type !== "king" && attackersTo(board, piece.square, piece.color).length === 0)
    .map((piece) => ({ color: piece.color, square: piece.square, piece: piece.type }));

  const worstPieces = board.pieces
    .filter((piece) => ["bishop", "knight", "rook"].includes(piece.type))
    .map((piece) => ({ piece, mobility: mobilitySquares(board, piece.square).length }))
    .filter(({ mobility }) => mobility <= 2)
    .map(({ piece }) => ({ color: piece.color, square: piece.square, piece: piece.type, reason: `${piece.type}_low_mobility_${squareColor(piece.square)}` }));

  return {
    undevelopedPieces,
    badBishops,
    activeBishops,
    knightOutposts,
    rooksOnOpenFiles,
    rooksOnSemiOpenFiles,
    connectedRooks,
    loosePieces,
    worstPieces,
  };
}
