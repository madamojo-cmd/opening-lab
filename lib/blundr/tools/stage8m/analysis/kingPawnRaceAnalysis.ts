import { Chess } from 'chess.js';
import type { Move } from 'chess.js';
import type { KingRaceProof, Square } from '../types';
import { distance, pieceSquares, sq, xy } from './chessUtils';
import { rankMoves } from './boundedSearch';

function promotionTempo(square: Square, color: 'w' | 'b'): number { const [, r] = xy(square); return color === 'w' ? 7 - r : r; }
function criticalSquares(pawn: Square, color: 'w' | 'b'): Square[] { const [f, r] = xy(pawn); const d = color === 'w' ? 1 : -1; const advance = (color === 'w' ? r <= 3 : r >= 4) ? 2 : 1; return [sq(f - 1, r + d * advance), sq(f, r + d * advance), sq(f + 1, r + d * advance)].filter(Boolean) as Square[]; }

export function analyzeKingPawnRace(chess: Chess, bestMove?: Move, depth = 6): KingRaceProof {
  const whitePawns = pieceSquares(chess, 'w', 'p'); const blackPawns = pieceSquares(chess, 'b', 'p'); const wk = pieceSquares(chess, 'w', 'k')[0]; const bk = pieceSquares(chess, 'b', 'k')[0];
  const ranks = rankMoves(chess, depth); const chosen = bestMove ? ranks.find((r) => r.move.from === bestMove.from && r.move.to === bestMove.to) ?? ranks[0] : ranks[0];
  const pawn = (chess.turn() === 'w' ? whitePawns : blackPawns)[0] ?? [...whitePawns, ...blackPawns][0]; const crit = pawn ? criticalSquares(pawn, chess.get(pawn as never)!.color) : [];
  const ownKing = chess.turn() === 'w' ? wk : bk; const enemyKing = chess.turn() === 'w' ? bk : wk; const kingGap = pawn ? distance(ownKing, pawn) - distance(enemyKing, pawn) : 0;
  return { oppositionState: distance(wk, bk) === 2 ? 'has_opposition' : kingGap > 0 ? 'must_gain_opposition' : 'must_avoid_opposition', criticalSquares: crit,
    squareOfPawn: [...whitePawns, ...blackPawns].filter((p) => { const color = chess.get(p as never)!.color; const enemy = color === 'w' ? bk : wk; return distance(enemy, p) <= promotionTempo(p, color); }),
    kingRoute: chosen?.pv.slice(0, 4).map((m) => m.slice(2, 4)).filter((s) => /^[a-h][1-8]$/.test(s)) ?? [], promotionTempi: { white: Math.min(99, ...whitePawns.map((p) => promotionTempo(p, 'w'))), black: Math.min(99, ...blackPawns.map((p) => promotionTempo(p, 'b'))) },
    spareTempo: Math.abs(whitePawns.length - blackPawns.length) > 0 || [...whitePawns, ...blackPawns].some((p) => ['2', '7'].includes(p[1])), scoreBefore: ranks[1]?.score ?? chosen?.score ?? 0, scoreAfter: chosen?.score ?? 0, verificationDepth: depth, principalVariation: chosen?.pv ?? [] };
}
