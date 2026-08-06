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
import type { ProductionDailyPublicSession } from "@/lib/blundr/daily/productionDailyTypes";
import { recordBlundrTaskCompleted } from "@/lib/blundr/daily-rings/dailyRingGameplayEvents";
import {
  getLocalAccountCurrentUserId,
  getLocalTrainingProfile,
} from "@/lib/blundr/accounts/localAccountStorage";
import { loadRepertoireProgress } from "@/lib/blundr/repertoire/repertoireProgressService";
import { resolveProductionDailyCompletion } from "@/lib/blundr/daily/productionDailyCompletion";

type DailyResponse = {
  dateKey: string;
  status: string;
  explanation: string;
  session: ProductionDailyPublicSession;
};

export function ProductionDailyBlundrScreen() {
  const completionRequests = useRef(new Set<string>());
  const [session, setSession] = useState<ProductionDailyPublicSession | null>(
    null,
  );
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "success" | "warning" | "neutral" | "complete";
  } | null>(null);
  const [presentation, setPresentation] = useState<{
    state: string;
    message: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recoveryHref, setRecoveryHref] = useState<string | null>(null);
  const [completionSyncFailed, setCompletionSyncFailed] = useState(false);
  const [completionSyncAttempt, setCompletionSyncAttempt] = useState(0);

  const load = useCallback(async () => {
    try {
      const response = await authenticatedApiFetch<DailyResponse>(
        "/api/blundr/daily/today",
        { cache: "no-store" },
      );
      setSession(response.session);
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
              ? "Personalized Daily is not enabled for this staging environment yet."
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
    if (currentCard) return;
    const completion = resolveProductionDailyCompletion(session);
    if (!completion) return;

    const userId = getLocalAccountCurrentUserId();
    if (!userId) return;
    const completionId = completion.completionId;
    if (completionRequests.current.has(completionId)) return;
    completionRequests.current.add(completionId);

    void recordBlundrTaskCompleted({
      userId,
      dateKey: completion.dateKey,
      deckId: completion.deckId,
      reviewSessionId: completion.reviewSessionId,
      taskId: completion.taskId,
      completionId,
      repertoireProgress: loadRepertoireProgress({ userId }),
      profile: getLocalTrainingProfile(userId) ?? undefined,
      now: completion.completedAt,
    })
      .then((result) => {
        if (!result.ok) {
          completionRequests.current.delete(completionId);
          setCompletionSyncFailed(true);
          setError(
            "Daily completed, but its progress could not be saved. Retry to sync it.",
          );
          return;
        }
        setCompletionSyncFailed(false);
        setError(null);
      })
      .catch(() => {
        completionRequests.current.delete(completionId);
        setCompletionSyncFailed(true);
        setError(
          "Daily completed, but its progress could not be saved. Retry to sync it.",
        );
      });
  }, [completionSyncAttempt, currentCard, session]);

  async function action(kind: "attempt" | "reveal" | "retry", answer?: string) {
    if (!session || !currentCard) return;
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
            cardFingerprint: currentCard.cardFingerprint,
            actionId: currentCard.actionId,
            answer,
            expectedVersion: session.version,
          }),
        },
      );
      setSession(response.session);
      const message =
        response.presentation?.feedback?.message ??
        (response.correct
          ? "Correct."
          : kind === "reveal"
            ? "The verified explanation is now available."
            : "Recorded.");
      setPresentation({ state: response.presentation?.state ?? kind, message });
      setFeedback({
        message,
        tone: response.correct
          ? "success"
          : kind === "reveal"
            ? "warning"
            : "neutral",
      });
    } catch (nextError) {
      setError(
        nextError instanceof AuthenticatedApiError && nextError.status === 409
          ? "This Daily session changed in another tab. Reloading the reserved deck."
          : "Daily could not record that action.",
      );
      if (
        nextError instanceof AuthenticatedApiError &&
        nextError.status === 409
      )
        void load();
    }
  }

  async function handleMove(attempt: DailyBlundrBoardMoveAttempt) {
    await action("attempt", attempt.uci);
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
            ) : completionSyncFailed ? (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setCompletionSyncAttempt((value) => value + 1);
                }}
                className="mt-4 inline-flex rounded-2xl bg-stone-950 px-4 py-3 text-sm font-black text-white"
              >
                Retry progress sync
              </button>
            ) : (
              <Link
                href="/settings"
                className="mt-4 inline-flex rounded-2xl bg-stone-950 px-4 py-3 text-sm font-black text-white"
              >
                Open Settings
              </Link>
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
        {session && !currentCard ? (
          <section className="mt-5 rounded-3xl border border-green-200 bg-green-50 p-5">
            <Sparkles className="text-green-700" size={20} />
            <h2 className="mt-3 text-lg font-black">Daily complete</h2>
            <p className="mt-2 text-sm leading-6 text-green-900">
              Your reserved deck is complete. First attempts remain immutable.
            </p>
          </section>
        ) : null}
        {session && currentCard ? (
          <section className="mt-5 space-y-4 rounded-3xl bg-stone-900 p-4 text-white">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-green-300">
                {currentCard.activityId.replaceAll("_", " ")}
              </div>
              {currentTaskNumber ? (
                <div className="mt-2 text-xs font-bold text-stone-400">
                  Task {currentTaskNumber} of {session.publicCards.length}
                </div>
              ) : null}
              <h2 className="mt-2 text-xl font-black">{currentCard.title}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                {currentCard.prompt}
              </p>
              <p className="mt-2 text-xs text-stone-400">{currentCard.why}</p>
            </div>
            {currentCard.interaction === "choice" && currentCard.options ? (
              <div className="grid gap-2">
                {currentCard.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    disabled={
                      presentation?.state === "revealed" ||
                      presentation?.state === "committed"
                    }
                    onClick={() => void action("attempt", option.id)}
                    className="min-h-12 rounded-2xl bg-white px-4 py-3 text-left text-sm font-black text-stone-900 disabled:opacity-60"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : (
              <DailyBlundrBoard
                fen={currentCard.positionFen}
                disabled={
                  presentation?.state === "revealed" ||
                  presentation?.state === "committed"
                }
                onSquareClick={() => undefined}
                onMoveAttempt={(attempt) => void handleMove(attempt)}
                openingColor={currentCard.side}
                forcedOrientation={currentCard.side}
                boardVisuals={null}
                squareStyles={{}}
                animationClassName={null}
              />
            )}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void action("reveal")}
                className="min-h-11 rounded-2xl bg-white px-4 py-3 text-sm font-black text-green-800"
              >
                Reveal
              </button>
              <button
                type="button"
                onClick={() => void action("retry")}
                className="min-h-11 rounded-2xl bg-stone-700 px-4 py-3 text-sm font-black text-white"
              >
                <RefreshCw size={15} className="mr-1 inline" />
                Retry
              </button>
            </div>
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
