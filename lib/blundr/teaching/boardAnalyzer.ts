import { Chess } from "chess.js";
import type { BoardAnalysis, BoardPiece } from "./teachingCueTypes";
import { centerSquares, extendedCenterSquares, fileOf, isValidSquare, kingZoneSquares, offsetSquare } from "./squareUtils";

const PIECE_VALUE: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

function colorOpp(color: "w" | "b"): "w" | "b" {
  return color === "w" ? "b" : "w";
}

function attackTargets(piece: BoardPiece, occupancy: Map<string, BoardPiece>): string[] {
  const out: string[] = [];
  const push = (sq: string | null) => {
    if (sq && isValidSquare(sq)) out.push(sq);
  };
  if (piece.type === "p") {
    const dr = piece.color === "w" ? 1 : -1;
    push(offsetSquare(piece.square, -1, dr));
    push(offsetSquare(piece.square, 1, dr));
    return out;
  }
  if (piece.type === "n") {
    const jumps = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
    for (const [df, dr] of jumps) push(offsetSquare(piece.square, df, dr));
    return out;
  }
  if (piece.type === "k") {
    for (let df = -1; df <= 1; df += 1) {
      for (let dr = -1; dr <= 1; dr += 1) {
        if (df === 0 && dr === 0) continue;
        push(offsetSquare(piece.square, df, dr));
      }
    }
    return out;
  }

  const rays: Array<[number, number]> = [];
  if (piece.type === "b" || piece.type === "q") {
    rays.push([1, 1], [1, -1], [-1, 1], [-1, -1]);
  }
  if (piece.type === "r" || piece.type === "q") {
    rays.push([1, 0], [-1, 0], [0, 1], [0, -1]);
  }
  for (const [df, dr] of rays) {
    let step = 1;
    while (step < 8) {
      const sq = offsetSquare(piece.square, df * step, dr * step);
      if (!sq) break;
      out.push(sq);
      if (occupancy.has(sq)) break;
      step += 1;
    }
  }
  return out;
}

function parsePieces(game: Chess): BoardPiece[] {
  const out: BoardPiece[] = [];
  const board = game.board();
  for (let row = 0; row < board.length; row += 1) {
    const rank = 8 - row;
    for (let col = 0; col < board[row].length; col += 1) {
      const p = board[row][col];
      if (!p) continue;
      out.push({
        square: `${FILES[col]}${rank}`,
        color: p.color as "w" | "b",
        type: p.type as BoardPiece["type"],
      });
    }
  }
  return out;
}

