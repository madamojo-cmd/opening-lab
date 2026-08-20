import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BlundrBottomNav } from "@/components/navigation/BlundrBottomNav";
import { ProfileSettingsIcon } from "@/components/navigation/ProfileSettingsIcon";
import { HomeCurrentOpeningsCard } from "@/components/home/HomeCurrentOpeningsCard";
import { BlundrStateCard } from "@/components/blundr/ui";
import { authenticatedApiFetch } from "@/lib/blundr/api/authenticatedApiClient";
import { getBlundrStorageModeSetting } from "@/lib/blundr/backend/backendEnv";
import { getLocalAccountCurrentUserId } from "@/lib/blundr/accounts/localAccountStorage";
import { getLocalDateKey } from "@/lib/blundr/daily-rings/dailyRingDate";
import { loadDailyRingSnapshot } from "@/lib/blundr/daily-rings/dailyRingService";
import { BLUNDR_DAILY_RING_REFRESH_EVENT } from "@/lib/blundr/daily-rings/dailyRingRefreshSignal";
import type { DailyRingSnapshot } from "@/lib/blundr/daily-rings/dailyRingTypes";
import { BLUNDR_LOCAL_DEMO_USER_ID } from "@/lib/blundr/persistence/persistenceKeys";
import type { BlundrProgressSummary } from "@/lib/blundr/progress/progressTypes";
import { loadRepertoireProgress } from "@/lib/blundr/repertoire/repertoireProgressService";
import type { RepertoireProgress } from "@/lib/blundr/repertoire/repertoireTypes";
import { clampProgressPercentage, formatProgressPercentage, formatRepertoirePoints } from "@/lib/blundr/presentation/userFacingNumbers";
import { NestedDailyRings } from "@/components/daily-rings/NestedDailyRings";
import svgPaths from "./svg-lrkovulksy";
// ─── Design tokens ────────────────────────────────────────────────────────────

const G = {
  bg: "#f4f1ec",
  card: "#ffffff",
  green: "#2a5e3f",
  greenLight: "#3dba6e",
  greenBg: "#e6f0eb",
  greenTrack: "#d3edd9",
  greenMid: "#4a8c64",
  gold: "#c79a2a",
  goldBg: "#fdf3d8",
  goldBorder: "rgba(199,154,42,0.25)",
  blue: "#4a8fe8",
  blueBg: "#eaf1fc",
  textPrimary: "#1c1c1a",
  textMuted: "#78756e",
  textLight: "#a8a49f",
  border: "rgba(28,28,26,0.08)",
  borderMed: "rgba(28,28,26,0.12)",
  shadow: "0px 1px 3px rgba(0,0,0,0.08), 0px 1px 2px rgba(0,0,0,0.06)",
  shadowMd: "0px 4px 12px rgba(0,0,0,0.08), 0px 1px 3px rgba(0,0,0,0.06)",
  shadowHero: "0px 8px 24px rgba(42,94,63,0.18), 0px 2px 6px rgba(42,94,63,0.10)",
  shadowCard: "0px 1px 1.5px rgba(0,0,0,0.1), 0px 1px 1px rgba(0,0,0,0.1)",
  inter: "Inter, sans-serif",
  r24: 24,
  r16: 16,
  r12: 12,
};

type Screen = "home" | "train";
type HomeDailyRingItem = {
  label: "Tempo" | "Battery" | "Blundr";
  progress: number;
  goal: number;
  percent: number;
  closed: boolean;
};

function isNamedLocalDemo(userId: string): boolean {
  return process.env.NODE_ENV !== "production" && getBlundrStorageModeSetting() === "local_demo" && userId === BLUNDR_LOCAL_DEMO_USER_ID;
}

