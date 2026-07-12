"use client";

import Link from "next/link";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { ArrowLeft, Home, RefreshCw, Sparkles } from "lucide-react";
import { BLUNDR_EMPTY_STATE_ASSETS, BLUNDR_TEMPO_ASSETS } from "@/lib/blundr/assets/blundrAssetManifest";
import { getLocalAccountCurrentUserId } from "@/lib/blundr/accounts/localAccountStorage";
import { BlundrAssetImage } from "@/components/assets/BlundrAssetImage";
import { DailyBlundrBoard } from "@/components/daily/DailyBlundrBoard";
import { DailyBlundrCardFeedback } from "@/components/daily/DailyBlundrCardFeedback";
import { getDailyBlundrDateKey, reconcileDailyBlundrSession } from "@/lib/blundr/daily/dailyBlundrStorage";
import type { DailyBlundrMiniGameCard, DailyMiniGameAdvanceResult, DailyMiniGameId, DailyMiniGameState } from "@/lib/blundr/daily/miniGames/dailyMiniGameTypes";
import type { DailyBlundrBoardMoveAttempt } from "@/lib/blundr/daily/dailyBlundrPlayerTypes";
import { ProfileSettingsIcon } from "@/components/navigation/ProfileSettingsIcon";
import { BlundrStateCard } from "@/components/blundr/ui";
import { buildMiniGameBoardFeedback } from "@/lib/blundr/daily/miniGames/runner/miniGameBoardFeedbackAdapter";
import { selectProductionScenario, type ProductionMiniGameId } from "@/lib/blundr/daily/miniGames/generated/minigameContentLoader";
import { adaptProductionScenarioToCard, advanceProductionMiniGame } from "@/lib/blundr/daily/miniGames/generated/productionMiniGameAdapter";
import type { Square } from "@/lib/blundr/geometry/boardTypes";
import type { LegacyMiniGamePracticeBundle } from "@/lib/blundr/daily/miniGames/legacyMiniGamePractice";
import {
  canSubmitMove,
  createInitialMiniGameRunnerState,
  miniGameRunnerReducer,
  shouldAllowRetry,
  shouldShowReveal,
  type MiniGameRunnerScenario,
} from "@/lib/blundr/daily/miniGames/runner/miniGameRunnerState";

type PracticeBundle = LegacyMiniGamePracticeBundle;

type MiniGamePracticeRunnerProps = {
  miniGameId: DailyMiniGameId | string;
  homeHref?: string;
  reviewHref?: string;
  settingsHref?: string;
};

const BLUNDR_MINIGAME_ENGINE_CACHE_READY_EVENT = "blundr:minigame-engine-cache-ready";
const PRODUCTION_MINIGAME_METADATA: Record<ProductionMiniGameId, { title: string; summary: string }> = {
  tactic_shots: { title: "Tactic Shots", summary: "Find the forcing move." },
  knight_gymnasium: { title: "Knight Gymnasium", summary: "Train knight geometry." },
  key_square_conquest: { title: "Key Square Conquest", summary: "Claim the durable square." },
  structure_builder: { title: "Structure Builder", summary: "Improve the pawn structure." },
  imbalance_arena: { title: "Imbalance Arena", summary: "Convert the useful imbalance." },
  technique_lab: { title: "Technique Lab", summary: "Apply the endgame technique." },
  king_race: { title: "King Race", summary: "Choose the winning king route." },
  pawn_wars: { title: "Pawn Wars", summary: "Calculate the pawn race." },
};

function isProductionMiniGameId(value: string): value is ProductionMiniGameId {
  return Object.prototype.hasOwnProperty.call(PRODUCTION_MINIGAME_METADATA, value);
}

