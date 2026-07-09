import { scoreDailyMiniGameAttempt } from "../dailyMiniGameScoring";
import { normalizeText } from "../miniGameUtils";
import { buildProceduralMiniGameCard, buildProceduralAdvanceResult } from "./miniGameLegacyAdapter";
import { buildGeneratedMiniGameScenarioContract } from "./miniGameLegacyAdapter";
import { validateGeneratedMiniGameScenario } from "./miniGameScenarioValidation";
import { buildGeneratedScenarioKey, rankScenarioKeysByNovelty } from "./miniGameScenarioNovelty";
import {
  mapGeneratedDifficultyToLegacyDifficulty,
  mapLegacyDifficultyToGeneratedDifficulty,
  type GeneratedMiniGameScenario,
  type MiniGameGenerationCandidate,
  type MiniGameGenerationInput,
  type ProceduralMiniGameGenerator,
  type GeneratedMiniGameDifficulty,
} from "./miniGameGenerationTypes";
import type { DailyBlundrMiniGameCard, DailyMiniGameAdvanceAttempt, DailyMiniGameDefinition, DailyMiniGameGenerationContext, DailyMiniGameId, DailyMiniGameState, DailyMiniGameSource } from "../dailyMiniGameTypes";
import { kingRaceGenerator } from "./generators/kingRaceGenerator";
import { knightGymnasiumGenerator } from "./generators/knightGymnasiumGenerator";
import { pawnWarsGenerator } from "./generators/pawnWarsGenerator";
import { tacticShotsGenerator } from "./generators/tacticShotsGenerator";
import { keySquareConquestGenerator } from "./generators/keySquareConquestGenerator";
import { structureBuilderGenerator } from "./generators/structureBuilderGenerator";
import { imbalanceArenaGenerator } from "./generators/imbalanceArenaGenerator";
import { techniqueLabGenerator } from "./generators/techniqueLabGenerator";
import { resolveSeedParts } from "./miniGameSeededRandom";

const GENERATION_ATTEMPT_LIMIT = 16;

export const GENERATED_MINI_GAME_GENERATORS: readonly ProceduralMiniGameGenerator[] = [
  kingRaceGenerator,
  knightGymnasiumGenerator,
  pawnWarsGenerator,
  tacticShotsGenerator,
  keySquareConquestGenerator,
  structureBuilderGenerator,
  imbalanceArenaGenerator,
  techniqueLabGenerator,
] as const;

export const GENERATED_MINI_GAME_REGISTRY: readonly ProceduralMiniGameGenerator[] = GENERATED_MINI_GAME_GENERATORS;

export const GENERATED_MINI_GAME_REGISTRY_BY_ID = new Map(
  GENERATED_MINI_GAME_GENERATORS.map((generator) => [generator.id, generator] as const),
);

type ProceduralSelection = {
  candidate: MiniGameGenerationCandidate;
  seed: string | number;
  usedStaticFallback: boolean;
};

function normalizeKey(value: string): string {
  return normalizeText(value).toLowerCase();
}

function toGeneratedInput(input: MiniGameGenerationInput): MiniGameGenerationInput {
  return {
    ...input,
    source: input.source ?? "daily_deck",
    seed: input.seed ?? "",
    recentScenarioKeys: input.recentScenarioKeys ?? [],
    userBoardPreference: input.userBoardPreference ?? null,
  };
}

function toLegacyGenerationContext(
  input: MiniGameGenerationInput,
  seed: string | number,
  difficulty: GeneratedMiniGameDifficulty,
): DailyMiniGameGenerationContext {
  return {
    dateKey: input.dateKey,
    now: new Date().toISOString(),
    mastery: null,
    difficulty: mapGeneratedDifficultyToLegacyDifficulty(difficulty),
    currentMastery: 0,
    confidence: 0,
    dueReviewCount: 0,
    selectedReviewCount: 0,
    recentMiniGameIds: [],
    recentFenKeys: [],
    sessionMiniGameIds: [],
    source: input.source ?? "daily_deck",
    seed,
    userIdOrLocalId: input.userId ?? null,
    recentScenarioKeys: input.recentScenarioKeys ?? [],
    boardPreferences: input.userBoardPreference ?? null,
    deckId: null,
    miniGameId: input.miniGameId,
  };
}

