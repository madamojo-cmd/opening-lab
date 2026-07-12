import type { Move } from 'chess.js';
import type { GeneratorResult, MiniGameGenerator } from '../types';
import { buildKeySquareProof, keySquareProofPasses } from '../analysis/squareControlAnalysis';
import { buildScenario, difficultyFor } from '../scenarioBuilder';
import { alternatives, candidatePositions } from './strategicScannerUtils';

export const keySquareConquestGenerator: MiniGameGenerator = { id: 'key_square_conquest', generate(ctx): GeneratorResult {
  const accepted = []; const rejected = []; const seen = new Set<string>();
  for (const { chess, frame } of candidatePositions(ctx, this.id)) {
    for (const move of chess.moves({ verbose: true }) as Move[]) {
      if (move.captured || /[+#]/.test(move.san) || !['n', 'r', 'k'].includes(move.piece)) continue;
      const proof = buildKeySquareProof(chess, move); if (!keySquareProofPasses(proof)) { rejected.push({ miniGameId: this.id, fen: chess.fen(), moveUci: `${move.from}${move.to}`, reason: 'square_proof_failed' }); continue; }
      const key = `${proof.squareType}:${move.to}:${chess.fen().split(' ')[0]}`; if (seen.has(key)) continue; seen.add(key);
      const alts = alternatives(chess, move, `durable occupation of ${move.to}`);
      const scenario = buildScenario({ miniGameId: this.id, seed: ctx.seed, generatorId: 'keySquareConquestGenerator', sourceId: frame.sourceId, sourceKind: 'opening_frame', chess, move, alternatives: alts,
        concept: proof.squareType, subConcept: `durable_${proof.squareType}`, difficulty: difficultyFor(accepted.length), proof: proof as unknown as Record<string, unknown>, moveType: 'piece_improvement', openingId: frame.openingId,
        short: `Claim the durable square ${move.to}.`, detailed: `${move.san} claims ${move.to} as a ${proof.squareType.replaceAll('_', ' ')}. It has ${proof.friendlySupporters.length} friendly supporter(s), ${proof.enemyAttackers.length} current enemy attacker(s), and no immediate pawn chase. From ${move.to}, the piece reaches ${proof.usefulTargetsFromSquare.slice(0, 4).join(', ')}.`, coachNote: `Check pawn chasers before occupying an attractive square. A real outpost survives and creates useful targets.`, transferPattern: `Durable squares are defined by support, lack of pawn challenge, and useful follow-up targets.` });
      if (scenario.validation.runtimeReady && alts.length) accepted.push(scenario); else rejected.push({ miniGameId: this.id, fen: chess.fen(), reason: 'scenario_quality_failed' }); if (accepted.length >= ctx.maxPerGame) return { accepted, rejected };
    }
  }
  return { accepted, rejected };
} };
