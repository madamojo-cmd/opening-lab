import { Chess } from 'chess.js';
import type { BoardAnalysis, PieceSymbol, SideToMove, Stage8MMove, Stage8MPhase } from '../types';
import { distance, pieceSquares, VALUES } from './chessUtils';

function classify(chess: Chess, pieceCount: number): Stage8MPhase {
  const queens = pieceSquares(chess, undefined, 'q').length;
  const ply = Number(chess.fen().split(' ')[5] ?? 1) * 2 - (chess.turn() === 'w' ? 2 : 1);
  if (!queens || pieceCount <= 10) return 'endgame';
  if (ply < 14 && pieceCount >= 24) return 'opening';
  return 'middlegame';
}

export function analyzeBoard(input: Chess | string): BoardAnalysis {
  const chess = typeof input === 'string' ? new Chess(input) : new Chess(input.fen());
  const legalMoves = chess.moves({ verbose: true }) as Stage8MMove[];
  const counts: { white: Record<PieceSymbol, number>; black: Record<PieceSymbol, number> } = { white: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 }, black: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 } };
  for (const row of chess.board()) for (const p of row) if (p) counts[p.color === 'w' ? 'white' : 'black'][p.type as PieceSymbol] += 1;
  const value = (side: 'white' | 'black') => Object.entries(counts[side]).reduce((n, [p, c]) => n + VALUES[p] * c, 0);
  const whiteKing = pieceSquares(chess, 'w', 'k')[0]; const blackKing = pieceSquares(chess, 'b', 'k')[0];
  const pieceCount = Object.values(counts.white).reduce((a, b) => a + b, 0) + Object.values(counts.black).reduce((a, b) => a + b, 0);
  const pawnCount = counts.white.p + counts.black.p;
  const materialSignature = `w:p${counts.white.p}n${counts.white.n}b${counts.white.b}r${counts.white.r}q${counts.white.q}|b:p${counts.black.p}n${counts.black.n}b${counts.black.b}r${counts.black.r}q${counts.black.q}`;
  return { fen: chess.fen(), sideToMove: chess.turn() as SideToMove, phase: classify(chess, pieceCount), pieceCount, pawnCount, materialSignature,
    material: { white: { ...counts.white }, black: { ...counts.black }, imbalanceCpApprox: value('white') - value('black') },
    kings: { white: whiteKing, black: blackKing, distance: distance(whiteKing, blackKing) }, legalMoves,
    captures: legalMoves.filter((m) => Boolean(m.captured)), checks: legalMoves.filter((m) => /[+#]/.test(m.san)),
    quietMoves: legalMoves.filter((m) => !m.captured && !/[+#]/.test(m.san)) };
}