function scenarioToCandidate(
  scenario: GeneratedMiniGameScenario,
  generator: ProceduralMiniGameGenerator,
): MiniGameGenerationCandidate {
  const routeLength = Math.max(1, (scenario.overlays.route?.length ?? 2) - 1);
  const objectiveScore = scenario.solution.verification.objectiveScore ?? 0;
  return {
    miniGameId: scenario.miniGameId,
    source: scenario.source,
    seed: scenario.metadata.seed,
    family: scenario.family,
    motif: scenario.motif ?? scenario.family,
    difficulty: scenario.difficulty,
    estimatedTimeSeconds: scenario.estimatedTimeSeconds,
    board: scenario.board,
    prompt: scenario.prompt,
    instruction: scenario.instruction,
    goal: scenario.goal,
    explanation: scenario.explanation,
    solution: {
      primaryMoveUci: scenario.solution.primaryMoveUci,
      acceptedMoves: [...scenario.solution.acceptedMoves],
      from: scenario.solution.from,
      to: scenario.solution.to,
      promotion: scenario.solution.promotion,
      verification: {
        verified: true,
        verifier: scenario.solution.verification.verifier,
        objectiveScore,
        notes: [...(scenario.solution.verification.notes ?? [])],
      },
    },
    overlays: scenario.overlays,
    conceptTags: [...scenario.conceptTags],
    analysis: {
      complexity: scenario.difficulty === "easy" ? 24 : scenario.difficulty === "medium" ? 46 : 68,
      decoyCount: Math.max(0, (scenario.overlays.targetSquares?.length ?? 0) - 1),
      blockerCount: scenario.overlays.dangerSquares?.length ?? 0,
      routeLength,
      forcing: objectiveScore >= 80,
      materialBalance: 0,
      candidateCount: Math.max(1, scenario.solution.acceptedMoves.length),
      note: generator.id,
    },
    transformIds: [...(scenario.metadata.transformIds ?? [])],
    templateId: scenario.metadata.templateId,
    scaffoldId: scenario.metadata.scaffoldId,
  };
}

function buildCandidateKey(candidate: MiniGameGenerationCandidate, source: DailyMiniGameSource): string {
  return buildGeneratedScenarioKey({
    miniGameId: candidate.miniGameId,
    source,
    family: candidate.family,
    motif: candidate.motif,
    fen: candidate.board.fen,
    primaryMoveUci: candidate.solution.primaryMoveUci,
    targetSquares: candidate.overlays.targetSquares ?? candidate.overlays.keySquares ?? [],
    difficulty: candidate.difficulty,
    orientation: candidate.board.orientation,
  });
}

function generateSelection(input: MiniGameGenerationInput): ProceduralSelection | null {
  const generator = GENERATED_MINI_GAME_REGISTRY_BY_ID.get(input.miniGameId);
  if (!generator) return null;

  const source = input.source ?? "daily_deck";
  const recentScenarioKeys = input.recentScenarioKeys ?? [];

  const validCandidates: Array<{ candidate: MiniGameGenerationCandidate; key: string; seed: string | number; index: number }> = [];
  const seenKeys = new Set<string>();
  const baseSeed = normalizeText(input.seed) || resolveSeedParts([input.dateKey, input.miniGameId, source, input.userId ?? "local"]);

  for (let attempt = 0; attempt < GENERATION_ATTEMPT_LIMIT; attempt += 1) {
    const seed = attempt === 0 ? baseSeed : resolveSeedParts([baseSeed, input.miniGameId, source, input.difficulty, input.dateKey, input.userId ?? "local", attempt]);
    const attemptInput: MiniGameGenerationInput = {
      ...toGeneratedInput(input),
      source,
      seed,
    };
    const generated = generator.generateCandidate(attemptInput);
    if (!generated) {
      continue;
    }

    const candidateDifficulty = generator.classifyDifficulty(generated);
    const candidate = candidateDifficulty === generated.difficulty ? generated : { ...generated, difficulty: candidateDifficulty };
    const objective = generator.validateObjective(candidate);
    if (!objective.passed) {
      continue;
    }
    const verification = generator.verifySolution(candidate);
    if (!verification.verified) {
      continue;
    }

    const key = buildCandidateKey(candidate, source);
    if (seenKeys.has(key)) {
      continue;
    }

    try {
      const context = toLegacyGenerationContext(attemptInput, seed, candidate.difficulty);
      const scenario = buildGeneratedMiniGameScenarioContract(candidate, context, generator, false);
      const validation = validateGeneratedMiniGameScenario(scenario);
      if (!validation.valid) {
        continue;
      }
      seenKeys.add(key);
      validCandidates.push({ candidate, key, seed, index: validCandidates.length });
    } catch {
      continue;
    }
  }

  if (validCandidates.length > 0) {
    const rankedKeys = rankScenarioKeysByNovelty({
      candidateKeys: validCandidates.map((entry, index) => ({ key: entry.key, index })),
      recentScenarioKeys,
    });
    const selectedKey = rankedKeys[0] ?? validCandidates[0]?.key ?? null;
    const selected = validCandidates.find((entry) => entry.key === selectedKey) ?? validCandidates[0];
    if (selected) {
      return {
        candidate: selected.candidate,
        seed: selected.seed,
        usedStaticFallback: false,
      };
    }
  }

  const fallbackScenario = generator.buildFallbackScenario({
    ...toGeneratedInput(input),
    source,
    seed: baseSeed,
  });
  if (!fallbackScenario) {
    return null;
  }

  const fallbackValidation = validateGeneratedMiniGameScenario(fallbackScenario);
  if (!fallbackValidation.valid) {
    return null;
  }

  return {
    candidate: scenarioToCandidate(fallbackScenario, generator),
    seed: fallbackScenario.metadata.seed ?? baseSeed,
    usedStaticFallback: true,
  };
}

