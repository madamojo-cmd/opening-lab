export const BLUNDR_DAILY_RING_REFRESH_EVENT = "blundr-daily-ring-refresh";

export type DailyRingRefreshDetail = {
  userId: string;
  localDate: string;
  source: string;
  activityEventId?: string | null;
  ringId?: string | null;
  ringClosedThisAction?: boolean;
  allRingsClosedThisAction?: boolean;
  updatedAt: string;
};

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

export function notifyDailyRingRefresh(detail: DailyRingRefreshDetail): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent<DailyRingRefreshDetail>(BLUNDR_DAILY_RING_REFRESH_EVENT, {
        detail: {
          userId: normalizeText(detail.userId),
          localDate: normalizeText(detail.localDate),
          source: normalizeText(detail.source),
          activityEventId: normalizeText(detail.activityEventId) || null,
          ringId: normalizeText(detail.ringId) || null,
          ringClosedThisAction: Boolean(detail.ringClosedThisAction),
          allRingsClosedThisAction: Boolean(detail.allRingsClosedThisAction),
          updatedAt: normalizeText(detail.updatedAt),
        },
      }),
    );
  } catch {
    // Refresh notifications are optional.
  }
}
