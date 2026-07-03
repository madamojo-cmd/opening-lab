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

const EMPTY_STATE_COPY = "Queue clear. Tempo does not have missed moves to review yet. Train an opening and Daily BLUNDR will start building your smart review loop.";
const COMPLETION_COPY = "Daily BLUNDR complete. Tempo saved the important mistakes for future review.";

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function buildFeedbackMessage(score: number, usedReveal: boolean, sessionComplete: boolean): { message: string; tone: "success" | "warning" | "complete" | "neutral" } {
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
    }
  }, [currentCard?.cardKey]);

  function commitAttempt(options: {
    attemptedMove?: string | null;
    revealOnlyReviewed?: boolean;
    usedReveal?: boolean;
  }) {
    if (!session || !currentCard) return;
    const attemptKey = currentCard.cardKey;
    if (submissionLockRef.current === attemptKey) return;
    submissionLockRef.current = attemptKey;

    try {
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
      const nextSession = applyDailyBlundrAttemptToSession(session, attempt);
      const nextMastery = updateDailyBlundrMastery({
        mastery,
        card: currentCard,
        attempt,
      });
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
      const nextReviewCards = upsertDailyBlundrReviewCards(reviewCards, [reviewUpdate]);
      const nextReviewAttempts = [...reviewAttempts, reviewAttempt];
      const reviewStats = buildDailyBlundrReviewStats({
        reviewCards: nextReviewCards,
        reviewAttempts: nextReviewAttempts,
        currentSession: nextSession,
        now,
      });
      const sessionCompleteNow = isDailyBlundrSessionComplete(nextSession);
      const feedbackState = buildFeedbackMessage(scoring.score, scoring.usedReveal, sessionCompleteNow);
      const commit = {
        card: currentCard,
        attempt,
        reviewAttempt,
        session: nextSession,
        mastery: nextMastery,
        reviewCards: nextReviewCards,
        reviewAttempts: nextReviewAttempts,
        reviewStats,
        scoring,
        feedback: feedbackState.message,
        sessionComplete: sessionCompleteNow,
      };
      setFeedback(feedbackState);
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
        locked={submissionLockRef.current === currentCard.cardKey}
        onMoveInputChange={setMoveInput}
        onSubmitMove={(value) => commitAttempt({ attemptedMove: value, usedReveal: support.usedReveal })}
        onBoardMoveAttempt={(attempt) => {
          commitAttempt({ attemptedMove: attempt.uci, usedReveal: support.usedReveal });
        }}
        onReveal={() => {
          const revealedAt = nowIso();
          setSupport((previous) => ({ ...previous, usedReveal: true, revealedAt, answerShown: true }));
          setFeedback({ message: `Tempo was looking for ${normalizeText(currentCard.expectedMoveSan ?? currentCard.expectedMoveUci ?? "the saved move")}.`, tone: "neutral" });
        }}
        onShowAnswer={() => {
          setSupport((previous) => ({ ...previous, answerShown: true }));
          setFeedback({ message: `Tempo was looking for ${normalizeText(currentCard.expectedMoveSan ?? currentCard.expectedMoveUci ?? "the saved move")}.`, tone: "neutral" });
        }}
        onMarkReviewed={() => {
          setSupport((previous) => ({
            usedReveal: true,
            revealedAt: previous.revealedAt ?? nowIso(),
            answerShown: true,
          }));
          commitAttempt({ revealOnlyReviewed: true, usedReveal: true });
        }}
      />
      <DailyBlundrCardFeedback message={feedback.message} tone={feedback.tone} />
    </div>
  );
}
