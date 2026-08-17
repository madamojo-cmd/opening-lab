"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Home, RefreshCw, Settings, Sparkles } from "lucide-react";
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

type DailyResponse = {
  dateKey: string;
  status: string;
  explanation: string;
  session: ProductionDailyPublicSession;
};

type PublicDailyCard = ProductionDailyPublicSession["publicCards"][number];

type ResolvedCheckpoint = {
  card: PublicDailyCard;
  taskNumber: number | null;
  teaching: ProductionDailyTeachingPayload;
};

export function ProductionDailyBlundrScreen() {
  const [session, setSession] = useState<ProductionDailyPublicSession | null>(
    null,
  );
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
              ? "Daily Blundr is unavailable because its production authority is disabled."
              : "Daily Blundr could not load right now.",
      );
      setRecoveryHref(
        openingSelectionRequired ? "/onboarding/starter-pack" : null,
      );
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
  const displayTaskNumber =
    resolvedCheckpoint?.taskNumber ?? currentTaskNumber;
  const teaching =
    resolvedCheckpoint?.teaching ?? displayCard?.teaching ?? null;
  const boardFen = teaching?.resultFen ?? displayCard?.positionFen ?? null;

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

  async function action(
    kind: "attempt" | "reveal" | "retry",
    answer?: string,
  ) {
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

      const incorrectAnswer =
        kind === "attempt" && response.correct === false;
      const message = incorrectAnswer
        ? "Incorrect answer. Try again or reveal the verified move."
        : response.presentation?.feedback?.message ??
          (response.correct
            ? "Correct."
            : kind === "reveal"
              ? "The verified move is now shown on the board."
              : "Recorded.");
      setFeedback({
        message,
        tone: response.correct || incorrectAnswer
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
          ? "This Daily session changed in another tab. Reloading the reserved deck."
          : authenticatedError?.message ||
              "Daily could not safely save that action. Your deck is unchanged; try again.",
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
    <main className="min-h-screen bg-[#f7f7f4] text-stone-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-24 pt-5">
        <header className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.28em] text-green-700">
              Daily Blundr
            </div>
            <h1 className="mt-1 text-2xl font-black">Your reserved practice</h1>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              aria-label="Back to home"
              className="rounded-2xl bg-white p-3 text-stone-700 shadow-sm ring-1 ring-stone-200"
            >
              <Home size={16} />
            </Link>
            <Link
              href="/settings"
              aria-label="Open settings"
              className="rounded-2xl bg-white p-3 text-stone-700 shadow-sm ring-1 ring-stone-200"
            >
              <Settings size={16} />
            </Link>
          </div>
        </header>

        {error ? (
          <section className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 p-5">
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
          <section className="mt-5 rounded-3xl border border-stone-200 bg-white p-5">
            <p className="text-sm text-stone-600">
              Loading your server-owned Daily deck…
            </p>
          </section>
        ) : null}

        {session && !currentCard && !resolvedCheckpoint ? (
          <section className="mt-5 rounded-3xl border border-green-200 bg-green-50 p-5">
            <Sparkles className="text-green-700" size={20} />
            <h2 className="mt-3 text-lg font-black">Daily complete</h2>
            <p className="mt-2 text-sm leading-6 text-green-900">
              Your reserved deck is complete. First attempts remain immutable.
            </p>
          </section>
        ) : null}

        {session && displayCard && boardFen ? (
          <section className="mt-5 space-y-4 rounded-3xl bg-stone-900 p-4 text-white">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-green-300">
                {displayCard.activityId.replaceAll("_", " ")}
              </div>
              {displayTaskNumber ? (
                <div className="mt-2 text-xs font-bold text-stone-400">
                  Task {displayTaskNumber} of {session.publicCards.length}
                </div>
              ) : null}
              <h2 className="mt-2 text-xl font-black">{displayCard.title}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                {displayCard.prompt}
              </p>
              <p className="mt-2 text-xs text-stone-400">{displayCard.why}</p>
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

            {teaching ? (
              <div
                data-testid="daily-teaching-move"
                className="rounded-2xl border border-green-700/50 bg-green-950/60 p-4"
              >
                <div className="text-xs font-black uppercase tracking-[0.18em] text-green-300">
                  Verified move
                </div>
                <div className="mt-1 text-lg font-black text-white">
                  {teaching.moveSan}
                </div>
                <div className="mt-1 text-xs font-bold text-green-200">
                  {teaching.from} → {teaching.to}
                </div>
                {teaching.note ? (
                  <p className="mt-2 text-sm leading-6 text-green-100">
                    {teaching.note}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-green-300">
                  The board shows the resulting verified position.
                </p>
              </div>
            ) : null}

            {displayCard.interaction === "choice" &&
            displayCard.options?.length ? (
              <div className="grid gap-2">
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
                    className="min-h-12 rounded-2xl bg-white px-4 py-3 text-left text-sm font-black text-stone-900 disabled:opacity-60"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}

            {resolvedCheckpoint ? (
              <button
                type="button"
                disabled={actionBusy}
                onClick={handleContinue}
                className="min-h-11 w-full rounded-2xl bg-green-500 px-4 py-3 text-sm font-black text-stone-950 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Continue
              </button>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={actionBusy || Boolean(teaching)}
                  onClick={() => void action("reveal")}
                  className="min-h-11 rounded-2xl bg-white px-4 py-3 text-sm font-black text-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reveal
                </button>
                <button
                  type="button"
                  disabled={actionBusy}
                  onClick={() => void action("retry")}
                  className="min-h-11 rounded-2xl bg-stone-700 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw size={15} className="mr-1 inline" />
                  Retry
                </button>
              </div>
            )}

            {feedback ? (
              <DailyBlundrCardFeedback
                message={feedback.message}
                tone={feedback.tone}
              />
            ) : null}
          </section>
        ) : null}

        <Link
          href="/review"
          className="mt-5 inline-flex items-center gap-2 text-sm font-black text-green-700"
        >
          <ArrowLeft size={16} /> Review
        </Link>
      </div>
    </main>
  );
}
