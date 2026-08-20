"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { authenticatedApiFetch } from "@/lib/blundr/api/authenticatedApiClient";
import { BLUNDR_REWARD_PRESENTATION_REFRESH_EVENT } from "@/lib/blundr/rewards/rewardPresentationSignal";
import type {
  RewardRarity,
  VariableRewardType,
} from "@/lib/blundr/accounts/accountTypes";
import { RewardAnimation } from "./RewardAnimation";
import { RewardIcon } from "./RewardIcon";
import { RewardRarityBadge } from "./RewardRarityBadge";
import styles from "./RewardPresentationHost.module.css";

type RewardPresentation = {
  id: string;
  presentation_kind?: string;
  envelope?: Record<string, unknown>;
};

type RewardPresentationCopy = {
  title: string;
  body: string;
  amountLabel: string | null;
  kindLabel: string;
  rarity: RewardRarity;
  rewardType: VariableRewardType;
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

function normalizeToken(value: unknown): string {
  return String(value ?? "")
    .replaceAll("_", " ")
    .trim();
}

function displayText(presentation: RewardPresentation): RewardPresentationCopy {
  const envelope = presentation.envelope ?? {};
  const quantity = Number(envelope.quantity ?? envelope.amount ?? 0);
  const grantType = normalizeToken(
    envelope.grantType ?? envelope.inventoryKind ?? "reward",
  );
  const rarity = resolveRarity(envelope.rarity);
  const rewardType = resolveRewardType(
    envelope.rewardType ?? envelope.grantType,
  );
  if (presentation.presentation_kind === "unlock")
    return {
      title: "Opening unlocked",
      body: "Your opening is now available to train.",
      amountLabel: null,
      kindLabel: "Unlock",
      rarity,
      rewardType,
    };
  return {
    title: "Reward earned",
    body:
      quantity > 0
        ? `${quantity} ${grantType} added.`
        : "Your reward is ready.",
    amountLabel: quantity > 0 ? `+${quantity}` : null,
    kindLabel: grantType || "Reward",
    rarity,
    rewardType,
  };
}

function resolveRarity(value: unknown): RewardRarity {
  return value === "uncommon" || value === "rare" || value === "epic"
    ? value
    : "common";
}

function resolveRewardType(value: unknown): VariableRewardType {
  if (
    value === "opening_fragment" ||
    value === "opening_preview_card" ||
    value === "choice_token" ||
    value === "style_pack_progress"
  ) {
    return value;
  }
  return "unlock_points";
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
    <div className={styles.overlay} role="presentation">
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reward-presentation-title"
      >
        <div className={styles.artRail} aria-hidden="true">
          <RewardAnimation
            kind={
              active.presentation_kind === "unlock"
                ? "streakFlare"
                : "rewardPop"
            }
            ariaLabel="Reward reveal animation"
            className={styles.animation}
          />
          <RewardIcon
            reward={{
              rarity: copy.rarity,
              rewardType: copy.rewardType,
              displayName: copy.title,
              description: copy.body,
            }}
            alt=""
            variant="rewardIcon"
            className={styles.icon}
          />
        </div>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Blundr reward</p>
          <h2 id="reward-presentation-title" className={styles.title}>
            {copy.title}
          </h2>
          <p className={styles.body}>{copy.body}</p>
          <div className={styles.meta}>
            <RewardRarityBadge rarity={copy.rarity} />
            <span className={styles.pill}>{copy.kindLabel}</span>
            {copy.amountLabel ? (
              <span className={styles.pill}>{copy.amountLabel}</span>
            ) : null}
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.button} ${styles.secondaryButton}`}
              onClick={() => void finish("dismissed")}
            >
              Dismiss
            </button>
            <button
              type="button"
              className={`${styles.button} ${styles.primaryButton}`}
              onClick={() => void finish("acknowledged")}
            >
              Done
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
