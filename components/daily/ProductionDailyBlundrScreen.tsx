"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, BadgeCheck, RefreshCw, Sparkles, Target } from "lucide-react";
import {
  authenticatedApiFetch,
  AuthenticatedApiError,
} from "@/lib/blundr/api/authenticatedApiClient";
import { DailyBlundrBoard } from "@/components/daily/DailyBlundrBoard";
import { DailyBlundrCardFeedback } from "@/components/daily/DailyBlundrCardFeedback";
import type { DailyBlundrBoardMoveAttempt } from "@/lib/blundr/daily/dailyBlundrPlayerTypes";
import type {
  ProductionDailyPublicSession,
  ProductionDailyTeachingPayload,
} from "@/lib/blundr/daily/productionDailyTypes";
import {
  buildProductionDailyTeachingPayload,
  productionDailyCardAcceptsBoardInput,
  resolveProductionDailyAnswerMoveUci,
  resolveProductionDailyBoardAnswer,
} from "@/lib/blundr/daily/productionDailyTeaching";
import { BLUNDR_DAILY_RING_REFRESH_EVENT } from "@/lib/blundr/daily-rings/dailyRingRefreshSignal";
import { notifyRewardPresentationRefresh } from "@/lib/blundr/rewards/rewardPresentationSignal";
import { resolveProductionDailyCardGoalProgress } from "@/lib/blundr/daily/productionDailyCardGoalProgress";

type DailyResponse = {
  dateKey: string;
  status: string;
  explanation: string;
  session: ProductionDailyPublicSession;
};

type PreferencesResponse = {
  ok: true;
  data: {
    dailyBlundrCardGoal?: unknown;
  };
};

type PublicDailyCard = ProductionDailyPublicSession["publicCards"][number];

type ResolvedCheckpoint = {
  card: PublicDailyCard;
  taskNumber: number | null;
  teaching: ProductionDailyTeachingPayload;
};

function clampDailyCardGoal(value: unknown, fallback = 10): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const next = Math.trunc(parsed);
  if (next < 1) return 1;
  if (next > 99) return 99;
  return next;
}

