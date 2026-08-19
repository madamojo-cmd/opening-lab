"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ChevronRight,
  Home,
  Settings,
  Sparkles,
} from "lucide-react";

import { BLUNDR_TEMPO_ASSETS } from "@/lib/blundr/assets/blundrAssetManifest";
import {
  PRODUCTION_MINI_GAME_REGISTRY,
  getDailyMiniGameDefinition,
} from "@/lib/blundr/daily/miniGames/dailyMiniGameRegistry";
import { BlundrAssetImage } from "@/components/assets/BlundrAssetImage";
import { ReviewTabDailyBlundrPanel } from "@/components/daily/ReviewTabDailyBlundrPanel";

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
  homeHref = "/",
  settingsHref = "/settings",
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
    <section className={classNames("w-full space-y-6", className)}>
      {!embedded ? (
        <header className="flex flex-col gap-5 rounded-[2rem] border border-stone-200/80 bg-white/85 px-5 py-5 shadow-[0_18px_40px_rgba(52,40,24,0.08)] backdrop-blur sm:px-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-green-700">
              <Sparkles size={14} />
              Review
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
              Daily and deep practice
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600 sm:text-base">
              Daily stays first. The three production minigames sit beside it as
              focused follow-up when you want more practice.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {settingsHref ? (
              <Link
                href={settingsHref}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-green-200 hover:text-green-700"
                aria-label="Open settings"
              >
                <Settings size={16} />
                Settings
              </Link>
            ) : null}
            <Link
              href={homeHref}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-green-200 hover:text-green-700"
              aria-label="Back to home"
            >
              <Home size={16} />
              Home
            </Link>
          </div>
        </header>
      ) : null}

      <ReviewTabDailyBlundrPanel enabled={capabilities?.dailyEnabled ?? null} />

      <section className="rounded-[2rem] border border-stone-200/80 bg-white/85 px-5 py-5 shadow-[0_18px_40px_rgba(52,40,24,0.08)] backdrop-blur sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <BlundrAssetImage
            asset={BLUNDR_TEMPO_ASSETS.coach}
            alt="Blundr coach"
            variant="tempoCard"
            className="mx-auto w-full max-w-[10rem] sm:mx-0 sm:w-32"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">
              Minigames
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-stone-950">
              Exactly three deep practice games
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Pick a verified multi-step scenario and practice outside the Daily
              Blundr loop. The queue stays separate, and the production registry
              still owns availability.
            </p>
          </div>
        </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-[18rem]">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">
                Production games
              </div>
              <div className="mt-1 text-2xl font-semibold tracking-tight text-stone-950">
                {enabledGameCount}
              </div>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">
                Daily access
              </div>
              <div className="mt-1 text-2xl font-semibold tracking-tight text-stone-950">
                {capabilities?.dailyEnabled === true ? "On" : "Quiet"}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {productionGames.map((definition) => {
          const resolved =
            getDailyMiniGameDefinition(definition.id) ?? definition;
          return (
            <Link
              key={definition.id}
              href={`/review/minigames/${definition.id}`}
              className="group flex h-full flex-col rounded-[1.75rem] border border-stone-200/80 bg-white/90 p-5 shadow-[0_14px_34px_rgba(52,40,24,0.08)] transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-[0_18px_42px_rgba(52,40,24,0.12)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-green-700">
                      {resolved.canAppearInDailyBlundr === false
                        ? "Practice only"
                        : "Daily Blundr"}
                    </span>
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">
                      {resolved.canAppearInStandalonePractice === false
                        ? "Queue only"
                        : "Standalone"}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight text-stone-950">
                    {resolved.displayName ?? resolved.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {resolved.shortDescription ?? resolved.summary}
                  </p>
                </div>
                <ChevronRight
                  size={18}
                  className="mt-1 text-stone-400 transition group-hover:text-green-700"
                />
              </div>

              <div className="mt-5 grid gap-2">
                <div className="rounded-2xl bg-stone-50 px-3 py-3 text-sm font-medium text-stone-600">
                  {resolved.skillIds.slice(0, 4).join(" • ")}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-white px-3 py-3 text-xs font-black uppercase tracking-[0.18em] text-stone-500 ring-1 ring-stone-200">
                    Difficulty
                    <div className="mt-1 text-sm font-black uppercase tracking-normal text-stone-950">
                      {formatDifficultyRange(resolved.recommendedFor)}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white px-3 py-3 text-xs font-black uppercase tracking-[0.18em] text-stone-500 ring-1 ring-stone-200">
                    Time
                    <div className="mt-1 text-sm font-black uppercase tracking-normal text-stone-950">
                      {resolved.estimatedSeconds
                        ? `${resolved.estimatedSeconds}s`
                        : "Quick"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-[#fbfcf7] px-3 py-3 ring-1 ring-stone-200">
                <div className="text-sm font-black text-stone-950">
                  Start practice
                </div>
                <ArrowRight size={16} className="text-green-700" />
              </div>
            </Link>
          );
        })}
        {hasUnavailableGames ? (
          <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
            Deep minigames are not enabled for this staging environment yet.
          </div>
        ) : null}
      </section>
    </section>
  );
}
