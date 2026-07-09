import { buildGeneratedMiniGameScenarioContract } from "./miniGameLegacyAdapter";
import { buildMiniGameCandidateCacheKey, getCachedMiniGameCandidateResult, queueMiniGameCandidateResult } from "./miniGameEngineCache";
import { analyzeMiniGamePositionWithStockfish, evaluateMiniGameMoveWithStockfish, normalizeEvaluationForMoverPerspective } from "./miniGameStockfishAdjudicator";
import { resolveMiniGameEngineThresholds } from "./miniGameEngineThresholds";
import { mapGeneratedDifficultyToLegacyDifficulty, type GeneratedMiniGameScenario, type MiniGameGenerationCandidate, type MiniGameGenerationInput, type ProceduralMiniGameGenerator } from "./miniGameGenerationTypes";
import type { MiniGameEngineAdjudicationResult, MiniGameEngineQuality, MiniGameEngineScore } from "./miniGameEngineQualityTypes";
import { buildGeneratedScenarioKey } from "./miniGameScenarioNovelty";
import { normalizeText } from "../miniGameUtils";
import { isLegalMove } from "./miniGameMoveRules";

const DEBUG_ENABLED = process.env.BLUNDR_MINIGAME_STOCKFISH_DEBUG === "1" || process.env.NEXT_PUBLIC_BLUNDR_MINIGAME_STOCKFISH_DEBUG === "1";

function debugLog(event: string, payload: Record<string, unknown>): void {
  if (!DEBUG_ENABLED) return;
  // eslint-disable-next-line no-console
  console.debug(`[MiniGameStockfish] ${event}`, payload);
}

function normalizeUci(value: unknown): string {
  return normalizeText(value).toLowerCase().replace(/\s+/g, "");
}

function scoreToComparable(score: MiniGameEngineScore | null | undefined): number | null {
  if (!score) return null;
  if (typeof score.mate === "number") {
    return score.mate > 0 ? 100000 - score.mate : -100000 - Math.abs(score.mate);
  }
  if (typeof score.cp === "number") return score.cp;
  return null;
}

function compareEval(before: MiniGameEngineScore | null | undefined, after: MiniGameEngineScore | null | undefined): number | null {
  const beforeComparable = scoreToComparable(before);
  const afterComparable = scoreToComparable(after);
  if (beforeComparable == null || afterComparable == null) return null;
  return Math.max(0, beforeComparable - afterComparable);
}

function isDecisiveMate(score: MiniGameEngineScore | null | undefined): boolean {
  return typeof score?.mate === "number" && score.mate !== 0;
}

function rankAllowanceForThresholds(thresholds: ReturnType<typeof resolveMiniGameEngineThresholds>): number {
  return thresholds.mode === "strict" ? 2 : 5;
}

function isPrimaryMoveAcceptable(input: {
  thresholds: ReturnType<typeof resolveMiniGameEngineThresholds>;
  rank: number | null;
  loss: number | null;
  evalScore: MiniGameEngineScore | null;
}): boolean {
  if (input.loss != null && input.loss > input.thresholds.hardRejectCentipawnLoss) {
    return false;
  }
  const rankAllowance = rankAllowanceForThresholds(input.thresholds);
  if (input.rank != null && input.rank >= 1 && input.rank <= rankAllowance) {
    return true;
  }
  if (input.loss != null && input.loss <= input.thresholds.maxCentipawnLoss) {
    return true;
  }
  return isDecisiveMate(input.evalScore);
}

function isPrimaryMovePassing(input: {
  thresholds: ReturnType<typeof resolveMiniGameEngineThresholds>;
  rank: number | null;
  loss: number | null;
  evalScore: MiniGameEngineScore | null;
}): boolean {
  if (!isPrimaryMoveAcceptable(input)) return false;
  if (isDecisiveMate(input.evalScore)) return true;
  if (input.rank === 1 && (input.loss == null || input.loss <= input.thresholds.maxCentipawnLoss)) {
    return true;
  }
  return false;
}

