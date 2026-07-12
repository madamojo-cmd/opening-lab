import type { Stage8MScenario } from "../../../tools/stage8m/types";

export type ProductionMiniGameId =
  | "tactic_shots"
  | "knight_gymnasium"
  | "key_square_conquest"
  | "structure_builder"
  | "imbalance_arena"
  | "technique_lab"
  | "king_race"
  | "pawn_wars";

export type RuntimeMiniGameScenario = {
  id: string;
  miniGameId: ProductionMiniGameId;
  source: "stage8m_generated" | "lichess_mined";
  difficultyBand: string;
  concept: string;
  fen: string;
  sideToMove: "w" | "b";
  orientation: "white" | "black";
  lockedOrientation: true;
  prompt: { title: string; instruction: string };
  solution: { primaryMoveUci: string; acceptedMoves: string[]; line: string[] };
  explanation?: { short: string; detailed: string; coachNote: string };
  quality: { runtimeReady: true; score: number; noveltyKey: string };
};

type LichessTemplate = {
  miniGameId: ProductionMiniGameId;
  difficultyBand: string;
  dailyReady: boolean;
  noveltyKey: string;
  scenarioDraft: {
    scenarioId: string;
    board: { fen: string; sideToMove: "w" | "b"; orientation: "white" | "black" };
    prompt: { title: string; instruction: string };
    solution: { primaryMoveUci: string; acceptedMoves: readonly string[]; line: readonly string[] };
    pedagogy: { concept: string; qualityScore: number };
  };
};

export const MINIGAME_CONTENT_COUNTS: Readonly<Record<ProductionMiniGameId, number>> = {
  tactic_shots: 432,
  knight_gymnasium: 471,
  key_square_conquest: 30,
  structure_builder: 30,
  imbalance_arena: 30,
  technique_lab: 30,
  king_race: 30,
  pawn_wars: 30,
};

function fromLichess(template: LichessTemplate): RuntimeMiniGameScenario {
  const draft = template.scenarioDraft;
  return {
    id: draft.scenarioId,
    miniGameId: template.miniGameId,
    source: "lichess_mined",
    difficultyBand: template.difficultyBand,
    concept: draft.pedagogy.concept,
    fen: draft.board.fen,
    sideToMove: draft.board.sideToMove,
    orientation: draft.board.orientation,
    lockedOrientation: true,
    prompt: { title: draft.prompt.title, instruction: draft.prompt.instruction },
    solution: {
      primaryMoveUci: draft.solution.primaryMoveUci,
      acceptedMoves: [...draft.solution.acceptedMoves],
      line: [...draft.solution.line],
    },
    quality: { runtimeReady: true, score: draft.pedagogy.qualityScore, noveltyKey: template.noveltyKey },
  };
}

function fromStage8M(scenario: Stage8MScenario): RuntimeMiniGameScenario {
  return {
    id: scenario.id,
    miniGameId: scenario.miniGameId,
    source: "stage8m_generated",
    difficultyBand: scenario.pedagogy.difficultyBand,
    concept: scenario.pedagogy.concept,
    fen: scenario.board.fen,
    sideToMove: scenario.board.sideToMove,
    orientation: scenario.board.orientation,
    lockedOrientation: true,
    prompt: {
      title: scenario.board.sideToMove === "w" ? "White to move." : "Black to move.",
      instruction: scenario.pedagogy.prompt,
    },
    solution: {
      primaryMoveUci: scenario.solution.primaryMoveUci,
      acceptedMoves: [scenario.solution.primaryMoveUci],
      line: [scenario.solution.primaryMoveUci],
    },
    explanation: {
      short: scenario.pedagogy.explanation.short,
      detailed: scenario.pedagogy.explanation.detailed,
      coachNote: scenario.pedagogy.explanation.coachNote,
    },
    quality: { runtimeReady: true, score: scenario.quality.score, noveltyKey: scenario.quality.noveltyKey },
  };
}

type ScenarioLoader = () => Promise<RuntimeMiniGameScenario[]>;

