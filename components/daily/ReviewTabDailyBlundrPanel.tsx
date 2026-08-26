"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, CheckCircle2, Target } from "lucide-react";
import { authenticatedApiFetch } from "@/lib/blundr/api/authenticatedApiClient";
import type { ProductionDailyPublicSession } from "@/lib/blundr/daily/productionDailyTypes";

function clampDailyCardGoal(value: unknown, fallback = 10): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const next = Math.trunc(parsed);
  if (next < 1) return 1;
  if (next > 99) return 99;
  return next;
}

function resolvePrimaryLabel(
  hasCards: boolean,
  started: boolean,
  pendingCompletion: boolean,
): string {
  if (!hasCards) return "Start";
  if (pendingCompletion) return "Complete";
  if (started) return "Resume";
  return "Start";
}

export function ReviewTabDailyBlundrPanel({
  enabled,
}: {
  enabled: boolean | null;
}) {
  const [session, setSession] = useState<ProductionDailyPublicSession | null>(
    null,
  );
  const [loadFailed, setLoadFailed] = useState(false);
  const [dailyCardGoal, setDailyCardGoal] = useState(10);

  useEffect(() => {
    let active = true;
    if (enabled !== true) {
      setSession(null);
      setLoadFailed(false);
      setDailyCardGoal(10);
      return () => {
        active = false;
      };
    }
    void authenticatedApiFetch<{
      session: ProductionDailyPublicSession;
    }>("/api/blundr/daily/today", { cache: "no-store" })
      .then((payload) => {
        if (active) {
          setSession(payload.session);
          setLoadFailed(false);
        }
      })
      .catch(() => {
        if (active) {
          setSession(null);
          setLoadFailed(true);
        }
      });
    void authenticatedApiFetch<{
      ok: true;
      data: { dailyBlundrCardGoal?: unknown };
    }>("/api/blundr/account/preferences", { cache: "no-store" })
      .then((payload) => {
        if (active) {
          setDailyCardGoal(
            clampDailyCardGoal(payload.data?.dailyBlundrCardGoal, 10),
          );
        }
      })
      .catch(() => {
        if (active) setDailyCardGoal(10);
      });
    return () => {
      active = false;
    };
  }, [enabled]);

  const deck = session?.publicCards ?? [];
  const hasCards = deck.length > 0;
  const completedToday = Number.isFinite(session?.cardsCompletedToday)
    ? Math.max(0, Math.trunc(Number(session?.cardsCompletedToday)))
    : session?.state.completedCardIds.length ?? 0;
  const effectiveGoal = Math.max(1, session?.dailyCardTarget ?? dailyCardGoal);
  const remainingCount = Math.max(0, effectiveGoal - completedToday);
  const started = completedToday > 0;
  const complete = completedToday >= effectiveGoal;
  const primaryLabel = resolvePrimaryLabel(
    hasCards,
    started,
    complete,
  );
  const statusMessage =
    enabled === null
      ? "Checking Daily Blundr…"
      : enabled === false
        ? "Daily Blundr is unavailable in this environment."
        : loadFailed
          ? "Daily Blundr couldn't load today's deck."
          : complete
            ? "Today's Daily goal is complete."
            : hasCards
              ? `${remainingCount} Daily card${remainingCount === 1 ? "" : "s"} remaining today.`
              : "Preparing today's Daily deck…";

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-white/92 p-5 shadow-[0_18px_42px_rgba(16,20,17,0.08)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-green-800">
            Daily Blundr
          </div>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-stone-950">
            Your Daily deck.
          </h2>
          <p className="mt-2 text-[13px] leading-[1.55] text-stone-600">
            {statusMessage}
          </p>
        </div>
        <div className="rounded-full bg-green-800 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white">
          {primaryLabel}
        </div>
      </div>

      <div className="mt-5 grid overflow-hidden rounded-[1.1rem] border border-stone-200 bg-stone-50/90 text-center text-xs font-black sm:grid-cols-4">
        <div className="px-2 py-3 text-stone-700 sm:border-r sm:border-stone-200">
          <Target size={15} className="mx-auto mb-1 text-green-700" />
          {completedToday} done today
        </div>
        <div className="px-2 py-3 text-stone-700 sm:border-r sm:border-stone-200">
          <Target size={15} className="mx-auto mb-1 text-orange-600" />
          {remainingCount} remaining
        </div>
        <div className="px-2 py-3 text-stone-700 sm:border-r sm:border-stone-200">
          <CheckCircle2 size={15} className="mx-auto mb-1 text-green-700" />
          {effectiveGoal} card target
        </div>
        <div className="px-2 py-3 text-stone-700">
          <BadgeCheck size={15} className="mx-auto mb-1 text-green-700" />
          Account saved
        </div>
      </div>

      <Link
        href={enabled === true ? "/daily" : "/review"}
        aria-disabled={enabled !== true}
        className="mt-4 inline-flex min-h-11 items-center justify-between rounded-[13px] bg-green-800 px-4 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-green-900 aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
      >
        <span>
          {enabled === true && hasCards
            ? `${primaryLabel} Daily Blundr`
            : enabled === true
              ? "Open Daily Blundr"
              : "Daily Blundr unavailable"}
        </span>
        <ArrowRight size={18} />
      </Link>
    </section>
  );
}
