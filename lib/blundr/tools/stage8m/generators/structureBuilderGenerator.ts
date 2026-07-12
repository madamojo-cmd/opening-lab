import { Chess } from 'chess.js';
import type { Move } from 'chess.js';
import type { GeneratorResult, MiniGameGenerator } from '../types';
import { analyzePawnStructureDelta } from '../analysis/pawnStructureAnalysis';
import { clone } from '../analysis/chessUtils';
import { buildScenario, difficultyFor } from '../scenarioBuilder';
import { alternatives, candidatePositions } from './strategicScannerUtils';

export const structureBuilderGenerator: MiniGameGenerator = { id: 'structure_builder', generate(ctx): GeneratorResult {
  const accepted = []; const rejected = []; const seen = new Set<string>();
  for (const { chess, frame } of candidatePositions(ctx, this.id)) for (const move of chess.moves({ verbose: true }) as Move[]) {
    if (move.piece !== 'p' || /[+#]/.test(move.san)) continue; const after = clone(chess); after.move(move); const delta = analyzePawnStructureDelta(chess, after, move);
    if (!delta.meaningful) { rejected.push({ miniGameId: this.id, fen: chess.fen(), moveUci: `${move.from}${move.to}`, reason: 'no_meaningful_structure_delta' }); continue; }
    const concept = delta.createdProtectedPasser ? 'protected_passer_creation' : delta.createdOutsidePasser ? 'outside_passer_creation' : delta.createdPassedPawn ? 'passed_pawn_creation' : delta.removedBlocker ? 'locked_center_break' : 'pawn_break';
    const key = `${concept}:${delta.summary}:${chess.fen().split(' ')[0]}`; if (seen.has(key)) continue; seen.add(key); const alts = alternatives(chess, move, delta.summary);
    const scenario = buildScenario({ miniGameId: this.id, seed: ctx.seed, generatorId: 'structureBuilderGenerator', sourceId: frame.sourceId, sourceKind: 'opening_frame', chess, move, alternatives: alts, concept, subConcept: concept, difficulty: difficultyFor(accepted.length), proof: delta as unknown as Record<string, unknown>, moveType: 'pawn_break', openingId: frame.openingId,
      short: `Change the pawn structure with ${move.san}.`, detailed: `${move.san} is structural because it changes the position before and after: ${delta.summary}. The move changes the ${delta.changedFiles.join(' and ')} file(s), controls ${delta.improvedSquares.join(', ')}, and creates weaknesses on ${delta.newlyWeakSquares.join(', ')}.`, coachNote: `Judge a pawn move by the files, diagonals, passers, and weak squares it leaves behind.`, transferPattern: `A purposeful pawn move produces a measurable structural change, not merely space.` });
    if (scenario.validation.runtimeReady && alts.length) accepted.push(scenario); if (accepted.length >= ctx.maxPerGame) return { accepted, rejected };
  }
  return { accepted, rejected };
} };