export function analyzeBoard(fen: string): BoardAnalysis {
  const game = new Chess(fen);
  const pieces = parsePieces(game);
  const occupancy = new Map<string, BoardPiece>(pieces.map((p) => [p.square, p]));
  const kingSquares: Record<"w" | "b", string | undefined> = {
    w: pieces.find((p) => p.type === "k" && p.color === "w")?.square,
    b: pieces.find((p) => p.type === "k" && p.color === "b")?.square,
  };

  const attacksByColor: Record<"w" | "b", Record<string, string[]>> = { w: {}, b: {} };
  const pieceMobility: Record<string, number> = {};

  for (const piece of pieces) {
    const targets = attackTargets(piece, occupancy);
    pieceMobility[piece.square] = targets.length;
    for (const target of targets) {
      const bucket = attacksByColor[piece.color][target] ?? [];
      bucket.push(piece.square);
      attacksByColor[piece.color][target] = bucket;
    }
  }

  const attacksBySquare: Record<string, string[]> = {};
  for (const sq of [...Object.keys(attacksByColor.w), ...Object.keys(attacksByColor.b)]) {
    const set = new Set([...(attacksByColor.w[sq] ?? []), ...(attacksByColor.b[sq] ?? [])]);
    attacksBySquare[sq] = [...set];
  }

  const defendersBySquare: Record<string, string[]> = {};
  for (const piece of pieces) {
    defendersBySquare[piece.square] = attacksByColor[piece.color][piece.square] ?? [];
  }

  const center = centerSquares();
  const extCenter = extendedCenterSquares();
  const centerControl: Record<"w" | "b", number> = {
    w: center.reduce((sum, sq) => sum + (attacksByColor.w[sq]?.length ?? 0), 0),
    b: center.reduce((sum, sq) => sum + (attacksByColor.b[sq]?.length ?? 0), 0),
  };
  const extendedCenterControl: Record<"w" | "b", number> = {
    w: extCenter.reduce((sum, sq) => sum + (attacksByColor.w[sq]?.length ?? 0), 0),
    b: extCenter.reduce((sum, sq) => sum + (attacksByColor.b[sq]?.length ?? 0), 0),
  };

  const kingZoneControl: Record<"w" | "b", number> = { w: 0, b: 0 };
  const wKingZone = kingSquares.w ? kingZoneSquares(kingSquares.w) : [];
  const bKingZone = kingSquares.b ? kingZoneSquares(kingSquares.b) : [];
  kingZoneControl.b = wKingZone.reduce((sum, sq) => sum + (attacksByColor.b[sq]?.length ?? 0), 0);
  kingZoneControl.w = bKingZone.reduce((sum, sq) => sum + (attacksByColor.w[sq]?.length ?? 0), 0);

  const loosePieces: string[] = [];
  const hangingPieces: string[] = [];
  for (const piece of pieces) {
    const enemy = colorOpp(piece.color);
    const attacked = attacksByColor[enemy][piece.square]?.length ?? 0;
    const defended = attacksByColor[piece.color][piece.square]?.length ?? 0;
    if (attacked > 0 && defended === 0) loosePieces.push(piece.square);
    if (attacked > defended) hangingPieces.push(piece.square);
  }

  const pawnsByColorFile: Record<"w" | "b", Record<string, string[]>> = { w: {}, b: {} };
  for (const piece of pieces) {
    if (piece.type !== "p") continue;
    const f = fileOf(piece.square);
    pawnsByColorFile[piece.color][f] = [...(pawnsByColorFile[piece.color][f] ?? []), piece.square];
  }

  const openFiles: string[] = [];
  const halfOpenFiles: Record<"w" | "b", string[]> = { w: [], b: [] };
  for (const f of FILES) {
    const wp = (pawnsByColorFile.w[f] ?? []).length;
    const bp = (pawnsByColorFile.b[f] ?? []).length;
    if (wp === 0 && bp === 0) openFiles.push(f);
    if (wp === 0 && bp > 0) halfOpenFiles.w.push(f);
    if (bp === 0 && wp > 0) halfOpenFiles.b.push(f);
  }

  const doubledPawns: Record<"w" | "b", number> = {
    w: Object.values(pawnsByColorFile.w).reduce((sum, arr) => sum + (arr.length > 1 ? arr.length - 1 : 0), 0),
    b: Object.values(pawnsByColorFile.b).reduce((sum, arr) => sum + (arr.length > 1 ? arr.length - 1 : 0), 0),
  };

  const isolatedPawns: Record<"w" | "b", number> = { w: 0, b: 0 };
  const passedPawns: Record<"w" | "b", string[]> = { w: [], b: [] };
  for (const color of ["w", "b"] as const) {
    const enemy = colorOpp(color);
    for (const piece of pieces.filter((p) => p.type === "p" && p.color === color)) {
      const file = fileOf(piece.square);
      const idx = FILES.indexOf(file);
      const adjacentFiles = [FILES[idx - 1], file, FILES[idx + 1]].filter(Boolean);
      const hasFriendlyAdjacent = adjacentFiles.some((f) => f !== file && (pawnsByColorFile[color][f] ?? []).length > 0);
      if (!hasFriendlyAdjacent) isolatedPawns[color] += 1;

      const enemyPawnsAhead = pieces.filter((p) => {
        if (p.type !== "p" || p.color !== enemy) return false;
        if (!adjacentFiles.includes(fileOf(p.square))) return false;
        return color === "w" ? Number(p.square[1]) > Number(piece.square[1]) : Number(p.square[1]) < Number(piece.square[1]);
      });
      if (enemyPawnsAhead.length === 0) passedPawns[color].push(piece.square);
    }
  }

  const kingSafety: Record<"w" | "b", number> = { w: 0, b: 0 };
  for (const color of ["w", "b"] as const) {
    const kingSquare = kingSquares[color];
    if (!kingSquare) continue;
    const zone = kingZoneSquares(kingSquare);
    const friendlyDef = zone.reduce((sum, sq) => sum + (attacksByColor[color][sq]?.length ?? 0), 0);
    const enemyAtk = zone.reduce((sum, sq) => sum + (attacksByColor[colorOpp(color)][sq]?.length ?? 0), 0);
    kingSafety[color] = friendlyDef - enemyAtk;
  }

  const material: Record<"w" | "b", number> = { w: 0, b: 0 };
  for (const piece of pieces) material[piece.color] += PIECE_VALUE[piece.type] ?? 0;

  return {
    fen,
    sideToMove: game.turn() as "w" | "b",
    pieces,
    kingSquares,
    attacksBySquare,
    defendersBySquare,
    pieceMobility,
    centerControl,
    extendedCenterControl,
    kingZoneControl,
    pinnedPieces: [],
    loosePieces,
    hangingPieces,
    openFiles,
    halfOpenFiles,
    pawnStructure: { doubledPawns, isolatedPawns, passedPawns },
    kingSafety,
    material,
  };
}
