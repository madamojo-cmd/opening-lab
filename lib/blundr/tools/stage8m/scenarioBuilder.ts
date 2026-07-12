import { Chess } from 'chess.js';
import type { DifficultyBand, MiniGameId, Stage8MScenario } from './types';
import type { Move } from 'chess.js';
import { analyzeBoard } from './analysis/boardAnalysis';
import { stableId } from './rng';
import { uci } from './analysis/chessUtils';

export interface ScenarioInput { miniGameId: MiniGameId; seed: string; generatorId: string; sourceId: string; sourceKind?: Stage8MScenario['source']['kind']; chess: Chess; move: Move; alternatives: Array<{ move: Move; why: string }>; concept: string; subConcept: string; difficulty: DifficultyBand; proof: Record<string, unknown>; short: string; detailed: string; coachNote: string; transferPattern: string; moveType: Stage8MScenario['solution']['moveType']; score?: number; humanAuditRequired?: boolean; openingId?: string; }

export function buildScenario(input: ScenarioInput): Stage8MScenario {
  const board = analyzeBoard(input.chess); const primary = uci(input.move); const noveltyKey = `${input.miniGameId}|${input.chess.fen().split(' ').slice(0, 4).join(' ')}|${primary}|${input.concept}`;
  const explanationSpecific = input.detailed.includes(input.move.san.replace(/[+#]/g, '')) && /[a-h][1-8]|file|diagonal|pawn|king|knight|bishop|rook/i.test(input.detailed);
  const proofComplete = Object.keys(input.proof).length >= 4; const legalMove = board.legalMoves.some((m) => uci(m) === primary); const score = input.score ?? 82;
  const whyAlternativesFail = input.alternatives.map((a) => a.why);
  return { id: `stage8m-${input.miniGameId}-${stableId([input.seed, noveltyKey])}`, miniGameId: input.miniGameId, version: 'stage8m.v1',
    source: { kind: input.sourceKind ?? 'procedural', sourceId: input.sourceId, seed: input.seed, generatorId: input.generatorId, openingId: input.openingId },
    board: { fen: input.chess.fen(), sideToMove: input.chess.turn(), orientation: input.chess.turn() === 'w' ? 'white' : 'black', phase: board.phase, materialSignature: board.materialSignature, pieceCount: board.pieceCount, pawnCount: board.pawnCount },
    solution: { primaryMoveUci: primary, san: input.move.san, moveType: input.moveType, legalAlternatives: board.legalMoves.filter((m) => uci(m) !== primary).slice(0, 5).map(uci), plausibleWrongMoves: input.alternatives.slice(0, 3).map((a) => ({ moveUci: uci(a.move), san: a.move.san, reasonItIsTempting: `${a.move.san} is legal and pursues a nearby plan.`, whyItFails: a.why })) },
    pedagogy: { concept: input.concept, subConcept: input.subConcept, difficultyBand: input.difficulty, prompt: input.short, lessonObjective: input.short, transferPattern: input.transferPattern, explanation: { short: input.short, detailed: input.detailed, coachNote: input.coachNote, whyAlternativesFail }, proof: input.proof },
    validation: { legalFen: true, legalMove, proofComplete, explanationSpecific, engineReviewed: false, tablebaseReviewed: false, humanAuditRequired: input.humanAuditRequired ?? false, runtimeReady: legalMove && proofComplete && explanationSpecific && !(input.humanAuditRequired ?? false), rejectionReasons: [] },
    quality: { score, noveltyKey, densityScore: Math.min(100, 60 + Object.keys(input.proof).length * 4), clarityScore: explanationSpecific ? 88 : 45, pedagogyScore: input.alternatives.length ? 88 : 55, difficultyScore: ({ intro: 55, easy: 65, medium: 75, hard: 86, expert: 94 } as const)[input.difficulty] } };
}

export function difficultyFor(index: number): DifficultyBand { return (['intro', 'easy', 'medium', 'hard', 'expert'] as const)[index % 5]; }
