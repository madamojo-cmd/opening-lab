"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

export type NestedDailyRingItem = {
  ringId?: "daily_tempo" | "daily_battery" | "daily_blundr" | string;
  label: "Tempo" | "Battery" | "Blundr" | string;
  progress: number;
  goal: number;
  percent: number;
  closed: boolean;
};

type NestedDailyRingsProps = {
  rings: NestedDailyRingItem[];
  closedCount: number;
  totalCount: number;
  allClosed: boolean;
  streakDays?: number;
  className?: string;
};

export type NestedDailyRingStyle = {
  stroke: string;
  track: string;
  size: number;
  width: number;
  glowRgb: string;
  radius: number;
};

type NestedDailyRingLayout = Required<NestedDailyRingItem> &
  NestedDailyRingStyle & {
    centerX: number;
    centerY: number;
    centerCardSize: number;
    viewBoxSize: number;
    displayPercent: number;
    circumference: number;
    dashOffset: number;
    statusLabel: "Open" | "In progress" | "Complete";
  };

export const NESTED_DAILY_RING_VIEW_BOX = 180;
export const NESTED_DAILY_RING_CENTER = 90;
export const NESTED_DAILY_RING_CENTER_SIZE = 68;

const RING_STYLES_BY_ID: Record<"daily_tempo" | "daily_battery" | "daily_blundr", NestedDailyRingStyle> = {
  daily_tempo: {
    stroke: "#38b366",
    track: "#d5edd8",
    size: 184,
    width: 10,
    glowRgb: "56, 179, 102",
    radius: 78,
  },
  daily_battery: {
    stroke: "#c79a2a",
    track: "#f4e4b4",
    size: 140,
    width: 9,
    glowRgb: "199, 154, 42",
    radius: 60,
  },
  daily_blundr: {
    stroke: "#3b82f6",
    track: "#dbeafe",
    size: 112,
    width: 9,
    glowRgb: "59, 130, 246",
    radius: 42,
  },
};

const FALLBACK_RING_STYLES: NestedDailyRingStyle[] = [
  RING_STYLES_BY_ID.daily_tempo,
  RING_STYLES_BY_ID.daily_battery,
  RING_STYLES_BY_ID.daily_blundr,
];

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function clampPercent(percent: number): number {
  if (!Number.isFinite(percent)) return 0;
  return Math.max(0, Math.min(100, percent));
}

export function normalizeNestedDailyRingItems(rings: NestedDailyRingItem[]): Required<NestedDailyRingItem>[] {
  return rings.slice(0, 3).map((ring, index) => ({
    ...ring,
    ringId: ring.ringId ?? `ring-${index}`,
    progress: Math.max(0, Math.round(Number(ring.progress) || 0)),
    goal: Math.max(0, Math.round(Number(ring.goal) || 0)),
    percent: clampPercent(ring.percent),
  }));
}

export function getNestedDailyRingStyle(ring: Pick<NestedDailyRingItem, "ringId">, index: number): NestedDailyRingStyle {
  if (ring.ringId === "daily_tempo" || ring.ringId === "daily_battery" || ring.ringId === "daily_blundr") {
    return RING_STYLES_BY_ID[ring.ringId];
  }
  return FALLBACK_RING_STYLES[index] ?? FALLBACK_RING_STYLES[FALLBACK_RING_STYLES.length - 1];
}

export function getNestedDailyRingStatusLabel(ring: Pick<NestedDailyRingItem, "percent" | "closed">): "Open" | "In progress" | "Complete" {
  if (ring.closed || ring.percent >= 100) {
    return "Complete";
  }
  if (ring.percent > 0) {
    return "In progress";
  }
  return "Open";
}

export function buildNestedDailyRingLayout(rings: NestedDailyRingItem[], displayPercents?: number[]): NestedDailyRingLayout[] {
  return normalizeNestedDailyRingItems(rings).map((ring, index) => {
    const style = getNestedDailyRingStyle(ring, index);
    const displayPercent = clampPercent(displayPercents?.[index] ?? ring.percent);
    const circumference = 2 * Math.PI * style.radius;

    return {
      ...ring,
      ...style,
      centerX: NESTED_DAILY_RING_CENTER,
      centerY: NESTED_DAILY_RING_CENTER,
      centerCardSize: NESTED_DAILY_RING_CENTER_SIZE,
      viewBoxSize: NESTED_DAILY_RING_VIEW_BOX,
      displayPercent,
      circumference,
      dashOffset: circumference * (1 - displayPercent / 100),
      statusLabel: getNestedDailyRingStatusLabel(ring),
    };
  });
}

function usePrefersReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }
    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  return reducedMotion;
}