function explanationClaimsCertainty(explanation: string): boolean {
  return /\b(best|only|must|correct|winning|forced|decisive)\b/i.test(normalizeText(explanation));
}

function buildCandidateDescriptor(candidate: MiniGameGenerationCandidate) {
  return {
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
  } as const;
}

function buildCandidateKey(candidate: MiniGameGenerationCandidate, thresholds: ReturnType<typeof resolveMiniGameEngineThresholds>): string {
  return buildMiniGameCandidateCacheKey({
    descriptor: buildCandidateDescriptor(candidate),
    depth: thresholds.depth,
    multipv: thresholds.multipv,
  });
}

function buildFinalScenarioContext(input: {
  generationInput: MiniGameGenerationInput;
}) {
  return {
    dateKey: input.generationInput.dateKey,
    now: input.generationInput.dateKey ? new Date().toISOString() : new Date().toISOString(),
    mastery: null,
    difficulty: mapGeneratedDifficultyToLegacyDifficulty(input.generationInput.difficulty),
    currentMastery: 0,
    confidence: 0,
    dueReviewCount: 0,
    selectedReviewCount: 0,
    recentMiniGameIds: [],
    recentFenKeys: [],
    sessionMiniGameIds: [],
    source: input.generationInput.source,
    seed: input.generationInput.seed,
    userIdOrLocalId: input.generationInput.userId ?? null,
    recentScenarioKeys: input.generationInput.recentScenarioKeys ?? [],
    boardPreferences: input.generationInput.userBoardPreference ?? null,
    deckId: null,
    miniGameId: input.generationInput.miniGameId,
  } as const;
}

function buildEngineQuality(input: {
  candidate: MiniGameGenerationCandidate;
  thresholds: ReturnType<typeof resolveMiniGameEngineThresholds>;
  analysis: Awaited<ReturnType<typeof analyzeMiniGamePositionWithStockfish>>;
  primaryMoveRank: number | null;
  primaryBeforeEval: MiniGameEngineScore | null;
  primaryAfterEval: MiniGameEngineScore | null;
  acceptedMoveProblems: string[];
  verdict: MiniGameEngineQuality["verdict"];
  notes: string[];
}): MiniGameEngineQuality {
  const primaryLoss = compareEval(input.primaryBeforeEval, input.primaryAfterEval);
  return {
    adjudicated: true,
    engine: "stockfish",
    depth: input.thresholds.depth,
    multipv: input.thresholds.multipv,
    sideToMove: input.candidate.board.sideToMove,
    primaryMoveUci: input.candidate.solution.primaryMoveUci,
    primaryMoveRank: input.primaryMoveRank ?? undefined,
    primaryMoveCentipawnLoss: primaryLoss ?? undefined,
    beforeEval: input.primaryBeforeEval ?? undefined,
    afterEval: input.primaryAfterEval ?? undefined,
    bestMoveUci: input.analysis.topMoves[0]?.moveUci ?? undefined,
    topMoves: input.analysis.topMoves,
    verdict: input.verdict,
    notes: input.notes,
  };
}

function buildAcceptedScenario(candidate: MiniGameGenerationCandidate, generator: ProceduralMiniGameGenerator, generationInput: MiniGameGenerationInput, usedStaticFallback: boolean, engineQuality: MiniGameEngineQuality): GeneratedMiniGameScenario {
  const finalCandidate: MiniGameGenerationCandidate = {
    ...candidate,
    difficulty: generator.classifyDifficulty(candidate),
    engineQuality,
  };
  const context = buildFinalScenarioContext({ generationInput });
  return buildGeneratedMiniGameScenarioContract(finalCandidate, context, generator, usedStaticFallback, {
    engineQuality,
  });
}

function summarizeAcceptedMoveProblems(problems: readonly string[]): string[] {
  return Array.from(new Set(problems.map((problem) => normalizeText(problem)).filter(Boolean)));
}

