import { Chess } from 'chess.js';
import type { Color, Move, PieceSymbol, Square as ChessSquare } from 'chess.js';
import type { SideToMove, Square } from '../types';

export const FILES = 'abcdefgh';
export const SQUARES = Array.from({ length: 64 }, (_, i) => `${FILES[i % 8]}${Math.floor(i / 8) + 1}`);
export const VALUES: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

export function xy(square: Square): [number, number] { return [FILES.indexOf(square[0]), Number(square[1]) - 1]; }
export function sq(file: number, rank: number): Square | undefined { return file >= 0 && file < 8 && rank >= 0 && rank < 8 ? `${FILES[file]}${rank + 1}` : undefined; }
export function distance(a: Square, b: Square): number { const [af, ar] = xy(a); const [bf, br] = xy(b); return Math.max(Math.abs(af - bf), Math.abs(ar - br)); }
export function opposite(side: SideToMove): SideToMove { return side === 'w' ? 'b' : 'w'; }
export function uci(move: Pick<Move, 'from' | 'to' | 'promotion'>): string { return `${move.from}${move.to}${move.promotion ?? ''}`; }
export function legalMove(chess: Chess, moveUci: string): Move | undefined { return (chess.moves({ verbose: true }) as Move[]).find((m) => uci(m) === moveUci); }
export function clone(chess: Chess): Chess { return new Chess(chess.fen()); }
export function applyUci(chess: Chess, moveUci: string): Move | undefined { const m = legalMove(chess, moveUci); return m ? chess.move({ from: m.from, to: m.to, promotion: m.promotion }) : undefined; }
export function pieceSquares(chess: Chess, color?: Color, type?: PieceSymbol): Square[] {
  const out: Square[] = [];
  for (const square of SQUARES) { const p = chess.get(square as ChessSquare); if (p && (!color || p.color === color) && (!type || p.type === type)) out.push(square); }
  return out;
}
export function attackers(chess: Chess, target: Square, color: Color): Square[] {
  const out: Square[] = [];
  for (const from of pieceSquares(chess, color)) {
    const piece = chess.get(from as ChessSquare); if (!piece) continue;
    const probe = new Chess(chess.fen());
    if (probe.turn() !== color) { const fields = probe.fen().split(' '); fields[1] = color; try { probe.load(fields.join(' ')); } catch { continue; } }
    const moves = probe.moves({ square: from as ChessSquare, verbose: true }) as Move[];
    if (moves.some((m) => m.to === target)) out.push(from);
  }
  return out;
}
export function materialScore(chess: Chess, perspective: SideToMove): number {
  let score = 0; for (const s of SQUARES) { const p = chess.get(s as ChessSquare); if (p) score += (p.color === perspective ? 1 : -1) * VALUES[p.type]; }
  return score;
}
export function fenWithTurn(placement: string, turn: SideToMove): string { return `${placement} ${turn} - - 0 1`; }
