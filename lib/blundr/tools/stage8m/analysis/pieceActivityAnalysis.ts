import { Chess } from 'chess.js';
import type { Color, Move } from 'chess.js';
import type { SideToMove, Square } from '../types';
import { attackers, clone, pieceSquares, xy } from './chessUtils';
import { analyzePawnStructure } from './pawnStructureAnalysis';

export interface PieceActivity { total: number; mobility: number; enemyHalf: number; kingPressure: number; fileControl: number; diagonalScope: number; outpostValue: number; seventhRank: number; coordination: number; relevantPieces: Square[]; targets: Square[]; }

export function analyzePieceActivity(input: Chess | string, side: SideToMove): PieceActivity {
  const chess = typeof input === 'string' ? new Chess(input) : clone(input); const fields = chess.fen().split(' '); fields[1] = side; try { chess.load(fields.join(' ')); } catch {}
  const moves = chess.moves({ verbose: true }) as Move[]; const enemyKing = pieceSquares(chess, side === 'w' ? 'b' : 'w', 'k')[0]; const pawns = analyzePawnStructure(chess);
  let enemyHalf = 0; let kingPressure = 0; let fileControl = 0; let diagonalScope = 0; let seventhRank = 0; const targets: Square[] = [];
  for (const m of moves) { const [, rank] = xy(m.to); if (side === 'w' ? rank >= 4 : rank <= 3) enemyHalf += 1; if (enemyKing && Math.max(Math.abs(xy(m.to)[0] - xy(enemyKing)[0]), Math.abs(rank - xy(enemyKing)[1])) <= 2) kingPressure += 1; if (m.piece === 'r' && (pawns.openFiles.includes(m.to[0]) || pawns.halfOpenFiles[side === 'w' ? 'white' : 'black'].includes(m.to[0]))) fileControl += 2; if (m.piece === 'b' || m.piece === 'q') diagonalScope += 1; if (m.piece === 'r' && (side === 'w' ? rank === 6 : rank === 1)) seventhRank += 3; if (m.captured) targets.push(m.to); }
  const relevantPieces = pieceSquares(chess, side).filter((s) => attackers(chess, s, side).length > 0 || moves.some((m) => m.from === s));
  const coordination = relevantPieces.reduce((n, s) => n + Math.min(2, attackers(chess, s, side).length), 0); const outpostValue = pieceSquares(chess, side, 'n').reduce((n, s) => { const [, r] = xy(s); const advanced = side === 'w' ? r >= 4 : r <= 3; return n + (advanced ? 2 : 0); }, 0);
  const total = moves.length + enemyHalf * 0.6 + kingPressure + fileControl + diagonalScope * 0.2 + outpostValue + seventhRank + coordination * 0.5;
  return { total, mobility: moves.length, enemyHalf, kingPressure, fileControl, diagonalScope, outpostValue, seventhRank, coordination, relevantPieces, targets: [...new Set(targets)] };
}
