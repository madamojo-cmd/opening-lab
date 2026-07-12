import { Chess } from 'chess.js';
import type { Move } from 'chess.js';
import type { SideToMove } from '../types';
import { clone, materialScore, uci, VALUES } from './chessUtils';

export interface SearchLine { move: Move; score: number; pv: string[]; }
function terminal(chess: Chess, root: SideToMove): number | undefined {
  if (chess.isCheckmate()) return chess.turn() === root ? -100000 : 100000;
  if (chess.isDraw()) return 0;
  return undefined;
}
function positional(chess: Chess, root: SideToMove): number {
  let score = materialScore(chess, root);
  for (const row of chess.board()) for (const p of row) if (p?.type === 'p') { const rank = Number(p.square[1]); const progress = p.color === 'w' ? rank - 2 : 7 - rank; score += (p.color === root ? 1 : -1) * progress * progress * 8; }
  return score;
}
function negamax(chess: Chess, depth: number, root: SideToMove, alpha: number, beta: number): { score: number; pv: string[] } {
  const end = terminal(chess, root); if (end !== undefined) return { score: end, pv: [] }; if (!depth) return { score: positional(chess, root), pv: [] };
  const maximizing = chess.turn() === root; let best = maximizing ? -Infinity : Infinity; let bestPv: string[] = [];
  const moves = chess.moves({ verbose: true }) as Move[];
  moves.sort((a, b) => (b.captured ? VALUES[b.captured] : 0) - (a.captured ? VALUES[a.captured] : 0));
  for (const move of moves) { const next = clone(chess); next.move({ from: move.from, to: move.to, promotion: move.promotion }); const child = negamax(next, depth - 1, root, alpha, beta); if ((maximizing && child.score > best) || (!maximizing && child.score < best)) { best = child.score; bestPv = [uci(move), ...child.pv]; } if (maximizing) alpha = Math.max(alpha, best); else beta = Math.min(beta, best); if (beta <= alpha) break; }
  return { score: best, pv: bestPv };
}
export function rankMoves(chess: Chess, depth = 5): SearchLine[] {
  const root = chess.turn(); return (chess.moves({ verbose: true }) as Move[]).map((move) => { const next = clone(chess); next.move({ from: move.from, to: move.to, promotion: move.promotion }); const r = negamax(next, depth - 1, root, -Infinity, Infinity); return { move, score: r.score, pv: [uci(move), ...r.pv] }; }).sort((a, b) => b.score - a.score);
}
