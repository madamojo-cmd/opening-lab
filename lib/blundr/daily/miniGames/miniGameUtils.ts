export function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

export function fileIndex(square: string): number {
  return Math.max(0, Math.min(7, square.toLowerCase().charCodeAt(0) - 97));
}

export function rankIndex(square: string): number {
  return Math.max(0, Math.min(7, 8 - Number(square.slice(1))));
}

export function squareDistance(a: string, b: string): number {
  const fileDistance = Math.abs(fileIndex(a) - fileIndex(b));
  const rankDistance = Math.abs(rankIndex(a) - rankIndex(b));
  return Math.max(fileDistance, rankDistance);
}

export function squareManhattanDistance(a: string, b: string): number {
  const fileDistance = Math.abs(fileIndex(a) - fileIndex(b));
  const rankDistance = Math.abs(rankIndex(a) - rankIndex(b));
  return fileDistance + rankDistance;
}

export function squareToCoords(square: string): { file: number; rank: number } {
  return {
    file: fileIndex(square),
    rank: rankIndex(square),
  };
}

export function coordsToSquare(file: number, rank: number): string {
  const clampedFile = Math.max(0, Math.min(7, file));
  const clampedRank = Math.max(0, Math.min(7, rank));
  return `${String.fromCharCode(97 + clampedFile)}${8 - clampedRank}`;
}

export function hashString(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function uniqueSquares(values: readonly string[] | undefined): string[] {
  return Array.from(new Set((values ?? []).map((value) => normalizeText(value).toLowerCase()).filter(Boolean)));
}

