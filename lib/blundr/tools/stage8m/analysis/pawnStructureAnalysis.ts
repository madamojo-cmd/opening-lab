import { Chess } from 'chess.js';
import type { Move } from 'chess.js';
import type { PawnStructureAnalysis, PawnStructureDelta, Square } from '../types';
import { FILES, pieceSquares, sq, xy } from './chessUtils';

function pawnAttacks(square: Square, color: 'w' | 'b'): Square[] { const [f, r] = xy(square); const d = color === 'w' ? 1 : -1; return [sq(f - 1, r + d), sq(f + 1, r + d)].filter(Boolean) as Square[]; }
function passed(square: Square, color: 'w' | 'b', enemy: Square[]): boolean { const [f, r] = xy(square); return !enemy.some((e) => { const [ef, er] = xy(e); return Math.abs(ef - f) <= 1 && (color === 'w' ? er > r : er < r); }); }

export function analyzePawnStructure(input: Chess | string): PawnStructureAnalysis {
  const chess = typeof input === 'string' ? new Chess(input) : new Chess(input.fen());
  const white = pieceSquares(chess, 'w', 'p'); const black = pieceSquares(chess, 'b', 'p'); const all = [...white, ...black];
  const passedPawns = [...white.filter((p) => passed(p, 'w', black)), ...black.filter((p) => passed(p, 'b', white))];
  const protectedPassedPawns = passedPawns.filter((p) => { const piece = chess.get(p as never)!; return (piece.color === 'w' ? white : black).some((q) => pawnAttacks(q, piece.color).includes(p)); });
  const byFile = (pawns: Square[], f: number) => pawns.filter((p) => xy(p)[0] === f);
  const isolatedPawns = all.filter((p) => { const owner = white.includes(p) ? white : black; const f = xy(p)[0]; return !owner.some((q) => Math.abs(xy(q)[0] - f) === 1); });
  const doubledPawns = all.filter((p) => byFile(white.includes(p) ? white : black, xy(p)[0]).length > 1);
  const openFiles = [...FILES].filter((_, f) => byFile(all, f).length === 0);
  const halfOpenFiles = { white: [...FILES].filter((_, f) => !byFile(white, f).length && byFile(black, f).length), black: [...FILES].filter((_, f) => !byFile(black, f).length && byFile(white, f).length) };
  const chainsFor = (pawns: Square[], color: 'w' | 'b') => pawns.map((p) => [p, ...pawns.filter((q) => pawnAttacks(q, color).includes(p))]).filter((c) => c.length > 1);
  const pawnChains = [...chainsFor(white, 'w'), ...chainsFor(black, 'b')];
  const chainBases = pawnChains.map((c) => c[c.length - 1]);
  const lockedCenters: Array<[Square, Square]> = [];
  for (const p of white) { const [f, r] = xy(p); const ahead = sq(f, r + 1); if (ahead && black.includes(ahead) && f >= 2 && f <= 5) lockedCenters.push([p, ahead]); }
  const candidatePawnBreaks = (chess.moves({ verbose: true }) as Move[]).filter((m) => m.piece === 'p' && (Boolean(m.captured) || pawnAttacks(m.to, m.color).some((s) => all.includes(s)))).map((m) => `${m.from}${m.to}${m.promotion ?? ''}`);
  const outsidePassedPawns = passedPawns.filter((p) => { const enemy = white.includes(p) ? black : white; const f = xy(p)[0]; return enemy.every((e) => Math.abs(xy(e)[0] - f) >= 2); });
  const candidatePassedPawns = all.filter((p) => !passedPawns.includes(p) && (white.includes(p) ? black : white).filter((e) => Math.abs(xy(e)[0] - xy(p)[0]) <= 1).length <= 1);
  const backwardPawns = all.filter((p) => { const owner = white.includes(p) ? white : black; const [f, r] = xy(p); return !owner.some((q) => Math.abs(xy(q)[0] - f) === 1 && (white.includes(p) ? xy(q)[1] >= r : xy(q)[1] <= r)); });
  const hangingPawns = all.filter((p) => { const owner = white.includes(p) ? white : black; const [f, r] = xy(p); return owner.some((q) => Math.abs(xy(q)[0] - f) === 1 && xy(q)[1] === r) && !owner.some((q) => pawnAttacks(q, white.includes(p) ? 'w' : 'b').includes(p)); });
  return { pawns: { white, black }, passedPawns, protectedPassedPawns, outsidePassedPawns, candidatePassedPawns, isolatedPawns,
    isolatedQueenPawns: isolatedPawns.filter((p) => p[0] === 'd'), backwardPawns, doubledPawns, hangingPawns, pawnChains, chainBases, lockedCenters,
    candidatePawnBreaks, minorityAttackFiles: [], openFiles, halfOpenFiles };
}

export function analyzePawnStructureDelta(before: Chess, after: Chess, move: Move): PawnStructureDelta {
  const a = analyzePawnStructure(before); const b = analyzePawnStructure(after); const tags = (x: PawnStructureAnalysis) => [
    ...x.passedPawns.map((s) => `passed:${s}`), ...x.protectedPassedPawns.map((s) => `protected:${s}`), ...x.outsidePassedPawns.map((s) => `outside:${s}`),
    ...x.openFiles.map((f) => `open:${f}`), ...x.lockedCenters.map(([s]) => `locked:${s}`)];
  const beforeTags = tags(a); const afterTags = tags(b); const openedFiles = b.openFiles.filter((f) => !a.openFiles.includes(f));
  const halfBefore = [...a.halfOpenFiles.white, ...a.halfOpenFiles.black]; const halfAfter = [...b.halfOpenFiles.white, ...b.halfOpenFiles.black];
  const halfOpenedFiles = halfAfter.filter((f) => !halfBefore.includes(f)); const createdPassedPawn = b.passedPawns.find((s) => !a.passedPawns.includes(s));
  const createdProtectedPasser = b.protectedPassedPawns.find((s) => !a.protectedPassedPawns.includes(s)); const createdOutsidePasser = b.outsidePassedPawns.find((s) => !a.outsidePassedPawns.includes(s));
  const removedLock = a.lockedCenters.length > b.lockedCenters.length; const meaningful = Boolean(createdPassedPawn || createdProtectedPasser || createdOutsidePasser || openedFiles.length || halfOpenedFiles.length || removedLock);
  const changes = [createdPassedPawn && `creates a passed pawn on ${createdPassedPawn}`, createdProtectedPasser && `creates a protected passer on ${createdProtectedPasser}`, openedFiles.length && `opens the ${openedFiles.join('/')} file`, removedLock && 'breaks a locked pawn pair'].filter(Boolean);
  return { movedPawn: move.to, from: move.from, to: move.to, capture: move.captured ? move.to : undefined, beforeTags, afterTags, createdPassedPawn, createdProtectedPasser, createdOutsidePasser,
    removedBlocker: removedLock ? move.to : undefined, openedFiles, halfOpenedFiles, openedDiagonals: move.captured ? [move.from] : [], newlyWeakSquares: pawnAttacks(move.from, move.color),
    improvedSquares: pawnAttacks(move.to, move.color), changedFiles: [...new Set([move.from[0], move.to[0]])], summary: changes.join('; ') || 'no verified structural transformation', meaningful };
}
