import type { GeneratorResult, MiniGameGenerator, Square } from '../types';
import type { Move } from 'chess.js';
import { FILES, clone } from '../analysis/chessUtils';
import { rankMoves } from '../analysis/boundedSearch';
import { analyzePawnStructure, analyzePawnStructureDelta } from '../analysis/pawnStructureAnalysis';
import { buildScenario, difficultyFor } from '../scenarioBuilder';
import { safeChess } from './proceduralPosition';

export const pawnWarsGenerator: MiniGameGenerator = { id: 'pawn_wars', generate(ctx): GeneratorResult {
  const rng = ctx.rng.fork(this.id); const accepted = []; const rejected = []; const seen = new Set<string>(); let attempts = 0;
  while (accepted.length < ctx.maxPerGame && attempts++ < ctx.maxPerGame * 400) {
    const turn = rng.pick(['w', 'b'] as const); const edgeKing = (color: 'w' | 'b') => `${rng.pick(['a', 'b', 'g', 'h'])}${color === 'w' ? 1 + rng.int(2) : 7 + rng.int(2)}` as Square;
    const pieces = [{ square: edgeKing('w'), piece: 'K' }, { square: edgeKing('b'), piece: 'k' }]; const each = 2 + rng.int(3);
    for (const color of ['w', 'b'] as const) for (let i = 0; i < each; i += 1) pieces.push({ square: `${rng.pick([...FILES])}${color === 'w' ? 2 + rng.int(4) : 4 + rng.int(4)}` as Square, piece: color === 'w' ? 'P' : 'p' });
    const chess = safeChess(pieces, turn); if (!chess) continue; const ranks = rankMoves(chess, 4).filter((r) => r.move.piece === 'p'); if (ranks.length < 2 || ranks[0].score - ranks[1].score < 12) continue;
    const best = ranks[0]; const after = clone(chess); after.move(best.move); const delta = analyzePawnStructureDelta(chess, after, best.move); const beforeStructure = analyzePawnStructure(chess); const afterStructure = analyzePawnStructure(after);
    if (!delta.meaningful && !best.move.promotion) { rejected.push({ miniGameId: this.id, fen: chess.fen(), reason: 'no_passer_or_breakthrough_delta' }); continue; }
    const key = `${chess.fen().split(' ')[0]}:${best.move.from}${best.move.to}`; if (seen.has(key)) continue; seen.add(key); const alts = ranks.slice(1, 4).map((r) => ({ move: r.move, why: `${r.move.san} leaves the bounded race score ${best.score - r.score} points worse and does not match: ${delta.summary}.` }));
    const proof = { delta, beforePassers: beforeStructure.passedPawns, afterPassers: afterStructure.passedPawns, searchDepth: 4, bestScore: best.score, alternativeScores: ranks.slice(1, 4).map((r) => r.score), principalVariation: best.pv };
    const concept = delta.createdProtectedPasser ? 'protected_passer' : delta.createdOutsidePasser ? 'outside_passer' : delta.createdPassedPawn ? 'passed_pawn_creation' : best.move.captured ? 'breakthrough' : 'spare_tempo';
    const scenario = buildScenario({ miniGameId: this.id, seed: ctx.seed, generatorId: 'pawnWarsGenerator', sourceId: `procedural-${attempts}`, chess, move: best.move, alternatives: alts, concept, subConcept: best.move.captured ? 'decoy_capture_tree' : 'promotion_tempo', difficulty: difficultyFor(accepted.length), proof: proof as unknown as Record<string, unknown>, moveType: best.move.promotion ? 'promotion' : 'pawn_break', score: 90,
      short: `Choose the pawn move that changes the race.`, detailed: `${best.move.san} changes the pawn race because ${delta.summary}. Before the move the passers are ${beforeStructure.passedPawns.join(', ') || 'none'}; after it they are ${afterStructure.passedPawns.join(', ') || 'none'}. A four-ply capture search prefers the line ${best.pv.slice(0, 5).join(' ')}.`, coachNote: `Calculate forced captures and promotion tempi before pushing the pawn that looks fastest.`, transferPattern: `Breakthroughs work when every capture response creates a passer or loses the promotion race.` });
    if (scenario.validation.runtimeReady) accepted.push(scenario);
  }
  return { accepted, rejected };
} };