function parseUciMove(uci: string): { from: Square; to: Square; promotion?: string } | null {
  const normalized = normalizeText(uci).toLowerCase();
  if (!/^[a-h][1-8][a-h][1-8][nbrq]?$/.test(normalized)) return null;
  return {
    from: normalized.slice(0, 2),
    to: normalized.slice(2, 4),
    promotion: normalized.slice(4) || undefined,
  };
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function cloneMiniGameState(state: DailyMiniGameState | null | undefined): DailyMiniGameState | null {
  if (!state) return null;
  return JSON.parse(JSON.stringify(state)) as DailyMiniGameState;
}

export async function buildProductionPracticeBundle(
  miniGameId: string,
  nonce: number,
  recentScenarioKeys: readonly string[],
  userIdOrLocalId: string | null,
): Promise<PracticeBundle | null> {
  if (!isProductionMiniGameId(miniGameId)) return null;
  const dateKey = `${getDailyBlundrDateKey()}:${miniGameId}:${nonce}`;
  const scenario = await selectProductionScenario({
    miniGameId,
    selectionKey: `${userIdOrLocalId ?? "local"}:${dateKey}:${nonce}`,
    recentlyPlayedIds: recentScenarioKeys,
  });
  const card = adaptProductionScenarioToCard({ scenario, source: "standalone_review" });
  const session = reconcileDailyBlundrSession({ dateKey, deck: [card], existing: null });
  return { card, session, sessionDateKey: dateKey };
}

export function buildMiniGameRunnerScenarioFromCard(card: DailyBlundrMiniGameCard): MiniGameRunnerScenario | null {
  const miniGame = card.miniGame;
  const scenario = miniGame?.scenario ?? null;
  if (!scenario) return null;
  const parsedSolution = parseUciMove(scenario.solution.uci);
  const from = parsedSolution?.from ?? scenario.solution.uci.slice(0, 2);
  const to = parsedSolution?.to ?? scenario.solution.uci.slice(2, 4);
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
      promotion: parsedSolution?.promotion === "q" || parsedSolution?.promotion === "r" || parsedSolution?.promotion === "b" || parsedSolution?.promotion === "n" ? parsedSolution.promotion : undefined,
      verification: {
        verified: true,
        verifier: "legacy-mini-game-adapter",
      },
    },
    overlays: {
      selectedSquares: from ? [from] : undefined,
      targetSquares: scenario.targetSquares?.length ? [...scenario.targetSquares] : undefined,
      keySquares: scenario.goalSquares?.length ? [...scenario.goalSquares] : undefined,
      arrows: from && to ? [{ from, to, type: "solution" }] : undefined,
      route: from && to ? [from, to] : undefined,
      lastMove: from && to ? { from, to } : undefined,
    },
    conceptTags: [...scenario.conceptTags],
  };
}

function buildMiniGameFeedback(result: DailyMiniGameAdvanceResult | null): { message: string; tone: "success" | "warning" | "complete" | "neutral" } {
  if (!result) {
    return { message: "That move could not be applied. Try a different line.", tone: "warning" };
  }
  if (result.completed && result.won) {
    return {
      message: `Correct. Blundr locked the line in.`,
      tone: "complete",
    };
  }
  if (!result.legal) {
    return {
      message: "Illegal move. Blundr could not apply that attempt.",
      tone: "warning",
    };
  }
  return {
    message: "Not yet. Blundr will keep this line in practice.",
    tone: "warning",
  };
}

function advanceMiniGame(card: DailyBlundrMiniGameCard, state: DailyMiniGameState, attempt: DailyBlundrBoardMoveAttempt): DailyMiniGameAdvanceResult | null {
  return advanceProductionMiniGame(state, attempt);
}

