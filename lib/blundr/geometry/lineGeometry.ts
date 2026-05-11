export const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
export const RANKS = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;

export const ALL_SQUARES = RANKS.flatMap((rank) =>
  FILES.map((file) => `${file}${rank}`),
);

export function isBoardSquare(square: string): boolean {
  return /^[a-h][1-8]$/.test(square);
}

export function squareToCoords(square: string): { file: number; rank: number } {
  if (!isBoardSquare(square)) {
    throw new Error(`Invalid board square: ${square}`);
  }

  return {
    file: FILES.indexOf(square[0] as (typeof FILES)[number]),
    rank: RANKS.indexOf(square[1] as (typeof RANKS)[number]),
  };
}

export function coordsToSquare(file: number, rank: number): string | null {
  if (file < 0 || file > 7 || rank < 0 || rank > 7) {
    return null;
  }

  return `${FILES[file]}${RANKS[rank]}`;
}

export function squaresBetween(from: string, to: string): string[] {
  const start = squareToCoords(from);
  const end = squareToCoords(to);
  const df = Math.sign(end.file - start.file);
  const dr = Math.sign(end.rank - start.rank);
  const fileDistance = Math.abs(end.file - start.file);
  const rankDistance = Math.abs(end.rank - start.rank);

  const aligned =
    from !== to &&
    (fileDistance === 0 || rankDistance === 0 || fileDistance === rankDistance);

  if (!aligned) {
    return [];
  }

  const result: string[] = [];
  let file = start.file + df;
  let rank = start.rank + dr;

  while (file !== end.file || rank !== end.rank) {
    const square = coordsToSquare(file, rank);
    if (square) {
      result.push(square);
    }
    file += df;
    rank += dr;
  }

  return result;
}

export function rayFrom(from: string, df: number, dr: number): string[] {
  const start = squareToCoords(from);
  const result: string[] = [];
  let file = start.file + df;
  let rank = start.rank + dr;

  while (true) {
    const square = coordsToSquare(file, rank);
    if (!square) {
      break;
    }

    result.push(square);
    file += df;
    rank += dr;
  }

  return result;
}

export function isDiagonal(from: string, to: string): boolean {
  const start = squareToCoords(from);
  const end = squareToCoords(to);
  return (
    from !== to &&
    Math.abs(end.file - start.file) === Math.abs(end.rank - start.rank)
  );
}

export function isSameFile(from: string, to: string): boolean {
  return squareToCoords(from).file === squareToCoords(to).file && from !== to;
}

export function isSameRank(from: string, to: string): boolean {
  return squareToCoords(from).rank === squareToCoords(to).rank && from !== to;
}

export function classifyLine(
  from: string,
  to: string,
): "diagonal" | "file" | "rank" | "knight" | "none" {
  const start = squareToCoords(from);
  const end = squareToCoords(to);
  const fileDistance = Math.abs(end.file - start.file);
  const rankDistance = Math.abs(end.rank - start.rank);

  if (fileDistance === 1 && rankDistance === 2) {
    return "knight";
  }
  if (fileDistance === 2 && rankDistance === 1) {
    return "knight";
  }
  if (isDiagonal(from, to)) {
    return "diagonal";
  }
  if (isSameFile(from, to)) {
    return "file";
  }
  if (isSameRank(from, to)) {
    return "rank";
  }

  return "none";
}

export function kingDistance(a: string, b: string): number {
  const from = squareToCoords(a);
  const to = squareToCoords(b);
  return Math.max(Math.abs(to.file - from.file), Math.abs(to.rank - from.rank));
}

export function manhattanDistance(a: string, b: string): number {
  const from = squareToCoords(a);
  const to = squareToCoords(b);
  return Math.abs(to.file - from.file) + Math.abs(to.rank - from.rank);
}