const loaders: Record<ProductionMiniGameId, ScenarioLoader> = {
  tactic_shots: async () => {
    const module = await import("../templates/tactic_shotsLichessTemplates");
    return module.TACTIC_SHOTS_LICHESS_TEMPLATES.filter((row) => row.dailyReady).map(fromLichess);
  },
  knight_gymnasium: async () => {
    const module = await import("../templates/knight_gymnasiumLichessTemplates");
    return module.KNIGHT_GYMNASIUM_LICHESS_TEMPLATES.filter((row) => row.dailyReady).map(fromLichess);
  },
  key_square_conquest: async () => {
    const module = await import("./stage8m/key_square_conquest.generated");
    return module.STAGE8M_KEY_SQUARE_CONQUEST_SCENARIOS.filter((row) => row.validation.runtimeReady).map(fromStage8M);
  },
  structure_builder: async () => {
    const module = await import("./stage8m/structure_builder.generated");
    return module.STAGE8M_STRUCTURE_BUILDER_SCENARIOS.filter((row) => row.validation.runtimeReady).map(fromStage8M);
  },
  imbalance_arena: async () => {
    const module = await import("./stage8m/imbalance_arena.generated");
    return module.STAGE8M_IMBALANCE_ARENA_SCENARIOS.filter((row) => row.validation.runtimeReady).map(fromStage8M);
  },
  technique_lab: async () => {
    const module = await import("./stage8m/technique_lab.generated");
    return module.STAGE8M_TECHNIQUE_LAB_SCENARIOS.filter((row) => row.validation.runtimeReady).map(fromStage8M);
  },
  king_race: async () => {
    const module = await import("./stage8m/king_race.generated");
    return module.STAGE8M_KING_RACE_SCENARIOS.filter((row) => row.validation.runtimeReady).map(fromStage8M);
  },
  pawn_wars: async () => {
    const module = await import("./stage8m/pawn_wars.generated");
    return module.STAGE8M_PAWN_WARS_SCENARIOS.filter((row) => row.validation.runtimeReady).map(fromStage8M);
  },
};

const PRODUCTION_MINIGAME_IDS: readonly ProductionMiniGameId[] = [
  "tactic_shots",
  "knight_gymnasium",
  "key_square_conquest",
  "structure_builder",
  "imbalance_arena",
  "technique_lab",
  "king_race",
  "pawn_wars",
];

const poolCache = new Map<ProductionMiniGameId, Promise<RuntimeMiniGameScenario[]>>();

export function loadProductionScenarios(miniGameId: ProductionMiniGameId): Promise<RuntimeMiniGameScenario[]> {
  const existing = poolCache.get(miniGameId);
  if (existing) return existing;
  const pending = loaders[miniGameId]().then((rows) => {
    if (!rows.length) throw new Error(`No runtime-ready scenarios for ${miniGameId}`);
    return rows;
  }).catch((error: unknown) => {
    poolCache.delete(miniGameId);
    throw error;
  });
  poolCache.set(miniGameId, pending);
  return pending;
}

export function clearProductionScenarioPool(miniGameId?: ProductionMiniGameId): void {
  if (miniGameId) poolCache.delete(miniGameId);
  else poolCache.clear();
}

function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

export async function selectProductionScenario(input: {
  miniGameId: ProductionMiniGameId;
  selectionKey: string;
  difficultyBand?: string;
  recentlyPlayedIds?: readonly string[];
}): Promise<RuntimeMiniGameScenario> {
  const all = await loadProductionScenarios(input.miniGameId);
  const recent = new Set(input.recentlyPlayedIds ?? []);
  const difficultyPool = input.difficultyBand ? all.filter((row) => row.difficultyBand === input.difficultyBand) : all;
  const pool = (difficultyPool.length ? difficultyPool : all).filter((row) => !recent.has(row.id));
  const usablePool = pool.length ? pool : difficultyPool.length ? difficultyPool : all;
  return usablePool[hash(`${input.miniGameId}:${input.selectionKey}`) % usablePool.length];
}

export function getProductionScenarioLoaderIds(): ProductionMiniGameId[] {
  return [...PRODUCTION_MINIGAME_IDS];
}
