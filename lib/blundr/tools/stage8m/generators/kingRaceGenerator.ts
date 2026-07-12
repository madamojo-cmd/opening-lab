import type { GeneratorResult, MiniGameGenerator, Square } from '../types';
import { FILES, pieceSquares } from '../analysis/chessUtils';
import { rankMoves } from '../analysis/boundedSearch';
import { analyzeKingPawnRace } from '../analysis/kingPawnRaceAnalysis';
import { buildScenario, difficultyFor } from '../scenarioBuilder';
import { safeChess } from './proceduralPosition';

export const kingRaceGenerator: MiniGameGenerator = { id: 'king_race', generate(ctx): GeneratorResult {
  const rng = ctx.rng.fork(this.id); const accepted = []; const rejected = []; const seen = new Set<string>(); let attempts = 0;
  while (accepted.length < ctx.maxPerGame && attempts++ < ctx.maxPerGame * 250) {
    const turn = rng.pick(['w', 'b'] as const); const square = () => `${rng.pick([...FILES])}${1 + rng.int(8)}` as Square; const pawnCount = 1 + rng.int(4);
    const pieces = [{ square: square(), piece: 'K' }, { square: square(), piece: 'k' }];
    for (let i = 0; i < pawnCount; i += 1) { const color = rng.pick(['w', 'b'] as const); pieces.push({ square: `${rng.pick([...FILES])}${2 + rng.int(6)}` as Square, piece: color === 'w' ? 'P' : 'p' }); }
    const chess = safeChess(pieces, turn); if (!chess) continue; const ranks = rankMoves(chess, 4); if (ranks.length < 2 || ranks[0].score - ranks[1].score < 8) { rejected.push({ miniGameId: this.id, fen: chess.fen(), reason: 'no_unique_bounded_best_move' }); continue; }
    const best = ranks[0]; if (best.move.piece !== 'k' && best.move.piece !== 'p') continue; const proof = analyzeKingPawnRace(chess, best.move, 4); if (!proof.principalVariation.length || (!proof.criticalSquares.length && !proof.squareOfPawn.length)) continue;
    const key = `${chess.fen().split(' ')[0]}:${best.move.from}${best.move.to}`; if (seen.has(key)) continue; seen.add(key); const alts = ranks.slice(1, 4).map((r) => ({ move: r.move, why: `${r.move.san} scores ${r.score}, ${best.score - r.score} below ${best.move.san} in the ${proof.verificationDepth}-ply race search.` }));
    const concept = best.move.piece === 'p' ? 'promotion_race' : proof.oppositionState === 'has_opposition' ? 'opposition' : proof.criticalSquares.includes(best.move.to) ? 'critical_square' : 'king_route';
    const scenario = buildScenario({ miniGameId: this.id, seed: ctx.seed, generatorId: 'kingRaceGenerator', sourceId: `procedural-${attempts}`, chess, move: best.move, alternatives: alts, concept, subConcept: proof.oppositionState, difficulty: difficultyFor(accepted.length), proof: proof as unknown as Record<string, unknown>, moveType: best.move.piece === 'p' ? 'promotion' : 'king_route', score: 88,
      short: `Find the move that wins the king-and-pawn race.`, detailed: `${best.move.san} improves the verified race score from ${proof.scoreBefore} to ${proof.scoreAfter}. The critical squares are ${proof.criticalSquares.join(', ') || 'already occupied'}, promotion tempi are White ${proof.promotionTempi.white} and Black ${proof.promotionTempi.black}, and the checked route begins ${proof.principalVariation.slice(0, 4).join(' ')}.`, coachNote: `Count king distance and pawn tempi before relying on visual proximity.`, transferPattern: `In pawn endings, compare exact king routes, critical squares, and promotion tempi.` });
    if (scenario.validation.runtimeReady) accepted.push(scenario);
  }
  return { accepted, rejected };
} };

export function createKingRaceContext() { throw new Error('Use createGeneratorContext from databaseBuilder'); }
