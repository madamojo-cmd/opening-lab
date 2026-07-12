import { Chess } from 'chess.js';
import type { Move } from 'chess.js';
import type { ImbalanceProof, SideToMove } from '../types';
import { analyzePieceActivity } from './pieceActivityAnalysis';
import { analyzeBoard } from './boardAnalysis';
import { clone, pieceSquares } from './chessUtils';

export function detectImbalances(chess: Chess, side: SideToMove): string[] {
  const board = analyzeBoard(chess); const own = side === 'w' ? board.material.white : board.material.black; const enemy = side === 'w' ? board.material.black : board.material.white;
  const out: string[] = [];
  if (own.b >= 2 && enemy.b < 2) out.push('bishop_pair_activity');
  if (own.n && enemy.b && pieceSquares(chess, side, 'n').length) out.push('good_knight_vs_bad_bishop');
  if (own.r) out.push('rook_open_file_activity');
  if (own.r < enemy.r && own.n + own.b > enemy.n + enemy.b) out.push('exchange_imbalance');
  if (Math.abs(board.material.imbalanceCpApprox) >= 200) out.push('material_vs_activity');
  return out;
}

export function buildImbalanceProof(before: Chess, move: Move): ImbalanceProof | undefined {
  const imbalances = detectImbalances(before, move.color); if (!imbalances.length) return undefined;
  const after = clone(before); after.move({ from: move.from, to: move.to, promotion: move.promotion }); const a = analyzePieceActivity(before, move.color); const b = analyzePieceActivity(after, move.color);
  const type = move.piece === 'r' ? 'rook_open_file_activity' : move.piece === 'b' && imbalances.includes('bishop_pair_activity') ? 'bishop_pair_activity' : imbalances[0];
  return { imbalanceType: type, sideWithImbalance: move.color, beforeActivity: Number(a.total.toFixed(2)), afterActivity: Number(b.total.toFixed(2)), activityDelta: Number((b.total - a.total).toFixed(2)), relevantPieces: [...new Set([move.from, move.to, ...b.relevantPieces.slice(0, 3)])], durableFeatures: imbalances, targets: b.targets.slice(0, 4), whyItMatters: `${move.san} improves ${type.replaceAll('_', ' ')} by ${Math.max(0, b.total - a.total).toFixed(1)} activity units.` };
}
