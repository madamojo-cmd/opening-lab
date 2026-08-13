"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Target,
} from "lucide-react";
import { authenticatedApiFetch } from "@/lib/blundr/api/authenticatedApiClient";
import type { ProductionDailyPublicSession } from "@/lib/blundr/daily/productionDailyTypes";

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

  useEffect(() => {
    let active = true;
    if (enabled !== true) {
      setSession(null);
      setLoadFailed(false);
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
    return () => {
      active = false;
    };
  }, [enabled]);

  const deck = session?.publicCards ?? [];
  const hasCards = deck.length > 0;
  const completedCount = session?.state.completedCardIds.length ?? 0;
  const remainingCount = Math.max(0, deck.length - completedCount);
  const started = completedCount > 0;
  const complete = Boolean(
    session && deck.length > 0 && completedCount >= deck.length,
  );
  const pendingCompletion = false;
  const primaryLabel = resolvePrimaryLabel(
    hasCards,
    started,
    pendingCompletion,
  );
  const statusMessage =
    enabled === null
      ? "Confirming Daily Blundr availability…"
      : enabled === false
        ? "Daily Blundr is unavailable in this environment."
        : loadFailed
          ? "Daily Blundr could not confirm today’s reserved deck."
          : complete
            ? "Today’s server-owned Daily deck is complete."
            : hasCards
              ? `${remainingCount} server-reserved task${remainingCount === 1 ? "" : "s"} ready.`
              : "Preparing today’s server-owned Daily deck…";

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-green-700">
            <Sparkles size={14} />
            Daily Blundr
          </div>
          <h2 className="mt-3 text-lg font-black tracking-tight text-stone-950">
            Blundr picked today’s smartest training.
          </h2>
          <p className="mt-1 text-sm leading-6 text-stone-600">
            {statusMessage}
          </p>
        </div>
        <div className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-600">
          {primaryLabel}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-stone-50 p-3">
        <div className="flex items-center gap-2 text-sm font-black text-stone-900">
          <BadgeCheck size={16} className="text-green-700" />
          Review
        </div>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Daily Blundr sits on top of Review, while the existing mistake queue
          stays unchanged below.
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-2xl bg-green-50 px-3 py-3 text-sm font-semibold text-green-900">
        <span>{statusMessage}</span>
        <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wide">
          {primaryLabel}
          <ChevronRight size={14} />
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs font-black">
        <div className="rounded-2xl bg-stone-50 px-2 py-3 text-stone-700">
          <Target size={15} className="mx-auto mb-1 text-green-700" />
          {completedCount} done
        </div>
        <div className="rounded-2xl bg-stone-50 px-2 py-3 text-stone-700">
          <Target size={15} className="mx-auto mb-1 text-orange-600" />
          {remainingCount} remaining
        </div>
        <div className="rounded-2xl bg-stone-50 px-2 py-3 text-stone-700">
          <CheckCircle2 size={15} className="mx-auto mb-1 text-green-700" />
          {deck.length} reserved
        </div>
        <div className="rounded-2xl bg-stone-50 px-2 py-3 text-stone-700">
          <BadgeCheck size={15} className="mx-auto mb-1 text-green-700" />
          Server owned
        </div>
      </div>

      <Link
        href={enabled === true ? "/daily" : "/review"}
        aria-disabled={enabled !== true}
        className="mt-4 inline-flex w-full items-center justify-between rounded-2xl bg-stone-950 px-4 py-3 text-sm font-black text-white shadow-sm aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
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
