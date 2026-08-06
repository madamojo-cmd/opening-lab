export const ADAPTIVE_DAILY_CARD_CAPS = [3, 4, 5, 12] as const;
export type AdaptiveDailyCardCap = (typeof ADAPTIVE_DAILY_CARD_CAPS)[number];
export const DEFAULT_ADAPTIVE_DAILY_CARD_CAP: AdaptiveDailyCardCap = 5;

export function resolveAdaptiveDailyCardCap(
  requested: number | null | undefined,
): AdaptiveDailyCardCap | null {
  if (requested == null) return null;
  return (ADAPTIVE_DAILY_CARD_CAPS as readonly number[]).includes(requested)
    ? (requested as AdaptiveDailyCardCap)
    : null;
}

/**
 * The entitlement resolver is the only caller permitted to choose a non-default
 * Daily size.  A missing/future entitlement intentionally resolves to the
 * reviewed launch default rather than a client-selected size.
 */
export function resolveServerDailyTaskCount(input: {
  entitlementCap?: number | null;
}): AdaptiveDailyCardCap {
  return (
    resolveAdaptiveDailyCardCap(input.entitlementCap) ??
    DEFAULT_ADAPTIVE_DAILY_CARD_CAP
  );
}
