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
  return (
    <section className={classNames("space-y-4", className)}>
      {!embedded ? (
        <header className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-green-700">
                <Sparkles size={14} />
                Review
              </div>
              <h1 className="mt-3 text-2xl font-black tracking-tight text-stone-950">
                Review and practice
              </h1>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Practice the patterns that make Daily Blundr easier. Blundr
                keeps the queue calm and the minigames focused.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {settingsHref ? (
                <Link
                  href={settingsHref}
                  className="rounded-2xl bg-stone-100 p-3 text-stone-600 shadow-sm"
                  aria-label="Open settings"
                >
                  <Settings size={18} />
                </Link>
              ) : null}
              <Link
                href={homeHref}
                className="rounded-2xl bg-stone-100 p-3 text-stone-600 shadow-sm"
                aria-label="Back to home"
              >
                <Home size={18} />
              </Link>
            </div>
          </div>
        </header>
      ) : null}

      <ReviewTabDailyBlundrPanel enabled={capabilities?.dailyEnabled ?? null} />

      <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <BlundrAssetImage
            asset={BLUNDR_TEMPO_ASSETS.coach}
            alt="Blundr coach"
            variant="tempoCard"
            className="mx-auto w-full max-w-[9rem] sm:mx-0 sm:w-32"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">
              Minigames
            </div>
            <h2 className="mt-2 text-lg font-black tracking-tight text-stone-950">
              Exactly three deep practice games
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Pick a verified multi-step scenario and practice outside the Daily
              Blundr loop.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        {productionGames.map((definition) => {
          const resolved =
            getDailyMiniGameDefinition(definition.id) ?? definition;
          return (
            <Link
              key={definition.id}
              href={`/review/minigames/${definition.id}`}
              className="group rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm transition hover:border-green-200 hover:bg-[#fbfcf7]"
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
                  <h3 className="mt-3 text-lg font-black tracking-tight text-stone-950">
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

              <div className="mt-4 grid gap-2">
                <div className="rounded-2xl bg-stone-50 px-3 py-3 text-sm font-semibold text-stone-600">
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

              <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-[#fbfcf7] px-3 py-3 ring-1 ring-stone-200">
                <div className="text-sm font-black text-stone-950">
                  Start practice
                </div>
                <ArrowRight size={16} className="text-green-700" />
              </div>
            </Link>
          );
        })}
        {capabilities !== null && productionGames.length === 0 ? (
          <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
            Deep minigames are not enabled for this staging environment yet.
          </div>
        ) : null}
      </section>
    </section>
  );
}
