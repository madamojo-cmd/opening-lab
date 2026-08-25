"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

import {
  PRODUCTION_MINI_GAME_REGISTRY,
  getDailyMiniGameDefinition,
} from "@/lib/blundr/daily/miniGames/dailyMiniGameRegistry";
import { ReviewTabDailyBlundrPanel } from "@/components/daily/ReviewTabDailyBlundrPanel";
import { ReviewQueueInbox } from "@/components/review/ReviewQueueInbox";

type ReviewHubProps = {
  embedded?: boolean;
  homeHref?: string;
  settingsHref?: string;
  className?: string;
};

function classNames(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

function formatDifficultyRange(recommendedFor: readonly string[]): string {
  if (!recommendedFor.length) return "beginner";
  if (recommendedFor.length === 1) return recommendedFor[0].replace(/_/g, " ");
  return `${recommendedFor[0].replace(/_/g, " ")} to ${recommendedFor[recommendedFor.length - 1].replace(/_/g, " ")}`;
}

export function ReviewHub({
  embedded = false,
  className,
}: ReviewHubProps) {
  const [capabilities, setCapabilities] = useState<{
    deepMiniGames: readonly string[];
    dailyEnabled: boolean;
  } | null>(null);
  useEffect(() => {
    let active = true;
    void fetch("/api/blundr/capabilities", { cache: "no-store" })
      .then((response) => response.json())
      .then(
        (payload: {
          deepMiniGames?: string[];
          daily?: { enabled?: boolean };
        }) => {
          if (active)
            setCapabilities({
              deepMiniGames: payload.deepMiniGames ?? [],
              dailyEnabled: payload.daily?.enabled === true,
            });
        },
      )
      .catch(() => {
        if (active) setCapabilities({ deepMiniGames: [], dailyEnabled: false });
      });
    return () => {
      active = false;
    };
  }, []);
  const productionGames = PRODUCTION_MINI_GAME_REGISTRY.filter(
    (definition) =>
      capabilities === null ||
      capabilities.deepMiniGames.includes(definition.id),
  );
  const enabledGameCount = productionGames.length;
  const hasUnavailableGames = capabilities !== null && enabledGameCount === 0;

  return (
    <section className={classNames("w-full space-y-[17px]", className)}>
      {!embedded ? (
        <header className="mb-[25px] flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-green-800">
              <Sparkles size={13} />
              Review
            </div>
            <h1 className="mt-3 text-[34px] font-black leading-[1.05] tracking-[-0.05em] text-stone-950 max-[820px]:text-[27px]">
              Review what needs to stick.
            </h1>
            <p className="mt-3 max-w-[720px] text-[13px] leading-[1.55] text-stone-600 max-[820px]:text-[11px]">
              Daily Blundr stays the adaptive core under Review. Minigames
              remain a separate practice category.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/daily"
              className="inline-flex min-h-11 items-center rounded-[13px] bg-green-800 px-4 text-sm font-black text-white shadow-[0_14px_30px_rgba(22,101,52,0.18)] transition hover:-translate-y-0.5 hover:bg-green-900"
              aria-label="Open Daily Blundr"
            >
              Open Daily Blundr
            </Link>
          </div>
        </header>
      ) : null}

      <div className="grid items-start gap-[17px] xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <ReviewTabDailyBlundrPanel
          enabled={capabilities?.dailyEnabled ?? null}
        />

        <section
          className="rounded-[22px] border border-stone-200/80 bg-white/90 p-5 shadow-[0_16px_34px_rgba(16,20,17,0.07)]"
          aria-label="Review queue"
        >
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-green-800">
            Review queue
          </div>
          <h2 className="mt-2 text-base font-black tracking-[-0.02em] text-stone-950">
            Mistakes to revisit.
          </h2>
          <p className="mt-2 text-[12px] leading-[1.5] text-stone-600">
            This inbox is backed by durable weakness projections tied to your
            imported and learned evidence.
          </p>
          <ReviewQueueInbox />
        </section>
      </div>

      <section
        className="rounded-[22px] border border-stone-200/80 bg-white/90 p-5 shadow-[0_16px_34px_rgba(16,20,17,0.07)]"
        aria-label="Standalone minigames"
      >
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-green-800">
          Minigames · separate from Daily
        </div>
        <h2 className="mt-2 text-base font-black tracking-[-0.02em] text-stone-950">
          {enabledGameCount || "Three"} production practice games
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {productionGames.map((definition) => {
            const resolved =
              getDailyMiniGameDefinition(definition.id) ?? definition;
            return (
              <Link
                key={definition.id}
                href={`/review/minigames/${definition.id}`}
                className="group flex min-h-[126px] flex-col justify-between rounded-[16px] border border-stone-200 bg-[#f8f8f5] p-4 transition hover:-translate-y-0.5 hover:border-green-200"
              >
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-green-700">
                      {resolved.canAppearInDailyBlundr === false
                        ? "Practice only"
                        : "Daily Blundr"}
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-black tracking-tight text-stone-950">
                    {resolved.displayName ?? resolved.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-[1.45] text-stone-600">
                    {resolved.shortDescription ?? resolved.summary}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.12em] text-green-800">
                  <span>{formatDifficultyRange(resolved.recommendedFor)}</span>
                  <ArrowRight size={15} />
                </div>
              </Link>
            );
          })}
          {hasUnavailableGames ? (
            <div className="rounded-[16px] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              Deep minigames are not enabled for this staging environment yet.
            </div>
          ) : null}
        </div>
      </section>
    </section>
  );
}