export function NestedDailyRings({ rings, closedCount, totalCount, allClosed, streakDays = 0, className }: NestedDailyRingsProps) {
  const reducedMotion = usePrefersReducedMotion();
  const normalizedRings = useMemo(() => normalizeNestedDailyRingItems(rings), [rings]);
  const ringSignature = normalizedRings.map((ring) => `${ring.ringId}:${ring.progress}:${ring.goal}:${ring.percent}:${ring.closed ? "1" : "0"}`).join("|");
  const [displayPercents, setDisplayPercents] = useState<number[]>(() => normalizedRings.map(() => 0));
  const [pulseRingIds, setPulseRingIds] = useState<Set<string>>(() => new Set());
  const [celebrateAll, setCelebrateAll] = useState(false);
  const previousClosedRef = useRef<Record<string, boolean>>({});
  const previousAllClosedRef = useRef(allClosed);
  const hasMountedRef = useRef(false);
  const pulseTimeoutRef = useRef<number | null>(null);
  const celebrateTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      setDisplayPercents(normalizedRings.map((ring) => ring.percent));
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setDisplayPercents(normalizedRings.map((ring) => ring.percent));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [ringSignature, reducedMotion, normalizedRings]);

  useEffect(() => {
    const nextClosed: Record<string, boolean> = {};
    const newlyClosed: string[] = [];
    const wasAllClosed = previousAllClosedRef.current;
    const nowAllClosed = normalizedRings.length > 0 && normalizedRings.every((ring) => ring.closed);

    for (const ring of normalizedRings) {
      const ringKey = ring.ringId ?? ring.label;
      const wasClosed = previousClosedRef.current[ringKey] ?? false;
      nextClosed[ringKey] = ring.closed;
      if (hasMountedRef.current && ring.closed && !wasClosed) {
        newlyClosed.push(ringKey);
      }
    }

    previousClosedRef.current = nextClosed;
    previousAllClosedRef.current = nowAllClosed;

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      if (reducedMotion) {
        setPulseRingIds(new Set());
        setCelebrateAll(false);
      }
      return;
    }

    if (pulseTimeoutRef.current !== null) {
      window.clearTimeout(pulseTimeoutRef.current);
      pulseTimeoutRef.current = null;
    }
    if (celebrateTimeoutRef.current !== null) {
      window.clearTimeout(celebrateTimeoutRef.current);
      celebrateTimeoutRef.current = null;
    }

    if (reducedMotion) {
      setPulseRingIds(new Set());
      setCelebrateAll(false);
      return;
    }

    if (newlyClosed.length > 0) {
      setPulseRingIds(new Set(newlyClosed));
      pulseTimeoutRef.current = window.setTimeout(() => {
        setPulseRingIds(new Set());
        pulseTimeoutRef.current = null;
      }, 1100);
    }

    if (!wasAllClosed && nowAllClosed) {
      setCelebrateAll(true);
      celebrateTimeoutRef.current = window.setTimeout(() => {
        setCelebrateAll(false);
        celebrateTimeoutRef.current = null;
      }, 1400);
    }

    return () => {
      if (pulseTimeoutRef.current !== null) {
        window.clearTimeout(pulseTimeoutRef.current);
        pulseTimeoutRef.current = null;
      }
      if (celebrateTimeoutRef.current !== null) {
        window.clearTimeout(celebrateTimeoutRef.current);
        celebrateTimeoutRef.current = null;
      }
    };
  }, [ringSignature, reducedMotion, normalizedRings]);

  const ringLayout = useMemo(() => buildNestedDailyRingLayout(normalizedRings, displayPercents), [displayPercents, normalizedRings]);
  const summaryLabel = allClosed ? "Complete" : closedCount > 0 ? "In progress" : "Open";

  return (
    <div className={className}>
      <style>{`
        @keyframes blundrDailyRingPulse {
          0% {
            transform: scale(0.98);
            filter: drop-shadow(0 0 0 rgba(var(--blundr-daily-ring-glow-rgb), 0));
          }
          45% {
            transform: scale(1.05);
            filter: drop-shadow(0 0 14px rgba(var(--blundr-daily-ring-glow-rgb), 0.34));
          }
          100% {
            transform: scale(1);
            filter: drop-shadow(0 0 8px rgba(var(--blundr-daily-ring-glow-rgb), 0.18));
          }
        }
        @keyframes blundrDailyRingCelebrate {
          0% {
            transform: scale(0.96);
          }
          42% {
            transform: scale(1.04);
          }
          100% {
            transform: scale(1);
          }
        }
        .blundr-daily-ring-motion {
          transition:
            stroke-dashoffset 700ms ease-out,
            opacity 250ms ease-out,
            filter 250ms ease-out,
            transform 250ms ease-out;
        }
        .blundr-daily-ring-pulse {
          animation: blundrDailyRingPulse 1100ms ease-out 1;
          transform-box: fill-box;
          transform-origin: center;
        }
        .blundr-daily-ring-celebrate {
          animation: blundrDailyRingCelebrate 1400ms ease-out 1;
          transform-box: fill-box;
          transform-origin: center;
        }
        .blundr-daily-ring-glow {
          filter: drop-shadow(0 0 12px rgba(var(--blundr-daily-ring-glow-rgb), 0.24));
        }
        @media (prefers-reduced-motion: reduce) {
          .blundr-daily-ring-motion,
          .blundr-daily-ring-pulse,
          .blundr-daily-ring-celebrate {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div className={classNames("relative mx-auto aspect-square w-full max-w-[240px]", celebrateAll && !reducedMotion ? "blundr-daily-ring-celebrate" : "")} role="group" aria-label={`${closedCount} of ${totalCount} daily rings closed`}>
        <svg
          className="absolute inset-0 block h-full w-full overflow-visible"
          viewBox={`0 0 ${NESTED_DAILY_RING_VIEW_BOX} ${NESTED_DAILY_RING_VIEW_BOX}`}
          aria-hidden="true"
          style={{
            "--blundr-daily-ring-glow-rgb": "59, 130, 246",
          } as CSSProperties}
        >
          {ringLayout.map((ring) => {
            const pulse = pulseRingIds.has(ring.ringId);
            return (
              <g
                key={ring.ringId}
                className={classNames(pulse && !reducedMotion ? "blundr-daily-ring-pulse" : "")}
                style={
                  {
                    "--blundr-daily-ring-glow-rgb": ring.glowRgb,
                  } as CSSProperties
                }
              >
                <circle
                  cx={NESTED_DAILY_RING_CENTER}
                  cy={NESTED_DAILY_RING_CENTER}
                  r={ring.radius}
                  fill="none"
                  stroke={ring.track}
                  strokeWidth={ring.width}
                  opacity={ring.closed ? 0.95 : 0.82}
                />
                <circle
                  cx={NESTED_DAILY_RING_CENTER}
                  cy={NESTED_DAILY_RING_CENTER}
                  r={ring.radius}
                  fill="none"
                  stroke={ring.stroke}
                  strokeLinecap="round"
                  strokeWidth={ring.width}
                  strokeDasharray={ring.circumference}
                  strokeDashoffset={ring.dashOffset}
                  transform={`rotate(-90 ${NESTED_DAILY_RING_CENTER} ${NESTED_DAILY_RING_CENTER})`}
                  className={classNames("blundr-daily-ring-motion", ring.closed ? "blundr-daily-ring-glow" : "")}
                  style={{
                    opacity: ring.closed ? 1 : 0.92,
                  }}
                />
              </g>
            );
          })}
        </svg>

        <div
          className={classNames(
            "absolute inset-0 mx-auto flex flex-col items-center justify-center rounded-full bg-[#fffdf8] text-center shadow-[0_8px_24px_rgba(28,28,26,0.08)] ring-1 ring-stone-100",
            allClosed && !reducedMotion ? "blundr-daily-ring-celebrate" : "",
          )}
          style={{
            width: NESTED_DAILY_RING_CENTER_SIZE,
            height: NESTED_DAILY_RING_CENTER_SIZE,
            boxShadow: allClosed ? "0 0 0 1px rgba(61, 186, 110, 0.12), 0 12px 30px rgba(61, 186, 110, 0.18)" : undefined,
          }}
          aria-hidden="true"
        >
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">Today</div>
          <div className="mt-1 text-[26px] font-black leading-none tracking-[-0.04em] text-stone-950">
            {closedCount}/{totalCount}
          </div>
          <div className={classNames("mt-1 text-[10px] font-semibold uppercase tracking-[0.18em]", allClosed ? "text-green-700" : closedCount > 0 ? "text-blue-700" : "text-stone-500")}>
            {summaryLabel}
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {ringLayout.map((ring) => (
          <div key={ring.ringId} className="rounded-2xl border border-stone-100 bg-white px-3 py-2 shadow-sm">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ring.stroke }} />
              <span className="min-w-0 truncate text-[11px] font-black uppercase tracking-[0.16em] text-stone-600">{ring.label}</span>
            </div>
            <div className="mt-2 flex items-end justify-between gap-2">
              <div className="min-w-0 text-[15px] font-black tracking-tight text-stone-950">
                {ring.goal > 0 ? (
                  <>
                    {ring.progress}
                    <span className="ml-0.5 text-[11px] font-semibold text-stone-400">/{ring.goal}</span>
                  </>
                ) : (
                  "Loading"
                )}
              </div>
              <div className={classNames("rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em]", ring.statusLabel === "Complete" ? "bg-green-50 text-green-700" : ring.statusLabel === "In progress" ? "bg-blue-50 text-blue-700" : "bg-stone-100 text-stone-500")}>
                {ring.statusLabel}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-stone-500">
        <span className={classNames("rounded-full px-2 py-1", allClosed ? "bg-green-50 text-green-700" : closedCount > 0 ? "bg-blue-50 text-blue-700" : "bg-stone-100 text-stone-600")}>
          {summaryLabel === "Complete" ? "Closed for today" : summaryLabel}
        </span>
        <span>{streakDays} day streak</span>
      </div>
    </div>
  );
}