function MiniGameRunnerPanel({
  bundle,
  homeHref,
  reviewHref,
  settingsHref,
  onAdvanceScenario,
}: {
  bundle: PracticeBundle;
  homeHref: string;
  reviewHref: string;
  settingsHref: string;
  onAdvanceScenario: () => void;
}) {
  const scenario = useMemo(() => buildMiniGameRunnerScenarioFromCard(bundle.card), [bundle.card.cardKey]);
  const [runnerState, dispatch] = useReducer(miniGameRunnerReducer, scenario, createInitialMiniGameRunnerState);
  const [miniGameState, setMiniGameState] = useState<DailyMiniGameState | null>(() => cloneMiniGameState(bundle.card.miniGame));
  const validationLockRef = useRef(false);
  const debugEnabled = process.env.NEXT_PUBLIC_BLUNDR_MINIGAME_DEBUG === "1";
  const activeScenario = runnerState.scenario ?? scenario;
  const boardFeedback = useMemo(() => {
    if (!activeScenario) {
      return { squareStyles: {}, boardVisuals: null, animationClassName: null };
    }
    return buildMiniGameBoardFeedback(activeScenario, runnerState);
  }, [activeScenario, runnerState]);

  useEffect(() => {
    validationLockRef.current = false;
    setMiniGameState(cloneMiniGameState(bundle.card.miniGame));
    if (scenario) {
      dispatch({ type: "LOAD_SCENARIO", scenario });
      if (debugEnabled) {
        console.debug("[MiniGamePracticeRunner] loadScenario", {
          scenarioKey: scenario.scenarioKey,
          source: scenario.source,
          boardFen: scenario.board.fen,
          boardOrientation: scenario.board.orientation,
        });
      }
    }
  }, [bundle.card.cardKey, bundle.card.miniGame, debugEnabled, scenario]);

  useEffect(() => {
    if (!debugEnabled) return;
    console.debug("[MiniGamePracticeRunner] stateTransition", {
      scenarioKey: runnerState.scenario?.scenarioKey ?? null,
      status: runnerState.status,
      selectedSquare: runnerState.selectedSquare,
      attemptCount: runnerState.attemptCount,
      boardFen: runnerState.boardFen,
      revealed: runnerState.revealed,
      disabledDuringValidation: runnerState.disabledDuringValidation,
    });
  }, [debugEnabled, runnerState]);

  if (!scenario) {
    return (
      <div className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <BlundrAssetImage asset={BLUNDR_EMPTY_STATE_ASSETS.errorSafeFallback} alt="Safe fallback" variant="emptyState" className="mx-auto sm:mx-0 sm:shrink-0" />
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Safe fallback</div>
            <p className="mt-2 text-sm leading-6 text-stone-600">No progress is lost when a practice game is unavailable.</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Link href={reviewHref} className="inline-flex items-center gap-2 rounded-2xl bg-green-700 px-4 py-3 text-sm font-black text-white shadow-sm">
            <ArrowLeft size={16} />
            Back to Review
          </Link>
          <Link href={homeHref} className="inline-flex items-center gap-2 rounded-2xl bg-stone-100 px-4 py-3 text-sm font-black text-stone-700 shadow-sm">
            <Home size={16} />
            Home
          </Link>
        </div>
      </div>
    );
  }

  const boardDisabled = runnerState.disabledDuringValidation || runnerState.status === "correct" || runnerState.status === "revealed";

  function handleSquareClick(square: string, piece: { type: string; color: string } | null) {
    if (boardDisabled) return;
    const clickedSquare = normalizeText(square).toLowerCase();
    const selectedSquare = runnerState.selectedSquare;
    const turn = activeScenario.board.sideToMove;
    const isOwnPiece = Boolean(piece && piece.color === turn);
    if (!isOwnPiece) {
      if (selectedSquare && selectedSquare === clickedSquare) {
        dispatch({ type: "USER_CLEAR_SELECTION" });
      }
      return;
    }
    if (selectedSquare === clickedSquare) {
      dispatch({ type: "USER_CLEAR_SELECTION" });
      return;
    }
    dispatch({ type: "USER_SELECT_SQUARE", square: clickedSquare });
  }

  function handleMoveAttempt(attempt: DailyBlundrBoardMoveAttempt) {
    if (validationLockRef.current || !canSubmitMove(runnerState) || !miniGameState) return;
    validationLockRef.current = true;
    try {
      if (debugEnabled) {
        console.debug("[MiniGamePracticeRunner] submitMove", {
          scenarioKey: scenario.scenarioKey,
          source: "user",
          from: attempt.from,
          to: attempt.to,
          uci: attempt.uci,
          san: attempt.san,
        });
      }
      dispatch({
        type: "USER_SUBMIT_MOVE",
        from: attempt.from,
        to: attempt.to,
        uci: attempt.uci,
        san: attempt.san,
      });
      const result = advanceMiniGame(bundle.card, miniGameState, attempt);
      const completed = Boolean(result?.completed && result?.won);
      const nextMiniGameState = result?.state ?? miniGameState;
      setMiniGameState(cloneMiniGameState(nextMiniGameState));
      dispatch({
        type: "VALIDATION_RESULT",
        status: completed ? "correct" : "incorrect",
        boardFen: nextMiniGameState.currentFen ?? scenario.board.fen,
        feedback: buildMiniGameFeedback(result),
        reason: result?.reason ?? "validation_result",
      });
      if (debugEnabled) {
        console.debug("[MiniGamePracticeRunner] validationResult", {
          scenarioKey: scenario.scenarioKey,
          status: completed ? "correct" : "incorrect",
          reason: result?.reason ?? "validation_result",
          boardFen: nextMiniGameState.currentFen ?? scenario.board.fen,
          completed: result?.completed ?? false,
          won: result?.won ?? false,
        });
      }
    } finally {
      validationLockRef.current = false;
    }
  }

  function handleReveal() {
    if (!shouldShowReveal(runnerState)) return;
    dispatch({ type: "USER_REVEAL" });
    if (debugEnabled) {
      console.debug("[MiniGamePracticeRunner] reveal", {
        scenarioKey: scenario.scenarioKey,
        source: "user",
        boardFen: runnerState.boardFen,
      });
    }
  }

  function handleTryAgain() {
    if (!shouldAllowRetry(runnerState)) return;
    validationLockRef.current = false;
    setMiniGameState(cloneMiniGameState(bundle.card.miniGame));
    dispatch({ type: "USER_TRY_AGAIN" });
    if (debugEnabled) {
      console.debug("[MiniGamePracticeRunner] tryAgain", {
        scenarioKey: scenario.scenarioKey,
        source: "user",
      });
    }
  }

  function handleNextScenario() {
    validationLockRef.current = false;
    dispatch({ type: "USER_NEXT_SCENARIO" });
    setMiniGameState(cloneMiniGameState(bundle.card.miniGame));
    if (debugEnabled) {
      console.debug("[MiniGamePracticeRunner] nextScenario", {
        scenarioKey: scenario.scenarioKey,
        source: "user",
      });
    }
    onAdvanceScenario();
  }

  const revealVisible = shouldShowReveal(runnerState);
  const retryVisible = shouldAllowRetry(runnerState);
  const feedback = runnerState.feedback ?? { message: "Tap a piece, then tap a destination.", tone: "neutral" as const };

  return (
    <div className="space-y-4">
      <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-green-700">
              <Sparkles size={14} />
              Minigames
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-stone-950">{bundle.card.openingName || "Daily Blundr"}</h1>
            <p className="mt-2 text-sm leading-6 text-stone-600">{bundle.card.summary}</p>
          </div>
          <div className="flex items-center gap-2">
            <ProfileSettingsIcon />
            <Link href={reviewHref} className="rounded-2xl bg-stone-100 p-3 text-stone-600 shadow-sm" aria-label="Back to Review">
              <ArrowLeft size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <BlundrAssetImage asset={BLUNDR_TEMPO_ASSETS.pointing} alt="Blundr pointing" variant="tempoCard" className="mx-auto w-full max-w-[9rem] sm:mx-0 sm:w-32" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-green-700">
                {bundle.card.miniGame.scenario?.source === "standalone_review" ? "Practice only" : "Daily Blundr"}
              </span>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">
                {scenario.board.orientation === "white" ? "White bottom" : "Black bottom"}
              </span>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">
                {scenario.estimatedTimeSeconds ? `${scenario.estimatedTimeSeconds}s` : "Quick"}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              Skills: <span className="font-black text-stone-900">{bundle.card.conceptIds.join(", ")}</span>
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Blundr uses the same board theme, move grading, and Daily controls here. Practice does not mark the Daily Blundr deck complete.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Objective</div>
                <p className="mt-2 text-sm font-semibold leading-6 text-stone-800">{scenario.prompt}</p>
                <p className="mt-2 text-sm leading-6 text-stone-600">{scenario.goal}</p>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-stone-500 ring-1 ring-stone-200">
                {runnerState.status}
              </div>
            </div>
          </div>

          <div className="relative">
            <DailyBlundrBoard
              fen={runnerState.boardFen || activeScenario.board.fen}
              disabled={boardDisabled}
              onSquareClick={handleSquareClick}
              onMoveAttempt={handleMoveAttempt}
              openingColor={activeScenario.board.orientation}
              forcedOrientation={activeScenario.board.orientation}
              boardVisuals={boardFeedback.boardVisuals}
              squareStyles={boardFeedback.squareStyles}
              animationClassName={boardFeedback.animationClassName}
            />
          </div>

          {runnerState.revealed ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              <div className="text-xs font-black uppercase tracking-[0.22em] text-amber-700">Answer</div>
              <p className="mt-2 font-semibold">Blundr was looking for {activeScenario.solution.primaryMoveUci}.</p>
              <p className="mt-2 text-sm leading-6 text-amber-900/90">
                From <span className="font-black">{activeScenario.solution.from}</span> to <span className="font-black">{activeScenario.solution.to}</span>
              </p>
              <p className="mt-2 text-sm leading-6 text-amber-900/90">{activeScenario.explanation}</p>
              {activeScenario.solution.acceptedMoves.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {activeScenario.solution.acceptedMoves.slice(0, 4).map((move) => (
                    <span key={move} className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-amber-700 ring-1 ring-amber-200">
                      {move}
                    </span>
                  ))}
                </div>
              ) : null}
              {activeScenario.overlays.targetSquares?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {activeScenario.overlays.targetSquares.map((square) => (
                    <span key={square} className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-amber-700 ring-1 ring-amber-200">
                      {square}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <DailyBlundrCardFeedback message={feedback.message} tone={feedback.tone} />

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {revealVisible ? (
              <button
                type="button"
                onClick={handleReveal}
                disabled={runnerState.disabledDuringValidation}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white px-3 py-3 text-sm font-black text-green-700 ring-1 ring-green-200 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Sparkles size={15} />
                Reveal
              </button>
            ) : (
              <div className="rounded-2xl bg-stone-50 px-3 py-3 text-xs font-black uppercase tracking-[0.18em] text-stone-400">
                Reveal hidden
              </div>
            )}

            {retryVisible ? (
              <button
                type="button"
                onClick={handleTryAgain}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-stone-100 px-3 py-3 text-sm font-black text-stone-700 shadow-sm transition hover:bg-stone-200"
              >
                Try Again
              </button>
            ) : (
              <div className="rounded-2xl bg-stone-50 px-3 py-3 text-xs font-black uppercase tracking-[0.18em] text-stone-400">
                Retry unavailable
              </div>
            )}

            <button
              type="button"
              onClick={handleNextScenario}
              disabled={runnerState.disabledDuringValidation}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-green-700 px-3 py-3 text-sm font-black text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={15} />
              Next Scenario
            </button>

            <Link href={reviewHref} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-stone-100 px-3 py-3 text-sm font-black text-stone-700 shadow-sm">
              <Home size={15} />
              Review
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.25rem] border border-stone-200 bg-white p-4">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Selected</div>
              <div className="mt-2 text-lg font-black tracking-tight text-stone-950">{runnerState.selectedSquare ?? "None"}</div>
            </div>
            <div className="rounded-[1.25rem] border border-stone-200 bg-white p-4">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Attempts</div>
              <div className="mt-2 text-lg font-black tracking-tight text-stone-950">{runnerState.attemptCount}</div>
            </div>
            <div className="rounded-[1.25rem] border border-stone-200 bg-white p-4">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Board</div>
              <div className="mt-2 text-lg font-black tracking-tight text-stone-950">{scenario.board.orientation === "white" ? "White at bottom" : "Black at bottom"}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Scenario</div>
          <div className="mt-2 text-lg font-black tracking-tight text-stone-950">{scenario.family}</div>
          <p className="mt-2 text-sm leading-6 text-stone-600">{scenario.instruction}</p>
        </div>
        <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Practice seed</div>
          <div className="mt-2 text-lg font-black tracking-tight text-stone-950">{scenario.scenarioKey}</div>
          <p className="mt-2 text-sm leading-6 text-stone-600">A fresh scenario appears each time you tap Next Scenario.</p>
        </div>
      </section>
    </div>
  );
}

export function MiniGamePracticeRunner({ miniGameId, homeHref = "/", reviewHref = "/review", settingsHref = "/settings" }: MiniGamePracticeRunnerProps) {
  const [practiceNonce, setPracticeNonce] = useState(0);
  const [engineRefreshTick, setEngineRefreshTick] = useState(0);
  const [practiceBundle, setPracticeBundle] = useState<PracticeBundle | null>(null);
  const [practiceLoading, setPracticeLoading] = useState(true);
  const recentScenarioKeysRef = useRef<string[]>([]);
  const userIdOrLocalId = useMemo(() => getLocalAccountCurrentUserId() ?? "local", []);

  useEffect(() => {
    let cancelled = false;
    setPracticeLoading(true);
    setPracticeBundle(null);
    void buildProductionPracticeBundle(miniGameId, practiceNonce, recentScenarioKeysRef.current, userIdOrLocalId)
      .then((bundle) => {
        if (cancelled) return;
        setPracticeBundle(bundle);
      })
      .catch(() => {
        if (!cancelled) setPracticeBundle(null);
      })
      .finally(() => {
        if (!cancelled) setPracticeLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [miniGameId, practiceNonce, engineRefreshTick, userIdOrLocalId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleCacheReady = () => {
      setEngineRefreshTick((value) => value + 1);
    };
    window.addEventListener(BLUNDR_MINIGAME_ENGINE_CACHE_READY_EVENT, handleCacheReady);
    return () => {
      window.removeEventListener(BLUNDR_MINIGAME_ENGINE_CACHE_READY_EVENT, handleCacheReady);
    };
  }, []);

  useEffect(() => {
    const scenarioKey = normalizeText(practiceBundle?.card.miniGame?.scenario?.novelty.scenarioKey);
    if (!scenarioKey) return;
    recentScenarioKeysRef.current = [scenarioKey, ...recentScenarioKeysRef.current.filter((entry) => normalizeText(entry).toLowerCase() !== scenarioKey.toLowerCase())].slice(0, 8);
  }, [practiceBundle?.card.cardKey, practiceBundle?.card.miniGame?.scenario?.novelty.scenarioKey]);

  const productionId = isProductionMiniGameId(miniGameId) ? miniGameId : null;
  const metadata = productionId ? PRODUCTION_MINIGAME_METADATA[productionId] : null;

  if (!metadata) {
    return (
      <section className="space-y-4">
        <header className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-green-700">
                <Sparkles size={14} />
                Minigames
              </div>
              <h1 className="mt-3 text-2xl font-black tracking-tight text-stone-950">Practice game unavailable</h1>
              <p className="mt-2 text-sm leading-6 text-stone-600">Blundr could not find a playable practice game here. Return to Review and pick another card.</p>
            </div>
            <ProfileSettingsIcon />
          </div>
        </header>

        <div className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <BlundrAssetImage asset={BLUNDR_EMPTY_STATE_ASSETS.errorSafeFallback} alt="Safe fallback" variant="emptyState" className="mx-auto sm:mx-0 sm:shrink-0" />
            <div>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Safe fallback</div>
              <p className="mt-2 text-sm leading-6 text-stone-600">No progress is lost when a practice game is unavailable.</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Link href={reviewHref} className="inline-flex items-center gap-2 rounded-2xl bg-green-700 px-4 py-3 text-sm font-black text-white shadow-sm">
              <ArrowLeft size={16} />
              Back to Review
            </Link>
            <Link href={homeHref} className="inline-flex items-center gap-2 rounded-2xl bg-stone-100 px-4 py-3 text-sm font-black text-stone-700 shadow-sm">
              <Home size={16} />
              Home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (practiceLoading || !practiceBundle) {
    return (
      <BlundrStateCard
        kind="loading"
        eyebrow="Minigames"
        title="Loading an adjudicated practice game."
        copy="Blundr is checking the next scenario through Stockfish before it appears."
      />
    );
  }

  return (
    <section className="space-y-4">
      <header className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-green-700">
              <Sparkles size={14} />
              Minigames
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-stone-950">{metadata.title}</h1>
            <p className="mt-2 text-sm leading-6 text-stone-600">{metadata.summary}</p>
          </div>
          <div className="flex items-center gap-2">
            <ProfileSettingsIcon />
            <Link href={reviewHref} className="rounded-2xl bg-stone-100 p-3 text-stone-600 shadow-sm" aria-label="Back to Review">
              <ArrowLeft size={18} />
            </Link>
          </div>
        </div>
      </header>

      <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <BlundrAssetImage asset={BLUNDR_TEMPO_ASSETS.pointing} alt="Blundr pointing" variant="tempoCard" className="mx-auto w-full max-w-[9rem] sm:mx-0 sm:w-32" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-green-700">
                {practiceBundle.card.miniGame.scenario?.source === "standalone_review" ? "Practice only" : "Daily Blundr"}
              </span>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">
                {practiceBundle.card.miniGame.learnerSide === "white" ? "White bottom" : "Black bottom"}
              </span>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">
                {practiceBundle.card.miniGame.scenario?.estimatedTimeSeconds ? `${practiceBundle.card.miniGame.scenario.estimatedTimeSeconds}s` : "Quick"}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              Skills: <span className="font-black text-stone-900">{Array.isArray(practiceBundle.card.conceptIds) && practiceBundle.card.conceptIds.length > 0 ? practiceBundle.card.conceptIds.join(", ") : "General practice"}</span>
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Blundr uses the same board theme, move grading, and Daily controls here. Practice does not mark the Daily Blundr deck complete.
            </p>
          </div>
        </div>
      </section>

      <MiniGameRunnerPanel
        bundle={practiceBundle}
        homeHref={homeHref}
        reviewHref={reviewHref}
        settingsHref={settingsHref}
        onAdvanceScenario={() => {
          setPracticeNonce((value) => value + 1);
        }}
      />
    </section>
  );
}
