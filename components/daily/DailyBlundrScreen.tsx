"use client";

import Link from "next/link";
import { Chess } from "chess.js";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, BadgeCheck, BookOpen, CheckCircle2, ChevronRight, Clock3, Flame, Sparkles, Target, Trophy, XCircle } from "lucide-react";
import { loadDailyBlundrOverview } from "@/lib/blundr/daily/dailyBlundrReadModel";
import { buildDailyBlundrProgressAfterCompletion, addDailyBlundrAttempt, markDailyBlundrSessionCardComplete, markDailyBlundrSessionStarted, saveDailyBlundrStore } from "@/lib/blundr/daily/dailyBlundrStorage";
import { buildDailyBlundrReviewStats } from "@/lib/blundr/daily/dailyBlundrReviewStats";
import { makeDailyBlundrReviewCardFromAttempt, upsertDailyBlundrReviewCards as mergeDailyBlundrReviewCards } from "@/lib/blundr/daily/dailyBlundrReviewCards";
import { gradeDailyBlundrAttempt } from "@/lib/blundr/daily/dailyBlundrSrs";
import { writeDailyBlundrReviewAttempts, writeDailyBlundrReviewCards } from "@/lib/blundr/daily/dailyBlundrReviewStorage";
import { summarizeDailyBlundrMastery, updateDailyBlundrMastery } from "@/lib/blundr/daily/dailyBlundrMastery";
import { gradeDailyBlundrMove } from "@/lib/blundr/daily/dailyMoveGrader";
import type { DailyBlundrAttempt, DailyBlundrCard, DailyBlundrSession } from "@/lib/blundr/daily/dailyBlundrTypes";
import type { DailyBlundrReviewAttempt, DailyBlundrReviewCard } from "@/lib/blundr/daily/dailyBlundrReviewTypes";
import { buildDailyBlundrPositionKey } from "@/lib/blundr/daily/adapters/progressMistakeAdapter";

type Orientation = "white" | "black";

const EMPTY_STATE_COPY = "Queue clear. Tempo does not have missed moves to review yet. Train an opening and Daily BLUNDR will start building your smart review loop.";
const COMPLETION_COPY = "Daily BLUNDR complete. Tempo saved the important mistakes for future review.";

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function pieceGlyph(piece: { type: string; color: string } | null): string {
  if (!piece) return "";
  const map: Record<string, { w: string; b: string }> = {
    p: { w: "♙", b: "♟" },
    n: { w: "♘", b: "♞" },
    b: { w: "♗", b: "♝" },
    r: { w: "♖", b: "♜" },
    q: { w: "♕", b: "♛" },
    k: { w: "♔", b: "♚" },
  };
  const entry = map[piece.type];
  return entry ? entry[piece.color === "w" ? "w" : "b"] : "";
}

function getOrientation(fen: string): Orientation {
  try {
    const chess = new Chess(fen);
    return chess.turn() === "b" ? "black" : "white";
  } catch {
    return "white";
  }
}

function getCardTitle(card: DailyBlundrCard): string {
  return normalizeText(card.openingName) || "Daily recall";
}

function getCardSubtitle(card: DailyBlundrCard): string {
  const parts = [card.sourceCount > 0 ? `${card.sourceCount} signal${card.sourceCount === 1 ? "" : "s"}` : null, card.expectedMoveSan ? "move hidden until solve" : null].filter(Boolean);
  return parts.length ? parts.join(" • ") : "Tempo picked this for review.";
}

function getCurrentCard(session: DailyBlundrSession, cards: DailyBlundrCard[]): DailyBlundrCard | null {
  const direct = session.currentCardId ? cards.find((card) => card.cardKey === session.currentCardId) ?? null : null;
  if (direct) return direct;
  return cards.find((card) => !session.completedCardIds.includes(card.cardKey)) ?? null;
}

function isSessionComplete(session: DailyBlundrSession, cards: DailyBlundrCard[]): boolean {
  return cards.length > 0 && session.completedCardIds.length >= cards.length;
}

