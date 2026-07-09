import { Chess } from "chess.js";
import type { DailyBlundrCard, DailyMiniGameAdvanceAttempt, DailyMiniGameAdvanceResult, DailyMiniGameDefinition, DailyMiniGameGenerationContext, DailyMiniGameScenario, DailyMiniGameState } from "../dailyMiniGameTypes";
import { scoreDailyMiniGameAttempt } from "../dailyMiniGameScoring";
import { attachConceptTagsToDailyCard, inferConceptTagsForMiniGame } from "../../concepts/dailyConceptTagging";
import { normalizeText, hashString, uniqueSquares } from "../miniGameUtils";
import { applyMove, listLegalMoves, moveToUci } from "./miniGameMoveRules";
import { buildGeneratedScenarioKey } from "./miniGameScenarioNovelty";
import { mapGeneratedDifficultyToLegacyDifficulty, type GeneratedMiniGameDifficulty, type GeneratedMiniGameScenario, type MiniGameGenerationCandidate, type ProceduralMiniGameGenerator } from "./miniGameGenerationTypes";
import { validateGeneratedMiniGameScenario } from "./miniGameScenarioValidation";
import { validateMiniGameObjective } from "./miniGameObjectiveValidation";
import { verifyMiniGameSolution } from "./miniGameSolutionVerifier";
import { classifyMiniGameDifficulty } from "./miniGameDifficultyClassifier";

function nowIso(now?: string): string {
  return normalizeText(now) || new Date().toISOString();
}

function resolveScenarioSan(fen: string, uci: string): string | null {
  const applied = applyMove(fen, uci);
  return applied?.san ?? null;
}

function buildCandidateMoves(fen: string, primaryMove: string, acceptedMoves: readonly string[]): Array<{ uci: string; san: string | null; label: string; correct: boolean }> {
  const legal = listLegalMoves(fen, undefined);
  const candidates = legal
    .slice(0, 6)
    .map((move) => ({
      uci: moveToUci(move),
      san: move.san ?? null,
      label: move.san ?? moveToUci(move),
      correct: acceptedMoves.map((entry) => normalizeText(entry).toLowerCase()).includes(moveToUci(move).toLowerCase()),
    }));
  if (!candidates.some((entry) => entry.uci.toLowerCase() === primaryMove.toLowerCase())) {
    candidates.unshift({
      uci: primaryMove,
      san: resolveScenarioSan(fen, primaryMove),
      label: "Best move",
      correct: true,
    });
  }
  return candidates.slice(0, 6);
}

