"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3, History, Sparkles } from "lucide-react";
import { getLocalAccountCurrentUserId } from "@/lib/blundr/accounts/localAccountStorage";
import { loadRewardHistorySnapshot } from "@/lib/blundr/rewards/rewardHistoryService";
import { getRewardTriggerLabel } from "@/lib/blundr/rewards/rewardRollService";
import { BLUNDR_REWARD_ASSETS } from "@/lib/blundr/assets/blundrAssetManifest";
import { BlundrAssetImage } from "@/components/assets/BlundrAssetImage";
import { RewardIcon } from "./RewardIcon";
import { RewardRarityBadge } from "./RewardRarityBadge";
import styles from "../repertoire/RepertoireRewardHistory.module.css";

type RewardHistoryListProps = {
  className?: string;
  limit?: number;
  title?: string;
};

function classNames(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

function formatTimestamp(value: string): string {
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return value;
  return new Date(time).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function RewardHistoryList({
  className,
  limit = 6,
  title = "Reward history",
}: RewardHistoryListProps) {
  const [snapshot, setSnapshot] = useState(() =>
    loadRewardHistorySnapshot(getLocalAccountCurrentUserId()),
  );

  useEffect(() => {
    setSnapshot(loadRewardHistorySnapshot(getLocalAccountCurrentUserId()));
  }, [limit]);

  const rows = useMemo(() => {
    return snapshot.rewardRolls
      .filter((roll) => Boolean(roll.didReward && roll.reward))
      .slice()
      .sort((a, b) => Date.parse(b.rolledAt) - Date.parse(a.rolledAt))
      .slice(0, limit);
  }, [limit, snapshot.rewardRolls]);

  return (
    <section className={classNames(styles.history, className)}>
      <div className={styles.header}>
        <div>
          <div className={styles.eyebrow}>
            <History size={13} />
            {title}
          </div>
          <h3 className={styles.title}>Recent Tempo Cache results</h3>
          <p className={styles.copy}>
            Rewards stay rare and deterministic. Training still drives the main
            progression loop.
          </p>
        </div>
        <div className={styles.countPill}>{rows.length} shown</div>
      </div>

      {rows.length > 0 ? (
        <div className={styles.rows}>
          {rows.map((roll) => {
            const reward = roll.reward!;
            const applied = snapshot.history.appliedRewardIds.includes(
              reward.id,
            );
            return (
              <div key={roll.id} className={styles.row}>
                <RewardIcon reward={reward} />
                <div className={styles.rowContent}>
                  <div className={styles.rowTop}>
                    <div className={styles.rewardName}>
                      {reward.displayName}
                    </div>
                    <RewardRarityBadge rarity={reward.rarity} />
                    <span className={styles.microPill}>
                      {applied ? "Applied" : "Granted"}
                    </span>
                  </div>
                  <p className={styles.description}>{reward.description}</p>
                  <div className={styles.metaRow}>
                    <span className={styles.microPill}>
                      <Sparkles size={12} />
                      {getRewardTriggerLabel(roll.trigger)}
                    </span>
                    {reward.amount ? (
                      <span className={styles.microPill}>+{reward.amount}</span>
                    ) : null}
                    <span className={styles.microPill}>
                      <Clock3 size={12} />
                      {formatTimestamp(roll.rolledAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.empty}>
          <BlundrAssetImage
            asset={BLUNDR_REWARD_ASSETS.tempoCacheClosed}
            alt="No reward history yet"
            variant="emptyState"
            className="mx-auto"
          />
          <div className={styles.emptyTitle}>Tempo Cache history is empty</div>
          <p className={styles.emptyCopy}>
            When a rare bonus lands, it will appear here with the trigger that
            opened it.
          </p>
        </div>
      )}

      <div className={styles.pity}>
        <div className={styles.pityTitle}>Pity status</div>
        <div className={styles.pityRows}>
          <span className={styles.microPill}>
            {snapshot.history.allRingsDaysSinceRandomReward} all-ring days since
            random bonus
          </span>
          {snapshot.history.lastRandomRewardLocalDate ? (
            <span className={styles.microPill}>
              Last random bonus {snapshot.history.lastRandomRewardLocalDate}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