function BoardPreview({ fen }: { fen: string }) {
  const board = useMemo(() => {
    try {
      return new Chess(fen).board();
    } catch {
      return null;
    }
  }, [fen]);
  const orientation = getOrientation(fen);
  if (!board) {
    return (
      <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-500">
        Tempo could not load this position.
      </div>
    );
  }

  const rows = orientation === "white" ? board : [...board].reverse();
  const squares = rows.flatMap((rank, rowIndex) => {
    const squaresInRow = orientation === "white" ? rank : [...rank].reverse();
    return squaresInRow.map((piece, fileIndex) => {
      const boardRow = orientation === "white" ? rowIndex : 7 - rowIndex;
      const boardFile = orientation === "white" ? fileIndex : 7 - fileIndex;
      const square = `${String.fromCharCode(97 + boardFile)}${8 - boardRow}`;
      const isDark = (boardRow + boardFile) % 2 === 1;
      return {
        square,
        piece,
        isDark,
      };
    });
  });

  return (
    <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
      <div className="grid grid-cols-8">
        {squares.map(({ square, piece, isDark }) => (
          <div
            key={square}
            className={`flex aspect-square items-center justify-center text-2xl font-black ${isDark ? "bg-[#8a6d4f] text-white" : "bg-[#e8dcc8] text-stone-900"}`}
          >
            <span aria-hidden>{pieceGlyph(piece)}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between bg-stone-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-stone-500">
        <span>{orientation === "white" ? "White at bottom" : "Black at bottom"}</span>
        <span>{buildDailyBlundrPositionKey(fen)}</span>
      </div>
    </div>
  );
}

export function DailyBlundrScreen() {
  const [overview, setOverview] = useState<ReturnType<typeof loadDailyBlundrOverview> | null>(null);
  const [moveInput, setMoveInput] = useState("");
  const [feedback, setFeedback] = useState<string>(EMPTY_STATE_COPY);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const cardStartedAtRef = useRef<number | null>(null);

  useEffect(() => {
    const next = loadDailyBlundrOverview(5);
    setOverview(next);
    if (next.deck.isEmpty) {
      setFeedback(EMPTY_STATE_COPY);
    } else if (next.reviewStats.dueToday > 0) {
      setFeedback(`Tempo found ${next.reviewStats.dueToday} reviews ready.`);
    } else {
      setFeedback("Queue clear. Tempo is using a small bootstrap set.");
    }
  }, []);

  useEffect(() => {
    if (!overview) return;
    saveDailyBlundrStore(overview.store);
    writeDailyBlundrReviewCards(overview.reviewCards);
    writeDailyBlundrReviewAttempts(overview.reviewAttempts);
  }, [overview]);

  const deck = overview?.deck.cards ?? [];
  const session = overview?.currentSession ?? null;
  const reviewStats = overview?.reviewStats ?? {
    totalReviewCards: 0,
    dueToday: 0,
    overdue: 0,
    completedToday: 0,
    savedForReview: 0,
    mastered: 0,
    leech: 0,
    suspended: 0,
    readyToday: 0,
    selectedToday: 0,
  };
  const masterySummary = summarizeDailyBlundrMastery(overview?.store.mastery ?? null);
  const currentCard = session && deck.length ? getCurrentCard(session, deck) : null;
  const complete = Boolean(session && isSessionComplete(session, deck));
  const rewardClaimed = Boolean(overview && session?.rewardClaimedAt && overview.store.progress.lastRewardDateKey === overview.dateKey);
  const started = Boolean(session?.startedAt);
  const pendingCompletion = Boolean(complete && !rewardClaimed);
  const hasCards = deck.length > 0;
  const primaryStateLabel = !hasCards ? "Start" : pendingCompletion ? "Complete" : started ? "Resume" : "Start";
  const primaryActionLabel = !hasCards ? "Back to Home" : pendingCompletion ? "Complete Daily BLUNDR" : started ? "Resume Daily BLUNDR" : "Start Daily BLUNDR";
  const canClaim = Boolean(pendingCompletion && session);
  const upcomingCards = hasCards ? deck.filter((card) => card.cardKey !== currentCard?.cardKey).slice(0, 3) : [];

  useEffect(() => {
    if (currentCard && inputRef.current && !complete) {
      inputRef.current.focus();
    }
    if (currentCard && !complete) {
      cardStartedAtRef.current = Date.now();
    }
  }, [currentCard?.cardKey, complete]);

  function persist(next: {
    session?: DailyBlundrSession;
    progress?: ReturnType<typeof loadDailyBlundrOverview>["store"]["progress"];
    mastery?: ReturnType<typeof loadDailyBlundrOverview>["store"]["mastery"];
    reviewCards?: DailyBlundrReviewCard[];
    reviewAttempts?: DailyBlundrReviewAttempt[];
    feedback?: string;
    clearInput?: boolean;
  }) {
    if (!overview) return;
    const sessionToSave = next.session ?? session;
    if (!sessionToSave) return;
    const reviewCardsToSave = next.reviewCards ?? overview.reviewCards;
    const reviewAttemptsToSave = next.reviewAttempts ?? overview.reviewAttempts;
    const nextReviewStats = buildDailyBlundrReviewStats({
      reviewCards: reviewCardsToSave,
      reviewAttempts: reviewAttemptsToSave,
      currentSession: sessionToSave,
      deck: {
        dueReviewCount: overview.deck.dueReviewCount,
        selectedReviewCards: overview.deck.selectedReviewCards,
        selectionMode: overview.deck.selectionMode,
      },
      now: nowIso(),
    });
    const store = {
      ...overview.store,
      sessions: {
        ...overview.store.sessions,
        sessionsByDate: {
          ...overview.store.sessions.sessionsByDate,
          [overview.dateKey]: sessionToSave,
        },
        updatedAt: next.session?.updatedAt ?? overview.store.sessions.updatedAt,
      },
      progress: next.progress ?? overview.store.progress,
      mastery: next.mastery ?? overview.store.mastery,
    };
    const nextDeck = {
      ...overview.deck,
      reviewCards: reviewCardsToSave,
      reviewAttempts: reviewAttemptsToSave,
      reviewStats: nextReviewStats,
    };
    setOverview((prev) =>
      prev
        ? {
            ...prev,
            currentSession: sessionToSave,
            reviewCards: reviewCardsToSave,
            reviewAttempts: reviewAttemptsToSave,
            reviewStats: nextReviewStats,
            deck: nextDeck,
            store,
          }
        : prev,
    );
    if (typeof next.feedback === "string") {
      setFeedback(next.feedback);
    }
    if (next.clearInput ?? true) {
      setMoveInput("");
    }
    cardStartedAtRef.current = null;
  }

  function startOrResume() {
    if (!overview || !session || !currentCard) return;
    if (!started) {
      const next = markDailyBlundrSessionStarted(session, nowIso());
      persist({
        session: next,
        feedback: "Tempo picked today’s smartest training.",
      });
      cardStartedAtRef.current = Date.now();
      return;
    }
    inputRef.current?.focus();
    setFeedback("Resume Daily BLUNDR");
  }

  function claimCompletion() {
    if (!overview || !session) return;
    if (!complete) {
      setFeedback("Finish the recall cards first.");
      return;
    }
    if (rewardClaimed) {
      setFeedback("Daily BLUNDR already completed today.");
      return;
    }
    const now = nowIso();
    const nextProgress = buildDailyBlundrProgressAfterCompletion({
      previous: overview.store.progress,
      dateKey: overview.dateKey,
      claimAt: now,
    });
    const nextSession = {
      ...session,
      rewardClaimedAt: session.rewardClaimedAt ?? now,
      completedAt: session.completedAt ?? now,
      updatedAt: now,
    };
    persist({
      session: nextSession,
      progress: nextProgress,
      feedback: COMPLETION_COPY,
    });
  }

  function submitAttempt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!overview || !session || !currentCard || complete) return;
    const startedAt = cardStartedAtRef.current;
    const responseTimeMs = startedAt ? Math.max(0, Date.now() - startedAt) : null;
    const graded = gradeDailyBlundrMove({
      fen: currentCard.fen,
      expectedMoveUci: currentCard.expectedMoveUci,
      expectedMoveSan: currentCard.expectedMoveSan,
      attemptedMove: moveInput,
    });
    const now = nowIso();
    const attempt: DailyBlundrAttempt = {
      id: `daily-attempt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      cardId: currentCard.cardKey,
      source: currentCard.source,
      createdAt: now,
      completedAt: now,
      outcome: graded.outcome,
      correct: graded.outcome === "correct",
      attemptedMoveUci: graded.attemptedMoveUci,
      attemptedMoveSan: graded.attemptedMoveSan,
      responseMoveUci: graded.attemptedMoveUci,
      responseMoveSan: graded.attemptedMoveSan,
      expectedMoveUci: graded.expectedMoveUci,
      expectedMoveSan: graded.expectedMoveSan,
      usedReveal: false,
      responseTimeMs,
      note: graded.reason,
    };
    const withAttempt = addDailyBlundrAttempt(session, attempt);
    const mastery = updateDailyBlundrMastery({
      mastery: overview.store.mastery,
      card: currentCard,
      attempt,
    });
    const reviewCardId = currentCard.reviewCardId ?? currentCard.cardKey;
    const existingReviewCard = overview.reviewCards.find((card) => card.id === reviewCardId || card.dedupeKey === currentCard.reviewDedupeKey || card.id === currentCard.reviewCardId) ?? null;
    const reviewUpdate = makeDailyBlundrReviewCardFromAttempt({
      sourceCard: currentCard,
      attempt,
      existingCard: existingReviewCard,
      now,
    });
    const reviewGrade = gradeDailyBlundrAttempt({
      promptKind: currentCard.reviewPromptKind ?? reviewUpdate.promptKind,
      correct: attempt.correct,
      partialCredit: attempt.usedReveal ? 0.55 : attempt.correct ? 1 : 0,
      usedReveal: Boolean(attempt.usedReveal),
      responseTimeMs,
      previousCorrectStreak: existingReviewCard?.correctStreak ?? 0,
      expectedFastMs: currentCard.reviewPromptKind === "target_move_recall" ? 3_500 : 2_500,
    });
    const reviewAttempt: DailyBlundrReviewAttempt = {
      schemaVersion: 1,
      id: `review-attempt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      reviewCardId: reviewUpdate.id,
      sessionId: overview.dateKey,
      cardId: currentCard.cardKey,
      startedAt: startedAt ? new Date(startedAt).toISOString() : undefined,
      completedAt: now,
      grade: reviewGrade,
      score: reviewGrade === "AGAIN" ? 0 : reviewGrade === "HARD" ? 0.45 : reviewGrade === "GOOD" ? 0.8 : 1,
      correct: attempt.correct,
      partialCredit: attempt.usedReveal ? 0.55 : attempt.correct ? 1 : 0,
      responseMoveUci: attempt.responseMoveUci ?? attempt.attemptedMoveUci ?? null,
      usedReveal: Boolean(attempt.usedReveal),
      responseTimeMs,
      failureType: reviewUpdate.failureType,
    };
    const nextReviewCards = mergeDailyBlundrReviewCards(overview.reviewCards, [reviewUpdate]);
    const nextReviewAttempts = [...overview.reviewAttempts, reviewAttempt];
    const nextSession = markDailyBlundrSessionCardComplete(withAttempt, currentCard.cardKey, now);
    const nextFeedback =
      reviewGrade === "AGAIN" || reviewGrade === "HARD"
        ? "Tempo saved this for review."
        : `Correct. ${graded.attemptedMoveSan ?? graded.attemptedMoveUci ?? "Tempo"} is locked in.`;
    const finalFeedback = nextSession.completedCardIds.length === nextSession.cardOrder.length && nextSession.cardOrder.length > 0
      ? "All required cards are complete. Tap Complete Daily BLUNDR."
      : nextFeedback;

    persist({
      session: nextSession,
      mastery,
      reviewCards: nextReviewCards,
      reviewAttempts: nextReviewAttempts,
      feedback: finalFeedback,
    });
  }

  function revealCurrentCard() {
    if (!currentCard) return;
    setFeedback(`Tempo was looking for ${currentCard.expectedMoveSan ?? currentCard.expectedMoveUci ?? "the saved move"}.`);
  }

  function markReviewedCurrentCard() {
    if (!overview || !session || !currentCard || complete) return;
    const now = nowIso();
    const startedAt = cardStartedAtRef.current;
    const responseTimeMs = startedAt ? Math.max(0, Date.now() - startedAt) : null;
    const attempt: DailyBlundrAttempt = {
      id: `daily-attempt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      cardId: currentCard.cardKey,
      source: currentCard.source,
      createdAt: now,
      completedAt: now,
      outcome: "reveal",
      correct: false,
      attemptedMoveUci: null,
      attemptedMoveSan: null,
      responseMoveUci: null,
      responseMoveSan: null,
      expectedMoveUci: currentCard.expectedMoveUci,
      expectedMoveSan: currentCard.expectedMoveSan,
      usedReveal: true,
      responseTimeMs,
      note: "manual_review",
    };
    const withAttempt = addDailyBlundrAttempt(session, attempt);
    const mastery = updateDailyBlundrMastery({
      mastery: overview.store.mastery,
      card: currentCard,
      attempt,
    });
    const reviewCardId = currentCard.reviewCardId ?? currentCard.cardKey;
    const existingReviewCard = overview.reviewCards.find((card) => card.id === reviewCardId || card.dedupeKey === currentCard.reviewDedupeKey || card.id === currentCard.reviewCardId) ?? null;
    const reviewUpdate = makeDailyBlundrReviewCardFromAttempt({
      sourceCard: currentCard,
      attempt,
      existingCard: existingReviewCard,
      now,
    });
    const reviewGrade = gradeDailyBlundrAttempt({
      promptKind: currentCard.reviewPromptKind ?? reviewUpdate.promptKind,
      correct: attempt.correct,
      partialCredit: 0.55,
      usedReveal: true,
      responseTimeMs,
      previousCorrectStreak: existingReviewCard?.correctStreak ?? 0,
      expectedFastMs: currentCard.reviewPromptKind === "target_move_recall" ? 3_500 : 2_500,
    });
    const reviewAttempt: DailyBlundrReviewAttempt = {
      schemaVersion: 1,
      id: `review-attempt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      reviewCardId: reviewUpdate.id,
      sessionId: overview.dateKey,
      cardId: currentCard.cardKey,
      startedAt: startedAt ? new Date(startedAt).toISOString() : undefined,
      completedAt: now,
      grade: reviewGrade,
      score: reviewGrade === "AGAIN" ? 0 : reviewGrade === "HARD" ? 0.45 : reviewGrade === "GOOD" ? 0.8 : 1,
      correct: attempt.correct,
      partialCredit: 0.55,
      responseMoveUci: null,
      usedReveal: true,
      responseTimeMs,
      failureType: reviewUpdate.failureType,
    };
    const nextSession = markDailyBlundrSessionCardComplete(withAttempt, currentCard.cardKey, now);
    const nextReviewCards = mergeDailyBlundrReviewCards(overview.reviewCards, [reviewUpdate]);
    const nextReviewAttempts = [...overview.reviewAttempts, reviewAttempt];
    persist({
      session: nextSession,
      mastery,
      reviewCards: nextReviewCards,
      reviewAttempts: nextReviewAttempts,
      feedback: reviewGrade === "AGAIN" || reviewGrade === "HARD"
        ? "Tempo saved this for review."
        : `Reviewed. Tempo was looking for ${currentCard.expectedMoveSan ?? currentCard.expectedMoveUci ?? "the saved move"}.`,
    });
  }

  const completionButtonTone = canClaim ? "bg-green-700 text-white shadow-sm" : "bg-stone-200 text-stone-500";

  return (
    <main className="min-h-screen bg-[#f7f7f4] text-stone-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-24 pt-5">
        <header className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.28em] text-green-700">Daily BLUNDR</div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Daily BLUNDR</h1>
            <p className="mt-1 text-sm text-stone-500">Tempo picked today’s smartest training.</p>
          </div>
          <Link href="/" className="rounded-2xl bg-white px-3 py-3 text-sm font-black text-stone-700 shadow-sm ring-1 ring-stone-200">
            <span className="inline-flex items-center gap-2">
              <ArrowLeft size={16} />
              Home
            </span>
          </Link>
        </header>

        <section className="mt-5 space-y-4 rounded-3xl bg-stone-900 p-4 text-white shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-green-500/15 px-3 py-1 text-xs font-black uppercase tracking-wide text-green-300">
                <Sparkles size={14} />
                Today’s Smart Reviews
              </div>
              <p className="mt-3 text-sm leading-6 text-stone-300">Today’s smart reviews are built from the positions most likely to slip.</p>
            </div>
            <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white">{primaryStateLabel}</div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-white/8 p-3">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-stone-400">
                <Target size={14} /> Due today
              </div>
              <div className="mt-2 text-lg font-black">{reviewStats.dueToday}</div>
              <div className="text-xs text-stone-400">reviews ready</div>
            </div>
            <div className="rounded-2xl bg-white/8 p-3">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-stone-400">
                <CheckCircle2 size={14} /> Completed
              </div>
              <div className="mt-2 text-lg font-black">{reviewStats.completedToday}</div>
              <div className="text-xs text-stone-400">today</div>
            </div>
            <div className="rounded-2xl bg-white/8 p-3">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-stone-400">
                <Flame size={14} /> Daily streak
              </div>
              <div className="mt-2 text-lg font-black">{overview?.store.progress.currentDailyStreak ?? overview?.store.progress.dailyStreak ?? 0}</div>
              <div className="text-xs text-stone-400">local completions</div>
            </div>
            <div className="rounded-2xl bg-white/8 p-3">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-stone-400">
                <BadgeCheck size={14} /> Saved
              </div>
              <div className="mt-2 text-lg font-black">{reviewStats.savedForReview}</div>
              <div className="text-xs text-stone-400">for review</div>
            </div>
            <div className="rounded-2xl bg-white/8 p-3">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-stone-400">
                <BadgeCheck size={14} /> Mastered
              </div>
              <div className="mt-2 text-lg font-black">{reviewStats.mastered}</div>
              <div className="text-xs text-stone-400">review cards</div>
            </div>
          </div>

          {hasCards ? (
            <button
              type="button"
              onClick={pendingCompletion ? claimCompletion : startOrResume}
              className={`w-full rounded-2xl px-4 py-3 text-sm font-black ${completionButtonTone}`}
            >
              {primaryActionLabel}
            </button>
          ) : null}
        </section>

        {!hasCards ? (
          <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 text-green-700">
              <CheckCircle2 size={20} />
              <div className="text-sm font-black uppercase tracking-wide">Queue clear</div>
            </div>
            <p className="mt-3 text-sm leading-6 text-stone-600">{EMPTY_STATE_COPY}</p>
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-stone-50 px-3 py-3 text-sm text-stone-500">
              <Clock3 size={16} />
              Build a few mistakes in the trainer and Daily BLUNDR will light up here.
            </div>
            <Link href="/" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-green-700 px-4 py-3 font-black text-white shadow-sm">
              Back to Home
            </Link>
          </section>
        ) : (
          <>
            <section className="mt-5 space-y-4 rounded-3xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.22em] text-green-700">Recall card</div>
                  <h2 className="mt-1 text-lg font-black text-stone-900">{currentCard ? getCardTitle(currentCard) : "Tempo is lining up the next card"}</h2>
                  <p className="mt-1 text-sm leading-6 text-stone-500">{currentCard ? getCardSubtitle(currentCard) : "Tempo is loading the next recall."}</p>
                </div>
                <div className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-600">
                  {currentCard ? `${currentCard.deckRank}/${deck.length}` : "0/0"}
                </div>
              </div>

              {currentCard ? <BoardPreview fen={currentCard.fen} /> : null}

              {currentCard ? (
                <form onSubmit={submitAttempt} className="space-y-3">
                  <div className="rounded-2xl bg-stone-50 p-3 text-sm leading-6 text-stone-600">
                    Enter the move in UCI, or SAN if that is the move you remember. UCI is preferred for grading.
                  </div>
                  <div>
                    <label htmlFor="daily-blundr-move" className="text-xs font-black uppercase tracking-wide text-stone-500">
                      Your move
                    </label>
                      <input
                        ref={inputRef}
                        id="daily-blundr-move"
                        value={moveInput}
                        onChange={(event) => setMoveInput(event.target.value)}
                        placeholder={currentCard.expectedMoveUci ?? currentCard.expectedMoveSan ?? "e2e4"}
                        className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-base font-semibold outline-none ring-0 focus:border-green-700"
                      />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="submit" className="rounded-2xl bg-green-700 px-4 py-3 font-black text-white shadow-sm">
                      Check
                    </button>
                    <button
                      type="button"
                      onClick={() => setMoveInput(currentCard.expectedMoveUci ?? currentCard.expectedMoveSan ?? "")}
                      className="rounded-2xl bg-stone-100 px-4 py-3 font-black text-stone-700"
                    >
                      Fill answer
                    </button>
                  </div>
                  {currentCard.expectedMoveUci ? null : (
                    <div className="space-y-2 rounded-2xl bg-amber-50 p-3 text-sm leading-6 text-amber-900">
                      <p>Tempo could only recover SAN for this review. You can reveal the answer or mark it reviewed for today.</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={revealCurrentCard} className="rounded-2xl bg-white px-4 py-3 font-black text-amber-900 ring-1 ring-amber-200">
                          Reveal
                        </button>
                        <button type="button" onClick={markReviewedCurrentCard} className="rounded-2xl bg-amber-700 px-4 py-3 font-black text-white shadow-sm">
                          Mark reviewed
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              ) : null}

              <div className="rounded-2xl bg-stone-50 p-3 text-sm leading-6 text-stone-600" aria-live="polite">
                {feedback}
              </div>
            </section>

            {session?.completedAt ? (
              <section className="mt-5 rounded-3xl border border-green-200 bg-green-50 p-5 shadow-sm">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 size={18} />
                  <div className="text-xs font-black uppercase tracking-wide">Session complete</div>
                </div>
                <h2 className="mt-2 text-lg font-black text-green-950">Tempo has all required cards.</h2>
                <p className="mt-2 text-sm leading-6 text-green-800">
                  {rewardClaimed ? COMPLETION_COPY : "All required cards are done. Tap Complete Daily BLUNDR to bank the streak."}
                </p>
                <button
                  type="button"
                  onClick={claimCompletion}
                  disabled={!canClaim}
                  className={`mt-4 w-full rounded-2xl px-4 py-3 font-black ${rewardClaimed ? "bg-white text-green-800 ring-1 ring-green-200" : canClaim ? "bg-green-700 text-white shadow-sm" : "bg-stone-200 text-stone-500"}`}
                >
                  Complete Daily BLUNDR
                </button>
              </section>
            ) : null}

            {upcomingCards.length ? (
              <section className="mt-5 rounded-3xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black uppercase tracking-wide text-green-700">Next up</div>
                    <p className="text-sm text-stone-500">Tempo queued the rest of today’s recall cards.</p>
                  </div>
                  <BookOpen size={18} className="text-stone-400" />
                </div>
                <div className="mt-3 space-y-2">
                  {upcomingCards.map((card) => (
                    <div key={card.cardKey} className="flex items-center justify-between rounded-2xl bg-stone-50 px-3 py-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-black text-stone-900">{getCardTitle(card)}</div>
                        <div className="truncate text-xs text-stone-500">{getCardSubtitle(card)}</div>
                      </div>
                      <ChevronRight size={16} className="text-stone-400" />
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}

        <section className="mt-5 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-black text-stone-900">
            <BadgeCheck size={16} className="text-green-700" />
            Mastery scaffold
          </div>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Daily-local mastery keeps track of what Tempo has already seen, what still feels shaky, and what can fade out later.
          </p>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs font-black">
            <div className="rounded-2xl bg-stone-50 px-2 py-3 text-stone-700">Fresh {masterySummary.fresh}</div>
            <div className="rounded-2xl bg-stone-50 px-2 py-3 text-stone-700">Grow {masterySummary.growing}</div>
            <div className="rounded-2xl bg-stone-50 px-2 py-3 text-stone-700">Steady {masterySummary.steady}</div>
            <div className="rounded-2xl bg-stone-50 px-2 py-3 text-stone-700">Mastered {masterySummary.mastered}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
