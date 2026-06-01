import type { Color, ParsedBoard, Square } from "../geometry/boardTypes";
import { attackersTo, getAttackedSquares } from "../geometry/attackMap";
import { kingZoneSquares, shieldSquaresForKing } from "../geometry/kingZone";
import type { KingSafetyFeatures } from "./advancedFeatureTypes";

function findKing(board: ParsedBoard, color: Color): Square | undefined {
  return board.pieces.find((piece) => piece.type === "king" && piece.color === color)?.square;
}

function filePawnCounts(board: ParsedBoard, file: string, color?: Color): number {
  return board.pieces.filter((piece) => piece.type === "pawn" && piece.square[0] === file && (!color || piece.color === color)).length;
}

export function extractKingSafety(board: ParsedBoard): KingSafetyFeatures {
  const kingSquares = { white: findKing(board, "white"), black: findKing(board, "black") };
  const uncastledKings: Color[] = [];
  const castledKingside: Color[] = [];
  const castledQueenside: Color[] = [];
  const urgentKingSafety: Color[] = [];
  const pawnShieldGaps: KingSafetyFeatures["pawnShieldGaps"] = [];
  const openFilesNearKing: KingSafetyFeatures["openFilesNearKing"] = [];
  const attackerCounts = { white: 0, black: 0 };
  const defenderCounts = { white: 0, black: 0 };
  const escapeSquareCounts = { white: 0, black: 0 };
  const backRankVulnerable: Color[] = [];

  for (const color of ["white", "black"] as const) {
    const king = kingSquares[color];
    if (!king) continue;
    if (["e1", "d1", "e8", "d8"].includes(king)) uncastledKings.push(color);
    if (["g1", "g8"].includes(king)) castledKingside.push(color);
    if (["c1", "c8"].includes(king)) castledQueenside.push(color);
    const enemy = color === "white" ? "black" : "white";
    const zone = kingZoneSquares(king);
    attackerCounts[color] = zone.reduce((sum, sq) => sum + attackersTo(board, sq, enemy).length, 0);
    defenderCounts[color] = zone.reduce((sum, sq) => sum + attackersTo(board, sq, color).length, 0);
    const enemyAttacks = new Set(getAttackedSquares(board, enemy));
    escapeSquareCounts[color] = zone.filter((sq) => !board.pieceBySquare[sq] && !enemyAttacks.has(sq)).length;
    const files = [king[0], String.fromCharCode(king.charCodeAt(0) - 1), String.fromCharCode(king.charCodeAt(0) + 1)].filter((file) => file >= "a" && file <= "h");
    const exposed = files.filter((file) => filePawnCounts(board, file, color) === 0);
    if (exposed.length) openFilesNearKing.push({ color, files: exposed });
    const shield = shieldSquaresForKing(king, color, castledKingside.includes(color) ? "king" : castledQueenside.includes(color) ? "queen" : undefined);
    const gaps = shield.filter((sq) => !board.pieceBySquare[sq]);
    if (gaps.length) pawnShieldGaps.push({ color, squares: gaps });
    if (uncastledKings.includes(color) && (attackerCounts[color] >= 2 || exposed.length)) urgentKingSafety.push(color);
    if (escapeSquareCounts[color] === 0 && exposed.length) backRankVulnerable.push(color);
  }

  return {
    kingSquares,
    uncastledKings,
    castledKingside,
    castledQueenside,
    castlingRights: {
      white: { kingside: board.castlingRights.includes("K"), queenside: board.castlingRights.includes("Q") },
      black: { kingside: board.castlingRights.includes("k"), queenside: board.castlingRights.includes("q") },
    },
    urgentKingSafety,
    pawnShieldGaps,
    openFilesNearKing,
    attackerCounts,
    defenderCounts,
    escapeSquareCounts,
    backRankVulnerable,
  };
}
