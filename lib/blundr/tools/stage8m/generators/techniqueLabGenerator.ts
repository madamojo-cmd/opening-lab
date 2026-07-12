import type { GeneratorResult, MiniGameGenerator, Square } from '../types';
import { FILES, clone, distance, pieceSquares, xy } from '../analysis/chessUtils';
import { rankMoves } from '../analysis/boundedSearch';
import { analyzeTechnique } from '../analysis/endgameTechniqueAnalysis';
import { buildScenario, difficultyFor } from '../scenarioBuilder';
import { safeChess } from './proceduralPosition';

export const techniqueLabGenerator: MiniGameGenerator = { id: 'technique_lab', generate(ctx): GeneratorResult {
  const rng = ctx.rng.fork(this.id); const accepted = []; const rejected = []; const seen = new Set<string>(); let attempts = 0;
  while (accepted.length < ctx.maxPerGame && attempts++ < ctx.maxPerGame * 350) {
    const kingsOnly = rng() < 0.8; const turn = rng.pick(['w', 'b'] as const); const pawnColor = rng.pick(['w', 'b'] as const); const fileIndex = 1 + rng.int(6); const file = FILES[fileIndex]; const rank = pawnColor === 'w' ? 4 + rng.int(3) : 3 + rng.int(3);
    const square = () => `${rng.pick([...FILES])}${1 + rng.int(8)}` as Square; const pieces = [{ square: square(), piece: 'K' }, { square: square(), piece: 'k' }, { square: `${file}${rank}` as Square, piece: pawnColor === 'w' ? 'P' : 'p' }];
    if (!kingsOnly) { pieces.push({ square: square(), piece: pawnColor === 'w' ? 'R' : 'r' }); pieces.push({ square: square(), piece: pawnColor === 'w' ? 'r' : 'R' }); }
    const chess = safeChess(pieces, turn); if (!chess) continue; const ranks = rankMoves(chess, 4); if (ranks.length < 2 || ranks[0].score - ranks[1].score < 8) continue; const best = ranks[0];
    const after = clone(chess); after.move(best.move); const ownKingBefore = pieceSquares(chess, turn, 'k')[0]; const ownKingAfter = pieceSquares(after, turn, 'k')[0]; const enemyKingAfter = pieceSquares(after, turn === 'w' ? 'b' : 'w', 'k')[0]; const ownPawnAfter = pieceSquares(after, turn, 'p')[0]; let family: string | undefined;
    if (best.move.piece === 'k' && distance(ownKingAfter, enemyKingAfter) === 2) family = 'opposition';
    else if (best.move.piece === 'k' && ownPawnAfter && distance(ownKingAfter, ownPawnAfter) < distance(ownKingBefore, ownPawnAfter)) family = 'active_king';
    else if (best.move.piece === 'r' && ownPawnAfter) { const [, rookRank] = xy(best.move.to); const [, pawnRank] = xy(ownPawnAfter); const behind = best.move.to[0] === ownPawnAfter[0] && (turn === 'w' ? rookRank < pawnRank : rookRank > pawnRank); if (behind) family = 'rook_behind_passer'; else { const [rf, rr] = xy(best.move.to); const [kf, kr] = xy(enemyKingAfter); const [pf, pr] = xy(ownPawnAfter); if ((rf === kf && Math.abs(rr - kr) < Math.abs(pr - kr)) || (rr === kr && Math.abs(rf - kf) < Math.abs(pf - kf))) family = 'king_cutoff'; } }
    if (!family) { rejected.push({ miniGameId: this.id, fen: chess.fen(), reason: 'no_named_technique_geometry' }); continue; }
    const proof = analyzeTechnique(chess, best.move, family, 4); const key = `${family}:${chess.fen().split(' ')[0]}:${best.move.from}${best.move.to}`; if (seen.has(key)) continue; seen.add(key);
    const alts = ranks.slice(1, 4).map((r) => ({ move: r.move, why: `${r.move.san} scores ${best.score - r.score} lower in the bounded conversion tree and does not execute the ${family.replaceAll('_', ' ')} rule as directly.` }));
    const scenario = buildScenario({ miniGameId: this.id, seed: ctx.seed, generatorId: 'techniqueLabGenerator', sourceId: `${family}-${attempts}`, sourceKind: 'curated', chess, move: best.move, alternatives: alts, concept: family, subConcept: 'named_endgame_method', difficulty: difficultyFor(accepted.length), proof: proof as unknown as Record<string, unknown>, moveType: 'endgame_technique', score: 89,
      short: `Apply the ${family.replaceAll('_', ' ')} technique.`, detailed: `${best.move.san} follows the rule: ${proof.ruleSentence} The relevant squares are ${proof.relevantSquares.join(', ')}. A ${proof.searchDepth}-ply verification scores it ${proof.bestScore}, compared with ${proof.nextBestScore} for the next legal plan, and checks ${proof.principalVariation.slice(0, 5).join(' ')}.`, coachNote: proof.ruleSentence, transferPattern: `Named endgame techniques are reusable geometries: recognize the piece placement, then execute the rule.` });
    if (scenario.validation.runtimeReady) accepted.push(scenario); else rejected.push({ miniGameId: this.id, fen: chess.fen(), reason: 'named_technique_quality_failed' });
  }
  return { accepted, rejected };
} };