async function evaluateMoveAgainstRoot(input: {
  candidate: MiniGameGenerationCandidate;
  thresholds: ReturnType<typeof resolveMiniGameEngineThresholds>;
  analysis: Awaited<ReturnType<typeof analyzeMiniGamePositionWithStockfish>>;
  moveUci: string;
}): Promise<{
  rank: number | null;
  evalScore: MiniGameEngineScore | null;
  loss: number | null;
}> {
  const normalizedMove = normalizeUci(input.moveUci);
  const exact = input.analysis.topMoves.find((line) => normalizeUci(line.moveUci) === normalizedMove) ?? null;
  if (exact) {
    const bestEval = normalizeEvaluationForMoverPerspective(input.analysis.topMoves[0] ?? null);
    const evalScore = normalizeEvaluationForMoverPerspective(exact);
    return {
      rank: exact.rank,
      evalScore,
      loss: compareEval(bestEval, evalScore),
    };
  }

  const evalScore = await evaluateMiniGameMoveWithStockfish({
    fen: input.candidate.board.fen,
    moveUci: normalizedMove,
    depth: input.thresholds.depth,
    multipv: input.thresholds.multipv,
  });
  const bestEval = normalizeEvaluationForMoverPerspective(input.analysis.topMoves[0] ?? null);
  return {
    rank: null,
    evalScore,
    loss: compareEval(bestEval, evalScore),
  };
}

async function evaluateAcceptedMoves(input: {
  candidate: MiniGameGenerationCandidate;
  thresholds: ReturnType<typeof resolveMiniGameEngineThresholds>;
  analysis: Awaited<ReturnType<typeof analyzeMiniGamePositionWithStockfish>>;
}): Promise<string[]> {
  const problems: string[] = [];
  const acceptedMoves = Array.from(new Set((input.candidate.solution.acceptedMoves ?? [input.candidate.solution.primaryMoveUci]).map((move) => normalizeUci(move)).filter(Boolean)));
  const rankAllowance = rankAllowanceForThresholds(input.thresholds);

  for (const acceptedMove of acceptedMoves) {
    if (!isLegalMove(input.candidate.board.fen, acceptedMove)) {
      problems.push(`illegal_accepted_move:${acceptedMove}`);
      continue;
    }

    const evaluated = await evaluateMoveAgainstRoot({
      candidate: input.candidate,
      thresholds: input.thresholds,
      analysis: input.analysis,
      moveUci: acceptedMove,
    });

    const withinRank = evaluated.rank != null && evaluated.rank >= 1 && evaluated.rank <= rankAllowance;
    const withinLoss = evaluated.loss != null && evaluated.loss <= input.thresholds.maxCentipawnLoss;
    const hardReject = evaluated.loss != null && evaluated.loss > input.thresholds.hardRejectCentipawnLoss;

    if (hardReject || (!withinRank && !withinLoss)) {
      problems.push(`accepted_move_too_weak:${acceptedMove}`);
    }
  }

  return summarizeAcceptedMoveProblems(problems);
}

