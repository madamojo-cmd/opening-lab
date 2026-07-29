"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Home, RefreshCw, Sparkles } from "lucide-react";
import { DailyBlundrBoard } from "@/components/daily/DailyBlundrBoard";
import { DailyBlundrCardFeedback } from "@/components/daily/DailyBlundrCardFeedback";
import { ProfileSettingsIcon } from "@/components/navigation/ProfileSettingsIcon";
import { BlundrStateCard } from "@/components/blundr/ui";
import type { StandaloneMiniGamePublicState } from "@/lib/blundr/daily/miniGames/standalone/standaloneMiniGameTypes";
import type { DailyBlundrBoardMoveAttempt } from "@/lib/blundr/daily/dailyBlundrPlayerTypes";
import { authenticatedApiFetch } from "@/lib/blundr/api/authenticatedApiClient";
import { useOnboardingAuthSession } from "@/lib/blundr/onboarding/useOnboardingAuthSession";

type MiniGamePracticeRunnerProps = {
  miniGameId: string;
  homeHref?: string;
  reviewHref?: string;
  settingsHref?: string;
};

async function requestInstance(
  miniGameId: string,
): Promise<StandaloneMiniGamePublicState | null> {
  const body = await authenticatedApiFetch<{
    instance?: StandaloneMiniGamePublicState;
  }>("/api/blundr/minigames/instances", {
    method: "POST",
    body: JSON.stringify({ miniGameId }),
  });
  return body.instance ?? null;
}

async function requestAction(
  instanceId: string,
  action: "advance" | "reveal" | "retry" | "reset",
  payload: Record<string, string | number | null>,
) {
  const body = await authenticatedApiFetch<{
    instance?: StandaloneMiniGamePublicState;
  }>(
    `/api/blundr/minigames/instances/${encodeURIComponent(instanceId)}/${action}`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
  return body.instance ?? null;
}

export function MiniGamePracticeRunner({
  miniGameId,
  homeHref = "/",
  reviewHref = "/review",
}: MiniGamePracticeRunnerProps) {
  const auth = useOnboardingAuthSession();
  const [instance, setInstance] =
    useState<StandaloneMiniGamePublicState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await Promise.race([
        requestInstance(miniGameId),
        new Promise<null>((resolve) =>
          window.setTimeout(() => resolve(null), 15_000),
        ),
      ]);
      if (!next)
        setError(
          "The secure practice session could not be created. Try again or return to Review.",
        );
      setInstance(next);
    } catch (requestError) {
      setInstance(null);
      setError(
        requestError instanceof Error && requestError.message
          ? requestError.message
          : "The secure practice session could not be created. Try again or return to Review.",
      );
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, [miniGameId]);

  useEffect(() => {
    if (auth.status === "authenticated") void load();
  }, [auth.status, load]);

  if (auth.status === "loading") {
    return (
      <BlundrStateCard
        kind="loading"
        eyebrow="Authentication"
        title="Checking your account session."
        copy="Blundr is confirming the secure session before reserving this game."
      />
    );
  }
  if (auth.status === "signed_out") {
    return (
      <BlundrStateCard
        kind="empty"
        eyebrow="Authentication required"
        title="Sign in to practice."
        copy="Secure practice sessions are available after you sign in."
        cta={{ label: "Open Settings", href: "/settings" }}
      />
    );
  }

  if (loading)
    return (
      <BlundrStateCard
        kind="loading"
        eyebrow="Minigames"
        title="Loading a secure practice game."
        copy="The server is reserving an answer-safe practice instance."
      />
    );
  if (!instance)
    return (
      <BlundrStateCard
        kind="empty"
        eyebrow="Minigames"
        title="Practice game unavailable"
        copy={error ?? "No verified practice game is available."}
        cta={{
          label: retrying ? "Retrying…" : "Retry",
          onClick: () => {
            setRetrying(true);
            void load();
          },
        }}
      />
    );

  async function handleReveal() {
    await runAction("reveal");
  }
  async function handleRetry() {
    await runAction("retry");
  }
  async function handleReset() {
    await runAction("reset");
  }
  async function runAction(
    action: "advance" | "reveal" | "retry" | "reset",
    payload: Record<string, string | number | null> = {},
  ) {
    if (!instance || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const next = await requestAction(instance.instanceId, action, {
        ...payload,
        revision: instance.revision,
      });
      if (next) setInstance(next);
      else setError("The server could not update this practice session.");
    } catch (requestError) {
      setError(
        requestError instanceof Error && requestError.message
          ? requestError.message
          : "The server could not update this practice session.",
      );
    } finally {
      setSubmitting(false);
    }
  }
  async function handleMoveAttempt(attempt: DailyBlundrBoardMoveAttempt) {
    await runAction("advance", {
      from: attempt.from,
      to: attempt.to,
      uci: attempt.uci,
      san: attempt.san,
    });
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-green-700">
              <Sparkles size={14} /> Minigames
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-stone-950">
              Secure practice
            </h1>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              The server owns the solution and grades this practice instance.
            </p>
          </div>
          <ProfileSettingsIcon />
        </div>
      </section>
      <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">
            Objective
          </div>
          <p className="mt-2 text-sm font-semibold leading-6 text-stone-800">
            {instance.prompt}
          </p>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            {instance.goal}
          </p>
          <p className="mt-2 text-xs text-stone-500">
            Instance {instance.instanceId.slice(0, 12)}… · {instance.status}
          </p>
        </div>
        <div className="mt-4">
          <DailyBlundrBoard
            fen={instance.board.fen}
            disabled={
              submitting ||
              instance.status === "completed" ||
              instance.status === "revealed" ||
              instance.status === "expired"
            }
            onSquareClick={() => undefined}
            onMoveAttempt={(attempt) => {
              void handleMoveAttempt(attempt);
            }}
            openingColor={instance.board.orientation}
            forcedOrientation={instance.board.orientation}
            boardVisuals={null}
            squareStyles={{}}
            animationClassName={null}
          />
        </div>
        {instance.feedback ? (
          <DailyBlundrCardFeedback
            message={instance.feedback}
            tone={
              instance.status === "completed" || instance.status === "revealed"
                ? "complete"
                : "neutral"
            }
          />
        ) : null}
        {error ? <p className="mt-3 text-sm text-amber-800">{error}</p> : null}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button
            type="button"
            disabled={submitting}
            onClick={() => {
              void handleReveal();
            }}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white px-3 py-3 text-sm font-black text-green-700 ring-1 ring-green-200"
          >
            <Sparkles size={15} /> Reveal
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => {
              void handleRetry();
            }}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-stone-100 px-3 py-3 text-sm font-black text-stone-700"
          >
            <RefreshCw size={15} /> Retry
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => {
              void handleReset();
            }}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-stone-100 px-3 py-3 text-sm font-black text-stone-700"
          >
            Reset
          </button>
          <Link
            href={reviewHref}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-stone-100 px-3 py-3 text-sm font-black text-stone-700"
          >
            <ArrowLeft size={15} /> Review
          </Link>
          <Link
            href={homeHref}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-stone-100 px-3 py-3 text-sm font-black text-stone-700"
          >
            <Home size={15} /> Home
          </Link>
        </div>
      </section>
    </div>
  );
}
