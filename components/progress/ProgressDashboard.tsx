"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  BookOpen,
  ChevronRight,
  Flame,
  RefreshCw,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

import { authenticatedApiFetch } from "@/lib/blundr/api/authenticatedApiClient";
import { BLUNDR_DAILY_RING_REFRESH_EVENT } from "@/lib/blundr/daily-rings/dailyRingRefreshSignal";
import { getLocalDateKey } from "@/lib/blundr/daily-rings/dailyRingDate";
import { BLUNDR_LOCAL_DEMO_USER_ID } from "@/lib/blundr/persistence/persistenceKeys";
import type { BlundrProgressSummary } from "@/lib/blundr/progress/progressTypes";
import { NestedDailyRings } from "@/components/daily-rings/NestedDailyRings";
import {
  formatProgressPercentage,
  formatRepertoirePoints,
} from "@/lib/blundr/presentation/userFacingNumbers";
import styles from "./ProgressDashboard.module.css";

type ProgressDashboardProps = {
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

function buildPendingWeek(): BlundrProgressSummary["streak"]["week"] {
  return Array.from({ length: 7 }, (_, index) => ({
    localDate: `pending-${index}`,
    label: "—",
    hasTraining: false,
    allRingsClosed: false,
    reviewCount: 0,
  }));
}

function buildEmptySummary(): BlundrProgressSummary {
  const week = buildPendingWeek();

  return {
    userId: BLUNDR_LOCAL_DEMO_USER_ID,
    generatedAt: "Pending refresh",
    todayDateKey: "pending",
    today: {
      rings: [
        {
          ringId: "daily_tempo",
          label: "Tempo",
          progress: 0,
          goal: 0,
          percent: 0,
          closed: false,
        },
        {
          ringId: "daily_battery",
          label: "Battery",
          progress: 0,
          goal: 0,
          percent: 0,
          closed: false,
        },
        {
          ringId: "daily_blundr",
          label: "Blundr",
          progress: 0,
          goal: 0,
          percent: 0,
          closed: false,
        },
      ],
      allRingsClosed: false,
      nextBestAction: "Progress will load after mount.",
    },
    streak: {
      currentDays: 0,
      bestDays: 0,
      totalAllRingsClosedDays: 0,
      daysTrainedThisWeek: 0,
      week,
    },
    trainingVolume: {
      openingRunsToday: 0,
      openingRunsWeek: 0,
      batteryToday: 0,
      batteryWeek: 0,
      dailyBlundrToday: 0,
      dailyBlundrWeek: 0,
      reviewAttemptsToday: 0,
      reviewAttemptsWeek: 0,
      minigamesToday: 0,
      minigamesWeek: 0,
    },
    accuracy: {
      correct: 0,
      incorrect: 0,
      accuracyPct: null,
      enoughData: false,
      message: "Finish a few sessions and Tempo will fill in accuracy here.",
    },
    repertoire: {
      unlockedOpenings: 0,
      lockedOpenings: 0,
      availablePoints: 0,
      nextUnlockCost: 0,
      nextUnlockProgressPct: 0,
      mostTrainedOpeningId: null,
      mostTrainedOpeningName: null,
      recommendedOpeningId: null,
      recommendedOpeningName: null,
    },
    weakAreas: {
      items: [],
      message:
        "Tempo will show weak areas after there is enough training data.",
    },
    milestones: [
      {
        title: "Start here",
        message:
          "Finish an opening run and Daily Blundr session, then check back for milestone progress.",
      },
    ],
    recentActivity: [],
    nextActions: [
      {
        title: "Open Daily Blundr",
        href: "/daily",
        description: "Load today's review loop.",
      },
    ],
  };
}

function SectionHeader({
  kicker,
  title,
  copy,
  action,
}: {
  kicker: string;
  title?: string;
  copy?: string;
  action?: ReactNode;
}) {
  return (
    <div className={styles.sectionHeader}>
      <div className={styles.sectionHeaderText}>
        <p className={styles.sectionKicker}>{kicker}</p>
        {title ? <h2 className={styles.sectionTitle}>{title}</h2> : null}
        {copy ? <p className={styles.sectionCopy}>{copy}</p> : null}
      </div>
      {action ? <div className={styles.sectionAction}>{action}</div> : null}
    </div>
  );
}

function CompactMetricCard({
  label,
  value,
  detail,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone?: "neutral" | "positive" | "warning";
}) {
  return (
    <div
      className={classNames(
        styles.metricCard,
        tone === "positive"
          ? styles.metricPositive
          : tone === "warning"
            ? styles.metricWarning
            : undefined,
      )}
    >
      <div className={styles.metricTopRow}>
        <div className={styles.metricLabelBlock}>
          <div className={styles.metricLabel}>{label}</div>
          <div className={styles.metricValue}>{value}</div>
        </div>
        <div className={styles.metricIcon}>{icon}</div>
      </div>
      <p className={styles.metricDetail}>{detail}</p>
    </div>
  );
}

function SectionValue({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className={styles.sectionValue}>
      <div className={styles.sectionValueLabel}>{label}</div>
      <div className={styles.sectionValueNumber}>{value}</div>
      <p className={styles.sectionValueDetail}>{detail}</p>
    </div>
  );
}

export function ProgressDashboard({
  embedded = false,
  homeHref = "/",
  settingsHref = "/settings",
  className,
}: ProgressDashboardProps) {
  const [summary, setSummary] =
    useState<BlundrProgressSummary>(buildEmptySummary);
  const [refreshCount, setRefreshCount] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const visibleActions = useMemo(
    () => summary.nextActions.slice(0, 5),
    [summary.nextActions],
  );
  const todayRingItems = summary.today.rings;
  const todayClosedCount = todayRingItems.filter((ring) => ring.closed).length;
  const todayRingStatus = summary.today.allRingsClosed
    ? "Complete"
    : todayClosedCount > 0
      ? "In progress"
      : "Open";

  async function refreshSummary() {
    try {
      const response = await authenticatedApiFetch<{
        ok: true;
        data: BlundrProgressSummary;
      }>(
        `/api/blundr/progress/summary?localDate=${encodeURIComponent(getLocalDateKey())}`,
        { cache: "no-store" },
      );
      if (!isMountedRef.current) return;
      setSummary(response.data);
      setLoadError(null);
      setRefreshCount((count) => count + 1);
    } catch {
      if (!isMountedRef.current) return;
      setLoadError(
        "Couldn't load your saved progress. Try again.",
      );
    }
  }

  useEffect(() => {
    isMountedRef.current = true;
    void refreshSummary();
    if (typeof window === "undefined") return;

    const handleRefresh = () => {
      void refreshSummary();
    };
    window.addEventListener("storage", handleRefresh);
    window.addEventListener(BLUNDR_DAILY_RING_REFRESH_EVENT, handleRefresh);
    window.addEventListener("focus", handleRefresh);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener("storage", handleRefresh);
      window.removeEventListener(
        BLUNDR_DAILY_RING_REFRESH_EVENT,
        handleRefresh,
      );
      window.removeEventListener("focus", handleRefresh);
    };
  }, []);

  return (
    <section
      className={classNames(
        styles.dashboard,
        embedded ? styles.dashboardEmbedded : undefined,
        className,
      )}
    >
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.heroKicker}>PROGRESS</div>
          <h1 className={styles.heroTitle}>Momentum, without noise.</h1>
          <p className={styles.heroLead}>
            The exact Daily rings remain primary, while streak consistency,
            volume, recall quality, repertoire growth, weak areas and recent
            activity spread cleanly across the desktop canvas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            void refreshSummary();
          }}
          className={styles.refreshButton}
          aria-label="Refresh progress"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </header>

      <div className={styles.dashboardGrid}>
        <section className={classNames(styles.panel, styles.span7)}>
          <SectionHeader
            kicker="TODAY"
            title="Daily rings"
            action={
              <span className={classNames(styles.pill, styles.pillSoft)}>
                {todayRingStatus}
              </span>
            }
          />

          <div className={styles.dailyLayout}>
            <div className={styles.dailyStage}>
              <NestedDailyRings
                className={styles.rings}
                rings={todayRingItems}
                closedCount={todayClosedCount}
                totalCount={todayRingItems.length}
                allClosed={summary.today.allRingsClosed}
                streakDays={summary.streak.currentDays}
              />
            </div>

            <div className={styles.dailyDetails}>
              {todayRingItems.map((ring) => (
                <div key={ring.ringId} className={styles.ringRow}>
                  <div className={styles.ringRowText}>
                    <div className={styles.ringLabel}>{ring.label}</div>
                    <div className={styles.ringMeta}>
                      {ring.closed
                        ? "Complete"
                        : ring.percent > 0
                          ? "In progress"
                          : "Open"}
                    </div>
                  </div>
                  <div className={styles.ringRowValue}>
                    <div className={styles.ringCount}>
                      {ring.goal > 0 ? `${ring.progress}/${ring.goal}` : "Loading"}
                    </div>
                    <span
                      className={classNames(
                        styles.pill,
                        ring.closed
                          ? styles.pillPositive
                          : ring.percent > 0
                            ? styles.pillBlue
                            : styles.pillMuted,
                      )}
                    >
                      {ring.closed
                        ? "Complete"
                        : ring.percent > 0
                          ? "In progress"
                          : "Open"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={classNames(styles.panel, styles.span5)}>
          <SectionHeader
            kicker="STREAK & CONSISTENCY"
            title={`${summary.streak.currentDays} days`}
            copy={`Best: ${summary.streak.bestDays} · ${summary.streak.daysTrainedThisWeek} days trained this week`}
          />

          <div className={styles.streakLayout}>
            <div className={styles.streakPanel}>
              <div className={styles.weekGrid}>
                {summary.streak.week.map((day) => (
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
                  >
                    <div className={styles.weekDayLabel}>{day.label}</div>
                    <div className={styles.weekDayMeta}>
                      {day.allRingsClosed
                        ? "All rings"
                        : day.hasTraining
                          ? `${day.reviewCount} review${day.reviewCount === 1 ? "" : "s"}`
                          : "Rest"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={classNames(styles.panel, styles.span12)}>
          <SectionHeader kicker="Training volume" />
          <div className={styles.volumeGrid}>
            <CompactMetricCard
              label="Opening runs"
              value={`${summary.trainingVolume.openingRunsToday}`}
              detail={`${summary.trainingVolume.openingRunsWeek} this week`}
              icon={<BookOpen size={16} className={styles.metricIconGlyph} />}
              tone="positive"
            />
            <CompactMetricCard
              label="Battery sessions"
              value={`${summary.trainingVolume.batteryToday}`}
              detail={`${summary.trainingVolume.batteryWeek} this week`}
              icon={<Target size={16} className={styles.metricIconGlyph} />}
            />
            <CompactMetricCard
              label="Daily Blundr"
              value={`${summary.trainingVolume.dailyBlundrToday}`}
              detail={`${summary.trainingVolume.dailyBlundrWeek} this week`}
              icon={<Sparkles size={16} className={styles.metricIconGlyph} />}
              tone={
                summary.trainingVolume.dailyBlundrToday > 0
                  ? "positive"
                  : "neutral"
              }
            />
            <CompactMetricCard
              label="Review attempts"
              value={`${summary.trainingVolume.reviewAttemptsToday}`}
              detail={`${summary.trainingVolume.reviewAttemptsWeek} this week`}
              icon={<ChevronRight size={16} className={styles.metricIconGlyph} />}
            />
            <CompactMetricCard
              label="Minigames"
              value={`${summary.trainingVolume.minigamesToday}`}
              detail={`${summary.trainingVolume.minigamesWeek} this week`}
              icon={<Trophy size={16} className={styles.metricIconGlyph} />}
            />
          </div>
        </section>

        <section className={classNames(styles.panel, styles.span4)}>
          <SectionHeader kicker="Accuracy / recall" />
          <SectionValue
            label="Quality"
            value={
              summary.accuracy.accuracyPct !== null
                ? `${summary.accuracy.accuracyPct}%`
                : "—"
            }
            detail={summary.accuracy.message}
          />
          <div className={styles.inlineCounts}>
            <div className={styles.inlineCountCard}>
              <div className={styles.inlineCountLabel}>Correct</div>
              <div className={styles.inlineCountValue}>
                {summary.accuracy.correct}
              </div>
            </div>
            <div className={styles.inlineCountCard}>
              <div className={styles.inlineCountLabel}>Incorrect</div>
              <div className={styles.inlineCountValue}>
                {summary.accuracy.incorrect}
              </div>
            </div>
          </div>
        </section>

        <section className={classNames(styles.panel, styles.span4)}>
          <SectionHeader kicker="Repertoire" />
          <SectionValue
            label="Unlocked openings"
            value={`${summary.repertoire.unlockedOpenings}`}
            detail={`${summary.repertoire.lockedOpenings} still locked`}
          />
          <div className={styles.stackList}>
            <div className={styles.keyValueRow}>
              <span className={styles.keyValueLabel}>Repertoire points</span>
              <span className={styles.keyValueValue}>
                {formatRepertoirePoints(summary.repertoire.availablePoints)}
              </span>
            </div>
            <div className={styles.keyValueRow}>
              <span className={styles.keyValueLabel}>Next unlock</span>
              <span className={styles.keyValueValue}>
                {formatProgressPercentage(
                  summary.repertoire.nextUnlockProgressPct,
                )}
              </span>
            </div>
            <div className={styles.keyValueRow}>
              <span className={styles.keyValueLabel}>Most trained</span>
              <span className={styles.keyValueValue}>
                {summary.repertoire.mostTrainedOpeningName ?? "None yet"}
              </span>
            </div>
          </div>
        </section>

        <section className={classNames(styles.panel, styles.span4)}>
          <SectionHeader kicker="Recommended" />
          <div className={styles.recommendationCard}>
            <div className={styles.recommendationName}>
              {summary.repertoire.recommendedOpeningName ?? "None yet"}
            </div>
            <p className={styles.recommendationCopy}>
              {summary.repertoire.recommendedOpeningId
                ? `Opening ID: ${summary.repertoire.recommendedOpeningId}`
                : "Tempo will surface a target when it has enough data."}
            </p>
          </div>
          <div className={styles.keyValueRow}>
            <span className={styles.keyValueLabel}>Most trained ID</span>
            <span className={styles.keyValueValue}>
              {summary.repertoire.mostTrainedOpeningId ?? "None yet"}
            </span>
          </div>
        </section>

        <section className={classNames(styles.panel, styles.span4)}>
          <SectionHeader kicker="Weak areas" />
          <div className={styles.listStack}>
            {summary.weakAreas.items.length > 0 &&
            summary.weakAreas.items[0].openingId !== "none" ? (
              summary.weakAreas.items.map((item) => (
                <div key={item.openingId} className={styles.listRow}>
                  <div>
                    <div className={styles.listRowTitle}>{item.openingName}</div>
                    <div className={styles.listRowMeta}>
                      {item.misses} missed idea{item.misses === 1 ? "" : "s"}
                    </div>
                  </div>
                  <span className={styles.pill}>Focus</span>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>{summary.weakAreas.message}</div>
            )}
          </div>
        </section>

        <section className={classNames(styles.panel, styles.span4)}>
          <SectionHeader kicker="Milestones" />
          <div className={styles.listStack}>
            {summary.milestones.map((milestone) => (
              <div key={milestone.title} className={styles.milestoneCard}>
                <div className={styles.listRowTitle}>{milestone.title}</div>
                <p className={styles.listRowMeta}>{milestone.message}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={classNames(styles.panel, styles.span4)}>
          <SectionHeader kicker="Next action" />
          <div className={styles.actionList}>
            {visibleActions.map((action) => (
              <Link key={action.title} href={action.href} className={styles.actionCard}>
                <div className={styles.actionCardTop}>
                  <div>
                    <div className={styles.actionTitle}>{action.title}</div>
                    <p className={styles.actionCopy}>{action.description}</p>
                  </div>
                  <ChevronRight
                    size={16}
                    className={styles.actionChevron}
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className={classNames(styles.panel, styles.span12)}>
          <SectionHeader kicker="Recent activity" />
          <div className={styles.recentList}>
            {summary.recentActivity.length > 0 ? (
              summary.recentActivity.map((item) => (
                <div key={item.key} className={styles.recentCard}>
                  <div className={styles.recentCardTop}>
                    <div>
                      <div className={styles.recentTitle}>{item.title}</div>
                      <p className={styles.recentCopy}>{item.message}</p>
                    </div>
                    <span className={styles.pill}>
                      {item.tone ?? "neutral"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                Tempo has not recorded a recent activity yet. Finish one opening
                run or Daily Blundr session and this area will fill in.
              </div>
            )}
          </div>
        </section>
      </div>

      {loadError ? (
        <div role="status" className={styles.errorBanner}>
          {loadError}
        </div>
      ) : null}

      <div className={styles.sessionFooter}>
        <span>Last refreshed: {summary.generatedAt}</span>
        <span>Refreshes this session: {refreshCount}</span>
      </div>
    </section>
  );
}
