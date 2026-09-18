"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { authenticatedApiFetch } from "@/lib/blundr/api/authenticatedApiClient";
import { BLUNDR_REWARD_PRESENTATION_REFRESH_EVENT } from "@/lib/blundr/rewards/rewardPresentationSignal";
import {
  buildRewardPresentationViewModel,
  type RewardPresentation,
} from "./rewardPresentationViewModel";

const CLAIMANT_KEY = "blundr.reward-presentations.v2.claimant";
const HOME_PRESENTATION_DELAY_MS = 2_000;

function claimantId(): string {
  try {
    const existing = window.sessionStorage.getItem(CLAIMANT_KEY);
    if (existing) return existing;
    const created = `reward-tab:${crypto.randomUUID()}`;
    window.sessionStorage.setItem(CLAIMANT_KEY, created);
    return created;
  } catch {
    return `reward-tab:${crypto.randomUUID()}`;
  }
}

export function RewardPresentationDialog({
  presentation,
  onCollect,
}: {
  presentation: RewardPresentation;
  onCollect: () => void;
}) {
  const reward = buildRewardPresentationViewModel(presentation);
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-stone-950/25 px-4 py-[max(1rem,env(safe-area-inset-bottom))] sm:items-center sm:p-6"
      role="presentation"
      data-testid="reward-presentation-backdrop"
    >
      <section
        className="w-full max-w-[30rem] rounded-[2rem] bg-[#fffdf7] px-6 pb-6 pt-7 text-center shadow-[0_24px_70px_rgba(28,25,23,0.16)] ring-1 ring-stone-900/5 sm:px-8 sm:pb-8 sm:pt-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reward-presentation-title"
        aria-describedby="reward-presentation-body"
      >
        <div className="relative mx-auto flex h-[clamp(10.5rem,42vw,15rem)] max-h-[15rem] w-full items-center justify-center">
          <img
            src={reward.asset}
            alt={reward.alt}
            className="h-full w-full object-contain object-center"
          />
        </div>
        {reward.rarityLabel ? (
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
            {reward.rarityLabel}
          </p>
        ) : null}
        <h2
          id="reward-presentation-title"
          className="mt-3 text-2xl font-semibold text-stone-950"
        >
          {reward.title}
        </h2>
        <p
          id="reward-presentation-body"
          className="mx-auto mt-2 max-w-[20rem] text-base text-stone-700"
        >
          {reward.body}
        </p>
        <div className="mt-7">
          <button
            type="button"
            className="min-h-12 w-full rounded-2xl bg-green-800 px-5 text-base font-semibold text-white shadow-sm transition hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:ring-offset-2 focus:ring-offset-[#fffdf7]"
            onClick={onCollect}
          >
            Collect
          </button>
        </div>
      </section>
    </div>
  );
}

/** The sole authenticated, server-leased Rewards v2 presentation owner. */
export function RewardPresentationHost() {
  const pathname = usePathname() ?? "/";
  const isHome = pathname === "/";
  const [active, setActive] = useState<RewardPresentation | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [scheduleVersion, setScheduleVersion] = useState(0);
  const claiming = useRef(false);
  const isHomeRef = useRef(isHome);
  const activeRef = useRef<RewardPresentation | null>(active);
  const surfacedThisHomeEntry = useRef(false);
  const enabled =
    process.env.NEXT_PUBLIC_BLUNDR_REWARD_PRESENTATIONS_V2_ENABLED === "true";
  const claimedBy = useRef<string | null>(null);
  if (!claimedBy.current && typeof window !== "undefined")
    claimedBy.current = claimantId();

  isHomeRef.current = isHome;
  activeRef.current = active;

  const claimNext = useCallback(async () => {
    if (
      !enabled ||
      !isHomeRef.current ||
      activeRef.current ||
      claiming.current ||
      surfacedThisHomeEntry.current ||
      !claimedBy.current
    )
      return;
    claiming.current = true;
    try {
      const response = await authenticatedApiFetch<{
        data: RewardPresentation | null;
      }>("/api/blundr/rewards/presentations/claim", {
        method: "POST",
        headers: { "x-blundr-presentation-client": claimedBy.current },
      });
      setUnavailable(false);
      if (
        response.data &&
        isHomeRef.current &&
        !activeRef.current &&
        !surfacedThisHomeEntry.current
      ) {
        surfacedThisHomeEntry.current = true;
        setActive(response.data);
      }
    } catch {
      setUnavailable(true);
    } finally {
      claiming.current = false;
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    if (isHome) {
      surfacedThisHomeEntry.current = false;
      return;
    }
    if (activeRef.current) setActive(null);
  }, [enabled, isHome]);

  useEffect(() => {
    if (
      !enabled ||
      !isHome ||
      active ||
      surfacedThisHomeEntry.current ||
      !claimedBy.current
    )
      return;
    const timer = window.setTimeout(() => {
      void claimNext();
    }, HOME_PRESENTATION_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [active, claimNext, enabled, isHome, scheduleVersion]);

  useEffect(() => {
    if (!enabled) return;
    const resume = () => {
      if (
        document.visibilityState === "visible" &&
        isHomeRef.current &&
        !activeRef.current &&
        !surfacedThisHomeEntry.current
      )
        setScheduleVersion((value) => value + 1);
    };
    window.addEventListener("focus", resume);
    window.addEventListener(BLUNDR_REWARD_PRESENTATION_REFRESH_EVENT, resume);
    document.addEventListener("visibilitychange", resume);
    return () => {
      window.removeEventListener("focus", resume);
      window.removeEventListener(
        BLUNDR_REWARD_PRESENTATION_REFRESH_EVENT,
        resume,
      );
      document.removeEventListener("visibilitychange", resume);
    };
  }, [enabled]);

  useEffect(() => {
    if (!active || !isHome || !claimedBy.current) return;
    void authenticatedApiFetch("/api/blundr/rewards/presentations/state", {
      method: "POST",
      body: JSON.stringify({
        presentationId: active.id,
        claimedBy: claimedBy.current,
        action: "rendered",
      }),
    }).catch(() => setUnavailable(true));
  }, [active, isHome]);

  const finish = useCallback(
    async () => {
      if (!active || !claimedBy.current) return;
      const current = active;
      try {
        await authenticatedApiFetch("/api/blundr/rewards/presentations/state", {
          method: "POST",
          body: JSON.stringify({
            presentationId: current.id,
            claimedBy: claimedBy.current,
            action: "acknowledged",
          }),
        });
        setUnavailable(false);
        setActive(null);
      } catch {
        setUnavailable(true);
      }
    },
    [active],
  );

  if (!enabled) return null;
  if (!active)
    return unavailable ? (
      <div className="sr-only" role="status">
        Reward delivery is temporarily unavailable.
      </div>
    ) : null;
  return (
    <RewardPresentationDialog
      presentation={active}
      onCollect={() => void finish()}
    />
  );
}
