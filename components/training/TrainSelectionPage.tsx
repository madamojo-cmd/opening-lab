"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import { BlundrBottomNav } from "@/components/navigation/BlundrBottomNav";
import { ProfileSettingsIcon } from "@/components/navigation/ProfileSettingsIcon";
import { RepertoireOpeningGrid } from "@/components/repertoire/RepertoireOpeningGrid";
import { BlundrButton, BlundrCard, BlundrStateCard } from "@/components/blundr/ui";
import { getLocalAccountCurrentUserId } from "@/lib/blundr/accounts/localAccountStorage";
import { loadRepertoireProgress } from "@/lib/blundr/repertoire/repertoireProgressService";
import type { RepertoireProgress } from "@/lib/blundr/repertoire/repertoireTypes";
import { useRouter } from "next/navigation";

function loadTrainingSelectionProgress(): RepertoireProgress {
  return loadRepertoireProgress({ userId: getLocalAccountCurrentUserId() });
}

export function TrainSelectionPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<RepertoireProgress | null>(null);

  useEffect(() => {
    setProgress(loadTrainingSelectionProgress());
  }, []);

  if (!progress) {
    return (
      <>
        <main className="blundr-page-bg min-h-screen px-4 py-5 text-stone-950">
          <div className="mx-auto max-w-md pb-28">
            <header className="mb-4 flex items-start justify-between gap-3 rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Train</div>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-stone-950">Loading your openings.</h1>
                <p className="mt-2 text-sm leading-6 text-stone-600">Blundr is checking which openings are ready to train.</p>
              </div>
              <ProfileSettingsIcon />
            </header>
            <BlundrStateCard
              kind="loading"
              eyebrow="Train"
              title="Loading your openings."
              copy="Blundr is checking which openings are ready to train."
            />
          </div>
        </main>
        <BlundrBottomNav />
      </>
    );
  }

  return (
    <>
      <main className="blundr-page-bg min-h-screen px-4 py-5 text-stone-950">
        <div className="mx-auto max-w-md pb-28 pt-1">
          <header className="rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-green-700">
                  <Sparkles size={14} />
                  Train
                </div>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-stone-950">Which opening do you want to practice?</h1>
                <p className="mt-2 text-sm leading-6 text-stone-600">Choose an unlocked opening and run your reps.</p>
              </div>
              <ProfileSettingsIcon />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
              <BlundrCard tone="warm" className="p-4">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Daily Blundr</div>
                <p className="mt-2 text-sm leading-6 text-stone-600">Need the daily loop instead? Switch to the completion flow for today.</p>
              </BlundrCard>
              <BlundrButton href="/daily" variant="secondary" className="self-start" iconTrailing={<ChevronRight size={16} />}>
                Open Daily
              </BlundrButton>
            </div>
          </header>

          <div className="mt-4">
            <RepertoireOpeningGrid
              progress={progress}
              onTrainOpening={(openingId) => router.push(`/train?openingId=${encodeURIComponent(openingId)}`)}
            />
          </div>

          <div className="mt-4 rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Need a different opening?</div>
            <p className="mt-2 text-sm leading-6 text-stone-600">Open repertoire to unlock more openings or adjust your starter pack.</p>
            <Link href="/repertoire" className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-green-700 px-4 py-3 text-sm font-black text-white shadow-sm">
              Repertoire
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </main>
      <BlundrBottomNav />
    </>
  );
}
