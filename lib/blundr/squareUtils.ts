/**
 * BlundrOneNet v0 Square and Arrow Utilities
 *
 * This module provides board coordinate helpers for converting between
 * square names (a1, h8, etc.) and numeric IDs.
 */

export const BOARD_SQUARE_RE = /^[a-h][1-8]$/;

/**
 * Type guard: check if a value is a valid chess board square (a1–h8).
 */
export function isBoardSquare(value: string): boolean {
  return BOARD_SQUARE_RE.test(value);
}

/**
 * Convert a chess square name (e.g., "e4") to a numeric ID (0–63).
 * ID = rank * 8 + file, where rank 0 is rank 1 and file 0 is 'a'.
 */
export function squareToId(square: string): number {
  if (!isBoardSquare(square)) {
    throw new Error(`Invalid square: ${square}`);
  }
  const file = square.charCodeAt(0) - "a".charCodeAt(0);
  const rank = Number(square[1]) - 1;
  return rank * 8 + file;
}

/**
 * Convert a numeric ID (0–63) back to a chess square name (e.g., "e4").
 */
export function idToSquare(id: number): string {
  if (id < 0 || id > 63) {
    throw new Error(`Invalid square ID: ${id}`);
  }
  const file = String.fromCharCode("a".charCodeAt(0) + (id % 8));
  const rank = Math.floor(id / 8) + 1;
  return `${file}${rank}`;
}

/**
 * Convert an arrow (from and to squares) to a unique numeric ID.
 * Used for deduplication and efficient lookup of arrows.
 */
export function arrowToId(from: string, to: string): number {
  if (!isBoardSquare(from) || !isBoardSquare(to)) {
    throw new Error(`Invalid arrow: ${from}->${to}`);
  }
  return squareToId(from) * 64 + squareToId(to);
}

/**
 * Convert a numeric arrow ID back to a [from, to] square pair.
 */
export function idToArrow(id: number): [string, string] {
  if (id < 0 || id > 4095) {
    throw new Error(`Invalid arrow ID: ${id}`);
  }
  return [idToSquare(Math.floor(id / 64)), idToSquare(id % 64)];
}
