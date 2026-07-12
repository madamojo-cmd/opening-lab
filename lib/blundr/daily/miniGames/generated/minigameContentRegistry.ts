import { KNIGHT_GYMNASIUM_LICHESS_TEMPLATES } from '../templates/knight_gymnasiumLichessTemplates';
import { TACTIC_SHOTS_LICHESS_TEMPLATES } from '../templates/tactic_shotsLichessTemplates';
import { STAGE8M_KEY_SQUARE_CONQUEST_SCENARIOS } from './stage8m/key_square_conquest.generated';
import { STAGE8M_STRUCTURE_BUILDER_SCENARIOS } from './stage8m/structure_builder.generated';
import { STAGE8M_IMBALANCE_ARENA_SCENARIOS } from './stage8m/imbalance_arena.generated';
import { STAGE8M_TECHNIQUE_LAB_SCENARIOS } from './stage8m/technique_lab.generated';
import { STAGE8M_KING_RACE_SCENARIOS } from './stage8m/king_race.generated';
import { STAGE8M_PAWN_WARS_SCENARIOS } from './stage8m/pawn_wars.generated';
import type { Stage8MScenario } from '../../../tools/stage8m/types';

export type ProductionMiniGameId =
  | 'tactic_shots'
  | 'key_square_conquest'
  | 'structure_builder'
  | 'imbalance_arena'
  | 'technique_lab'
  | 'king_race'
  | 'knight_gymnasium'
  | 'pawn_wars';

export type UnifiedMiniGameScenario = {
  id: string;
  miniGameId: ProductionMiniGameId;
  source: 'stage8m_generated' | 'lichess_mined';
  difficultyBand: string;
  concept: string;
  fen: string;
  sideToMove: 'w' | 'b';
  orientation: 'white' | 'black';
  lockedOrientation: true;
  prompt: { title: string; instruction: string };
  solution: { primaryMoveUci: string; acceptedMoves: string[]; line: string[] };
  explanation?: { short: string; detailed: string; coachNote: string };
  quality: { runtimeReady: boolean; score: number; noveltyKey: string };
  raw: unknown;
};

type LichessTemplate = {
  miniGameId: string; difficultyBand: string; dailyReady: boolean; noveltyKey: string;
  scenarioDraft: {
    scenarioId: string; board: { fen: string; sideToMove: string; orientation: string };
    prompt: { title: string; instruction: string };
    solution: { primaryMoveUci: string; acceptedMoves: readonly string[]; line: readonly string[] };
    pedagogy: { concept: string; qualityScore: number };
  };
};

function fromLichess(template: LichessTemplate): UnifiedMiniGameScenario {
  const draft = template.scenarioDraft;
  return {
    id: draft.scenarioId,
    miniGameId: template.miniGameId as ProductionMiniGameId,
    source: 'lichess_mined',
    difficultyBand: template.difficultyBand,
    concept: draft.pedagogy.concept,
    fen: draft.board.fen,
    sideToMove: draft.board.sideToMove as 'w' | 'b',
    orientation: draft.board.orientation as 'white' | 'black',
    lockedOrientation: true,
    prompt: { title: draft.prompt.title, instruction: draft.prompt.instruction },
    solution: { primaryMoveUci: draft.solution.primaryMoveUci, acceptedMoves: [...draft.solution.acceptedMoves], line: [...draft.solution.line] },
    quality: { runtimeReady: template.dailyReady, score: draft.pedagogy.qualityScore, noveltyKey: template.noveltyKey },
    raw: template,
  };
}

function fromStage8M(scenario: Stage8MScenario): UnifiedMiniGameScenario {
  return {
    id: scenario.id,
    miniGameId: scenario.miniGameId as ProductionMiniGameId,
    source: 'stage8m_generated',
    difficultyBand: scenario.pedagogy.difficultyBand,
    concept: scenario.pedagogy.concept,
    fen: scenario.board.fen,
    sideToMove: scenario.board.sideToMove,
    orientation: scenario.board.orientation,
    lockedOrientation: true,
    prompt: { title: scenario.board.sideToMove === 'w' ? 'White to move.' : 'Black to move.', instruction: scenario.pedagogy.prompt },
    solution: { primaryMoveUci: scenario.solution.primaryMoveUci, acceptedMoves: [scenario.solution.primaryMoveUci], line: [scenario.solution.primaryMoveUci] },
    explanation: { short: scenario.pedagogy.explanation.short, detailed: scenario.pedagogy.explanation.detailed, coachNote: scenario.pedagogy.explanation.coachNote },
    quality: { runtimeReady: scenario.validation.runtimeReady, score: scenario.quality.score, noveltyKey: scenario.quality.noveltyKey },
    raw: scenario,
  };
}

const stage8m = {
  key_square_conquest: STAGE8M_KEY_SQUARE_CONQUEST_SCENARIOS,
  structure_builder: STAGE8M_STRUCTURE_BUILDER_SCENARIOS,
  imbalance_arena: STAGE8M_IMBALANCE_ARENA_SCENARIOS,
  technique_lab: STAGE8M_TECHNIQUE_LAB_SCENARIOS,
  king_race: STAGE8M_KING_RACE_SCENARIOS,
  pawn_wars: STAGE8M_PAWN_WARS_SCENARIOS,
} as const;

export const MINIGAME_CONTENT_COUNTS = {
  tactic_shots: TACTIC_SHOTS_LICHESS_TEMPLATES.filter((row) => row.dailyReady).length,
  knight_gymnasium: KNIGHT_GYMNASIUM_LICHESS_TEMPLATES.filter((row) => row.dailyReady).length,
  key_square_conquest: STAGE8M_KEY_SQUARE_CONQUEST_SCENARIOS.length,
  structure_builder: STAGE8M_STRUCTURE_BUILDER_SCENARIOS.length,
  imbalance_arena: STAGE8M_IMBALANCE_ARENA_SCENARIOS.length,
  technique_lab: STAGE8M_TECHNIQUE_LAB_SCENARIOS.length,
  king_race: STAGE8M_KING_RACE_SCENARIOS.length,
  pawn_wars: STAGE8M_PAWN_WARS_SCENARIOS.length,
} satisfies Record<ProductionMiniGameId, number>;

export function getProductionScenarios(miniGameId: ProductionMiniGameId): UnifiedMiniGameScenario[] {
  if (miniGameId === 'tactic_shots') return TACTIC_SHOTS_LICHESS_TEMPLATES.filter((row) => row.dailyReady).map((row) => fromLichess(row));
  if (miniGameId === 'knight_gymnasium') return KNIGHT_GYMNASIUM_LICHESS_TEMPLATES.filter((row) => row.dailyReady).map((row) => fromLichess(row));
  return stage8m[miniGameId].filter((row) => row.validation.runtimeReady).map((row) => fromStage8M(row));
}

function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

export function selectProductionScenario(input: {
  miniGameId: ProductionMiniGameId;
  selectionKey: string;
  difficultyBand?: string;
  recentlyPlayedIds?: readonly string[];
}): UnifiedMiniGameScenario {
  const recent = new Set(input.recentlyPlayedIds ?? []);
  const all = getProductionScenarios(input.miniGameId);
  const difficultyPool = input.difficultyBand ? all.filter((row) => row.difficultyBand === input.difficultyBand) : all;
  const preferred = difficultyPool.filter((row) => !recent.has(row.id));
  const pool = preferred.length ? preferred : difficultyPool.length ? difficultyPool : all;
  if (!pool.length) throw new Error(`No runtime-ready scenarios for ${input.miniGameId}`);
  return pool[hash(`${input.miniGameId}:${input.selectionKey}`) % pool.length];
}