export function buildLegacyMiniGameScenario(
  candidate: MiniGameGenerationCandidate,
  input: DailyMiniGameGenerationContext,
  generator: ProceduralMiniGameGenerator,
  usedStaticFallback = false,
): DailyMiniGameScenario {
  const source = input.source ?? "daily_deck";
  const seed = normalizeText(input.seed) || `${input.dateKey}:${input.userIdOrLocalId ?? "local"}:${generator.id}:${candidate.family}`;
  const solutionSan = resolveScenarioSan(candidate.board.fen, candidate.solution.primaryMoveUci);
  const scenarioKey = buildGeneratedScenarioKey({
    miniGameId: generator.id,
    source,
    family: candidate.family,
    motif: candidate.motif,
    fen: candidate.board.fen,
    primaryMoveUci: candidate.solution.primaryMoveUci,
    targetSquares: candidate.overlays.targetSquares ?? candidate.overlays.keySquares ?? [],
    difficulty: candidate.difficulty,
    orientation: candidate.board.orientation,
  });
  const validation = validateGeneratedMiniGameScenario({
    scenarioKey,
    miniGameId: generator.id,
    source,
    family: candidate.family,
    motif: candidate.motif,
    difficulty: candidate.difficulty,
    estimatedTimeSeconds: candidate.estimatedTimeSeconds,
    board: {
      fen: candidate.board.fen,
      orientation: candidate.board.orientation,
      sideToMove: candidate.board.sideToMove,
      lockedOrientation: true,
    },
    prompt: candidate.prompt,
    instruction: candidate.instruction,
    goal: candidate.goal,
    explanation: candidate.explanation,
    solution: {
      primaryMoveUci: candidate.solution.primaryMoveUci,
      acceptedMoves: candidate.solution.acceptedMoves ?? [candidate.solution.primaryMoveUci],
      from: candidate.solution.from,
      to: candidate.solution.to,
      promotion: candidate.solution.promotion,
      verification: {
        verified: true,
        verifier: "procedural-adapter",
      },
    },
    overlays: candidate.overlays,
    conceptTags: candidate.conceptTags,
    metadata: {
      seed,
      generatorVersion: "8n-procedural-v1",
      generatorKind: "procedural",
      usedStaticFallback,
      transformIds: candidate.transformIds ?? [],
      validationPassed: true,
      objectiveValidationPassed: true,
      solutionVerified: true,
    },
  });

  if (!validation.valid) {
    throw new Error(`Procedural mini-game scenario failed validation: ${validation.issues.map((issue) => issue.code).join(", ")}`);
  }

  const legacyDifficulty = mapGeneratedDifficultyToLegacyDifficulty(candidate.difficulty);
  const acceptedMoves = uniqueSquares(candidate.solution.acceptedMoves ?? [candidate.solution.primaryMoveUci]);
  const scenario: DailyMiniGameScenario = {
    id: `mini:${generator.id}:${scenarioKey}`,
    miniGameId: generator.id,
    source,
    seed,
    generatedAt: nowIso(input.now),
    createdAt: nowIso(input.now),
    fen: candidate.board.fen,
    sideToMove: candidate.board.sideToMove,
    prompt: candidate.prompt,
    instructions: candidate.instruction,
    goal: candidate.goal,
    acceptedMoves,
    solution: {
      uci: candidate.solution.primaryMoveUci,
      san: solutionSan,
    },
    explanation: candidate.explanation,
    conceptTags: [...candidate.conceptTags],
    difficulty: legacyDifficulty,
    estimatedTimeSeconds: Math.max(1, Math.round(candidate.estimatedTimeSeconds)),
    validation: {
      checkedAt: nowIso(input.now),
      valid: true,
      attempts: 1,
      issues: [],
    },
    scoring: {
      mode: candidate.analysis.routeLength > 1 ? "route" : "single_move",
      maxAttempts: Math.max(1, candidate.analysis.routeLength || 1),
      revealPenalty: 0.1,
      canRetry: true,
      correctMoveReward: 1,
    },
    retryBehavior: {
      allowRetry: true,
      refreshSeedOnRetry: true,
      nextLabel: "Next",
    },
    revealBehavior: {
      revealLabel: "Reveal",
      continueLabel: "Continue",
      showAnswerLabel: null,
      markReviewedLabel: null,
    },
    novelty: {
      scenarioKey,
      cooldownGroup: `${source}:${generator.id}`,
      recentScenarioKeys: uniqueSquares((input.recentScenarioKeys ?? []).map((entry) => normalizeText(entry))),
      avoidedRepeat: Boolean((input.recentScenarioKeys ?? []).some((entry) => normalizeText(entry).toLowerCase() === scenarioKey.toLowerCase())),
    },
    theme: candidate.family,
    targetSquares: uniqueSquares(candidate.overlays.targetSquares ?? []),
    goalSquares: uniqueSquares(candidate.overlays.keySquares ?? candidate.overlays.targetSquares ?? []),
    acceptedSquares: uniqueSquares([
      ...(candidate.overlays.targetSquares ?? []),
      ...(candidate.overlays.keySquares ?? []),
      candidate.solution.to,
    ]),
    boardOrientationHint: candidate.board.orientation,
    candidateMoves: buildCandidateMoves(candidate.board.fen, candidate.solution.primaryMoveUci, acceptedMoves),
  };

  return scenario;
}

