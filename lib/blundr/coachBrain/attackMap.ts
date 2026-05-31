import { Chess } from "chess.js";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const CENTER = new Set(["d4", "e4", "d5", "e5"]);

type Piece = { type: "p" | "n" | "b" | "r" | "q" | "k"; color: "w" | "b" };

function fileIndex(file: string): number {
  return FILES.indexOf(file);
}

function inBounds(file: number, rank: number): boolean {
  return file >= 0 && file < 8 && rank >= 1 && rank <= 8;
}

function square(file: number, rank: number): string {
  return `${FILES[file]}${rank}`;
}

export function normalizeFenForCoach(fen: string): string {
  const parts = fen.trim().split(/\s+/);
  return parts.slice(0, 4).join(" ");
}

export function uciToMoveParts(uci: string): { from: string; to: string; promotion?: string } {
  return {
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci.length > 4 ? uci.slice(4, 5) : undefined,
  };
}

export function squareHasPiece(fen: string, target: string): boolean {
  try {
    const chess = new Chess(fen);
    return Boolean(chess.get(target as any));
  } catch {
    return false;
  }
}

export function getPieceAtSquare(fen: string, target: string): Piece | undefined {
  try {
    const chess = new Chess(fen);
    const piece = chess.get(target as any);
    if (!piece) return undefined;
    return { type: piece.type, color: piece.color };
  } catch {
    return undefined;
  }
}

function sliderAttacks(chess: Chess, from: string, directions: Array<[number, number]>): { direct: string[]; xray: string[] } {
  const out: string[] = [];
  const xray: string[] = [];
  const f = fileIndex(from[0]);
  const r = Number(from[1]);

  for (const [df, dr] of directions) {
    let ff = f + df;
    let rr = r + dr;
    let blocked = false;
    while (inBounds(ff, rr)) {
      const sq = square(ff, rr);
      const occ = chess.get(sq as any);
      if (!blocked) out.push(sq);
      else xray.push(sq);
      if (occ && !blocked) blocked = true;
      ff += df;
      rr += dr;
    }
  }

  return { direct: out, xray };
}

function pieceAttacks(chess: Chess, from: string): { direct: string[]; xray: string[] } {
  const piece = chess.get(from as any);
  if (!piece) return { direct: [], xray: [] };

  const f = fileIndex(from[0]);
  const r = Number(from[1]);
  const direct: string[] = [];

  if (piece.type === "n") {
    for (const [df, dr] of [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]] as Array<[number, number]>) {
      const ff = f + df;
      const rr = r + dr;
      if (inBounds(ff, rr)) direct.push(square(ff, rr));
    }
    return { direct, xray: [] };
  }

  if (piece.type === "k") {
    for (const [df, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]] as Array<[number, number]>) {
      const ff = f + df;
      const rr = r + dr;
      if (inBounds(ff, rr)) direct.push(square(ff, rr));
    }
    return { direct, xray: [] };
  }

  if (piece.type === "p") {
    const dr = piece.color === "w" ? 1 : -1;
    for (const df of [-1, 1]) {
      const ff = f + df;
      const rr = r + dr;
      if (inBounds(ff, rr)) direct.push(square(ff, rr));
    }
    return { direct, xray: [] };
  }

  if (piece.type === "b") return sliderAttacks(chess, from, [[1, 1], [1, -1], [-1, 1], [-1, -1]]);
  if (piece.type === "r") return sliderAttacks(chess, from, [[1, 0], [-1, 0], [0, 1], [0, -1]]);
  if (piece.type === "q") return sliderAttacks(chess, from, [[1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]]);

  return { direct: [], xray: [] };
}

export function getPieceAttacksFrom(fen: string, from: string): string[] {
  try {
    const chess = new Chess(fen);
    return pieceAttacks(chess, from).direct;
  } catch {
    return [];
  }
}

export function getPieceDefendsFrom(fen: string, from: string): string[] {
  try {
    const chess = new Chess(fen);
    const piece = chess.get(from as any);
    if (!piece) return [];
    return pieceAttacks(chess, from).direct.filter((sq) => {
      const occ = chess.get(sq as any);
      return Boolean(occ && occ.color === piece.color);
    });
  } catch {
    return [];
  }
}

export function getAttackedSquares(fen: string, color: "w" | "b"): string[] {
  try {
    const chess = new Chess(fen);
    const set = new Set<string>();
    for (const file of FILES) {
      for (let rank = 1; rank <= 8; rank += 1) {
        const sq = `${file}${rank}`;
        const piece = chess.get(sq as any);
        if (!piece || piece.color !== color) continue;
        for (const target of pieceAttacks(chess, sq).direct) set.add(target);
      }
    }
    return Array.from(set).sort();
  } catch {
    return [];
  }
}

export function getSliderRayInfo(fen: string, from: string): { direct: string[]; xray: string[] } {
  try {
    const chess = new Chess(fen);
    const piece = chess.get(from as any);
    if (!piece) return { direct: [], xray: [] };
    if (piece.type !== "b" && piece.type !== "r" && piece.type !== "q") return { direct: [], xray: [] };
    return pieceAttacks(chess, from);
  } catch {
    return { direct: [], xray: [] };
  }
}

export function centerSquaresAffected(squares: string[]): string[] {
  return squares.filter((sq) => CENTER.has(sq));
}