export function ProductionDailyBlundrScreen() {
  const [session, setSession] = useState<ProductionDailyPublicSession | null>(
    null,
  );
  const [dailyCardGoal, setDailyCardGoal] = useState<number>(10);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "success" | "warning" | "neutral" | "complete";
  } | null>(null);
  const [resolvedCheckpoint, setResolvedCheckpoint] =
    useState<ResolvedCheckpoint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recoveryHref, setRecoveryHref] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const actionInFlightRef = useRef(false);

  const load = useCallback(async () => {
    try {
      const response = await authenticatedApiFetch<DailyResponse>(
        "/api/blundr/daily/today",
        { cache: "no-store" },
      );
      setSession(response.session);
      try {
        const preferences = await authenticatedApiFetch<PreferencesResponse>(
          "/api/blundr/account/preferences",
          { cache: "no-store" },
        );
        setDailyCardGoal(
          clampDailyCardGoal(preferences.data?.dailyBlundrCardGoal, 10),
        );
      } catch {
        setDailyCardGoal(10);
      }
      setResolvedCheckpoint(null);
      setFeedback(null);
      setError(null);
      setRecoveryHref(null);
    } catch (nextError) {
      const openingSelectionRequired =
        nextError instanceof AuthenticatedApiError &&
        nextError.code === "daily_opening_selection_required";
      setError(
        openingSelectionRequired
          ? "Choose a starter pack or unlock an opening before starting Daily Blundr."
          : nextError instanceof AuthenticatedApiError &&
              nextError.code === "authentication_required"
            ? "Sign in to receive your personalized Daily Blundr deck."
            : nextError instanceof AuthenticatedApiError &&
                nextError.code === "feature_disabled"
              ? "Daily Blundr isn't available in this build."
              : "Daily Blundr could not load right now.",
      );
      setRecoveryHref(
        openingSelectionRequired ? "/onboarding/starter-pack" : null,
      );
      setDailyCardGoal(10);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const currentCard = useMemo<
    ProductionDailyPublicSession["publicCards"][number] | null
  >(() => {
    if (!session) return null;
    return (
      session.publicCards.find(
        (card) =>
          !session.state.completedCardIds.includes(card.cardFingerprint),
      ) ?? null
    );
  }, [session]);

  const currentTaskNumber = useMemo(() => {
    if (!session || !currentCard) return null;
    const index = session.publicCards.findIndex(
      (card) => card.cardFingerprint === currentCard.cardFingerprint,
    );
    return index >= 0 ? index + 1 : null;
  }, [currentCard, session]);

  useEffect(() => {
    if (resolvedCheckpoint) return;
    setFeedback(null);
  }, [currentCard?.cardFingerprint, resolvedCheckpoint]);

  const displayCard = resolvedCheckpoint?.card ?? currentCard;
  const displayTaskNumber = resolvedCheckpoint?.taskNumber ?? currentTaskNumber;
  const teaching =
    resolvedCheckpoint?.teaching ?? displayCard?.teaching ?? null;
  const boardFen = teaching?.resultFen ?? displayCard?.positionFen ?? null;
  const cardGoalProgress = useMemo(
    () => resolveProductionDailyCardGoalProgress(session, dailyCardGoal),
    [dailyCardGoal, session],
  );

  const teachingSquareStyles = useMemo(() => {
    if (!teaching) return {};
    return {
      [teaching.from]: {
        boxShadow: "inset 0 0 0 4px rgba(245, 158, 11, 0.92)",
        backgroundColor: "rgba(253, 230, 138, 0.72)",
      },
      [teaching.to]: {
        boxShadow: "inset 0 0 0 4px rgba(22, 163, 74, 0.92)",
        backgroundColor: "rgba(187, 247, 208, 0.78)",
      },
    };
  }, [teaching]);

  const boardAcceptsMoveInput = Boolean(
    displayCard && productionDailyCardAcceptsBoardInput(displayCard),
  );
  const boardDisabled =
    actionBusy ||
    Boolean(resolvedCheckpoint) ||
    Boolean(teaching) ||
    !boardAcceptsMoveInput;

  async function action(kind: "attempt" | "reveal" | "retry", answer?: string) {
    if (!session || !currentCard || actionInFlightRef.current) return;
    const actedCard = currentCard;
    const actedTaskNumber = currentTaskNumber;

    actionInFlightRef.current = true;
    setActionBusy(true);
    setError(null);
    const path = kind === "attempt" ? "attempts" : kind;
    try {
      const response = await authenticatedApiFetch<{
        session: ProductionDailyPublicSession;
        presentation?: {
          state: string;
          feedback?: { kind: string; message: string } | null;
        };
        correct?: boolean;
      }>(
        `/api/blundr/daily/sessions/${encodeURIComponent(session.sessionId)}/${path}`,
        {
          method: "POST",
          body: JSON.stringify({
            cardFingerprint: actedCard.cardFingerprint,
            actionId: actedCard.actionId,
            answer,
            expectedVersion: session.version,
          }),
        },
      );

      const confirmedMoveUci =
        kind === "attempt" && response.correct && answer
          ? resolveProductionDailyAnswerMoveUci(actedCard, answer)
          : null;
      const confirmedTeaching = confirmedMoveUci
        ? buildProductionDailyTeachingPayload({
            sourceFen: actedCard.positionFen,
            moveUci: confirmedMoveUci,
            note: "Correct. Review the verified move before continuing.",
          })
        : null;

      setSession(response.session);
      if (kind === "retry") {
        setResolvedCheckpoint(null);
      } else if (confirmedTeaching) {
        setResolvedCheckpoint({
          card: actedCard,
          taskNumber: actedTaskNumber,
          teaching: confirmedTeaching,
        });
      }

      const incorrectAnswer = kind === "attempt" && response.correct === false;
      const message = incorrectAnswer
        ? "Incorrect answer. Try again or reveal the verified move."
        : (response.presentation?.feedback?.message ??
          (response.correct
            ? "Correct."
            : kind === "reveal"
              ? "The verified move is now shown on the board."
              : "Recorded."));
      setFeedback({
        message,
        tone:
          response.correct || incorrectAnswer
            ? response.correct
              ? "success"
              : "warning"
            : kind === "reveal"
              ? "warning"
              : "neutral",
      });

      if (response.session.completedAt) {
        window.dispatchEvent(new Event(BLUNDR_DAILY_RING_REFRESH_EVENT));
        notifyRewardPresentationRefresh();
      }
    } catch (nextError) {
      const authenticatedError =
        nextError instanceof AuthenticatedApiError ? nextError : null;
      setError(
        authenticatedError?.status === 409
          ? "Daily changed in another tab. Reloading your deck."
          : authenticatedError?.message ||
              "Daily couldn't save that action. Your deck is unchanged. Try again.",
      );
      if (authenticatedError && authenticatedError.status === 409) void load();
    } finally {
      actionInFlightRef.current = false;
      setActionBusy(false);
    }
  }

  async function handleMove(attempt: DailyBlundrBoardMoveAttempt) {
    if (!displayCard) return;
    await action(
      "attempt",
      resolveProductionDailyBoardAnswer(displayCard, attempt.uci),
    );
  }

  function handleContinue() {
    setResolvedCheckpoint(null);
    setFeedback(null);
  }

  return (
    <main className="w-full bg-[radial-gradient(circle_at_78%_-8%,rgba(43,122,77,0.08),transparent_28rem),radial-gradient(circle_at_0_42%,rgba(183,131,38,0.045),transparent_24rem)] text-stone-950">
      <div className="mx-auto flex w-full max-w-[1340px] flex-col px-4 py-6 sm:px-6">
        <header className="mb-6 flex items-end justify-between gap-6 max-[820px]:flex-col max-[820px]:items-start">
          <div className="max-w-2xl">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-green-800">
              Review · Daily Blundr
            </div>
            <h1 className="mt-3 text-[34px] font-black leading-[1.05] tracking-[-0.05em] text-stone-950 max-[820px]:text-[27px]">
              Your Daily deck.
            </h1>
            <p className="mt-3 max-w-[720px] text-[13px] leading-[1.55] text-stone-600 max-[820px]:text-[11px]">
              Board-first adaptive review. Your first try is what counts. Reveal
              teaches after your answer; Retry restores the original position.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex min-h-8 items-center rounded-full border border-green-200 bg-green-50 px-3 text-[10px] font-black uppercase tracking-[0.16em] text-green-800">
                <BadgeCheck size={12} className="mr-1.5" />
                Account saved
              </span>
              <span className="inline-flex min-h-8 items-center rounded-full border border-stone-200 bg-white/80 px-3 text-[10px] font-black uppercase tracking-[0.16em] text-stone-600">
                First try counts
              </span>
              <span className="inline-flex min-h-8 items-center rounded-full border border-stone-200 bg-white/80 px-3 text-[10px] font-black uppercase tracking-[0.16em] text-stone-600">
                Reveal doesn't change scoring
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/review"
              aria-label="Back to Review"
              className="inline-flex min-h-11 items-center gap-2 rounded-[13px] border border-stone-200 bg-white/90 px-4 text-sm font-black text-stone-800 shadow-sm transition hover:-translate-y-0.5 hover:text-green-700"
            >
              <ArrowLeft size={15} />
              Review
            </Link>
          </div>
        </header>

        {error ? (
          <section className="mt-2 rounded-[1.75rem] border border-amber-200/80 bg-amber-50/90 p-5 shadow-[0_16px_36px_rgba(182,122,22,0.08)]">
            <p
              role="status"
              className="text-sm font-semibold leading-6 text-amber-950"
            >
              {error}
            </p>
            {recoveryHref ? (
              <Link
                href={recoveryHref}
                className="mt-4 inline-flex rounded-2xl bg-stone-950 px-4 py-3 text-sm font-black text-white"
              >
                Choose openings
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => void load()}
                className="mt-4 inline-flex rounded-2xl bg-stone-950 px-4 py-3 text-sm font-black text-white"
              >
                Try again
              </button>
            )}
          </section>
        ) : null}

        {!error && !session ? (
          <section className="mt-2 rounded-[1.75rem] border border-stone-200/80 bg-white/92 p-5 shadow-[0_16px_36px_rgba(16,20,17,0.06)]">
            <p className="text-sm text-stone-600">
              Loading your Daily deck…
            </p>
          </section>
        ) : null}

        {session && !currentCard && !resolvedCheckpoint ? (
          <section className="mt-2 rounded-[1.75rem] border border-green-200/80 bg-green-50/90 p-5 shadow-[0_16px_36px_rgba(20,100,56,0.08)]">
            <Sparkles className="text-green-700" size={20} />
            <h2 className="mt-3 text-lg font-black">Daily complete</h2>
            <p className="mt-2 text-sm leading-6 text-green-900">
              Today's Daily deck is complete. Your first try is what counts.
            </p>
          </section>
        ) : null}

        {session && displayCard && boardFen ? (
          <section className="mt-2 grid items-start justify-center gap-[18px] lg:grid-cols-[minmax(420px,560px)_minmax(300px,430px)]">
            <article className="rounded-[22px] border border-stone-200 bg-white/92 p-3 shadow-[0_18px_44px_rgba(20,17,12,0.10)]">
              <div className="mb-3 flex items-center justify-between gap-3 px-2 pt-1">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-green-800">
                  Daily board
                </div>
                <div className="flex items-center gap-2">
                  {cardGoalProgress ? (
                    <div className="inline-flex items-center gap-1 rounded-full bg-[#f8f8f5] px-3 py-1 text-xs font-bold text-stone-600 ring-1 ring-stone-200">
                      <Target size={13} className={cardGoalProgress.completed ? "text-green-700" : "text-stone-500"} />
                      {cardGoalProgress.progressCards} / {cardGoalProgress.goalCards}
                    </div>
                  ) : null}
                  {displayTaskNumber ? (
                    <div className="rounded-full bg-[#f8f8f5] px-3 py-1 text-xs font-bold text-stone-600 ring-1 ring-stone-200">
                      {displayTaskNumber} / {session.publicCards.length}
                    </div>
                  ) : null}
                </div>
              </div>

              <DailyBlundrBoard
                fen={boardFen}
                disabled={boardDisabled}
                onSquareClick={() => undefined}
                onMoveAttempt={(attempt) => void handleMove(attempt)}
                openingColor={displayCard.side}
                forcedOrientation={displayCard.side}
                boardVisuals={null}
                squareStyles={teachingSquareStyles}
                animationClassName={null}
              />

              <div className="mt-3 grid gap-2 rounded-[16px] border border-stone-200 bg-[#f8f8f5] p-3 text-[11px] font-semibold text-stone-600 sm:grid-cols-3">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.16em] text-stone-500">
                    Status
                  </div>
                  <div className="mt-1 text-stone-900">
                    {resolvedCheckpoint ? "Verified" : "Waiting"}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.16em] text-stone-500">
                    Board
                  </div>
                  <div className="mt-1 text-stone-900">
                    {displayCard.side === "white" ? "White to play" : "Black to play"}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.16em] text-stone-500">
                    Saved
                  </div>
                  <div className="mt-1 text-stone-900">Account</div>
                </div>
              </div>
            </article>

            <aside className="rounded-[22px] border border-stone-200 bg-white/92 p-5 shadow-[0_18px_44px_rgba(38,31,20,0.09)] backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">
                    {displayCard.activityId.replaceAll("_", " ")}
                  </div>
                  {displayTaskNumber ? (
                    <div className="mt-3 text-xs font-bold text-stone-500">
                      Task {displayTaskNumber} of {session.publicCards.length}
                    </div>
                  ) : null}
                </div>
                <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-stone-500">
                  {displayCard.interaction === "choice" ? "Choice" : "Move"}
                </span>
              </div>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">
                {displayCard.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-stone-700">
                {displayCard.prompt}
              </p>
              <p className="mt-3 rounded-[1.15rem] bg-stone-50 px-4 py-3 text-xs leading-5 text-stone-500 ring-1 ring-stone-200">
                {displayCard.why}
              </p>

              {teaching ? (
                <div
                  data-testid="daily-teaching-move"
                  className="mt-4 rounded-[1.15rem] border border-green-200/80 bg-green-50/90 p-4"
                >
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">
                    Verified move
                  </div>
                  <div className="mt-1 text-lg font-black text-stone-950">
                    {teaching.moveSan}
                  </div>
                  <div className="mt-1 text-xs font-bold text-green-800">
                    {teaching.from} → {teaching.to}
                  </div>
                  {teaching.note ? (
                    <p className="mt-2 text-sm leading-6 text-green-900">
                      {teaching.note}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-green-800">
                    The board shows the resulting verified position.
                  </p>
                </div>
              ) : null}

              {displayCard.interaction === "choice" &&
              displayCard.options?.length ? (
                <div className="mt-4 grid gap-2">
                  {displayCard.options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      disabled={
                        actionBusy ||
                        Boolean(resolvedCheckpoint) ||
                        Boolean(teaching)
                      }
                      onClick={() => void action("attempt", option.id)}
                      className="min-h-12 rounded-[1rem] border border-stone-200 bg-white px-4 py-3 text-left text-sm font-black text-stone-900 shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="mt-5">
                {resolvedCheckpoint ? (
                  <button
                    type="button"
                    disabled={actionBusy}
                    onClick={handleContinue}
                    className="min-h-11 w-full rounded-[1rem] bg-green-700 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Continue
                  </button>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={actionBusy || Boolean(teaching)}
                      onClick={() => void action("reveal")}
                      className="min-h-11 rounded-[1rem] bg-green-700 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Reveal
                    </button>
                    <button
                      type="button"
                      disabled={actionBusy}
                      onClick={() => void action("retry")}
                      className="min-h-11 rounded-[1rem] bg-stone-100 px-4 py-3 text-sm font-black text-stone-800 ring-1 ring-stone-200 transition hover:-translate-y-0.5 hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <RefreshCw size={15} className="mr-1 inline" />
                      Retry
                    </button>
                  </div>
                )}
              </div>

              {feedback ? (
                <div className="mt-4">
                  <DailyBlundrCardFeedback
                    message={feedback.message}
                    tone={feedback.tone}
                  />
                </div>
              ) : null}
            </aside>
          </section>
        ) : null}

        <Link
          href="/review"
          className="mt-6 inline-flex items-center gap-2 self-start rounded-full border border-stone-200 bg-white/90 px-4 py-2 text-sm font-black text-green-700 shadow-sm transition hover:-translate-y-0.5"
        >
          <ArrowLeft size={16} /> Review
        </Link>
      </div>
    </main>
  );
}
