import { scoreDailyMiniGameAttempt } from "./dailyMiniGameScoring";
import { advanceStaticMiniGame, buildStaticMiniGameCard, rankStaticMiniGameScenarios, selectStaticMiniGameScenario, type StaticMiniGameScenario } from "./staticMiniGameHelpers";
import type {
  DailyBlundrDifficulty,
  DailyMiniGameAdvanceAttempt,
  DailyMiniGameDefinition,
  DailyMiniGameGenerationContext,
  DailyMiniGameId,
  DailyMiniGameSkillId,
  DailyMiniGameState,
} from "./dailyMiniGameTypes";

export type StaticMiniGameDefinitionConfig = {
  id: DailyMiniGameId;
  title: string;
  summary: string;
  skillIds: readonly DailyMiniGameSkillId[];
  recommendedFor: readonly DailyBlundrDifficulty[];
  displayName?: string;
  shortDescription?: string;
  instructions?: string;
  estimatedSeconds?: number;
  tags?: readonly string[];
  canAppearInDailyBlundr?: boolean;
  canAppearInStandalonePractice?: boolean;
  selectionPriority?: number;
  difficultyWeight?: number;
  conceptIds?: readonly string[];
  buildPrompt: (scenario: StaticMiniGameScenario) => string;
  buildSummary?: (scenario: StaticMiniGameScenario) => string;
};

export function createStaticMiniGameDefinition(config: StaticMiniGameDefinitionConfig, scenarios: readonly StaticMiniGameScenario[]): DailyMiniGameDefinition {
  const scenarioById = new Map(scenarios.map((scenario) => [scenario.scenarioId, scenario] as const));
  const scenarioList = [...scenarios];

  return {
    id: config.id,
    title: config.title,
    summary: config.summary,
    displayName: config.displayName ?? config.title,
    shortDescription: config.shortDescription ?? config.summary,
    skillIds: [...config.skillIds],
    recommendedFor: [...config.recommendedFor],
    instructions: config.instructions,
    estimatedSeconds: config.estimatedSeconds,
    tags: [...(config.tags ?? [])],
    canAppearInDailyBlundr: config.canAppearInDailyBlundr ?? true,
    canAppearInStandalonePractice: config.canAppearInStandalonePractice ?? true,
    selectionPriority: config.selectionPriority,
    generate(ctx: DailyMiniGameGenerationContext) {
      const orderedScenarios = rankStaticMiniGameScenarios(ctx, config.id, scenarioList);
      const fallbackScenario = selectStaticMiniGameScenario(ctx, config.id, scenarioList);
      for (const scenario of orderedScenarios.length ? orderedScenarios : [fallbackScenario]) {
        const generated = buildStaticMiniGameCard({
          miniGameId: config.id,
          title: config.title,
          summary: config.buildSummary?.(scenario) ?? config.summary,
          prompt: config.buildPrompt(scenario),
          scenario,
          ctx,
          skillIds: config.skillIds,
          conceptIds: config.conceptIds,
          tags: config.tags,
          difficultyWeight: config.difficultyWeight,
          selectionPriority: config.selectionPriority,
          displayName: config.displayName,
          shortDescription: config.shortDescription,
          instructions: config.instructions,
          estimatedSeconds: config.estimatedSeconds,
          canAppearInDailyBlundr: config.canAppearInDailyBlundr,
          canAppearInStandalonePractice: config.canAppearInStandalonePractice,
          moveLimit: scenario.moveLimit,
          bestKnownScore: scenario.bestKnownMoves,
        });
        if (generated?.card) {
          return generated.card;
        }
      }
      return null;
    },
    scoreAttempt: (args) => scoreDailyMiniGameAttempt(args),
    advance(state: DailyMiniGameState, attempt: DailyMiniGameAdvanceAttempt) {
      const scenario = scenarioById.get(state.scenarioId ?? "") ?? scenarioList[0];
      if (!scenario) {
        return {
          state,
          completed: Boolean(state.completed),
          won: Boolean(state.won),
          legal: false,
          reason: "missing_scenario",
          attemptedMoveUci: attempt.uci,
          attemptedMoveSan: attempt.san,
          moveCount: state.plyCount,
          illegalMoveCount: 1,
          scoreInput: {
            card: null as never,
            completed: Boolean(state.completed),
            won: Boolean(state.won),
            moveCount: state.plyCount,
            moveLimit: state.moveLimit,
            bestKnownMoves: state.bestKnownScore ?? null,
            illegalMoveCount: 1,
            blocked: false,
            perfectPath: false,
            objectiveCount: 1,
            objectivesCompleted: 0,
            reason: "missing_scenario",
          },
        };
      }
      return advanceStaticMiniGame(state, attempt, scenario);
    },
  };
}
