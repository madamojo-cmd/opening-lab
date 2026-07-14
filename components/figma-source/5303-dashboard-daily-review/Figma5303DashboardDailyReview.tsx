import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BlundrBottomNav } from "@/components/navigation/BlundrBottomNav";
import { ProfileSettingsIcon } from "@/components/navigation/ProfileSettingsIcon";
import { HomeCurrentOpeningsCard } from "@/components/home/HomeCurrentOpeningsCard";
import { BlundrStateCard } from "@/components/blundr/ui";
import { getLocalAccountCurrentUserId } from "@/lib/blundr/accounts/localAccountStorage";
import { loadDailyRingSnapshot } from "@/lib/blundr/daily-rings/dailyRingService";
import { reconcileDailyBlundrRingCompletionForToday } from "@/lib/blundr/daily-rings/dailyRingBlundrReconciliation";
import { BLUNDR_DAILY_RING_REFRESH_EVENT } from "@/lib/blundr/daily-rings/dailyRingRefreshSignal";
import type { DailyRingSnapshot } from "@/lib/blundr/daily-rings/dailyRingTypes";
import { loadRepertoireProgress } from "@/lib/blundr/repertoire/repertoireProgressService";
import type { RepertoireProgress } from "@/lib/blundr/repertoire/repertoireTypes";
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
  return (
    <div
      className="rounded-[24px] shrink-0 w-full overflow-hidden"
      style={{ background: G.card, boxShadow: G.shadowCard }}
    >
      <div className="flex flex-col items-start p-5">
        <p
          style={{
            fontFamily: G.inter, fontWeight: 700, fontSize: 11,
            lineHeight: "16.5px", color: G.textMuted,
            letterSpacing: "1.1px", textTransform: "uppercase",
          }}
        >
          Today&apos;s training
        </p>
        <div className="pt-1">
          <p style={{ fontFamily: G.inter, fontWeight: 700, fontSize: 20, lineHeight: "27.5px", color: G.textPrimary }}>
            Close your daily rings
          </p>
        </div>
        <div className="pt-1">
          <p style={{ fontFamily: G.inter, fontWeight: 400, fontSize: 14, lineHeight: "20px", color: G.textMuted }}>
            {`Close ${Math.max(0, totalCount - closedCount)} more ring${Math.max(0, totalCount - closedCount) === 1 ? "" : "s"} to keep your streak alive.`}
          </p>
        </div>

        {/* Rings widget */}
        <div className="flex w-full flex-col items-center gap-4 pt-4 pb-1">
          <div className="rounded-[24px] bg-[#fbfcf7] px-4 py-4 ring-1 ring-stone-100">
            <NestedDailyRings
              className="w-full max-w-[240px]"
              rings={rings}
              closedCount={closedCount}
              totalCount={totalCount}
              allClosed={closedCount >= totalCount}
              streakDays={streakDays ?? 0}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="pt-5 w-full">
          <Link href="/train" className="flex gap-2 items-center justify-center w-full rounded-2xl" style={{ background: G.green, height: 48 }}>
            <p style={{ fontFamily: G.inter, fontWeight: 700, fontSize: 14, lineHeight: "20px", color: "#fff" }}>
              Start training
            </p>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d={svgPaths.p5646280} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

function HomeProgressStrip({ rings }: { rings: HomeDailyRingItem[] }) {
  const ringItems = rings.map((ring, index) => {
    const palette = [
      { trackColor: G.greenTrack, fillColor: G.greenLight },
      { trackColor: "#F5E8C0", fillColor: G.gold },
      { trackColor: "#CCDDF5", fillColor: G.blue },
    ][index] ?? { trackColor: G.greenTrack, fillColor: G.greenLight };
    return { ...ring, ...palette };
  });

  return (
    <div className="grid w-full grid-cols-3 gap-2">
      {ringItems.map((item) => (
        <div
          key={item.label}
          className="flex min-w-0 flex-col gap-2 rounded-2xl bg-white p-3"
          style={{ boxShadow: G.shadowCard }}
        >
          <div className="flex items-start justify-between gap-2">
            <p style={{ fontFamily: G.inter, fontWeight: 700, fontSize: 11, lineHeight: "16.5px", color: G.textMuted, letterSpacing: "0.8px", textTransform: "uppercase" }}>
              {item.label}
            </p>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <clipPath id={`clip-h-${item.label}`}><rect fill="white" height="10" width="10" /></clipPath>
              <g clipPath={`url(#clip-h-${item.label})`}>
                <path d={svgPaths.p225f5e00} stroke={G.textMuted} strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.833333" />
                <path d={svgPaths.p9062d00} stroke={G.textMuted} strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.833333" />
              </g>
            </svg>
          </div>
          <div className="rounded-full w-full shrink-0 overflow-clip" style={{ height: 4, background: item.trackColor }}>
            <div
              className="h-full rounded-full shrink-0 transition-all duration-500 ease-out"
              style={{ width: item.goal > 0 ? `${item.percent}%` : 0, background: item.fillColor }}
              aria-hidden
            />
          </div>
          <div className="flex items-end justify-between gap-2">
            <div style={{ fontFamily: G.inter, fontWeight: 800, fontSize: 15, lineHeight: "18px", color: G.textPrimary }}>
              {item.progress}
              <span style={{ fontWeight: 500, fontSize: 11, lineHeight: "16px", color: G.textMuted }}>
                /{item.goal}
              </span>
            </div>
            <div style={{ fontFamily: G.inter, fontWeight: 700, fontSize: 10, lineHeight: "14px", color: item.closed ? G.green : item.percent > 0 ? G.blue : G.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {item.closed ? "Complete" : item.percent > 0 ? "In progress" : "Open"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function HomeTempoBanner({ remainingRingCount }: { remainingRingCount: number }) {
  const message = remainingRingCount === 0
    ? "All rings closed. Your streak is closed for today."
    : `Close ${remainingRingCount} more ring${remainingRingCount === 1 ? "" : "s"} to keep your streak alive.`;
  return (
    <div className="rounded-2xl shrink-0 w-full" style={{ background: G.greenBg }}>
      <div className="flex items-center gap-3 px-4 py-3">
        <p style={{ fontFamily: G.inter, fontSize: 20, lineHeight: "28px", color: G.textPrimary, flexShrink: 0 }}>♟</p>
        <p style={{ fontFamily: G.inter, fontWeight: 500, fontSize: 14, lineHeight: "19.25px", color: G.green }}>
          {message}
        </p>
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

  return (
    <div className="grid w-full gap-3 sm:grid-cols-2">
      <div className="rounded-[24px] bg-white p-4" style={{ boxShadow: G.shadowCard }}>
        <div className="flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d={svgPaths.p1136b300} stroke={G.gold} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.08333" />
          </svg>
          <p style={{ fontFamily: G.inter, fontWeight: 700, fontSize: 11, lineHeight: "16.5px", color: G.textMuted, letterSpacing: "1.1px", textTransform: "uppercase" }}>
            Streak
          </p>
        </div>
        <div className="mt-3 flex items-end justify-between gap-3">
          <p style={{ fontFamily: G.inter, fontWeight: 800, fontSize: 30, lineHeight: "30px", color: G.textPrimary }}>{streakValue}</p>
          <p style={{ fontFamily: G.inter, fontWeight: 600, fontSize: 12, lineHeight: "16.5px", color: G.textMuted }}>
            days in a row
          </p>
        </div>
        <div className="mt-3 grid gap-2 border-t border-stone-100 pt-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p style={{ fontFamily: G.inter, fontWeight: 600, fontSize: 10, lineHeight: "15px", color: G.textMuted, letterSpacing: "0.25px", textTransform: "uppercase" }}>Best</p>
              <p style={{ fontFamily: G.inter, fontWeight: 700, fontSize: 14, lineHeight: "20px", color: G.textPrimary }}>{bestValue}</p>
            </div>
            <div className="text-right">
              <p style={{ fontFamily: G.inter, fontWeight: 600, fontSize: 10, lineHeight: "15px", color: G.textMuted, letterSpacing: "0.25px", textTransform: "uppercase" }}>Closed days</p>
              <p style={{ fontFamily: G.inter, fontWeight: 700, fontSize: 14, lineHeight: "20px", color: G.textPrimary }}>{allRingValue}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] bg-white p-4" style={{ boxShadow: G.shadowCard }}>
        <div className="flex items-center gap-1.5">
          <p style={{ fontFamily: G.inter, fontWeight: 400, fontSize: 13, lineHeight: "19.5px", color: G.gold }}>◆</p>
          <p style={{ fontFamily: G.inter, fontWeight: 700, fontSize: 11, lineHeight: "16.5px", color: G.textMuted, letterSpacing: "1.1px", textTransform: "uppercase" }}>
            Rep. Points
          </p>
        </div>
        <div className="mt-3 flex items-end justify-between gap-3">
          <p style={{ fontFamily: G.inter, fontWeight: 800, fontSize: 30, lineHeight: "30px", color: G.textPrimary }}>{String(availablePoints)}</p>
          <p style={{ fontFamily: G.inter, fontWeight: 600, fontSize: 12, lineHeight: "16.5px", color: G.textMuted }}>
            {`${nextUnlockProgressPct}% to next unlock`}
          </p>
        </div>
        <div className="mt-3">
          <div className="rounded-full w-full overflow-clip" style={{ height: 6, background: "#eae7e1" }}>
            <div className="rounded-full" style={{ width: `${nextUnlockProgressPct}%`, height: 6, background: G.gold }} />
          </div>
        </div>
        <div className="mt-2">
          <p style={{ fontFamily: G.inter, fontWeight: 600, fontSize: 11, lineHeight: "16.5px", color: G.green }}>{closedRingsValue}</p>
        </div>
      </div>
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
      try {
        await reconcileDailyBlundrRingCompletionForToday({ userId });
      } catch {
        // Keep local progress visible even if reconciliation fails.
      }
      if (cancelled) return;
      setDailyRingSnapshot(loadDailyRingSnapshot({ userId }));
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
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col overflow-x-hidden" style={{ background: G.bg, fontFamily: G.inter }}>
      {/* Status bar spacer */}
      <div style={{ height: 48, flexShrink: 0 }} />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 px-4">
        <div className="flex items-center gap-2">
          <p style={{ fontFamily: G.inter, fontWeight: 900, fontSize: 20, lineHeight: "28px", color: G.green, letterSpacing: "-0.5px" }}>
            Blundr
          </p>
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full"
            style={{ background: G.greenBg }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d={svgPaths.p659a0} stroke={G.gold} strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.916667" />
            </svg>
            <p style={{ fontFamily: G.inter, fontWeight: 700, fontSize: 11, lineHeight: "16.5px", color: G.green, whiteSpace: "nowrap" }}>
              {streakLabel}
            </p>
          </div>
        </div>
        <ProfileSettingsIcon />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: "none" }}>
        <div className="flex flex-col items-start gap-4 px-4 pb-[calc(env(safe-area-inset-bottom)+8rem)]">
          <HomeTrainingCard rings={dailyRingItems} streakDays={currentStreakDays} />
          <HomeProgressStrip rings={dailyRingItems} />
          <HomeTempoBanner remainingRingCount={remainingRingCount} />
          <Link href="/daily" className="flex w-full items-center justify-between rounded-[24px] bg-white px-4 py-3" style={{ boxShadow: G.shadowCard }}>
            <div className="min-w-0">
              <p style={{ fontFamily: G.inter, fontWeight: 700, fontSize: 11, lineHeight: "16.5px", color: G.textMuted, letterSpacing: "1.1px", textTransform: "uppercase" }}>
                Daily Blundr
              </p>
              <p style={{ fontFamily: G.inter, fontWeight: 700, fontSize: 16, lineHeight: "22px", color: G.textPrimary, marginTop: 2 }}>
                Complete Daily Blundr
              </p>
            </div>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d={svgPaths.p5646280} stroke={G.green} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </Link>
          {currentProgress ? (
            <HomeCurrentOpeningsCard progress={currentProgress} onPlayOpening={handlePlayOpening} />
          ) : (
            <BlundrStateCard
              kind="loading"
              eyebrow="Openings"
              title="Loading current openings."
              copy="Blundr is checking which openings are ready to train."
            />
          )}
          <HomeStatsRow
            streakDays={currentStreakDays}
            longestStreakDays={longestStreakDays}
            allRingDays={totalAllRingDays}
            availablePoints={currentProgress?.availablePoints ?? 0}
            nextUnlockProgressPct={currentProgress?.nextUnlockProgressPct ?? 0}
            closedRingCount={closedRingCount}
          />
          <div style={{ height: 8 }} />
        </div>
      </div>

      <BottomNav active="home" onNav={onNav} />
    </div>
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
