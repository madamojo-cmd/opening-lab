"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DailyBlundrPlayerProps, DailyBlundrSupportState } from "@/lib/blundr/daily/dailyBlundrPlayerTypes";
import { resolveDailyBlundrCardPlayMode } from "@/lib/blundr/daily/dailyBlundrPlayerTypes";
import { DailyBlundrCardPlayer } from "@/components/daily/DailyBlundrCardPlayer";
import { DailyBlundrCardFeedback } from "@/components/daily/DailyBlundrCardFeedback";
import { DailyBlundrSessionSummary } from "@/components/daily/DailyBlundrSessionSummary";
import { scoreDailyBlundrAttempt } from "@/lib/blundr/daily/dailyBlundrAttemptScoring";
import { gradeDailyBlundrAttempt } from "@/lib/blundr/daily/dailyBlundrSrs";
import { makeDailyBlundrReviewCardFromAttempt, upsertDailyBlundrReviewCards } from "@/lib/blundr/daily/dailyBlundrReviewCards";
import { buildDailyBlundrReviewStats } from "@/lib/blundr/daily/dailyBlundrReviewStats";
import { applyDailyBlundrAttemptToSession, getNextIncompleteCardIndex, isDailyBlundrSessionComplete } from "@/lib/blundr/daily/dailyBlundrSessionController";
import { updateDailyBlundrMastery } from "@/lib/blundr/daily/dailyBlundrMastery";
import type { DailyBlundrAttempt, DailyBlundrCard } from "@/lib/blundr/daily/dailyBlundrTypes";
import type { DailyBlundrReviewAttempt, DailyBlundrReviewCard } from "@/lib/blundr/daily/dailyBlundrReviewTypes";
import type { DailyBlundrMiniGameCard, DailyMiniGameAdvanceResult, DailyMiniGameState } from "@/lib/blundr/daily/miniGames/dailyMiniGameTypes";
import { getDailyMiniGameDefinition } from "@/lib/blundr/daily/miniGames/dailyMiniGameRegistry";
import { advanceKingRaceMiniGame } from "@/lib/blundr/daily/miniGames/kingRace";
import { advanceKnightGymnasiumMiniGame } from "@/lib/blundr/daily/miniGames/knightGymnasium";
import { advancePawnWarsMiniGame } from "@/lib/blundr/daily/miniGames/pawnWars";

const EMPTY_STATE_COPY = "Queue clear. Tempo does not have missed moves to review yet. Train an opening and Daily BLUNDR will start building your smart review loop.";
const COMPLETION_COPY = "Daily BLUNDR complete. Tempo saved the important mistakes for future review.";

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function cloneMiniGameState(state: DailyMiniGameState | null | undefined): DailyMiniGameState | null {
  if (!state) return null;
  return JSON.parse(JSON.stringify(state)) as DailyMiniGameState;
}

function buildRecallFeedbackMessage(score: number, usedReveal: boolean, sessionComplete: boolean): { message: string; tone: "success" | "warning" | "complete" | "neutral" } {
  if (sessionComplete) {
    return { message: COMPLETION_COPY, tone: "complete" };
  }
  if (usedReveal) {
    return { message: "Good review. This one will come back sooner.", tone: "warning" };
  }
  if (score >= 95) {
    return { message: "Nice. Tempo locked that one in.", tone: "success" };
  }
  return { message: "Tempo saved this for review.", tone: "warning" };
}

function buildMiniGameFeedbackMessage(card: DailyBlundrMiniGameCard, correct: boolean): { message: string; tone: "success" | "warning" } {
  if (card.miniGame.miniGameId === "king_race") {
    return correct
      ? { message: "Nice. Tempo found the path through the king traffic.", tone: "success" }
      : { message: "Tempo saved the king geometry for practice.", tone: "warning" };
  }
  if (card.miniGame.miniGameId === "knight_gymnasium") {
    return correct
      ? { message: "Clean route. Your knight found the pattern.", tone: "success" }
      : { message: "Tempo will bring this knight route back.", tone: "warning" };
  }
  return correct
    ? { message: "Passed pawn created. Tempo locked that race in.", tone: "success" }
    : { message: "Tempo saved this pawn race for review.", tone: "warning" };
}

function getCurrentCard(cards: readonly DailyBlundrCard[], sessionCardId: string | null, sessionIndex: number): DailyBlundrCard | null {
  if (sessionCardId) {
    const direct = cards.find((card) => card.cardKey === sessionCardId);
    if (direct) return direct;
  }
  return sessionIndex >= 0 ? cards[sessionIndex] ?? null : null;
}

