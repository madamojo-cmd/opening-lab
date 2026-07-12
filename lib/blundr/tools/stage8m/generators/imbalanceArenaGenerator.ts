import type { Move } from 'chess.js';
import type { GeneratorResult, MiniGameGenerator } from '../types';
import { buildImbalanceProof } from '../analysis/imbalanceAnalysis';
import { buildScenario, difficultyFor } from '../scenarioBuilder';
import { alternatives, candidatePositions } from './strategicScannerUtils';

export const imbalanceArenaGenerator: MiniGameGenerator = { id: 'imbalance_arena', generate(ctx): GeneratorResult {
  const accepted = []; const rejected = []; const seen = new Set<string>();
  for (const { chess, frame } of candidatePositions(ctx, this.id)) for (const move of chess.moves({ verbose: true }) as Move[]) {
    if (move.captured || /[+#]/.test(move.san) || !['n', 'b', 'r', 'q'].includes(move.piece)) continue; const proof = buildImbalanceProof(chess, move);
    if (!proof || proof.activityDelta < 1.5) { rejected.push({ miniGameId: this.id, fen: chess.fen(), moveUci: `${move.from}${move.to}`, reason: 'insufficient_durable_activity_delta' }); continue; }
    const key = `${proof.imbalanceType}:${move.from}${move.to}:${chess.fen().split(' ')[0]}`; if (seen.has(key)) continue; seen.add(key); const alts = alternatives(chess, move, proof.whyItMatters);
    const scenario = buildScenario({ miniGameId: this.id, seed: ctx.seed, generatorId: 'imbalanceArenaGenerator', sourceId: frame.sourceId, sourceKind: 'opening_frame', chess, move, alternatives: alts, concept: proof.imbalanceType, subConcept: 'activity_conversion', difficulty: difficultyFor(accepted.length), proof: proof as unknown as Record<string, unknown>, moveType: 'piece_improvement', openingId: frame.openingId,
      short: `Use the position's ${proof.imbalanceType.replaceAll('_', ' ')}.`, detailed: `${move.san} uses the ${proof.imbalanceType.replaceAll('_', ' ')} rather than chasing material. Activity rises from ${proof.beforeActivity} to ${proof.afterActivity}. The relevant pieces are ${proof.relevantPieces.join(', ')}, and the move creates pressure against ${proof.targets.join(', ') || 'the enemy position'}.`, coachNote: `An imbalance matters only when a move converts it into activity, targets, or restriction.`, transferPattern: `Identify what differs between the armies, then improve the piece that makes that difference useful.` });
    if (scenario.validation.runtimeReady && alts.length) accepted.push(scenario); if (accepted.length >= ctx.maxPerGame) return { accepted, rejected };
  }
  return { accepted, rejected };
} };