function toAuthoritativeDailyRingSnapshot(summary: BlundrProgressSummary): DailyRingSnapshot {
  const ring = (ringId: "daily_tempo" | "daily_battery" | "daily_blundr") => summary.today.rings.find((item) => item.ringId === ringId) ?? { ringId, label: ringId, progress: 0, goal: 1, percent: 0, closed: false };
  const tempo = ring("daily_tempo");
  const battery = ring("daily_battery");
  const blundr = ring("daily_blundr");
  return {
    userId: summary.userId, localDate: summary.todayDateKey,
    dayRecord: { userId: summary.userId, localDate: summary.todayDateKey, dailyTempo: { ringId: "daily_tempo", progress: tempo.progress, goal: tempo.goal, closed: tempo.closed }, dailyBattery: { ringId: "daily_battery", progress: battery.progress, goal: battery.goal, closed: battery.closed }, dailyBlundr: { ringId: "daily_blundr", progress: blundr.progress, goal: blundr.goal, closed: blundr.closed }, allRingsClosed: summary.today.allRingsClosed, xpEarnedToday: 0, repertoirePointsEarnedToday: 0, activityEventIds: [], createdAt: summary.generatedAt, updatedAt: summary.generatedAt },
    streakRecord: { userId: summary.userId, currentStreakDays: summary.streak.currentDays, longestStreakDays: summary.streak.bestDays, totalAllRingsClosedDays: summary.streak.totalAllRingsClosedDays, updatedAt: summary.generatedAt },
    tempo: { current: tempo.progress, target: tempo.goal, percent: tempo.percent, complete: tempo.closed }, battery: { current: battery.progress, target: battery.goal, percent: battery.percent, complete: battery.closed }, blundr: { current: blundr.progress, target: blundr.goal, percent: blundr.percent, complete: blundr.closed }, allComplete: summary.today.allRingsClosed, updatedAt: summary.generatedAt,
  };
}

// ─── Tempo mascot ─────────────────────────────────────────────────────────────

function TempoAvatar({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="19" fill={G.greenBg} stroke={G.greenTrack} strokeWidth="1.5" />
      <ellipse cx="20" cy="27" rx="7" ry="3.5" fill={G.green} opacity="0.18" />
      <rect x="16.5" y="21" width="7" height="5.5" rx="2" fill={G.green} opacity="0.55" />
      <circle cx="20" cy="17.5" r="4.5" fill={G.green} opacity="0.75" />
      <circle cx="18.2" cy="17" r="1.1" fill="white" />
      <circle cx="21.8" cy="17" r="1.1" fill="white" />
      <circle cx="18.5" cy="17" r="0.55" fill={G.green} />
      <circle cx="22.1" cy="17" r="0.55" fill={G.green} />
    </svg>
  );
}

// ─── Shared bottom nav ────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    id: "home" as Screen,
    label: "Home",
    paths: [svgPaths.p275d2400, svgPaths.p21a7e80],
  },
  {
    id: "train" as Screen,
    label: "Train",
    paths: ["M10 5.83333V17.5", svgPaths.p25713000],
  },
  {
    id: "home" as Screen,
    label: "Review",
    paths: [svgPaths.p2110f1c0, "M2.5 2.5V6.66667H6.66667"],
  },
  {
    id: "home" as Screen,
    label: "Progress",
    paths: [svgPaths.p3c797180, svgPaths.p3ac0b600],
  },
  {
    id: "home" as Screen,
    label: "Repertoire",
    paths: [
      "M13.3333 5L16.6667 16.6667",
      "M10 5V16.6667",
      "M6.66667 6.66667V16.6667",
      "M3.33333 3.33333V16.6667",
    ],
  },
];

