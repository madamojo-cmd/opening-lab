const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

export function normalizeSquare(square: unknown): string {
  return typeof square === "string" ? square.trim().toLowerCase() : "";
}

export function isValidSquare(square: unknown): square is string {
  const normalized = normalizeSquare(square);
  return /^[a-h][1-8]$/.test(normalized);
}

export function fileOf(square: string): string {
  const normalized = normalizeSquare(square);
  return isValidSquare(normalized) ? normalized[0] : "";
}

export function rankOf(square: string): number {
  const normalized = normalizeSquare(square);
  return isValidSquare(normalized) ? Number(normalized[1]) : 0;
}

export function squareColor(square: string): "light" | "dark" {
  if (!isValidSquare(square)) return "light";
  const fileIndex = FILES.indexOf(fileOf(square));
  const rank = rankOf(square);
  return (fileIndex + rank) % 2 === 0 ? "dark" : "light";
}

export function offsetSquare(square: string, df: number, dr: number): string | null {
  if (!isValidSquare(square)) return null;
  const fileIndex = FILES.indexOf(fileOf(square)) + df;
  const rank = rankOf(square) + dr;
  if (fileIndex < 0 || fileIndex > 7 || rank < 1 || rank > 8) return null;
  return `${FILES[fileIndex]}${rank}`;
}

export function manhattanDistance(a: string, b: string): number {
  if (!isValidSquare(a) || !isValidSquare(b)) return 99;
  const af = FILES.indexOf(fileOf(a));
  const ar = rankOf(a);
  const bf = FILES.indexOf(fileOf(b));
  const br = rankOf(b);
  return Math.abs(af - bf) + Math.abs(ar - br);
}

export function kingZoneSquares(kingSquare: string): string[] {
  if (!isValidSquare(kingSquare)) return [];
  const out: string[] = [];
  for (let df = -1; df <= 1; df += 1) {
    for (let dr = -1; dr <= 1; dr += 1) {
      const sq = offsetSquare(kingSquare, df, dr);
      if (sq) out.push(sq);
    }
  }
  return out;
}

export function centerSquares(): string[] {
  return ["d4", "e4", "d5", "e5"];
}

export function extendedCenterSquares(): string[] {
  return ["c3", "d3", "e3", "f3", "c4", "d4", "e4", "f4", "c5", "d5", "e5", "f5", "c6", "d6", "e6", "f6"];
}

export function homeRankForSide(side: "w" | "b"): number {
  return side === "w" ? 1 : 8;
}

export function isBackRankPieceStart(square: string, piece: string, color: "w" | "b"): boolean {
  if (!isValidSquare(square)) return false;
  const sq = normalizeSquare(square);
  if (piece === "n") return color === "w" ? sq === "b1" || sq === "g1" : sq === "b8" || sq === "g8";
  if (piece === "b") return color === "w" ? sq === "c1" || sq === "f1" : sq === "c8" || sq === "f8";
  if (piece === "r") return color === "w" ? sq === "a1" || sq === "h1" : sq === "a8" || sq === "h8";
  if (piece === "q") return color === "w" ? sq === "d1" : sq === "d8";
  if (piece === "k") return color === "w" ? sq === "e1" : sq === "e8";
  return rankOf(sq) === homeRankForSide(color);
}

export function isPromotionRank(square: string, color: "w" | "b"): boolean {
  if (!isValidSquare(square)) return false;
  return color === "w" ? rankOf(square) === 8 : rankOf(square) === 1;
}