function decideVerdict(input: {
  candidate: MiniGameGenerationCandidate;
  thresholds: ReturnType<typeof resolveMiniGameEngineThresholds>;
  primaryMoveRank: number | null;
  primaryMoveLoss: number | null;
  primaryBeforeEval: MiniGameEngineScore | null;
  primaryAfterEval: MiniGameEngineScore | null;
  acceptedMoveProblems: string[];
}): Pick<MiniGameEngineQuality, "verdict" | "notes"> {
  const notes: string[] = [];
  const primaryAcceptable = isPrimaryMoveAcceptable({
    thresholds: input.thresholds,
    rank: input.primaryMoveRank,
    loss: input.primaryMoveLoss,
    evalScore: input.primaryAfterEval,
  });
  const primaryPassing = isPrimaryMovePassing({
    thresholds: input.thresholds,
    rank: input.primaryMoveRank,
    loss: input.primaryMoveLoss,
    evalScore: input.primaryAfterEval,
  });
  const beforeComparable = scoreToComparable(input.primaryBeforeEval);
  const afterComparable = scoreToComparable(input.primaryAfterEval);
  const preservesResult =
    !input.thresholds.requirePreservedResult ||
    beforeComparable == null ||
    afterComparable == null ||
    (beforeComparable >= 0 && afterComparable >= 0) ||
    (beforeComparable < 0 && afterComparable < 0);
  const mateSafety =
    !input.thresholds.requireMateSafety ||
    input.primaryBeforeEval?.mate == null ||
    input.primaryAfterEval?.mate == null ||
    Math.sign(input.primaryBeforeEval.mate) === Math.sign(input.primaryAfterEval.mate);

  if (input.acceptedMoveProblems.length > 0) {
    return {
      verdict: "reject_blunder",
      notes: [...new Set([...input.acceptedMoveProblems, "accepted_moves_failed_engine_gate"])],
    };
  }

  if (!preservesResult || !mateSafety) {
    notes.push("result_or_mate_worsened");
    return { verdict: "reject_blunder", notes };
  }

  if (input.primaryMoveLoss != null && input.primaryMoveLoss > input.thresholds.hardRejectCentipawnLoss) {
    notes.push(`primary_loss_${Math.round(input.primaryMoveLoss)}`);
    return { verdict: "reject_blunder", notes };
  }

  if (!primaryAcceptable) {
    if (explanationClaimsCertainty(input.candidate.explanation)) {
      notes.push("explanation_claims_certainty");
      return { verdict: "reject_bad_explanation", notes };
    }
    notes.push("primary_move_not_top_or_safe");
    return { verdict: "reject_not_top_enough", notes };
  }

  if (primaryPassing) {
    if (input.primaryMoveRank === 1 || isDecisiveMate(input.primaryAfterEval)) {
      notes.push(`primary_rank_${input.primaryMoveRank ?? "mate"}`);
      return { verdict: "pass", notes };
    }
    if (input.primaryMoveRank != null) {
      notes.push(`primary_rank_${input.primaryMoveRank}`);
    }
    if (input.primaryMoveLoss != null) {
      notes.push(`primary_loss_${Math.round(input.primaryMoveLoss)}`);
    }
    return { verdict: "soft_pass", notes };
  }

  notes.push("primary_move_acceptable_but_not_passing");
  return { verdict: "soft_pass", notes };
}

