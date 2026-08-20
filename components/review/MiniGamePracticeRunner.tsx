"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, BadgeCheck, Home, RefreshCw, Sparkles } from "lucide-react";
import { DailyBlundrBoard } from "@/components/daily/DailyBlundrBoard";
import { DailyBlundrCardFeedback } from "@/components/daily/DailyBlundrCardFeedback";
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
    <div className="space-y-6 px-4 py-6 sm:px-6">
      <header className="flex items-end justify-between gap-6 max-[820px]:flex-col max-[820px]:items-start">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-green-800">
            <Sparkles size={13} /> Review · Minigame
          </div>
          <h1 className="mt-3 text-[34px] font-black leading-[1.05] tracking-[-0.05em] text-stone-950 max-[820px]:text-[27px]">
            {instance.prompt}
          </h1>
          <p className="mt-3 max-w-[720px] text-[13px] leading-[1.55] text-stone-600 max-[820px]:text-[11px]">
            A representative production minigame. Daily Blundr progress remains
            separate.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex min-h-8 items-center rounded-full border border-green-200 bg-green-50 px-3 text-[10px] font-black uppercase tracking-[0.16em] text-green-800">
              <BadgeCheck size={12} className="mr-1.5" />
              Secure instance
            </span>
            <span className="inline-flex min-h-8 items-center rounded-full border border-stone-200 bg-white/80 px-3 text-[10px] font-black uppercase tracking-[0.16em] text-stone-600">
              {instance.family.replaceAll("_", " ")}
            </span>
            <span className="inline-flex min-h-8 items-center rounded-full border border-stone-200 bg-white/80 px-3 text-[10px] font-black uppercase tracking-[0.16em] text-stone-600">
              {instance.estimatedTimeSeconds}s target
            </span>
          </div>
        </div>
        <Link
          href={reviewHref}
          className="inline-flex min-h-11 items-center gap-2 rounded-[13px] border border-stone-200 bg-white/90 px-4 text-sm font-black text-stone-800 shadow-sm transition hover:-translate-y-0.5 hover:text-green-700"
        >
          <ArrowLeft size={15} />
          Review
        </Link>
      </header>

      <section className="grid items-start justify-center gap-[18px] lg:grid-cols-[minmax(0,1fr)_350px]">
        <article className="rounded-[22px] border border-stone-200 bg-white/92 p-5 shadow-[0_1px_2px_rgba(12,24,16,0.035),0_12px_40px_rgba(16,34,22,0.055)]">
          <div className="mb-3 flex items-center justify-between gap-3 px-2 pt-1">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-green-800">
                Practice board
              </div>
              <div className="mt-1 text-sm font-black text-stone-950">
                Verified scenario
              </div>
            </div>
            <div className="rounded-full bg-[#f8f8f5] px-3 py-1 text-xs font-bold text-stone-600 ring-1 ring-stone-200">
              {instance.status}
            </div>
          </div>
          <div className="rounded-[18px] border border-stone-200 bg-gradient-to-br from-[#eff4ef] to-[#f7f7f4] p-3">
            <div className="mx-auto w-full max-w-[430px]">
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
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 rounded-[16px] border border-stone-200 bg-[#f8f8f5] p-3">
            <div>
              <div className="text-sm font-black text-stone-950">
                Complete the secure sequence.
              </div>
              <div className="mt-1 text-xs leading-5 text-stone-600">
                Attempt {instance.attemptCount + 1} · Retry {instance.retryCount}
              </div>
            </div>
            <span className="inline-flex min-h-11 items-center justify-center rounded-[13px] bg-green-700 px-4 text-sm font-black text-white shadow-sm">
              Play on board
            </span>
          </div>
        </article>

        <aside className="space-y-4 rounded-[2rem] border border-white/70 bg-white/92 p-5 shadow-[0_18px_44px_rgba(38,31,20,0.09)] backdrop-blur-xl">
          <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/90 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">
                Objective
              </div>
              <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-stone-500">
                {instance.status}
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold leading-6 text-stone-900">
              {instance.prompt}
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {instance.goal}
            </p>
            <p className="mt-3 rounded-[1rem] bg-white px-3 py-2 text-xs text-stone-500 ring-1 ring-stone-200">
              Secure session {instance.instanceId.slice(0, 12)}… · {instance.board.orientation} orientation
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-[1.15rem] border border-stone-200 bg-stone-50/90 p-3 text-xs font-bold text-stone-700">
              <div className="text-[9px] font-black uppercase tracking-[0.16em] text-stone-500">
                Source
              </div>
              <div className="mt-1 text-stone-900">{instance.source}</div>
            </div>
            <div className="rounded-[1.15rem] border border-stone-200 bg-stone-50/90 p-3 text-xs font-bold text-stone-700">
              <div className="text-[9px] font-black uppercase tracking-[0.16em] text-stone-500">
                Status
              </div>
              <div className="mt-1 text-stone-900">{instance.status}</div>
            </div>
            <div className="rounded-[1.15rem] border border-stone-200 bg-stone-50/90 p-3 text-xs font-bold text-stone-700">
              <div className="text-[9px] font-black uppercase tracking-[0.16em] text-stone-500">
                ETA
              </div>
              <div className="mt-1 text-stone-900">{instance.estimatedTimeSeconds}s</div>
            </div>
          </div>

          {instance.feedback ? (
            <DailyBlundrCardFeedback
              message={instance.feedback}
              tone={
                instance.status === "completed" ||
                instance.status === "revealed"
                  ? "complete"
                  : "neutral"
              }
            />
          ) : null}
          {error ? (
            <p className="rounded-[1.15rem] border border-amber-200/80 bg-amber-50/90 px-3 py-3 text-sm font-semibold leading-6 text-amber-900">
              {error}
            </p>
          ) : null}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                void handleReveal();
              }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[1rem] bg-green-700 px-3 py-3 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles size={15} /> Reveal
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                void handleRetry();
              }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[1rem] bg-stone-100 px-3 py-3 text-sm font-black text-stone-700 ring-1 ring-stone-200 transition hover:-translate-y-0.5 hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={15} /> Retry
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                void handleReset();
              }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[1rem] bg-stone-100 px-3 py-3 text-sm font-black text-stone-700 ring-1 ring-stone-200 transition hover:-translate-y-0.5 hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reset
            </button>
            <Link
              href={reviewHref}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[1rem] bg-stone-100 px-3 py-3 text-sm font-black text-stone-700 ring-1 ring-stone-200 transition hover:-translate-y-0.5 hover:bg-stone-200"
            >
              <ArrowLeft size={15} /> Review
            </Link>
            <Link
              href={homeHref}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[1rem] bg-stone-100 px-3 py-3 text-sm font-black text-stone-700 ring-1 ring-stone-200 transition hover:-translate-y-0.5 hover:bg-stone-200"
            >
              <Home size={15} /> Home
            </Link>
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                void load();
              }}
              className="col-span-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-[1rem] bg-stone-950 px-3 py-3 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles size={15} /> Next Game
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}
