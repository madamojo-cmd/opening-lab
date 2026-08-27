"use client";

import { useEffect, useRef, useState } from "react";

import { authenticatedApiFetch } from "@/lib/blundr/api/authenticatedApiClient";
import { BLUNDR_DAILY_RING_REFRESH_EVENT } from "@/lib/blundr/daily-rings/dailyRingRefreshSignal";
import { getLocalDateKey } from "@/lib/blundr/daily-rings/dailyRingDate";
import type { BlundrProgressSummary } from "@/lib/blundr/progress/progressTypes";
import styles from "./ProgressDashboard.module.css";

type StreakConsistencyCardProps = {
  streak: BlundrProgressSummary["streak"];
  className?: string;
};

function classNames(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

function statusLabel(day: BlundrProgressSummary["streak"]["week"][number]): string {
  if (day.allRingsClosed) return "All rings";
  if (!day.hasTraining) return "Rest";
  if (day.reviewCount > 0)
    return `${day.reviewCount} review${day.reviewCount === 1 ? "" : "s"}`;
  return "Trained";
}

export function StreakConsistencyCard({
  streak,
  className,
}: StreakConsistencyCardProps) {
  const days = streak.recentDays.length === 28 ? streak.recentDays : streak.week;

  return (
    <section className={classNames(styles.panel, className)}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionHeaderText}>
          <p className={styles.sectionKicker}>STREAK & CONSISTENCY</p>
          <h2 className={styles.sectionTitle}>{streak.currentDays} days</h2>
          <p className={styles.sectionCopy}>
            Best: {streak.bestDays} · {streak.daysTrainedThisWeek} days trained
            this week
          </p>
        </div>
      </div>

      <div className={styles.streakLayout}>
        <div className={styles.streakPanel}>
          <div className={styles.weekGrid}>
            {days.map((day) => (
              <div
                key={day.localDate}
                className={classNames(
                  styles.weekDay,
                  day.allRingsClosed
                    ? styles.weekDayClosed
                    : day.hasTraining
                      ? styles.weekDayTraining
                      : styles.weekDayRest,
                )}
                title={`${day.localDate}: ${statusLabel(day)}`}
              >
                <div className={styles.weekDayLabel}>{day.label}</div>
                <div className={styles.weekDayMeta}>{statusLabel(day)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function buildPendingStreak(): BlundrProgressSummary["streak"] {
  const recentDays = Array.from({ length: 28 }, (_, index) => ({
    localDate: `pending-${index}`,
    label: "--",
    hasTraining: false,
    allRingsClosed: false,
    reviewCount: 0,
  }));
  return {
    currentDays: 0,
    bestDays: 0,
    totalAllRingsClosedDays: 0,
    daysTrainedThisWeek: 0,
    week: recentDays.slice(-7),
    recentDays,
  };
}

export function ReviewStreakConsistencyCard({
  className,
}: {
  className?: string;
}) {
  const [streak, setStreak] =
    useState<BlundrProgressSummary["streak"]>(buildPendingStreak);
  const mountedRef = useRef(true);

  async function refresh() {
    try {
      const response = await authenticatedApiFetch<{
        ok: true;
        data: BlundrProgressSummary;
      }>(
        `/api/blundr/progress/summary?localDate=${encodeURIComponent(getLocalDateKey())}`,
        { cache: "no-store" },
      );
      if (mountedRef.current) setStreak(response.data.streak);
    } catch {
      if (mountedRef.current) setStreak(buildPendingStreak());
    }
  }

  useEffect(() => {
    mountedRef.current = true;
    void refresh();
    if (typeof window === "undefined") return;
    const handleRefresh = () => {
      void refresh();
    };
    window.addEventListener("storage", handleRefresh);
    window.addEventListener(BLUNDR_DAILY_RING_REFRESH_EVENT, handleRefresh);
    window.addEventListener("focus", handleRefresh);
    return () => {
      mountedRef.current = false;
      window.removeEventListener("storage", handleRefresh);
      window.removeEventListener(
        BLUNDR_DAILY_RING_REFRESH_EVENT,
        handleRefresh,
      );
      window.removeEventListener("focus", handleRefresh);
    };
  }, []);

  return <StreakConsistencyCard streak={streak} className={className} />;
}
