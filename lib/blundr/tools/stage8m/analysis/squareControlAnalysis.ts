import { Chess } from 'chess.js';
import type { Move } from 'chess.js';
import type { KeySquareProof, Square } from '../types';
import { attackers, clone, opposite, pieceSquares, sq, xy } from './chessUtils';
import { analyzePawnStructure } from './pawnStructureAnalysis';

function usefulTargets(chess: Chess, target: Square, color: 'w' | 'b'): Square[] {
  const probe = clone(chess); const fields = probe.fen().split(' '); fields[1] = color; try { probe.load(fields.join(' ')); } catch { return []; }
  return (probe.moves({ square: target as never, verbose: true }) as Move[]).filter((m) => { const [f, r] = xy(m.to); return color === 'w' ? r >= 4 : r <= 3; }).map((m) => m.to);
}

export function buildKeySquareProof(before: Chess, move: Move): KeySquareProof {
  const after = clone(before); after.move({ from: move.from, to: move.to, promotion: move.promotion });
  const friendly = move.color; const enemy = opposite(friendly); const friendlySupporters = attackers(after, move.to, friendly);
  const friendlyPawnSupporters = friendlySupporters.filter((s) => after.get(s as never)?.type === 'p'); const enemyAttackers = attackers(after, move.to, enemy);
  const [tf, tr] = xy(move.to); const enemyPawnChasers = pieceSquares(after, enemy, 'p').filter((p) => { const [pf, pr] = xy(p); const dir = enemy === 'w' ? 1 : -1; return Math.abs(pf - tf) === 1 && (pr + dir === tr || pr + 2 * dir === tr); });
  const pawnInfo = analyzePawnStructure(after); const blockade = [...pawnInfo.passedPawns, ...pawnInfo.isolatedPawns, ...pawnInfo.backwardPawns].some((p) => { const [pf, pr] = xy(p); const color = after.get(p as never)?.color; return sq(pf, pr + (color === 'w' ? 1 : -1)) === move.to; });
  const piece = after.get(move.to as never)!; const advanced = friendly === 'w' ? tr >= 4 : tr <= 3;
  const squareType: KeySquareProof['squareType'] = piece.type === 'n' && advanced ? 'knight_outpost' : blockade ? 'blockade' : piece.type === 'r' ? 'rook_entry' : piece.type === 'k' ? 'king_entry' : 'invasion';
  const useful = usefulTargets(after, move.to, friendly);
  return { targetSquare: move.to, squareType, friendlySupporters, friendlyPawnSupporters, enemyAttackers, enemyPawnChasers,
    enemyCanChaseWithPawn: enemyPawnChasers.length > 0, beforeFriendlyControl: attackers(before, move.to, friendly).length,
    afterFriendlyControl: friendlySupporters.length, beforeEnemyControl: attackers(before, move.to, enemy).length, afterEnemyControl: enemyAttackers.length,
    durabilityPlyEstimate: enemyPawnChasers.length ? 1 : Math.min(5, 2 + friendlySupporters.length), usefulTargetsFromSquare: useful,
    strategicPurpose: squareType === 'blockade' ? `halts the pawn directly behind ${move.to}` : `${move.to} creates access to ${useful.slice(0, 3).join(', ')}` };
}

export function keySquareProofPasses(proof: KeySquareProof): boolean {
  if (proof.enemyCanChaseWithPawn || proof.durabilityPlyEstimate < 2) return false;
  if (proof.squareType === 'knight_outpost') return proof.friendlySupporters.length > 0 && proof.usefulTargetsFromSquare.length >= 2;
  return proof.usefulTargetsFromSquare.length >= 1 || proof.squareType === 'blockade';
}
