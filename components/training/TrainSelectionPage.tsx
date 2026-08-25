"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProfileSettingsIcon } from "@/components/navigation/ProfileSettingsIcon";
import { RepertoireOpeningGrid } from "@/components/repertoire/RepertoireOpeningGrid";
import { BlundrButton, BlundrStateCard } from "@/components/blundr/ui";
import { useRouter } from "next/navigation";
import { useDurableRepertoireProgress } from "@/components/repertoire/useDurableRepertoireProgress";

export function TrainSelectionPage() {
  const router = useRouter();
  const [repertoireState] = useDurableRepertoireProgress();

  if (repertoireState.status === "loading") {
    return (
      <main className="w-full text-stone-950">
        <div className="mx-auto max-w-[1340px]">
          <header className="mb-6 flex items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-green-800">
                Train
              </div>
              <h1 className="mt-3 text-[34px] font-black leading-[1.05] tracking-[-0.05em] text-stone-950 max-[820px]:text-[27px]">
                Loading your openings.
              </h1>
              <p className="mt-3 max-w-[720px] text-[13px] leading-[1.55] text-stone-600 max-[820px]:text-[11px]">
                Blundr is checking which openings are ready to train.
              </p>
            </div>
            <ProfileSettingsIcon />
          </header>
          <div className="max-w-md">
            <BlundrStateCard
              kind="loading"
              eyebrow="Train"
              title="Loading your openings."
              copy="Blundr is checking which openings are ready to train."
            />
          </div>
        </div>
      </main>
    );
  }

  if (repertoireState.status === "signed_out") {
    return (
      <main className="w-full text-stone-950">
        <div className="mx-auto max-w-[1340px]">
          <div className="max-w-md">
            <BlundrStateCard
              kind="offline"
              eyebrow="Train"
              title="Sign in to load your openings."
              copy="Sign in to load your saved repertoire before training can begin."
            />
          </div>
        </div>
      </main>
    );
  }

  if (repertoireState.status === "error" || !repertoireState.progress) {
    return (
      <main className="w-full text-stone-950">
        <div className="mx-auto max-w-[1340px]">
          <div className="max-w-md">
            <BlundrStateCard
              kind="error"
              eyebrow="Train"
              title="Opening list unavailable."
              copy={
                repertoireState.error ??
                "Tempo couldn't load your saved repertoire."
              }
            />
          </div>
        </div>
      </main>
    );
  }

  const progress = repertoireState.progress;

  return (
    <main className="w-full text-stone-950">
      <div className="mx-auto max-w-[1340px]">
        <header className="mb-6 flex items-end justify-between gap-6 max-[820px]:mb-4 max-[820px]:items-start">
          <div className="max-w-2xl">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-green-800">
              Train
            </div>
            <h1 className="mt-3 text-[34px] font-black leading-[1.05] tracking-[-0.05em] text-stone-950 max-[820px]:text-[27px]">
              Choose an opening.
            </h1>
            <p className="mt-3 max-w-[720px] text-[13px] leading-[1.55] text-stone-600 max-[820px]:text-[11px]">
              Unlocked openings only. Your rating band and training mode stay as
              you set them.
            </p>
          </div>
          <div className="flex items-center gap-2 max-[820px]:hidden">
            <BlundrButton
              href="/daily"
              variant="secondary"
              iconTrailing={<ChevronRight size={16} />}
            >
              Daily Blundr
            </BlundrButton>
            <BlundrButton
              href="/repertoire"
              variant="secondary"
              iconTrailing={<ChevronRight size={16} />}
            >
              Manage repertoire
            </BlundrButton>
          </div>
          <div className="min-[821px]:hidden">
            <ProfileSettingsIcon />
          </div>
        </header>

        <section className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-stone-200/80 bg-white/90 p-3 shadow-[0_12px_30px_rgba(16,20,17,0.06)]">
          <div className="inline-flex rounded-full bg-stone-100 p-1 text-xs font-black text-stone-600">
            <span className="rounded-full bg-white px-3 py-2 text-green-800 shadow-sm">
              All
            </span>
            <span className="px-3 py-2">White</span>
            <span className="px-3 py-2">Black</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-stone-100 px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-stone-600">
              Durable repertoire
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-blue-700">
              {progress.unlockedOpeningIds.length} unlocked
            </span>
          </div>
        </section>

        <RepertoireOpeningGrid
          progress={progress}
          onTrainOpening={(openingId) =>
            router.push(`/train?openingId=${encodeURIComponent(openingId)}`)
          }
        />
      </div>
    </main>
  );
}
