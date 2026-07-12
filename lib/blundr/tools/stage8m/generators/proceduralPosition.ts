import { Chess } from 'chess.js';
import type { SideToMove, Square } from '../types';
import { FILES, distance } from '../analysis/chessUtils';

export interface PlacedPiece { square: Square; piece: string; }
export function placementFen(pieces: PlacedPiece[], turn: SideToMove): string {
  const map = new Map(pieces.map((p) => [p.square, p.piece])); const rows: string[] = [];
  for (let rank = 8; rank >= 1; rank -= 1) { let row = ''; let empty = 0; for (const file of FILES) { const p = map.get(`${file}${rank}`); if (p) { if (empty) row += empty; empty = 0; row += p; } else empty += 1; } if (empty) row += empty; rows.push(row); }
  return `${rows.join('/')} ${turn} - - 0 1`;
}
export function safeChess(pieces: PlacedPiece[], turn: SideToMove): Chess | undefined {
  const wk = pieces.find((p) => p.piece === 'K')?.square; const bk = pieces.find((p) => p.piece === 'k')?.square;
  if (!wk || !bk || distance(wk, bk) <= 1 || new Set(pieces.map((p) => p.square)).size !== pieces.length) return undefined;
  try {
    const chess = new Chess(placementFen(pieces, turn));
    const opponentKing = turn === 'w' ? bk : wk;
    if (chess.isAttacked(opponentKing as never, turn)) return undefined;
    return chess.moves().length ? chess : undefined;
  } catch { return undefined; }
}