function buildLegacyState(candidate: MiniGameGenerationCandidate, scenario: DailyMiniGameScenario, input: DailyMiniGameGenerationContext): DailyMiniGameState {
  const formationHash = hashString(`${scenario.novelty.scenarioKey}|${scenario.fen}|${scenario.seed}`);
  return {
    miniGameId: scenario.miniGameId,
    scenarioId: scenario.id,
    scenario,
    skillIds: generatorSkillIds(scenario.miniGameId) as never,
    difficulty: scenario.difficulty,
    startFen: scenario.fen,
    currentFen: scenario.fen,
    sideToMove: scenario.sideToMove,
    learnerSide: scenario.boardOrientationHint === "black" ? "black" : "white",
    goalSquares: scenario.goalSquares,
    targetSquares: scenario.targetSquares,
    flagSquares: scenario.acceptedSquares,
    moveLimit: Math.max(1, scenario.scoring.maxAttempts),
    plyCount: 0,
    bestKnownScore: Math.max(1, scenario.scoring.maxAttempts),
    completed: false,
    won: false,
    formationHash,
    noveltyKey: scenario.novelty.scenarioKey,
    lastMoveUci: null,
    lastMoveSan: null,
  };
}

function generatorSkillIds(miniGameId: string): string[] {
  switch (miniGameId) {
    case "king_race":
      return ["king_pathing", "opposition", "goal_zone"];
    case "knight_gymnasium":
      return ["knight_geometry", "shortest_path", "outpost", "goal_zone"];
    case "pawn_wars":
      return ["pawn_race", "promotion", "passed_pawn"];
    case "tactic_shots":
      return ["forks", "pins", "skewers", "discovered_attack", "back_rank", "overloaded_piece"];
    case "key_square_conquest":
      return ["key_square_control", "outpost", "invasion_square", "king_entry", "blockade"];
    case "structure_builder":
      return ["pawn_structure", "pawn_break", "isolated_pawn", "backward_pawn", "pawn_chain"];
    case "imbalance_arena":
      return ["bishop_vs_knight", "rook_activity", "exchange_value", "material_imbalance", "color_complex"];
    case "technique_lab":
      return ["conversion", "zugzwang", "triangulation", "rook_endgame", "mating_net"];
    default:
      return [];
  }
}

export function buildProceduralMiniGameCard(
  candidate: MiniGameGenerationCandidate,
  input: DailyMiniGameGenerationContext,
  generator: ProceduralMiniGameGenerator,
  usedStaticFallback = false,
): { card: DailyBlundrCard; state: DailyMiniGameState; scenario: DailyMiniGameScenario } {
  const scenario = buildLegacyMiniGameScenario(candidate, input, generator, usedStaticFallback);
  const state = buildLegacyState(candidate, scenario, input);
  const conceptIds = inferConceptTagsForMiniGame(generator.id, generator.skillIds);
  const card = attachConceptTagsToDailyCard(
    {
      source: "daily_attempt",
      cardKey: `mini:${generator.id}:${scenario.novelty.scenarioKey}`,
      positionKey: scenario.novelty.scenarioKey,
      fen: scenario.fen,
      expectedMoveUci: null,
      expectedMoveSan: null,
      playedMoveUci: null,
      playedMoveSan: null,
      openingId: null,
      openingName: generator.displayName ?? generator.title,
      patternId: `mini:${generator.id}`,
      concept: conceptIds[0] ?? null,
      count: 1,
      weight: Math.max(1, candidate.analysis.complexity / 10),
      lastSeenAt: input.mastery?.updatedAt ?? null,
      note: candidate.explanation,
      signals: [
        "mini_game",
        "procedural",
        `mini:${generator.id}`,
        `source:${scenario.source}`,
        `family:${candidate.family}`,
        `motif:${candidate.motif ?? candidate.family}`,
        `scenario:${scenario.novelty.scenarioKey}`,
        ...candidate.conceptTags.map((tag) => `tag:${tag}`),
      ],
      masteryTargets: generator.skillIds.map((skillId) => ({
        conceptKey: `mini:${generator.id}:${skillId}`,
        domain: "mini_game" as const,
        label: skillId.replace(/_/g, " "),
        difficultyHint: scenario.difficulty,
      })),
      confidence: candidate.analysis.complexity > 55 ? "high" : candidate.analysis.complexity > 28 ? "medium" : "low",
      difficulty: scenario.difficulty,
      id: `mini:${generator.id}:${scenario.novelty.scenarioKey}`,
      kind: "mini_game",
      title: generator.displayName ?? generator.title,
      prompt: scenario.prompt,
      repertoireId: null,
      reviewCardId: null,
      reviewDedupeKey: null,
      reviewPromptKind: null,
      reviewStatus: null,
      reviewDueAt: null,
      deckRank: 1,
      priority: Math.round(candidate.analysis.complexity + (candidate.analysis.forcing ? 12 : 0)),
      masteryKey: `mini:${generator.id}:${scenario.novelty.scenarioKey}`,
      sourceCount: 1,
      summary: generator.summary,
      miniGame: state,
      conceptIds,
    },
    conceptIds,
  );

  return { card, state, scenario };
}