function resolveCurrentCardIndex(cards: readonly DailyBlundrCard[], session: DailyBlundrPlayerProps["session"]): number {
  if (!session || !cards.length) return -1;
  if (session.currentCardId) {
    const directIndex = cards.findIndex((card) => card.cardKey === session.currentCardId);
    if (directIndex >= 0) return directIndex;
  }
  const nextIncomplete = getNextIncompleteCardIndex(session);
  if (nextIncomplete >= 0) {
    const nextCardId = session.cardOrder[nextIncomplete];
    const index = cards.findIndex((card) => card.cardKey === nextCardId || card.id === nextCardId);
    return index >= 0 ? index : nextIncomplete;
  }
  return -1;
}

function advanceMiniGame(
  card: DailyBlundrMiniGameCard,
  state: DailyMiniGameState,
  attempt: { from: string; to: string; uci: string; san: string | null; legal: boolean },
): DailyMiniGameAdvanceResult | null {
  const definition = getDailyMiniGameDefinition(card.miniGame.miniGameId);
  if (!definition) return null;
  if (state.miniGameId === "king_race") {
    return advanceKingRaceMiniGame(state, attempt);
  }
  if (state.miniGameId === "knight_gymnasium") {
    return advanceKnightGymnasiumMiniGame(state, attempt);
  }
  return advancePawnWarsMiniGame(state, attempt);
}

