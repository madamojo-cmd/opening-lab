import { scoreDailyMiniGameAttempt } from "../dailyMiniGameScoring";
import { normalizeText } from "../miniGameUtils";
import { buildProceduralMiniGameCard, buildProceduralAdvanceResult } from "./miniGameLegacyAdapter";
import { buildGeneratedScenarioKey, rankScenarioKeysByNovelty } from "./miniGameScenarioNovelty";
import {
  mapGeneratedDifficultyToLegacyDifficulty,
  mapLegacyDifficultyToGeneratedDifficulty,
  isGeneratedMiniGameDifficulty,
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
import { adjudicateMiniGameCandidate } from "./miniGameQualityGate";
import { buildMiniGameCandidateCacheKey, getCachedGeneratedMiniGameScenario, getCachedMiniGameCandidateResult, queueMiniGameCandidateResult } from "./miniGameEngineCache";
import { resolveMiniGameEngineThresholds } from "./miniGameEngineThresholds";

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

type ProceduralSelectionEntry = ProceduralSelection & {
  scenarioKey: string;
  engineKey: string;
};

function normalizeKey(value: string): string {
  return normalizeText(value).toLowerCase();
}

function toGeneratedInput(input: MiniGameGenerationInput): MiniGameGenerationInput {
  return {
    ...input,
    difficulty: isGeneratedMiniGameDifficulty(input.difficulty)
      ? input.difficulty
      : mapLegacyDifficultyToGeneratedDifficulty(input.difficulty),
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
    engineQuality: scenario.engineQuality ?? undefined,
  };
}

function buildScenarioKey(candidate: MiniGameGenerationCandidate, source: DailyMiniGameSource): string {
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

function buildEngineCandidateKey(candidate: MiniGameGenerationCandidate): string {
  const thresholds = resolveMiniGameEngineThresholds({
    miniGameId: candidate.miniGameId,
    source: candidate.source,
    family: candidate.family,
    motif: candidate.motif,
    fen: candidate.board.fen,
    sideToMove: candidate.board.sideToMove,
    primaryMoveUci: candidate.solution.primaryMoveUci,
    acceptedMoves: candidate.solution.acceptedMoves ?? [candidate.solution.primaryMoveUci],
    targetSquares: candidate.overlays.targetSquares ?? candidate.overlays.keySquares ?? [],
    orientation: candidate.board.orientation,
  });

  return buildMiniGameCandidateCacheKey({
    descriptor: {
      miniGameId: candidate.miniGameId,
      source: candidate.source,
      family: candidate.family,
      motif: candidate.motif,
      fen: candidate.board.fen,
      sideToMove: candidate.board.sideToMove,
      primaryMoveUci: candidate.solution.primaryMoveUci,
      acceptedMoves: candidate.solution.acceptedMoves ?? [candidate.solution.primaryMoveUci],
      targetSquares: candidate.overlays.targetSquares ?? candidate.overlays.keySquares ?? [],
      orientation: candidate.board.orientation,
    },
    depth: thresholds.depth,
    multipv: thresholds.multipv,
  });
}

function buildSelectionEntries(input: MiniGameGenerationInput): ProceduralSelectionEntry[] | null {
  const generator = GENERATED_MINI_GAME_REGISTRY_BY_ID.get(input.miniGameId);
  if (!generator) return null;

  const source = input.source ?? "daily_deck";
  const recentScenarioKeys = input.recentScenarioKeys ?? [];
  const normalizedDifficulty = isGeneratedMiniGameDifficulty(input.difficulty)
    ? input.difficulty
    : mapLegacyDifficultyToGeneratedDifficulty(input.difficulty);

  const validCandidates: ProceduralSelectionEntry[] = [];
  const seenKeys = new Set<string>();
  const baseSeed = normalizeText(input.seed) || resolveSeedParts([input.dateKey, input.miniGameId, source, input.userId ?? "local"]);

  for (let attempt = 0; attempt < GENERATION_ATTEMPT_LIMIT; attempt += 1) {
    const seed = attempt === 0 ? baseSeed : resolveSeedParts([baseSeed, input.miniGameId, source, normalizedDifficulty, input.dateKey, input.userId ?? "local", attempt]);
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

    const key = buildScenarioKey(candidate, source);
    if (seenKeys.has(key)) {
      continue;
    }

    seenKeys.add(key);
    validCandidates.push({ candidate, scenarioKey: key, engineKey: buildEngineCandidateKey(candidate), seed, usedStaticFallback: false });
  }

  if (validCandidates.length > 0) {
    const rankedKeys = rankScenarioKeysByNovelty({
      candidateKeys: validCandidates.map((entry, index) => ({ key: entry.scenarioKey, index })),
      recentScenarioKeys,
    });
    const ordered = rankedKeys
      .map((key) => validCandidates.find((entry) => entry.scenarioKey === key))
      .filter((entry): entry is ProceduralSelectionEntry => Boolean(entry));
    return ordered.length > 0 ? ordered : validCandidates;
  }

  return null;
}

function buildFallbackSelection(input: MiniGameGenerationInput): ProceduralSelectionEntry | null {
  const generator = GENERATED_MINI_GAME_REGISTRY_BY_ID.get(input.miniGameId);
  if (!generator) return null;
  const source = input.source ?? "daily_deck";
  const baseSeed = normalizeText(input.seed) || resolveSeedParts([input.dateKey, input.miniGameId, source, input.userId ?? "local"]);
  const fallbackScenario = generator.buildFallbackScenario({
    ...toGeneratedInput(input),
    source,
    seed: baseSeed,
  });
  if (!fallbackScenario) {
    return null;
  }

  return {
    candidate: scenarioToCandidate(fallbackScenario, generator),
    seed: fallbackScenario.metadata.seed ?? baseSeed,
    usedStaticFallback: true,
    scenarioKey: buildScenarioKey(scenarioToCandidate(fallbackScenario, generator), source),
    engineKey: buildEngineCandidateKey(scenarioToCandidate(fallbackScenario, generator)),
  };
}

export function getGeneratedMiniGameGenerator(miniGameId: DailyMiniGameId): ProceduralMiniGameGenerator | null {
  return GENERATED_MINI_GAME_REGISTRY_BY_ID.get(miniGameId) ?? null;
}

function requestSelectionAdjudication(selection: ProceduralSelection, generator: ProceduralMiniGameGenerator, input: MiniGameGenerationInput): string {
  const candidateKey = buildEngineCandidateKey(selection.candidate);
  void queueMiniGameCandidateResult(candidateKey, () =>
    adjudicateMiniGameCandidate({
      candidate: selection.candidate,
      generator,
      generationInput: {
        ...toGeneratedInput(input),
        source: input.source ?? "daily_deck",
        seed: selection.seed,
      },
      usedStaticFallback: selection.usedStaticFallback,
    }),
  );
  return candidateKey;
}

function resolveCachedScenario(candidateKey: string): GeneratedMiniGameScenario | null {
  return getCachedGeneratedMiniGameScenario(candidateKey);
}

function resolveGeneratedSelection(input: MiniGameGenerationInput): ProceduralSelectionEntry | null {
  const generator = getGeneratedMiniGameGenerator(input.miniGameId);
  if (!generator) return null;
  const entries = buildSelectionEntries(input);
  if (entries && entries.length > 0) {
    let queuedPending = false;
    let sawUncached = false;
    for (const entry of entries) {
      const cached = getCachedMiniGameCandidateResult(entry.engineKey);
      if (cached?.accepted && cached.scenario) {
        return entry;
      }
      if (!cached) {
        sawUncached = true;
        if (!queuedPending) {
          requestSelectionAdjudication(entry, generator, input);
          queuedPending = true;
        }
      }
    }
    if (sawUncached) {
      return null;
    }
  }
  const fallbackSelection = buildFallbackSelection(input);
  if (!fallbackSelection) return null;
  const cached = getCachedMiniGameCandidateResult(fallbackSelection.engineKey);
  if (cached?.accepted && cached.scenario) {
    return fallbackSelection;
  }
  requestSelectionAdjudication(fallbackSelection, generator, input);
  return null;
}

export function generateMiniGameScenario(input: MiniGameGenerationInput): GeneratedMiniGameScenario | null {
  const selection = resolveGeneratedSelection(input);
  if (!selection) return null;
  return resolveCachedScenario(selection.engineKey);
}

export async function generateMiniGameScenarioAsync(input: MiniGameGenerationInput): Promise<GeneratedMiniGameScenario | null> {
  const generator = getGeneratedMiniGameGenerator(input.miniGameId);
  if (!generator) return null;
  const entries = buildSelectionEntries(input) ?? [];
  for (const entry of entries) {
    const cached = getCachedMiniGameCandidateResult(entry.engineKey);
    if (cached?.accepted && cached.scenario) {
      return cached.scenario as GeneratedMiniGameScenario;
    }
    if (cached && !cached.accepted) {
      continue;
    }
    const result = await adjudicateMiniGameCandidate({
      candidate: entry.candidate,
      generator,
      generationInput: {
        ...toGeneratedInput(input),
        source: input.source ?? "daily_deck",
        seed: entry.seed,
      },
      usedStaticFallback: entry.usedStaticFallback,
    });
    if (result.accepted) {
      return result.scenario as GeneratedMiniGameScenario;
    }
  }

  const fallbackSelection = buildFallbackSelection(input);
  if (!fallbackSelection) return null;
  const cachedFallback = getCachedMiniGameCandidateResult(fallbackSelection.engineKey);
  if (cachedFallback?.accepted && cachedFallback.scenario) {
    return cachedFallback.scenario as GeneratedMiniGameScenario;
  }
  const fallbackResult = await adjudicateMiniGameCandidate({
    candidate: fallbackSelection.candidate,
    generator,
    generationInput: {
      ...toGeneratedInput(input),
      source: input.source ?? "daily_deck",
      seed: fallbackSelection.seed,
    },
    usedStaticFallback: fallbackSelection.usedStaticFallback,
  });
  return fallbackResult.accepted ? (fallbackResult.scenario as GeneratedMiniGameScenario) : null;
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
      const selection = resolveGeneratedSelection({
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

      const scenario = resolveCachedScenario(selection.engineKey);
      if (!scenario) {
        return null;
      }
      const scenarioCandidate = scenarioToCandidate(scenario, generator);
      const legacyContext: DailyMiniGameGenerationContext = {
        ...ctx,
        source: ctx.source ?? "daily_deck",
        seed: selection.seed,
        difficulty: mapGeneratedDifficultyToLegacyDifficulty(scenarioCandidate.difficulty),
      };
      const bundle = buildProceduralMiniGameCard(scenarioCandidate, legacyContext, generator, scenario.metadata.usedStaticFallback);
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