export function buildGeneratedMiniGameScenarioContract(
  candidate: MiniGameGenerationCandidate,
  input: DailyMiniGameGenerationContext,
  generator: ProceduralMiniGameGenerator,
  usedStaticFallback = false,
): GeneratedMiniGameScenario {
  const source = input.source ?? "daily_deck";
  const seed = normalizeText(input.seed) || `${input.dateKey}:${input.userIdOrLocalId ?? "local"}:${generator.id}:${candidate.family}`;
  const scenarioKey = buildGeneratedScenarioKey({
    miniGameId: generator.id,
    source,
    family: candidate.family,
    motif: candidate.motif,
    fen: candidate.board.fen,
    primaryMoveUci: candidate.solution.primaryMoveUci,
    targetSquares: candidate.overlays.targetSquares ?? candidate.overlays.keySquares ?? [],
    difficulty: candidate.difficulty,
    orientation: candidate.board.orientation,
  });
  const verification = verifyMiniGameSolution(candidate);
  const objective = validateMiniGameObjective(candidate);
  return {
    scenarioKey,
    miniGameId: generator.id,
    source,
    family: candidate.family,
    motif: candidate.motif,
    difficulty: candidate.difficulty,
    estimatedTimeSeconds: candidate.estimatedTimeSeconds,
    board: {
      fen: candidate.board.fen,
      orientation: candidate.board.orientation,
      sideToMove: candidate.board.sideToMove,
      lockedOrientation: true,
    },
    prompt: candidate.prompt,
    instruction: candidate.instruction,
    goal: candidate.goal,
    explanation: candidate.explanation,
    solution: {
      primaryMoveUci: candidate.solution.primaryMoveUci,
      acceptedMoves: candidate.solution.acceptedMoves ?? [candidate.solution.primaryMoveUci],
      from: candidate.solution.from,
      to: candidate.solution.to,
      promotion: candidate.solution.promotion,
      verification: {
        verified: true,
        verifier: verification.verifier,
        objectiveScore: verification.objectiveScore,
        notes: [...new Set([...(objective.notes ?? []), ...(verification.notes ?? [])])],
      },
    },
    overlays: candidate.overlays,
    conceptTags: [...candidate.conceptTags],
    metadata: {
      seed,
      generatorVersion: "8n-procedural-v1",
      generatorKind: "procedural",
      usedStaticFallback,
      transformIds: candidate.transformIds ?? [],
      validationPassed: true,
      objectiveValidationPassed: objective.passed,
      solutionVerified: verification.verified,
    },
  };
}

