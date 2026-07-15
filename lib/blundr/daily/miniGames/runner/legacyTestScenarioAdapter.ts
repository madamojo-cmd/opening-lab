import { parseUciMove } from "../generation/miniGameMoveRules";
import type { DailyBlundrMiniGameCard } from "../dailyMiniGameTypes";
import type { Square } from "@/lib/blundr/geometry/boardTypes";
import type { MiniGameRunnerScenario } from "./miniGameRunnerState";
import {
  getDailyBlundrDateKey,
  reconcileDailyBlundrSession,
} from "../../dailyBlundrStorage";
import { getDailyMiniGameDefinition } from "../dailyMiniGameRegistry";
import type { DailyMiniGameId } from "../dailyMiniGameTypes";

/** Test/compatibility adapter only. Production practice uses opaque instances. */
export function buildLegacyTestScenario(
  card: DailyBlundrMiniGameCard,
): MiniGameRunnerScenario | null {
  const miniGame = card.miniGame;
  const scenario = miniGame?.scenario ?? null;
  if (!scenario) return null;
  const parsedSolution = parseUciMove(scenario.solution.uci);
  const from = (parsedSolution?.from ??
    scenario.solution.uci.slice(0, 2)) as Square;
  const to = (parsedSolution?.to ??
    scenario.solution.uci.slice(2, 4)) as Square;
  return {
    scenarioKey: scenario.novelty.scenarioKey,
    miniGameId: miniGame.miniGameId,
    source: scenario.source,
    family: scenario.theme || card.title || miniGame.miniGameId,
    motif: scenario.theme || undefined,
    estimatedTimeSeconds: scenario.estimatedTimeSeconds,
    board: {
      fen: scenario.fen,
      orientation: miniGame.learnerSide,
      sideToMove: scenario.sideToMove,
      lockedOrientation: true,
    },
    prompt: scenario.prompt,
    instruction: scenario.instructions,
    goal: scenario.goal,
    explanation: scenario.explanation,
    solution: {
      primaryMoveUci: scenario.solution.uci,
      acceptedMoves: [...scenario.acceptedMoves],
      from,
      to,
      promotion: parsedSolution?.promotion,
      verification: { verified: true, verifier: "legacy-mini-game-adapter" },
    },
    overlays: {
      selectedSquares: from ? [from] : undefined,
      targetSquares: scenario.targetSquares?.length
        ? ([...scenario.targetSquares] as Square[])
        : undefined,
      keySquares: scenario.goalSquares?.length
        ? ([...scenario.goalSquares] as Square[])
        : undefined,
      arrows: from && to ? [{ from, to, type: "solution" }] : undefined,
      route: from && to ? [from, to] : undefined,
      lastMove: from && to ? { from, to } : undefined,
    },
    conceptTags: [...scenario.conceptTags],
  };
}

export function buildLegacyPracticeBundle(
  miniGameId: string,
  nonce: number,
  recentScenarioKeys: readonly string[],
  userIdOrLocalId: string | null,
) {
  const definition = getDailyMiniGameDefinition(miniGameId as DailyMiniGameId);
  if (!definition) return null;
  const now = new Date().toISOString();
  const dateKey = `${getDailyBlundrDateKey()}:${definition.id}:${nonce}`;
  const card = definition.generate({
    dateKey,
    now,
    mastery: null,
    difficulty: definition.recommendedFor[0] ?? "beginner",
    currentMastery: 0.25,
    confidence: 0.25,
    dueReviewCount: 0,
    selectedReviewCount: 0,
    recentMiniGameIds: [],
    recentFenKeys: [],
    sessionMiniGameIds: [],
    source: "standalone_review",
    seed: `${definition.id}|${dateKey}|${nonce}|standalone_review|${userIdOrLocalId ?? "local"}`,
    userIdOrLocalId,
    recentScenarioKeys,
    boardPreferences: null,
    deckId: `review:${definition.id}`,
    miniGameId: definition.id,
  });
  if (!card || card.kind !== "mini_game") return null;
  return {
    card,
    session: reconcileDailyBlundrSession({
      dateKey,
      deck: [card],
      existing: null,
    }),
    sessionDateKey: dateKey,
  };
}