export function getGeneratedMiniGameGenerator(miniGameId: DailyMiniGameId): ProceduralMiniGameGenerator | null {
  return GENERATED_MINI_GAME_REGISTRY_BY_ID.get(miniGameId) ?? null;
}

export function generateMiniGameScenario(input: MiniGameGenerationInput): GeneratedMiniGameScenario | null {
  const selection = generateSelection(input);
  if (!selection) {
    return null;
  }

  const generator = getGeneratedMiniGameGenerator(input.miniGameId);
  if (!generator) {
    return null;
  }

  const context = toLegacyGenerationContext(
    {
      ...toGeneratedInput(input),
      source: input.source ?? "daily_deck",
      seed: selection.seed,
    },
    selection.seed,
    selection.candidate.difficulty,
  );

  try {
    return buildGeneratedMiniGameScenarioContract(selection.candidate, context, generator, selection.usedStaticFallback);
  } catch {
    return null;
  }
}

export function buildProceduralMiniGameDefinition(generator: ProceduralMiniGameGenerator): DailyMiniGameDefinition {
  return {
    id: generator.id,
    title: generator.title,
    summary: generator.summary,
    displayName: generator.displayName,
    shortDescription: generator.shortDescription,
    skillIds: [...generator.skillIds],
    recommendedFor: ["intro", "beginner", "early_intermediate", "intermediate", "advanced", "expert"] as DailyBlundrDifficulty[],
    instructions: generator.instructions,
    estimatedSeconds: generator.estimatedSeconds,
    tags: generator.tags ? [...generator.tags] : [],
    canAppearInDailyBlundr: generator.canAppearInDailyBlundr ?? true,
    canAppearInStandalonePractice: generator.canAppearInStandalonePractice ?? true,
    selectionPriority: generator.selectionPriority,
    generate(ctx: DailyMiniGameGenerationContext): DailyBlundrMiniGameCard | null {
      const selection = generateSelection({
        miniGameId: generator.id,
        seed: ctx.seed ?? ctx.dateKey,
        difficulty: mapLegacyDifficultyToGeneratedDifficulty(ctx.difficulty),
        source: ctx.source ?? "daily_deck",
        userBoardPreference: ctx.boardPreferences ?? null,
        recentScenarioKeys: ctx.recentScenarioKeys ?? [],
        dateKey: ctx.dateKey,
        userId: ctx.userIdOrLocalId ?? null,
      });
      if (!selection) {
        return null;
      }

      const legacyContext: DailyMiniGameGenerationContext = {
        ...ctx,
        source: ctx.source ?? "daily_deck",
        seed: selection.seed,
        difficulty: mapGeneratedDifficultyToLegacyDifficulty(selection.candidate.difficulty),
      };
      const bundle = buildProceduralMiniGameCard(selection.candidate, legacyContext, generator, selection.usedStaticFallback);
      return bundle.card as DailyBlundrMiniGameCard;
    },
    scoreAttempt: (args) => scoreDailyMiniGameAttempt(args),
    advance(state: DailyMiniGameState, attempt: DailyMiniGameAdvanceAttempt) {
      return buildProceduralAdvanceResult(state, attempt);
    },
  };
}

export const GENERATED_MINI_GAME_DEFINITIONS: DailyMiniGameDefinition[] = GENERATED_MINI_GAME_GENERATORS.map((generator) =>
  buildProceduralMiniGameDefinition(generator),
);
