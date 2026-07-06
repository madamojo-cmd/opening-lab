"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, RefreshCw, Sparkles } from "lucide-react";
import { BLUNDR_EMPTY_STATE_ASSETS, BLUNDR_TEMPO_ASSETS } from "@/lib/blundr/assets/blundrAssetManifest";
import { BLUNDR_ANALYTICS_EVENTS } from "@/lib/blundr/analytics/blundrAnalyticsEvents";
import { trackBlundrAnalyticsEvent } from "@/lib/blundr/analytics/blundrAnalyticsService";
import { getLocalAccountCurrentUserId } from "@/lib/blundr/accounts/localAccountStorage";
import { getStarterPackById } from "@/lib/blundr/onboarding/starterPacks";
import { loadRepertoireProgress, unlockAndPersistOpening } from "@/lib/blundr/repertoire/repertoireProgressService";
import type { RepertoireProgress } from "@/lib/blundr/repertoire/repertoireTypes";
import { BlundrAssetImage } from "@/components/assets/BlundrAssetImage";
import { RepertoireOpeningGrid } from "./RepertoireOpeningGrid";
import { RepertoirePointsSummary } from "./RepertoirePointsSummary";
import { RepertoireTempoCallout } from "./RepertoireTempoCallout";
import { RepertoireUnlockProgress } from "./RepertoireUnlockProgress";
import { RewardHistoryList } from "@/components/rewards/RewardHistoryList";