export function buildProceduralAdvanceResult(state: DailyMiniGameState, attempt: DailyMiniGameAdvanceAttempt): DailyMiniGameAdvanceResult {
  const attemptUci = normalizeText(attempt.uci).toLowerCase();
  const accepted = new Set((state.scenario?.acceptedMoves ?? []).map((move) => normalizeText(move).toLowerCase()));
  const legal = attempt.legal !== false && Boolean(applyMove(state.currentFen, attemptUci));
  if (!legal) {
    return {
      state: {
        ...state,
        plyCount: state.plyCount + 1,
        lastMoveUci: attempt.uci,
        lastMoveSan: attempt.san ?? null,
      },
      completed: false,
      won: false,
      legal: false,
      reason: "illegal_move_attempt",
      attemptedMoveUci: attempt.uci,
      attemptedMoveSan: attempt.san ?? null,
      moveCount: state.plyCount + 1,
      illegalMoveCount: 1,
      scoreInput: {
        card: null as never,
        completed: false,
        won: false,
        moveCount: state.plyCount + 1,
        moveLimit: state.moveLimit,
        bestKnownMoves: state.bestKnownScore ?? null,
        illegalMoveCount: 1,
        blocked: false,
        perfectPath: false,
        objectiveCount: 1,
        objectivesCompleted: 0,
        reason: "illegal_move_attempt",
      },
    };
  }

  if (!accepted.has(attemptUci)) {
    return {
      state: {
        ...state,
        plyCount: state.plyCount + 1,
        lastMoveUci: attempt.uci,
        lastMoveSan: attempt.san ?? null,
      },
      completed: false,
      won: false,
      legal: true,
      reason: "try_again",
      attemptedMoveUci: attempt.uci,
      attemptedMoveSan: attempt.san ?? null,
      moveCount: state.plyCount + 1,
      illegalMoveCount: 0,
      scoreInput: {
        card: null as never,
        completed: false,
        won: false,
        moveCount: state.plyCount + 1,
        moveLimit: state.moveLimit,
        bestKnownMoves: state.bestKnownScore ?? null,
        illegalMoveCount: 0,
        blocked: false,
        perfectPath: false,
        objectiveCount: 1,
        objectivesCompleted: 0,
        reason: "try_again",
      },
    };
  }

  const applied = applyMove(state.currentFen, attemptUci) ?? applyMove(state.currentFen, state.scenario?.solution.uci ?? attemptUci);
  const nextState: DailyMiniGameState = {
    ...state,
    currentFen: applied?.fen ?? state.currentFen,
    sideToMove: applied ? new Chess(applied.fen).turn() : state.sideToMove,
    plyCount: state.plyCount + 1,
    completed: true,
    won: true,
    lastMoveUci: applied?.uci ?? attempt.uci,
    lastMoveSan: applied?.san ?? attempt.san ?? null,
  };

  return {
    state: nextState,
    completed: true,
    won: true,
    legal: true,
    reason: "best_known_route",
    attemptedMoveUci: attempt.uci,
    attemptedMoveSan: attempt.san ?? null,
    responseMoveUci: applied?.uci ?? attempt.uci,
    responseMoveSan: applied?.san ?? attempt.san ?? null,
    moveCount: nextState.plyCount,
    illegalMoveCount: 0,
    scoreInput: {
      card: null as never,
      completed: true,
      won: true,
      moveCount: nextState.plyCount,
      moveLimit: state.moveLimit,
      bestKnownMoves: state.bestKnownScore ?? null,
      illegalMoveCount: 0,
      blocked: false,
      perfectPath: true,
      objectiveCount: 1,
      objectivesCompleted: 1,
      reason: "best_known_route",
    },
  };
}

export function toGeneratedScenarioCard(candidate: MiniGameGenerationCandidate, input: DailyMiniGameGenerationContext, generator: ProceduralMiniGameGenerator, usedStaticFallback = false) {
  return buildProceduralMiniGameCard(candidate, input, generator, usedStaticFallback);
}

export function validateProceduralCandidate(candidate: MiniGameGenerationCandidate) {
  return {
    objective: validateMiniGameObjective(candidate),
    solution: verifyMiniGameSolution(candidate),
    difficulty: classifyMiniGameDifficulty(candidate),
  };
}
