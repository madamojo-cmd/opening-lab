"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { authenticatedApiFetch } from "@/lib/blundr/api/authenticatedApiClient";

type RewardPresentation = {
  id: string;
  presentation_kind?: string;
  envelope?: Record<string, unknown>;
};

const CLAIMANT_KEY = "blundr.reward-presentations.v2.claimant";

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

function displayText(presentation: RewardPresentation): {
  title: string;
  body: string;
} {
  const envelope = presentation.envelope ?? {};
  const quantity = Number(envelope.quantity ?? envelope.amount ?? 0);
  const grantType = String(
    envelope.grantType ?? envelope.inventoryKind ?? "reward",
  );
  if (presentation.presentation_kind === "unlock")
    return {
      title: "Opening unlocked",
      body: "Your opening is now available to train.",
    };
  return {
    title: "Reward earned",
    body:
      quantity > 0
        ? `${quantity} ${grantType.replaceAll("_", " ")} added.`
        : "Your reward is ready.",
  };
}

/** The sole authenticated, server-leased Rewards v2 presentation owner. */
export function RewardPresentationHost() {
  const [active, setActive] = useState<RewardPresentation | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const claiming = useRef(false);
  const enabled =
    process.env.NEXT_PUBLIC_BLUNDR_REWARD_PRESENTATIONS_V2_ENABLED === "true";
  const claimedBy = useRef<string | null>(null);
  if (!claimedBy.current && typeof window !== "undefined")
    claimedBy.current = claimantId();

  const claimNext = useCallback(async () => {
    if (!enabled || active || claiming.current || !claimedBy.current) return;
    claiming.current = true;
    try {
      const response = await authenticatedApiFetch<{
        data: RewardPresentation | null;
      }>("/api/blundr/rewards/presentations/claim", {
        method: "POST",
        headers: { "x-blundr-presentation-client": claimedBy.current },
      });
      setUnavailable(false);
      if (response.data) setActive(response.data);
    } catch {
      setUnavailable(true);
    } finally {
      claiming.current = false;
    }
  }, [active, enabled]);

  useEffect(() => {
    void claimNext();
    const resume = () => {
      if (document.visibilityState === "visible") void claimNext();
    };
    window.addEventListener("focus", resume);
    document.addEventListener("visibilitychange", resume);
    return () => {
      window.removeEventListener("focus", resume);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [claimNext]);

  useEffect(() => {
    if (!active || !claimedBy.current) return;
    void authenticatedApiFetch("/api/blundr/rewards/presentations/state", {
      method: "POST",
      body: JSON.stringify({
        presentationId: active.id,
        claimedBy: claimedBy.current,
        action: "rendered",
      }),
    }).catch(() => setUnavailable(true));
  }, [active]);

  const finish = useCallback(
    async (action: "acknowledged" | "dismissed") => {
      if (!active || !claimedBy.current) return;
      const current = active;
      try {
        await authenticatedApiFetch("/api/blundr/rewards/presentations/state", {
          method: "POST",
          body: JSON.stringify({
            presentationId: current.id,
            claimedBy: claimedBy.current,
            action,
          }),
        });
        setUnavailable(false);
        setActive(null);
        queueMicrotask(() => void claimNext());
      } catch {
        setUnavailable(true);
      }
    },
    [active, claimNext],
  );

  if (!enabled) return null;
  if (!active)
    return unavailable ? (
      <div className="sr-only" role="status">
        Reward delivery is temporarily unavailable.
      </div>
    ) : null;
  const copy = displayText(active);
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-stone-950/30 p-4 sm:items-center"
      role="presentation"
    >
      <section
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reward-presentation-title"
      >
        <p className="text-xs font-black uppercase tracking-[0.18em] text-green-700">
          Blundr reward
        </p>
        <h2
          id="reward-presentation-title"
          className="mt-2 text-xl font-black text-stone-900"
        >
          {copy.title}
        </h2>
        <p className="mt-2 text-sm text-stone-700">{copy.body}</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            className="min-h-11 flex-1 rounded-xl bg-stone-100 px-4 font-semibold text-stone-800"
            onClick={() => void finish("dismissed")}
          >
            Dismiss
          </button>
          <button
            type="button"
            className="min-h-11 flex-1 rounded-xl bg-green-800 px-4 font-semibold text-white"
            onClick={() => void finish("acknowledged")}
          >
            Done
          </button>
        </div>
      </section>
    </div>
  );
}