async function adjudicateCandidate(input: {
  candidate: MiniGameGenerationCandidate;
  generator: ProceduralMiniGameGenerator;
  generationInput: MiniGameGenerationInput;
  usedStaticFallback: boolean;
}): Promise<MiniGameEngineAdjudicationResult> {
  const thresholds = resolveMiniGameEngineThresholds(buildCandidateDescriptor(input.candidate));
  const candidateKey = buildCandidateKey(input.candidate, thresholds);
  const scenarioKey = buildGeneratedScenarioKey({
    miniGameId: input.candidate.miniGameId,
    source: input.candidate.source,
    family: input.candidate.family,
    motif: input.candidate.motif,
    fen: input.candidate.board.fen,
    primaryMoveUci: input.candidate.solution.primaryMoveUci,
    targetSquares: input.candidate.overlays.targetSquares ?? input.candidate.overlays.keySquares ?? [],
    difficulty: input.candidate.difficulty,
    orientation: input.candidate.board.orientation,
  });

  const analysis = await analyzeMiniGamePositionWithStockfish({
    fen: input.candidate.board.fen,
    depth: thresholds.depth,
    multipv: thresholds.multipv,
  });

  if (analysis.providerStatus !== "ready" || !analysis.topMoves.length) {
    const engineQuality: MiniGameEngineQuality = {
      adjudicated: false,
      engine: "none",
      depth: thresholds.depth,
      multipv: thresholds.multipv,
      sideToMove: input.candidate.board.sideToMove,
      primaryMoveUci: input.candidate.solution.primaryMoveUci,
      verdict: "skip_not_required",
      notes: ["stockfish_unavailable"],
    };

    debugLog("reject_unavailable", {
      candidateKey,
      scenarioKey,
      miniGameId: input.candidate.miniGameId,
      family: input.candidate.family,
      source: input.candidate.source,
    });

    return {
      candidateKey,
      scenarioKey,
      engineQuality,
      analysis,
      accepted: false,
      rejectionReason: "stockfish_unavailable",
      notes: ["stockfish_unavailable"],
      usedFallback: input.usedStaticFallback,
      scenario: null,
    };
  }

  const bestEval = normalizeEvaluationForMoverPerspective(analysis.topMoves[0] ?? null);
  const primaryMoveRank = analysis.topMoves.find((line) => normalizeUci(line.moveUci) === normalizeUci(input.candidate.solution.primaryMoveUci))?.rank ?? null;
  const primaryMoveEval = await evaluateMoveAgainstRoot({
    candidate: input.candidate,
    thresholds,
    analysis,
    moveUci: input.candidate.solution.primaryMoveUci,
  });
  const acceptedMoveProblems = await evaluateAcceptedMoves({
    candidate: input.candidate,
    thresholds,
    analysis,
  });
  const verdict = decideVerdict({
    candidate: input.candidate,
    thresholds,
    primaryMoveRank,
    primaryMoveLoss: primaryMoveEval.loss,
    primaryBeforeEval: bestEval,
    primaryAfterEval: primaryMoveEval.evalScore,
    acceptedMoveProblems,
  });
  const engineQuality = buildEngineQuality({
    candidate: input.candidate,
    thresholds,
    analysis,
    primaryMoveRank,
    primaryBeforeEval: bestEval,
    primaryAfterEval: primaryMoveEval.evalScore,
    acceptedMoveProblems,
    verdict: verdict.verdict,
    notes: verdict.notes,
  });

  debugLog(engineQuality.adjudicated ? "adjudicated" : "rejected", {
    candidateKey,
    scenarioKey,
    miniGameId: input.candidate.miniGameId,
    family: input.candidate.family,
    source: input.candidate.source,
    mode: thresholds.mode,
    verdict: engineQuality.verdict,
    rank: primaryMoveRank,
    loss: primaryMoveEval.loss,
    bestMoveUci: analysis.topMoves[0]?.moveUci ?? null,
    primaryMoveUci: input.candidate.solution.primaryMoveUci,
  });

  if (!engineQuality.adjudicated) {
    return {
      candidateKey,
      scenarioKey,
      engineQuality,
      analysis,
      accepted: false,
      rejectionReason: verdict.verdict,
      notes: verdict.notes,
      usedFallback: input.usedStaticFallback,
      scenario: null,
    };
  }

  const scenario = buildAcceptedScenario(input.candidate, input.generator, input.generationInput, input.usedStaticFallback, engineQuality);

  return {
    candidateKey,
    scenarioKey: scenario.scenarioKey,
    engineQuality,
    analysis,
    accepted: true,
    rejectionReason: null,
    notes: verdict.notes,
    usedFallback: input.usedStaticFallback,
    scenario,
  };
}

export async function adjudicateMiniGameCandidate(input: {
  candidate: MiniGameGenerationCandidate;
  generator: ProceduralMiniGameGenerator;
  generationInput: MiniGameGenerationInput;
  usedStaticFallback: boolean;
}): Promise<MiniGameEngineAdjudicationResult> {
  const thresholds = resolveMiniGameEngineThresholds(buildCandidateDescriptor(input.candidate));
  const candidateKey = buildCandidateKey(input.candidate, thresholds);
  const cached = getCachedMiniGameCandidateResult(candidateKey);
  if (cached) {
    return cached;
  }
  return await queueMiniGameCandidateResult(candidateKey, async () => adjudicateCandidate(input));
}

export async function adjudicateMiniGameScenarioAsync(input: {
  candidate: MiniGameGenerationCandidate;
  generator: ProceduralMiniGameGenerator;
  generationInput: MiniGameGenerationInput;
  usedStaticFallback: boolean;
}): Promise<GeneratedMiniGameScenario | null> {
  const result = await adjudicateMiniGameCandidate(input);
  return result.accepted ? (result.scenario as GeneratedMiniGameScenario) : null;
}