function BottomNav({
  active,
  onNav,
}: {
  active: Screen;
  onNav: (s: Screen) => void;
}) {
  return <BlundrBottomNav activeTab={active === "train" ? "train" : "home"} />;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOME SCREEN (faithful Figma reproduction)
// ═══════════════════════════════════════════════════════════════════════════════

function buildFallbackHomeDailyRingItems(): HomeDailyRingItem[] {
  return [
    {
      label: "Tempo",
      progress: 0,
      goal: 10,
      percent: 0,
      closed: false,
    },
    {
      label: "Battery",
      progress: 0,
      goal: 3,
      percent: 0,
      closed: false,
    },
    {
      label: "Blundr",
      progress: 0,
      goal: 1,
      percent: 0,
      closed: false,
    },
  ];
}

function buildHomeDailyRingItems(snapshot: DailyRingSnapshot | null): HomeDailyRingItem[] {
  if (!snapshot) return buildFallbackHomeDailyRingItems();
  return [
    {
      label: "Tempo",
      progress: snapshot.tempo.current,
      goal: snapshot.tempo.target,
      percent: snapshot.tempo.percent,
      closed: snapshot.tempo.complete,
    },
    {
      label: "Battery",
      progress: snapshot.battery.current,
      goal: snapshot.battery.target,
      percent: snapshot.battery.percent,
      closed: snapshot.battery.complete,
    },
    {
      label: "Blundr",
      progress: snapshot.blundr.current,
      goal: snapshot.blundr.target,
      percent: snapshot.blundr.percent,
      closed: snapshot.blundr.complete,
    },
  ];
}

function HomeTrainingCard({
  rings,
  streakDays,
}: {
  rings: HomeDailyRingItem[];
  streakDays: number | null;
}) {
  const closedCount = rings.filter((ring) => ring.closed).length;
  const totalCount = rings.length;
  const remainingCount = Math.max(0, totalCount - closedCount);
  const nextRing = rings.find((ring) => !ring.closed);
  return (
    <div
      className="w-full overflow-hidden rounded-[22px] border border-stone-200/80 bg-white/90 shadow-[0_16px_36px_rgba(16,20,17,0.07)]"
    >
      <div className="p-[25px] max-[820px]:p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-green-800">
              Today&apos;s training
            </p>
            <h2 className="mt-1 text-[25px] font-black leading-tight tracking-[-0.045em] text-stone-950">
              Close your daily rings.
            </h2>
            <p className="mt-2 max-w-xl text-[11px] leading-[1.55] text-stone-600">
              The canonical three-ring widget stays intact while today&apos;s
              real Tempo, Battery and Blundr progress stays visible.
            </p>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-2 text-[11px] font-black text-amber-800 ring-1 ring-amber-200">
            {streakDays === null ? "Loading streak" : `${streakDays}-day streak`}
          </span>
        </div>

        <div className="mt-6 grid items-center gap-5 md:grid-cols-[280px_minmax(0,1fr)]">
          <div className="flex justify-center">
            <NestedDailyRings
              className="w-full max-w-[250px] [&>div:nth-of-type(2)]:hidden"
              rings={rings}
              closedCount={closedCount}
              totalCount={totalCount}
              allClosed={closedCount >= totalCount}
              streakDays={streakDays ?? 0}
            />
          </div>
          <div className="grid gap-2">
            {rings.map((ring) => (
              <div
                key={ring.label}
                className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-[14px] border border-stone-200 bg-[#f8f8f5] px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-black text-stone-950">
                    {ring.label}
                  </div>
                  <div className="text-[11px] text-stone-600">
                    {ring.closed
                      ? "Complete"
                      : ring.percent > 0
                        ? "In progress"
                        : "Open"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-stone-950">
                    {ring.progress}/{ring.goal}
                  </div>
                  <div
                    className={`mt-1 rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
                      ring.closed
                        ? "bg-green-50 text-green-800"
                        : ring.percent > 0
                          ? "bg-blue-50 text-blue-700"
                          : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {ring.closed
                      ? "Complete"
                      : ring.percent > 0
                        ? "In progress"
                        : "Open"}
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-2 border-t border-stone-200 pt-3 text-[11px] font-black text-stone-600">
              {closedCount >= totalCount
                ? "All rings closed for today."
                : `Close ${Math.max(0, totalCount - closedCount)} more ring${Math.max(0, totalCount - closedCount) === 1 ? "" : "s"} to keep the daily chain moving.`}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[16px] border border-green-900/10 bg-[#eef7f1] p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-green-800">
                Next best action
              </span>
              <p className="mt-2 text-sm font-black text-stone-950">
                {remainingCount === 0
                  ? "All daily rings are closed."
                  : `${nextRing?.label ?? "Daily training"} is the next ring to close.`}
              </p>
              <p className="mt-1 text-[11px] leading-[1.5] text-stone-600">
                {remainingCount === 0
                  ? "Keep the loop visible and return when the next day opens."
                  : "Continue the production flow that owns this ring’s progress."}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                href={nextRing?.label === "Blundr" ? "/daily" : "/train"}
                className="inline-flex min-h-11 items-center rounded-[13px] bg-green-800 px-4 text-sm font-black text-white shadow-sm"
              >
                {nextRing?.label === "Blundr" ? "Open Daily Blundr" : "Continue training"}
              </Link>
              <Link
                href="/daily"
                className="inline-flex min-h-11 items-center rounded-[13px] border border-stone-200 bg-white px-4 text-sm font-black text-stone-800 shadow-sm"
              >
                Daily Blundr
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeTempoBanner({ remainingRingCount }: { remainingRingCount: number }) {
  const message = remainingRingCount === 0
    ? "All rings closed. Your streak is closed for today."
    : `Close ${remainingRingCount} more ring${remainingRingCount === 1 ? "" : "s"} to keep your streak alive.`;
  return (
    <div className="rounded-[22px] border border-stone-200/80 bg-white/90 p-5 shadow-[0_12px_30px_rgba(16,20,17,0.06)]">
      <div className="flex items-center justify-between gap-5">
        <div className="min-w-0">
          <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-green-800">
            Tempo
          </span>
          <h2 className="mt-3 text-xl font-black tracking-[-0.04em] text-stone-950">
            Small cues. Clear next moves.
          </h2>
          <p className="mt-2 text-[12px] leading-[1.55] text-stone-600">
            {message}
          </p>
        </div>
        <TempoAvatar size={76} />
      </div>
    </div>
  );
}

function HomeStatsRow({
  streakDays,
  longestStreakDays,
  allRingDays,
  availablePoints,
  nextUnlockProgressPct,
  closedRingCount,
}: {
  streakDays: number | null;
  longestStreakDays: number | null;
  allRingDays: number | null;
  availablePoints: number;
  nextUnlockProgressPct: number;
  closedRingCount: number;
}) {
  const streakValue = streakDays === null ? "Loading" : String(streakDays);
  const bestValue = longestStreakDays === null ? "Loading" : String(longestStreakDays);
  const allRingValue = allRingDays === null ? "Loading" : String(allRingDays);
  const closedRingsValue = `${closedRingCount}/3 rings closed`;
  const clampedUnlockProgress = clampProgressPercentage(nextUnlockProgressPct);
  const availablePointsLabel = formatRepertoirePoints(availablePoints);
  const unlockProgressLabel = formatProgressPercentage(clampedUnlockProgress);

  const stats = [
    ["Current streak", streakValue, "days in a row"],
    ["Best streak", bestValue, "personal best"],
    ["Repertoire points", availablePointsLabel, `${unlockProgressLabel} to next unlock`],
    ["Today", closedRingsValue, `${allRingValue} all-ring days`],
  ] as const;

  return (
    <div className="grid w-full gap-3 md:grid-cols-4 max-[820px]:grid-cols-2">
      {stats.map(([label, value, detail]) => (
        <div
          key={label}
          className="rounded-[22px] border border-stone-200/80 bg-white/90 p-4 shadow-[0_12px_30px_rgba(16,20,17,0.06)]"
        >
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">
            {label}
          </div>
          <div className="mt-3 text-[28px] font-black leading-none tracking-[-0.04em] text-stone-950">
            {value}
          </div>
          <div className="mt-2 text-[11px] leading-[1.45] text-stone-600">
            {detail}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Figma5303HomeScreen({
  onNav,
  repertoireProgress,
  onPlayOpening,
}: {
  onNav: (s: Screen) => void;
  repertoireProgress?: RepertoireProgress | null;
  onPlayOpening?: (openingId: string) => void;
}) {
  const router = useRouter();
  const [dailyRingSnapshot, setDailyRingSnapshot] = useState<DailyRingSnapshot | null>(null);
  const [loadedProgress, setLoadedProgress] = useState<RepertoireProgress | null>(repertoireProgress ?? null);

  useEffect(() => {
    if (repertoireProgress) {
      setLoadedProgress(repertoireProgress);
      return;
    }
    setLoadedProgress(loadRepertoireProgress({ userId: getLocalAccountCurrentUserId() }));
  }, [repertoireProgress]);

  useEffect(() => {
    let cancelled = false;

    async function refreshDailySnapshot() {
      const userId = getLocalAccountCurrentUserId();
      if (isNamedLocalDemo(userId)) {
        if (!cancelled) setDailyRingSnapshot(loadDailyRingSnapshot({ userId }));
        return;
      }
      try {
        const response = await authenticatedApiFetch<{ ok: true; data: BlundrProgressSummary }>(`/api/blundr/progress/summary?localDate=${encodeURIComponent(getLocalDateKey())}`, { cache: "no-store" });
        if (!cancelled) setDailyRingSnapshot(toAuthoritativeDailyRingSnapshot(response.data));
      } catch {
        if (!cancelled) setDailyRingSnapshot(null);
      }
    }

    void refreshDailySnapshot();
    if (typeof window === "undefined") return;

    const handleRefresh = () => {
      void refreshDailySnapshot();
    };
    const handleFocus = () => {
      void refreshDailySnapshot();
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void refreshDailySnapshot();
      }
    };
    window.addEventListener("storage", handleRefresh);
    window.addEventListener(BLUNDR_DAILY_RING_REFRESH_EVENT, handleRefresh);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", handleRefresh);
      window.removeEventListener(BLUNDR_DAILY_RING_REFRESH_EVENT, handleRefresh);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const currentProgress = loadedProgress ?? repertoireProgress ?? null;
  const handlePlayOpening = onPlayOpening ?? ((openingId: string) => router.push(`/train?openingId=${encodeURIComponent(openingId)}`));
  const dailyRingItems = buildHomeDailyRingItems(dailyRingSnapshot);
  const remainingRingCount = Math.max(0, dailyRingItems.length - dailyRingItems.filter((ring) => ring.closed).length);
  const currentStreakDays = dailyRingSnapshot?.streakRecord.currentStreakDays ?? null;
  const longestStreakDays = dailyRingSnapshot?.streakRecord.longestStreakDays ?? null;
  const totalAllRingDays = dailyRingSnapshot?.streakRecord.totalAllRingsClosedDays ?? null;
  const closedRingCount = dailyRingItems.filter((ring) => ring.closed).length;
  const streakLabel = currentStreakDays === null ? "Loading streak" : `${currentStreakDays}-day streak`;

  return (
    <section className="w-full text-stone-950" style={{ fontFamily: G.inter }}>
      <header className="mb-[25px] flex items-end justify-between gap-6 max-[820px]:items-start">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-green-800">
            Home
          </p>
          <h1 className="mt-3 text-[34px] font-black leading-[1.05] tracking-[-0.05em] text-stone-950 max-[820px]:text-[27px]">
            Your training, distilled.
          </h1>
          <p className="mt-3 max-w-[720px] text-[13px] leading-[1.55] text-stone-600 max-[820px]:text-[11px]">
            A calm daily workspace that keeps the real Tempo, Battery and
            Blundr rings at the center without the old phone-inside-a-page
            frame.
          </p>
        </div>
        <div className="flex gap-2 max-[820px]:hidden">
          <Link
            href="/train"
            className="inline-flex min-h-11 items-center rounded-[13px] bg-green-800 px-4 text-sm font-black text-white shadow-sm"
          >
            Start training
          </Link>
        </div>
        <div className="min-[821px]:hidden">
          <ProfileSettingsIcon />
        </div>
      </header>

      <div className="grid gap-[18px] lg:grid-cols-[minmax(0,1.25fr)_minmax(310px,0.75fr)]">
        <HomeTrainingCard rings={dailyRingItems} streakDays={currentStreakDays} />
        <aside className="grid gap-3">
          <Link
            href="/daily"
            className="flex items-center justify-between rounded-[22px] border border-stone-200/80 bg-white/90 px-5 py-4 text-stone-950 shadow-[0_12px_30px_rgba(16,20,17,0.06)]"
          >
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-green-800">
                Daily Blundr
              </p>
              <p className="mt-2 text-base font-black tracking-[-0.02em]">
                Complete Daily Blundr
              </p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-green-50 text-green-800">
              →
            </span>
          </Link>
          <HomeTempoBanner remainingRingCount={remainingRingCount} />
          {currentProgress ? (
            <HomeCurrentOpeningsCard
              progress={currentProgress}
              onPlayOpening={handlePlayOpening}
            />
          ) : (
            <BlundrStateCard
              kind="loading"
              eyebrow="Openings"
              title="Loading current openings."
              copy="Blundr is checking which openings are ready to train."
            />
          )}
        </aside>
      </div>

      <div className="mt-3">
        <HomeStatsRow
          streakDays={currentStreakDays}
          longestStreakDays={longestStreakDays}
          allRingDays={totalAllRingDays}
          availablePoints={currentProgress?.availablePoints ?? 0}
          nextUnlockProgressPct={currentProgress?.nextUnlockProgressPct ?? 0}
          closedRingCount={closedRingCount}
        />
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DAILY TRAINING SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

interface StatItem { label: string; value: string | number; accent?: string; }

function SectionHeader({ title, subtitle, action, onAction }: { title: string; subtitle?: string; action?: string; onAction?: () => void; }) {
  return (
    <div className="flex items-start justify-between w-full">
      <div className="flex flex-col gap-0.5">
        <h2 style={{ fontFamily: G.inter, fontWeight: 700, fontSize: 16, lineHeight: "22px", color: G.textPrimary }}>{title}</h2>
        {subtitle && <p style={{ fontFamily: G.inter, fontWeight: 400, fontSize: 12, lineHeight: "17px", color: G.textMuted }}>{subtitle}</p>}
      </div>
      {action && (
        <button onClick={onAction} style={{ fontFamily: G.inter, fontWeight: 600, fontSize: 12, color: G.green, marginTop: 2, whiteSpace: "nowrap" }}>
          {action}
        </button>
      )}
    </div>
  );
}

function StatsStrip({ stats }: { stats: StatItem[] }) {
  return (
    <div className="flex w-full rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.55)", border: `1px solid ${G.border}` }}>
      {stats.map((stat, i) => (
        <div key={stat.label} className="flex-1 flex flex-col items-center py-3" style={{ borderRight: i < stats.length - 1 ? `1px solid ${G.border}` : "none" }}>
          <span style={{ fontFamily: G.inter, fontWeight: 800, fontSize: 22, lineHeight: "26px", color: stat.accent ?? G.textPrimary }}>{stat.value}</span>
          <span style={{ fontFamily: G.inter, fontWeight: 500, fontSize: 10, lineHeight: "14px", color: G.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 1 }}>{stat.label}</span>
        </div>
      ))}
    </div>
  );
}

function DailyBlundrHeroCard({ onStart }: { onStart?: () => void }) {
  const stats: StatItem[] = [
    { label: "Due today", value: 3, accent: G.green },
    { label: "Completed", value: 0 },
    { label: "Streak", value: "7d", accent: G.gold },
  ];
  return (
    <div className="w-full flex flex-col" style={{ background: G.card, borderRadius: G.r24, boxShadow: G.shadowMd, border: `1px solid ${G.border}`, overflow: "hidden" }}>
      <div style={{ background: `linear-gradient(135deg, ${G.green} 0%, ${G.greenMid} 100%)`, padding: "18px 20px 16px", position: "relative", overflow: "hidden" }}>
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "repeating-conic-gradient(rgba(255,255,255,0.04) 0% 25%, transparent 0% 50%)", backgroundSize: "24px 24px", pointerEvents: "none" }} />
        <div className="relative flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span style={{ fontFamily: G.inter, fontWeight: 700, fontSize: 11, lineHeight: "15px", color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Daily Blundr</span>
            <h3 style={{ fontFamily: G.inter, fontWeight: 800, fontSize: 20, lineHeight: "26px", color: "#fff" }}>Today&apos;s smart review</h3>
            <p style={{ fontFamily: G.inter, fontWeight: 400, fontSize: 13, lineHeight: "18px", color: "rgba(255,255,255,0.75)", marginTop: 2 }}>Tempo picked the best training for today.</p>
          </div>
          <div style={{ marginLeft: 12, flexShrink: 0 }}><TempoAvatar size={44} /></div>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-5">
        <StatsStrip stats={stats} />
        <button onClick={onStart} className="w-full flex items-center justify-center gap-2" style={{ background: G.green, borderRadius: G.r16, height: 50, boxShadow: G.shadowHero }}>
          <span style={{ fontFamily: G.inter, fontWeight: 700, fontSize: 15, color: "#fff", letterSpacing: "0.01em" }}>Start Daily Blundr</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d={svgPaths.p5646280} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

interface ReviewItem { opening: string; note: string; timing: string; timingUrgent: boolean; icon: string; }

function ReviewQueuePreviewCard({ item, index }: { item: ReviewItem; index: number }) {
  const bgColors = [G.greenBg, "rgba(230,240,235,0.6)", "rgba(234,231,225,0.7)"];
  return (
    <Link href="/review" className="flex items-center gap-3 w-full" style={{ background: G.card, borderRadius: G.r16, padding: "12px 14px", boxShadow: G.shadow, border: `1px solid ${G.border}` }}>
      <div className="flex items-center justify-center shrink-0" style={{ width: 36, height: 36, borderRadius: 10, background: bgColors[index] ?? G.greenBg }}>
        <span style={{ fontFamily: G.inter, fontWeight: 700, fontSize: 15, color: G.green }}>{item.icon}</span>
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span style={{ fontFamily: G.inter, fontWeight: 700, fontSize: 13, lineHeight: "18px", color: G.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.opening}</span>
        <span style={{ fontFamily: G.inter, fontWeight: 400, fontSize: 11, lineHeight: "15px", color: G.textMuted }}>{item.note}</span>
      </div>
      <span className="shrink-0 rounded-full px-2.5 py-1" style={{ fontFamily: G.inter, fontWeight: 600, fontSize: 10, lineHeight: "14px", background: item.timingUrgent ? G.goldBg : "rgba(234,231,225,0.9)", color: item.timingUrgent ? G.gold : G.textMuted, border: `1px solid ${item.timingUrgent ? G.goldBorder : G.border}`, whiteSpace: "nowrap" }}>
        {item.timing}
      </span>
    </Link>
  );
}

interface MiniGame { id: string; name: string; blurb: string; duration: string; icon: string; accent: string; accentBg: string; }

function MiniGameCard({ game }: { game: MiniGame }) {
  return (
    <Link href={`/review/minigames/${game.id}`} className="flex flex-col items-start text-left w-full" style={{ background: G.card, borderRadius: G.r16, padding: "14px 14px 12px", boxShadow: G.shadow, border: `1px solid ${G.border}` }}>
      <div className="flex items-center justify-center mb-3" style={{ width: 36, height: 36, borderRadius: 10, background: game.accentBg }}>
        <span style={{ fontSize: 18, lineHeight: 1 }}>{game.icon}</span>
      </div>
      <span style={{ fontFamily: G.inter, fontWeight: 700, fontSize: 13, lineHeight: "18px", color: G.textPrimary, marginBottom: 2 }}>{game.name}</span>
      <span style={{ fontFamily: G.inter, fontWeight: 400, fontSize: 11, lineHeight: "15px", color: G.textMuted, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden", marginBottom: 8 }}>{game.blurb}</span>
      <span className="rounded-full px-2 py-0.5" style={{ fontFamily: G.inter, fontWeight: 600, fontSize: 10, color: game.accent, background: game.accentBg }}>{game.duration}</span>
    </Link>
  );
}

const REVIEW_ITEMS: ReviewItem[] = [
  { opening: "Italian Game",      note: "Missed move from Plain View", timing: "Due today",   timingUrgent: true,  icon: "♟" },
  { opening: "Caro-Kann",         note: "Key square: e5",              timing: "Due soon",    timingUrgent: false, icon: "♞" },
  { opening: "Sicilian Defense",  note: "Tactical idea: pin",          timing: "Later today", timingUrgent: false, icon: "♝" },
];

const MINI_GAMES: MiniGame[] = [
  { id: "king_race",         name: "Recall Run",        blurb: "Replay a move you missed.",          duration: "1 min",   icon: "↩",  accent: G.green,    accentBg: G.greenBg },
  { id: "knight_gymnasium",  name: "Reply Radar",       blurb: "Pick the opening reply.",            duration: "1 min",   icon: "📡", accent: G.blue,     accentBg: G.blueBg  },
  { id: "key_square_conquest", name: "Key Square",      blurb: "Find the square that matters.",      duration: "1–2 min", icon: "⊞",  accent: G.green,    accentBg: G.greenBg },
  { id: "pawn_wars",         name: "Pawn Sort",         blurb: "Name the pawn structure.",           duration: "2 min",   icon: "♙",  accent: "#78756e",  accentBg: "rgba(234,231,225,0.9)" },
  { id: "tactic_shots",      name: "Tactical Spark",    blurb: "Spot the tactic idea.",              duration: "2 min",   icon: "⚡", accent: G.gold,     accentBg: G.goldBg  },
  { id: "imbalance_arena",   name: "Piece Imbalance",   blurb: "Choose the better side.",            duration: "2 min",   icon: "⚖",  accent: G.blue,     accentBg: G.blueBg  },
  { id: "technique_lab",     name: "Technique Trainer", blurb: "Practice a special pattern.",        duration: "2 min",   icon: "🎯", accent: G.green,    accentBg: G.greenBg },
  { id: "structure_builder", name: "Endgame Pulse",     blurb: "Solve a clean endgame idea.",        duration: "2 min",   icon: "👑", accent: G.gold,     accentBg: G.goldBg  },
];

export function Figma5303DailyTrainingScreen({ onNav }: { onNav: (s: Screen) => void }) {
  const [started, setStarted] = useState(false);
  return (
    <div className="flex flex-col w-full" style={{ background: G.bg, minHeight: "100%", fontFamily: G.inter }}>
      <div style={{ height: 48, flexShrink: 0 }} />

      {/* Page header */}
      <div className="flex items-start justify-between px-5 pt-2 pb-4">
        <div>
          <h1 style={{ fontFamily: G.inter, fontWeight: 900, fontSize: 24, lineHeight: "30px", color: G.textPrimary, letterSpacing: "-0.3px" }}>Daily Blundr</h1>
          <p style={{ fontFamily: G.inter, fontWeight: 400, fontSize: 14, lineHeight: "20px", color: G.textMuted, marginTop: 2 }}>Review what needs to stick.</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 mt-1" style={{ background: G.goldBg, border: `1px solid ${G.goldBorder}` }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1C6 1 9.5 4 9.5 7C9.5 8.93 7.93 10.5 6 10.5C4.07 10.5 2.5 8.93 2.5 7C2.5 4 6 1 6 1Z" fill={G.gold} opacity="0.85" />
          </svg>
          <span style={{ fontFamily: G.inter, fontWeight: 700, fontSize: 12, color: G.gold }}>7-day streak</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none", paddingBottom: 16 }}>
        {/* Hero */}
        <div className="px-4 mb-6">
          <DailyBlundrHeroCard onStart={() => setStarted(!started)} />
          {started && (
            <div className="mt-3 rounded-xl px-4 py-3 flex items-center gap-2" style={{ background: G.greenBg, border: `1px solid ${G.greenTrack}` }}>
              <span style={{ fontSize: 14 }}>✓</span>
              <span style={{ fontFamily: G.inter, fontWeight: 500, fontSize: 13, color: G.green }}>Training started — good luck today!</span>
            </div>
          )}
        </div>

        {/* Review queue preview */}
        <div className="px-4 mb-6">
          <div className="mb-3"><SectionHeader title="Coming up" subtitle="A preview of what Tempo may review next." action="View full queue" /></div>
          <div className="flex flex-col gap-2">
            {REVIEW_ITEMS.map((item, i) => <ReviewQueuePreviewCard key={item.opening} item={item} index={i} />)}
          </div>
        </div>

        {/* Minigames */}
        <div className="px-4">
          <div className="mb-3"><SectionHeader title="Practice games" subtitle="Short drills that sharpen the ideas behind your reviews." /></div>
          <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {MINI_GAMES.map((game) => <MiniGameCard key={game.name} game={game} />)}
          </div>
          <p className="text-center mt-5 mb-2" style={{ fontFamily: G.inter, fontWeight: 400, fontSize: 11, color: G.textLight }}>
            Tap any game to jump in — no setup needed.
          </p>
        </div>
      </div>

      <BottomNav active="train" onNav={onNav} />
    </div>
  );
}

// ─── Phone frame ──────────────────────────────────────────────────────────────

function PhoneFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p style={{ fontFamily: G.inter, fontWeight: 600, fontSize: 11, color: G.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </p>
      <div
        className="relative flex flex-col overflow-hidden"
        style={{ width: 390, height: 844, borderRadius: 44, boxShadow: "0 40px 100px rgba(28,28,26,0.22), 0 8px 24px rgba(28,28,26,0.12), inset 0 0 0 1.5px rgba(28,28,26,0.12)", background: G.bg, flexShrink: 0 }}
      >
        <div style={{ position: "absolute", width: 120, height: 34, borderRadius: 20, background: "#1c1c1a", top: 14, left: "50%", transform: "translateX(-50%)", zIndex: 50 }} />
        {children}
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Figma5303DashboardDailyReviewApp() {
  const [screen, setScreen] = useState<Screen>("home");

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-10 gap-8" style={{ background: "#e8e4dc", fontFamily: G.inter }}>

      {/* Wordmark */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <TempoAvatar size={26} />
          <span style={{ fontFamily: G.inter, fontWeight: 900, fontSize: 20, color: G.green, letterSpacing: "-0.3px" }}>Blundr</span>
        </div>
        <span style={{ fontFamily: G.inter, fontWeight: 400, fontSize: 12, color: G.textMuted }}>mobile prototype</span>
      </div>

      {/* Screen switcher (mobile/tablet) */}
      <div className="xl:hidden flex items-center gap-1 p-1 rounded-full" style={{ background: "rgba(28,28,26,0.08)" }}>
        {(["home", "train"] as Screen[]).map((s) => (
          <button
            key={s}
            onClick={() => setScreen(s)}
            className="px-4 py-2 rounded-full"
            style={{ background: screen === s ? G.green : "transparent", color: screen === s ? "#fff" : G.textMuted, fontFamily: G.inter, fontSize: 13, fontWeight: 600 }}
          >
            {s === "home" ? "Home" : "Daily Blundr"}
          </button>
        ))}
      </div>

      {/* Desktop: both frames side by side */}
      <div className="hidden xl:flex items-start gap-10">
        <PhoneFrame label="Home · Dashboard">
          <Figma5303HomeScreen onNav={setScreen} />
        </PhoneFrame>
        <PhoneFrame label="Daily Blundr · Training">
          <Figma5303DailyTrainingScreen onNav={setScreen} />
        </PhoneFrame>
      </div>

      {/* Mobile/tablet: one frame at a time */}
      <div className="xl:hidden">
        <PhoneFrame label={screen === "home" ? "Home · Dashboard" : "Daily Blundr · Training"}>
          {screen === "home"
            ? <Figma5303HomeScreen onNav={setScreen} />
            : <Figma5303DailyTrainingScreen onNav={setScreen} />
          }
        </PhoneFrame>
      </div>

    </div>
  );
}