export function DailyBlundrPlayer({
  cards,
  session,
  reviewCards,
  reviewAttempts,
  mastery,
  onAttemptComplete,
  onSessionComplete,
}: DailyBlundrPlayerProps) {
  const [moveInput, setMoveInput] = useState("");
  const [support, setSupport] = useState<DailyBlundrSupportState>({ usedReveal: false, revealedAt: null, answerShown: false });
  const [feedback, setFeedback] = useState<{ message: string; tone: "success" | "warning" | "complete" | "neutral" }>({
    message: EMPTY_STATE_COPY,
    tone: "neutral",
  });
  const [miniGameState, setMiniGameState] = useState<DailyMiniGameState | null>(null);
  const attemptStartedAtRef = useRef<number | null>(null);
  const submissionLockRef = useRef<string | null>(null);

  const currentCardIndex = resolveCurrentCardIndex(cards, session);
  const currentCard = useMemo(() => getCurrentCard(cards, session?.currentCardId ?? null, currentCardIndex), [cards, currentCardIndex, session?.currentCardId]);
  const currentCardMode = currentCard ? resolveDailyBlundrCardPlayMode(currentCard) : "reveal_only";

  useEffect(() => {
    if (currentCard?.cardKey) {
      attemptStartedAtRef.current = Date.now();
      setMoveInput("");
      setSupport({ usedReveal: false, revealedAt: null, answerShown: false });
      submissionLockRef.current = null;
      if (currentCard.kind === "mini_game") {
        setMiniGameState(cloneMiniGameState(currentCard.miniGame));
      } else {
        setMiniGameState(null);
      }
    }
  }, [currentCard?.cardKey]);

  function finalizeAttempt(input: {
    card: DailyBlundrCard;
    attempt: DailyBlundrAttempt;
    scoring: {
      score: number;
      correct: boolean;
      partialCredit: number;
      usedReveal: boolean;
      outcome: DailyBlundrAttempt["outcome"];
      attemptedMoveUci?: string | null;
      attemptedMoveSan?: string | null;
      expectedMoveUci?: string | null;
      expectedMoveSan?: string | null;
      reason: string;
    };
    reviewAttempt?: DailyBlundrReviewAttempt | null;
    miniGameResult?: DailyMiniGameAdvanceResult | null;
  }) {
    if (!session) return;
    const attemptKey = input.card.cardKey;
    if (submissionLockRef.current === attemptKey) return;
    submissionLockRef.current = attemptKey;

    try {
      const now = nowIso();
      const nextSession = applyDailyBlundrAttemptToSession(session, input.attempt);
      const nextMastery = updateDailyBlundrMastery({
        mastery,
        card: input.card,
        attempt: input.attempt,
      });

      let nextReviewCards = reviewCards;
      let nextReviewAttempts = reviewAttempts;
      if (input.reviewAttempt) {
        const reviewCardId = input.card.reviewCardId ?? input.card.cardKey;
        const existingReviewCard = reviewCards.find((card) => card.id === reviewCardId || card.dedupeKey === input.card.reviewDedupeKey || card.id === input.card.reviewCardId) ?? null;
        const reviewUpdate = makeDailyBlundrReviewCardFromAttempt({
          sourceCard: input.card,
          attempt: input.attempt,
          existingCard: existingReviewCard,
          now,
        });
        nextReviewCards = upsertDailyBlundrReviewCards(reviewCards, [reviewUpdate]);
        nextReviewAttempts = [...reviewAttempts, input.reviewAttempt];
      }

      const reviewStats = buildDailyBlundrReviewStats({
        reviewCards: nextReviewCards,
        reviewAttempts: nextReviewAttempts,
        currentSession: nextSession,
        now,
      });
      const sessionCompleteNow = isDailyBlundrSessionComplete(nextSession);
      const feedbackState = input.card.kind === "mini_game"
        ? buildMiniGameFeedbackMessage(input.card as DailyBlundrMiniGameCard, input.scoring.correct)
        : buildRecallFeedbackMessage(input.scoring.score, input.scoring.usedReveal, sessionCompleteNow);
      const commit = {
        card: input.card,
        attempt: input.attempt,
        reviewAttempt: input.reviewAttempt ?? undefined,
        session: nextSession,
        mastery: nextMastery,
        reviewCards: nextReviewCards,
        reviewAttempts: nextReviewAttempts,
        reviewStats,
        scoring: input.scoring,
        feedback: feedbackState.message,
        sessionComplete: sessionCompleteNow,
        miniGameResult: input.miniGameResult ?? undefined,
      };
      setFeedback({
        message: feedbackState.message,
        tone: feedbackState.tone,
      });
      setMoveInput("");
      setSupport({ usedReveal: false, revealedAt: null, answerShown: false });
      onAttemptComplete?.(commit);
      if (commit.sessionComplete) {
        onSessionComplete?.(commit);
      }
    } finally {
      submissionLockRef.current = null;
    }
  }

  function commitRecallAttempt(options: {
    attemptedMove?: string | null;
    revealOnlyReviewed?: boolean;
    usedReveal?: boolean;
  }) {
    if (!session || !currentCard || currentCard.kind === "mini_game") return;
    const attemptKey = currentCard.cardKey;
    if (submissionLockRef.current === attemptKey) return;
    const startedAt = attemptStartedAtRef.current;
    const responseTimeMs = startedAt ? Math.max(0, Date.now() - startedAt) : null;
    const scoring = scoreDailyBlundrAttempt({
      card: currentCard,
      attemptedMove: options.attemptedMove ?? moveInput,
      usedReveal: Boolean(options.usedReveal),
      revealOnlyReviewed: Boolean(options.revealOnlyReviewed),
      responseTimeMs,
    });
    if (scoring.outcome === "skip" && !options.revealOnlyReviewed) {
      setFeedback({ message: "Enter a move or reveal the answer first.", tone: "neutral" });
      return;
    }

    const now = nowIso();
    const attempt: DailyBlundrAttempt = {
      id: `daily-attempt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      cardId: currentCard.cardKey,
      source: currentCard.source,
      createdAt: now,
      completedAt: now,
      outcome: scoring.outcome,
      correct: scoring.correct,
      attemptedMoveUci: scoring.attemptedMoveUci ?? null,
      attemptedMoveSan: scoring.attemptedMoveSan ?? null,
      responseMoveUci: scoring.attemptedMoveUci ?? null,
      responseMoveSan: scoring.attemptedMoveSan ?? null,
      expectedMoveUci: scoring.expectedMoveUci ?? currentCard.expectedMoveUci,
      expectedMoveSan: scoring.expectedMoveSan ?? currentCard.expectedMoveSan,
      usedReveal: scoring.usedReveal,
      responseTimeMs,
      note: scoring.reason,
    };
    const reviewCardId = currentCard.reviewCardId ?? currentCard.cardKey;
    const existingReviewCard = reviewCards.find((card) => card.id === reviewCardId || card.dedupeKey === currentCard.reviewDedupeKey || card.id === currentCard.reviewCardId) ?? null;
    const reviewUpdate = makeDailyBlundrReviewCardFromAttempt({
      sourceCard: currentCard,
      attempt,
      existingCard: existingReviewCard,
      now,
    });
    const reviewGrade = gradeDailyBlundrAttempt({
      promptKind: currentCard.reviewPromptKind ?? reviewUpdate.promptKind,
      correct: attempt.correct,
      partialCredit: scoring.partialCredit,
      usedReveal: scoring.usedReveal,
      responseTimeMs,
      previousCorrectStreak: existingReviewCard?.correctStreak ?? 0,
      expectedFastMs: currentCard.reviewPromptKind === "target_move_recall" ? 3_500 : 2_500,
    });
    const reviewAttempt: DailyBlundrReviewAttempt = {
      schemaVersion: 1,
      id: `review-attempt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      reviewCardId: reviewUpdate.id,
      sessionId: session.dateKey,
      cardId: currentCard.cardKey,
      startedAt: startedAt ? new Date(startedAt).toISOString() : undefined,
      completedAt: now,
      grade: reviewGrade,
      score: scoring.score / 100,
      correct: attempt.correct,
      partialCredit: scoring.partialCredit,
      responseMoveUci: attempt.responseMoveUci ?? null,
      usedReveal: scoring.usedReveal,
      responseTimeMs,
      failureType: reviewUpdate.failureType,
    };
    finalizeAttempt({
      card: currentCard,
      attempt,
      scoring,
      reviewAttempt,
    });
  }

  function commitMiniGameAttempt(result: DailyMiniGameAdvanceResult, attempt: { from: string; to: string; uci: string; san: string | null }) {
    if (!session || !currentCard || currentCard.kind !== "mini_game" || !currentCard.miniGame) return;
    const miniGameCard = currentCard as DailyBlundrMiniGameCard;
    const definition = getDailyMiniGameDefinition(miniGameCard.miniGame.miniGameId);
    if (!definition) return;
    const startedAt = attemptStartedAtRef.current;
    const responseTimeMs = startedAt ? Math.max(0, Date.now() - startedAt) : null;
    const scoring = definition.scoreAttempt({
      ...result.scoreInput,
      card: miniGameCard,
    });
    const now = nowIso();
    const gameAttempt: DailyBlundrAttempt = {
      id: `daily-mini-game-attempt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      cardId: currentCard.cardKey,
      source: currentCard.source,
      createdAt: now,
      completedAt: now,
      outcome: scoring.outcome,
      correct: scoring.correct,
      attemptedMoveUci: result.attemptedMoveUci ?? attempt.uci,
      attemptedMoveSan: result.attemptedMoveSan ?? attempt.san,
      responseMoveUci: result.responseMoveUci ?? null,
      responseMoveSan: result.responseMoveSan ?? null,
      expectedMoveUci: null,
      expectedMoveSan: null,
      usedReveal: false,
      responseTimeMs,
      note: result.reason,
    };
    finalizeAttempt({
      card: currentCard,
      attempt: gameAttempt,
      scoring,
      miniGameResult: result,
    });
  }

  if (!currentCard) {
    return (
      <div className="space-y-4">
        <DailyBlundrSessionSummary cards={cards} session={session} currentCard={null} reviewStats={buildDailyBlundrReviewStats({ reviewCards, reviewAttempts, currentSession: session, now: nowIso() })} />
        <DailyBlundrCardFeedback message={feedback.message} tone={feedback.tone} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DailyBlundrSessionSummary
        cards={cards}
        session={session}
        currentCard={currentCard}
        reviewStats={buildDailyBlundrReviewStats({
          reviewCards,
          reviewAttempts,
          currentSession: session,
          now: nowIso(),
        })}
      />
      <DailyBlundrCardPlayer
        card={currentCard}
        mode={currentCardMode}
        moveInput={moveInput}
        support={support}
        miniGameState={miniGameState}
        locked={submissionLockRef.current === currentCard.cardKey}
        onMoveInputChange={setMoveInput}
        onSubmitMove={(value) => commitRecallAttempt({ attemptedMove: value, usedReveal: support.usedReveal })}
        onBoardMoveAttempt={(attempt) => {
          if (currentCard.kind === "mini_game" && currentCard.miniGame && miniGameState) {
            const nextMiniGame = advanceMiniGame(currentCard as DailyBlundrMiniGameCard, miniGameState, attempt);
            if (!nextMiniGame) return;
            setMiniGameState(nextMiniGame.state);
            if (nextMiniGame.completed) {
              commitMiniGameAttempt(nextMiniGame, attempt);
            } else {
              setFeedback({ message: "Tempo is still threading the route.", tone: "neutral" });
            }
            return;
          }
          commitRecallAttempt({ attemptedMove: attempt.uci, usedReveal: support.usedReveal });
        }}
        onReveal={() => {
          if (currentCard.kind === "mini_game") return;
          const revealedAt = nowIso();
          setSupport((previous) => ({ ...previous, usedReveal: true, revealedAt, answerShown: true }));
          setFeedback({ message: `Tempo was looking for ${normalizeText(currentCard.expectedMoveSan ?? currentCard.expectedMoveUci ?? "the saved move")}.`, tone: "neutral" });
        }}
        onShowAnswer={() => {
          if (currentCard.kind === "mini_game") return;
          setSupport((previous) => ({ ...previous, answerShown: true }));
          setFeedback({ message: `Tempo was looking for ${normalizeText(currentCard.expectedMoveSan ?? currentCard.expectedMoveUci ?? "the saved move")}.`, tone: "neutral" });
        }}
        onMarkReviewed={() => {
          if (currentCard.kind === "mini_game") return;
          setSupport((previous) => ({
            usedReveal: true,
            revealedAt: previous.revealedAt ?? nowIso(),
            answerShown: true,
          }));
          commitRecallAttempt({ revealOnlyReviewed: true, usedReveal: true });
        }}
      />
      <DailyBlundrCardFeedback message={feedback.message} tone={feedback.tone} />
    </div>
  );
}