type RepertoireProgressPanelProps = {
  onTrainOpening?: (openingId: string) => void;
  homeHref?: string;
  className?: string;
  embedded?: boolean;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function useRepertoireProgress(initialUserId: string): [string, RepertoireProgress, (progress: RepertoireProgress) => void] {
  const [userId, setUserId] = useState(initialUserId);
  const [progress, setProgress] = useState<RepertoireProgress>(() => loadRepertoireProgress({ userId: initialUserId }));

  useEffect(() => {
    const nextUserId = getLocalAccountCurrentUserId();
    setUserId(nextUserId);
    setProgress(loadRepertoireProgress({ userId: nextUserId }));
  }, [initialUserId]);

  return [userId, progress, setProgress];
}

export function RepertoireProgressPanel({ onTrainOpening, homeHref = "/", className, embedded = false }: RepertoireProgressPanelProps) {
  const initialUserId = getLocalAccountCurrentUserId();
  const [userId, progress, setProgress] = useRepertoireProgress(initialUserId);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unlockingOpeningId, setUnlockingOpeningId] = useState<string | null>(null);

  const starterPack = useMemo(() => getStarterPackById(progress.selectedStarterPackId), [progress.selectedStarterPackId]);
  const unlockedCount = progress.unlockedOpeningIds.length;
  const lockedCount = progress.lockedOpeningIds.length;

  useEffect(() => {
    trackBlundrAnalyticsEvent(BLUNDR_ANALYTICS_EVENTS.REPERTOIRE_PAGE_VIEWED, {
      userId,
      unlockedCount,
      lockedCount,
    });
  }, [userId]);

  async function handleUnlock(openingId: string) {
    setUnlockingOpeningId(openingId);
    setErrorMessage(null);
    setStatusMessage(null);
    trackBlundrAnalyticsEvent(BLUNDR_ANALYTICS_EVENTS.REPERTOIRE_UNLOCK_ATTEMPTED, {
      userId,
      openingId,
    });
    try {
      const result = await unlockAndPersistOpening({
        userId,
        openingId,
        starterPackId: progress.selectedStarterPackId,
      });
      if (result.ok === false) {
        const error = result;
        setErrorMessage(error.message);
        trackBlundrAnalyticsEvent(BLUNDR_ANALYTICS_EVENTS.REPERTOIRE_UNLOCK_FAILED, {
          userId,
          openingId,
          code: error.code,
        });
        return;
      }
      setProgress(result.progress);
      setStatusMessage("Opening unlocked.");
    } finally {
      setUnlockingOpeningId(null);
    }
  }

  function handleTrainOpening(openingId: string) {
    if (onTrainOpening) {
      onTrainOpening(openingId);
      return;
    }
    setStatusMessage("Open this opening from Home to start training.");
  }

  return (
    <section className={classNames("space-y-4", className)}>
      <header className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-green-700">
              <BookOpen size={13} />
              Repertoire progress
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-stone-950">Build your repertoire</h1>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Earn repertoire points by training. Use them to unlock more openings when you are ready.
            </p>
          </div>
          {!embedded ? (
            <Link href={homeHref} className="rounded-2xl bg-stone-100 p-3 text-stone-600 shadow-sm">
              <ArrowLeft size={18} />
            </Link>
          ) : (
            <button type="button" onClick={() => setProgress(loadRepertoireProgress({ userId }))} className="rounded-2xl bg-stone-100 p-3 text-stone-600 shadow-sm">
              <RefreshCw size={18} />
            </button>
          )}
        </div>

        <div className="mt-4 rounded-2xl bg-[#fbfcf7] p-3">
          <div className="grid gap-3 sm:grid-cols-[auto,1fr] sm:items-center">
            <BlundrAssetImage asset={BLUNDR_TEMPO_ASSETS.coach} alt="Tempo coach" variant="tempoInline" className="mx-auto sm:mx-0" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Tempo says</div>
              <p className="mt-1 text-sm leading-6 text-stone-700">
                Every rep makes your repertoire wider. Start with your pack, then unlock the lines you want next.
              </p>
              {starterPack ? (
                <p className="mt-2 text-xs font-semibold text-stone-500">
                  Current pack: <span className="font-black text-stone-700">{starterPack.displayName}</span>
                  {" • "}
                  {starterPack.styleSummary}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {statusMessage ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-900 shadow-sm">{statusMessage}</div>
      ) : null}
      {errorMessage ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-4 text-sm font-semibold text-stone-700 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <BlundrAssetImage
              asset={BLUNDR_EMPTY_STATE_ASSETS.errorSafeFallback}
              alt="Safe fallback"
              variant="emptyState"
              className="mx-auto sm:mx-0 sm:shrink-0"
            />
            <div>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Safe fallback</div>
              <p className="mt-2 text-sm leading-6 text-stone-700">{errorMessage}</p>
            </div>
          </div>
        </div>
      ) : null}

      <RepertoirePointsSummary progress={progress} />
      <RepertoireUnlockProgress progress={progress} />

      <RepertoireTempoCallout />
      <RewardHistoryList />

      <div className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Current state</div>
            <div className="mt-1 text-sm font-semibold text-stone-600">
              {unlockedCount} unlocked, {lockedCount} locked
            </div>
          </div>
          <div className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-600">
            {progress.nextUnlockCost > 0 ? `${progress.nextUnlockCost} points next` : "All MVP lines unlocked"}
          </div>
        </div>
      </div>

      <RepertoireOpeningGrid
        progress={progress}
        onUnlock={handleUnlock}
        onTrainOpening={handleTrainOpening}
        unlockingOpeningId={unlockingOpeningId}
        emptyLockedState={
          <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4 text-sm leading-6 text-stone-600 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <BlundrAssetImage
                asset={BLUNDR_EMPTY_STATE_ASSETS.emptyRepertoire}
                alt="Empty repertoire"
                variant="emptyState"
                className="mx-auto sm:mx-0 sm:shrink-0"
              />
              <div>
                <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">All set</div>
                <p className="mt-2">
                  All eligible MVP openings are unlocked. Keep training to build points for future packs.
                </p>
                <p className="mt-2 text-xs font-semibold text-stone-500">
                  Tempo will widen the pool when new repertoire is ready.
                </p>
              </div>
            </div>
          </div>
        }
      />

      <div className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Starter pack</div>
            <div className="mt-1 text-lg font-black tracking-tight text-stone-950">{starterPack?.displayName ?? "Starter pack"}</div>
          </div>
          <div className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700">{starterPack?.shortName ?? "Tempo"}</div>
        </div>
        {starterPack ? (
          <div className="mt-3 grid gap-2 text-sm text-stone-600 sm:grid-cols-2">
            <div className="rounded-2xl bg-stone-50 p-3">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">White</div>
              <div className="mt-1 font-black text-stone-900">{starterPack.whiteOpeningName}</div>
            </div>
            <div className="rounded-2xl bg-stone-50 p-3">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">Black</div>
              <div className="mt-1 font-black text-stone-900">{starterPack.blackOpeningName}</div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
